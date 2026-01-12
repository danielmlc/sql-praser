"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseListener = void 0;
/**
 * 基础 Listener 抽象类
 * 所有自定义 Listener 都应该继承此类
 */
class BaseListener {
    /** Listener 配置 */
    config;
    /** Listener 上下文 */
    context;
    constructor(config) {
        this.config = config;
    }
    /**
     * 检查 Listener 是否启用
     */
    isEnabled() {
        return this.config.enabled;
    }
    /**
     * 初始化 Listener
     * 在每次执行前调用，用于设置上下文
     */
    initialize(context) {
        this.context = context;
        this.onInitialize();
    }
    /**
     * 初始化钩子（子类可重写）
     */
    onInitialize() {
        // 子类可以实现自定义的初始化逻辑
    }
    /**
     * 处理前的钩子
     */
    beforeProcess(context) {
        // 子类可以实现
    }
    /**
     * 处理后的钩子
     */
    afterProcess(context) {
        // 子类可以实现
    }
    /**
     * 清理资源
     */
    cleanup() {
        this.onCleanup();
    }
    /**
     * 清理钩子（子类可重写）
     */
    onCleanup() {
        // 子类可以实现自定义的清理逻辑
    }
    /**
     * 获取 Listener 名称
     */
    getName() {
        return this.name;
    }
}
exports.BaseListener = BaseListener;
