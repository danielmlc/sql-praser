"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantFilterListener = void 0;
const base_listener_1 = require("../base/base-listener");
const antlr4ng_1 = require("antlr4ng");
// 动态导入生成的 ANTLR4 Listener（避免编译时依赖）
const path = require('path');
const fs = require('fs');
let MySqlParserListener;
try {
    // 尝试从 lib 目录加载
    const libPath = path.join(__dirname, '../../../lib/generated/mysql');
    const libListenerPath = path.join(libPath, 'MySqlParserListener.js');
    if (fs.existsSync(libListenerPath)) {
        const libModule = require(libListenerPath);
        MySqlParserListener = libModule.MySqlParserListener || libModule.default?.MySqlParserListener;
    }
    // 如果 lib 中没有，尝试从 generated 目录加载（用于开发环境）
    if (!MySqlParserListener) {
        const genPath = path.join(__dirname, '../../../generated/mysql');
        const genListenerPath = path.join(genPath, 'MySqlParserListener');
        if (fs.existsSync(genListenerPath + '.ts')) {
            const genModule = require(genListenerPath);
            MySqlParserListener = genModule.MySqlParserListener || genModule.default?.MySqlParserListener;
        }
    }
    if (!MySqlParserListener) {
        throw new Error('MySqlParserListener not found');
    }
}
catch (e) {
    // 占位符
    MySqlParserListener = class {
        enterEveryRule = () => { };
        exitEveryRule = () => { };
        visitTerminal = () => { };
        visitErrorNode = () => { };
    };
}
/**
 * 租户条件 Listener
 * 负责在 SQL 中添加租户过滤条件
 */
