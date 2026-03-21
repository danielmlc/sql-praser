import { AST, From, ColumnRef } from 'node-sql-parser';
import { BaseSqlProcessor } from './base-sql-processor';
import {
  DatabaseRewriteConfig,
  DatabaseRewriteResult,
  DatabaseRewriteOnlyResult,
} from './types';
import { ConfigError } from './errors';

/**
 * 数据库名改写器
 * 负责根据配置对SQL中出现的数据库名进行改写
 * 现在继承BaseSqlProcessor来复用通用功能
 */
export class DatabaseNameRewriter extends BaseSqlProcessor {
  private config: DatabaseRewriteConfig;

  constructor(config: DatabaseRewriteConfig) {
    super();
    this.validateConfig(config);
    this.config = {
      ...config,
      // 默认包装型语句配置
      wrapperStatements: {
        enabled: false, // 默认关闭，需要显式启用
        supportedTypes: [],
        validateInnerSql: true,
        ...config.wrapperStatements,
      },
    };

    // 设置默认值
    if (this.config.preserveOriginalName === undefined) {
      this.config.preserveOriginalName = true;
    }

    // console.log('DatabaseNameRewriter finalConfig:', this.config);
  }

  /**
   * 实现BaseSqlProcessor的抽象方法：获取支持的SQL类型
   */
  protected getSupportedSqlTypes(): string[] {
    return ['select', 'insert', 'replace', 'update', 'delete'];
  }

  /**
   * 实现BaseSqlProcessor的抽象方法：获取数据库类型
   */
  protected getDatabase(): string {
    return 'mysql';
  }

  /**
   * 实现BaseSqlProcessor的抽象方法：是否在遇到不支持的SQL类型时抛出异常
   */
  protected shouldThrowOnUnsupportedType(): boolean {
    return false; // 数据库改写器默认不抛出异常，只警告
  }

  /**
   * 实现BaseSqlProcessor的抽象方法：处理AST
   * 执行数据库名改写
   */
  protected processAst(ast: AST | AST[]): DatabaseRewriteResult[] {
    return this.rewriteAst(ast);
  }

  /**
   * 重写基类方法：是否支持包装型语句
   */
  protected supportWrapperStatements(): boolean {
    return this.config.wrapperStatements?.enabled ?? false;
  }

  /**
   * 重写基类方法：获取包装型语句配置
   */
  protected getWrapperStatementsConfig() {
    return this.config.wrapperStatements;
  }

  /**
   * 重写基类方法：获取支持的包装型语句类型
   */
  protected getSupportedWrapperTypes(): string[] {
    if (!this.config.wrapperStatements?.enabled) {
      return [];
    }
    return (
      this.config.wrapperStatements.supportedTypes || ['EXPLAIN', 'DESCRIBE']
    );
  }

  /**
   * 验证配置参数
   */
  private validateConfig(config: DatabaseRewriteConfig): void {
    if (!config) {
      throw new ConfigError('Database rewrite configuration cannot be empty');
    }

    if (typeof config.enabled !== 'boolean') {
      throw new ConfigError('Database rewrite enabled must be a boolean');
    }

    if (!config.enabled) {
      return; // 如果未启用，不需要验证其他参数
    }

    if (!config.dbPrefix || typeof config.dbPrefix !== 'string') {
      throw new ConfigError(
        'Database prefix (dbPrefix) must be a non-empty string',
      );
    }

    if (config.dbPrefix.trim().length === 0) {
      throw new ConfigError(
        'Database prefix cannot be empty or whitespace only',
      );
    }

    // 验证目标数据库列表
    if (config.targetDatabases && !Array.isArray(config.targetDatabases)) {
      throw new ConfigError('Target databases must be an array');
    }

    // 验证排除数据库列表
    if (config.excludeDatabases && !Array.isArray(config.excludeDatabases)) {
      throw new ConfigError('Exclude databases must be an array');
    }

    // 验证包装型语句配置
    if (config.wrapperStatements) {
      const wrapperConfig = config.wrapperStatements;

      if (typeof wrapperConfig.enabled !== 'boolean') {
        throw new ConfigError('WrapperStatements enabled must be a boolean');
      }

      if (
        wrapperConfig.enabled &&
        (!wrapperConfig.supportedTypes ||
          !Array.isArray(wrapperConfig.supportedTypes))
      ) {
        throw new ConfigError(
          'WrapperStatements supportedTypes must be an array when enabled',
        );
      }

      if (
        wrapperConfig.validateInnerSql !== undefined &&
        typeof wrapperConfig.validateInnerSql !== 'boolean'
      ) {
        throw new ConfigError(
          'WrapperStatements validateInnerSql must be a boolean',
        );
      }

      if (
        wrapperConfig.customPatterns !== undefined &&
        !Array.isArray(wrapperConfig.customPatterns)
      ) {
        throw new ConfigError(
          'WrapperStatements customPatterns must be an array',
        );
      }
    }
  }

