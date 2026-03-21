import { AST, Binary, ExpressionValue, ColumnRef, From } from 'node-sql-parser';

/**
 * 目标库配置
 */
export interface TargetDatabaseConfig {
  /** 库名前缀列表，如 ['tnt_'] */
  prefixes: string[];
  /** 完整库名列表，如 ['global_mb'] */
  fullNames: string[];
  /** 默认库名，用于处理无库名的表。**必须设置**，否则遇到无库名表时会抛出异常 */
  defaultDatabase: string;
}

/**
 * 库名改写配置
 */
export interface DatabaseRewriteConfig {
  /** 是否启用库名改写，默认为 false */
  enabled: boolean;
  /** 数据库名前缀，如 'dev_mc_' */
  dbPrefix: string;
  /** 需要改写的库名列表，如果为空则改写所有库名 */
  targetDatabases?: string[];
  /** 排除的库名列表，这些库不会被改写 */
  excludeDatabases?: string[];
  /** 是否保留原始库名作为后缀，默认为 true */
  preserveOriginalName?: boolean;
  /** 包装型语句配置 */
  wrapperStatements?: WrapperStatementConfig;
}

/**
 * SQL解析器配置
 */
export interface SqlParserConfig {
  /** 租户字段名，默认为 'tenant' */
  tenantField: string;
  /** 数据库类型，固定为 mysql */
  database: 'mysql';
  /** 解析失败时是否抛出异常，默认为 true */
  throwOnError: boolean;
  /** 目标库配置，用于指定需要添加租户条件的库 */
  targetDatabases?: TargetDatabaseConfig;
  /** 库名改写配置 */
  databaseRewrite?: DatabaseRewriteConfig;
  /** 包装型语句配置 */
  wrapperStatements?: WrapperStatementConfig;
}

/**
 * 注释信息接口
 */
export interface CommentInfo {
  /** 注释内容（包括注释符号） */
  content: string;
  /** 注释类型 */
  type: 'block' | 'line';
  /** 在原SQL中的起始位置 */
  start: number;
  /** 在原SQL中的结束位置 */
  end: number;
}

/**
 * Hint信息接口
 */
export interface HintInfo {
  /** 租户编码 */
  tenant?: string;
  /** 原始hint字符串 */
  original?: string;
}

/**
 * 库名改写结果
 */
export interface DatabaseRewriteResult {
  /** 原始库名 */
  originalName: string;
  /** 改写后的库名 */
  rewrittenName: string;
  /** 是否进行了改写 */
  modified: boolean;
}

/**
 * 数据库名改写结果
 */
export interface DatabaseRewriteOnlyResult {
  /** 改写后的SQL */
  sql: string;
  /** 是否进行了改写 */
  modified: boolean;
  /** 库名改写详情列表 */
  databaseRewrites: DatabaseRewriteResult[];
}

/**
 * SQL改写结果（租户条件添加）
 */
export interface RewriteResult {
  /** 改写后的SQL */
  sql: string;
  /** 是否进行了改写 */
  modified: boolean;
  /** 提取的hint信息 */
  hint?: HintInfo;
}

/**
 * 租户条件生成器
 */
export interface TenantCondition {
  /** 表别名或表名 */
  table?: string | null;
  /** 租户字段名 */
  field: string;
  /** 租户值 */
  value: string;
}

/**
 * AST转换上下文
 */
export interface TransformContext {
  /** 租户条件 */
  tenantCondition: TenantCondition;
  /** 当前处理的表列表 */
  currentTables: Set<string>;
  /** 当前处理的需要添加租户条件的表列表 */
  targetTables: Set<string>;
  /** CTE（WITH子句）定义的临时表名列表 */
  cteTableNames: Set<string>;
  /** 是否在子查询中 */
  inSubQuery: boolean;
  /** 目标库配置 */
  targetDatabaseConfig?: TargetDatabaseConfig;
}

/**
 * 表信息
 */
export interface TableInfo {
  /** 表名 */
  name: string;
  /** 别名 */
  alias?: string | null;
  /** 数据库名 */
  db?: string | null;
  /** 完整表名 */
  fullName: string;
}

/**
 * 扩展的AST类型，包含我们需要的额外信息
 */
export interface ExtendedAST {
  _rewritten?: boolean;
  _tenantConditionAdded?: boolean;
}

/**
 * 条件表达式构建器类型
 */
export type ConditionBuilder = (
  table: string | null,
  field: string,
  value: string,
) => Binary;

/**
 * SQL类型枚举
 */
export enum SqlType {
  SELECT = 'select',
  INSERT = 'insert',
  UPDATE = 'update',
  DELETE = 'delete',
  REPLACE = 'replace',
  CREATE = 'create',
  ALTER = 'alter',
  DROP = 'drop',
  USE = 'use',
}

/**
 * 包装型语句配置
 */
export interface WrapperStatementConfig {
  /** 是否启用包装型语句支持，默认false */
  enabled: boolean;
  /** 支持的包装型语句类型列表 */
  supportedTypes: string[];
  /** 是否验证内层SQL的有效性，默认true */
  validateInnerSql?: boolean;
  /** 自定义包装型语句模式（高级用法） */
  customPatterns?: Array<{
    type: string;
    pattern: RegExp;
    validateInner?: (innerSql: string) => boolean;
  }>;
}

/**
 * 包装型语句信息接口
 */
export interface WrapperInfo {
  hasWrapper: boolean;
  wrapperType: string;
  prefix: string;
  innerSql: string;
  originalSql: string;
}
