import { ISQLParser } from '../core/interfaces';
import { SQLDialect } from '../core/enums';
import { MySQLParser } from './mysql/mysql-parser';

/**
 * Parser 工厂类
 * 负责创建和管理不同方言的 Parser 实例
 */
export class ParserFactory {
  private static parsers = new Map<SQLDialect, () => ISQLParser>();

  /**
   * 初始化默认 Parser
   */
  static {
    // 注册 MySQL Parser
    ParserFactory.registerParser(SQLDialect.MYSQL, () => new MySQLParser());

    // TiDB Parser 将在后续实现
    // ParserFactory.registerParser(SQLDialect.TIDB, () => new TiDBParser());
  }

  /**
   * 创建 Parser 实例
   */
  static createParser(dialect: SQLDialect): ISQLParser {
    const factory = ParserFactory.parsers.get(dialect);
    if (!factory) {
      throw new Error(`Unsupported SQL dialect: ${dialect}`);
    }
    return factory();
  }

  /**
   * 注册 Parser
   */
  static registerParser(
    dialect: SQLDialect,
    factory: () => ISQLParser
  ): void {
    ParserFactory.parsers.set(dialect, factory);
  }

  /**
   * 获取支持的方言列表
   */
  static getSupportedDialects(): SQLDialect[] {
    return Array.from(ParserFactory.parsers.keys());
  }
}
