"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseSQLParser = void 0;
const antlr4ng_1 = require("antlr4ng");
/**
 * 收集 ANTLR4 解析错误的 Listener
 */
class ErrorCollector extends antlr4ng_1.BaseErrorListener {
    errors = [];
    syntaxError(_recognizer, _offendingSymbol, line, column, msg, _e) {
        this.errors.push({ message: msg, line, column });
    }
}
/**
 * 基础 Parser 抽象类
 * 所有 Parser 实现的基类
 */
class BaseSQLParser {
    /**
     * 解析 SQL 为 AST
     */
    parse(sql) {
        const result = this.parseWithDetails(sql);
        return result;
    }
    /**
     * 解析 SQL 并返回详细信息
     */
    parseWithDetails(sql) {
        try {
            // 创建字符流
            const inputStream = antlr4ng_1.CharStream.fromString(sql);
            // 创建词法分析器
            const lexer = this.createLexer(inputStream);
            const lexerErrors = new ErrorCollector();
            lexer.removeErrorListeners();
            lexer.addErrorListener(lexerErrors);
            // 创建 Token 流
            const tokenStream = new antlr4ng_1.CommonTokenStream(lexer);
            // 创建语法分析器
            const parser = this.createParser(tokenStream);
            const parserErrors = new ErrorCollector();
            parser.removeErrorListeners();
            parser.addErrorListener(parserErrors);
            // 开始解析
            const parseTree = this.startParsing(parser);
            // 创建重写器
            const rewriter = new antlr4ng_1.TokenStreamRewriter(tokenStream);
            const hasErrors = lexerErrors.errors.length > 0 || parserErrors.errors.length > 0;
            return {
                originalSql: sql,
                parseTree,
                tokenStream,
                rewriter,
                lexerErrors: lexerErrors.errors,
                parserErrors: parserErrors.errors,
                success: !hasErrors,
            };
        }
        catch (error) {
            return {
                originalSql: sql,
                parseTree: null,
                tokenStream: null,
                rewriter: null,
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
    validate(sql) {
        const result = this.parseWithDetails(sql);
        return result.success;
    }
    /**
     * 获取支持的 SQL 类型
     */
    getSupportedTypes() {
        return ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALTER'];
    }
}
exports.BaseSQLParser = BaseSQLParser;
