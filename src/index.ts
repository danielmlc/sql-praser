/**
 * @cs/sql-parser-antlr4
 *
 * 基于 ANTLR4 的 SQL 解析器
 * 支持 MySQL 和 TiDB 方言
 * 提供租户隔离和库名改写功能
 */

// 核心导出
export * from './core';
export * from './parser';
export * from './adapter';
export * from './listeners';
export * from './orchestrator';
export * from './config';

import { SQLProcessorOrchestrator } from './orchestrator';
import { ConfigManager } from './config';
import { SqlParserConfig, RewriteResult } from './core/types';

/**
 * SqlParserService
 * 向后兼容的服务类，提供静态 API
 */
export class SqlParserService {
  private static orchestrator: SQLProcessorOrchestrator;
  private static config: SqlParserConfig;

  /**
   * 初始化服务
   */
  private static ensureInitialized(): void {
    if (!this.orchestrator) {
      this.config = ConfigManager.createConfig();
      this.orchestrator = new SQLProcessorOrchestrator(this.config);
    }
  }

  /**
   * 使用租户信息重写 SQL
   * @param sql 原始 SQL
   * @returns 重写后的 SQL
   */
  static rewriteWithTenant(sql: string): string {
    this.ensureInitialized();
    const result = this.process(sql);
    return result.sql;
  }

  /**
   * 处理 SQL 并返回详细信息
   * @param sql 原始 SQL
   * @returns 处理结果详情
   */
  static rewriteWithDetails(sql: string): RewriteResult {
    this.ensureInitialized();
    return this.process(sql);
  }

  /**
   * 批量处理 SQL
   * @param sqlList SQL 列表
   * @returns 处理后的 SQL 列表
   */
  static batchRewrite(sqlList: string[]): string[] {
    this.ensureInitialized();
    return sqlList.map(sql => this.process(sql).sql);
  }

  /**
   * 处理 SQL（内部方法）
   */
  private static process(sql: string): RewriteResult {
    return this.orchestrator.process(sql);
  }

  /**
   * 设置租户字段名
   * @param fieldName 租户字段名
   */
  static setTenantField(fieldName: string): void {
    this.ensureInitialized();
    this.updateConfig({
      listeners: {
        ...this.config.listeners,
        tenant: {
          ...this.config.listeners.tenant,
          tenantField: fieldName,
        } as any,
      },
    } as any);
  }

  /**
   * 设置完整配置
   * @param config 配置对象
   */
  static setConfig(config: Partial<SqlParserConfig>): void {
    this.ensureInitialized();
    this.updateConfig(config);
  }

  /**
   * 更新配置
   * @param config 配置对象
   */
  static updateConfig(config: Partial<SqlParserConfig>): void {
    this.ensureInitialized();
    // 合并现有配置和新配置
    const mergedConfig = { ...this.config, ...config };
    this.config = ConfigManager.createConfig(mergedConfig);
    ConfigManager.validateConfig(this.config);
    this.orchestrator.updateConfig(this.config);
  }

  /**
   * 设置目标数据库配置
   * @param targetDatabases 目标数据库配置
   */
  static setTargetDatabases(targetDatabases: {
    prefixes?: string[];
    fullNames?: string[];
    defaultDatabase?: string;
  }): void {
    this.ensureInitialized();
    this.updateConfig({
      listeners: {
        ...this.config.listeners,
        tenant: {
          ...this.config.listeners.tenant,
          targetDatabases: {
            ...this.config.listeners.tenant.targetDatabases,
            ...targetDatabases,
          } as any,
        } as any,
      },
    } as any);
  }

  /**
   * 添加数据库前缀
   * @param prefix 数据库前缀
   */
  static addDatabasePrefix(prefix: string): void {
    this.ensureInitialized();
    const prefixes = [...this.config.listeners.tenant.targetDatabases.prefixes];
    if (!prefixes.includes(prefix)) {
      prefixes.push(prefix);
      this.updateConfig({
        listeners: {
          ...this.config.listeners,
          tenant: {
            ...this.config.listeners.tenant,
            targetDatabases: {
              ...this.config.listeners.tenant.targetDatabases,
              prefixes,
            } as any,
          } as any,
        },
      } as any);
    }
  }

  /**
   * 添加完整数据库名
   * @param dbName 数据库名
   */
  static addDatabaseName(dbName: string): void {
    this.ensureInitialized();
    const fullNames = [...this.config.listeners.tenant.targetDatabases.fullNames];
    if (!fullNames.includes(dbName)) {
      fullNames.push(dbName);
      this.updateConfig({
        listeners: {
          ...this.config.listeners,
          tenant: {
            ...this.config.listeners.tenant,
            targetDatabases: {
              ...this.config.listeners.tenant.targetDatabases,
              fullNames,
            } as any,
          } as any,
        },
      } as any);
    }
  }

  /**
   * 设置默认数据库名
   * @param defaultDatabase 默认数据库名
   */
  static setDefaultDatabase(defaultDatabase: string): void {
    this.ensureInitialized();
    this.updateConfig({
      listeners: {
        ...this.config.listeners,
        tenant: {
          ...this.config.listeners.tenant,
          targetDatabases: {
            ...this.config.listeners.tenant.targetDatabases,
            defaultDatabase,
          } as any,
        } as any,
      },
    } as any);
  }

  /**
   * 提取 Hint 信息
   * @param sql SQL 字符串
   * @returns Hint 信息
   */
  static extractHint(sql: string): any {
    const hintRegex = /\/\*&\s*tenant\s*:\s*['"]([^'"]+)['"]\s*\*\//i;
    const match = sql.match(hintRegex);
    if (match) {
      return {
        tenant: match[1],
        original: match[0],
      };
    }
    return undefined;
  }

  /**
   * 检查是否有 Hint
   * @param sql SQL 字符串
   * @returns 是否有 Hint
   */
  static hasHint(sql: string): boolean {
    return /\/\*&\s*tenant\s*:/i.test(sql);
  }

  /**
   * 移除 Hints
   * @param sql SQL 字符串
   * @returns 移除 Hints 后的 SQL
   */
  static removeHints(sql: string): string {
    return sql.replace(/\/\*&\s*tenant\s*:\s*['"][^'"]+['"]\s*\*\//gi, '');
  }

  /**
   * 验证 SQL 语法
   * @param sql SQL 字符串
   * @returns 是否有效
   */
  static validateSql(sql: string): boolean {
    this.ensureInitialized();
    // TODO: 实现 SQL 验证
    return true;
  }
}

/**
 * SqlRewriter
 * 向后兼容的类，提供实例 API
 */
export class SqlRewriter {
  private orchestrator: SQLProcessorOrchestrator;
  private config: SqlParserConfig;

  constructor(config?: Partial<SqlParserConfig>) {
    this.config = ConfigManager.createConfig(config);
    ConfigManager.validateConfig(this.config);
    this.orchestrator = new SQLProcessorOrchestrator(this.config);
  }

  /**
   * 重写 SQL
   * @param sql 原始 SQL
   * @returns 重写结果
   */
  rewrite(sql: string): RewriteResult {
    return this.orchestrator.process(sql);
  }

  /**
   * 更新配置
   * @param config 配置对象
   */
  updateConfig(config: Partial<SqlParserConfig>): void {
    this.config = ConfigManager.createConfig(config);
    ConfigManager.validateConfig(this.config);
    this.orchestrator.updateConfig(this.config);
  }

  /**
   * 获取配置
   * @returns 当前配置
   */
  getConfig(): SqlParserConfig {
    return { ...this.config };
  }
}

// 默认导出
export default SqlParserService;
