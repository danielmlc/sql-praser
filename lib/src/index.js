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
const factory_1 = require("./parser/factory");
const types_1 = require("./core/types");
const enums_1 = require("./core/enums");
const tenant_id_validator_1 = require("./utils/tenant-id-validator");
/**
 * SqlParserService
 * 向后兼容的服务类，提供静态 API
 */
class SqlParserService {
    static orchestrator;
    static config;
    static validationParser;
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
        const match = sql.match(types_1.HINT_REGEX);
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
        return types_1.HINT_REGEX.test(sql);
    }
    /**
     * 移除 Hints
     * @param sql SQL 字符串
     * @returns 移除 Hints 后的 SQL
     */
    static removeHints(sql) {
        return sql.replace(types_1.HINT_REGEX_GLOBAL, '');
    }
    /**
     * 验证 SQL 语法
     * @param sql SQL 字符串
     * @returns 是否有效
     */
    static validateSql(sql) {
        try {
            if (!this.validationParser) {
                this.validationParser = factory_1.ParserFactory.createParser(enums_1.SQLDialect.MYSQL);
            }
            return this.validationParser.validate(sql);
        }
        catch {
            return false;
        }
    }
    /**
     * 获取 SQL 类型
     * @param sql SQL 字符串
     * @returns SQL 类型（SELECT/INSERT/UPDATE/DELETE 等）或 null
     */
    static getSqlType(sql) {
        try {
            const cleanSql = this.removeAllComments(sql);
            if (!cleanSql)
                return null;
            const firstWord = cleanSql.split(/\s+/)[0].toUpperCase();
            const knownTypes = [
                'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALTER',
                'REPLACE', 'TRUNCATE', 'SHOW', 'DESCRIBE', 'EXPLAIN', 'USE', 'SET',
                'BEGIN', 'COMMIT', 'ROLLBACK',
            ];
            return knownTypes.includes(firstWord) ? firstWord : null;
        }
        catch {
            return null;
        }
    }
    /**
     * 创建 Hint 字符串
     * @param tenant 租户编码
     * @returns Hint 字符串
     */
    static createHint(tenant) {
        return `/*& tenant:'${tenant}' */`;
    }
    /**
     * 在 SQL 前添加 Hint
     * @param sql 原始 SQL
     * @param tenant 租户编码
     * @returns 添加 Hint 后的 SQL
     */
    static addHintToSql(sql, tenant) {
        return `${this.createHint(tenant)} ${sql}`;
    }
    /**
     * 移除 SQL 中的所有注释（块注释和行注释）
     * @param sql 原始 SQL
     * @returns 移除注释后的 SQL
     */
    static removeAllComments(sql) {
        if (!sql)
            return sql;
        return sql
            .replace(/\/\*[\s\S]*?\*\//g, ' ') // 块注释
            .replace(/--.*$/gm, '') // 行注释 --
            .replace(/\s+/g, ' ') // 合并空格
            .trim();
    }
    /**
     * 获取 SQL 详细信息
     * @param sql SQL 字符串
     * @returns 详细信息
     */
    static getDetailedInfo(sql) {
        const hint = this.extractHint(sql);
        return {
            hasHint: !!hint,
            hint,
            sqlType: this.getSqlType(sql),
            isValid: this.validateSql(sql),
            cleanSql: this.removeAllComments(sql),
        };
    }
    /**
     * 验证租户编码格式
     * @param tenant 租户编码
     * @returns 是否有效
     */
    static isValidTenant(tenant) {
        return tenant_id_validator_1.TenantIdValidator.isValid(tenant);
    }
    /**
     * 批量处理 SQL 并返回详细结果
     * @param sqlList SQL 列表
     * @returns 处理结果列表
     */
    static batchRewriteWithDetails(sqlList) {
        this.ensureInitialized();
        return sqlList.map(sql => {
            try {
                return this.process(sql);
            }
            catch (error) {
                return {
                    sql,
                    modified: false,
                    listenerResults: [],
                    error: error,
                };
            }
        });
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
