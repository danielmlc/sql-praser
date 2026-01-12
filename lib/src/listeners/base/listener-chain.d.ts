import { BaseListener } from './base-listener';
import { ListenerContext, ListenerResult } from '../../core/types';
/**
 * Listener 链
 * 负责按优先级顺序执行多个 Listener
 */
export declare class ListenerChain {
    private listeners;
    /**
     * 添加 Listener
     */
    addListener(listener: BaseListener): void;
    /**
     * 移除 Listener
     */
    removeListener(listener: BaseListener): void;
    /**
     * 执行所有启用的 Listener（同步方法）
     */
    execute(context: ListenerContext): ListenerResult[];
    /**
     * 获取所有 Listener
     */
    getListeners(): BaseListener[];
    /**
     * 清空所有 Listener
     */
    clear(): void;
}
