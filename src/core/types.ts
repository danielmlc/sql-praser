import { SQLDialect, StatementType, ErrorType } from './enums';
import { CommonTokenStream } from 'antlr4ng';
import type { ANTLR4Lexer, ANTLR4Parser, ParseTree } from './antlr4-types';

// 从 antlr4-types 重新导出，保持公共 API 不变
export type { ANTLR4Lexer, ANTLR4Parser, ParseTree };

// ============================================================================
// ANTLR4 TokenStream 类型别名
// ============================================================================

export type ANTLRToken = import('antlr4ng').Token;
export type TokenStream = CommonTokenStream;
export type TokenStreamRewriter = import('antlr4ng').TokenStreamRewriter;

// ============================================================================
// 解析相关类型
// ============================================================================

/**
 * 语法错误信息
 */
export interface SyntaxError {
  /** 错误消息 */
  message: string;
  /** 所在行号 */
  line: number;
  /** 所在列号 */
  column: number;
  /** 错误的 Token */
  offendingToken?: ANTLRToken;
}

/**
 * 解析结果接口
 */
export interface ParseResult {
  /** 原始 SQL */
  originalSql: string;
  /** 解析树 */
  parseTree: ParseTree;
  /** Token 流 */
  tokenStream: TokenStream;
  /** Token 流重写器 */
  rewriter: TokenStreamRewriter;
  /** 词法错误列表 */
  lexerErrors: SyntaxError[];
  /** 语法错误列表 */
  parserErrors: SyntaxError[];
  /** 是否成功解析 */
  success: boolean;
}

// ============================================================================
// 配置相关类型
// ============================================================================

/**
 * 目标数据库配置
 */
export interface TargetDatabaseConfig {
  /** 数据库前缀列表 */
  prefixes: string[];
  /** 完整数据库名列表 */
  fullNames: string[];
  /** 默认数据库名 */
  defaultDatabase: string;
}

/**
 * 基础 Listener 配置
 */
export interface BaseListenerConfig {
  /** 是否启用此 Listener */
  enabled: boolean;
  /** 执行优先级（数字越小越先执行） */
  priority: number;
  /** 是否在遇到错误时中断 */
  abortOnError: boolean;
}

/**
 * 租户 Listener 配置
 */
export interface TenantListenerConfig extends BaseListenerConfig {
  /** 租户字段名 */
  tenantField: string;
  /** 目标数据库配置 */
  targetDatabases: TargetDatabaseConfig;
}

/**
 * Hint Listener 配置
 */
export interface HintListenerConfig extends BaseListenerConfig {
  /** 是否保留原始 Hint */
  preserveHint: boolean;
}

/**
 * 库名改写 Listener 配置
 */
export interface DatabaseRewriteListenerConfig extends BaseListenerConfig {
  /** 数据库名前缀，如 'dev_mc_' */
  dbPrefix: string;
  /** 仅改写的目标库名列表（为空则改写所有） */
  targetDatabases?: string[];
  /** 排除的库名列表（不改写） */
  excludeDatabases?: string[];
}

/**
 * Listener 配置
 */
export interface ListenerConfig {
  /** 租户 Listener 配置 */
  tenant: TenantListenerConfig;
  /** Hint Listener 配置 */
  hint: HintListenerConfig;
  /** 库名改写 Listener 配置（可选） */
  databaseRewrite?: DatabaseRewriteListenerConfig;
}

/**
 * 错误处理配置
 */
export interface ErrorHandlingConfig {
  /** 是否在解析失败时抛出异常 */
  throwOnError: boolean;
  /** 是否收集所有错误（遇到第一个错误后是否继续） */
  collectAll: boolean;
  /** 最大错误数量 */
  maxErrors: number;
  /** 是否记录错误 */
  logErrors: boolean;
}

/**
 * 主配置接口
 */
export interface SqlParserConfig {
  /** 数据库类型 */
  dialect: SQLDialect;
  /** Listener 配置 */
  listeners: ListenerConfig;
  /** 错误处理配置 */
  errorHandling: ErrorHandlingConfig;
}

// ============================================================================
// Listener 相关类型
// ============================================================================

/**
 * Listener 上下文接口
 * 提供 Listener 执行时所需的所有信息
 */
export interface ListenerContext {
  /** 原始 SQL */
  originalSql: string;
  /** Token 流重写器 */
  rewriter: TokenStreamRewriter;
  /** Token 流 */
  tokenStream: TokenStream;
  /** 解析树（用于 Listener 遍历 AST） */
  parseTree: ParseTree;
  /** 配置 */
  config: ListenerConfig;
  /** 共享状态（用于 Listener 之间通信） */
  sharedState: Map<string, any>;
}

