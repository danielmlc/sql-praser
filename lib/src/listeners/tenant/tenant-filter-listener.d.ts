import { BaseListener } from '../base/base-listener';
import { ListenerContext, TenantListenerConfig } from '../../core/types';
/**
 * 租户条件 Listener
 * 负责在 SQL 中添加租户过滤条件
 */
export declare class TenantFilterListener extends BaseListener<TenantListenerConfig> {
    protected readonly name = "TenantFilterListener";
    /**
     * 获取优先级
     * 租户过滤应该优先级较高（数字小），在库名改写之后执行
     */
    getPriority(): number;
    /**
     * 处理 SQL（使用 ANTLR4 Listener 模式）
     */
    process(_ast: unknown, context: ListenerContext): void;
}