  /**
   * 对AST进行数据库名改写
   * @param ast 解析后的AST
   * @returns 改写结果列表
   */
  rewriteAst(ast: AST | AST[]): DatabaseRewriteResult[] {
    if (!this.config.enabled) {
      return [];
    }

    const results: DatabaseRewriteResult[] = [];
    const astArray = Array.isArray(ast) ? ast : [ast];

    for (const singleAst of astArray) {
      this.processAstNode(singleAst, results);
    }

    return results;
  }

  /**
   * 处理单个AST节点
   */
  private processAstNode(ast: any, results: DatabaseRewriteResult[]): void {
    if (!ast || typeof ast !== 'object') {
      return;
    }

    // 处理FROM子句中的表引用
    if (ast.from && Array.isArray(ast.from)) {
      for (const fromItem of ast.from) {
        this.processFromItem(fromItem, results);
      }
    }

    // 处理INSERT语句中的表引用
    if (ast.table && Array.isArray(ast.table)) {
      for (const tableItem of ast.table) {
        this.processTableItem(tableItem, results);
      }
    }

    // 处理UPDATE语句中的表引用
    if (ast.table && !Array.isArray(ast.table)) {
      this.processTableItem(ast.table, results);
    }

    // 处理JOIN子句
    if (ast.from) {
      this.processJoins(ast.from, results);
    }

    // 处理子查询
    if (ast.with) {
      this.processWithClause(ast.with, results);
    }

    // 递归处理嵌套查询
    this.processNestedQueries(ast, results);
  }

  /**
   * 处理FROM子句中的表项
   */
  private processFromItem(
    fromItem: From,
    results: DatabaseRewriteResult[],
  ): void {
    if (!fromItem) return;

    // 处理不同类型的FROM项
    if ((fromItem as any).table && (fromItem as any).db) {
      // 正常情况：数据库名和表名分别解析
      const result = this.rewriteDatabaseName((fromItem as any).db);
      if (result.modified) {
        (fromItem as any).db = result.rewrittenName;
        results.push(result);
      }
    }

    // 处理JOIN和JOIN条件
    if ((fromItem as any).join) {
      // 递归处理JOIN的右表
      this.processFromItem((fromItem as any).join, results);

      // 处理JOIN条件（ON子句）
      if ((fromItem as any).on) {
        this.processJoinCondition((fromItem as any).on, results);
      }
    }
  }

  /**
   * 处理表项（INSERT/UPDATE中的表引用）
   */
  private processTableItem(
    tableItem: any,
    results: DatabaseRewriteResult[],
  ): void {
    if (!tableItem) return;

    if (tableItem.table && tableItem.db) {
      // 正常情况：数据库名和表名分别解析
      const result = this.rewriteDatabaseName(tableItem.db);
      if (result.modified) {
        tableItem.db = result.rewrittenName;
        results.push(result);
      }
    }
  }

  /**
   * 处理JOIN子句
   */
  private processJoins(
    fromItems: From[],
    results: DatabaseRewriteResult[],
  ): void {
    for (const fromItem of fromItems) {
      if ((fromItem as any).join) {
        this.processFromItem((fromItem as any).join, results);
      }
    }
  }

  /**
   * 处理WITH子句（CTE）
   */
  private processWithClause(
    withClause: any,
    results: DatabaseRewriteResult[],
  ): void {
    if (!withClause || !Array.isArray(withClause)) return;

    for (const cte of withClause) {
      if (cte.stmt) {
        // CTE的stmt包含ast属性，需要处理ast中的内容
        if (cte.stmt.ast) {
          this.processAstNode(cte.stmt.ast, results);
        } else {
          // 备用：直接处理stmt
          this.processAstNode(cte.stmt, results);
        }
      }
    }
  }

