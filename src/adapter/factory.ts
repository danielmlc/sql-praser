import { IDialectAdapter } from '../core/interfaces';
import { SQLDialect } from '../core/enums';
import { MySQLAdapter } from './mysql-adapter';

/**
 * Adapter 工厂类
 * 负责创建和管理不同方言的 Adapter 实例
 */
export class AdapterFactory {
  private static adapters = new Map<SQLDialect, () => IDialectAdapter>();

  /**
   * 初始化默认 Adapter
   */
  static {
    // 注册 MySQL Adapter
    AdapterFactory.registerAdapter(SQLDialect.MYSQL, () => new MySQLAdapter());

    // TiDB Adapter 将在后续实现（继承 MySQL Adapter）
    // AdapterFactory.registerAdapter(SQLDialect.TIDB, () => new TiDBAdapter());
  }

  /**
   * 创建 Adapter 实例
   */
  static createAdapter(dialect: SQLDialect): IDialectAdapter {
    const factory = AdapterFactory.adapters.get(dialect);
    if (!factory) {
      throw new Error(`Unsupported SQL dialect: ${dialect}`);
    }
    return factory();
  }

  /**
   * 注册 Adapter
   */
  static registerAdapter(
    dialect: SQLDialect,
    factory: () => IDialectAdapter
  ): void {
    AdapterFactory.adapters.set(dialect, factory);
  }

  /**
   * 获取支持的方言列表
   */
  static getSupportedDialects(): SQLDialect[] {
    return Array.from(AdapterFactory.adapters.keys());
  }
}
