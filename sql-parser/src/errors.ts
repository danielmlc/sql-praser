/**
 * SQL解析错误基类
 */
export class SqlParseError extends Error {
  public readonly originalSql: string;
  public readonly cause?: Error;

  constructor(message: string, originalSql: string, cause?: Error) {
    super(message);
    this.name = 'SqlParseError';
    this.originalSql = originalSql;
    this.cause = cause;

    // 确保错误堆栈正确显示
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SqlParseError);
    }
  }
}

/**
 * Hint解析错误
 */
export class HintParseError extends SqlParseError {
  constructor(message: string, originalSql: string, cause?: Error) {
    super(`Hint解析失败: ${message}`, originalSql, cause);
    this.name = 'HintParseError';
  }
}

/**
 * AST转换错误
 */
export class AstTransformError extends SqlParseError {
  public readonly astType?: string;

  constructor(
    message: string,
    originalSql: string,
    astType?: string,
    cause?: Error,
  ) {
    super(`AST转换失败: ${message}`, originalSql, cause);
    this.name = 'AstTransformError';
    this.astType = astType;
  }
}

/**
 * SQL重写错误
 */
export class SqlRewriteError extends SqlParseError {
  constructor(message: string, originalSql: string, cause?: Error) {
    super(`SQL重写失败: ${message}`, originalSql, cause);
    this.name = 'SqlRewriteError';
  }
}

/**
 * 配置错误
 */
export class ConfigError extends Error {
  constructor(message: string) {
    super(`配置错误: ${message}`);
    this.name = 'ConfigError';
  }
}

/**
 * 不支持的SQL类型错误
 */
export class UnsupportedSqlError extends SqlParseError {
  public readonly sqlType: string;

  constructor(sqlType: string, originalSql: string) {
    super(`不支持的SQL类型: ${sqlType}`, originalSql);
    this.name = 'UnsupportedSqlError';
    this.sqlType = sqlType;
  }
}

/**
 * 错误工具函数
 */
export class ErrorUtils {
  /**
   * 格式化错误消息，包含完整的上下文信息
   */
  static formatError(error: SqlParseError): string {
    let message = `${error.name}: ${error.message}\n`;
    message += `原始SQL: ${error.originalSql.substring(0, 200)}${error.originalSql.length > 200 ? '...' : ''}\n`;

    if (error.cause) {
      message += `根本原因: ${error.cause.message}\n`;
    }

    return message;
  }

  /**
   * 检查是否为SQL解析相关错误
   */
  static isSqlParseError(error: unknown): error is SqlParseError {
    return error instanceof SqlParseError;
  }

  /**
   * 安全地获取错误消息
   */
  static getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }
}
