import { AST } from 'node-sql-parser';
import { HintParser } from './hint-parser';
import { AstTransformer } from './ast-transformer';
import { BaseSqlProcessor } from './base-sql-processor';
import { SqlParserUtils } from './sql-parser-utils';
import {
  SqlParserConfig,
  HintInfo,
  RewriteResult,
  TenantCondition,
  SqlType,
  TargetDatabaseConfig,
} from './types';
import { SqlRewriteError, ErrorUtils } from './errors';

/**
 * SQL改写器
 * 协调各个模块完成SQL的解析、转换和重写
 * 现在继承BaseSqlProcessor来复用通用功能
 */
export class SqlRewriter extends BaseSqlProcessor {
  private config: SqlParserConfig;

  constructor(config: Partial<SqlParserConfig> = {}) {
    super();

    // 默认配置
    const defaultConfig: SqlParserConfig = {
      tenantField: 'tenant',
      database: 'mysql',
      throwOnError: true,
      targetDatabases: {
        prefixes: [],
        fullNames: [],
        defaultDatabase: 'main',
      },
      // 默认包装型语句配置
      wrapperStatements: {
        enabled: false, // 默认关闭，需要显式启用
        supportedTypes: [],
        validateInnerSql: true,
      },
    };

    // 深度合并配置，避免覆盖问题
    this.config = {
      ...defaultConfig,
      ...config,
      // 深度合并嵌套对象
      targetDatabases: {
        ...defaultConfig.targetDatabases,
        ...(config.targetDatabases || {}),
      },
      wrapperStatements: {
        ...defaultConfig.wrapperStatements,
        ...(config.wrapperStatements || {}),
      },
    };
    // console.log('SqlRewriter finalConfig', this.config);
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
    return this.config.database;
  }

  /**
   * 实现BaseSqlProcessor的抽象方法：是否在遇到不支持的SQL类型时抛出异常
   */
  protected shouldThrowOnUnsupportedType(): boolean {
    return this.config.throwOnError;
  }

  /**
   * 实现BaseSqlProcessor的抽象方法：处理AST
   * 执行租户条件添加
   */
  protected processAst(ast: AST | AST[]): TenantCondition | null {
    // 暂时返回null，租户条件添加逻辑在rewrite方法中专门处理
    return null;
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
    return this.config.wrapperStatements.supportedTypes || ['EXPLAIN'];
  }

  /**
   * 重写SQL，添加租户过滤条件
   * 采用容错处理，保留所有原始注释信息
   * @param sql 原始SQL语句
   * @returns 重写结果
   */
  rewrite(sql: string): RewriteResult {
    // 输入验证
    try {
      this.validateInput(sql);
    } catch (error) {
      if (this.config.throwOnError) {
        throw error;
      }
      // 输入无效时，返回原始输入和空hint
      return { sql, modified: false, hint: {} };
    }

    // 提取hint信息
    let hint: HintInfo = {};
    try {
      hint = HintParser.extractHint(sql);
    } catch (error) {
      console.warn(
        '提取hint失败，继续处理:',
        ErrorUtils.getErrorMessage(error),
      );
      // hint 提取失败，保持为空对象，但继续处理
    }

    // 没有租户信息时的处理
    if (!hint.tenant) {
      // 使用基类的方法处理包装型语句，但不进行租户条件修改
      const result = this.processWithComments(sql);
      return { sql: result.sql, modified: result.modified, hint };
    }

    // 有租户信息时，进行SQL改写
    try {
      // 如果启用了包装型语句支持，需要特殊处理
      if (this.supportWrapperStatements()) {
        // 使用包装型语句预处理
        const wrapperConfig = this.getWrapperStatementsConfig();
        if (wrapperConfig) {
          const wrapperInfo = SqlParserUtils.preprocessWrapperStatements(
            sql,
            wrapperConfig,
          );

          if (wrapperInfo.hasWrapper) {
            // 处理包装型语句：对内层SQL进行改写
            // wrapperInfo.innerSql 已经是纯净的内层SQL，不包含EXPLAIN前缀
            const rewrittenInnerSql = this.rewriteCleanSql(
              wrapperInfo.innerSql,
              hint.tenant,
            );

            // 重新组合：先组合注释和内层SQL，再加上包装前缀
            const allComments = SqlParserUtils.extractAllComments(sql);
            const sqlWithComments =
              allComments.length > 0
                ? SqlParserUtils.combineCommentsAndSql(
                    allComments,
                    rewrittenInnerSql,
                  )
                : rewrittenInnerSql;

            const finalSql = SqlParserUtils.postprocessWrapperStatements(
              sqlWithComments,
              wrapperInfo,
            );

            return {
              sql: finalSql,
              modified: rewrittenInnerSql !== wrapperInfo.innerSql.trim(),
              hint,
            };
          }
        }
      }

      // 非包装型语句的正常处理
      const cleanSql = HintParser.removeAllComments(sql);
      const rewrittenCleanSql = this.rewriteCleanSql(cleanSql, hint.tenant);

      if (rewrittenCleanSql === cleanSql.trim()) {
        // 没有实际改写
        return { sql, modified: false, hint };
      }

      // 改写成功，组合注释
      const allComments = SqlParserUtils.extractAllComments(sql);
      const finalSql =
        allComments.length > 0
          ? SqlParserUtils.combineCommentsAndSql(allComments, rewrittenCleanSql)
          : rewrittenCleanSql;

      return { sql: finalSql, modified: true, hint };
    } catch (rewriteError) {
      if (this.config.throwOnError) {
        throw rewriteError;
      }

      // SQL改写失败，返回原始完整SQL和提取到的hint
      console.warn(
        'SQL重写失败，返回原SQL:',
        ErrorUtils.getErrorMessage(rewriteError),
      );

      return { sql, modified: false, hint };
    }
  }

