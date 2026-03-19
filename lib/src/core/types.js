"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParserError = exports.ConfigError = exports.SqlParseError = exports.SHARED_STATE_KEYS = void 0;
const enums_1 = require("./enums");
// ============================================================================
// SharedState 常量键
// ============================================================================
/**
 * ListenerContext.sharedState 中使用的键常量
 * 避免魔法字符串在多处散落导致拼写错误
 */
exports.SHARED_STATE_KEYS = {
    TENANT_INFO: 'tenantInfo',
};
// ============================================================================
// 错误相关类型
// ============================================================================
/**
 * SQL 解析错误基类
 */
class SqlParseError extends Error {
    type;
    originalSql;
    cause;
    constructor(type, message, originalSql, cause) {
        super(message);
        this.name = 'SqlParseError';
        this.type = type;
        this.originalSql = originalSql;
        this.cause = cause;
    }
}
exports.SqlParseError = SqlParseError;
/**
 * 配置错误
 */
class ConfigError extends SqlParseError {
    constructor(message) {
        super(enums_1.ErrorType.CONFIG_ERROR, message);
        this.name = 'ConfigError';
    }
}
exports.ConfigError = ConfigError;
/**
 * 解析错误
 */
class ParserError extends SqlParseError {
    constructor(message, originalSql, cause) {
        super(enums_1.ErrorType.PARSE_ERROR, message, originalSql, cause);
        this.name = 'ParserError';
    }
}
exports.ParserError = ParserError;
