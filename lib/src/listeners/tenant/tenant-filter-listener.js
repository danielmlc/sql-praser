"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantFilterListener = void 0;
const base_listener_1 = require("../base/base-listener");
const antlr4ng_1 = require("antlr4ng");
const table_info_collector_1 = require("../../utils/table-info-collector");
const listener_binder_1 = require("../../utils/listener-binder");
const antlr4_loader_1 = require("../../utils/antlr4-loader");
const tenant_id_validator_1 = require("../../utils/tenant-id-validator");
const types_1 = require("../../core/types");
// 动态导入生成的 ANTLR4 Listener（避免编译时依赖）
const { module: MySqlParserListener, success: listenerLoaded } = antlr4_loader_1.Antlr4Loader.loadModule('MySqlParserListener', 'MySqlParserListener', {
    throwOnError: true,
    callerPath: __dirname,
});
if (!listenerLoaded) {
    throw new Error('MySqlParserListener failed to load. Please run "pnpm run generate:parser" first.');
}
/**
 * 租户条件 Listener
 * 负责在 SQL 中添加租户过滤条件
 */
class TenantFilterListener extends base_listener_1.BaseListener {
    name = 'TenantFilterListener';
    constructor(config) {
        super(config);
    }
    /**
     * 获取优先级
     * 租户过滤应该优先级较高（数字小），在库名改写之后执行
     */
    getPriority() {
        return 100;
    }
    /**
     * 处理 SQL（使用 ANTLR4 Listener 模式）
     */
    process(_ast, context) {
        const tenantInfo = context.sharedState.get(types_1.SHARED_STATE_KEYS.TENANT_INFO);
        if (!tenantInfo?.tenant) {
            return; // 没有租户信息，不处理
        }
        const { rewriter, tokenStream, parseTree } = context;
        const rawTenantId = tenantInfo.tenant;
        const tenantField = this.config.tenantField;
        // 验证并转义租户 ID（防止 SQL 注入）
        let escapedTenantId;
        try {
            escapedTenantId = tenant_id_validator_1.TenantIdValidator.escapeForSql(rawTenantId);
        }
        catch (error) {
            throw new Error(`Invalid tenant ID in tenant-filter-listener: ${error instanceof Error ? error.message : String(error)}`);
        }
        // 每次调用创建新的 Set，避免跨调用的共享可变状态
        const cteTableNames = new Set();
        // 创建 ANTLR4 Listener 来遍历语法树
        const antlrListener = new TenantConditionListener(rewriter, tokenStream, escapedTenantId, tenantField, this.config.targetDatabases, cteTableNames);
        // 使用 ListenerBinder 自动绑定方法
        listener_binder_1.ListenerBinder.bindAllEnterExit(antlrListener);
        // 使用 ParseTreeWalker 遍历语法树
        // ParseTreeWalker.DEFAULT.walk 的第二个参数类型为 any，需要保留断言
        antlr4ng_1.ParseTreeWalker.DEFAULT.walk(antlrListener, parseTree);
    }
}
exports.TenantFilterListener = TenantFilterListener;
/**
 * ANTLR4 Listener 实现
 * 用于遍历 MySQL 语法树并注入租户条件
 */