  /**
   * 转写纯SQL（不包含hint），添加租户过滤条件
   * @param cleanSql 纯SQL语句（不包含hint）
   * @param tenant 租户标识
   * @returns 转写后的SQL
   */
  rewriteCleanSql(cleanSql: string, tenant: string): string {
    try {
      // 1. 解析SQL为AST（使用工具类，包含DEFAULT预处理）
      const ast = SqlParserUtils.parseToAst(cleanSql, this.config.database);

      // 2. 验证SQL类型是否支持
      SqlParserUtils.validateSqlType(
        ast,
        this.getSupportedSqlTypes(),
        cleanSql,
        this.shouldThrowOnUnsupportedType(),
      );

      // 3. 只执行租户条件添加（不进行数据库名改写）
      const tenantCondition = { field: this.config.tenantField, value: tenant };
      const modifiedAst = AstTransformer.transform(
        ast,
        tenantCondition,
        this.config.targetDatabases,
      );

      // 4. 将AST转换回SQL（使用工具类，包含DEFAULT后处理）
      return SqlParserUtils.astToSql(modifiedAst, this.config.database);
    } catch (error) {
      if (this.config.throwOnError) {
        throw error;
      }
      // 转写失败时返回原SQL
      return cleanSql;
    }
  }

  /**
   * 批量重写SQL
   * @param sqlList SQL列表
   * @returns 重写结果列表
   */
  batchRewrite(sqlList: string[]): RewriteResult[] {
    return sqlList.map((sql) => {
      try {
        return this.rewrite(sql);
      } catch (error) {
        if (this.config.throwOnError) {
          throw error;
        }
        return {
          sql: sql,
          modified: false,
          hint: HintParser.extractHint(sql),
        };
      }
    });
  }

  /**
   * 批量转写纯SQL（不包含hint）
   * @param cleanSqlList 纯SQL列表
   * @param tenant 租户标识
   * @returns 转写后的SQL列表
   */
  batchRewriteCleanSql(cleanSqlList: string[], tenant: string): string[] {
    return cleanSqlList.map((cleanSql) => {
      return this.rewriteCleanSql(cleanSql, tenant);
    });
  }

  /**
   * 仅提取hint信息，不进行重写
   * @param sql SQL语句
   * @returns hint信息
   */
  extractHint(sql: string): HintInfo {
    return HintParser.extractHint(sql);
  }

  /**
   * 检查SQL是否包含hint
   * @param sql SQL语句
   * @returns 是否包含hint
   */
  hasHint(sql: string): boolean {
    return HintParser.hasHint(sql);
  }

  /**
   * 移除SQL中的hint
   * @param sql SQL语句
   * @returns 移除hint后的SQL
   */
  removeHints(sql: string): string {
    return HintParser.removeHints(sql);
  }

  /**
   * 验证SQL是否可以被正确解析
   * @param sql SQL语句
   * @returns 是否有效
   */
  validateSql(sql: string): boolean {
    const cleanSql = HintParser.removeHints(sql);
    return SqlParserUtils.isValidSql(cleanSql, this.config.database);
  }

  /**
   * 获取SQL类型
   * @param sql SQL语句
   * @returns SQL类型
   */
  getSqlType(sql: string): SqlType | null {
    const cleanSql = HintParser.removeHints(sql);
    return SqlParserUtils.getSqlType(
      cleanSql,
      this.config.database,
    ) as SqlType | null;
  }

  /**
   * 更新配置
   * @param newConfig 新配置（部分更新）
   */
  updateConfig(newConfig: Partial<SqlParserConfig>): void {
    // 深度合并包装型语句配置
    if (newConfig.wrapperStatements) {
      this.config.wrapperStatements = {
        ...this.config.wrapperStatements,
        ...newConfig.wrapperStatements,
      };
    }

    this.config = { ...this.config, ...newConfig };
  }

  /**
   * 获取当前配置
   * @returns 当前配置
   */
  getConfig(): SqlParserConfig {
    return { ...this.config };
  }

  /**
   * 验证输入参数
   */
  private validateInput(sql: string): void {
    if (!sql || typeof sql !== 'string') {
      throw new SqlRewriteError('SQL语句不能为空', sql || '');
    }

    if (sql.trim().length === 0) {
      throw new SqlRewriteError('SQL语句不能为空字符串', sql);
    }
  }

  /**
   * 获取详细的错误信息（用于调试）
   * SqlRewriter特有的方法，增加了hint相关信息
   * @param sql SQL语句
   * @returns 详细信息
   */
  getDetailedSqlInfo(sql: string): {
    hasHint: boolean;
    hint: HintInfo;
    sqlType: SqlType | null;
    isValid: boolean;
    cleanSql: string;
  } {
    const hasHint = this.hasHint(sql);
    const hint = this.extractHint(sql);
    const cleanSql = this.removeHints(sql);
    const sqlType = this.getSqlType(sql);
    const isValid = this.validateSql(sql);

    return {
      hasHint,
      hint,
      sqlType,
      isValid,
      cleanSql,
    };
  }

  /**
   * 创建带有指定租户的hint
   * @param tenant 租户编码
   * @returns hint字符串
   */
  static createHint(tenant: string): string {
    return HintParser.buildHint(tenant);
  }

  /**
   * 为SQL添加hint
   * @param sql 原始SQL
   * @param tenant 租户编码
   * @returns 带hint的SQL
   */
  static addHintToSql(sql: string, tenant: string): string {
    const hint = SqlRewriter.createHint(tenant);
    return `${hint} ${sql}`;
  }
}
