import { TiDBVisitor } from '../visitor/TiDBVisitor';
import * as Parser from '../parser/generated/TiDBParser';
import { TiDBSQLParser } from '../parser/TiDBSQLParser';

/**
 * SQL Rewriter - Transform SQL statements using visitor pattern
 *
 * @example
 * ```typescript
 * const rewriter = new SQLRewriter();
 *
 * // Add table prefix
 * const sql1 = 'SELECT * FROM users';
 * const result1 = rewriter.addTablePrefix(sql1, 'prod_');
 * // Result: SELECT * FROM prod_users
 *
 * // Add WHERE condition
 * const sql2 = 'SELECT * FROM orders';
 * const result2 = rewriter.addWhereCondition(sql2, 'status = "active"');
 * // Result: SELECT * FROM orders WHERE status = "active"
 * ```
 */
export class SQLRewriter {
    private parser: TiDBSQLParser;

    constructor() {
        this.parser = new TiDBSQLParser();
    }

    /**
     * Add prefix to all table names in SQL
     */
    addTablePrefix(sql: string, prefix: string): string {
        const ast = this.parser.parse(sql);
        const visitor = new TablePrefixRewriter(prefix);
        visitor.visit(ast);
        return visitor.getRewrittenSQL();
    }

    /**
     * Add WHERE condition to SELECT/UPDATE/DELETE statements
     */
    addWhereCondition(sql: string, condition: string): string {
        const ast = this.parser.parse(sql);
        const visitor = new WhereConditionAdder(condition);
        visitor.visit(ast);
        return visitor.getRewrittenSQL();
    }

    /**
     * Replace table name in SQL
     */
    replaceTableName(sql: string, oldName: string, newName: string): string {
        const ast = this.parser.parse(sql);
        const visitor = new TableNameReplacer(oldName, newName);
        visitor.visit(ast);
        return visitor.getRewrittenSQL();
    }

    /**
     * Add LIMIT clause to SELECT statements
     */
    addLimit(sql: string, limit: number, offset?: number): string {
        const ast = this.parser.parse(sql);
        const visitor = new LimitAdder(limit, offset);
        visitor.visit(ast);
        return visitor.getRewrittenSQL();
    }
}

/**
 * Internal visitor for adding table prefix
 */
class TablePrefixRewriter extends TiDBVisitor<string> {
    private parts: string[] = [];
    private lastIndex: number = 0;
    private originalSQL: string = '';

    constructor(private prefix: string) {
        super();
    }

    visitRoot(ctx: Parser.RootContext): string {
        this.originalSQL = ctx.start.getInputStream()?.toString() || '';
        this.parts = [];
        this.lastIndex = 0;
        this.visitChildren(ctx);
        return this.getRewrittenSQL();
    }

    visitTableName(ctx: Parser.TableNameContext): string {
        const start = ctx.start.start;
        const tableName = ctx.getText();

        // Add part before this table name
        this.parts.push(this.originalSQL.substring(this.lastIndex, start));
        // Add prefixed table name
        this.parts.push(this.prefix + tableName);
        // Update last index
        this.lastIndex = ctx.stop!.stop + 1;

        return this.defaultResult();
    }

    getRewrittenSQL(): string {
        // Add remaining part
        if (this.lastIndex < this.originalSQL.length) {
            this.parts.push(this.originalSQL.substring(this.lastIndex));
        }
        return this.parts.join('');
    }
}

/**
 * Internal visitor for adding WHERE condition
 */
class WhereConditionAdder extends TiDBVisitor<string> {
    private rewrittenSQL: string = '';

    constructor(private condition: string) {
        super();
    }

    visitSelectStatement(ctx: Parser.SelectStatementContext): string {
        const sql = ctx.start.getInputStream()?.toString() || '';
        const whereClause = ctx.whereClause();

        if (whereClause) {
            // Already has WHERE clause, add AND condition
            const whereStart = whereClause.start.start;
            const whereEnd = whereClause.stop!.stop + 1;
            const originalWhere = sql.substring(whereStart, whereEnd);

            this.rewrittenSQL = sql.substring(0, whereStart) +
                originalWhere.replace('WHERE', `WHERE (${this.condition}) AND`) +
                sql.substring(whereEnd);
        } else {
            // No WHERE clause, add one
            const fromClause = ctx.fromClause();
            if (fromClause) {
                const insertPos = fromClause.stop!.stop + 1;
                this.rewrittenSQL = sql.substring(0, insertPos) +
                    ` WHERE ${this.condition}` +
                    sql.substring(insertPos);
            } else {
                this.rewrittenSQL = sql;
            }
        }

        return this.rewrittenSQL;
    }

    getRewrittenSQL(): string {
        return this.rewrittenSQL;
    }
}

/**
 * Internal visitor for replacing table names
 */
class TableNameReplacer extends TiDBVisitor<string> {
    private parts: string[] = [];
    private lastIndex: number = 0;
    private originalSQL: string = '';

    constructor(private oldName: string, private newName: string) {
        super();
    }

    visitRoot(ctx: Parser.RootContext): string {
        this.originalSQL = ctx.start.getInputStream()?.toString() || '';
        this.parts = [];
        this.lastIndex = 0;
        this.visitChildren(ctx);
        return this.getRewrittenSQL();
    }

    visitTableName(ctx: Parser.TableNameContext): string {
        const start = ctx.start.start;
        const tableName = ctx.getText();

        if (tableName === this.oldName || tableName === `\`${this.oldName}\``) {
            // Add part before this table name
            this.parts.push(this.originalSQL.substring(this.lastIndex, start));
            // Add new table name
            this.parts.push(this.newName);
            // Update last index
            this.lastIndex = ctx.stop!.stop + 1;
        }

        return this.defaultResult();
    }

    getRewrittenSQL(): string {
        // Add remaining part
        if (this.lastIndex < this.originalSQL.length) {
            this.parts.push(this.originalSQL.substring(this.lastIndex));
        }
        return this.parts.join('');
    }
}

/**
 * Internal visitor for adding LIMIT clause
 */
class LimitAdder extends TiDBVisitor<string> {
    private rewrittenSQL: string = '';

    constructor(private limit: number, private offset?: number) {
        super();
    }

    visitSelectStatement(ctx: Parser.SelectStatementContext): string {
        const sql = ctx.start.getInputStream()?.toString() || '';
        const limitClause = ctx.limitClause();

        if (limitClause) {
            // Already has LIMIT, replace it
            const limitStart = limitClause.start.start;
            const limitEnd = limitClause.stop!.stop + 1;

            const newLimit = this.offset
                ? `LIMIT ${this.limit} OFFSET ${this.offset}`
                : `LIMIT ${this.limit}`;

            this.rewrittenSQL = sql.substring(0, limitStart) +
                newLimit +
                sql.substring(limitEnd);
        } else {
            // No LIMIT, add one at the end
            const newLimit = this.offset
                ? ` LIMIT ${this.limit} OFFSET ${this.offset}`
                : ` LIMIT ${this.limit}`;

            this.rewrittenSQL = sql + newLimit;
        }

        return this.rewrittenSQL;
    }

    getRewrittenSQL(): string {
        return this.rewrittenSQL;
    }
}
