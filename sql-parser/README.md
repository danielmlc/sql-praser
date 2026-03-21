# @cs/sql-parser

一个强大的SQL解析器，用于自动为SQL语句添加租户过滤条件。通过解析SQL注释中的hint信息，自动在查询中注入租户隔离逻辑。


## 📦 安装

```bash
pnpm add @cs/sql-parser
```

## 🔧 基本用法

### 简单使用

```typescript
import SqlParserService from '@cs/sql-parser';

// 基本SELECT查询
const sql = "/*& tenant:'sxlq' */ SELECT * FROM users";
const result = SqlParserService.rewriteWithTenant(sql);
console.log(result); 
// 输出: SELECT * FROM `users` WHERE `users`.`tenant` = 'sxlq'

// INSERT语句
const insertSql = "/*& tenant:'sxlq' */ INSERT INTO users (username, email) VALUES ('john', 'john@example.com')";
const insertResult = SqlParserService.rewriteWithTenant(insertSql);
console.log(insertResult);
// 输出: INSERT INTO `users` (username, email, tenant) VALUES ('john','john@example.com','sxlq')
```

### 配置租户字段

```typescript
// 设置全局租户字段名（默认为'tenant'）
SqlParserService.setTenantField('org_id');

// 或者设置完整配置
SqlParserService.setConfig({
  tenantField: 'org_id',
  database: 'mysql',
  throwOnError: true,
  targetDatabases: {
    prefixes: ['tnt_', 'app_'],
    fullNames: ['global_mb', 'special_db']
  }
});
```

### 配置目标库（新功能）

**选择性SQL改写**：只对特定库进行租户条件注入，支持跨库联查场景

```typescript
// 设置目标库配置
SqlParserService.setTargetDatabases({
  prefixes: ['tnt_', 'app_'],  // 前缀匹配：tnt_main, tnt_order, app_data等
  fullNames: ['global_mb'],    // 全名匹配：global_mb库
  defaultDatabase: 'main'      // 默认库名（必须设置）
});

// 动态添加数据库前缀
SqlParserService.addDatabasePrefix('tenant_');

// 动态添加完整数据库名
SqlParserService.addDatabaseName('special_database');

// 设置默认库名（用于处理无库名的表）
SqlParserService.setDefaultDatabase('tnt_main');
```

### 📋 **默认库处理机制（重要）**

当SQL中的表没有指定库名时（如 `SELECT * FROM users`），系统会使用配置的`defaultDatabase`来判断是否需要添加租户条件：

```typescript
// 示例：设置默认库为目标库
SqlParserService.setDefaultDatabase('tnt_main');

// 无库名表将被当作 tnt_main.users 处理
"SELECT * FROM users" 
// → 添加租户条件（因为tnt_main匹配前缀tnt_）

// 示例：设置默认库为非目标库  
SqlParserService.setDefaultDatabase('public');

// 无库名表将被当作 public.users 处理
"SELECT * FROM users"
// → 不添加租户条件（因为public不匹配任何规则）
```

**⚠️ 重要提醒**：
- `defaultDatabase` 是**必须配置**的，如果遇到无库名表时没有配置默认库，系统会抛出异常
- 默认库应该设置为你的数据库连接实际使用的默认库名
- 这样可以准确模拟数据库连接的真实行为

## 🎯 支持的SQL类型

### SELECT查询

```sql
-- 基本查询
/*& tenant:'sxlq' */ SELECT * FROM users
-- → SELECT * FROM `users` WHERE `users`.`tenant` = 'sxlq'

-- JOIN查询
/*& tenant:'sxlq' */ SELECT u.name, o.amount FROM users u JOIN orders o ON u.id = o.user_id
-- → SELECT `u`.`name`, `o`.`amount` FROM `users` AS `u` INNER JOIN `orders` AS `o` ON `u`.`id` = `o`.`user_id` WHERE `u`.`tenant` = 'sxlq' AND `o`.`tenant` = 'sxlq'

-- 跨库联查（选择性改写）
/*& tenant:'sxlq' */ SELECT u.name, p.title FROM tnt_main.users u JOIN public.posts p ON u.id = p.user_id
-- → SELECT `u`.`name`, `p`.`title` FROM `tnt_main`.`users` AS `u` INNER JOIN `public`.`posts` AS `p` ON `u`.`id` = `p`.`user_id` WHERE `u`.`tenant` = 'sxlq'
-- 注意：只有tnt_main.users添加了租户条件，public.posts没有
```

### INSERT语句

```sql
-- VALUES格式（目标库）
/*& tenant:'sxlq' */ INSERT INTO tnt_main.users (name, email) VALUES ('John', 'john@example.com')
-- → INSERT INTO `tnt_main`.`users` (name, email, tenant) VALUES ('John','john@example.com','sxlq')

-- VALUES格式（非目标库，不添加租户字段）
/*& tenant:'sxlq' */ INSERT INTO public.logs (message) VALUES ('日志信息')
-- → INSERT INTO `public`.`logs` (message) VALUES ('日志信息')

-- INSERT...SELECT格式（选择性改写）
/*& tenant:'sxlq' */ INSERT INTO tnt_order.orders (user_id, product) SELECT u.id, 'iPhone' FROM tnt_main.users u WHERE u.active = 1
-- → INSERT INTO `tnt_order`.`orders` (user_id, product, tenant) SELECT `u`.`id`, 'iPhone' FROM `tnt_main`.`users` AS `u` WHERE `u`.`active` = 1 AND `u`.`tenant` = 'sxlq'
```

### UPDATE和DELETE语句

```sql
-- UPDATE（目标库）
/*& tenant:'sxlq' */ UPDATE global_mb.products SET price = 100 WHERE id = 1
-- → UPDATE `global_mb`.`products` SET `price` = 100 WHERE `id` = 1 AND `products`.`tenant` = 'sxlq'

-- UPDATE（非目标库，不添加租户条件）
/*& tenant:'sxlq' */ UPDATE system.configs SET value = 'new_value' WHERE key = 'setting'
-- → UPDATE `system`.`configs` SET `value` = 'new_value' WHERE `key` = 'setting'

-- DELETE（目标库）
/*& tenant:'sxlq' */ DELETE FROM tnt_temp.old_records WHERE created_at < '2023-01-01'
-- → DELETE FROM `tnt_temp`.`old_records` WHERE `created_at` < '2023-01-01' AND `old_records`.`tenant` = 'sxlq'
```

## 📋 API参考

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

## 🧪 测试验证

本库已通过大量测试用例验证，包括：

✅ 基本SQL操作（SELECT、INSERT、UPDATE、DELETE）  
✅ 复杂JOIN查询（多表、自连接）  
✅ 子查询（WHERE、FROM、SELECT中的子查询）  
✅ WITH子句（CTE，包括递归CTE）  
✅ 窗口函数  
✅ UNION/UNION ALL操作  
✅ EXISTS和NOT EXISTS子查询  
✅ INSERT...SELECT复杂场景  

```bash
# 运行综合测试套件（推荐）
node -r ts-node/register src/comprehensive-test.ts

# 或者运行跨库联查专项测试
node -r ts-node/register src/cross-database-test.ts
```

