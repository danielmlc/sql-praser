import {
  AST,
  Binary,
  ExpressionValue,
  ColumnRef,
  From,
  Select,
  Insert_Replace,
  Update,
  Delete,
  ValueExpr,
  ExprList,
  SetList,
  TableExpr,
  Join,
  BaseFrom,
  OrderBy,
  With,
} from 'node-sql-parser';
import {
  TenantCondition,
  TransformContext,
  TableInfo,
  ExtendedAST,
  ConditionBuilder,
  TargetDatabaseConfig,
} from './types';
import { AstTransformError } from './errors';

/**
 * AST转换器
 * 负责遍历和修改抽象语法树，添加租户过滤条件
 */
export class AstTransformer {
  /**
   * 检查数据库名是否需要添加租户条件
   * @param dbName 数据库名
   * @param targetDatabaseConfig 目标库配置
   * @returns 是否需要处理
   * @throws ConfigError 当没有配置默认库且遇到无库名表时
   */
  private static isTargetDatabase(
    dbName: string | null | undefined,
    targetDatabaseConfig?: TargetDatabaseConfig,
  ): boolean {
    if (!targetDatabaseConfig) {
      throw new Error('目标数据库配置不能为空');
    }

    // 如果没有数据库名，必须使用默认库名进行判断
    if (!dbName) {
      if (!targetDatabaseConfig.defaultDatabase) {
        throw new Error(
          '遇到无库名表，但未配置默认库名(defaultDatabase)，请在配置中设置defaultDatabase',
        );
      }
      // 使用默认库名继续判断
      dbName = targetDatabaseConfig.defaultDatabase;
    }

    // 检查完整库名匹配
    if (targetDatabaseConfig.fullNames.includes(dbName)) {
      return true;
    }

    // 检查前缀匹配
    return targetDatabaseConfig.prefixes.some((prefix) =>
      dbName.startsWith(prefix),
    );
  }

  /**
   * 过滤需要添加租户条件的表
   * @param tableInfo 表信息
   * @param targetDatabaseConfig 目标库配置
   * @returns 是否需要处理此表
   */
  private static shouldProcessTable(
    tableInfo: TableInfo,
    targetDatabaseConfig?: TargetDatabaseConfig,
  ): boolean {
    return this.isTargetDatabase(tableInfo.db, targetDatabaseConfig);
  }

  /**
   * 检查INSERT语句的目标表是否需要处理
   * @param insertAst INSERT语句AST
   * @param targetDatabaseConfig 目标库配置
   * @returns 是否需要处理
   */
  private static shouldProcessInsertTable(
    insertAst: Insert_Replace,
    targetDatabaseConfig?: TargetDatabaseConfig,
  ): boolean {
    if (!insertAst.table || insertAst.table.length === 0) {
      return false;
    }

    const targetTable = insertAst.table[0];
    if ('table' in targetTable && targetTable.table) {
      const tableInfo: TableInfo = {
        name: targetTable.table,
        alias: targetTable.as,
        db: targetTable.db,
        fullName: targetTable.db
          ? `${targetTable.db}.${targetTable.table}`
          : targetTable.table,
      };
      return this.shouldProcessTable(tableInfo, targetDatabaseConfig);
    }

    return true; // 如果无法确定表信息，默认处理
  }
  /**
   * 转换AST，添加租户过滤条件
   * @param ast 抽象语法树
   * @param tenantCondition 租户条件
   * @param targetDatabaseConfig 目标库配置
   * @returns 转换后的AST
   */
  static transform(
    ast: AST | AST[],
    tenantCondition: TenantCondition,
    targetDatabaseConfig?: TargetDatabaseConfig,
  ): AST | AST[] {
    try {
      if (Array.isArray(ast)) {
        return ast.map((item) =>
          this.transformSingleAst(item, tenantCondition, targetDatabaseConfig),
        );
      }
      return this.transformSingleAst(
        ast,
        tenantCondition,
        targetDatabaseConfig,
      );
    } catch (error) {
      throw new AstTransformError(
        `AST转换失败: ${error instanceof Error ? error.message : error}`,
        JSON.stringify(ast),
        Array.isArray(ast) ? 'array' : ast.type,
        error instanceof Error ? error : undefined,
      );
    }
  }

