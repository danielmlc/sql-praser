/**
 * Listener 方法绑定工具
 * 自动绑定 ANTLR4 Listener 方法到实例，解决基类 undefined 属性遮蔽问题
 */
import type { MySqlParserListener } from '../core/antlr4-types';
/**
 * 方法绑定选项
 */
export interface BindingOptions {
    /** 是否忽略未实现的方法 */
    ignoreMissing?: boolean;
    /** 自定义方法名列表（如果提供，只绑定这些方法） */
    methods?: string[];
}
/**
 * Listener 方法绑定器
 * ANTLR4 生成的 Listener 基类将所有方法定义为 undefined 属性，
 * 这会遮蔽原型方法。此类自动将原型方法绑定到实例。
 */
export declare class ListenerBinder {
    /**
     * ANTLR4 MySQL Parser 常用方法名列表
     */
    private static readonly COMMON_METHODS;
    /**
     * 自动绑定 Listener 实例的所有方法
     * @param listener Listener 实例
     * @param options 绑定选项
     * @returns 绑定后的 Listener 实例（链式调用）
     */
    static bind<T extends MySqlParserListener>(listener: T, options?: BindingOptions): T;
    /**
     * 使用装饰器自动绑定方法
     * 可以在类定义时使用 @AutoBind() 装饰器
     */
    static AutoBind(options?: BindingOptions): <T extends {
        new (...args: any[]): MySqlParserListener;
    }>(constructor: T) => {
        new (...args: any[]): {
            enterEveryRule?(ctx: import("../core/antlr4-types").ParserRuleContext): void;
            exitEveryRule?(ctx: import("../core/antlr4-types").ParserRuleContext): void;
            visitTerminal?(node: unknown): void;
            visitErrorNode?(node: unknown): void;
            enterCteName?(ctx: import("../core/antlr4-types").CteNameContext): void;
            enterInsertStatement?(ctx: import("../core/antlr4-types").InsertStatementContext): void;
            enterQuerySpecification?(ctx: import("../core/antlr4-types").QuerySpecificationContext): void;
            enterQuerySpecificationNointo?(ctx: import("../core/antlr4-types").QuerySpecificationContext): void;
            enterUpdateStatement?(ctx: import("../core/antlr4-types").UpdateStatementContext): void;
            enterDeleteStatement?(ctx: import("../core/antlr4-types").DeleteStatementContext): void;
        };
    } & T;
    /**
     * 批量绑定多个 Listener
     * @param listeners Listener 实例数组
     * @param options 绑定选项
     */
    static bindAll<T extends MySqlParserListener>(listeners: T[], options?: BindingOptions): T[];
    /**
     * 扫描类原型上所有 enter/exit 开头的方法并自动绑定
     * @param listener Listener 实例
     * @param options 绑定选项
     */
    static bindAllEnterExit<T extends MySqlParserListener>(listener: T, options?: BindingOptions): T;
}
