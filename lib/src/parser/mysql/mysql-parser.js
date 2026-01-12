"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.MySQLParser = void 0;
const base_parser_1 = require("../base-parser");
const enums_1 = require("../../core/enums");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
// 导入生成的 ANTLR4 类
// 注意：需要先运行 pnpm run generate:parser 生成这些文件
// 使用动态 require 来加载运行时模块
const generatedPath = path.join(__dirname, '../../../generated/mysql');
let MySqlLexer;
let MySqlParser;
try {
    // 尝试从编译后的 lib 目录加载
    const libPath = path.join(__dirname, '../../../lib/generated/mysql');
    if (fs.existsSync(libPath)) {
        const lexerModule = require(path.join(libPath, 'MySqlLexer.js'));
        const parserModule = require(path.join(libPath, 'MySqlParser.js'));
        MySqlLexer = lexerModule.MySqlLexer;
        MySqlParser = parserModule.MySqlParser;
    }
    else {
        // 尝试从源目录加载
        const lexerModule = require(path.join(generatedPath, 'MySqlLexer'));
        const parserModule = require(path.join(generatedPath, 'MySqlParser'));
        MySqlLexer = lexerModule.MySqlLexer;
        MySqlParser = parserModule.MySqlParser;
    }
}
catch (e) {
    console.error('[ERROR] Failed to load MySqlLexer/MySqlParser:', e);
    // 如果生成的文件不存在，使用占位符
    MySqlLexer = class {
    };
    MySqlParser = class {
    };
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
