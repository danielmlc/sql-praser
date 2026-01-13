import { ISQLListener } from '../../core/interfaces';
import { BaseListenerConfig, ListenerContext, ParseTree } from '../../core/types';

/**
 * 基础 Listener 抽象类
 * 所有自定义 Listener 都应该继承此类
 */
export abstract class BaseListener<TConfig extends BaseListenerConfig = BaseListenerConfig>
  implements ISQLListener {
  /** Listener 名称 */
  protected abstract readonly name: string;

  /** Listener 配置 */
  protected config: TConfig;

  /** Listener 上下文 */
  protected context!: ListenerContext;

  constructor(config: TConfig) {
    this.config = config;
  }

  /**
   * 检查 Listener 是否启用
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * 初始化 Listener
   * 在每次执行前调用，用于设置上下文
   */
  initialize(context: ListenerContext): void {
    this.context = context;
    this.onInitialize();
  }

  /**
   * 初始化钩子（子类可重写）
   */
  protected onInitialize(): void {
    // 子类可以实现自定义的初始化逻辑
  }

  /**
   * 处理前的钩子
   */
  beforeProcess?(context: ListenerContext): void {
    // 子类可以实现
  }

  /**
   * 处理 AST（子类必须实现）
   */
  abstract process(ast: ParseTree, context: ListenerContext): void;

  /**
   * 处理后的钩子
   */
  afterProcess?(context: ListenerContext): void {
    // 子类可以实现
  }

  /**
   * 清理资源
   */
  cleanup(): void {
    this.onCleanup();
  }

  /**
   * 清理钩子（子类可重写）
   */
  protected onCleanup(): void {
    // 子类可以实现自定义的清理逻辑
  }

  /**
   * 获取 Listener 名称
   */
  getName(): string {
    return this.name;
  }

  /**
   * 获取 Listener 优先级
   */
  abstract getPriority(): number;
}
