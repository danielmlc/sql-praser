import { CharStream, CommonTokenStream } from 'antlr4ng';
import { ISQLParser } from '../core/interfaces';
import { SQLDialect } from '../core/enums';
import type { ParseResult, ANTLR4Lexer, ANTLR4Parser, ParseTree } from '../core/types';
/**
 * 基础 Parser 抽象类
 * 所有 Parser 实现的基类
 */
export declare abstract class BaseSQLParser implements ISQLParser {
    /**
     * 解析 SQL 为 AST
     */
    parse(sql: string): ParseResult;
    /**
     * 解析 SQL 并返回详细信息
     */
    parseWithDetails(sql: string): ParseResult;
    /**
     * 验证 SQL 语法
     */
    validate(sql: string): boolean;
    /**
     * 获取方言类型
     */
    abstract getDialect(): SQLDialect;
    /**
     * 获取支持的 SQL 类型
     */
    getSupportedTypes(): string[];
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
