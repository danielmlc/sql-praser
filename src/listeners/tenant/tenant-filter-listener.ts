import { BaseListener } from '../base/base-listener';
import { ListenerContext, TenantListenerConfig } from '../../core/types';
import { ParseTreeWalker, Token } from 'antlr4ng';

// 动态导入生成的 ANTLR4 Listener（避免编译时依赖）
const path = require('path');
const fs = require('fs');

let MySqlParserListener: any;

try {
  // 尝试从 lib 目录加载
  const libPath = path.join(__dirname, '../../../lib/generated/mysql');
  const libListenerPath = path.join(libPath, 'MySqlParserListener.js');
  if (fs.existsSync(libListenerPath)) {
    const libModule = require(libListenerPath);
    MySqlParserListener = libModule.MySqlParserListener || libModule.default?.MySqlParserListener;
  }

  // 如果 lib 中没有，尝试从 generated 目录加载（用于开发环境）
  if (!MySqlParserListener) {
    const genPath = path.join(__dirname, '../../../generated/mysql');
    const genListenerPath = path.join(genPath, 'MySqlParserListener');
    if (fs.existsSync(genListenerPath + '.ts')) {
      const genModule = require(genListenerPath);
      MySqlParserListener = genModule.MySqlParserListener || genModule.default?.MySqlParserListener;
    }
  }

  if (!MySqlParserListener) {
    throw new Error('MySqlParserListener not found');
  }
} catch (e) {
  // 占位符
  MySqlParserListener = class {
    enterEveryRule = () => {};
    exitEveryRule = () => {};
    visitTerminal = () => {};
    visitErrorNode = () => {};
  };
}

/**
 * 租户条件 Listener
 * 负责在 SQL 中添加租户过滤条件
 */
export class TenantFilterListener extends BaseListener<TenantListenerConfig> {
  protected readonly name = 'TenantFilterListener';
  private cteTableNames = new Set<string>();

  constructor(config: TenantListenerConfig) {
    super(config);
  }

  /**
   * 获取优先级
   * 租户过滤应该优先级较高（数字小），在库名改写之后执行
   */
  getPriority(): number {
    return 100;
  }

  /**
   * 处理 SQL（使用 ANTLR4 Listener 模式）
   */
  process(ast: any, context: ListenerContext): any {
    const tenantInfo = context.sharedState.get('tenantInfo');
    if (!tenantInfo?.tenant) {
      return; // 没有租户信息，不处理
    }

    const { rewriter, tokenStream, parseTree } = context;
    const tenantId = tenantInfo.tenant;
    const tenantField = this.config.tenantField;

    // 创建 ANTLR4 Listener 来遍历语法树
    const antlrListener = new TenantConditionListener(
      rewriter,
      tokenStream,
      tenantId,
      tenantField,
      this.config.targetDatabases,
      this.cteTableNames
    );

    // 显式将方法赋值给实例，覆盖基类的 undefined 属性
    (antlrListener as any).enterCteName = TenantConditionListener.prototype.enterCteName.bind(antlrListener);
    (antlrListener as any).enterInsertStatement = TenantConditionListener.prototype.enterInsertStatement.bind(antlrListener);
    (antlrListener as any).enterQuerySpecification = TenantConditionListener.prototype.enterQuerySpecification.bind(antlrListener);
    (antlrListener as any).enterUpdateStatement = TenantConditionListener.prototype.enterUpdateStatement.bind(antlrListener);
    (antlrListener as any).enterDeleteStatement = TenantConditionListener.prototype.enterDeleteStatement.bind(antlrListener);

    // 使用 ParseTreeWalker 遍历语法树
    ParseTreeWalker.DEFAULT.walk(antlrListener as any, parseTree);
  }

  /**
   * 清理 CTE 表名集合
   */
  protected onCleanup(): void {
    this.cteTableNames.clear();
  }
}

/**
 * ANTLR4 Listener 实现
 * 用于遍历 MySQL 语法树并注入租户条件
 */
