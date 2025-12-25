# TiDB SQL Parser

一个基于 **ANTLR4** 的 **TiDB SQL 语法解析器**，使用 **TypeScript** 开发，支持 SQL 语法树解析和 SQL 改写功能。

## ✨ 特性

- 🚀 **完整的 TiDB SQL 支持** - 支持标准 MySQL 语法 + TiDB 特有语法
- 🌳 **AST 语法树** - 生成完整的抽象语法树，方便分析和改写
- 🔄 **SQL 改写** - 内置多种 SQL 改写功能（表名前缀、WHERE 条件、LIMIT 等）
- 📦 **TypeScript 编写** - 完整的类型支持，开发体验极佳
- ⚡ **高性能** - 基于 ANTLR4，解析速度快，性能优异
- 🛠️ **易于扩展** - 清晰的 Visitor 模式，轻松实现自定义改写规则

## 📦 安装

```bash
npm install
```

## 🏗️ 构建

```bash
# 生成 ANTLR4 解析器并编译 TypeScript
npm run build

# 监听模式（开发时使用）
npm run watch

# 清理生成的文件
npm run clean
```

## 🚀 快速开始

### 1. 基本解析

```typescript
import { TiDBSQLParser } from 'tidb-sql-parser';

const parser = new TiDBSQLParser();
const sql = 'SELECT * FROM users WHERE id = 1';

// 解析 SQL 并获取 AST
const ast = parser.parse(sql);
console.log(ast.toStringTree(parser.parser!));
```

### 2. SQL 验证

```typescript
const parser = new TiDBSQLParser();

// 验证 SQL 语法是否正确
const isValid = parser.validate('SELECT * FROM users');
console.log(isValid); // true

// 获取错误信息
const error = parser.getErrors('SELECT * FORM users'); // 注意：FORM 拼写错误
console.log(error); // Syntax Error at line 1:9 - ...
```

### 3. 提取表名和列名

```typescript
import { TiDBSQLParser, TableNameExtractor, ColumnNameExtractor } from 'tidb-sql-parser';

const parser = new TiDBSQLParser();
const sql = 'SELECT id, name FROM users JOIN orders ON users.id = orders.user_id';

const ast = parser.parse(sql);

// 提取表名
const tableExtractor = new TableNameExtractor();
const tables = tableExtractor.visit(ast);
console.log(tables); // ['users', 'orders']

// 提取列名
const columnExtractor = new ColumnNameExtractor();
const columns = columnExtractor.visit(ast);
console.log(columns); // ['id', 'name', 'user_id']
```

### 4. SQL 改写

```typescript
import { SQLRewriter } from 'tidb-sql-parser';

const rewriter = new SQLRewriter();

// 添加表名前缀
const sql1 = 'SELECT * FROM users';
const result1 = rewriter.addTablePrefix(sql1, 'prod_');
console.log(result1); // SELECT * FROM prod_users

// 添加 WHERE 条件
const sql2 = 'SELECT * FROM orders';
const result2 = rewriter.addWhereCondition(sql2, 'status = "active"');
console.log(result2); // SELECT * FROM orders WHERE status = "active"

// 替换表名
const sql3 = 'SELECT * FROM users';
const result3 = rewriter.replaceTableName(sql3, 'users', 'customers');
console.log(result3); // SELECT * FROM customers

// 添加 LIMIT
const sql4 = 'SELECT * FROM products';
const result4 = rewriter.addLimit(sql4, 10, 20);
console.log(result4); // SELECT * FROM products LIMIT 10 OFFSET 20
```

### 5. 自定义 Visitor（高级用法）

```typescript
import { TiDBVisitor } from 'tidb-sql-parser';
import * as Parser from 'tidb-sql-parser';

// 创建自定义 Visitor 来统计 SELECT 语句数量
class SelectCounterVisitor extends TiDBVisitor<number> {
    private count = 0;

    visitSelectStatement(ctx: Parser.SelectStatementContext): number {
        this.count++;
        return this.visitChildren(ctx);
    }

    visitRoot(ctx: Parser.RootContext): number {
        this.count = 0;
        this.visitChildren(ctx);
        return this.count;
    }
}

const parser = new TiDBSQLParser();
const sql = `
    SELECT * FROM users;
    SELECT * FROM orders;
    SELECT * FROM products;
`;

const ast = parser.parse(sql);
const counter = new SelectCounterVisitor();
const count = counter.visit(ast);
console.log(`Found ${count} SELECT statements`); // Found 3 SELECT statements
```

## 📚 支持的 SQL 语法

### DML 语句
- ✅ SELECT (包括 JOIN, WHERE, GROUP BY, HAVING, ORDER BY, LIMIT)
- ✅ INSERT
- ✅ UPDATE
- ✅ DELETE
- ✅ UNION

