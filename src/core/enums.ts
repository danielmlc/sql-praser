/**
 * SQL 方言枚举
 */
export enum SQLDialect {
  MYSQL = 'mysql',
  TIDB = 'tidb',
  // 未来可扩展：POSTGRESQL, MARIADB, 等
}

/**
 * SQL 语句类型
 */
export enum StatementType {
  SELECT = 'SELECT',
  INSERT = 'INSERT',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  CREATE = 'CREATE',
  DROP = 'DROP',
  ALTER = 'ALTER',
  // 其他类型...
}

/**
 * 错误类型
 */
export enum ErrorType {
  PARSE_ERROR = 'PARSE_ERROR',
  LISTENER_ERROR = 'LISTENER_ERROR',
  ADAPTER_ERROR = 'ADAPTER_ERROR',
  CONFIG_ERROR = 'CONFIG_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
}
