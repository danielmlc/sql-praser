"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigManager = void 0;
const enums_1 = require("../core/enums");
/**
 * 配置管理器
 * 负责配置的验证、合并和管理
 */
class ConfigManager {
    static DEFAULT_CONFIG = {
        dialect: enums_1.SQLDialect.MYSQL,
        listeners: {
            tenant: {
                enabled: true,
                priority: 100,
                abortOnError: false,
                tenantField: 'tenant',
                targetDatabases: {
                    prefixes: ['tnt_'],
                    fullNames: [],
                    defaultDatabase: 'main',
                },
            },
            hint: {
                enabled: true,
                priority: 10,
                abortOnError: false,
                preserveHint: false,
            },
        },
        errorHandling: {
            throwOnError: false,
            collectAll: true,
            maxErrors: 100,
            logErrors: true,
        },
    };
    /**
     * 创建配置（与默认配置合并）
     */
    static createConfig(userConfig) {
        return this.mergeConfigs(this.DEFAULT_CONFIG, userConfig || {});
    }
    /**
     * 合并配置
     */
    static mergeConfigs(base, override) {
        return {
            ...base,
            ...override,
            listeners: {
                ...base.listeners,
                ...override.listeners,
                tenant: {
                    ...base.listeners.tenant,
                    ...override.listeners?.tenant,
                },
                hint: {
                    ...base.listeners.hint,
                    ...override.listeners?.hint,
                },
            },
            errorHandling: {
                ...base.errorHandling,
                ...override.errorHandling,
            },
        };
    }
    /**
     * 验证配置
     */
    static validateConfig(config) {
        // 验证租户字段名
        if (config.listeners.tenant.enabled && !config.listeners.tenant.tenantField) {
            throw new Error('租户字段名不能为空');
        }
        // 验证默认数据库名
        if (config.listeners.tenant.enabled &&
            !config.listeners.tenant.targetDatabases.defaultDatabase) {
            throw new Error('默认数据库名不能为空');
        }
        // 验证目标数据库配置
        const { prefixes, fullNames, defaultDatabase } = config.listeners.tenant.targetDatabases;
        if (!prefixes.length && !fullNames.length && !defaultDatabase) {
            throw new Error('必须配置至少一个目标数据库规则（prefixes/fullNames/defaultDatabase）');
        }
        // 验证方言
        if (!Object.values(enums_1.SQLDialect).includes(config.dialect)) {
            throw new Error(`不支持的 SQL 方言: ${config.dialect}`);
        }
    }
    /**
     * 获取默认配置
     */
    static getDefaultConfig() {
        return { ...this.DEFAULT_CONFIG };
    }
}
exports.ConfigManager = ConfigManager;