class TenantConditionListener extends MySqlParserListener {
  constructor(
    private rewriter: any,
    private tokenStream: any,
    private tenantId: string,
    private tenantField: string,
    private targetDatabases: any,
    private cteTableNames: Set<string>
  ) {
    super();
  }

  /**
   * 收集 CTE 表名
   */
  enterCteName(ctx: any): void {
    const tableName = ctx.getText();
    if (tableName) {
      this.cteTableNames.add(tableName);
    }
  }

  /**
   * 处理 INSERT 语句
   */
  enterInsertStatement(ctx: any): void {
    const tableName = ctx.tableName();
    if (!tableName) {
      return;
    }

    const fullTableName = this.extractTableName(tableName);
    if (!this.shouldInjectTenant(fullTableName)) {
      return;
    }

    // 检查是否是 INSERT ... SET 语法
    if (ctx.SET()) {
      this.handleInsertSet(ctx);
      return;
    }

    // 处理 INSERT INTO ... (columns) VALUES ... 语法
    const columnsList = ctx.fullColumnNameList();
    const insertValue = ctx.insertStatementValue();

    if (!columnsList || !insertValue) {
      return;
    }

    // 在列列表的开头插入租户字段
    const leftBracket = ctx.LR_BRACKET(0);
    if (leftBracket) {
      const bracketToken = leftBracket.symbol;
      if (bracketToken) {
        this.rewriter.insertAfter(bracketToken.tokenIndex, ` ${this.tenantField},`);
      }
    }

    // 在每个 VALUES 的左括号后插入租户值
    const valueLists = insertValue.expressionsWithDefaults();
    for (const valueList of valueLists) {
      if (valueList && valueList.start) {
        const valueStartToken = valueList.start;
        const leftParenIndex = valueStartToken.tokenIndex - 1;
        const leftParenToken = this.tokenStream.get(leftParenIndex);
        if (leftParenToken && leftParenToken.text === '(') {
          this.rewriter.insertAfter(leftParenIndex, ` '${this.tenantId}',`);
        }
      }
    }
  }

  /**
   * 处理 INSERT ... SET 语法
   */
  private handleInsertSet(ctx: any): void {
    const elements = ctx.updatedElement();
    if (elements && elements.length > 0) {
      const lastElement = elements[elements.length - 1];
      if (lastElement && lastElement.stop) {
        this.rewriter.insertAfter(lastElement.stop, `, ${this.tenantField} = '${this.tenantId}'`);
      }
    }
  }

  /**
   * 处理 SELECT 语句
   */
  enterQuerySpecification(ctx: any): void {
    // 收集表信息
    const tableInfo = this.collectTablesFromQuery(ctx);
    if (tableInfo.tables.length === 0) {
      return;
    }

    // 构建租户条件
    const conditions: string[] = [];
    for (const table of tableInfo.tables) {
      if (this.shouldInjectTenant(table.fullName)) {
        const alias = table.alias || table.simpleName;
        conditions.push(`${alias}.${this.tenantField} = '${this.tenantId}'`);
      }
    }

    if (conditions.length === 0) {
      return;
    }

    const tenantCondition = conditions.join(' AND ');

    // 检查 FROM 子句中的 WHERE
    const fromClause = ctx.fromClause();
    if (!fromClause) {
      return;
    }

    // 检查是否有 WHERE 子句
    const hasWhere = fromClause.WHERE() !== null;

    if (hasWhere) {
      const expression = fromClause.expression();
      if (expression && expression.stop) {
        this.rewriter.insertAfter(expression.stop.tokenIndex, ` AND ${tenantCondition}`);
      }
    } else {
      if (fromClause.stop) {
        this.rewriter.insertAfter(fromClause.stop.tokenIndex, ` WHERE ${tenantCondition}`);
      }
    }
  }

