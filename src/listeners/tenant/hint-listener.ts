import { BaseListener } from '../base/base-listener';
import { ListenerContext, HintListenerConfig, HintInfo } from '../../core/types';

/**
 * Hint Listener
 * 负责提取和移除 SQL 中的 Hint
 */
export class HintListener extends BaseListener<HintListenerConfig> {
  protected readonly name = 'HintListener';

  constructor(config: HintListenerConfig) {
    super(config);
  }

  /**
   * 获取优先级
   * Hint 提取应该最先执行（优先级最高）
   */
  getPriority(): number {
    return 10;
  }

  /**
   * 处理 SQL，提取 Hint
   */
  process(ast: any, context: ListenerContext): any {
    const originalSql = context.originalSql;

    // 提取租户 Hint
    const tenantInfo = this.extractTenantHint(originalSql);

    if (tenantInfo) {
      // 将租户信息存入共享状态，供其他 Listener 使用
      context.sharedState.set('tenantInfo', tenantInfo);

      // 如果不保留 Hint，则移除它
      if (!this.config.preserveHint && tenantInfo.original) {
        this.removeHint(tenantInfo.original, context);
      }
    }
  }

  /**
   * 提取租户 Hint
   * 支持格式：/*& tenant:'xxx' *\/
   */
  private extractTenantHint(sql: string): HintInfo | undefined {
    const hintRegex = /\/\*&\s*tenant\s*:\s*['"]([^'"]+)['"]\s*\*\//i;
    const match = sql.match(hintRegex);

    if (match) {
      return {
        tenant: match[1],
        original: match[0],
      };
    }

    return undefined;
  }

  /**
   * 移除 Hint
   */
  private removeHint(hint: string, context: ListenerContext): void {
    const { rewriter, tokenStream } = context;

    // 找到 Hint 对应的 Token
    for (let i = 0; i < tokenStream.size; i++) {
      const token = tokenStream.get(i);
      const tokenText = token.text || '';

      // 检查 Token 是否包含 Hint
      // 注意：Hint 可能作为 COMMENT token 出现
      if (tokenText.includes('tenant') && tokenText.includes("/*&")) {
        // 使用 TokenStreamRewriter 删除 Hint
        rewriter.replace(token.tokenIndex, token.tokenIndex, '');
        break;
      }
    }
  }
}
