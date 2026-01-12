import { CharStream, CommonTokenStream } from 'antlr4ng';
import { BaseSQLParser } from '../base-parser';
import { SQLDialect } from '../../core/enums';
import type { ParseResult } from '../../core/types';
import { Antlr4Loader } from '../../utils/antlr4-loader';

// 导入生成的 ANTLR4 类
// 注意：需要先运行 pnpm run generate:parser 生成这些文件
const { module: MySqlLexer, success: lexerLoaded } = Antlr4Loader.loadModule<any>('MySqlLexer', 'MySqlLexer', {
  throwOnError: true,
  callerPath: __dirname,
});

const { module: MySqlParser, success: parserLoaded } = Antlr4Loader.loadModule<any>('MySqlParser', 'MySqlParser', {
  throwOnError: true,
  callerPath: __dirname,
});

// 验证加载结果
if (!lexerLoaded || !parserLoaded) {
  throw new Error('MySqlLexer or MySqlParser failed to load. Please run "pnpm run generate:parser" first.');
}

/**
 * MySQL Parser 实现
 * 基于 ANTLR4 生成的 MySQL Parser
 */
export class MySQLParser extends BaseSQLParser {
  /**
   * 获取方言类型
   */
  getDialect(): SQLDialect {
    return SQLDialect.MYSQL;
  }

  /**
   * 创建词法分析器
   */
  protected createLexer(inputStream: CharStream): any {
    return new MySqlLexer(inputStream);
  }

  /**
   * 创建语法分析器
   */
  protected createParser(tokenStream: CommonTokenStream): any {
    return new MySqlParser(tokenStream);
  }

  /**
   * 开始解析
   * MySQL 的根规则是 `root`
   */
  protected startParsing(parser: any): any {
    return parser.root();
  }

  /**
   * 获取支持的 SQL 类型
   */
  getSupportedTypes(): string[] {
    return [
      'SELECT',
      'INSERT',
      'UPDATE',
      'DELETE',
      'CREATE',
      'DROP',
      'ALTER',
      'REPLACE',
      'TRUNCATE',
      'SHOW',
      'DESCRIBE',
      'EXPLAIN',
      'USE',
      'SET',
      'BEGIN',
      'COMMIT',
      'ROLLBACK',
    ];
  }
}