  /**
   * 处理 UPDATE 语句
   */
  enterUpdateStatement(ctx: any): void {
    const singleUpdate = ctx.singleUpdateStatement();
    if (!singleUpdate) {
      return;
    }

    // 从 tableSources 中提取表名
    const tableSources = singleUpdate.tableSources();
    if (!tableSources) {
      return;
    }

    const tables = this.extractTableNamesFromTableSources(tableSources);
    if (tables.length === 0) {
      return;
    }

    const table = tables[0];
    if (!this.shouldInjectTenant(table.fullName)) {
      return;
    }

    const tenantCondition = `${table.simpleName}.${this.tenantField} = '${this.tenantId}'`;

    const hasWhere = singleUpdate.WHERE() !== null;

    if (hasWhere) {
      const expression = singleUpdate.expression();
      if (expression && expression.stop) {
        this.rewriter.insertAfter(expression.stop.tokenIndex, ` AND ${tenantCondition}`);
      }
    } else {
      if (singleUpdate.stop) {
        this.rewriter.insertAfter(singleUpdate.stop.tokenIndex, ` WHERE ${tenantCondition}`);
      }
    }
  }

  /**
   * 处理 DELETE 语句
   */
  enterDeleteStatement(ctx: any): void {
    const singleDelete = ctx.singleDeleteStatement();
    if (!singleDelete) {
      return;
    }

    const tableName = singleDelete.tableName();
    if (!tableName) {
      return;
    }

    const fullName = this.extractTableName(tableName);
    if (!this.shouldInjectTenant(fullName)) {
      return;
    }

    const simpleName = this.extractSimpleName(tableName);
    const tenantCondition = `${simpleName}.${this.tenantField} = '${this.tenantId}'`;

    const hasWhere = singleDelete.WHERE() !== null;

    if (hasWhere) {
      const expression = singleDelete.expression();
      if (expression && expression.stop) {
        this.rewriter.insertAfter(expression.stop.tokenIndex, ` AND ${tenantCondition}`);
      }
    } else {
      if (singleDelete.stop) {
        this.rewriter.insertAfter(singleDelete.stop.tokenIndex, ` WHERE ${tenantCondition}`);
      }
    }
  }

  /**
   * 收集查询中的表信息
   */
  private collectTablesFromQuery(ctx: any): { tables: Array<{ fullName: string; simpleName: string; alias?: string }> } {
    const tables: Array<{ fullName: string; simpleName: string; alias?: string }> = [];

    const fromClause = ctx.fromClause();
    if (fromClause) {
      const fromTables = this.collectTablesFromFromClause(fromClause);
      tables.push(...fromTables);
    }

    return { tables };
  }

  /**
   * 从 FROM 子句收集表
   */
  private collectTablesFromFromClause(fromClause: any): Array<{ fullName: string; simpleName: string; alias?: string }> {
    const tables: Array<{ fullName: string; simpleName: string; alias?: string }> = [];

    const tableSources = fromClause.tableSources?.();
    if (!tableSources) {
      return tables;
    }

    for (let i = 0; i < tableSources.getChildCount(); i++) {
      const tableSourceBase = tableSources.getChild(i);
      if (!tableSourceBase) {
        continue;
      }

      // 遍历子节点
      for (let j = 0; j < (tableSourceBase.getChildCount?.() || 0); j++) {
        const child = tableSourceBase.getChild(j);
        if (!child) {
          continue;
        }

        // 检查是否是 AtomTableItemContext
        if (child.tableName) {
          const tableNameCtx = child.tableName();
          if (tableNameCtx) {
            const fullName = this.extractTableName(tableNameCtx);
            const simpleName = this.extractSimpleName(tableNameCtx);
            const tableInfo: { fullName: string; simpleName: string; alias?: string } = { fullName, simpleName };

            // 查找别名
            if (child._alias) {
              tableInfo.alias = child._alias.getText();
            } else if (child.alias) {
              tableInfo.alias = child.alias.getText();
            }

            tables.push(tableInfo);
          }
        }

        // 检查是否是 JOIN 上下文
        const childName = child.constructor?.name || '';
        if (childName.includes('Join')) {
          const joinedTables = this.collectTablesFromJoinContext(child);
          tables.push(...joinedTables);
        }
      }
    }

    return tables;
  }

