import { TiDBSQLParser, SQLRewriter, TableNameExtractor, ColumnNameExtractor } from '../src';

console.log('=== TiDB SQL Parser Examples ===\n');

// Example 1: Basic Parsing
console.log('1. Basic SQL Parsing:');
const parser = new TiDBSQLParser();
const sql1 = 'SELECT id, name, email FROM users WHERE status = "active" ORDER BY id DESC LIMIT 10';

try {
    const ast = parser.parse(sql1);
    console.log('✓ SQL parsed successfully!');
    console.log('AST Tree:', ast.toStringTree(parser.parser!));
} catch (error) {
    console.error('✗ Parse error:', error);
}

console.log('\n---\n');

// Example 2: SQL Validation
console.log('2. SQL Validation:');
const validSQL = 'SELECT * FROM orders WHERE total > 100';
const invalidSQL = 'SELECT * FORM orders'; // Typo: FORM instead of FROM

console.log(`Valid SQL: "${validSQL}"`);
console.log('Is valid?', parser.validate(validSQL));

console.log(`\nInvalid SQL: "${invalidSQL}"`);
console.log('Is valid?', parser.validate(invalidSQL));
console.log('Error:', parser.getErrors(invalidSQL));

console.log('\n---\n');

// Example 3: Extract Table Names
console.log('3. Extract Table Names:');
const sql3 = `
    SELECT u.id, u.name, o.total
    FROM users u
    JOIN orders o ON u.id = o.user_id
    WHERE o.status = 'completed'
`;

const ast3 = parser.parse(sql3);
const tableExtractor = new TableNameExtractor();
const tables = tableExtractor.visit(ast3);
console.log('SQL:', sql3.trim());
console.log('Tables found:', tables);

console.log('\n---\n');

// Example 4: Extract Column Names
console.log('4. Extract Column Names:');
const sql4 = 'SELECT id, name, email, created_at FROM users';

const ast4 = parser.parse(sql4);
const columnExtractor = new ColumnNameExtractor();
const columns = columnExtractor.visit(ast4);
console.log('SQL:', sql4);
console.log('Columns found:', columns);

console.log('\n---\n');

// Example 5: SQL Rewriting - Add Table Prefix
console.log('5. SQL Rewriting - Add Table Prefix:');
const rewriter = new SQLRewriter();
const sql5 = 'SELECT * FROM users JOIN orders ON users.id = orders.user_id';

const rewritten5 = rewriter.addTablePrefix(sql5, 'prod_');
console.log('Original:', sql5);
console.log('Rewritten:', rewritten5);

console.log('\n---\n');

// Example 6: SQL Rewriting - Add WHERE Condition
console.log('6. SQL Rewriting - Add WHERE Condition:');
const sql6 = 'SELECT * FROM orders';

const rewritten6 = rewriter.addWhereCondition(sql6, 'tenant_id = 123');
console.log('Original:', sql6);
console.log('Rewritten:', rewritten6);

console.log('\n---\n');

// Example 7: SQL Rewriting - Replace Table Name
console.log('7. SQL Rewriting - Replace Table Name:');
const sql7 = 'SELECT * FROM users WHERE status = "active"';

const rewritten7 = rewriter.replaceTableName(sql7, 'users', 'customers');
console.log('Original:', sql7);
console.log('Rewritten:', rewritten7);

console.log('\n---\n');

// Example 8: SQL Rewriting - Add LIMIT
console.log('8. SQL Rewriting - Add LIMIT:');
const sql8 = 'SELECT * FROM products ORDER BY price DESC';

const rewritten8 = rewriter.addLimit(sql8, 20, 10);
console.log('Original:', sql8);
console.log('Rewritten:', rewritten8);

console.log('\n---\n');

// Example 9: Complex SQL with TiDB Specific Features
console.log('9. Parse TiDB-Specific SQL (Partitioned Table):');
const sql9 = `
    CREATE TABLE orders (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        user_id BIGINT NOT NULL,
        total DECIMAL(10, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    PARTITION BY HASH(user_id) PARTITIONS 8
    SHARD_ROW_ID_BITS = 4
    PRE_SPLIT_REGIONS = 2
`;

try {
    const ast9 = parser.parse(sql9);
    console.log('✓ TiDB-specific SQL parsed successfully!');
    console.log('This SQL includes:');
    console.log('  - PARTITION BY HASH');
    console.log('  - SHARD_ROW_ID_BITS (TiDB specific)');
    console.log('  - PRE_SPLIT_REGIONS (TiDB specific)');
} catch (error) {
    console.error('✗ Parse error:', error);
}

console.log('\n---\n');

// Example 10: Multi-tenancy SQL Rewriting
console.log('10. Multi-Tenancy SQL Rewriting:');
class MultiTenantRewriter {
    private rewriter = new SQLRewriter();

    rewrite(sql: string, tenantId: number): string {
        // Step 1: Add table prefix for tenant isolation
        let rewritten = this.rewriter.addTablePrefix(sql, `tenant_${tenantId}_`);

        // Step 2: Add tenant_id filter to WHERE clause
        rewritten = this.rewriter.addWhereCondition(rewritten, `tenant_id = ${tenantId}`);

        return rewritten;
    }
}

const mtRewriter = new MultiTenantRewriter();
const sql10 = 'SELECT * FROM users WHERE status = "active"';
const rewritten10 = mtRewriter.rewrite(sql10, 100);

console.log('Original SQL:', sql10);
console.log('Multi-tenant Rewritten:', rewritten10);
console.log('Note: Table prefixed with "tenant_100_" and added "tenant_id = 100" condition');

console.log('\n=== All Examples Completed ===');
