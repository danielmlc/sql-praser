import { ISQLParser } from '../core/interfaces';
import { SQLDialect } from '../core/enums';
/**
 * Parser 工厂类
 * 负责创建和管理不同方言的 Parser 实例
 */
export declare class ParserFactory {
    private static parsers;
    /**
     * 创建 Parser 实例
     */
    static createParser(dialect: SQLDialect): ISQLParser;
    /**
     * 注册 Parser
     */
    static registerParser(dialect: SQLDialect, factory: () => ISQLParser): void;
    /**
     * 获取支持的方言列表
     */
    static getSupportedDialects(): SQLDialect[];
}
