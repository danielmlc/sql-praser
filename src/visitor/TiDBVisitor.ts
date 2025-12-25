import { AbstractParseTreeVisitor } from 'antlr4';
import { TiDBParserVisitor } from '../parser/generated/TiDBParserVisitor';
import * as Parser from '../parser/generated/TiDBParser';

/**
 * Base visitor class for traversing TiDB SQL AST
 *
 * @example
 * ```typescript
 * class MyVisitor extends TiDBVisitor<string> {
 *   visitSelectStatement(ctx: Parser.SelectStatementContext): string {
 *     return 'Found SELECT statement';
 *   }
 * }
 *
 * const visitor = new MyVisitor();
 * const result = visitor.visit(ast);
 * ```
 */
export class TiDBVisitor<T = any> extends AbstractParseTreeVisitor<T> implements TiDBParserVisitor<T> {

    protected defaultResult(): T {
        return null as T;
    }

    // Override specific visit methods as needed
    visitRoot(ctx: Parser.RootContext): T {
        return this.visitChildren(ctx);
    }

    visitSelectStatement(ctx: Parser.SelectStatementContext): T {
        return this.visitChildren(ctx);
    }

    visitInsertStatement(ctx: Parser.InsertStatementContext): T {
        return this.visitChildren(ctx);
    }

    visitUpdateStatement(ctx: Parser.UpdateStatementContext): T {
        return this.visitChildren(ctx);
    }

    visitDeleteStatement(ctx: Parser.DeleteStatementContext): T {
        return this.visitChildren(ctx);
    }

    visitCreateTable(ctx: Parser.CreateTableContext): T {
        return this.visitChildren(ctx);
    }

    visitWhereClause(ctx: Parser.WhereClauseContext): T {
        return this.visitChildren(ctx);
    }

    visitExpression(ctx: Parser.ExpressionContext): T {
        return this.visitChildren(ctx);
    }

    // Add more visit methods as needed for specific use cases
}

/**
 * Example visitor that extracts table names from SQL
 */
export class TableNameExtractor extends TiDBVisitor<string[]> {
    private tableNames: Set<string> = new Set();

    protected defaultResult(): string[] {
        return Array.from(this.tableNames);
    }

    visitTableName(ctx: Parser.TableNameContext): string[] {
        const tableName = ctx.getText();
        this.tableNames.add(tableName);
        return this.defaultResult();
    }

    visitRoot(ctx: Parser.RootContext): string[] {
        this.tableNames.clear();
        this.visitChildren(ctx);
        return this.defaultResult();
    }
}

/**
 * Example visitor that extracts column names from SELECT statements
 */
export class ColumnNameExtractor extends TiDBVisitor<string[]> {
    private columnNames: Set<string> = new Set();

    protected defaultResult(): string[] {
        return Array.from(this.columnNames);
    }

    visitColumnName(ctx: Parser.ColumnNameContext): string[] {
        const columnName = ctx.getText();
        this.columnNames.add(columnName);
        return this.defaultResult();
    }

    visitRoot(ctx: Parser.RootContext): string[] {
        this.columnNames.clear();
        this.visitChildren(ctx);
        return this.defaultResult();
    }
}
