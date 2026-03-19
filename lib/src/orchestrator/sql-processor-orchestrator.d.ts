import { BaseListener } from '../listeners/base/base-listener';
import { SqlParserConfig, RewriteResult } from '../core/types';
/**
 * SQL 处理编排器
 * 负责协调整个 SQL 处理流程
 */
export declare class SQLProcessorOrchestrator {
    private listenerChain;
    private config;
    private parser;
    constructor(config: SqlParserConfig);
    /**
     * 处理 SQL（同步方法）
     * ANTLR4 处理是同步的，不需要 async
     */
    process(sql: string): RewriteResult;
    /**
     * 添加自定义 Listener
     */
    addListener(listener: BaseListener): void;
    /**
     * 配置管理
     */
    updateConfig(newConfig: Partial<SqlParserConfig>): void;
    /**
     * 获取当前配置
     */
    getConfig(): SqlParserConfig;
    /**
     * 设置默认 Listener
     */
    private setupDefaultListeners;
}
