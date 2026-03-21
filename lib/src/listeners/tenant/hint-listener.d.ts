import { BaseListener } from '../base/base-listener';
import { ListenerContext, HintListenerConfig, ParseTree } from '../../core/types';
/**
 * Hint Listener
 * 负责提取和移除 SQL 中的 Hint
 */
export declare class HintListener extends BaseListener<HintListenerConfig> {
    protected readonly name = "HintListener";
    /**
     * 获取优先级
     * Hint 提取应该最先执行（优先级最高）
     */
    getPriority(): number;
    /**
     * 处理 SQL，提取 Hint
     */
    process(ast: ParseTree, context: ListenerContext): void;
    /**
     * 提取租户 Hint
     * 支持格式：/*& tenant:'xxx' *\/
     */
    private extractTenantHint;
    /**
     * 移除 Hint
     */
    private removeHint;
}