  /**
   * 转换单个AST节点
   */
  private static transformSingleAst(
    ast: AST,
    tenantCondition: TenantCondition,
    targetDatabaseConfig?: TargetDatabaseConfig,
  ): AST {
    const context: TransformContext = {
      tenantCondition,
      currentTables: new Set(),
      targetTables: new Set(),
      cteTableNames: new Set(),
      inSubQuery: false,
      targetDatabaseConfig,
    };

    switch (ast.type) {
      case 'select':
        return this.transformSelect(ast as Select, context);
      case 'insert':
      case 'replace':
        return this.transformInsert(ast as Insert_Replace, context);
      case 'update':
        return this.transformUpdate(ast as Update, context);
      case 'delete':
        return this.transformDelete(ast as Delete, context);
      default:
        // 对于不需要处理的SQL类型，直接返回原AST
        return ast;
    }
  }

  /**
   * 转换SELECT语句
   */
  private static transformSelect(
    ast: Select,
    context: TransformContext,
  ): Select {
    const result = { ...ast } as Select;

    // 处理WITH子句
    if (result.with) {
      result.with = this.transformWith(result.with, context);
    }

    // 收集表信息
    if (result.from) {
      this.collectTablesFromFrom(result.from, context);
    }

    // 处理FROM子句中的子查询
    if (result.from) {
      result.from = this.transformFrom(result.from, context) as
        | From[]
        | TableExpr;
    }

    // 添加WHERE条件
    result.where = this.addTenantConditionToWhere(
      result.where,
      context.tenantCondition,
      context.targetTables,
    );

    // 处理子查询 - 在WHERE、HAVING等子句中
    if (result.where) {
      result.where = this.transformExpressionValue(
        result.where,
        context,
      ) as Binary;
    }

    if (result.having) {
      result.having = result.having.map((item) =>
        this.transformExpressionValue(item, context),
      );
    }

    // 处理SELECT列中的子查询
    if (result.columns && Array.isArray(result.columns)) {
      result.columns = result.columns.map((col) => {
        if (typeof col === 'object' && col.expr) {
          return {
            ...col,
            expr: this.transformExpressionValue(col.expr, context),
          };
        }
        return col;
      });
    }

    // 处理ORDER BY中的子查询
    if (result.orderby) {
      result.orderby = result.orderby.map((order) => ({
        ...order,
        expr: this.transformExpressionValue(order.expr, context),
      }));
    }

    // 处理UNION等集合操作
    if (result._next) {
      // 为UNION操作的后续SELECT创建独立的上下文
      const unionContext: TransformContext = {
        ...context,
        currentTables: new Set<string>(),
        targetTables: new Set<string>(),
        // 保持租户条件、CTE表名和其他配置不变
      };
      result._next = this.transformSelect(result._next, unionContext);
    }

    return result;
  }