/**
 * Listener 执行结果
 */
export interface ListenerResult {
  /** Listener 名称 */
  listenerName: string;
  /** 是否修改了 SQL */
  modified: boolean;
  /** 错误信息（如果有） */
  error?: Error;
  /** 额外的元数据 */
  metadata?: Record<string, any>;
}

// ============================================================================
// SharedState 常量键
// ============================================================================

/**
 * ListenerContext.sharedState 中使用的键常量
 * 避免魔法字符串在多处散落导致拼写错误
 */
export const SHARED_STATE_KEYS = {
  TENANT_INFO: 'tenantInfo',
} as const;

// ============================================================================
// Hint 正则常量
// ============================================================================

/**
 * Hint 匹配正则（带捕获组，提取 tenant 值）
 * 格式：/*& tenant:'xxx' *\/
 */
export const HINT_REGEX = /\/\*&\s*tenant\s*:\s*['"]([^'"]+)['"]\s*\*\//i;

/**
 * Hint 全局匹配正则（用于 removeHints，g 标志）
 */
export const HINT_REGEX_GLOBAL = /\/\*&\s*tenant\s*:\s*['"][^'"]+['"]\s*\*\//gi;

// ============================================================================
// Hint 相关类型
// ============================================================================

/**
 * Hint 信息接口
 */
export interface HintInfo {
  /** 租户编码 */
  tenant?: string;
  /** 原始 Hint 字符串 */
  original?: string;
}

// ============================================================================
// 改写结果相关类型
// ============================================================================

/**
 * 改写结果接口
 */
export interface RewriteResult {
  /** 改写后的 SQL */
  sql: string;
  /** 是否被修改 */
  modified: boolean;
  /** 各个 Listener 的执行结果 */
  listenerResults: ListenerResult[];
  /** 提取的 Hint 信息 */
  hint?: HintInfo;
  /** 错误信息（如果有） */
  error?: Error;
}

// ============================================================================
// 错误相关类型
// ============================================================================

/**
 * SQL 解析错误基类
 */
export class SqlParseError extends Error {
  public readonly type: ErrorType;
  public readonly originalSql?: string;
  public readonly cause?: Error;

  constructor(
    type: ErrorType,
    message: string,
    originalSql?: string,
    cause?: Error
  ) {
    super(message);
    this.name = 'SqlParseError';
    this.type = type;
    this.originalSql = originalSql;
    this.cause = cause;
  }
}

/**
 * 配置错误
 */
export class ConfigError extends SqlParseError {
  constructor(message: string) {
    super(ErrorType.CONFIG_ERROR, message);
    this.name = 'ConfigError';
  }
}

/**
 * 解析错误
 */
export class ParserError extends SqlParseError {
  constructor(message: string, originalSql: string, cause?: Error) {
    super(ErrorType.PARSE_ERROR, message, originalSql, cause);
    this.name = 'ParserError';
  }
}

/**
 * Hint 解析错误
 */
export class HintParseError extends SqlParseError {
  constructor(message: string, originalSql: string, cause?: Error) {
    super(ErrorType.PARSE_ERROR, `Hint解析失败: ${message}`, originalSql, cause);
    this.name = 'HintParseError';
  }
}

/**
 * Listener 转换错误
 */
export class TransformError extends SqlParseError {
  constructor(message: string, originalSql: string, cause?: Error) {
    super(ErrorType.LISTENER_ERROR, `转换失败: ${message}`, originalSql, cause);
    this.name = 'TransformError';
  }
}

/**
 * 不支持的 SQL 类型错误
 */
export class UnsupportedSqlError extends SqlParseError {
  public readonly sqlType: string;

  constructor(sqlType: string, originalSql: string) {
    super(ErrorType.VALIDATION_ERROR, `不支持的SQL类型: ${sqlType}`, originalSql);
    this.name = 'UnsupportedSqlError';
    this.sqlType = sqlType;
  }
}

/**
 * 错误工具类
 */
export class ErrorUtils {
  static formatError(error: SqlParseError): string {
    const sql = error.originalSql || '';
    const truncatedSql = sql.length > 200 ? sql.substring(0, 200) + '...' : sql;
    let message = `${error.name}: ${error.message}\n`;
    message += `原始SQL: ${truncatedSql}\n`;
    if (error.cause) {
      message += `根本原因: ${error.cause.message}\n`;
    }
    return message;
  }

  static isSqlParseError(error: unknown): error is SqlParseError {
    return error instanceof SqlParseError;
  }

  static getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    return String(error);
  }
}
