import { BaseListener } from './base-listener';
import { ListenerContext, ListenerResult } from '../../core/types';

/**
 * Listener 链
 * 负责按优先级顺序执行多个 Listener
 */
export class ListenerChain {
  private listeners: BaseListener[] = [];

  /**
   * 添加 Listener
   */
  addListener(listener: BaseListener): void {
    this.listeners.push(listener);
    // 按优先级排序（数字越小越先执行）
    this.listeners.sort((a, b) => a.getPriority() - b.getPriority());
  }

  /**
   * 移除 Listener
   */
  removeListener(listener: BaseListener): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  /**
   * 执行所有启用的 Listener（同步方法）
   */
  execute(context: ListenerContext): ListenerResult[] {
    const results: ListenerResult[] = [];

    for (const listener of this.listeners) {
      if (!listener.isEnabled()) {
        continue;
      }

      const startTime = Date.now();
      let modified = false;

      try {
        // 初始化 Listener
        listener.initialize(context);

        // 执行前置钩子
        listener.beforeProcess?.(context);

        // 记录此 listener 执行前的 SQL 快照，用于准确判断当前 listener 是否做了修改
        const sqlBefore = context.rewriter.getText();
        listener.process(context.parseTree, context);

        // 检查是否修改（与执行前快照比较，而非与原始 SQL 比较）
        modified = context.rewriter.getText() !== sqlBefore;

        // 执行后置钩子
        listener.afterProcess?.(context);

        results.push({
          listenerName: listener.getName(),
          modified,
          metadata: {
            executionTime: Date.now() - startTime,
          },
        });

        // 如果出错且配置为中断，则停止执行
      } catch (error) {
        const errorResult: ListenerResult = {
          listenerName: listener.getName(),
          modified: false,
          error: error as Error,
          metadata: {
            executionTime: Date.now() - startTime,
          },
        };
        results.push(errorResult);

        // 检查是否需要中断
        const abortOnError = (listener as any).config?.abortOnError ?? false;
        if (abortOnError) {
          break;
        }
      } finally {
        // 清理资源
        listener.cleanup();
      }
    }

    return results;
  }

  /**
   * 获取所有 Listener
   */
  getListeners(): BaseListener[] {
    return [...this.listeners];
  }

  /**
   * 清空所有 Listener
   */
  clear(): void {
    this.listeners = [];
  }
}