  /**
   * 转换INSERT语句
   */
  private static transformInsert(
    ast: Insert_Replace,
    context: TransformContext,
  ): Insert_Replace {
    const result = { ...ast } as Insert_Replace;

    // 检查INSERT的目标表是否需要处理
    const shouldAddTenant = this.shouldProcessInsertTable(
      result,
      context.targetDatabaseConfig,
    );

    let tenantFieldAdded = false;
    if (shouldAddTenant) {
      // 检查是INSERT...SET还是INSERT...VALUES语法
      const resultWithSet = result as any;
      if (resultWithSet.set && Array.isArray(resultWithSet.set)) {
        // INSERT...SET语法：在set数组中添加租户字段
        const hasTenantField = resultWithSet.set.some(
          (setItem: any) => setItem.column === context.tenantCondition.field,
        );
        if (!hasTenantField) {
          resultWithSet.set.push({
            column: context.tenantCondition.field,
            value: {
              type: 'single_quote_string',
              value: context.tenantCondition.value,
            },
            table: null,
          });
          tenantFieldAdded = true;
        }
      } else {
        // INSERT...VALUES语法：在columns中添加租户字段
        result.columns = result.columns || [];
        const originalColumns = [...result.columns];
        result.columns = this.addTenantFieldToInsert(
          result.columns,
          context.tenantCondition,
        );
        tenantFieldAdded = result.columns.length > originalColumns.length;
      }
    }

    // 如果是INSERT ... SELECT形式，需要转换SELECT部分
    if (
      result.values &&
      typeof result.values === 'object' &&
      'type' in result.values
    ) {
      if (result.values.type === 'select') {
        result.values = this.transformSelect(result.values as Select, context);

        // 如果添加了tenant字段，也需要在SELECT的columns中添加对应的租户值
        if (tenantFieldAdded && result.values.columns) {
          const tenantColumn = {
            expr: {
              type: 'single_quote_string',
              value: context.tenantCondition.value,
            } as any,
            as: null,
          };
          result.values.columns = [...result.values.columns, tenantColumn];
        }
      }
    }

    // 为VALUES添加租户值（只有在需要处理且添加了字段的情况下）
    if (
      shouldAddTenant &&
      tenantFieldAdded &&
      result.values &&
      typeof result.values === 'object'
    ) {
      if ('type' in result.values) {
        if (result.values.type === 'select') {
          // INSERT ... SELECT 情况已在上面处理
        } else if (
          (result.values as any).type === 'values' &&
          (result.values as any).values
        ) {
          // 处理 INSERT ... VALUES 情况
          (result.values as any).values = this.addTenantValueToInsert(
            (result.values as any).values,
            context.tenantCondition,
          );
        }
      }
    } else if (
      shouldAddTenant &&
      tenantFieldAdded &&
      Array.isArray(result.values)
    ) {
      // 处理直接的数组情况
      (result.values as any) = this.addTenantValueToInsert(
        result.values,
        context.tenantCondition,
      );
    }

    return result;
  }

  /**
   * 转换UPDATE语句
   */
  private static transformUpdate(
    ast: Update,
    context: TransformContext,
  ): Update {
    const result = { ...ast } as Update;

    // 收集表信息
    if (result.table) {
      this.collectTablesFromFrom(result.table, context);
    }

    // 处理FROM子句中的子查询（如果有）
    if (result.table) {
      result.table = this.transformFrom(result.table, context) as Array<From>;
    }

    // 添加WHERE条件
    result.where = this.addTenantConditionToWhere(
      result.where,
      context.tenantCondition,
      context.targetTables,
    );

    // 处理SET子句中的子查询
    if (result.set) {
      result.set = result.set.map((setItem) => ({
        ...setItem,
        value: this.transformExpressionValue(setItem.value, context),
      }));
    }

    // 处理WHERE子句中的子查询
    if (result.where) {
      result.where = this.transformExpressionValue(
        result.where,
        context,
      ) as Binary;
    }

    return result;
  }

  /**
   * 转换DELETE语句
   */
  private static transformDelete(
    ast: Delete,
    context: TransformContext,
  ): Delete {
    const result = { ...ast } as Delete;

    // 收集表信息
    if (result.from) {
      this.collectTablesFromFrom(result.from, context);
    }

    // 处理FROM子句中的子查询
    if (result.from) {
      result.from = this.transformFrom(result.from, context) as Array<From>;
    }

    // 添加WHERE条件
    result.where = this.addTenantConditionToWhere(
      result.where,
      context.tenantCondition,
      context.targetTables,
    );

    // 处理WHERE子句中的子查询
    if (result.where) {
      result.where = this.transformExpressionValue(
        result.where,
        context,
      ) as Binary;
    }

    return result;
  }

