# 数据库名改写功能

SQL Parser 新增了独立的数据库名改写功能，可以根据配置对SQL语句中出现的数据库名进行改写，与租户条件添加功能完全独立。

## 功能特性

### 🎯 核心功能

- **独立改写**: 与租户条件添加功能完全分离，可单独使用
- **前缀添加**: 支持为数据库名添加前缀，如 `pf_db` → `dev_mc_pf_db`
- **选择性改写**: 支持指定目标数据库列表或排除列表
- **全SQL支持**: 支持 SELECT、INSERT、UPDATE、DELETE 等各种SQL语句
- **JOIN处理**: 正确处理JOIN子句中的数据库引用
- **子查询支持**: 支持嵌套查询中的数据库名改写

### 📋 配置选项

```typescript
interface DatabaseRewriteConfig {
  enabled: boolean;                    // 是否启用，默认false
  dbPrefix: string;                   // 数据库前缀，如 'dev_mc_'
  targetDatabases?: string[];         // 目标数据库列表，空则改写所有
  excludeDatabases?: string[];        // 排除数据库列表
  preserveOriginalName?: boolean;     // 是否保留原名，默认true
}
```

## 使用方式

### 基础用法

```typescript
import { SqlRewriter } from '@cs/sql-parser';

const config = {
  tenantField: 'tenant',
  database: 'mysql',
  throwOnError: true,
  databaseRewrite: {
    enabled: true,
    dbPrefix: 'dev_mc_',
    preserveOriginalName: true
  }
};

const rewriter = new SqlRewriter(config);
const result = rewriter.rewrite('SELECT * FROM pf_db.users WHERE id = 1');

console.log(result.sql);
// 输出: SELECT * FROM dev_mc_pf_db.users WHERE id = 1

console.log(result.databaseRewrites);
// 输出: [{ originalName: 'pf_db', rewrittenName: 'dev_mc_pf_db', modified: true }]
```

### 高级配置

#### 1. 选择性改写 - 只改写指定数据库

```typescript
const config = {
  // ... 其他配置
  databaseRewrite: {
    enabled: true,
    dbPrefix: 'dev_mc_',
    targetDatabases: ['pf_db', 'user_db'], // 只改写这些数据库
  }
};

const sql = 'SELECT * FROM pf_db.users u JOIN system_db.configs c ON u.id = c.id';
const result = rewriter.rewrite(sql);
// 结果: SELECT * FROM dev_mc_pf_db.users u JOIN system_db.configs c ON u.id = c.id
```

#### 2. 排除特定数据库

```typescript
const config = {
  // ... 其他配置
  databaseRewrite: {
    enabled: true,
    dbPrefix: 'dev_mc_',
    excludeDatabases: ['system_db', 'mysql'], // 排除系统数据库
  }
};
```

#### 3. 与租户条件同时使用

```typescript
const config = {
  tenantField: 'tenant',
  database: 'mysql',
  throwOnError: true,
  targetDatabases: {
    prefixes: ['pf_'],
    fullNames: [],
    defaultDatabase: 'main',
  },
  databaseRewrite: {
    enabled: true,
    dbPrefix: 'dev_mc_',
  }
};

const sql = '/*& tenant:\'test123\' */ SELECT * FROM pf_db.users WHERE status = 1';
const result = rewriter.rewrite(sql);

// 同时进行数据库改写和租户条件添加
console.log(result.sql);
// 输出: /*& tenant:'test123' */ SELECT * FROM dev_mc_pf_db.users WHERE status = 1 AND tenant = 'test123'
```

## 支持的SQL语句类型

### SELECT 语句

```sql
-- 原始
SELECT u.name, p.title
FROM pf_db.users u
JOIN pf_db.posts p ON u.id = p.user_id

-- 改写后
SELECT u.name, p.title
FROM dev_mc_pf_db.users u
JOIN dev_mc_pf_db.posts p ON u.id = p.user_id
```

### INSERT 语句

```sql
-- 原始
INSERT INTO pf_db.users (name, email) VALUES ('John', 'john@example.com')

-- 改写后
INSERT INTO dev_mc_pf_db.users (name, email) VALUES ('John', 'john@example.com')
```

