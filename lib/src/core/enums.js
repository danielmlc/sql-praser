"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorType = exports.StatementType = exports.SQLDialect = void 0;
/**
 * SQL 方言枚举
 */
var SQLDialect;
(function (SQLDialect) {
    SQLDialect["MYSQL"] = "mysql";
    SQLDialect["TIDB"] = "tidb";
    // 未来可扩展：POSTGRESQL, MARIADB, 等
})(SQLDialect || (exports.SQLDialect = SQLDialect = {}));
/**
 * SQL 语句类型
 */
var StatementType;
(function (StatementType) {
    StatementType["SELECT"] = "SELECT";
    StatementType["INSERT"] = "INSERT";
    StatementType["UPDATE"] = "UPDATE";
    StatementType["DELETE"] = "DELETE";
    StatementType["CREATE"] = "CREATE";
    StatementType["DROP"] = "DROP";
    StatementType["ALTER"] = "ALTER";
    // 其他类型...
})(StatementType || (exports.StatementType = StatementType = {}));
/**
 * 错误类型
 */
var ErrorType;
(function (ErrorType) {
    ErrorType["PARSE_ERROR"] = "PARSE_ERROR";
    ErrorType["LISTENER_ERROR"] = "LISTENER_ERROR";
    ErrorType["ADAPTER_ERROR"] = "ADAPTER_ERROR";
    ErrorType["CONFIG_ERROR"] = "CONFIG_ERROR";
    ErrorType["VALIDATION_ERROR"] = "VALIDATION_ERROR";
})(ErrorType || (exports.ErrorType = ErrorType = {}));