  /**
   * 转换WITH子句
   */
  private static transformWith(
    withClause: With[],
    context: TransformContext,
  ): With[] {
    // 收集CTE表名
    withClause.forEach((withItem) => {
      if (
        withItem.name &&
        typeof withItem.name === 'object' &&
        'value' in withItem.name
      ) {
        context.cteTableNames.add(withItem.name.value);
      }
    });

    return withClause.map((withItem) => {
      // 为CTE内部查询创建完全独立的上下文
      const newContext: TransformContext = {
        ...context,
        inSubQuery: true,
        currentTables: new Set<string>(),
        targetTables: new Set<string>(),
        // CTE名称列表保持共享，这样嵌套CTE可以识别外层的CTE表名
      };
      return {
        ...withItem,
        stmt: {
          ...withItem.stmt,
          ast: this.transformSelect(withItem.stmt.ast, newContext),
        },
      };
    });
  }

  /**
   * 转换FROM子句
   */
  private static transformFrom(
    from: From[] | From | TableExpr,
    context: TransformContext,
  ): From[] | From | TableExpr {
    if (Array.isArray(from)) {
      return from.map((item) => this.transformFromItem(item, context));
    }
    return this.transformFromItem(from, context);
  }

  /**
   * 转换单个FROM项
   */
  private static transformFromItem(
    fromItem: From,
    context: TransformContext,
  ): From {
    // 处理子查询表表达式
    if ('expr' in fromItem && fromItem.expr) {
      const tableExpr = fromItem as TableExpr;
      const newContext = {
        ...context,
        inSubQuery: true,
        currentTables: new Set<string>(),
        targetTables: new Set<string>(),
      };
      return {
        ...tableExpr,
        expr: {
          ...tableExpr.expr,
          ast: this.transformSelect(tableExpr.expr.ast, newContext),
        },
      };
    }

    // 处理JOIN
    if ('join' in fromItem) {
      const joinItem = fromItem as Join;
      // JOIN的ON条件中可能包含子查询
      if (joinItem.on) {
        joinItem.on = this.transformExpressionValue(
          joinItem.on,
          context,
        ) as Binary;
      }
    }

    return fromItem;
  }

  /**
   * 转换表达式值（处理子查询）
   */
  private static transformExpressionValue(
    expr: any,
    context: TransformContext,
  ): any {
    if (!expr || typeof expr !== 'object') {
      return expr;
    }

    // 处理二元表达式
    if (expr.type === 'binary_expr') {
      return {
        ...expr,
        left: this.transformExpressionValue(expr.left, context),
        right: this.transformExpressionValue(expr.right, context),
      };
    }

    // 处理函数表达式中的子查询
    if (expr.type === 'function' && expr.args && expr.args.value) {
      return {
        ...expr,
        args: {
          ...expr.args,
          value: expr.args.value.map((arg: any) =>
            this.transformExpressionValue(arg, context),
          ),
        },
      };
    }

    // 处理表达式列表
    if (expr.type === 'expr_list') {
      return {
        ...expr,
        value: expr.value.map((item: any) =>
          this.transformExpressionValue(item, context),
        ),
      };
    }

    // 处理子查询（SELECT）
    if (expr.type === 'select') {
      // 为子查询创建完全独立的上下文
      const newContext: TransformContext = {
        ...context,
        inSubQuery: true,
        currentTables: new Set<string>(),
        targetTables: new Set<string>(),
        // 保持租户条件、CTE表名和其他配置不变
      };
      return this.transformSelect(expr, newContext);
    }

    // 处理包含AST的子查询（常见于WHERE子句中的子查询）
    if (
      expr.ast &&
      typeof expr.ast === 'object' &&
      expr.ast.type === 'select'
    ) {
      // 为子查询创建完全独立的上下文
      const newContext: TransformContext = {
        ...context,
        inSubQuery: true,
        currentTables: new Set<string>(),
        targetTables: new Set<string>(),
        // 保持租户条件、CTE表名和其他配置不变
      };
      return {
        ...expr,
        ast: this.transformSelect(expr.ast, newContext),
      };
    }

    return expr;
  }

