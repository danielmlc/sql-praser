# @cs/sql-parser-antlr4

基于 ANTLR4 的 SQL 解析器，支持 MySQL/TiDB 方言，提供**租户条件自动注入**和**数据库名改写**功能。使用 `TokenStreamRewriter` 实现非破坏性 SQL 改写，完整保留原始格式、注释和空白。

## 安装

```bash
pnpm add @cs/sql-parser-antlr4
```

## 快速开始

### 租户条件注入

通过 SQL Hint 指定租户，解析器自动为 SELECT/UPDATE/DELETE 语句注入租户过滤条件：

```typescript
import SqlParserService from '@cs/sql-parser-antlr4';

const sql = "/*& tenant:'sxlq' */ SELECT * FROM users";
const result = SqlParserService.rewriteWithTenant(sql);
// => SELECT * FROM users WHERE `users`.`tenant` = 'sxlq'

// 带详细信息的改写
const detail = SqlParserService.rewriteWithDetails(sql);
// detail.sql       - 改写后的 SQL
// detail.modified  - 是否被修改
// detail.hint      - 提取的租户信息 { tenant: 'sxlq', original: "/*& tenant:'sxlq' */" }
```

### 数据库名改写

为跨库 SQL 中的数据库名添加环境前缀：

```typescript
import { SqlRewriter } from '@cs/sql-parser-antlr4';

const rewriter = new SqlRewriter({
  listeners: {
    databaseRewrite: {
      enabled: true,
      priority: 50,
      abortOnError: false,
      dbPrefix: 'dev_mc_',
      targetDatabases: ['mydb'],       // 可选：仅改写指定库
      excludeDatabases: ['system'],    // 可选：排除指定库
    },
  },
});

const result = rewriter.rewrite("SELECT * FROM mydb.users");
// => SELECT * FROM dev_mc_mydb.users
```

### 组合使用

同时启用租户注入和数据库改写：

```typescript
const rewriter = new SqlRewriter({
  listeners: {
    hint: { enabled: true, priority: 10, abortOnError: false, preserveHint: false },
    tenant: {
      enabled: true,
      priority: 100,
      abortOnError: false,
      tenantField: 'tenant_id',
      targetDatabases: { prefixes: ['tnt_'], fullNames: ['global_mb'], defaultDatabase: 'main' },
    },
    databaseRewrite: {
      enabled: true,
      priority: 50,
      abortOnError: false,
      dbPrefix: 'prod_',
    },
  },
});

const result = rewriter.rewrite("/*& tenant:'t001' */ SELECT * FROM mydb.orders");
// => SELECT * FROM prod_mydb.orders WHERE `orders`.`tenant_id` = 't001'
```

## Hint 语法

租户信息通过 SQL 注释 Hint 传递，格式为：

```sql
/*& tenant:'租户编码' */
```

- 支持单引号和双引号：`/*& tenant:'abc' */` 或 `/*& tenant:"abc" */`
- 大小写不敏感：`/*& TENANT:'abc' */` 同样有效
- 位置灵活：通常放在 SQL 语句最前面

## API 参考

### SqlParserService（静态 API）

与旧版 `@cs/sql-parser` 完全兼容的静态接口：

```typescript
// ── 核心改写 ──
SqlParserService.rewriteWithTenant(sql: string): string
SqlParserService.rewriteWithDetails(sql: string): RewriteResult
SqlParserService.batchRewrite(sqlList: string[]): string[]
SqlParserService.batchRewriteWithDetails(sqlList: string[]): RewriteResult[]

// ── 配置管理 ──
SqlParserService.setTenantField(fieldName: string): void
SqlParserService.setConfig(config: Partial<SqlParserConfig>): void
SqlParserService.setTargetDatabases(targetDatabases: TargetDatabaseConfig): void
SqlParserService.addDatabasePrefix(prefix: string): void
SqlParserService.addDatabaseName(dbName: string): void
SqlParserService.setDefaultDatabase(defaultDatabase: string): void

// ── Hint 操作 ──
SqlParserService.extractHint(sql: string): HintInfo | undefined
SqlParserService.hasHint(sql: string): boolean
SqlParserService.removeHints(sql: string): string
SqlParserService.createHint(tenant: string): string
SqlParserService.addHintToSql(sql: string, tenant: string): string

// ── 工具方法 ──
SqlParserService.validateSql(sql: string): boolean
SqlParserService.getSqlType(sql: string): string | null
SqlParserService.getDetailedInfo(sql: string): DetailedInfo
SqlParserService.isValidTenant(tenant: string): boolean
SqlParserService.removeAllComments(sql: string): string
```

### SqlRewriter（实例 API）

支持独立配置的实例化接口：

```typescript
const rewriter = new SqlRewriter(config?: Partial<SqlParserConfig>);

rewriter.rewrite(sql: string): RewriteResult
rewriter.updateConfig(config: Partial<SqlParserConfig>): void
rewriter.getConfig(): SqlParserConfig
```

### 类型定义

```typescript
interface RewriteResult {
  sql: string;                       // 改写后的 SQL
  modified: boolean;                 // 是否被修改
  listenerResults: ListenerResult[]; // 各 Listener 执行结果
  hint?: HintInfo;                   // 提取的 Hint 信息
  error?: Error;                     // 错误信息
}

interface HintInfo {
  tenant?: string;   // 租户编码
  original?: string; // 原始 Hint 字符串
}

interface SqlParserConfig {
  dialect: SQLDialect;               // 数据库方言 ('mysql' | 'tidb')
  listeners: ListenerConfig;         // Listener 配置
  errorHandling: ErrorHandlingConfig; // 错误处理配置
}
```

