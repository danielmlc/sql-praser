/**
 * ANTLR4 生成代码的类型定义
 * 由于 ANTLR4 生成的代码没有 TypeScript 类型定义，这里提供接口定义
 */

import { TokenStreamRewriter } from 'antlr4ng';

// ============================================================================
// 基础 Context 类型
// ============================================================================

/**
 * 解析树上下文基接口
 * 所有 ANTLR4 生成的 Context 都实现此接口
 */
export interface ParserRuleContext {
  /** 父上下文 */
  parentCtx?: ParserRuleContext;
  /** 起始 Token */
  start?: { tokenIndex: number };
  /** 结束 Token */
  stop?: { tokenIndex: number };
  /** 获取子节点数量 */
  getChildCount(): number;
  /** 获取指定索引的子节点 */
  getChild(i: number): ParserRuleContext | undefined;
  /** 获取文本内容 */
  getText(): string;
}

// ============================================================================
// MySQL Parser Context 类型
// ============================================================================

/**
 * 表名上下文
 */
export interface TableNameContext extends ParserRuleContext {
  /** 获取完整表名 */
  getText(): string;
}

/**
 * 表源项上下文（单个表）
 */
export interface TableSourceItemContext extends ParserRuleContext {
  /** 表名 */
  tableName?(): TableNameContext | undefined;
  /** 别名 (AS alias) */
  alias?: { getText(): string };
  /** 别名 (AS? uid) - 可以是方法或属性 */
  uid?: { getText(): string } | (() => { getText(): string });
  /** 内部别名属性 */
  _alias?: { getText(): string };
}

/**
 * JOIN 上下文
 */
export interface JoinedTableContext extends ParserRuleContext {
  /** 表名 */
  tableName?(): TableNameContext | undefined;
  /** 别名 */
  alias?: { getText(): string };
  /** 可以是方法或属性 */
  uid?: { getText(): string } | (() => { getText(): string });
  _alias?: { getText(): string };
}

/**
 * 表源列表上下文
 */
export interface TableSourcesContext extends ParserRuleContext {
  getChildCount(): number;
  getChild(i: number): TableSourceItemContext | undefined;
}

/**
 * FROM 子句上下文
 */
export interface FromClauseContext extends ParserRuleContext {
  /** WHERE 关键字 Token */
  WHERE?(): { tokenIndex: number } | null;
  /** 表源列表 */
  tableSources?(): TableSourcesContext;
  /** 表达式（WHERE 后的谓词） */
  expression?(): ExpressionContext;
  /** 起始和结束 Token */
  start?: { tokenIndex: number };
  stop?: { tokenIndex: number };
}

/**
 * 表达式上下文
 */
export interface ExpressionContext extends ParserRuleContext {
  stop?: { tokenIndex: number };
}

/**
 * SELECT 查询规范上下文
 */
export interface QuerySpecificationContext extends ParserRuleContext {
  /** FROM 子句 */
  fromClause?(): FromClauseContext;
}

/**
 * UPDATE 语句上下文
 */
export interface UpdateStatementContext extends ParserRuleContext {
  /** 单表 UPDATE 语句 */
  singleUpdateStatement?(): SingleUpdateStatementContext;
}

/**
 * 单表 UPDATE 语句上下文
 */
export interface SingleUpdateStatementContext extends ParserRuleContext {
  /** 表源列表 */
  tableSources?(): TableSourcesContext;
  /** WHERE 关键字 Token */
  WHERE?(): { tokenIndex: number } | null;
  /** WHERE 表达式 */
  expression?(): ExpressionContext;
  /** 起始和结束 Token */
  start?: { tokenIndex: number };
  stop?: { tokenIndex: number };
}

/**
 * DELETE 语句上下文
 */
export interface DeleteStatementContext extends ParserRuleContext {
  /** 单表 DELETE 语句 */
  singleDeleteStatement?(): SingleDeleteStatementContext;
  /** 多表 DELETE 语句 */
  multipleDeleteStatement?(): MultipleDeleteStatementContext;
}

/**
 * 单表 DELETE 语句上下文
 */
