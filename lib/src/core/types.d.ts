import { SQLDialect, ErrorType } from './enums';
import { CommonTokenStream } from 'antlr4ng';
export type ParseTree = any;
export type ANTLRToken = import('antlr4ng').Token;
export type TokenStream = CommonTokenStream;
export type TokenStreamRewriter = import('antlr4ng').TokenStreamRewriter;
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
 * Listener 配置
 */
export interface ListenerConfig {
    /** 租户 Listener 配置 */
    tenant: TenantListenerConfig;
    /** Hint Listener 配置 */
    hint: HintListenerConfig;
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
/**
 * Hint 信息接口
 */
export interface HintInfo {
    /** 租户编码 */
    tenant?: string;
    /** 原始 Hint 字符串 */
    original?: string;
}
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
/**
 * SQL 解析错误基类
 */
export declare class SqlParseError extends Error {
    readonly type: ErrorType;
    readonly originalSql?: string;
    readonly cause?: Error;
    constructor(type: ErrorType, message: string, originalSql?: string, cause?: Error);
}
/**
 * 配置错误
 */
export declare class ConfigError extends SqlParseError {
    constructor(message: string);
}
/**
 * 解析错误
 */
export declare class ParserError extends SqlParseError {
    constructor(message: string, originalSql: string, cause?: Error);
}
