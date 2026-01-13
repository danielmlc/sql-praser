import { CharStream, CommonTokenStream, TokenStreamRewriter } from 'antlr4ng';
import { ISQLParser } from '../core/interfaces';
import { SQLDialect } from '../core/enums';
import type { ParseResult, ANTLR4Lexer, ANTLR4Parser, ParseTree } from '../core/types';

/**
 * 基础 Parser 抽象类
 * 所有 Parser 实现的基类
 */
export abstract class BaseSQLParser implements ISQLParser {
  /**
   * 解析 SQL 为 AST
   */
  parse(sql: string): ParseResult {
    const result = this.parseWithDetails(sql);
    return result;
  }

  /**
   * 解析 SQL 并返回详细信息
   */
  parseWithDetails(sql: string): ParseResult {
    try {
      // 创建字符流
      const inputStream = CharStream.fromString(sql);

      // 创建词法分析器
      const lexer = this.createLexer(inputStream);

      // 创建 Token 流
      const tokenStream = new CommonTokenStream(lexer);

      // 创建语法分析器
      const parser = this.createParser(tokenStream);

      // 开始解析
      const parseTree = this.startParsing(parser);

      // 创建重写器
      const rewriter = new TokenStreamRewriter(tokenStream);

      return {
        originalSql: sql,
        parseTree,
        tokenStream,
        rewriter,
        lexerErrors: [],
        parserErrors: [],
        success: true,
      };
    } catch (error) {
      return {
        originalSql: sql,
        parseTree: null as unknown as ParseTree,
        tokenStream: null as unknown as CommonTokenStream,
        rewriter: null as unknown as TokenStreamRewriter,
        lexerErrors: [],
        parserErrors: [
          {
            message: error instanceof Error ? error.message : String(error),
            line: 0,
            column: 0,
          },
        ],
        success: false,
      };
    }
  }

  /**
   * 验证 SQL 语法
   */
  validate(sql: string): boolean {
    const result = this.parseWithDetails(sql);
    return result.success;
  }

  /**
   * 获取方言类型
   */
  abstract getDialect(): SQLDialect;

  /**
   * 获取支持的 SQL 类型
   */
  getSupportedTypes(): string[] {
    return ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALTER'];
  }

  /**
   * 创建词法分析器（子类实现）
   */
  protected abstract createLexer(inputStream: CharStream): ANTLR4Lexer;

  /**
   * 创建语法分析器（子类实现）
   */
  protected abstract createParser(tokenStream: CommonTokenStream): ANTLR4Parser;

  /**
   * 开始解析（子类实现，调用对应的根规则）
   */
  protected abstract startParsing(parser: ANTLR4Parser): ParseTree;
}
