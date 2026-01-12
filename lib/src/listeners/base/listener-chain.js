"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListenerChain = void 0;
/**
 * Listener 链
 * 负责按优先级顺序执行多个 Listener
 */
class ListenerChain {
    listeners = [];
    /**
     * 添加 Listener
     */
    addListener(listener) {
        this.listeners.push(listener);
        // 按优先级排序（数字越小越先执行）
        this.listeners.sort((a, b) => a.getPriority() - b.getPriority());
    }
    /**
     * 移除 Listener
     */
    removeListener(listener) {
        this.listeners = this.listeners.filter(l => l !== listener);
    }
    /**
     * 执行所有启用的 Listener（同步方法）
     */
    execute(context) {
        const results = [];
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
                // 执行 Listener 处理逻辑
                const originalAst = context.originalSql;
                listener.process(null, context); // AST 处理在 Listener 内部通过 rewriter 完成
                // 检查是否修改
                const resultSql = context.rewriter.getText();
                modified = resultSql !== originalAst;
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
            }
            catch (error) {
                const errorResult = {
                    listenerName: listener.getName(),
                    modified: false,
                    error: error,
                    metadata: {
                        executionTime: Date.now() - startTime,
                    },
                };
                results.push(errorResult);
                // 检查是否需要中断
                // TODO: 从配置中读取 abortOnError 设置
                const abortOnError = false;
                if (abortOnError) {
                    break;
                }
            }
            finally {
                // 清理资源
                listener.cleanup();
            }
        }
        return results;
    }
    /**
     * 获取所有 Listener
     */
    getListeners() {
        return [...this.listeners];
    }
    /**
     * 清空所有 Listener
     */
    clear() {
        this.listeners = [];
    }
}
exports.ListenerChain = ListenerChain;