### DDL 语句
- ✅ CREATE TABLE
- ✅ CREATE DATABASE
- ✅ ALTER TABLE
- ✅ DROP TABLE
- ✅ DROP DATABASE

### TiDB 特有语法
- ✅ PARTITION BY (HASH, RANGE, LIST)
- ✅ SHARD_ROW_ID_BITS
- ✅ PRE_SPLIT_REGIONS

### 数据类型
- ✅ 整数类型 (INT, BIGINT, TINYINT, SMALLINT)
- ✅ 字符串类型 (VARCHAR, CHAR, TEXT)
- ✅ 数值类型 (DECIMAL, FLOAT, DOUBLE)
- ✅ 日期时间 (DATE, DATETIME, TIMESTAMP)
- ✅ 布尔类型 (BOOLEAN, BOOL)

## 🎯 使用场景

### 1. 多租户 SQL 改写

```typescript
class MultiTenantRewriter {
    private rewriter = new SQLRewriter();

    rewrite(sql: string, tenantId: number): string {
        // 添加租户表前缀
        let rewritten = this.rewriter.addTablePrefix(sql, `tenant_${tenantId}_`);
        // 添加租户过滤条件
        rewritten = this.rewriter.addWhereCondition(rewritten, `tenant_id = ${tenantId}`);
        return rewritten;
    }
}

const mtRewriter = new MultiTenantRewriter();
const result = mtRewriter.rewrite('SELECT * FROM users', 100);
// 结果: SELECT * FROM tenant_100_users WHERE tenant_id = 100
```

### 2. SQL 安全审计

```typescript
class SQLAuditor extends TiDBVisitor<void> {
    private issues: string[] = [];

    visitDeleteStatement(ctx: Parser.DeleteStatementContext): void {
        if (!ctx.whereClause()) {
            this.issues.push('Dangerous: DELETE without WHERE clause');
        }
        this.visitChildren(ctx);
    }

    visitUpdateStatement(ctx: Parser.UpdateStatementContext): void {
        if (!ctx.whereClause()) {
            this.issues.push('Dangerous: UPDATE without WHERE clause');
        }
        this.visitChildren(ctx);
    }

    getIssues(): string[] {
        return this.issues;
    }
}
```

### 3. SQL 查询分析

```typescript
class QueryAnalyzer extends TiDBVisitor<void> {
    private stats = {
        tables: new Set<string>(),
        hasJoin: false,
        hasSubquery: false,
        hasAggregation: false
    };

    visitTableName(ctx: Parser.TableNameContext): void {
        this.stats.tables.add(ctx.getText());
        this.visitChildren(ctx);
    }

    visitJoinPart(ctx: Parser.JoinPartContext): void {
        this.stats.hasJoin = true;
        this.visitChildren(ctx);
    }

    // ... 更多分析逻辑
}
```

## 🔧 项目结构

```
tidb-sql-parser/
├── grammar/                    # ANTLR4 语法文件
│   ├── TiDBLexer.g4           # 词法分析器
│   └── TiDBParser.g4          # 语法分析器
├── src/
│   ├── parser/                # 解析器封装
│   │   ├── TiDBSQLParser.ts   # 主解析器类
│   │   └── generated/         # ANTLR4 生成的代码
│   ├── visitor/               # AST 访问者
│   │   └── TiDBVisitor.ts     # 基础 Visitor 类
│   ├── rewriter/              # SQL 改写器
│   │   └── SQLRewriter.ts     # SQL 改写功能
│   └── index.ts               # 入口文件
├── examples/                  # 示例代码
│   └── basic-usage.ts         # 基础使用示例
├── dist/                      # 编译输出（自动生成）
├── package.json
├── tsconfig.json
└── README.md
```

## 🤔 为什么选择 ANTLR4？

1. **强大的语法定义能力** - 支持复杂的语法规则，处理 SQL 的各种场景
2. **性能优秀** - 生成的解析器性能高，适合生产环境
3. **成熟的生态** - 支持多种编程语言，工具链完善
4. **易于维护** - 语法文件清晰，修改和扩展方便
5. **社区支持** - 有大量现成的语法文件可以参考

## 📖 运行示例

```bash
# 运行示例代码
npm run example
```

这将运行 `examples/basic-usage.ts`，展示所有功能的使用方法。

## 🛣️ Roadmap

- [ ] 支持更多 TiDB 特有语法
- [ ] 添加 SQL 格式化功能
- [ ] 支持 SQL 优化建议
- [ ] 添加更多内置的 Visitor 示例
- [ ] 性能优化和基准测试
- [ ] 完善单元测试

## 📝 License

MIT

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**注意**: 这是一个基于 ANTLR4 的 TiDB SQL 解析器项目，专为 SQL 语法树解析和改写设计。