class TenantConditionListener extends MySqlParserListener {
    rewriter;
    tokenStream;
    tenantId;
    tenantField;
    targetDatabases;
    cteTableNames;
    constructor(rewriter, tokenStream, tenantId, tenantField, targetDatabases, cteTableNames) {
        super();
        this.rewriter = rewriter;
        this.tokenStream = tokenStream;
        this.tenantId = tenantId;
        this.tenantField = tenantField;
        this.targetDatabases = targetDatabases;
        this.cteTableNames = cteTableNames;
    }
    /**
     * 收集 CTE 表名
     */
    enterCteName(ctx) {
        const tableName = ctx.getText();
        if (tableName) {
            this.cteTableNames.add(tableName);
        }
    }
    /**
     * 处理 INSERT 语句
     */
    enterInsertStatement(ctx) {
        const tableName = ctx.tableName?.();
        if (!tableName) {
            return;
        }
        const fullTableName = tableName.getText();
        if (!this.shouldInjectTenant(fullTableName)) {
            return;
        }
        // 检查是否是 INSERT ... SET 语法
        if (ctx.SET?.()) {
            this.handleInsertSet(ctx);
            return;
        }
        // 处理 INSERT INTO ... (columns) VALUES ... 语法
        const columnsList = ctx.fullColumnNameList?.();
        const insertValue = ctx.insertStatementValue?.();
        if (!columnsList || !insertValue) {
            return;
        }
        // 在列列表的开头插入租户字段
        const leftBracket = ctx.LR_BRACKET?.(0);
        if (leftBracket) {
            const bracketToken = leftBracket.symbol;
            if (bracketToken) {
                this.rewriter.insertAfter(bracketToken.tokenIndex, ` ${this.tenantField},`);
            }
        }
        // 在每个 VALUES 的左括号后插入租户值
        const valueLists = insertValue.expressionsWithDefaults?.();
        if (valueLists) {
            for (const valueList of valueLists) {
                if (valueList && valueList.start) {
                    const valueStartToken = valueList.start;
                    const leftParenIndex = valueStartToken.tokenIndex - 1;
                    const leftParenToken = this.tokenStream.get(leftParenIndex);
                    if (leftParenToken && leftParenToken.text === '(') {
                        this.rewriter.insertAfter(leftParenIndex, ` '${this.tenantId}',`);
                    }
                }
            }
        }
    }
    /**
     * 处理 INSERT ... SET 语法
     */
    handleInsertSet(ctx) {
        const elements = ctx.updatedElement?.();
        if (elements && elements.length > 0) {
            const lastElement = elements[elements.length - 1];
            if (lastElement?.stop) {
                const condition = `${this.tenantField} = '${this.tenantId}'`;
                this.rewriter.insertAfter(lastElement.stop.tokenIndex, `, ${condition}`);
            }
        }
    }
    /**
     * 构建租户条件表达式
     * @param tables 表信息数组
     * @returns 租户条件字符串
     */
    buildTenantConditions(tables) {
        const conditions = [];
        for (const table of tables) {
            if (this.shouldInjectTenant(table.fullName)) {
                const alias = table.alias || table.simpleName;
                conditions.push(`${alias}.${this.tenantField} = '${this.tenantId}'`);
            }
        }
        return conditions.join(' AND ');
    }
    /**
     * 注入 WHERE 子句
     * @param expressionCtx 表达式上下文
     * @param whereToken WHERE token
     * @param tenantCondition 租户条件
     */
    injectWhereClause(expressionCtx, whereToken, tenantCondition) {
        if (expressionCtx?.stop) {
            // 已有 WHERE 子句，使用 AND 连接
            this.rewriter.insertAfter(expressionCtx.stop.tokenIndex, ` AND ${tenantCondition}`);
        }
        else if (whereToken.stop) {
            // 没有 WHERE 子句，添加新的 WHERE
            this.rewriter.insertAfter(whereToken.stop.tokenIndex, ` WHERE ${tenantCondition}`);
        }
    }
    /**
     * 处理 SELECT 语句
     */
    enterQuerySpecification(ctx) {
        this.handleQuerySpecification(ctx);
    }
    /**
     * 处理 UNION 等查询中的 SELECT 语句
     * UNION 查询使用 querySpecificationNointo 节点
     */
    enterQuerySpecificationNointo(ctx) {
        this.handleQuerySpecification(ctx);
    }
    /**
     * 统一的 SELECT 语句处理逻辑
     */
    handleQuerySpecification(ctx) {
        const fromClause = ctx.fromClause?.();
        if (!fromClause) {
            return;
        }
        const tables = table_info_collector_1.TableInfoCollector.collectFromFromClause(fromClause);
        if (tables.length === 0) {
            return;
        }
        const tenantCondition = this.buildTenantConditions(tables);
        if (tenantCondition.length === 0) {
            return;
        }
        const expression = fromClause.expression?.();
        this.injectWhereClause(expression, fromClause, tenantCondition);
    }
    /**
     * 处理 UPDATE 语句
     */
    enterUpdateStatement(ctx) {
        const singleUpdate = ctx.singleUpdateStatement?.();
        if (!singleUpdate) {
            return;
        }
        const tableSources = singleUpdate.tableSources?.();
        if (!tableSources) {
            return;
        }
        const tables = table_info_collector_1.TableInfoCollector.extractFromTableSources(tableSources);
        if (tables.length === 0) {
            return;
        }
        const tenantCondition = this.buildTenantConditions(tables);
        if (tenantCondition.length === 0) {
            return;
        }
        const expression = singleUpdate.expression?.();
        this.injectWhereClause(expression, singleUpdate, tenantCondition);
    }
    /**
     * 处理 DELETE 语句
     */
    enterDeleteStatement(ctx) {
        // 处理 singleDeleteStatement
        const singleDelete = ctx.singleDeleteStatement?.();
        if (singleDelete) {
            this.handleSingleDelete(singleDelete);
            return;
        }
        // 处理 multipleDeleteStatement (DELETE ... FROM ... JOIN ...)
        const multipleDelete = ctx.multipleDeleteStatement?.();
        if (multipleDelete) {
            this.handleMultipleDelete(multipleDelete);
        }
    }
    /**
     * 处理单表 DELETE 语句
     */
    handleSingleDelete(singleDelete) {
        const tableName = singleDelete.tableName?.();
        if (!tableName) {
            return;
        }
        const fullName = tableName.getText();
        if (!this.shouldInjectTenant(fullName)) {
            return;
        }
        const simpleName = table_info_collector_1.TableInfoCollector.extractSimpleName(tableName);
        const tenantCondition = `${simpleName}.${this.tenantField} = '${this.tenantId}'`;
        const expression = singleDelete.expression?.();
        this.injectWhereClause(expression, singleDelete, tenantCondition);
    }
    /**
     * 处理多表 DELETE 语句 (DELETE ... FROM ... JOIN ...)
     */
    handleMultipleDelete(ctx) {
        const tableSources = ctx.tableSources?.();
        if (!tableSources) {
            return;
        }
        const tables = table_info_collector_1.TableInfoCollector.collectFromTableSources(tableSources);
        if (tables.length === 0) {
            return;
        }
        const tenantCondition = this.buildTenantConditions(tables);
        if (tenantCondition.length === 0) {
            return;
        }
        const expression = ctx.expression?.();
        this.injectWhereClause(expression, ctx, tenantCondition);
    }
    /**
     * 判断表是否需要注入租户字段
     * fullNames 和 prefixes 都是配置库名
     */
    shouldInjectTenant(fullTableName) {
        if (!fullTableName) {
            return false;
        }
        // 检查是否是 CTE 表
        if (this.cteTableNames.has(fullTableName)) {
            return false;
        }
        const databasePart = this.extractDatabasePart(fullTableName);
        if (!databasePart) {
            return false;
        }
        // 检查完整库名匹配
        if (this.targetDatabases.fullNames?.includes(databasePart)) {
            return true;
        }
        // 检查前缀匹配
        return this.matchesPrefix(databasePart);
    }
    /**
     * 从完整表名中提取库名部分
     */
    extractDatabasePart(fullTableName) {
        if (fullTableName.includes('.')) {
            return fullTableName.split('.')[0];
        }
        // 使用配置的默认库名
        return this.targetDatabases.defaultDatabase || null;
    }
    /**
     * 检查库名是否匹配配置的前缀
     */
    matchesPrefix(databasePart) {
        if (!this.targetDatabases.prefixes) {
            return false;
        }
        return this.targetDatabases.prefixes.some(prefix => databasePart.startsWith(prefix) || databasePart === prefix);
    }
}