  /**
   * 处理嵌套查询
   */
  private processNestedQueries(
    ast: any,
    results: DatabaseRewriteResult[],
  ): void {
    // 处理WHERE子句中的子查询
    if (ast.where) {
      this.processWhereClause(ast.where, results);
    }

    // 处理SELECT子句中的子查询
    if (ast.columns && Array.isArray(ast.columns)) {
      for (const column of ast.columns) {
        if (column.expr && column.expr.ast) {
          this.processAstNode(column.expr.ast, results);
        }
      }
    }

    // 处理HAVING子句中的子查询
    if (ast.having) {
      this.processWhereClause(ast.having, results);
    }

    // 处理INSERT语句的SELECT部分
    if (ast.values && ast.values.type === 'select') {
      this.processAstNode(ast.values, results);
    }

    // 处理FROM子句中的子查询
    if (ast.from && Array.isArray(ast.from)) {
      for (const fromItem of ast.from) {
        if (fromItem.expr && fromItem.expr.ast) {
          this.processAstNode(fromItem.expr.ast, results);
        }
      }
    }

    // 暂时移除过于复杂的递归逻辑，避免堆栈溢出
    // this.processAllSubQueries(ast, results, new Set());
  }

  /**
   * 递归处理所有子查询
   */
  private processAllSubQueries(
    node: any,
    results: DatabaseRewriteResult[],
    visited: Set<any> = new Set(),
  ): void {
    if (!node || typeof node !== 'object' || visited.has(node)) return;
    visited.add(node);

    // 如果是子查询AST，直接处理
    if (
      node.type &&
      ['select', 'insert', 'update', 'delete'].includes(node.type)
    ) {
      this.processAstNode(node, results);
      return;
    }

    // 递归处理所有属性
    for (const key in node) {
      if (node.hasOwnProperty(key)) {
        const value = node[key];
        if (Array.isArray(value)) {
          for (const item of value) {
            this.processAllSubQueries(item, results, visited);
          }
        } else if (typeof value === 'object' && value !== null) {
          this.processAllSubQueries(value, results, visited);
        }
      }
    }
  }

  /**
   * 处理WHERE/HAVING子句
   */
  private processWhereClause(
    whereClause: any,
    results: DatabaseRewriteResult[],
  ): void {
    if (!whereClause) return;

    // 递归处理WHERE条件中的子查询
    if (whereClause.ast) {
      this.processAstNode(whereClause.ast, results);
    }

    // 处理函数类型（如EXISTS）中的子查询
    if (
      whereClause.type === 'function' &&
      whereClause.args &&
      whereClause.args.value
    ) {
      for (const arg of whereClause.args.value) {
        if (arg.ast && arg.ast.type) {
          this.processAstNode(arg.ast, results);
        }
      }
    }

    // 处理unary_expr类型（如NOT EXISTS）中的子查询
    if (whereClause.type === 'unary_expr' && whereClause.expr) {
      // 如果expr直接包含子查询AST
      if (whereClause.expr.ast && whereClause.expr.ast.type) {
        this.processAstNode(whereClause.expr.ast, results);
      }
      // 递归处理expr中的其他内容
      this.processWhereClause(whereClause.expr, results);
    }

    // 处理binary_expr类型（如IN）中的子查询
    if (whereClause.type === 'binary_expr') {
      // 处理右侧的表达式列表（如IN子查询）
      if (
        whereClause.right &&
        whereClause.right.type === 'expr_list' &&
        whereClause.right.value
      ) {
        for (const item of whereClause.right.value) {
          if (item.ast && item.ast.type) {
            this.processAstNode(item.ast, results);
          }
        }
      }
    }

    // 处理列引用中的数据库名
    this.processColumnRef(whereClause, results, new Set());

    // 处理左右操作数
    if (whereClause.left) {
      this.processWhereClause(whereClause.left, results);
    }
    if (whereClause.right) {
      this.processWhereClause(whereClause.right, results);
    }
  }

  /**
   * 处理JOIN条件（ON子句）
   */
  private processJoinCondition(
    condition: any,
    results: DatabaseRewriteResult[],
  ): void {
    if (!condition) return;

    // JOIN条件的处理逻辑与WHERE子句类似
    this.processWhereClause(condition, results);
  }

