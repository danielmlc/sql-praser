"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SQLProcessorOrchestrator = void 0;
const factory_1 = require("../parser/factory");
const listener_chain_1 = require("../listeners/base/listener-chain");
const hint_listener_1 = require("../listeners/tenant/hint-listener");
const tenant_filter_listener_1 = require("../listeners/tenant/tenant-filter-listener");
const types_1 = require("../core/types");
/**
 * SQL 处理编排器
 * 负责协调整个 SQL 处理流程
 */
class SQLProcessorOrchestrator {
    listenerChain;
    config;
    parser;
    constructor(config) {
        this.config = config;
        this.parser = factory_1.ParserFactory.createParser(config.dialect);
        this.listenerChain = new listener_chain_1.ListenerChain();
        this.setupDefaultListeners();
    }
    /**
     * 处理 SQL（同步方法）
     * ANTLR4 处理是同步的，不需要 async
     */
    process(sql) {
        try {
            // 1. 解析 SQL
            const parseResult = this.parser.parseWithDetails(sql);
            if (!parseResult.success) {
                // 解析失败，根据配置决定是否抛出错误
                if (this.config.errorHandling.throwOnError) {
                    throw new Error(`SQL 解析失败: ${parseResult.parserErrors[0]?.message}`);
                }
                return {
                    sql,
                    modified: false,
                    listenerResults: [],
                };
            }
            // 2. 准备上下文
            const context = {
                originalSql: sql,
                rewriter: parseResult.rewriter,
                tokenStream: parseResult.tokenStream,
                parseTree: parseResult.parseTree,
                config: this.config.listeners,
                sharedState: new Map(),
            };
            // 4. 执行 Listener 链
            const listenerResults = this.listenerChain.execute(context);
            // 5. 获取结果
            const resultSql = context.rewriter.getText();
            // 6. 检查是否修改
            const modified = listenerResults.some(r => r.modified);
            // 7. 提取 Hint 信息
            const hint = context.sharedState.get(types_1.SHARED_STATE_KEYS.TENANT_INFO);
            return {
                sql: resultSql,
                modified,
                listenerResults,
                hint,
            };
        }
        catch (error) {
            // 错误处理
            if (this.config.errorHandling.throwOnError) {
                throw error;
            }
            return {
                sql,
                modified: false,
                listenerResults: [],
                error: error,
            };
        }
    }
    /**
     * 添加自定义 Listener
     */
    addListener(listener) {
        this.listenerChain.addListener(listener);
    }
    /**
     * 配置管理
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        // 如果方言改变，重新创建 parser 并重新初始化 Listener
        if (newConfig.dialect) {
            this.parser = factory_1.ParserFactory.createParser(this.config.dialect);
            this.listenerChain.clear();
            this.setupDefaultListeners();
        }
    }
    /**
     * 获取当前配置
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * 设置默认 Listener
     */
    setupDefaultListeners() {
        // Hint Listener（最高优先级，最先执行）
        this.listenerChain.addListener(new hint_listener_1.HintListener(this.config.listeners.hint));
        // 租户过滤 Listener
        if (this.config.listeners.tenant.enabled) {
            this.listenerChain.addListener(new tenant_filter_listener_1.TenantFilterListener(this.config.listeners.tenant));
        }
        // 未来可以添加更多 Listener：
        // - DatabaseRewriteListener
        // - Custom Listeners
    }
}
exports.SQLProcessorOrchestrator = SQLProcessorOrchestrator;
