"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParserFactory = void 0;
const enums_1 = require("../core/enums");
const mysql_parser_1 = require("./mysql/mysql-parser");
/**
 * Parser 工厂类
 * 负责创建和管理不同方言的 Parser 实例
 */
class ParserFactory {
    static parsers = new Map();
    /**
     * 初始化默认 Parser
     */
    static {
        // 注册 MySQL Parser
        ParserFactory.registerParser(enums_1.SQLDialect.MYSQL, () => new mysql_parser_1.MySQLParser());
        // TiDB Parser 将在后续实现
        // ParserFactory.registerParser(SQLDialect.TIDB, () => new TiDBParser());
    }
    /**
     * 创建 Parser 实例
     */
    static createParser(dialect) {
        const factory = ParserFactory.parsers.get(dialect);
        if (!factory) {
            throw new Error(`Unsupported SQL dialect: ${dialect}`);
        }
        return factory();
    }
    /**
     * 注册 Parser
     */
    static registerParser(dialect, factory) {
        ParserFactory.parsers.set(dialect, factory);
    }
    /**
     * 获取支持的方言列表
     */
    static getSupportedDialects() {
        return Array.from(ParserFactory.parsers.keys());
    }
}
exports.ParserFactory = ParserFactory;
