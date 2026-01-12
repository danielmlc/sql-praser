"use strict";
/**
 * 表信息收集工具类
 * 统一处理从 ANTLR4 语法树中提取表信息的逻辑
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableInfoCollector = void 0;
/**
 * 表信息收集器
 * 提供静态方法从各种上下文中提取表信息
 */
class TableInfoCollector {
    /**
     * 从 FROM 子句收集表信息
     * @param fromClause FROM 子句上下文
     * @returns 表信息数组
     */
    static collectFromFromClause(fromClause) {
        const tables = [];
        const tableSources = fromClause.tableSources?.();
        if (!tableSources) {
            return tables;
        }
        for (let i = 0; i < tableSources.getChildCount(); i++) {
            const tableSourceBase = tableSources.getChild(i);
            if (!tableSourceBase) {
                continue;
            }
            // 遍历子节点
            for (let j = 0; j < (tableSourceBase.getChildCount?.() || 0); j++) {
                const child = tableSourceBase.getChild(j);
                if (!child) {
                    continue;
                }
                // 检查是否是 JOIN 上下文（先检查 JOIN，避免重复收集表）
                const childName = child.constructor?.name || '';
                if (childName.includes('Join')) {
                    const joinedTables = this.collectFromJoinContext(child);
                    tables.push(...joinedTables);
                }
                else if (child.tableName) {
                    // 检查是否是 AtomTableItemContext
                    const tableNameCtx = child.tableName?.();
                    if (tableNameCtx) {
                        const tableInfo = this.extractTableInfo(tableNameCtx, child);
                        if (tableInfo) {
                            tables.push(tableInfo);
                        }
                    }
                }
            }
        }
        return tables;
    }
    /**
     *从 TableSources 收集表信息
     * @param tableSources 表源列表上下文
     * @returns 表信息数组
     */
    static collectFromTableSources(tableSources) {
        const tables = [];
        for (let i = 0; i < tableSources.getChildCount(); i++) {
            const tableSourceBase = tableSources.getChild(i);
            if (!tableSourceBase) {
                continue;
            }
            for (let j = 0; j < (tableSourceBase.getChildCount?.() || 0); j++) {
                const child = tableSourceBase.getChild(j);
                if (!child) {
                    continue;
                }
                // 检查是否是表名上下文
                if (child.tableName) {
                    const tableNameCtx = child.tableName?.();
                    if (tableNameCtx) {
                        const tableInfo = this.extractTableInfo(tableNameCtx, child);
                        if (tableInfo) {
                            tables.push(tableInfo);
                            break; // 找到表名后跳出内层循环
                        }
                    }
                }
                // 检查是否是 JOIN 上下文
                const childName = child.constructor?.name || '';
                if (childName.includes('Join')) {
                    const joinedTables = this.collectFromJoinContext(child);
                    tables.push(...joinedTables);
                }
            }
        }
        return tables;
    }
    /**
     * 从 JOIN 上下文收集表信息（支持嵌套 JOIN）
     * @param joinCtx JOIN 上下文
     * @returns 表信息数组
     */
    static collectFromJoinContext(joinCtx) {
        const tables = [];
        const seenKeys = new Set(); // 用于去重
        const collectFromContext = (ctx) => {
            for (let i = 0; i < (ctx.getChildCount?.() || 0); i++) {
                const child = ctx.getChild(i);
                if (!child) {
                    continue;
                }
                if (child.tableName) {
                    const tableNameCtx = child.tableName?.();
                    if (tableNameCtx) {
                        const tableInfo = this.extractTableInfo(tableNameCtx, child);
                        if (tableInfo) {
                            // 使用 fullName 和 alias 作为唯一键进行去重
                            const key = tableInfo.alias || `${tableInfo.fullName}.${tableInfo.simpleName}`;
                            if (!seenKeys.has(key)) {
                                seenKeys.add(key);
                                tables.push(tableInfo);
                            }
                        }
                    }
                }
                // 递归处理嵌套的 JOIN
                const childName = child.constructor?.name || '';
                if (childName.includes('Join')) {
                    collectFromContext(child);
                }
            }
        };
        collectFromContext(joinCtx);
        return tables;
    }
    /**
     * 从表名上下文和父上下文中提取表信息
     * @param tableNameCtx 表名上下文
     * @param parentCtx 父上下文（用于提取别名）
     * @returns 表信息
     */
    static extractTableInfo(tableNameCtx, parentCtx) {
        if (!tableNameCtx) {
            return null;
        }
        const fullName = tableNameCtx.getText() || '';
        const simpleName = this.extractSimpleName(tableNameCtx);
        const tableInfo = { fullName, simpleName };
        // 提取别名
        if (parentCtx) {
            if (parentCtx._alias) {
                tableInfo.alias = parentCtx._alias.getText();
            }
            else if (parentCtx.alias) {
                tableInfo.alias = parentCtx.alias.getText();
            }
            else if (parentCtx.uid) {
                // uid 可能是方法或属性
                const uid = typeof parentCtx.uid === 'function' ? parentCtx.uid() : parentCtx.uid;
                if (uid) {
                    tableInfo.alias = uid.getText();
                }
            }
        }
        return tableInfo;
    }
    /**
     * 提取简单表名（不带数据库前缀）
     * @param tableNameCtx 表名上下文
     * @returns 简单表名
     */
    static extractSimpleName(tableNameCtx) {
        if (!tableNameCtx) {
            return '';
        }
        const text = tableNameCtx.getText() || '';
        if (text.includes('.')) {
            return text.split('.').pop() || text;
        }
        return text;
    }
    /**
     * 从 TableSources 提取表名列表（包含别名）
     * 用于 UPDATE 语句
     * @param tableSources 表源列表上下文
     * @returns 表信息数组
     */
    static extractFromTableSources(tableSources) {
        const tables = [];
        for (let i = 0; i < tableSources.getChildCount(); i++) {
            const tableSourceBase = tableSources.getChild(i);
            if (!tableSourceBase) {
                continue;
            }
            for (let j = 0; j < (tableSourceBase.getChildCount?.() || 0); j++) {
                const child = tableSourceBase.getChild(j);
                if (!child) {
                    continue;
                }
                if (child.tableName) {
                    const tableNameCtx = child.tableName?.();
                    if (tableNameCtx) {
                        const tableInfo = this.extractTableInfo(tableNameCtx, child);
                        if (tableInfo) {
                            tables.push(tableInfo);
                            break; // 找到表名后跳出内层循环
                        }
                    }
                }
            }
        }
        return tables;
    }
}
exports.TableInfoCollector = TableInfoCollector;
