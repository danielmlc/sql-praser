"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdapterFactory = void 0;
const enums_1 = require("../core/enums");
const mysql_adapter_1 = require("./mysql-adapter");
/**
 * Adapter 工厂类
 * 负责创建和管理不同方言的 Adapter 实例
 */
class AdapterFactory {
    static adapters = new Map();
    /**
     * 初始化默认 Adapter
     */
    static {
        // 注册 MySQL Adapter
        AdapterFactory.registerAdapter(enums_1.SQLDialect.MYSQL, () => new mysql_adapter_1.MySQLAdapter());
        // TiDB Adapter 将在后续实现（继承 MySQL Adapter）
        // AdapterFactory.registerAdapter(SQLDialect.TIDB, () => new TiDBAdapter());
    }
    /**
     * 创建 Adapter 实例
     */
    static createAdapter(dialect) {
        const factory = AdapterFactory.adapters.get(dialect);
        if (!factory) {
            throw new Error(`Unsupported SQL dialect: ${dialect}`);
        }
        return factory();
    }
    /**
     * 注册 Adapter
     */
    static registerAdapter(dialect, factory) {
        AdapterFactory.adapters.set(dialect, factory);
    }
    /**
     * 获取支持的方言列表
     */
    static getSupportedDialects() {
        return Array.from(AdapterFactory.adapters.keys());
    }
}
exports.AdapterFactory = AdapterFactory;