  /**
   * 从 JOIN 上下文收集表
   */
  private collectTablesFromJoinContext(joinCtx: any): Array<{ fullName: string; simpleName: string; alias?: string }> {
    const tables: Array<{ fullName: string; simpleName: string; alias?: string }> = [];

    for (let i = 0; i < (joinCtx.getChildCount?.() || 0); i++) {
      const child = joinCtx.getChild(i);
      if (!child) {
        continue;
      }

      if (child.tableName) {
        const tableNameCtx = child.tableName();
        if (tableNameCtx) {
          const fullName = this.extractTableName(tableNameCtx);
          const simpleName = this.extractSimpleName(tableNameCtx);
          const tableInfo: { fullName: string; simpleName: string; alias?: string } = { fullName, simpleName };

          if (child._alias) {
            tableInfo.alias = child._alias.getText();
          } else if (child.alias) {
            tableInfo.alias = child.alias.getText();
          } else if (child.uid) {
            const uid = child.uid();
            if (uid) {
              tableInfo.alias = uid.getText();
            }
          }

          tables.push(tableInfo);
        }
      }

      // 递归处理嵌套的 JOIN
      const childName = child.constructor?.name || '';
      if (childName.includes('Join')) {
        const nestedTables = this.collectTablesFromJoinContext(child);
        tables.push(...nestedTables);
      }
    }

    return tables;
  }

  /**
   * 从 TableSources 提取表名列表
   */
  private extractTableNamesFromTableSources(tableSources: any): Array<{ fullName: string; simpleName: string }> {
    const tables: Array<{ fullName: string; simpleName: string }> = [];

    for (let i = 0; i < tableSources.getChildCount(); i++) {
      const tableSourceBase = tableSources.getChild(i);
      if (!tableSourceBase) {
        continue;
      }

      for (let j = 0; j < (tableSourceBase.getChildCount?.() || 0); j++) {
        const child = tableSourceBase.getChild(j);
        if (!child) {
          continue;
        }

        const childText = child.getText ? child.getText() : '';
        if (childText.includes('.') || /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(childText)) {
          const fullName = childText;
          const simpleName = childText.includes('.') ? childText.split('.').pop()! : childText;
          tables.push({ fullName, simpleName });
          break;
        }
      }
    }

    return tables;
  }

  /**
   * 提取简单表名（不带数据库前缀）
   */
  private extractSimpleName(tableNameCtx: any): string {
    if (!tableNameCtx) {
      return '';
    }

    // 直接使用 getText() 获取表名
    const text = tableNameCtx.getText() || '';
    if (text.includes('.')) {
      return text.split('.').pop() || text;
    }
    return text;
  }

  /**
   * 从 tableName 上下文中提取完整的表名
   */
  private extractTableName(tableNameCtx: any): string {
    if (!tableNameCtx) {
      return '';
    }

    // 直接使用 getText() 获取表名
    return tableNameCtx.getText() || '';
  }

  /**
   * 判断表是否需要注入租户字段
   */
  private shouldInjectTenant(fullTableName: string): boolean {
    if (!fullTableName) {
      return false;
    }

    // 检查是否是 CTE 表
    if (this.cteTableNames.has(fullTableName)) {
      return false;
    }

    // 检查完整库名匹配
    if (this.targetDatabases.fullNames?.includes(fullTableName)) {
      return true;
    }

    // 检查前缀匹配
    if (this.targetDatabases.prefixes) {
      for (const prefix of this.targetDatabases.prefixes) {
        let databasePart = fullTableName;
        if (fullTableName.includes('.')) {
          databasePart = fullTableName.split('.')[0];
        }

        if (databasePart.startsWith(prefix) || databasePart === prefix) {
          return true;
        }
      }
    }

    return false;
  }
}
