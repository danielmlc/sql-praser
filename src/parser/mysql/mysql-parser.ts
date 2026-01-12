import { CharStream, CommonTokenStream } from 'antlr4ng';
import { BaseSQLParser } from '../base-parser';
import { SQLDialect } from '../../core/enums';
import type { ParseResult } from '../../core/types';
import * as path from 'path';
import * as fs from 'fs';

// 导入生成的 ANTLR4 类
// 注意：需要先运行 pnpm run generate:parser 生成这些文件
// 使用动态 require 来加载运行时模块
const generatedPath = path.join(__dirname, '../../../generated/mysql');

let MySqlLexer: any;
let MySqlParser: any;

try {
  // 尝试从编译后的 lib 目录加载
  const libPath = path.join(__dirname, '../../../lib/generated/mysql');
  if (fs.existsSync(libPath)) {
    const lexerModule = require(path.join(libPath, 'MySqlLexer.js'));
    const parserModule = require(path.join(libPath, 'MySqlParser.js'));
    MySqlLexer = lexerModule.MySqlLexer;
    MySqlParser = parserModule.MySqlParser;
  } else {
    // 尝试从源目录加载
    const lexerModule = require(path.join(generatedPath, 'MySqlLexer'));
    const parserModule = require(path.join(generatedPath, 'MySqlParser'));
    MySqlLexer = lexerModule.MySqlLexer;
    MySqlParser = parserModule.MySqlParser;
  }
} catch (e) {
  console.error('[ERROR] Failed to load MySqlLexer/MySqlParser:', e);
  // 如果生成的文件不存在，使用占位符
  MySqlLexer = class {};
  MySqlParser = class {};
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