  /**
   * 处理列引用中的数据库名
   */
  private processColumnRef(
    node: any,
    results: DatabaseRewriteResult[],
    visited: Set<any> = new Set(),
  ): void {
    if (!node || typeof node !== 'object' || visited.has(node)) return;
    visited.add(node);

    // 处理列引用 (type: 'column_ref')
    if (node.type === 'column_ref' && node.db) {
      let dbName: string;

      // 处理不同格式的数据库名
      if (typeof node.db === 'string') {
        dbName = node.db;
      } else if (node.db.type === 'backticks_quote_string' && node.db.value) {
        dbName = node.db.value;
      } else if (node.db.type === 'single_quote_string' && node.db.value) {
        dbName = node.db.value;
      } else if (node.db.type === 'double_quote_string' && node.db.value) {
        dbName = node.db.value;
      } else {
        // 如果是其他格式，跳过处理
        dbName = null;
      }

      if (dbName) {
        const result = this.rewriteDatabaseName(dbName);
        if (result.modified) {
          // 保持原有的格式结构，只更新值
          if (typeof node.db === 'string') {
            node.db = result.rewrittenName;
          } else {
            node.db.value = result.rewrittenName;
          }
          results.push(result);
        }
      }
    }

    // 递归处理所有属性
    for (const key in node) {
      if (node.hasOwnProperty(key) && typeof node[key] === 'object') {
        if (Array.isArray(node[key])) {
          for (const item of node[key]) {
            this.processColumnRef(item, results, visited);
          }
        } else {
          this.processColumnRef(node[key], results, visited);
        }
      }
    }
  }

  /**
   * 改写单个数据库名
   * @param dbName 原始数据库名
   * @returns 改写结果
   */
  private rewriteDatabaseName(dbName: string): DatabaseRewriteResult {
    const originalName = dbName;

    // 检查是否已经包含前缀，避免重复添加
    if (this.config.dbPrefix && dbName.startsWith(this.config.dbPrefix)) {
      return {
        originalName,
        rewrittenName: dbName, // 已经有前缀，不需要改写
        modified: false,
      };
    }

    // 检查是否应该被排除
    if (this.shouldExcludeDatabase(dbName)) {
      return {
        originalName,
        rewrittenName: dbName,
        modified: false,
      };
    }

    // 检查是否是目标数据库（如果指定了目标列表）
    if (!this.isTargetDatabase(dbName)) {
      return {
        originalName,
        rewrittenName: dbName,
        modified: false,
      };
    }

    // 执行改写
    const rewrittenName = this.config.preserveOriginalName
      ? `${this.config.dbPrefix}${dbName}`
      : this.config.dbPrefix.replace(/\$\{original\}/g, dbName);

    return {
      originalName,
      rewrittenName,
      modified: rewrittenName !== originalName,
    };
  }

  /**
   * 检查数据库是否应该被排除
   */
  private shouldExcludeDatabase(dbName: string): boolean {
    if (
      !this.config.excludeDatabases ||
      this.config.excludeDatabases.length === 0
    ) {
      return false;
    }

    return this.config.excludeDatabases.includes(dbName);
  }

  /**
   * 检查是否是目标数据库
   */
  private isTargetDatabase(dbName: string): boolean {
    // 如果没有指定目标数据库列表，则默认所有数据库都是目标
    if (
      !this.config.targetDatabases ||
      this.config.targetDatabases.length === 0
    ) {
      return true;
    }

    return this.config.targetDatabases.includes(dbName);
  }

  /**
   * 获取当前配置
   */
  getConfig(): DatabaseRewriteConfig {
    return { ...this.config };
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<DatabaseRewriteConfig>): void {
    // 深度合并包装型语句配置
    if (newConfig.wrapperStatements) {
      this.config.wrapperStatements = {
        ...this.config.wrapperStatements,
        ...newConfig.wrapperStatements,
      };
    }

    const updatedConfig = { ...this.config, ...newConfig };
    this.validateConfig(updatedConfig);
    this.config = updatedConfig;
  }

  /**
   * 静态方法：创建数据库改写器实例
   */
  static create(config: DatabaseRewriteConfig): DatabaseNameRewriter {
    return new DatabaseNameRewriter(config);
  }

  /**
   * 静态方法：检查配置是否有效
   */
  static isValidConfig(config: any): config is DatabaseRewriteConfig {
    try {
      new DatabaseNameRewriter(config);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 对SQL语句进行数据库名改写，保留所有注释信息
   * @param sql SQL语句
   * @returns 改写结果
   */
  rewriteDatabase(sql: string): DatabaseRewriteOnlyResult {
    if (!this.config.enabled) {
      return {
        sql,
        modified: false,
        databaseRewrites: [],
      };
    }

    try {
      // 使用基类的模板方法来处理SQL
      const result = this.processWithComments(sql);

      return {
        sql: result.sql,
        modified: result.modified,
        databaseRewrites: result.result || [],
      };
    } catch (error) {
      // 改写失败时返回原SQL
      console.warn(
        'Database rewrite failed, returning original SQL:',
        error instanceof Error ? error.message : error,
      );
      return {
        sql,
        modified: false,
        databaseRewrites: [],
      };
    }
  }
}
