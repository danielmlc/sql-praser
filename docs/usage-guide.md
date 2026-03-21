# @cs/sql-parser-antlr4 使用指南

## 目录

- [概述](#概述)
- [安装与配置](#安装与配置)
- [基础用法](#基础用法)
  - [静态 API（SqlParserService）](#静态-apisqlparserservice)
  - [实例 API（SqlRewriter）](#实例-apisqlrewriter)
- [租户隔离](#租户隔离)
  - [Hint 语法](#hint-语法)
  - [SELECT 语句](#select-语句)
  - [INSERT 语句](#insert-语句)
  - [UPDATE 语句](#update-语句)
  - [DELETE 语句](#delete-语句)
  - [JOIN 查询](#join-查询)
  - [子查询](#子查询)
  - [UNION 查询](#union-查询)
  - [CTE（WITH 子句）](#ctewith-子句)
  - [EXPLAIN / DESCRIBE](#explain--describe)
- [数据库名改写](#数据库名改写)
  - [基本改写](#基本改写)
  - [目标库过滤](#目标库过滤)
  - [排除库名](#排除库名)
  - [反引号支持](#反引号支持)
- [组合使用](#组合使用)
- [配置管理](#配置管理)
  - [完整配置结构](#完整配置结构)
  - [目标数据库配置](#目标数据库配置)
  - [错误处理配置](#错误处理配置)
  - [动态修改配置](#动态修改配置)
- [工具方法](#工具方法)
  - [Hint 操作](#hint-操作)
  - [SQL 校验与分析](#sql-校验与分析)
  - [批量处理](#批量处理)
- [错误处理](#错误处理)
- [迁移指南](#迁移指南)
- [注意事项](#注意事项)

---

## 概述

`@cs/sql-parser-antlr4` 是基于 ANTLR4 的 SQL 解析器，核心功能：

1. **租户条件自动注入** — 通过 SQL Hint 指定租户 ID，解析器自动为 DML 语句注入租户过滤条件
2. **数据库名改写** — 为跨库 SQL 中的 `db.table` 格式自动添加环境前缀
3. **格式保留** — 使用 `TokenStreamRewriter` 实现非破坏性改写，保留原始格式、注释和空白

## 安装与配置

```bash
pnpm add @cs/sql-parser-antlr4
```

## 基础用法

### 静态 API（SqlParserService）

`SqlParserService` 提供静态方法，全局共享一个配置实例，适合简单场景：

```typescript
import SqlParserService from '@cs/sql-parser-antlr4';

// 使用 Hint 指定租户，自动注入 WHERE 条件
const sql = "/*& tenant:'sxlq' */ SELECT * FROM tnt_ma.users";
const result = SqlParserService.rewriteWithTenant(sql);
// => SELECT * FROM tnt_ma.users WHERE `users`.`tenant` = 'sxlq'
```

带详细信息的改写：

```typescript
const detail = SqlParserService.rewriteWithDetails(sql);
console.log(detail.sql);                 // 改写后的 SQL
console.log(detail.modified);            // true
console.log(detail.hint?.tenant);        // 'sxlq'
console.log(detail.listenerResults);     // 各 Listener 执行结果数组
```

### 实例 API（SqlRewriter）

`SqlRewriter` 支持独立配置，适合多配置场景（如不同服务使用不同租户字段）：

```typescript
import { SqlRewriter } from '@cs/sql-parser-antlr4';

const rewriter = new SqlRewriter({
  dialect: 'mysql',
  listeners: {
    hint: {
      enabled: true,
      priority: 10,
      abortOnError: false,
      preserveHint: false,    // 改写后移除 Hint
    },
    tenant: {
      enabled: true,
      priority: 100,
      abortOnError: false,
      tenantField: 'tenant_id',  // 自定义租户字段名
      targetDatabases: {
        prefixes: ['tnt_'],
        fullNames: ['global_mb'],
        defaultDatabase: 'tnt_ma',
      },
    },
  },
});

const result = rewriter.rewrite("/*& tenant:'t001' */ SELECT * FROM tnt_ma.orders");
console.log(result.sql);
// => SELECT * FROM tnt_ma.orders WHERE `orders`.`tenant_id` = 't001'
```

---

## 租户隔离

### Hint 语法

租户信息通过 SQL 注释 Hint 传递：

```sql
/*& tenant:'租户编码' */
```

规则：
- 支持单引号或双引号：`/*& tenant:'abc' */` 或 `/*& tenant:"abc" */`
- 大小写不敏感：`/*& TENANT:'abc' */` 同样有效
- 通常放在 SQL 语句最前面
- 租户编码仅允许 `[a-zA-Z0-9_-]`，最大长度 128 字符

### SELECT 语句

基本查询自动注入 WHERE 条件：

```typescript
// 输入
"/*& tenant:'sxlq' */ SELECT * FROM tnt_ma.users"

// 输出
"SELECT * FROM tnt_ma.users WHERE `users`.`tenant` = 'sxlq'"
```

已有 WHERE 子句时，使用 AND 连接：

```typescript
// 输入
"/*& tenant:'sxlq' */ SELECT * FROM tnt_ma.users WHERE age > 18"

// 输出
"SELECT * FROM tnt_ma.users WHERE age > 18 AND `users`.`tenant` = 'sxlq'"
```

### INSERT 语句

INSERT 语句不添加 WHERE，而是校验并注入租户字段到列列表和值列表中：

```typescript
// 输入：INSERT INTO ... (columns) VALUES ...
"/*& tenant:'sxlq' */ INSERT INTO tnt_ma.users (name, age) VALUES ('Alice', 25)"

// 输出：自动在列列表和值列表开头插入租户字段
"INSERT INTO tnt_ma.users ( tenant, name, age) VALUES ( 'sxlq', 'Alice', 25)"
```

INSERT ... SET 语法同样支持：

```typescript
// 输入
"/*& tenant:'sxlq' */ INSERT INTO tnt_ma.users SET name = 'Alice', age = 25"

// 输出
"INSERT INTO tnt_ma.users SET name = 'Alice', age = 25, tenant = 'sxlq'"
```

### UPDATE 语句

UPDATE 语句自动在 WHERE 子句中追加租户条件：

```typescript
// 输入
"/*& tenant:'sxlq' */ UPDATE tnt_ma.users SET name = 'Bob' WHERE id = 1"

// 输出
"UPDATE tnt_ma.users SET name = 'Bob' WHERE id = 1 AND `users`.`tenant` = 'sxlq'"
```

### DELETE 语句

DELETE 语句同样自动追加租户条件：

```typescript
// 输入
"/*& tenant:'sxlq' */ DELETE FROM tnt_ma.users WHERE id = 1"

// 输出
"DELETE FROM tnt_ma.users WHERE id = 1 AND `users`.`tenant` = 'sxlq'"
```

### JOIN 查询

多表 JOIN 时，为每个匹配的表都注入租户条件：

```typescript
// 输入
"/*& tenant:'sxlq' */ SELECT u.name, o.total FROM tnt_ma.users u JOIN tnt_ma.orders o ON u.id = o.user_id"

// 输出
"SELECT u.name, o.total FROM tnt_ma.users u JOIN tnt_ma.orders o ON u.id = o.user_id WHERE u.tenant = 'sxlq' AND o.tenant = 'sxlq'"
```

带别名的表使用别名作为前缀：

```typescript
// 输入
"/*& tenant:'sxlq' */ SELECT * FROM tnt_ma.users AS u WHERE u.age > 18"

// 输出
"SELECT * FROM tnt_ma.users AS u WHERE u.age > 18 AND u.tenant = 'sxlq'"
```

### 子查询

子查询中的每个 SELECT 层级独立注入租户条件：

```typescript
// 输入
"/*& tenant:'sxlq' */ SELECT * FROM tnt_ma.users WHERE id IN (SELECT user_id FROM tnt_ma.orders)"

// 输出
"SELECT * FROM tnt_ma.users WHERE id IN (SELECT user_id FROM tnt_ma.orders WHERE `orders`.`tenant` = 'sxlq') AND `users`.`tenant` = 'sxlq'"
```

### UNION 查询

UNION 的每个分支独立注入：

```typescript
// 输入
"/*& tenant:'sxlq' */ SELECT name FROM tnt_ma.users UNION SELECT name FROM tnt_ma.admins"

// 输出
"SELECT name FROM tnt_ma.users WHERE `users`.`tenant` = 'sxlq' UNION SELECT name FROM tnt_ma.admins WHERE `admins`.`tenant` = 'sxlq'"
```

### CTE（WITH 子句）

CTE 定义的临时表名不会被注入租户条件，避免重复注入：

```typescript
// 输入
"/*& tenant:'sxlq' */ WITH active_users AS (SELECT * FROM tnt_ma.users WHERE active = 1) SELECT * FROM active_users"

// 输出（CTE 内部的 SELECT 会注入，但引用 CTE 的外层 SELECT 不会对 active_users 再注入）
"WITH active_users AS (SELECT * FROM tnt_ma.users WHERE active = 1 AND `users`.`tenant` = 'sxlq') SELECT * FROM active_users"
```

### EXPLAIN / DESCRIBE

EXPLAIN 语句会透传改写内部 SQL：

```typescript
// 输入
"/*& tenant:'sxlq' */ EXPLAIN SELECT * FROM tnt_ma.users"

// 输出
"EXPLAIN SELECT * FROM tnt_ma.users WHERE `users`.`tenant` = 'sxlq'"
```

---

## 数据库名改写

通过 `DatabaseRewriteListener` 为 SQL 中的 `db.table` 格式自动添加环境前缀。

### 基本改写

```typescript
import { SqlRewriter } from '@cs/sql-parser-antlr4';

const rewriter = new SqlRewriter({
  listeners: {
    hint: { enabled: true, priority: 10, abortOnError: false, preserveHint: false },
    tenant: { enabled: false, priority: 100, abortOnError: false, tenantField: 'tenant', targetDatabases: { prefixes: [], fullNames: [], defaultDatabase: '' } },
    databaseRewrite: {
      enabled: true,
      priority: 50,
      abortOnError: false,
      dbPrefix: 'dev_mc_',
    },
  },
});

const result = rewriter.rewrite("SELECT * FROM mydb.users");
console.log(result.sql);
// => SELECT * FROM dev_mc_mydb.users
```

多表场景同样支持：

```typescript
rewriter.rewrite("SELECT * FROM mydb.users u JOIN mydb.orders o ON u.id = o.uid");
// => SELECT * FROM dev_mc_mydb.users u JOIN dev_mc_mydb.orders o ON u.id = o.uid
```

### 目标库过滤

只改写指定的数据库名：

```typescript
const rewriter = new SqlRewriter({
  listeners: {
    // ... hint/tenant 配置省略
    databaseRewrite: {
      enabled: true,
      priority: 50,
      abortOnError: false,
      dbPrefix: 'dev_mc_',
      targetDatabases: ['mydb'],  // 仅改写 mydb
    },
  },
});

rewriter.rewrite("SELECT * FROM mydb.users JOIN otherdb.logs ON ...");
// mydb → dev_mc_mydb（在目标列表中）
// otherdb → 不改写（不在目标列表中）
```

### 排除库名

排除某些数据库名不被改写：

```typescript
const rewriter = new SqlRewriter({
  listeners: {
    // ... 其他配置省略
    databaseRewrite: {
      enabled: true,
      priority: 50,
      abortOnError: false,
      dbPrefix: 'dev_mc_',
      excludeDatabases: ['system', 'information_schema'],
    },
  },
});

rewriter.rewrite("SELECT * FROM system.config");
// system → 不改写（在排除列表中）
```

### 反引号支持

改写时自动保留反引号格式：

```typescript
rewriter.rewrite("SELECT * FROM `mydb`.`users`");
// => SELECT * FROM `dev_mc_mydb`.`users`
```

### 幂等性

已有前缀的数据库名不会被重复添加：

```typescript
rewriter.rewrite("SELECT * FROM dev_mc_mydb.users");
// => SELECT * FROM dev_mc_mydb.users（不变）
```

---

## 组合使用

租户注入和数据库改写可以同时启用，按优先级顺序执行：

```typescript
const rewriter = new SqlRewriter({
  dialect: 'mysql',
  listeners: {
    hint: {
      enabled: true,
      priority: 10,         // 最先执行：提取 Hint
      abortOnError: false,
      preserveHint: false,
    },
    databaseRewrite: {
      enabled: true,
      priority: 50,         // 第二执行：改写库名
      abortOnError: false,
      dbPrefix: 'prod_',
    },
    tenant: {
      enabled: true,
      priority: 100,        // 最后执行：注入租户条件
      abortOnError: false,
      tenantField: 'tenant',
      targetDatabases: {
        prefixes: ['tnt_'],
        fullNames: [],
        defaultDatabase: 'tnt_ma',
      },
    },
  },
});

const result = rewriter.rewrite(
  "/*& tenant:'sxlq' */ SELECT * FROM mydb.orders WHERE status = 'active'"
);
// 1. HintListener: 提取 tenant='sxlq'，移除 Hint
// 2. DatabaseRewriteListener: mydb → prod_mydb
// 3. TenantFilterListener: 注入 WHERE 租户条件
// 最终: SELECT * FROM prod_mydb.orders WHERE status = 'active' AND `orders`.`tenant` = 'sxlq'
```

---

## 配置管理

### 完整配置结构

```typescript
interface SqlParserConfig {
  /** 数据库方言：'mysql' | 'tidb' */
  dialect: SQLDialect;

  /** Listener 配置 */
  listeners: {
    /** Hint 提取 Listener */
    hint: {
      enabled: boolean;         // 是否启用
      priority: number;         // 执行优先级（数字越小越先执行）
      abortOnError: boolean;    // 出错时是否中断后续 Listener
      preserveHint: boolean;    // 是否保留 Hint 不移除
    };

    /** 租户过滤 Listener */
    tenant: {
      enabled: boolean;
      priority: number;
      abortOnError: boolean;
      tenantField: string;      // 租户字段名（如 'tenant'、'tenant_id'）
      targetDatabases: {
        prefixes: string[];     // 匹配的库名前缀列表
        fullNames: string[];    // 匹配的完整库名列表
        defaultDatabase: string;// 无库名时使用的默认库名
      };
    };

    /** 库名改写 Listener（可选） */
    databaseRewrite?: {
      enabled: boolean;
      priority: number;
      abortOnError: boolean;
      dbPrefix: string;          // 添加的库名前缀
      targetDatabases?: string[];// 仅改写的目标库名列表
      excludeDatabases?: string[];// 排除的库名列表
    };
  };

  /** 错误处理配置 */
  errorHandling: {
    throwOnError: boolean;   // 解析失败是否抛异常
    collectAll: boolean;     // 是否收集所有错误
    maxErrors: number;       // 最大错误数
    logErrors: boolean;      // 是否记录错误
  };
}
```

### 目标数据库配置

租户过滤的 `targetDatabases` 决定哪些表需要注入租户条件：

```typescript
targetDatabases: {
  // 匹配前缀：库名以 'tnt_' 开头的表都会注入
  prefixes: ['tnt_'],

  // 精确匹配：完整库名 'global_mb' 的表也会注入
  fullNames: ['global_mb'],

  // 默认库名：没有指定库名的表（如 SELECT * FROM users），
  // 视为属于此库来判断是否注入
  defaultDatabase: 'tnt_ma',
}
```

**匹配规则：**

1. 有库名前缀的表（`tnt_ma.users`）→ 提取 `tnt_ma`，检查前缀和完整名
2. 没有库名的表（`users`）→ 使用 `defaultDatabase` 作为库名进行匹配
3. 如果库名不匹配任何规则，该表**不会**注入租户条件

### 错误处理配置

```typescript
// 严格模式：解析失败立即抛出异常
const strictRewriter = new SqlRewriter({
  errorHandling: {
    throwOnError: true,
    collectAll: false,
    maxErrors: 1,
    logErrors: true,
  },
});

// 宽松模式（默认）：返回原始 SQL，不抛异常
const lenientRewriter = new SqlRewriter({
  errorHandling: {
    throwOnError: false,
    collectAll: true,
    maxErrors: 100,
    logErrors: true,
  },
});
```

### 动态修改配置

使用静态 API 时，可以动态修改全局配置：

```typescript
import SqlParserService from '@cs/sql-parser-antlr4';

// 修改租户字段名
SqlParserService.setTenantField('org_id');

// 添加目标数据库前缀
SqlParserService.addDatabasePrefix('biz_');

// 添加精确匹配的库名
SqlParserService.addDatabaseName('shared_db');

// 设置默认数据库
SqlParserService.setDefaultDatabase('my_default_db');

// 批量设置目标数据库配置
SqlParserService.setTargetDatabases({
  prefixes: ['tnt_', 'biz_'],
  fullNames: ['global_mb'],
  defaultDatabase: 'tnt_ma',
});

// 完整替换配置
SqlParserService.setConfig({
  dialect: 'mysql',
  listeners: { /* ... */ },
});
```

使用实例 API 时：

```typescript
const rewriter = new SqlRewriter(initialConfig);

// 更新配置（会与默认配置合并）
rewriter.updateConfig({
  listeners: {
    tenant: {
      tenantField: 'company_id',
    },
  },
});

// 获取当前配置
const config = rewriter.getConfig();
```

---

## 工具方法

### Hint 操作

```typescript
import SqlParserService from '@cs/sql-parser-antlr4';

// 检测是否包含 Hint
SqlParserService.hasHint("/*& tenant:'sxlq' */ SELECT 1");  // true
SqlParserService.hasHint("SELECT 1");                         // false

// 提取 Hint 信息
const hint = SqlParserService.extractHint("/*& tenant:'sxlq' */ SELECT 1");
// hint = { tenant: 'sxlq', original: "/*& tenant:'sxlq' */" }

// 移除 Hint
SqlParserService.removeHints("/*& tenant:'sxlq' */ SELECT 1");
// => " SELECT 1"

// 创建 Hint 字符串
SqlParserService.createHint('sxlq');
// => "/*& tenant:'sxlq' */"

// 在 SQL 前添加 Hint
SqlParserService.addHintToSql('SELECT 1', 'sxlq');
// => "/*& tenant:'sxlq' */ SELECT 1"
```

### SQL 校验与分析

```typescript
// 验证 SQL 语法是否合法
SqlParserService.validateSql("SELECT * FROM users");         // true
SqlParserService.validateSql("SELEC * FORM users");          // false

// 获取 SQL 类型
SqlParserService.getSqlType("SELECT * FROM users");          // 'SELECT'
SqlParserService.getSqlType("INSERT INTO t VALUES (1)");     // 'INSERT'
SqlParserService.getSqlType("UPDATE t SET a = 1");           // 'UPDATE'
SqlParserService.getSqlType("DELETE FROM t");                // 'DELETE'
SqlParserService.getSqlType("EXPLAIN SELECT 1");             // 'EXPLAIN'

// 验证租户编码格式
SqlParserService.isValidTenant('sxlq');         // true
SqlParserService.isValidTenant('tenant-01');     // true
SqlParserService.isValidTenant("'; DROP TABLE"); // false（含特殊字符）

// 移除所有注释（块注释和行注释）
SqlParserService.removeAllComments("/* comment */ SELECT 1 -- end");
// => "SELECT 1"

// 获取 SQL 详细信息（一次性获取多个信息）
const info = SqlParserService.getDetailedInfo("/*& tenant:'sxlq' */ SELECT * FROM users");
// info.hasHint    = true
// info.hint       = { tenant: 'sxlq', original: "/*& tenant:'sxlq' */" }
// info.sqlType    = 'SELECT'
// info.isValid    = true
// info.cleanSql   = "SELECT * FROM users"
```

### 批量处理

```typescript
// 批量改写（仅返回 SQL 字符串）
const sqlList = [
  "/*& tenant:'sxlq' */ SELECT * FROM tnt_ma.users",
  "/*& tenant:'sxlq' */ SELECT * FROM tnt_ma.orders",
];
const results = SqlParserService.batchRewrite(sqlList);
// results[0] = "SELECT * FROM tnt_ma.users WHERE `users`.`tenant` = 'sxlq'"
// results[1] = "SELECT * FROM tnt_ma.orders WHERE `orders`.`tenant` = 'sxlq'"

// 批量改写（返回详细结果，包含错误信息）
const detailedResults = SqlParserService.batchRewriteWithDetails(sqlList);
// detailedResults[0].sql       - 改写后的 SQL
// detailedResults[0].modified  - 是否被修改
// detailedResults[0].error     - 如有错误则为 Error 对象
```

---

## 错误处理

解析器提供了结构化的错误层次：

```typescript
import {
  SqlParseError,
  ConfigError,
  ParserError,
  HintParseError,
  TransformError,
  UnsupportedSqlError,
  ErrorUtils,
} from '@cs/sql-parser-antlr4';

try {
  const result = SqlParserService.rewriteWithTenant(sql);
} catch (error) {
  if (ErrorUtils.isSqlParseError(error)) {
    // 结构化错误
    console.log(error.type);         // 错误类型枚举
    console.log(error.originalSql);  // 导致错误的原始 SQL
    console.log(error.cause);        // 根本原因
    console.log(ErrorUtils.formatError(error));  // 格式化的错误信息
  }

  if (error instanceof ConfigError) {
    // 配置错误（如租户字段为空）
  } else if (error instanceof ParserError) {
    // SQL 解析错误
  } else if (error instanceof HintParseError) {
    // Hint 解析错误
  } else if (error instanceof TransformError) {
    // Listener 转换错误
  } else if (error instanceof UnsupportedSqlError) {
    // 不支持的 SQL 类型
    console.log(error.sqlType);  // 如 'MERGE'
  }
}
```

使用 `batchRewriteWithDetails` 时，错误不会抛出，而是包含在结果中：

```typescript
const results = SqlParserService.batchRewriteWithDetails(sqlList);
for (const result of results) {
  if (result.error) {
    console.error(`SQL 处理失败: ${result.error.message}`);
    console.log(`原始 SQL: ${result.sql}`);  // 失败时返回原始 SQL
  } else {
    console.log(`改写成功: ${result.sql}`);
  }
}
```

---

## 迁移指南

从 `@cs/sql-parser`（基于 node-sql-parser）迁移到 `@cs/sql-parser-antlr4`：

### 步骤 1：更换依赖

```bash
pnpm remove @cs/sql-parser
pnpm add @cs/sql-parser-antlr4
```

### 步骤 2：修改导入

```typescript
// 修改前
import SqlParserService from '@cs/sql-parser';

// 修改后
import SqlParserService from '@cs/sql-parser-antlr4';
```

API 完全兼容，无需修改其他代码。

### 行为差异

| 特性 | @cs/sql-parser | @cs/sql-parser-antlr4 |
|------|---------------|----------------------|
| 解析引擎 | node-sql-parser | ANTLR4 |
| 格式保留 | 重新生成 SQL，格式可能变化 | TokenStreamRewriter，完整保留格式 |
| 数据库改写 | 不支持 | `DatabaseRewriteListener` |
| 错误类型 | 通用 Error | 结构化错误层次 |
| 批量详细结果 | 不支持 | `batchRewriteWithDetails` |

---

## 注意事项

1. **无库名的表不会注入租户条件**
   - `SELECT * FROM users` 中的 `users` 默认使用 `defaultDatabase` 配置来判断是否需要注入
   - 如果 `defaultDatabase` 未配置或不匹配任何规则，则跳过

2. **DDL 语句不会被改写**
   - `CREATE TABLE`、`ALTER TABLE`、`DROP TABLE` 等 DDL 语句会透传，不会注入租户条件

3. **INSERT 不添加 WHERE**
   - INSERT 语句通过在列列表和值列表中插入租户字段来实现隔离，不是 WHERE 条件

4. **CTE 表名不重复注入**
   - `WITH cte AS (...)` 中定义的 CTE 名称不会被当作需要注入的表

5. **SQL 注入防护**
   - 租户 ID 会经过 `TenantIdValidator` 校验，仅允许 `[a-zA-Z0-9_-]` 字符
   - 非法租户 ID 会抛出异常

6. **库名改写的幂等性**
   - 已包含指定前缀的库名不会被重复添加
   - `dev_mc_mydb` 配置前缀为 `dev_mc_` 时不会变成 `dev_mc_dev_mc_mydb`

7. **性能**
   - ANTLR4 解析有一定开销，首次解析较慢（需要初始化词法/语法分析器）
   - 后续解析会利用缓存，性能显著提升
   - 建议在高频场景下复用 `SqlRewriter` 实例
