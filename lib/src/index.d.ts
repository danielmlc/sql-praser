/**
 * @cs/sql-parser-antlr4
 *
 * 基于 ANTLR4 的 SQL 解析器
 * 支持 MySQL 和 TiDB 方言
 * 提供租户隔离和库名改写功能
 */
export * from './core';
export * from './parser';
export * from './adapter';
export * from './listeners';
export * from './orchestrator';
export * from './config';
import { SqlParserConfig, RewriteResult } from './core/types';
/**
 * SqlParserService
 * 向后兼容的服务类，提供静态 API
 */
export declare class SqlParserService {
    private static orchestrator;
    private static config;
    /**
     * 初始化服务
     */
    private static ensureInitialized;
    /**
     * 使用租户信息重写 SQL
     * @param sql 原始 SQL
     * @returns 重写后的 SQL
     */
    static rewriteWithTenant(sql: string): string;
    /**
     * 处理 SQL 并返回详细信息
     * @param sql 原始 SQL
     * @returns 处理结果详情
     */
    static rewriteWithDetails(sql: string): RewriteResult;
    /**
     * 批量处理 SQL
     * @param sqlList SQL 列表
     * @returns 处理后的 SQL 列表
     */
    static batchRewrite(sqlList: string[]): string[];
    /**
     * 处理 SQL（内部方法）
     */
    private static process;
    /**
     * 设置租户字段名
     * @param fieldName 租户字段名
     */
    static setTenantField(fieldName: string): void;
    /**
     * 设置完整配置
     * @param config 配置对象
     */
    static setConfig(config: Partial<SqlParserConfig>): void;
    /**
     * 更新配置
     * @param config 配置对象
     */
    static updateConfig(config: Partial<SqlParserConfig>): void;
    /**
     * 设置目标数据库配置
     * @param targetDatabases 目标数据库配置
     */
    static setTargetDatabases(targetDatabases: {
        prefixes?: string[];
        fullNames?: string[];
        defaultDatabase?: string;
    }): void;
    /**
     * 添加数据库前缀
     * @param prefix 数据库前缀
     */
    static addDatabasePrefix(prefix: string): void;
    /**
     * 添加完整数据库名
     * @param dbName 数据库名
     */
    static addDatabaseName(dbName: string): void;
    /**
     * 设置默认数据库名
     * @param defaultDatabase 默认数据库名
     */
    static setDefaultDatabase(defaultDatabase: string): void;
    /**
     * 提取 Hint 信息
     * @param sql SQL 字符串
     * @returns Hint 信息
     */
    static extractHint(sql: string): any;
    /**
     * 检查是否有 Hint
     * @param sql SQL 字符串
     * @returns 是否有 Hint
     */
    static hasHint(sql: string): boolean;
    /**
     * 移除 Hints
     * @param sql SQL 字符串
     * @returns 移除 Hints 后的 SQL
     */
    static removeHints(sql: string): string;
    /**
     * 验证 SQL 语法
     * @param sql SQL 字符串
     * @returns 是否有效
     */
    static validateSql(sql: string): boolean;
}
/**
 * SqlRewriter
 * 向后兼容的类，提供实例 API
 */
export declare class SqlRewriter {
    private orchestrator;
    private config;
    constructor(config?: Partial<SqlParserConfig>);
    /**
     * 重写 SQL
     * @param sql 原始 SQL
     * @returns 重写结果
     */
    rewrite(sql: string): RewriteResult;
    /**
     * 更新配置
     * @param config 配置对象
     */
    updateConfig(config: Partial<SqlParserConfig>): void;
    /**
     * 获取配置
     * @returns 当前配置
     */
    getConfig(): SqlParserConfig;
}
export default SqlParserService;
