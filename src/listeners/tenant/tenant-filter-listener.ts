import { BaseListener } from '../base/base-listener';
import { ListenerContext, TenantListenerConfig } from '../../core/types';
import {
  TableInfo,
  MySqlParserListener,
  InsertStatementContext,
  UpdateStatementContext,
  DeleteStatementContext,
  QuerySpecificationContext,
  CteNameContext,
} from '../../core/antlr4-types';
import { ParseTreeWalker } from 'antlr4ng';
import { TableInfoCollector } from '../../utils/table-info-collector';
import { ListenerBinder } from '../../utils/listener-binder';
import { Antlr4Loader } from '../../utils/antlr4-loader';

// 动态导入生成的 ANTLR4 Listener（避免编译时依赖）
const { module: MySqlParserListener, success: listenerLoaded } = Antlr4Loader.loadModule(
  'MySqlParserListener',
  'MySqlParserListener',
  {
    throwOnError: true,
    callerPath: __dirname,
  }
);

if (!listenerLoaded) {
  throw new Error('MySqlParserListener failed to load. Please run "pnpm run generate:parser" first.');
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

    // 使用 ListenerBinder 自动绑定方法
    ListenerBinder.bindAllEnterExit(antlrListener);

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
class TenantConditionListener extends (MySqlParserListener as any) {
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
  enterCteName(ctx: CteNameContext): void {
    const tableName = ctx.getText();
    if (tableName) {
      this.cteTableNames.add(tableName);
    }
  }

  /**
   * 处理 INSERT 语句
   */
  enterInsertStatement(ctx: InsertStatementContext): void {
    const tableName = ctx.tableName?.();
    if (!tableName) {
      return;
    }

    const fullTableName = tableName.getText();
    if (!this.shouldInjectTenant(fullTableName)) {
      return;
    }

    // 检查是否是 INSERT ... SET 语法
    if (ctx.SET?.()) {
      this.handleInsertSet(ctx);
      return;
    }

    // 处理 INSERT INTO ... (columns) VALUES ... 语法
    const columnsList = ctx.fullColumnNameList?.();
    const insertValue = ctx.insertStatementValue?.();

    if (!columnsList || !insertValue) {
      return;
    }

    // 在列列表的开头插入租户字段
    const leftBracket = ctx.LR_BRACKET?.(0);
    if (leftBracket) {
      const bracketToken = leftBracket.symbol;
      if (bracketToken) {
        this.rewriter.insertAfter(bracketToken.tokenIndex, ` ${this.tenantField},`);
      }
    }

    // 在每个 VALUES 的左括号后插入租户值
    const valueLists = insertValue.expressionsWithDefaults?.();
    if (valueLists) {
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
  }

  /**
   * 处理 INSERT ... SET 语法
   */
  private handleInsertSet(ctx: InsertStatementContext): void {
    const elements = (ctx as any).updatedElement?.();
    if (elements && elements.length > 0) {
      const lastElement = elements[elements.length - 1];
      if (lastElement && lastElement.stop) {
        this.rewriter.insertAfter(lastElement.stop.tokenIndex, `, ${this.tenantField} = '${this.tenantId}'`);
      }
    }
  }

  /**
   * 处理 SELECT 语句
   */
  enterQuerySpecification(ctx: QuerySpecificationContext): void {
    // 使用 TableInfoCollector 收集表信息
    const fromClause = ctx.fromClause?.();
    if (!fromClause) {
      return;
    }

    const tables = TableInfoCollector.collectFromFromClause(fromClause);
    if (tables.length === 0) {
      return;
    }

    // 构建租户条件
    const conditions: string[] = [];
    for (const table of tables) {
      if (this.shouldInjectTenant(table.fullName)) {
        const alias = table.alias || table.simpleName;
        conditions.push(`${alias}.${this.tenantField} = '${this.tenantId}'`);
      }
    }

    if (conditions.length === 0) {
      return;
    }

    const tenantCondition = conditions.join(' AND ');

    // 检查是否有 WHERE 子句
    const hasWhere = fromClause.WHERE?.() !== null;

    if (hasWhere) {
      const expression = fromClause.expression?.();
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
  enterUpdateStatement(ctx: UpdateStatementContext): void {
    const singleUpdate = ctx.singleUpdateStatement?.();
    if (!singleUpdate) {
      return;
    }

    // 从 tableSources 中提取表名
    const tableSources = singleUpdate.tableSources?.();
    if (!tableSources) {
      return;
    }

    const tables = TableInfoCollector.extractFromTableSources(tableSources);
    if (tables.length === 0) {
      return;
    }

    // 收集所有需要注入租户条件的表
    const conditions: string[] = [];
    for (const table of tables) {
      if (this.shouldInjectTenant(table.fullName)) {
        const alias = table.alias || table.simpleName;
        conditions.push(`${alias}.${this.tenantField} = '${this.tenantId}'`);
      }
    }

    if (conditions.length === 0) {
      return;
    }

    const tenantCondition = conditions.join(' AND ');
    const hasWhere = singleUpdate.WHERE?.() !== null;

    if (hasWhere) {
      const expression = singleUpdate.expression?.();
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
  enterDeleteStatement(ctx: DeleteStatementContext): void {
    // 处理 singleDeleteStatement
    const singleDelete = ctx.singleDeleteStatement?.();
    if (singleDelete) {
      this.handleSingleDelete(singleDelete);
      return;
    }

    // 处理 multipleDeleteStatement (DELETE ... FROM ... JOIN ...)
    const multipleDelete = ctx.multipleDeleteStatement?.();
    if (multipleDelete) {
      this.handleMultipleDelete(multipleDelete);
    }
  }

  /**
   * 处理单表 DELETE 语句
   */
  private handleSingleDelete(singleDelete: any): void {
    const tableName = singleDelete.tableName?.();
    if (!tableName) {
      return;
    }

    const fullName = tableName.getText();
    if (!this.shouldInjectTenant(fullName)) {
      return;
    }

    const simpleName = TableInfoCollector.extractSimpleName(tableName);
    const tenantCondition = `${simpleName}.${this.tenantField} = '${this.tenantId}'`;

    const hasWhere = singleDelete.WHERE?.() !== null;

    if (hasWhere) {
      const expression = singleDelete.expression?.();
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
   * 处理多表 DELETE 语句 (DELETE ... FROM ... JOIN ...)
   */
  private handleMultipleDelete(ctx: any): void {
    const tableSources = ctx.tableSources?.();
    if (!tableSources) {
      return;
    }

    const tables = TableInfoCollector.collectFromTableSources(tableSources);
    if (tables.length === 0) {
      return;
    }

    // 收集租户条件
    const conditions: string[] = [];
    for (const table of tables) {
      if (this.shouldInjectTenant(table.fullName)) {
        const alias = table.alias || table.simpleName;
        conditions.push(`${alias}.${this.tenantField} = '${this.tenantId}'`);
      }
    }

    if (conditions.length === 0) {
      return;
    }

    const tenantCondition = conditions.join(' AND ');
    const hasWhere = ctx.WHERE?.() !== null;

    if (hasWhere) {
      const expression = ctx.expression?.();
      if (expression && expression.stop) {
        this.rewriter.insertAfter(expression.stop.tokenIndex, ` AND ${tenantCondition}`);
      }
    } else {
      if (ctx.stop) {
        this.rewriter.insertAfter(ctx.stop.tokenIndex, ` WHERE ${tenantCondition}`);
      }
    }
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