### UPDATE 语句

```sql
-- 原始
UPDATE pf_db.users SET status = 1 WHERE id = 123

-- 改写后
UPDATE dev_mc_pf_db.users SET status = 1 WHERE id = 123
```

### DELETE 语句

```sql
-- 原始
DELETE FROM pf_db.logs WHERE created < '2024-01-01'

-- 改写后
DELETE FROM dev_mc_pf_db.logs WHERE created < '2024-01-01'
```

### 复杂查询

```sql
-- 原始
WITH recent_users AS (
  SELECT * FROM pf_db.users WHERE created > '2024-01-01'
)
SELECT u.name, COUNT(o.id) as order_count
FROM recent_users u
LEFT JOIN order_db.orders o ON u.id = o.user_id
GROUP BY u.id

-- 改写后
WITH recent_users AS (
  SELECT * FROM dev_mc_pf_db.users WHERE created > '2024-01-01'
)
SELECT u.name, COUNT(o.id) as order_count
FROM recent_users u
LEFT JOIN dev_mc_order_db.orders o ON u.id = o.user_id
GROUP BY u.id
```

## 集成到 nest-typeorm

在 nest-typeorm 的 HintConfig 中配置：

```typescript
const hintConfig = {
  enabled: true,
  mode: HintMode.isTenant,
  sqlRewrite: {
    enabled: true,
    config: {
      tenantField: 'tenant',
      targetDatabases: {
        prefixes: ['tnt_'],
        fullNames: [],
        defaultDatabase: 'main',
      }
    }
  },
  // 新增数据库改写配置
  sqlFilter: {
    enabled: true,
    // ... SQL过滤配置
  }
};

// 在 SqlRewriter 创建时传入数据库改写配置
const sqlRewriter = new SqlRewriter({
  tenantField: 'tenant',
  database: 'mysql',
  throwOnError: false,
  targetDatabases: hintConfig.sqlRewrite.config.targetDatabases,
  databaseRewrite: {
    enabled: true,
    dbPrefix: process.env.DB_PREFIX || 'dev_mc_',
    excludeDatabases: ['information_schema', 'performance_schema', 'mysql', 'sys']
  }
});
```

## 调试和日志

改写结果包含详细的改写信息：

```typescript
interface RewriteResult {
  sql: string;                        // 改写后的SQL
  modified: boolean;                  // 是否有任何修改
  hint?: HintInfo;                   // hint信息
  databaseRewrites?: DatabaseRewriteResult[]; // 数据库改写详情
}

interface DatabaseRewriteResult {
  originalName: string;               // 原始数据库名
  rewrittenName: string;             // 改写后数据库名
  modified: boolean;                 // 是否被修改
}
```

## 性能考虑

- 数据库名改写在AST层面进行，性能开销极小
- 改写过程与租户条件添加并行进行，不会增加额外的SQL解析开销
- 支持缓存和批量处理

## 注意事项

1. **配置优先级**: `excludeDatabases` 优先于 `targetDatabases`
2. **大小写敏感**: 数据库名匹配是大小写敏感的
3. **原名保留**: `preserveOriginalName: true` 时会保留原数据库名作为后缀
4. **错误处理**: 当 `throwOnError: false` 时，改写失败不会影响SQL执行

## API 参考

### DatabaseNameRewriter 类

```typescript
class DatabaseNameRewriter {
  constructor(config: DatabaseRewriteConfig);
  rewriteAst(ast: AST | AST[]): DatabaseRewriteResult[];
  getConfig(): DatabaseRewriteConfig;
  updateConfig(newConfig: Partial<DatabaseRewriteConfig>): void;
  static create(config: DatabaseRewriteConfig): DatabaseNameRewriter;
  static isValidConfig(config: any): boolean;
}
```

### SqlRewriter 扩展

```typescript
class SqlRewriter {
  // 现有方法保持不变
  updateConfig(newConfig: Partial<SqlParserConfig>): void; // 现在支持数据库改写配置
  rewrite(sql: string): RewriteResult; // 现在包含 databaseRewrites 字段
}
```