### 错误类型

```typescript
SqlParseError        // 基类
├── ConfigError      // 配置错误
├── ParserError      // SQL 解析错误
├── HintParseError   // Hint 解析错误
├── TransformError   // Listener 转换错误
└── UnsupportedSqlError  // 不支持的 SQL 类型
```

## 支持的 SQL 语句

| 语句类型 | 租户注入 | 数据库改写 | 说明 |
|---------|---------|-----------|------|
| SELECT  | ✅ | ✅ | 支持 JOIN、子查询、UNION |
| INSERT  | ✅ | ✅ | 校验 INSERT 中是否包含租户字段 |
| UPDATE  | ✅ | ✅ | 自动添加 WHERE 租户条件 |
| DELETE  | ✅ | ✅ | 自动添加 WHERE 租户条件 |
| REPLACE | ❌ | ✅ | 计划中 |
| EXPLAIN / DESCRIBE | ✅ | ✅ | 透传改写内部语句 |
| DDL (CREATE/ALTER/DROP) | — | — | 透传不改写 |

## 架构

```
┌───────────────────────────────────────────────┐
│              Application Layer                │
│       SqlParserService  |  SqlRewriter         │
└──────────────────┬────────────────────────────┘
                   │
┌──────────────────▼────────────────────────────┐
│            Orchestrator Layer                  │
│        SQLProcessorOrchestrator                │
└──────────────────┬────────────────────────────┘
                   │
┌──────────────────▼────────────────────────────┐
│         Listener Chain (按优先级执行)           │
│  HintListener (10)                             │
│  DatabaseRewriteListener (50)                  │
│  TenantFilterListener (100)                    │
└──────────────────┬────────────────────────────┘
                   │
┌──────────────────▼────────────────────────────┐
│              Parser Layer                      │
│  ParserFactory → BaseSQLParser → MySQLParser   │
└──────────────────┬────────────────────────────┘
                   │
┌──────────────────▼────────────────────────────┐
│         ANTLR4 Generated Code                  │
│  grammar/mysql/*.g4 → generated/mysql/         │
└───────────────────────────────────────────────┘
```

**Listener 链执行流程：**

1. `HintListener` (优先级 10) — 从 SQL 中提取并移除 `/*& tenant:'xxx' */` Hint，存入 SharedState
2. `DatabaseRewriteListener` (优先级 50) — 改写 `db.table` 中的数据库名前缀
3. `TenantFilterListener` (优先级 100) — 根据 SharedState 中的租户信息，注入 WHERE 条件

各 Listener 通过 `ListenerContext.sharedState` 进行通信，通过 `TokenStreamRewriter` 修改 SQL 同时保留原始格式。

## 目录结构

```
├── grammar/mysql/          # ANTLR4 语法文件 (.g4)
├── generated/mysql/        # ANTLR4 生成的解析器代码（勿手动编辑）
├── src/
│   ├── index.ts            # 入口：SqlParserService, SqlRewriter
│   ├── core/               # 类型定义、枚举、ANTLR4 类型别名
│   ├── config/             # ConfigManager 配置管理
│   ├── parser/             # BaseSQLParser, MySQLParser, ParserFactory
│   ├── adapter/            # 方言适配器
│   ├── listeners/
│   │   ├── base/           # BaseListener, ListenerChain
│   │   ├── tenant/         # HintListener, TenantFilterListener
│   │   └── database/       # DatabaseRewriteListener
│   ├── orchestrator/       # SQLProcessorOrchestrator
│   └── utils/              # ListenerBinder, Antlr4Loader, TenantIdValidator
├── test/                   # 测试文件 (144 个测试用例)
└── lib/                    # 编译输出
```

## 开发

### 环境要求

- Node.js >= 16
- pnpm

### 常用命令

```bash
# 安装依赖
pnpm install

# 生成 ANTLR4 解析器（修改 .g4 语法文件后需运行）
pnpm run generate:parser        # MySQL
pnpm run generate:parser:tidb   # TiDB
pnpm run generate:all           # 全部

# 构建
pnpm run build

# 测试
pnpm run test                   # 租户过滤测试
pnpm run test:database          # 数据库改写测试
pnpm run test:error             # 错误处理测试
pnpm run test:all               # 全部测试
```

### 添加新 Listener

1. 在 `src/listeners/` 下创建新目录和 Listener 类，继承 `BaseListener`
2. 实现 `process()` 方法和 `getPriority()` 方法
3. 在 `SQLProcessorOrchestrator` 中注册 Listener
4. 注意：ANTLR4 生成的 Listener 基类会将所有方法定义为 `undefined` 属性，需使用 `ListenerBinder.bindAllEnterExit()` 绑定原型方法

## 从 @cs/sql-parser 迁移

```typescript
// 旧版本
import SqlParserService from '@cs/sql-parser';

// 新版本（只需修改包名）
import SqlParserService from '@cs/sql-parser-antlr4';

// API 完全兼容，无需修改其他代码
```

**迁移带来的改进：**

- 从 node-sql-parser 迁移到 ANTLR4，SQL 解析更精确
- `TokenStreamRewriter` 保留原始格式，不再重新生成 SQL
- 新增数据库名改写功能
- 新增批量处理详细结果（`batchRewriteWithDetails`）
- 结构化错误层次体系

## 许可证

ISC
