"use strict";
/**
 * @cs/sql-parser-antlr4
 *
 * 基于 ANTLR4 的 SQL 解析器
 * 支持 MySQL 和 TiDB 方言
 * 提供租户隔离和库名改写功能
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SqlRewriter = exports.SqlParserService = void 0;
// 核心导出
__exportStar(require("./core"), exports);
__exportStar(require("./parser"), exports);
__exportStar(require("./adapter"), exports);
__exportStar(require("./listeners"), exports);
__exportStar(require("./orchestrator"), exports);
__exportStar(require("./config"), exports);
const orchestrator_1 = require("./orchestrator");
const config_1 = require("./config");
/**
 * SqlParserService
 * 向后兼容的服务类，提供静态 API
 */
class SqlParserService {
    static orchestrator;
    static config;
    /**
     * 初始化服务
     */
    static ensureInitialized() {
        if (!this.orchestrator) {
            this.config = config_1.ConfigManager.createConfig();
            this.orchestrator = new orchestrator_1.SQLProcessorOrchestrator(this.config);
        }
    }
    /**
     * 使用租户信息重写 SQL
     * @param sql 原始 SQL
     * @returns 重写后的 SQL
     */
    static rewriteWithTenant(sql) {
        this.ensureInitialized();
        const result = this.process(sql);
        return result.sql;
    }
    /**
     * 处理 SQL 并返回详细信息
     * @param sql 原始 SQL
     * @returns 处理结果详情
     */
    static rewriteWithDetails(sql) {
        this.ensureInitialized();
        return this.process(sql);
    }
    /**
     * 批量处理 SQL
     * @param sqlList SQL 列表
     * @returns 处理后的 SQL 列表
     */
    static batchRewrite(sqlList) {
        this.ensureInitialized();
        return sqlList.map(sql => this.process(sql).sql);
    }
    /**
     * 处理 SQL（内部方法）
     */
    static process(sql) {
        return this.orchestrator.process(sql);
    }
    /**
     * 设置租户字段名
     * @param fieldName 租户字段名
     */
    static setTenantField(fieldName) {
        this.ensureInitialized();
        this.updateConfig({
            listeners: {
                ...this.config.listeners,
                tenant: {
                    ...this.config.listeners.tenant,
                    tenantField: fieldName,
                },
            },
        });
    }
    /**
     * 设置完整配置
     * @param config 配置对象
     */
    static setConfig(config) {
        this.ensureInitialized();
        this.updateConfig(config);
    }
    /**
     * 更新配置
     * @param config 配置对象
     */
    static updateConfig(config) {
        this.ensureInitialized();
        // 合并现有配置和新配置
        const mergedConfig = { ...this.config, ...config };
        this.config = config_1.ConfigManager.createConfig(mergedConfig);
        config_1.ConfigManager.validateConfig(this.config);
        this.orchestrator.updateConfig(this.config);
    }
    /**
     * 设置目标数据库配置
     * @param targetDatabases 目标数据库配置
     */
    static setTargetDatabases(targetDatabases) {
        this.ensureInitialized();
        this.updateConfig({
            listeners: {
                ...this.config.listeners,
                tenant: {
                    ...this.config.listeners.tenant,
                    targetDatabases: {
                        ...this.config.listeners.tenant.targetDatabases,
                        ...targetDatabases,
                    },
                },
            },
        });
    }
    /**
     * 添加数据库前缀
     * @param prefix 数据库前缀
     */
    static addDatabasePrefix(prefix) {
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
                        },
                    },
                },
            });
        }
    }
    /**
     * 添加完整数据库名
     * @param dbName 数据库名
     */
    static addDatabaseName(dbName) {
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
                        },
                    },
                },
            });
        }
    }
    /**
     * 设置默认数据库名
     * @param defaultDatabase 默认数据库名
     */
    static setDefaultDatabase(defaultDatabase) {
        this.ensureInitialized();
        this.updateConfig({
            listeners: {
                ...this.config.listeners,
                tenant: {
                    ...this.config.listeners.tenant,
                    targetDatabases: {
                        ...this.config.listeners.tenant.targetDatabases,
                        defaultDatabase,
                    },
                },
            },
        });
    }
    /**
     * 提取 Hint 信息
     * @param sql SQL 字符串
     * @returns Hint 信息
     */
    static extractHint(sql) {
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
    static hasHint(sql) {
        return /\/\*&\s*tenant\s*:/i.test(sql);
    }
    /**
     * 移除 Hints
     * @param sql SQL 字符串
     * @returns 移除 Hints 后的 SQL
     */
    static removeHints(sql) {
        return sql.replace(/\/\*&\s*tenant\s*:\s*['"][^'"]+['"]\s*\*\//gi, '');
    }
    /**
     * 验证 SQL 语法
     * @param sql SQL 字符串
     * @returns 是否有效
     */
    static validateSql(sql) {
        this.ensureInitialized();
        // TODO: 实现 SQL 验证
        return true;
    }
}
exports.SqlParserService = SqlParserService;
/**
 * SqlRewriter
 * 向后兼容的类，提供实例 API
 */
class SqlRewriter {
    orchestrator;
    config;
    constructor(config) {
        this.config = config_1.ConfigManager.createConfig(config);
        config_1.ConfigManager.validateConfig(this.config);
        this.orchestrator = new orchestrator_1.SQLProcessorOrchestrator(this.config);
    }
    /**
     * 重写 SQL
     * @param sql 原始 SQL
     * @returns 重写结果
     */
    rewrite(sql) {
        return this.orchestrator.process(sql);
    }
    /**
     * 更新配置
     * @param config 配置对象
     */
    updateConfig(config) {
        this.config = config_1.ConfigManager.createConfig(config);
        config_1.ConfigManager.validateConfig(this.config);
        this.orchestrator.updateConfig(this.config);
    }
    /**
     * 获取配置
     * @returns 当前配置
     */
    getConfig() {
        return { ...this.config };
    }
}
exports.SqlRewriter = SqlRewriter;
// 默认导出
exports.default = SqlParserService;
