import { ISQLListener } from '../../core/interfaces';
import { BaseListenerConfig, ListenerContext } from '../../core/types';
/**
 * 基础 Listener 抽象类
 * 所有自定义 Listener 都应该继承此类
 */
export declare abstract class BaseListener<TConfig extends BaseListenerConfig = BaseListenerConfig> implements ISQLListener {
    /** Listener 名称 */
    protected abstract readonly name: string;
    /** Listener 配置 */
    protected config: TConfig;
    /** Listener 上下文 */
    protected context: ListenerContext;
    constructor(config: TConfig);
    /**
     * 检查 Listener 是否启用
     */
    isEnabled(): boolean;
    /**
     * 初始化 Listener
     * 在每次执行前调用，用于设置上下文
     */
    initialize(context: ListenerContext): void;
    /**
     * 初始化钩子（子类可重写）
     */
    protected onInitialize(): void;
    /**
     * 处理前的钩子
     */
    beforeProcess?(context: ListenerContext): void;
    /**
     * 处理 AST（子类必须实现）
     */
    abstract process(ast: any, context: ListenerContext): any;
    /**
     * 处理后的钩子
     */
    afterProcess?(context: ListenerContext): void;
    /**
     * 清理资源
     */
    cleanup(): void;
    /**
     * 清理钩子（子类可重写）
     */
    protected onCleanup(): void;
    /**
     * 获取 Listener 名称
     */
    getName(): string;
    /**
     * 获取 Listener 优先级
     */
    abstract getPriority(): number;
}
