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
export class ListenerBinder {
  /**
   * ANTLR4 MySQL Parser 常用方法名列表
   */
  private static readonly COMMON_METHODS = [
    // CTE
    'enterCteName',
    // DML
    'enterInsertStatement',
    'enterQuerySpecification',
    'enterQuerySpecificationNointo',
    'enterUpdateStatement',
    'enterDeleteStatement',
    'enterSelectStatement',
    // DDL
    'enterCreateDatabase',
    'enterCreateTable',
    'enterDropDatabase',
    'enterDropTable',
    'enterAlterTable',
    // 通用方法
    'enterEveryRule',
    'exitEveryRule',
    'visitTerminal',
    'visitErrorNode',
  ];

  /**
   * 自动绑定 Listener 实例的所有方法
   * @param listener Listener 实例
   * @param options 绑定选项
   * @returns 绑定后的 Listener 实例（链式调用）
   */
  static bind<T extends MySqlParserListener>(
    listener: T,
    options: BindingOptions = {}
  ): T {
    const { ignoreMissing = true, methods } = options;

    // 确定要绑定的方法列表
    const methodsToBind = methods || this.COMMON_METHODS;

    // 获取原型
    const prototype = Object.getPrototypeOf(listener);

    for (const methodName of methodsToBind) {
      // 检查原型上是否有此方法
      if (typeof prototype[methodName] === 'function') {
        // 绑定方法到实例
        (listener as any)[methodName] = prototype[methodName].bind(listener);
      } else if (!ignoreMissing) {
        throw new Error(
          `Method '${methodName}' not found on listener prototype. ` +
            `Make sure the method is defined on the class.`
        );
      }
    }

    return listener;
  }

  /**
   * 使用装饰器自动绑定方法
   * 可以在类定义时使用 @AutoBind() 装饰器
   */
  static AutoBind(options: BindingOptions = {}) {
    return function <T extends { new (...args: any[]): MySqlParserListener }>(
      constructor: T
    ) {
      return class extends constructor {
        constructor(...args: any[]) {
          super(...args);
          ListenerBinder.bind(this as any, options);
        }
      };
    };
  }

  /**
   * 批量绑定多个 Listener
   * @param listeners Listener 实例数组
   * @param options 绑定选项
   */
  static bindAll<T extends MySqlParserListener>(
    listeners: T[],
    options: BindingOptions = {}
  ): T[] {
    return listeners.map(listener => this.bind(listener, options));
  }

  /**
   * 扫描类原型上所有 enter/exit 开头的方法并自动绑定
   * @param listener Listener 实例
   * @param options 绑定选项
   */
  static bindAllEnterExit<T extends MySqlParserListener>(
    listener: T,
    options: BindingOptions = {}
  ): T {
    const prototype = Object.getPrototypeOf(listener);
    const methods: string[] = [];

    // 扫描原型上所有方法
    for (const key of Object.getOwnPropertyNames(prototype)) {
      if (
        (key.startsWith('enter') || key.startsWith('exit')) &&
        typeof prototype[key] === 'function'
      ) {
        methods.push(key);
      }
    }

    return this.bind(listener, { ...options, methods });
  }
}
