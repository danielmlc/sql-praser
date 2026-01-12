"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseDialectAdapter = void 0;
/**
 * 基础 Adapter 抽象类
 * 所有 Adapter 实现的基类
 */
class BaseDialectAdapter {
    /**
     * 将方言特定 AST 适配为标准格式
     * 默认实现直接返回（适用于标准方言如 MySQL）
     */
    adaptAST(ast) {
        // 默认不做转换，子类可以重写
        return ast;
    }
    /**
     * 检查是否支持某特性
     */
    supportsFeature(feature) {
        return this.getSupportedFeatures().has(feature);
    }
}
exports.BaseDialectAdapter = BaseDialectAdapter;
