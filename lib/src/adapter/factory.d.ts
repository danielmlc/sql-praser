import { IDialectAdapter } from '../core/interfaces';
import { SQLDialect } from '../core/enums';
/**
 * Adapter 工厂类
 * 负责创建和管理不同方言的 Adapter 实例
 */
export declare class AdapterFactory {
    private static adapters;
    /**
     * 创建 Adapter 实例
     */
    static createAdapter(dialect: SQLDialect): IDialectAdapter;
    /**
     * 注册 Adapter
     */
    static registerAdapter(dialect: SQLDialect, factory: () => IDialectAdapter): void;
    /**
     * 获取支持的方言列表
     */
    static getSupportedDialects(): SQLDialect[];
}
