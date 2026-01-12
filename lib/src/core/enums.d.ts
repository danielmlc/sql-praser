/**
 * SQL 方言枚举
 */
export declare enum SQLDialect {
    MYSQL = "mysql",
    TIDB = "tidb"
}
/**
 * SQL 语句类型
 */
export declare enum StatementType {
    SELECT = "SELECT",
    INSERT = "INSERT",
    UPDATE = "UPDATE",
    DELETE = "DELETE",
    CREATE = "CREATE",
    DROP = "DROP",
    ALTER = "ALTER"
}
/**
 * 错误类型
 */
export declare enum ErrorType {
    PARSE_ERROR = "PARSE_ERROR",
    LISTENER_ERROR = "LISTENER_ERROR",
    ADAPTER_ERROR = "ADAPTER_ERROR",
    CONFIG_ERROR = "CONFIG_ERROR",
    VALIDATION_ERROR = "VALIDATION_ERROR"
}
