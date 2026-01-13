import { CharStream, CommonTokenStream } from 'antlr4ng';
import { BaseSQLParser } from '../base-parser';
import { SQLDialect } from '../../core/enums';
import type { ANTLR4Lexer, ANTLR4Parser, ParseTree } from '../../core/types';
/**
 * MySQL Parser 实现
 * 基于 ANTLR4 生成的 MySQL Parser
 */
export declare class MySQLParser extends BaseSQLParser {
    /**
     * 获取方言类型
     */
    getDialect(): SQLDialect;
    /**
     * 创建词法分析器
     */
    protected createLexer(inputStream: CharStream): ANTLR4Lexer;
    /**
     * 创建语法分析器
     */
    protected createParser(tokenStream: CommonTokenStream): ANTLR4Parser;
    /**
     * 开始解析
     * MySQL 的根规则是 `root`
     */
    protected startParsing(parser: ANTLR4Parser): ParseTree;
    /**
     * 获取支持的 SQL 类型
     */
    getSupportedTypes(): string[];
}
