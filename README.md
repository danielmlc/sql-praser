# @cs/sql-parser-antlr4

基于 ANTLR4 的 SQL 解析器，支持 MySQL 和 TiDB 方言，提供租户隔离和库名改写功能。

## 📦 安装

```bash
pnpm add @cs/sql-parser-antlr4
```

## 🔧 基本用法

### 静态 API（向后兼容）

```typescript
import SqlParserService from '@cs/sql-parser-antlr4';

// 基本使用
const sql = "/*& tenant:'sxlq' */ SELECT * FROM users";
const result = SqlParserService.rewriteWithTenant(sql);
console.log(result);
// 输出: SELECT * FROM `users` WHERE `users`.`tenant` = 'sxlq'
```

### 实例 API

```typescript
import { SqlRewriter } from '@cs/sql-parser-antlr4';

const rewriter = new SqlRewriter({
  dialect: 'mysql',
  listeners: {
    tenant: {
      enabled: true,
      tenantField: 'tenant',
      targetDatabases: {
        prefixes: ['tnt_'],
        fullNames: ['global_mb'],
        defaultDatabase: 'main',
      },
    },
  },
});

const result = await rewriter.rewrite(sql);
console.log(result.sql);
```

## 🎯 核心特性

- ✅ **基于 ANTLR4**：使用官方 MySQL 语法，精确解析
- ✅ **格式保留**：使用 TokenStreamRewriter，保留原始格式和注释
- ✅ **多方言支持**：支持 MySQL 和 TiDB（可扩展）
- ✅ **租户隔离**：自动注入租户条件
- ✅ **库名改写**：支持数据库名重写
- ✅ **向后兼容**：保持与旧版本 API 兼容

## 📋 API 参考

### SqlParserService

```typescript
// 核心方法
static rewriteWithTenant(sql: string): string
static rewriteWithDetails(sql: string): RewriteResult
static batchRewrite(sqlList: string[]): string[]

// 配置管理
static setTenantField(fieldName: string): void
static setConfig(config: Partial<SqlParserConfig>): void
static setTargetDatabases(targetDatabases: TargetDatabaseConfig): void
static addDatabasePrefix(prefix: string): void
static addDatabaseName(dbName: string): void
static setDefaultDatabase(defaultDatabase: string): void

// 实用方法
static extractHint(sql: string): HintInfo
static hasHint(sql: string): boolean
static removeHints(sql: string): string
static validateSql(sql: string): boolean
```

### SqlRewriter

```typescript
class SqlRewriter {
  constructor(config?: Partial<SqlParserConfig>)
  async rewrite(sql: string): Promise<RewriteResult>
  updateConfig(config: Partial<SqlParserConfig>): void
  getConfig(): SqlParserConfig
}
```

## 🏗️ 架构设计

```
┌─────────────────────────────────────────┐
│           Application Layer             │
│  SqlParserService | SqlRewriter          │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Orchestrator Layer              │
│  SQLProcessorOrchestrator               │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│          Listener Layer                 │
│  HintListener → TenantFilterListener    │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│        Dialect Adapter Layer            │
│  MySQLAdapter → TiDBAdapter             │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│          Parser Layer                   │
│  ParserFactory → MySQLParser            │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Grammar Layer                   │
│  grammar/mysql/ → generated/mysql/      │
└─────────────────────────────────────────┘
```

## 🚀 开发

### 安装依赖

```bash
pnpm install
```

### 生成 Parser 代码

```bash
# 生成 MySQL Parser
pnpm run generate:parser

# 生成 TiDB Parser
pnpm run generate:parser:tidb

# 生成所有 Parser
pnpm run generate:all
```

### 构建

```bash
pnpm run build
```

### 测试

```bash
pnpm run test
```

## 📝 与旧版本的差异

### 主要变化

1. **从 node-sql-parser 迁移到 ANTLR4**
   - 更精确的 SQL 解析
   - 完美的格式保留

2. **新增 TiDB 方言支持**
   - 可扩展的方言架构
   - 未来支持更多方言

3. **API 完全兼容**
   - 现有代码无需修改
   - 平滑迁移

### 迁移指南

```typescript
// 旧版本
import SqlParserService from '@cs/sql-parser';

// 新版本（只需修改包名）
import SqlParserService from '@cs/sql-parser-antlr4';

// API 完全相同，无需修改其他代码
```

## 🔮 未来计划

- [ ] 完整实现 TiDB 方言支持
- [ ] 支持 PostgreSQL 方言
- [ ] 添加更多测试用例
- [ ] 性能优化

## 📄 许可证

ISC