class TenantFilterListener extends base_listener_1.BaseListener {
    name = 'TenantFilterListener';
    cteTableNames = new Set();
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
    process(ast, context) {
        const tenantInfo = context.sharedState.get('tenantInfo');
        if (!tenantInfo?.tenant) {
            return; // 没有租户信息，不处理
        }
        const { rewriter, tokenStream, parseTree } = context;
        const tenantId = tenantInfo.tenant;
        const tenantField = this.config.tenantField;
        // 创建 ANTLR4 Listener 来遍历语法树
        const antlrListener = new TenantConditionListener(rewriter, tokenStream, tenantId, tenantField, this.config.targetDatabases, this.cteTableNames);
        // 使用 ParseTreeWalker 遍历语法树
        antlr4ng_1.ParseTreeWalker.DEFAULT.walk(antlrListener, parseTree);
    }
    /**
     * 清理 CTE 表名集合
     */
    onCleanup() {
        this.cteTableNames.clear();
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
        // 将原型方法显式赋值给实例，以覆盖基类的 undefined 属性
        // 注意：必须使用 Object.getPrototypeOf 从原型链获取方法，因为基类中的属性是 undefined
        const proto = Object.getPrototypeOf(this);
        this.enterCteName = proto.enterCteName?.bind(this);
        this.enterInsertStatement = proto.enterInsertStatement?.bind(this);
        this.enterQuerySpecification = proto.enterQuerySpecification?.bind(this);
        this.enterUpdateStatement = proto.enterUpdateStatement?.bind(this);
        this.enterDeleteStatement = proto.enterDeleteStatement?.bind(this);
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
     * 实现：注入租户列和值
     */
    enterInsertStatement(ctx) {
        // 1. 获取表名
        const tableName = ctx.tableName();
        if (!tableName) {
            return;
        }
        const fullTableName = this.extractTableName(tableName);
        if (!this.shouldInjectTenant(fullTableName)) {
            return; // 不需要注入租户字段
        }
        // 2. 检查是否是 INSERT ... SET 语法（不需要列列表）
        if (ctx.SET()) {
            this.handleInsertSet(ctx);
            return;
        }
        // 3. 处理 INSERT INTO ... (columns) VALUES ... 语法
        const columnsList = ctx.fullColumnNameList();
        const insertValue = ctx.insertStatementValue();
        if (!columnsList || !insertValue) {
            return; // 没有列列表或值，可能是 INSERT ... SELECT
        }
        // 4. 在列列表的开头插入租户字段
        // 获取左括号 token
        const leftBracket = ctx.LR_BRACKET(0);
        if (leftBracket) {
            // TerminalNode 有 symbol 属性来访问 Token
            const bracketToken = leftBracket.symbol;
            if (bracketToken) {
                // 在左括号后插入: tenant,
                this.rewriter.insertAfter(bracketToken.tokenIndex, ` ${this.tenantField},`);
            }
        }
        // 5. 在每个 VALUES 的左括号后插入租户值
        const valueLists = insertValue.expressionsWithDefaults();
        for (const valueList of valueLists) {
            if (valueList && valueList.start) {
                const valueStartToken = valueList.start;
                // valueList.start 是表达式的第一个 token，不是左括号
                // 需要找到左括号的位置
                const leftParenIndex = valueStartToken.tokenIndex - 1;
                const leftParenToken = this.tokenStream.get(leftParenIndex);
                if (leftParenToken && leftParenToken.text === '(') {
                    this.rewriter.insertAfter(leftParenIndex, ` '${this.tenantId}',`);
                }
            }
        }
    }
    /**
     * 处理 INSERT ... SET 语法
     */
    handleInsertSet(ctx) {
        // 在第一个 updatedElement 后面添加租户字段设置
        const elements = ctx.updatedElement();
        if (elements && elements.length > 0) {
            const lastElement = elements[elements.length - 1];
            if (lastElement && lastElement.stop) {
                // 在最后一个元素后添加: , tenant = 'tenant_id'
                this.rewriter.insertAfter(lastElement.stop, `, ${this.tenantField} = '${this.tenantId}'`);
            }
        }
    }
    /**
     * 处理 SELECT 语句
     */
    enterQuerySpecification(ctx) {
        console.log('[DEBUG] enterQuerySpecification called');
        // 1. 收集表信息（FROM 和 JOIN）
        const tableInfo = this.collectTablesFromQuery(ctx);
        console.log('[DEBUG] tableInfo:', tableInfo);
        console.log('[DEBUG] tableInfo.tables:', tableInfo?.tables);
        if (tableInfo.tables.length === 0) {
            console.log('[DEBUG] No tables found, skipping');
            return; // 没有表，不需要处理
        }
        // 2. 构建租户条件
        const conditions = [];
        for (const table of tableInfo.tables) {
            console.log('[DEBUG] Checking table:', table, 'shouldInject:', this.shouldInjectTenant(table.fullName));
            if (this.shouldInjectTenant(table.fullName)) {
                const alias = table.alias || table.simpleName;
                conditions.push(`${alias}.${this.tenantField} = '${this.tenantId}'`);
            }
        }
        console.log('[DEBUG] conditions:', conditions);
        if (conditions.length === 0) {
            return; // 没有需要注入的表
        }
        const tenantCondition = conditions.join(' AND ');
        console.log('[DEBUG] tenantCondition:', tenantCondition);
        // 3. 检查是否有 WHERE 子句
        const whereClause = ctx.whereClause; // 不是函数，是属性
        console.log('[DEBUG] has whereClause:', !!whereClause);
        if (whereClause) {
            // 已有 WHERE，在条件后添加 AND
            const whereToken = whereClause.WHERE();
            if (whereToken && whereToken.symbol) {
                // 获取 WHERE 后的 expression
                const expression = whereClause.expression();
                if (expression && expression.stop) {
                    console.log('[DEBUG] Adding AND after expression, tokenIndex:', expression.stop.tokenIndex);
                    // 在最后一个表达式 token 后添加 AND 条件
                    this.rewriter.insertAfter(expression.stop.tokenIndex, ` AND ${tenantCondition}`);
                }
            }
        }
        else {
            // 没有 WHERE，需要创建 WHERE 子句
            // 找到插入位置：在 GROUP BY、HAVING、ORDER BY、LIMIT 之前
            let insertPosition = -1;
            const groupByClause = ctx.groupByClause();
            const havingClause = ctx.havingClause();
            const orderByClause = ctx.orderByClause();
            const limitClause = ctx.limitClause();
            console.log('[DEBUG] Clauses - groupBy:', !!groupByClause, 'having:', !!havingClause, 'orderBy:', !!orderByClause, 'limit:', !!limitClause);
            console.log('[DEBUG] ctx.stop:', ctx.stop, 'ctx.start:', ctx.start);
            // 没有其他子句，在 FROM 子句后面添加 WHERE
            // 找到 FROM 子句的结束位置
            const fromClause = ctx.fromClause();
            if (fromClause && fromClause.stop) {
                console.log('[DEBUG] fromClause.stop:', fromClause.stop);
                console.log('[DEBUG] fromClause.stop.tokenIndex:', fromClause.stop.tokenIndex);
                console.log('[DEBUG] fromClause.stop.text:', fromClause.stop.text);
                console.log('[DEBUG] rewriter:', this.rewriter);
                console.log('[DEBUG] tokenStream:', this.tokenStream);
                this.rewriter.insertAfter(fromClause.stop.tokenIndex, ` WHERE ${tenantCondition}`);
                console.log('[DEBUG] WHERE condition inserted');
            }
        }
    }
    /**
     * 收集查询中的表信息
     */
    collectTablesFromQuery(ctx) {
        const tables = [];
        try {
            // 收集 FROM 子句中的表
            const fromClause = ctx.fromClause();
            if (fromClause) {
                const fromTables = this.collectTablesFromFromClause(fromClause);
                tables.push(...fromTables);
            }
            // 收集 JOIN 子句中的表
            // 注意：joinClause 可能不是函数，需要直接访问属性
            const joinClause = ctx.joinClause;
            if (joinClause) {
                const joinedTables = this.collectTablesFromJoinClause(joinClause);
                tables.push(...joinedTables);
            }
        }
        catch (e) {
            console.error('[ERROR] collectTablesFromQuery error:', e);
        }
        return { tables };
    }
    /**
     * 从 FROM 子句收集表
     */
    collectTablesFromFromClause(fromClause) {
        const tables = [];
        // FROM 子句的结构: FROM (TableSources)
        // TableSources 包含一个或多个 TableSourceBase
        const tableSources = fromClause.tableSources?.();
        if (!tableSources) {
            return tables;
        }
        // 遍历 TableSources 中的每个 TableSourceBase
        for (let i = 0; i < tableSources.getChildCount(); i++) {
            const tableSourceBase = tableSources.getChild(i);
            if (!tableSourceBase) {
                continue;
            }
            console.log('[DEBUG] tableSourceBase[' + i + '] getText:', tableSourceBase.getText?.());
            console.log('[DEBUG] tableSourceBase[' + i + '] children:', tableSourceBase.getChildCount?.());
            // 遍历 tableSourceBase 的子节点来查找表名
            for (let j = 0; j < (tableSourceBase.getChildCount?.() || 0); j++) {
                const child = tableSourceBase.getChild(j);
                if (!child) {
                    continue;
                }
                const childText = child.getText ? child.getText() : '';
                console.log('[DEBUG] child[' + j + ']:', childText);
                // 检查子节点是否包含点号（表明可能是表名）
                if (childText.includes('.')) {
                    const fullName = childText;
                    const simpleName = childText.split('.').pop();
                    tables.push({ fullName, simpleName });
                    break; // 找到表名后跳出内层循环
                }
            }
        }
        return tables;
    }
    /**
     * 从 JOIN 子句收集表
     */
    collectTablesFromJoinClause(joinClause) {
        const tables = [];
        // JOIN 子句可能包含多个 JOIN
        for (let i = 0; i < joinClause.getChildCount(); i++) {
            const child = joinClause.getChild(i);
            if (!child) {
                continue;
            }
            // 查找表名
            const tableName = child.tableName();
            if (tableName) {
                const fullName = this.extractTableName(tableName);
                const simpleName = this.extractSimpleName(tableName);
                const tableInfo = { fullName, simpleName };
                // 查找别名
                const alias = child.alias();
                if (alias) {
                    tableInfo.alias = alias.getText();
                }
                tables.push(tableInfo);
            }
        }
        return tables;
    }
    /**
     * 提取简单表名（不带数据库前缀）
     */
    extractSimpleName(tableNameCtx) {
        if (!tableNameCtx) {
            return '';
        }
        const fullId = tableNameCtx.fullId();
        if (!fullId) {
            return tableNameCtx.getText() || '';
        }
        const text = fullId.getText() || tableNameCtx.getText() || '';
        // 如果包含点号，取最后一部分
        if (text.includes('.')) {
            return text.split('.').pop() || text;
        }
        return text;
    }
    /**
     * 处理 UPDATE 语句
     */
    enterUpdateStatement(ctx) {
        // 1. 获取表名
        const tableName = ctx.tableName();
        if (!tableName) {
            return;
        }
        const fullName = this.extractTableName(tableName);
        if (!this.shouldInjectTenant(fullName)) {
            return;
        }
        const simpleName = this.extractSimpleName(tableName);
        const tenantCondition = `${simpleName}.${this.tenantField} = '${this.tenantId}'`;
        // 2. 检查是否有 WHERE 子句
        const whereClause = ctx.whereClause();
        if (whereClause) {
            // 已有 WHERE，在条件后添加 AND
            const expression = whereClause.expression();
            if (expression && expression.stop) {
                this.rewriter.insertAfter(expression.stop.tokenIndex, ` AND ${tenantCondition}`);
            }
        }
        else {
            // 没有 WHERE，需要创建 WHERE 子句
            // 找到插入位置：在 ORDER BY 或 LIMIT 之前
            let insertPosition = -1;
            const orderByClause = ctx.orderByClause();
            const limitClause = ctx.limitClause();
            if (orderByClause && orderByClause.start) {
                insertPosition = orderByClause.start.tokenIndex - 1;
            }
            else if (limitClause && limitClause.start) {
                insertPosition = limitClause.start.tokenIndex - 1;
            }
            if (insertPosition >= 0) {
                this.rewriter.insertBefore(insertPosition, ` WHERE ${tenantCondition}`);
            }
            else {
                // 没有其他子句，在语句末尾添加 WHERE
                if (ctx.stop) {
                    this.rewriter.insertAfter(ctx.stop.tokenIndex, ` WHERE ${tenantCondition}`);
                }
            }
        }
    }
    /**
     * 处理 DELETE 语句
     */
    enterDeleteStatement(ctx) {
        // 1. 获取表名
        const tableName = ctx.tableName();
        if (!tableName) {
            return;
        }
        const fullName = this.extractTableName(tableName);
        if (!this.shouldInjectTenant(fullName)) {
            return;
        }
        const simpleName = this.extractSimpleName(tableName);
        const tenantCondition = `${simpleName}.${this.tenantField} = '${this.tenantId}'`;
        // 2. 检查是否有 WHERE 子句
        const whereClause = ctx.whereClause();
        if (whereClause) {
            // 已有 WHERE，在条件后添加 AND
            const expression = whereClause.expression();
            if (expression && expression.stop) {
                this.rewriter.insertAfter(expression.stop.tokenIndex, ` AND ${tenantCondition}`);
            }
        }
        else {
            // 没有 WHERE，需要创建 WHERE 子句
            // 找到插入位置：在 ORDER BY 或 LIMIT 之前
            let insertPosition = -1;
            const orderByClause = ctx.orderByClause();
            const limitClause = ctx.limitClause();
            if (orderByClause && orderByClause.start) {
                insertPosition = orderByClause.start.tokenIndex - 1;
            }
            else if (limitClause && limitClause.start) {
                insertPosition = limitClause.start.tokenIndex - 1;
            }
            if (insertPosition >= 0) {
                this.rewriter.insertBefore(insertPosition, ` WHERE ${tenantCondition}`);
            }
            else {
                // 没有其他子句，在语句末尾添加 WHERE
                if (ctx.stop) {
                    this.rewriter.insertAfter(ctx.stop.tokenIndex, ` WHERE ${tenantCondition}`);
                }
            }
        }
    }
    /**
     * 从 tableName 上下文中提取完整的表名（可能包含数据库前缀）
     */
    extractTableName(tableNameCtx) {
        if (!tableNameCtx) {
            return '';
        }
        const fullId = tableNameCtx.fullId();
        if (!fullId) {
            // 使用 getText() 方法获取文本
            return tableNameCtx.getText() || '';
        }
        // 使用 fullId 的 getText() 方法
        return fullId.getText() || tableNameCtx.getText() || '';
    }
    /**
     * 判断表是否需要注入租户字段
     * 规则：表名匹配配置的前缀或完整库名列表
     */
    shouldInjectTenant(fullTableName) {
        if (!fullTableName) {
            return false;
        }
        // 检查是否是 CTE 表（CTE 表不需要注入租户字段）
        if (this.cteTableNames.has(fullTableName)) {
            return false;
        }
        // 检查完整库名匹配
        if (this.targetDatabases.fullNames?.includes(fullTableName)) {
            return true;
        }
        // 检查前缀匹配
        if (this.targetDatabases.prefixes) {
            for (const prefix of this.targetDatabases.prefixes) {
                // 提取数据库部分（如果有点号）
                let databasePart = fullTableName;
                if (fullTableName.includes('.')) {
                    databasePart = fullTableName.split('.')[0];
                }
                // 检查数据库部分是否以 prefix 开头
                // 例如：tnt_ma.users 中的 tnt_ma 应该匹配前缀 tnt_
                if (databasePart.startsWith(prefix) || databasePart === prefix) {
                    return true;
                }
            }
        }
        return false;
    }
}
