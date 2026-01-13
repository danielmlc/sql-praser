"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MySQLParser = void 0;
const base_parser_1 = require("../base-parser");
const enums_1 = require("../../core/enums");
const antlr4_loader_1 = require("../../utils/antlr4-loader");
// 导入生成的 ANTLR4 类
// 注意：需要先运行 pnpm run generate:parser 生成这些文件
const { module: MySqlLexer, success: lexerLoaded } = antlr4_loader_1.Antlr4Loader.loadModule('MySqlLexer', 'MySqlLexer', {
    throwOnError: true,
    callerPath: __dirname,
});
const { module: MySqlParser, success: parserLoaded } = antlr4_loader_1.Antlr4Loader.loadModule('MySqlParser', 'MySqlParser', {
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
class MySQLParser extends base_parser_1.BaseSQLParser {
    /**
     * 获取方言类型
     */
    getDialect() {
        return enums_1.SQLDialect.MYSQL;
    }
    /**
     * 创建词法分析器
     */
    createLexer(inputStream) {
        return new MySqlLexer(inputStream);
    }
    /**
     * 创建语法分析器
     */
    createParser(tokenStream) {
        return new MySqlParser(tokenStream);
    }
    /**
     * 开始解析
     * MySQL 的根规则是 `root`
     */
    startParsing(parser) {
        // ANTLR4 生成的 Parser 有 root() 方法，但 TypeScript 类型中没有定义
        // 使用类型断言访问生成的解析方法
        return parser.root();
    }
    /**
     * 获取支持的 SQL 类型
     */
    getSupportedTypes() {
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
exports.MySQLParser = MySQLParser;
