import { IDialectAdapter } from '../core/interfaces';
import { SQLDialect } from '../core/enums';
/**
 * 基础 Adapter 抽象类
 * 所有 Adapter 实现的基类
 */
export declare abstract class BaseDialectAdapter implements IDialectAdapter {
    /**
     * 将方言特定 AST 适配为标准格式
     * 默认实现直接返回（适用于标准方言如 MySQL）
     */
    adaptAST(ast: any): any;
    /**
     * 获取方言支持的特性
     */
    abstract getSupportedFeatures(): Set<string>;
    /**
     * 检查是否支持某特性
     */
    supportsFeature(feature: string): boolean;
    /**
     * 获取方言类型
     */
    abstract getDialect(): SQLDialect;
}
