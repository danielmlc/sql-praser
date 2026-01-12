/**
 * 表信息收集工具类
 * 统一处理从 ANTLR4 语法树中提取表信息的逻辑
 */
import type { TableInfo, FromClauseContext, TableSourcesContext, TableSourceItemContext, JoinedTableContext, TableNameContext } from '../core/antlr4-types';
/**
 * 表信息收集器
 * 提供静态方法从各种上下文中提取表信息
 */
export declare class TableInfoCollector {
    /**
     * 从 FROM 子句收集表信息
     * @param fromClause FROM 子句上下文
     * @returns 表信息数组
     */
    static collectFromFromClause(fromClause: FromClauseContext): TableInfo[];
    /**
     *从 TableSources 收集表信息
     * @param tableSources 表源列表上下文
     * @returns 表信息数组
     */
    static collectFromTableSources(tableSources: TableSourcesContext): TableInfo[];
    /**
     * 从 JOIN 上下文收集表信息（支持嵌套 JOIN）
     * @param joinCtx JOIN 上下文
     * @returns 表信息数组
     */
    static collectFromJoinContext(joinCtx: JoinedTableContext): TableInfo[];
    /**
     * 从表名上下文和父上下文中提取表信息
     * @param tableNameCtx 表名上下文
     * @param parentCtx 父上下文（用于提取别名）
     * @returns 表信息
     */
    static extractTableInfo(tableNameCtx: TableNameContext, parentCtx?: TableSourceItemContext): TableInfo | null;
    /**
     * 提取简单表名（不带数据库前缀）
     * @param tableNameCtx 表名上下文
     * @returns 简单表名
     */
    static extractSimpleName(tableNameCtx: TableNameContext): string;
    /**
     * 从 TableSources 提取表名列表（包含别名）
     * 用于 UPDATE 语句
     * @param tableSources 表源列表上下文
     * @returns 表信息数组
     */
    static extractFromTableSources(tableSources: TableSourcesContext): TableInfo[];
}
