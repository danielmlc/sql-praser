"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorUtils = exports.UnsupportedSqlError = exports.TransformError = exports.HintParseError = exports.ParserError = exports.ConfigError = exports.SqlParseError = exports.HINT_REGEX_GLOBAL = exports.HINT_REGEX = exports.SHARED_STATE_KEYS = void 0;
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
// Hint 正则常量
// ============================================================================
/**
 * Hint 匹配正则（带捕获组，提取 tenant 值）
 * 格式：/*& tenant:'xxx' *\/
 */
exports.HINT_REGEX = /\/\*&\s*tenant\s*:\s*['"]([^'"]+)['"]\s*\*\//i;
/**
 * Hint 全局匹配正则（用于 removeHints，g 标志）
 */
exports.HINT_REGEX_GLOBAL = /\/\*&\s*tenant\s*:\s*['"][^'"]+['"]\s*\*\//gi;
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
/**
 * Hint 解析错误
 */
class HintParseError extends SqlParseError {
    constructor(message, originalSql, cause) {
        super(enums_1.ErrorType.PARSE_ERROR, `Hint解析失败: ${message}`, originalSql, cause);
        this.name = 'HintParseError';
    }
}
exports.HintParseError = HintParseError;
/**
 * Listener 转换错误
 */
class TransformError extends SqlParseError {
    constructor(message, originalSql, cause) {
        super(enums_1.ErrorType.LISTENER_ERROR, `转换失败: ${message}`, originalSql, cause);
        this.name = 'TransformError';
    }
}
exports.TransformError = TransformError;
/**
 * 不支持的 SQL 类型错误
 */
class UnsupportedSqlError extends SqlParseError {
    sqlType;
    constructor(sqlType, originalSql) {
        super(enums_1.ErrorType.VALIDATION_ERROR, `不支持的SQL类型: ${sqlType}`, originalSql);
        this.name = 'UnsupportedSqlError';
        this.sqlType = sqlType;
    }
}
exports.UnsupportedSqlError = UnsupportedSqlError;
/**
 * 错误工具类
 */
class ErrorUtils {
    static formatError(error) {
        const sql = error.originalSql || '';
        const truncatedSql = sql.length > 200 ? sql.substring(0, 200) + '...' : sql;
        let message = `${error.name}: ${error.message}\n`;
        message += `原始SQL: ${truncatedSql}\n`;
        if (error.cause) {
            message += `根本原因: ${error.cause.message}\n`;
        }
        return message;
    }
    static isSqlParseError(error) {
        return error instanceof SqlParseError;
    }
    static getErrorMessage(error) {
        if (error instanceof Error)
            return error.message;
        return String(error);
    }
}
exports.ErrorUtils = ErrorUtils;
