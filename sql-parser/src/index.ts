import { SqlRewriter } from './sql-rewriter';
import { HintParser } from './hint-parser';
import { DatabaseNameRewriter } from './database-name-rewriter';
import { SqlParserUtils } from './sql-parser-utils';
import { BaseSqlProcessor } from './base-sql-processor';
import {
  SqlParserConfig,
  HintInfo,
  RewriteResult,
  TenantCondition,
  SqlType,
  TargetDatabaseConfig,
  DatabaseRewriteConfig,
  DatabaseRewriteResult,
  DatabaseRewriteOnlyResult,
  WrapperStatementConfig,
  WrapperInfo,
} from './types';
import {
  SqlParseError,
  HintParseError,
  AstTransformError,
  SqlRewriteError,
  ConfigError,
  UnsupportedSqlError,
  ErrorUtils,
} from './errors';

/**
 * Global configuration
 */
let globalConfig: SqlParserConfig = {
  tenantField: 'tenant',
  database: 'mysql',
  throwOnError: true,
  targetDatabases: {
    prefixes: ['tnt_'],
    fullNames: ['global_mb'],
    defaultDatabase: 'main', // 默认库名，可根据实际情况调整
  },
};

/**
 * Global SQL rewriter instance (延迟初始化避免重复创建)
 */
let globalRewriter: SqlRewriter | null = null;

/**
 * 获取或创建全局 SqlRewriter 实例
 */
function getGlobalRewriter(): SqlRewriter {
  if (!globalRewriter) {
    globalRewriter = new SqlRewriter(globalConfig);
  }
  return globalRewriter;
}

/**
 * SQL Parser Service
 * Provides simple static method interface
 */
export class SqlParserService {
  /**
   * Set global tenant field name
   * @param fieldName tenant field name
   */
  static setTenantField(fieldName: string): void {
    if (
      !fieldName ||
      typeof fieldName !== 'string' ||
      fieldName.trim().length === 0
    ) {
      throw new ConfigError('Tenant field name cannot be empty');
    }

    globalConfig.tenantField = fieldName.trim();
    if (globalRewriter) {
      globalRewriter.updateConfig({ tenantField: globalConfig.tenantField });
    }
  }

  /**
   * Set target databases configuration
   * @param targetDatabases target database configuration
   */
  static setTargetDatabases(targetDatabases: TargetDatabaseConfig): void {
    if (!targetDatabases) {
      throw new ConfigError('Target databases configuration cannot be empty');
    }

    globalConfig.targetDatabases = targetDatabases;
    if (globalRewriter) {
      globalRewriter.updateConfig({
        targetDatabases: globalConfig.targetDatabases,
      });
    }
  }

  /**
   * Add database prefix to target list
   * @param prefix database prefix
   */
  static addDatabasePrefix(prefix: string): void {
    if (!prefix || typeof prefix !== 'string' || prefix.trim().length === 0) {
      throw new ConfigError('Database prefix cannot be empty');
    }

    if (!globalConfig.targetDatabases) {
      globalConfig.targetDatabases = {
        prefixes: [],
        fullNames: [],
        defaultDatabase: 'main',
      };
    }

    const trimmedPrefix = prefix.trim();
    if (!globalConfig.targetDatabases.prefixes.includes(trimmedPrefix)) {
      globalConfig.targetDatabases.prefixes.push(trimmedPrefix);
      if (globalRewriter) {
        globalRewriter.updateConfig({
          targetDatabases: globalConfig.targetDatabases,
        });
      }
    }
  }

  /**
   * Add full database name to target list
   * @param dbName full database name
   */
  static addDatabaseName(dbName: string): void {
    if (!dbName || typeof dbName !== 'string' || dbName.trim().length === 0) {
      throw new ConfigError('Database name cannot be empty');
    }

    if (!globalConfig.targetDatabases) {
      globalConfig.targetDatabases = {
        prefixes: [],
        fullNames: [],
        defaultDatabase: 'main',
      };
    }

    const trimmedDbName = dbName.trim();
    if (!globalConfig.targetDatabases.fullNames.includes(trimmedDbName)) {
      globalConfig.targetDatabases.fullNames.push(trimmedDbName);
      if (globalRewriter) {
        globalRewriter.updateConfig({
          targetDatabases: globalConfig.targetDatabases,
        });
      }
    }
  }

  /**
   * Set default database name for tables without database prefix
   * @param defaultDatabase default database name
   */
  static setDefaultDatabase(defaultDatabase: string): void {
    if (
      !defaultDatabase ||
      typeof defaultDatabase !== 'string' ||
      defaultDatabase.trim().length === 0
    ) {
      throw new ConfigError('Default database name cannot be empty');
    }

    if (!globalConfig.targetDatabases) {
      globalConfig.targetDatabases = {
        prefixes: [],
        fullNames: [],
        defaultDatabase: defaultDatabase.trim(),
      };
    } else {
      globalConfig.targetDatabases.defaultDatabase = defaultDatabase.trim();
    }

    if (globalRewriter) {
      globalRewriter.updateConfig({
        targetDatabases: globalConfig.targetDatabases,
      });
    }
  }

  /**
   * Set global configuration
   * @param config configuration object
   */
  static setConfig(config: Partial<SqlParserConfig>): void {
    globalConfig = { ...globalConfig, ...config };
    // 重置全局实例，让其在下次使用时重新创建
    globalRewriter = null;
  }