  /**
   * 从FROM子句收集表信息
   */
  private static collectTablesFromFrom(
    from: From[] | From,
    context: TransformContext,
  ): void {
    const fromArray = Array.isArray(from) ? from : [from];

    fromArray.forEach((item) => {
      const tableInfo = this.extractTableInfo(item);
      if (tableInfo) {
        const tableAlias = tableInfo.alias || tableInfo.name;

        // 检查是否为CTE临时表，如果是则跳过
        if (context.cteTableNames.has(tableInfo.name)) {
          // CTE临时表只添加到currentTables，不添加到targetTables
          context.currentTables.add(tableAlias);
          return;
        }

        context.currentTables.add(tableAlias);

        // 只有匹配的目标库中的表才添加到targetTables
        if (this.shouldProcessTable(tableInfo, context.targetDatabaseConfig)) {
          context.targetTables.add(tableAlias);
        }
      }
    });
  }

  /**
   * 提取表信息
   */
  private static extractTableInfo(from: From): TableInfo | null {
    if ('table' in from && from.table) {
      const baseFrom = from as BaseFrom;
      return {
        name: baseFrom.table,
        alias: baseFrom.as,
        db: baseFrom.db,
        fullName: baseFrom.db
          ? `${baseFrom.db}.${baseFrom.table}`
          : baseFrom.table,
      };
    }
    return null;
  }

  /**
   * 为WHERE子句添加租户条件
   */
  private static addTenantConditionToWhere(
    existingWhere: Binary | any | null,
    tenantCondition: TenantCondition,
    targetTables: Set<string>,
  ): Binary {
    const tenantConditions = this.buildTenantConditionsForTables(
      tenantCondition,
      targetTables,
    );

    if (tenantConditions.length === 0) {
      return existingWhere;
    }

    let combinedTenantCondition: Binary;
    if (tenantConditions.length === 1) {
      combinedTenantCondition = tenantConditions[0];
    } else {
      // 多个表的租户条件用AND连接
      combinedTenantCondition = tenantConditions.reduce((acc, curr) =>
        this.createAndCondition(acc, curr),
      );
    }

    if (!existingWhere) {
      return combinedTenantCondition;
    }

    return this.createAndCondition(existingWhere, combinedTenantCondition);
  }

  /**
   * 为多个表构建租户条件
   */
  private static buildTenantConditionsForTables(
    tenantCondition: TenantCondition,
    tables: Set<string>,
  ): Binary[] {
    const conditions: Binary[] = [];

    tables.forEach((table) => {
      conditions.push(
        this.createTenantCondition(
          table,
          tenantCondition.field,
          tenantCondition.value,
        ),
      );
    });

    return conditions;
  }

  /**
   * 创建租户条件表达式
   */
  private static createTenantCondition(
    table: string | null,
    field: string,
    value: string,
  ): Binary {
    const leftExpr: ColumnRef = {
      type: 'column_ref',
      table: table,
      column: field,
    };

    const rightExpr: ValueExpr = {
      type: 'single_quote_string',
      value: value,
    };

    return {
      type: 'binary_expr',
      operator: '=',
      left: leftExpr,
      right: rightExpr,
    };
  }

  /**
   * 创建AND条件
   */
  private static createAndCondition(left: Binary, right: Binary): Binary {
    return {
      type: 'binary_expr',
      operator: 'AND',
      left: left,
      right: right,
    };
  }

  /**
   * 为INSERT语句添加租户字段
   */
  private static addTenantFieldToInsert(
    columns: string[],
    tenantCondition: TenantCondition,
  ): string[] {
    if (!columns.includes(tenantCondition.field)) {
      return [...columns, tenantCondition.field];
    }
    return columns;
  }

  /**
   * 为INSERT VALUES添加租户值
   */
  private static addTenantValueToInsert(
    values: any[],
    tenantCondition: TenantCondition,
  ): any[] {
    return values.map((valueGroup) => {
      if (valueGroup.type === 'expr_list' && valueGroup.value) {
        const tenantValue: ValueExpr = {
          type: 'single_quote_string',
          value: tenantCondition.value,
        };

        return {
          ...valueGroup,
          value: [...valueGroup.value, tenantValue],
        };
      }
      return valueGroup;
    });
  }
}
