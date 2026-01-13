import { ParseResult, SqlParserConfig, ParseTree, ListenerContext } from './types';
import { SQLDialect } from './enums';

// ============================================================================
// Parser 接口
// ============================================================================

/**
 * SQL Parser 接口
 * 所有 Parser 实现必须实现此接口
 */
export interface ISQLParser {
  /**
   * 解析 SQL 为 AST
   * @param sql SQL 字符串
   * @returns 解析结果
   */
  parse(sql: string): ParseResult;

  /**
   * 解析 SQL 并返回详细信息（包含错误信息）
   * @param sql SQL 字符串
   * @returns 解析结果
   */
  parseWithDetails(sql: string): ParseResult;

  /**
   * 验证 SQL 语法
   * @param sql SQL 字符串
   * @returns 是否有效
   */
  validate(sql: string): boolean;

  /**
   * 获取支持的 SQL 类型
   * @returns SQL 类型列表
   */
  getSupportedTypes(): string[];

  /**
   * 获取方言类型
   * @returns SQL 方言
   */
  getDialect(): SQLDialect;
}

// ============================================================================
// Adapter 接口
// ============================================================================

/**
 * 方言适配器接口
 * 负责将不同方言的 AST 适配为统一格式
 */
export interface IDialectAdapter {
  /**
   * 将方言特定 AST 适配为标准格式
   * @param ast 原始 AST
   * @returns 适配后的 AST
   */
  adaptAST(ast: ParseTree): ParseTree;

  /**
   * 获取方言支持的特性
   * @returns 特性集合
   */
  getSupportedFeatures(): Set<string>;

  /**
   * 检查是否支持某特性
   * @param feature 特性名称
   * @returns 是否支持
   */
  supportsFeature(feature: string): boolean;

  /**
   * 获取方言类型
   * @returns SQL 方言
   */
  getDialect(): SQLDialect;
}

// ============================================================================
// Listener 接口
// ============================================================================

/**
 * SQL Listener 接口
 * 所有 Listener 实现必须实现此接口
 */
export interface ISQLListener {
  /**
   * 处理前的钩子
   * @param context 处理上下文
   */
  beforeProcess?(context: ListenerContext): void;

  /**
   * 处理 AST
   * @param ast AST 对象
   * @param context 处理上下文
   * @returns 处理后的 AST（可选）
   */
  process(ast: ParseTree, context: ListenerContext): void;

  /**
   * 处理后的钩子
   * @param context 处理上下文
   */
  afterProcess?(context: ListenerContext): void;

  /**
   * 获取优先级（数字越小优先级越高）
   * @returns 优先级值
   */
  getPriority(): number;

  /**
   * 是否启用此 Listener
   * @returns 是否启用
   */
  isEnabled(): boolean;

  /**
   * 获取 Listener 名称
   * @returns Listener 名称
   */
  getName(): string;
}

// ============================================================================
// Factory 接口
// ============================================================================

/**
 * Parser 工厂接口
 */
export interface IParserFactory {
  /**
   * 创建 Parser 实例
   * @param dialect SQL 方言
   * @returns Parser 实例
   */
  createParser(dialect: SQLDialect): ISQLParser;

  /**
   * 注册 Parser
   * @param dialect SQL 方言
   * @param factory 工厂函数
   */
  registerParser(dialect: SQLDialect, factory: () => ISQLParser): void;

  /**
   * 获取支持的方言列表
   * @returns 方言列表
   */
  getSupportedDialects(): SQLDialect[];
}

/**
 * Adapter 工厂接口
 */
export interface IAdapterFactory {
  /**
   * 创建 Adapter 实例
   * @param dialect SQL 方言
   * @returns Adapter 实例
   */
  createAdapter(dialect: SQLDialect): IDialectAdapter;

  /**
   * 注册 Adapter
   * @param dialect SQL 方言
   * @param factory 工厂函数
   */
  registerAdapter(dialect: SQLDialect, factory: () => IDialectAdapter): void;

  /**
   * 获取支持的方言列表
   * @returns 方言列表
   */
  getSupportedDialects(): SQLDialect[];
}