export interface SingleDeleteStatementContext extends ParserRuleContext {
  /** 表名 */
  tableName?(): TableNameContext;
  /** WHERE 关键字 Token */
  WHERE?(): { tokenIndex: number } | null;
  /** WHERE 表达式 */
  expression?(): ExpressionContext;
  /** 起始和结束 Token */
  start?: { tokenIndex: number };
  stop?: { tokenIndex: number };
}

/**
 * 多表 DELETE 语句上下文
 */
export interface MultipleDeleteStatementContext extends ParserRuleContext {
  /** 表源列表 */
  tableSources?(): TableSourcesContext;
  /** WHERE 关键字 Token */
  WHERE?(): { tokenIndex: number } | null;
  /** WHERE 表达式 */
  expression?(): ExpressionContext;
  /** 起始和结束 Token */
  start?: { tokenIndex: number };
  stop?: { tokenIndex: number };
}

/**
 * INSERT 语句上下文
 */
export interface InsertStatementContext extends ParserRuleContext {
  /** 表名 */
  tableName?(): TableNameContext;
  /** SET 关键字（用于 INSERT ... SET 语法） */
  SET?(): { tokenIndex: number } | null;
  /** 列名列表 */
  fullColumnNameList?(): FullColumnNameListContext;
  /** INSERT 值 */
  insertStatementValue?(): InsertStatementValueContext;
  /** 左括号 Token */
  LR_BRACKET?(index: number): { symbol: { tokenIndex: number } } | undefined;
}

/**
 * 列名列表上下文
 */
export interface FullColumnNameListContext extends ParserRuleContext {}

/**
 * INSERT 值上下文
 */
export interface InsertStatementValueContext extends ParserRuleContext {
  /** 表达式列表 */
  expressionsWithDefaults?(): Array<{ start?: { tokenIndex: number } }>;
}

/**
 * UPDATE 元素上下文（用于 INSERT ... SET）
 */
export interface UpdatedElementContext extends ParserRuleContext {
  stop?: { tokenIndex: number };
}

/**
 * CTE 名称上下文
 */
export interface CteNameContext extends ParserRuleContext {
  getText(): string;
}

// ============================================================================
// Listener 基类类型
// ============================================================================

/**
 * MySqlParserListener 基类接口
 * ANTLR4 生成的 Listener 基类
 */
export interface MySqlParserListenerConstructor {
  new (): MySqlParserListener;
}

/**
 * MySqlParserListener 接口
 * 所有 ANTLR4 方法都是 undefined 属性，需要子类实现
 */
export interface MySqlParserListener {
  /** 进入每个规则 */
  enterEveryRule?(ctx: ParserRuleContext): void;
  /** 退出每个规则 */
  exitEveryRule?(ctx: ParserRuleContext): void;
  /** 访问终端节点 */
  visitTerminal?(node: unknown): void;
  /** 访问错误节点 */
  visitErrorNode?(node: unknown): void;

  // SQL 语句相关方法
  enterCteName?(ctx: CteNameContext): void;
  enterInsertStatement?(ctx: InsertStatementContext): void;
  enterQuerySpecification?(ctx: QuerySpecificationContext): void;
  enterQuerySpecificationNointo?(ctx: QuerySpecificationContext): void;
  enterUpdateStatement?(ctx: UpdateStatementContext): void;
  enterDeleteStatement?(ctx: DeleteStatementContext): void;
}

// ============================================================================
// 表信息类型
// ============================================================================

/**
 * 表信息接口
 */
export interface TableInfo {
  /** 完整表名（包含数据库前缀，如 db.table） */
  fullName: string;
  /** 简单表名（不包含数据库前缀） */
  simpleName: string;
  /** 表别名 */
  alias?: string;
}

// ============================================================================
// TokenStream 相关类型
// ============================================================================

/**
 * Token 流接口扩展
 */
export interface ExtendedTokenStream {
  /** Token 数量 */
  size: number;
  /** 获取指定索引的 Token */
  get(index: number): { tokenIndex: number; text?: string };
}
