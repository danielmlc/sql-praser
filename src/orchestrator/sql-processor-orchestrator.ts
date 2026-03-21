import { ParserFactory } from '../parser/factory';
import { ListenerChain } from '../listeners/base/listener-chain';
import { HintListener } from '../listeners/tenant/hint-listener';
import { TenantFilterListener } from '../listeners/tenant/tenant-filter-listener';
import { DatabaseRewriteListener } from '../listeners/database/database-rewrite-listener';
import { BaseListener } from '../listeners/base/base-listener';
import { SqlParserConfig, RewriteResult, ListenerContext, SHARED_STATE_KEYS } from '../core/types';
import { ISQLParser } from '../core/interfaces';

/**
 * SQL 处理编排器
 * 负责协调整个 SQL 处理流程
 */
export class SQLProcessorOrchestrator {
  private listenerChain: ListenerChain;
  private config: SqlParserConfig;
  private parser: ISQLParser;

  constructor(config: SqlParserConfig) {
    this.config = config;
    this.parser = ParserFactory.createParser(config.dialect);
    this.listenerChain = new ListenerChain();
    this.setupDefaultListeners();
  }

  /**
   * 处理 SQL（同步方法）
   * ANTLR4 处理是同步的，不需要 async
   */
  process(sql: string): RewriteResult {
    try {
      // 1. 解析 SQL
      const parseResult = this.parser.parseWithDetails(sql);

      if (!parseResult.success) {
        // 解析失败，根据配置决定是否抛出错误
        if (this.config.errorHandling.throwOnError) {
          throw new Error(`SQL 解析失败: ${parseResult.parserErrors[0]?.message}`);
        }
        return {
          sql,
          modified: false,
          listenerResults: [],
        };
      }

      // 2. 准备上下文
      const context: ListenerContext = {
        originalSql: sql,
        rewriter: parseResult.rewriter,
        tokenStream: parseResult.tokenStream,
        parseTree: parseResult.parseTree,
        config: this.config.listeners,
        sharedState: new Map(),
      };

      // 4. 执行 Listener 链
      const listenerResults = this.listenerChain.execute(context);

      // 5. 获取结果
      const resultSql = context.rewriter.getText();

      // 6. 检查是否修改
      const modified = listenerResults.some(r => r.modified);

      // 7. 提取 Hint 信息
      const hint = context.sharedState.get(SHARED_STATE_KEYS.TENANT_INFO);

      return {
        sql: resultSql,
        modified,
        listenerResults,
        hint,
      };
    } catch (error) {
      // 错误处理
      if (this.config.errorHandling.throwOnError) {
        throw error;
      }
      return {
        sql,
        modified: false,
        listenerResults: [],
        error: error as Error,
      };
    }
  }

  /**
   * 添加自定义 Listener
   */
  addListener(listener: BaseListener): void {
    this.listenerChain.addListener(listener);
  }

  /**
   * 配置管理
   */
  updateConfig(newConfig: Partial<SqlParserConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // 如果方言改变，重新创建 parser 并重新初始化 Listener
    if (newConfig.dialect) {
      this.parser = ParserFactory.createParser(this.config.dialect);
      this.listenerChain.clear();
      this.setupDefaultListeners();
    }
  }

  /**
   * 获取当前配置
   */
  getConfig(): SqlParserConfig {
    return { ...this.config };
  }

  /**
   * 设置默认 Listener
   */
  private setupDefaultListeners(): void {
    // Hint Listener（最高优先级，最先执行）
    this.listenerChain.addListener(
      new HintListener(this.config.listeners.hint)
    );

    // 库名改写 Listener（优先级 50，在 Hint 之后、租户过滤之前）
    if (this.config.listeners.databaseRewrite?.enabled) {
      this.listenerChain.addListener(
        new DatabaseRewriteListener(this.config.listeners.databaseRewrite)
      );
    }

    // 租户过滤 Listener
    if (this.config.listeners.tenant.enabled) {
      this.listenerChain.addListener(
        new TenantFilterListener(this.config.listeners.tenant)
      );
    }
  }
}