  /**
   * Get current global configuration
   * @returns current configuration
   */
  static getConfig(): SqlParserConfig {
    return { ...globalConfig };
  }

  /**
   * Rewrite SQL with tenant filtering conditions
   * @param sql original SQL statement
   * @returns rewritten SQL
   */
  static rewriteWithTenant(sql: string): string {
    const result = getGlobalRewriter().rewrite(sql);
    return result.sql;
  }

  /**
   * Rewrite SQL and return detailed results
   * @param sql original SQL statement
   * @returns detailed rewrite results
   */
  static rewriteWithDetails(sql: string): RewriteResult {
    return getGlobalRewriter().rewrite(sql);
  }

  /**
   * Batch rewrite SQLs
   * @param sqlList SQL statement list
   * @returns rewritten SQL list
   */
  static batchRewrite(sqlList: string[]): string[] {
    const results = getGlobalRewriter().batchRewrite(sqlList);
    return results.map((result) => result.sql);
  }

  /**
   * Batch rewrite SQLs and return detailed results
   * @param sqlList SQL statement list
   * @returns detailed rewrite results list
   */
  static batchRewriteWithDetails(sqlList: string[]): RewriteResult[] {
    return getGlobalRewriter().batchRewrite(sqlList);
  }

  /**
   * Extract hint information from SQL
   * @param sql SQL statement
   * @returns hint information
   */
  static extractHint(sql: string): HintInfo {
    return getGlobalRewriter().extractHint(sql);
  }

  /**
   * Check if SQL contains hint
   * @param sql SQL statement
   * @returns whether contains hint
   */
  static hasHint(sql: string): boolean {
    return getGlobalRewriter().hasHint(sql);
  }

  /**
   * Remove all hints from SQL
   * @param sql SQL statement
   * @returns SQL without hints
   */
  static removeHints(sql: string): string {
    return getGlobalRewriter().removeHints(sql);
  }

  /**
   * Remove all comments from SQL
   * @param sql SQL statement
   * @returns SQL without comments
   */
  static removeAllComments(sql: string): string {
    return HintParser.removeAllComments(sql);
  }

  /**
   * Validate if SQL is valid
   * @param sql SQL statement
   * @returns whether valid
   */
  static validateSql(sql: string): boolean {
    return getGlobalRewriter().validateSql(sql);
  }

  /**
   * Get SQL type
   * @param sql SQL statement
   * @returns SQL type
   */
  static getSqlType(sql: string): SqlType | null {
    return getGlobalRewriter().getSqlType(sql);
  }

  /**
   * Get detailed SQL information (for debugging)
   * @param sql SQL statement
   * @returns detailed information
   */
  static getDetailedInfo(sql: string): {
    hasHint: boolean;
    hint: HintInfo;
    sqlType: SqlType | null;
    isValid: boolean;
    cleanSql: string;
  } {
    return getGlobalRewriter().getDetailedSqlInfo(sql);
  }

  /**
   * Create tenant hint
   * @param tenant tenant code
   * @returns hint string
   */
  static createHint(tenant: string): string {
    return SqlRewriter.createHint(tenant);
  }

  /**
   * Add hint to SQL
   * @param sql original SQL
   * @param tenant tenant code
   * @returns SQL with hint
   */
  static addHintToSql(sql: string, tenant: string): string {
    return SqlRewriter.addHintToSql(sql, tenant);
  }

  /**
   * Validate tenant code format
   * @param tenant tenant code
   * @returns whether valid
   */
  static isValidTenant(tenant: string): boolean {
    return HintParser.isValidTenant(tenant);
  }

  /**
   * Create new SQL rewriter instance (for independent configuration)
   * @param config configuration
   * @returns SQL rewriter instance
   */
  static createRewriter(config?: Partial<SqlParserConfig>): SqlRewriter {
    return new SqlRewriter(config);
  }
}

/**
 * Export types and error classes
 */
export {
  // Core classes
  SqlRewriter,
  HintParser,
  DatabaseNameRewriter,

  // New infrastructure classes
  SqlParserUtils,
  BaseSqlProcessor,

  // Type definitions
  SqlParserConfig,
  TargetDatabaseConfig,
  DatabaseRewriteConfig,
  DatabaseRewriteResult,
  DatabaseRewriteOnlyResult,
  WrapperStatementConfig,
  WrapperInfo,
  HintInfo,
  RewriteResult,
  TenantCondition,
  SqlType,

  // Error classes
  SqlParseError,
  HintParseError,
  AstTransformError,
  SqlRewriteError,
  ConfigError,
  UnsupportedSqlError,
  ErrorUtils,
};

/**
 * Default export main service class
 */
export default SqlParserService;

/**
 * Convenient function exports (backward compatibility)
 */

/**
 * Rewrite SQL statement with tenant filtering conditions
 * @param sql original SQL
 * @returns rewritten SQL
 */
export const rewriteWithTenant = SqlParserService.rewriteWithTenant;

/**
 * Extract hint information
 * @param sql SQL statement
 * @returns hint information
 */
export const extractHint = SqlParserService.extractHint;

/**
 * Remove hints from SQL
 * @param sql SQL statement
 * @returns SQL without hints
 */
export const removeHints = SqlParserService.removeHints;

/**
 * Set global tenant field name
 * @param fieldName field name
 */
export const setTenantField = SqlParserService.setTenantField;

/**
 * Library version information
 */
export const version = '1.0.0-beta.1';
