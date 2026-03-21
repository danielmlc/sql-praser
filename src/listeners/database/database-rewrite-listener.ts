import { BaseListener } from '../base/base-listener';
import {
  ListenerContext,
  DatabaseRewriteListenerConfig,
  TokenStreamRewriter,
} from '../../core/types';
import type {
  MySqlParserListener,
  ParserRuleContext,
} from '../../core/antlr4-types';
import { ParseTreeWalker, CommonTokenStream } from 'antlr4ng';
import { ListenerBinder } from '../../utils/listener-binder';
import { Antlr4Loader } from '../../utils/antlr4-loader';

// 动态导入生成的 ANTLR4 Listener
const { module: MySqlParserListener, success: listenerLoaded } = Antlr4Loader.loadModule(
  'MySqlParserListener',
  'MySqlParserListener',
  {
    throwOnError: true,
    callerPath: __dirname,
  }
);

/**
 * 库名改写 Listener
 * 负责在 SQL 中为数据库名添加前缀
 * 优先级 50（在 HintListener 之后、TenantFilterListener 之前）
 */
export class DatabaseRewriteListener extends BaseListener<DatabaseRewriteListenerConfig> {
  protected readonly name = 'DatabaseRewriteListener';

  getPriority(): number {
    return 50;
  }

  process(_ast: unknown, context: ListenerContext): void {
    const { dbPrefix } = this.config;
    if (!dbPrefix) {
      return;
    }

    const { rewriter, tokenStream, parseTree } = context;

    const antlrListener = new DatabaseNameRewriteListener(
      rewriter,
      tokenStream,
      dbPrefix,
      this.config.targetDatabases,
      this.config.excludeDatabases
    );

    ListenerBinder.bindAllEnterExit(antlrListener as any);

    ParseTreeWalker.DEFAULT.walk(antlrListener as any, parseTree as any);
  }
}

/**
 * ANTLR4 Listener 实现
 * 遍历语法树，找到所有表名中的库名部分并添加前缀
 */
class DatabaseNameRewriteListener extends (MySqlParserListener as any) {
  // 记录已处理过的 token index，避免重复替换
  private processedTokens = new Set<number>();

  constructor(
    private readonly rewriter: TokenStreamRewriter,
    private readonly tokenStream: CommonTokenStream,
    private readonly dbPrefix: string,
    private readonly targetDatabases?: string[],
    private readonly excludeDatabases?: string[]
  ) {
    super();
  }

  /**
   * 进入 tableName 节点时，对库名部分进行改写
   * 使用 ANTLR4 生成的专用钩子，仅在 TableNameContext 节点触发
   */
  enterTableName(ctx: ParserRuleContext): void {
    const text = ctx.getText();
    if (!text || !text.includes('.')) {
      return; // 没有库名部分，跳过
    }

    const dotIndex = text.indexOf('.');
    const dbName = text.substring(0, dotIndex);

    if (!this.shouldRewrite(dbName)) {
      return;
    }

    const newDbName = this.dbPrefix + dbName;

    // 找到库名对应的 token 并替换
    this.replaceDbNameToken(ctx, dbName, newDbName);
  }

  /**
   * 替换库名 token
   * tableName 通常由多个 token 组成: [dbName] [.] [tableName]
   * 我们需要找到 dbName 对应的 token 并替换
   */
  private replaceDbNameToken(ctx: ParserRuleContext, dbName: string, newDbName: string): void {
    if (!ctx.start) {
      return;
    }

    const startIndex = ctx.start.tokenIndex;
    const stopIndex = ctx.stop?.tokenIndex ?? startIndex;

    // 扫描 token 范围，找到库名 token
    for (let i = startIndex; i <= stopIndex; i++) {
      if (this.processedTokens.has(i)) {
        continue;
      }

      const token = this.tokenStream.get(i);
      const tokenText = token.text || '';

      // 匹配库名 token（可能带反引号）
      const rawName = this.stripBackticks(tokenText);
      if (rawName === dbName) {
        const hasBackticks = tokenText.startsWith('`');
        const replacement = hasBackticks ? `\`${newDbName}\`` : newDbName;
        this.rewriter.replace(i, i, replacement);
        this.processedTokens.add(i);
        return;
      }
    }
  }

  /**
   * 判断库名是否需要改写
   */
  private shouldRewrite(dbName: string): boolean {
    if (!dbName) {
      return false;
    }

    // 已有前缀的不重复添加
    if (dbName.startsWith(this.dbPrefix)) {
      return false;
    }

    // 检查排除列表
    if (this.excludeDatabases?.includes(dbName)) {
      return false;
    }

    // 如果有目标列表，只改写目标库
    if (this.targetDatabases && this.targetDatabases.length > 0) {
      return this.targetDatabases.includes(dbName);
    }

    return true;
  }

  /**
   * 去除反引号
   */
  private stripBackticks(name: string): string {
    if (name.startsWith('`') && name.endsWith('`')) {
      return name.slice(1, -1);
    }
    return name;
  }
}
