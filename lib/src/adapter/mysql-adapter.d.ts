import { BaseDialectAdapter } from './base-adapter';
import { SQLDialect } from '../core/enums';
/**
 * MySQL Adapter
 * MySQL 是标准方言，不需要特殊适配
 */
export declare class MySQLAdapter extends BaseDialectAdapter {
    /**
     * MySQL 支持的特性
     */
    private static readonly FEATURES;
    /**
     * 获取方言类型
     */
    getDialect(): SQLDialect;
    /**
     * 获取支持的特性
     */
    getSupportedFeatures(): Set<string>;
    /**
     * MySQL AST 不需要转换，已经是标准格式
     */
    adaptAST(ast: any): any;
}
