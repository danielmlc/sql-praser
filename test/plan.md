# 迭代执行清单

> 原则：**测试优先（TDD）** — 每个功能严格按「写测试 → 实现功能 → 测试通过」三步走。
> 完成后在对应条目打 ✅ 并记录日期。

---

## Phase 1：功能对齐（达到平替条件）

### 1. 库名改写 Listener（DatabaseRewriteListener）

旧库 `DatabaseNameRewriter` 的 ANTLR4 版本。优先级 50（在 HintListener 之后、TenantFilterListener 之前）。

- [x] **1.1 编写测试用例** `test/database-rewrite.test.ts`
  - 基础改写：`tnt_ma.users` → `dev_mc_tnt_ma.users`（添加前缀）
  - 已有前缀跳过：`dev_mc_tnt_ma.users` 不重复添加
  - 排除列表：配置 `excludeDatabases: ['system_db']`，不改写
  - 目标列表：仅改写指定库名
  - SELECT/INSERT/UPDATE/DELETE 全覆盖
  - JOIN 跨库查询（两个库都需改写）
  - 子查询中的库名改写
  - CTE 中的库名改写
  - 与租户注入联合使用（listener chain 同时启用两个 listener）
- [x] **1.2 实现 DatabaseRewriteListener**
  - 新建 `src/listeners/database/database-rewrite-listener.ts`
  - 配置类型 `DatabaseRewriteListenerConfig`
  - 通过 `TokenStreamRewriter.replace()` 原位替换库名 token
  - 注册到 ListenerChain
- [x] **1.3 全部测试通过** — 日期：2026-03-20 ✅ 26/26 pass

### 2. EXPLAIN/DESCRIBE 包装语句处理

旧库支持对 `EXPLAIN SELECT ...` 内嵌的 DML 语句注入租户条件。

- [x] **2.1 编写测试用例** `test/wrapper-statement.test.ts`
  - `EXPLAIN SELECT * FROM tnt_ma.users` → 内嵌 SELECT 注入租户条件
  - `EXPLAIN UPDATE tnt_ma.users SET ...` → 内嵌 UPDATE 注入
  - `EXPLAIN DELETE FROM tnt_ma.users ...` → 内嵌 DELETE 注入
  - `DESCRIBE tnt_ma.users` → 无需注入（DDL 类）
  - `EXPLAIN ANALYZE SELECT ...` → 内嵌 SELECT 注入
  - 无 hint 的 EXPLAIN → 不处理
- [x] **2.2 实现包装语句处理**
  - ANTLR4 ParseTreeWalker 自动遍历 EXPLAIN 内嵌 DML，无需额外实现
- [x] **2.3 全部测试通过** — 日期：2026-03-20 ✅ 11/11 pass（零代码改动，架构天然支持）

### 3. 工具方法补齐

补齐旧库 `SqlParserService` 上的实用方法，保持 API 兼容。

- [x] **3.1 编写测试用例** `test/utility-methods.test.ts`
  - `getSqlType(sql)` → 返回 `SELECT` / `INSERT` / `UPDATE` / `DELETE` / `CREATE` 等
  - `createHint(tenant)` → 返回 `/*& tenant:'xxx' */`
  - `addHintToSql(sql, tenant)` → 在 SQL 前添加 hint
  - `removeAllComments(sql)` → 移除所有注释（行注释、块注释）
  - `getDetailedInfo(sql)` → 返回 `{ hasHint, hint, sqlType, isValid, cleanSql }`
  - `isValidTenant(tenant)` → 校验租户编码格式
  - `validateSql(sql)` → 实际调用解析器验证语法（替换当前 TODO）
- [x] **3.2 实现工具方法**
  - 在 `SqlParserService` 和 `SqlRewriter` 上添加对应方法
  - `getSqlType` 通过检查 parseTree 根节点子节点类型实现
  - `createHint` / `addHintToSql` 纯字符串操作
  - `removeAllComments` 基于正则
  - `validateSql` 调用 `parser.validate()`
- [x] **3.3 全部测试通过** — 日期：2026-03-20 ✅ 29/29 pass（含 batchRewriteWithDetails 3 个用例）

### 4. 带详情的批量处理（batchRewriteWithDetails）

- [x] **4.1 编写测试用例**（已放入 `test/utility-methods.test.ts`）
  - 多条 SQL 批量处理，返回 `RewriteResult[]`
  - 混合类型（SELECT + INSERT + 事务语句）
  - 部分失败场景（一条解析失败不影响其余）
- [x] **4.2 实现 batchRewriteWithDetails**
  - `SqlParserService.batchRewriteWithDetails(sqlList): RewriteResult[]`
  - `SqlRewriter.batchRewrite(sqlList): RewriteResult[]`
- [x] **4.3 全部测试通过** — 日期：2026-03-20 ✅（与 3.3 合并验证）

### 5. 完善错误体系

对齐旧库的 6 种错误类（`SqlParseError`, `HintParseError`, `AstTransformError`, `SqlRewriteError`, `ConfigError`, `UnsupportedSqlError`）+ `ErrorUtils`。

- [x] **5.1 编写测试用例** `test/error-handling.test.ts`
  - 无效 SQL → 抛出 `ParserError`（或 `SqlParseError`）
  - 无效配置 → 抛出 `ConfigError`
  - Listener 处理异常 → 抛出 `TransformError`（或 `AstTransformError`）
  - 不支持的 SQL 类型 → 抛出 `UnsupportedSqlError`
  - `ErrorUtils.formatError()` 输出格式正确
  - `ErrorUtils.isSqlParseError()` 类型守卫正确
- [x] **5.2 实现错误分类**
  - 扩展 `src/core/types.ts` 中的错误类
  - 添加 `HintParseError`, `TransformError`, `UnsupportedSqlError`
  - 实现 `ErrorUtils` 工具类（formatError, isSqlParseError, getErrorMessage）
- [x] **5.3 全部测试通过** — 日期：2026-03-20 ✅ 12/12 pass

---

## Phase 2：超越旧库

### 6. REPLACE INTO 支持

- [ ] **6.1 编写测试用例**（可放入 `test/tenant-filter.test.ts` 新增分组）
  - `REPLACE INTO tnt_ma.users (col1, col2) VALUES (...)` → 注入租户列和值
  - `REPLACE INTO tnt_ma.users SET col1=val1` → 注入租户字段
  - `REPLACE INTO ... SELECT ...` → 注入租户条件
- [ ] **6.2 实现 REPLACE 语句租户注入**
  - 在 `TenantConditionListener` 中添加 `enterReplaceStatement` 处理
- [ ] **6.3 全部测试通过** — 日期：____

### 7. 多语句支持

- [ ] **7.1 编写测试用例** `test/multi-statement.test.ts`
  - 分号分隔的多条 SQL：`SELECT ...; UPDATE ...; DELETE ...`
  - 每条独立注入租户条件
  - 混合有 hint 和无 hint 的语句
  - 空语句 / 仅分号 → 跳过
  - 带事务包裹：`START TRANSACTION; ...; COMMIT;`
- [ ] **7.2 实现多语句拆分与逐条处理**
  - 在 orchestrator 层拆分 SQL，逐条调用 parser → listener chain
  - 合并结果返回
- [ ] **7.3 全部测试通过** — 日期：____

### 8. TiDB 方言落地

- [ ] **8.1 编写测试用例** `test/tidb-dialect.test.ts`
  - 基本 SELECT/INSERT/UPDATE/DELETE 租户注入（TiDB 语法）
  - TiDB 特有语法（如 `SPLIT REGION`, `ALTER TABLE ... SHARD_ROW_ID_BITS` 等）
  - 配置 `dialect: 'tidb'` 切换方言
- [ ] **8.2 实现 TiDB Parser 与租户注入**
  - 实现 `TiDBParser extends BaseSQLParser`
  - 注册到 `ParserFactory`
  - 确认 TenantFilterListener 兼容 TiDB 语法树
- [ ] **8.3 全部测试通过** — 日期：____

### 9. 性能基准测试

- [ ] **9.1 编写 benchmark 脚本** `test/benchmark.ts`
  - 准备 100+ 条不同复杂度的 SQL（简单查询、多表 JOIN、嵌套子查询、CTE）
  - 分别测量新旧库的：单次解析耗时、吞吐量（ops/sec）、内存占用
  - 输出对比表格
- [ ] **9.2 运行并输出对比报告** — 日期：____

---

## Phase 3：增值能力

### 10. 审计 Listener

- [ ] **10.1 编写测试用例** `test/audit-listener.test.ts`
  - SELECT → 记录涉及的表名、操作类型
  - INSERT/UPDATE/DELETE → 记录目标表、操作类型
  - JOIN → 记录所有参与表
  - 输出格式：`{ tables: string[], operation: string, timestamp: number }`
- [ ] **10.2 实现审计 Listener**
  - `src/listeners/audit/audit-listener.ts`，优先级 200（最后执行）
  - 遍历语法树收集表信息，写入 `sharedState` 或回调
- [ ] **10.3 全部测试通过** — 日期：____

### 11. 敏感字段脱敏 Listener

- [ ] **11.1 编写测试用例** `test/masking-listener.test.ts`
  - 配置敏感字段列表（如 `email`, `phone`）
  - `SELECT email FROM users` → 改写为 `SELECT CONCAT(LEFT(email,3),'***') as email FROM users`
  - 非目标字段不受影响
  - JOIN 查询中的敏感字段
- [ ] **11.2 实现脱敏 Listener**
  - `src/listeners/masking/masking-listener.ts`
  - 通过 `TokenStreamRewriter.replace()` 替换 SELECT 列表中的敏感列
- [ ] **11.3 全部测试通过** — 日期：____

### 12. SQL 白名单校验

- [ ] **12.1 编写测试用例** `test/whitelist-listener.test.ts`
  - 配置允许的操作类型（如仅 `SELECT`, `INSERT`, `UPDATE`, `DELETE`）
  - DDL 语句（`CREATE TABLE`, `DROP TABLE`, `ALTER TABLE`）→ 抛出异常或标记拒绝
  - `TRUNCATE` → 拒绝
  - 事务语句（`BEGIN`, `COMMIT`）→ 放行
- [ ] **12.2 实现白名单校验 Listener**
  - `src/listeners/whitelist/whitelist-listener.ts`，优先级 5（最先执行）
  - 检查语法树根节点类型，不在白名单内则中断处理
- [ ] **12.3 全部测试通过** — 日期：____

---

## 进度汇总

| Phase | 功能 | 状态 |
|:-----:|------|:----:|
| 1 | 库名改写 Listener | ⬜ |
| 1 | EXPLAIN/DESCRIBE 处理 | ⬜ |
| 1 | 工具方法补齐 | ⬜ |
| 1 | batchRewriteWithDetails | ⬜ |
| 1 | 完善错误体系 | ⬜ |
| 2 | REPLACE INTO | ⬜ |
| 2 | 多语句支持 | ⬜ |
| 2 | TiDB 方言 | ⬜ |
| 2 | 性能基准测试 | ⬜ |
| 3 | 审计 Listener | ⬜ |
| 3 | 敏感字段脱敏 | ⬜ |
| 3 | SQL 白名单校验 | ⬜ |

> ⬜ 未开始 / 🔧 进行中 / ✅ 已完成

---
---

# 附录：测试 SQL 脚本范围

以下为原始测试 SQL 参考脚本：
```sql

-- 为租户 'sxlq' 插入用户数据
/*& tenant:'sxlq' */ INSERT INTO global_ma.users (username, email, age) VALUES 
('zhang_san', 'zhang@sxlq.com', 28),
('li_si', 'li@sxlq.com', 32),
('wang_wu', 'wang@sxlq.com', 25);


-- 查询租户数据

/*& tenant:'sxlq' */ SELECT * FROM global_ma.users;

-- 为租户 'sxlq' 插入订单数据（注意：现在需要先查询用户ID）
/*& tenant:'sxlq' */ 
INSERT INTO global_ma.orders (user_id, product_name, amount, status, order_date)
SELECT u.id, 'iPhone 15', 6999.00, 'completed', '2024-01-15'
FROM global_ma.users u WHERE u.tenant = 'sxlq' AND u.username = 'zhang_san'
UNION ALL
SELECT u.id, 'MacBook Pro', 12999.00, 'pending', '2024-01-16'
FROM global_ma.users u WHERE u.tenant = 'sxlq' AND u.username = 'li_si'
UNION ALL
SELECT u.id, 'AirPods Pro', 1999.00, 'completed', '2024-01-17'
FROM global_ma.users u WHERE u.tenant = 'sxlq' AND u.username = 'wang_wu';

-- 为租户 'sxlq' 插入部门数据

/*& tenant:'sxlq' */ INSERT INTO global_mtlp.departments (dept_name, manager_id, budget) VALUES 
('Technology11', 1, 500000.00),
('Marketing22', 2, 300000.00),
('Sales33', 3, 400000.00);


-- 插入非租户数据（系统配置）
INSERT INTO non_tenant_db.system_config (config_key, config_value, description) VALUES 
('max_connections', '1000', 'Maximum database connections'),
('timeout', '30', 'Query timeout in seconds'),
('debug_mode', 'false', 'Enable debug logging');


-- 验证分区剪枝（查看执行计划）
/*& tenant:'sxlq' */ EXPLAIN SELECT * FROM global_ma.users WHERE tenant = 'sxlq';

-- 测试基于联合主键的查询
/*& tenant:'sxlq' */ SELECT * FROM global_ma.users WHERE tenant = 'gslq' AND id = 1;

-- 测试跨租户的联合主键查询（应该只返回当前租户的数据）
/*& tenant:'sxlq' */ SELECT * FROM global_ma.users WHERE id = 1;

-- 测试JOIN查询（需要适配联合主键）
/*& tenant:'sxlq' */ SELECT u.username, o.product_name, o.amount, o.status 
FROM global_ma.users u 
JOIN global_ma.orders o ON  u.id = o.user_id 
WHERE o.status = 'completed';


SELECT `u`.`username`,`o`.`product_name`,`o`.`amount`,`o`.`status` 
FROM `global_ma`.`users` AS `u` 
JOIN `global_ma`.`orders` AS `o` ON `u`.`id`=`o`.`user_id` 
WHERE `o`.`status`=_UTF8MB4'completed' AND `u`.`tenant`='sxlq' AND `o`.`tenant`='sxlq'

-- 测试三表JOIN（联合主键约束）
/*& tenant:'sxlq' */ SELECT u.tenant, u.username, o.product_name, p.product_name as p_name, p.price, p.stock_quantity
FROM global_ma.users u
JOIN global_ma.orders o ON u.tenant = o.tenant AND u.id = o.user_id
JOIN global_ma.products p ON o.tenant = p.tenant AND o.product_name = p.product_name
WHERE o.status = 'completed';

/*& tenant:'bjzh' */ INSERT INTO global_ma.users (username, email, age) VALUES 
('new_user1', 'new1@sxlq.com', 30);



/*& tenant:'bjzh' */ INSERT INTO global_ma.users (username, email, age) VALUES 
('new_user23', 'new2@bjzh1.com', 25),
('new_user24', 'new3@bjzh1.com', 35);

-- 测试INSERT ... SET 格式
/*& tenant:'sxlq' */ INSERT INTO global_ma.products 
SET product_name='iPad Air', category='Electronics', price=4999.00, stock_quantity=25;

/*& tenant:'bjzh' */ INSERT INTO global_ma.products 
SET product_name='Kindle', category='Electronics', price=999.00, stock_quantity=50;

-- 测试INSERT ... SELECT 格式（跨分区查询）
/*& tenant:'sxlq' */ INSERT INTO global_ma.orders (user_id, product_name, amount, status, order_date)
SELECT u.id, 'iPad Air', 4999.00, 'pending', CURRENT_DATE
FROM global_ma.users u 
WHERE u.tenant = 'sxlq' AND u.username = 'new_user1';



-- 测试基本UPDATE（在正确分区内）
/*& tenant:'sxlq' */ UPDATE global_ma.users SET age = 29 WHERE username = 'zhang_san';

-- 测试带JOIN的UPDATE（跨分区JOIN）
/*& tenant:'sxlq' */ UPDATE global_ma.orders o 
JOIN global_ma.users u ON o.tenant = u.tenant AND o.user_id = u.id 
SET o.status = 'shipped' 
WHERE u.username = 'li_si' AND o.status = 'pending';

-- 测试批量UPDATE
/*& tenant:'sxlq' */ UPDATE global_ma.products SET stock_quantity = stock_quantity - 1 
WHERE category = 'Electronics' AND stock_quantity > 0;




-- 测试基本DELETE（分区内删除）
/*& tenant:'sxlq' */ DELETE FROM global_ma.users WHERE age < 26;

-- 测试带JOIN的DELETE（跨分区JOIN删除）
/*& tenant:'bjzh' */ DELETE o FROM global_ma.orders o 
JOIN global_ma.users u ON o.tenant = u.tenant AND o.user_id = u.id 
WHERE u.username = 'qian_qi' AND o.status = 'pending';




-- 验证租户数据隔离 - 每个租户应该只能看到自己的数据
SELECT '=== 验证 sxlq 租户数据（分区版） ===' as info;
/*& tenant:'sxlq' */ SELECT 'users' as table_name, COUNT(*) as count FROM global_ma.users
UNION ALL
/*& tenant:'sxlq' */ SELECT 'orders', COUNT(*) FROM global_ma.orders  
UNION ALL
/*& tenant:'sxlq' */ SELECT 'products', COUNT(*) FROM global_ma.products
UNION ALL
/*& tenant:'sxlq' */ SELECT 'employees', COUNT(*) FROM global_mtlp.employees
UNION ALL
/*& tenant:'sxlq' */ SELECT 'departments', COUNT(*) FROM global_mtlp.departments;

/*& tenant:'sxlq' */
SELECT 
    'users' as table_name, 
    tenant, 
    COUNT(*) as count,
    MIN(id) as min_id,
    MAX(id) as max_id
FROM global_ma.users 
GROUP BY tenant
UNION ALL
SELECT 
    'orders', 
    tenant, 
    COUNT(*), 
    MIN(order_id), 
    MAX(order_id)
FROM global_ma.orders 
GROUP BY tenant
UNION ALL
SELECT 
    'products', 
    tenant, 
    COUNT(*), 
    MIN(product_id), 
    MAX(product_id)
FROM global_ma.products 
GROUP BY tenant;




-- 测试跨分区查询性能
/*& tenant:'sxlq' */ SELECT COUNT(*) as total_users FROM global_ma.users; -- 管理员查询

-- 为性能测试准备大量数据（分布到不同分区）
/*& tenant:'perf_test' */ INSERT INTO global_ma.users (username, email, age)
SELECT 
    CONCAT('perf_user_', i) as username,
    CONCAT('perf', i, '@test.com') as email,
    20 + (i % 40) as age
FROM (
    SELECT 1 as i UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5
    UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10
    UNION ALL SELECT 11 UNION ALL SELECT 12 UNION ALL SELECT 13 UNION ALL SELECT 14 UNION ALL SELECT 15
    UNION ALL SELECT 16 UNION ALL SELECT 17 UNION ALL SELECT 18 UNION ALL SELECT 19 UNION ALL SELECT 20
) numbers;

-- 性能测试：分区表查询性能
/*& tenant:'perf_test' */ SELECT COUNT(*) FROM global_ma.users WHERE age > 25;

-- 分区剪枝测试：只访问特定分区
/*& tenant:'perf_test' */ EXPLAIN ANALYZE SELECT * FROM global_ma.users WHERE tenant = 'perf_test' AND age > 30;


-- 测试新分区
/*& tenant:'new_tenant' */ INSERT INTO global_ma.users (username, email, age) VALUES 
('test_new', 'test@new.com', 25);

-- 验证新分区数据
/*& tenant:'new_tenant' */ SELECT * FROM global_ma.users;


-- =====================================================
-- 第十一部分：复杂场景测试（分区优化）
-- =====================================================

-- 测试复杂JOIN（利用分区剪枝）
/*& tenant:'sxlq' */ SELECT 
    u.tenant,
    u.username,
    u.email,
    COUNT(o.order_id) as order_count,
    SUM(o.amount) as total_amount,
    AVG(o.amount) as avg_amount
FROM global_ma.users u
LEFT JOIN global_ma.orders o ON u.tenant = o.tenant AND u.id = o.user_id
WHERE u.created_at >= '2024-01-01'
GROUP BY u.tenant, u.id, u.username, u.email
HAVING COUNT(o.order_id) > 0
ORDER BY total_amount DESC;


-- 测试分区表的窗口函数
/*& tenant:'sxlq' */ SELECT 
    username,
    age,
    created_at,
    ROW_NUMBER() OVER (PARTITION BY tenant ORDER BY created_at) as tenant_rank,
    RANK() OVER (PARTITION BY tenant ORDER BY age DESC) as age_rank_in_tenant
FROM global_ma.users
ORDER BY created_at;

-- 测试WHERE子查询（标量子查询）
/*& tenant:'sxlq' */ SELECT u.username, u.email, u.age
FROM global_ma.users u
WHERE u.age > (SELECT AVG(age) FROM global_ma.users);




-- 测试WHERE子查询（IN操作）
/*& tenant:'sxlq' */ SELECT p.product_name, p.price, p.stock_quantity
FROM global_ma.products p
WHERE p.product_id IN (
    SELECT DISTINCT o.product_name 
    FROM global_ma.orders o 
    WHERE o.status = 'completed' AND o.tenant = 'sxlq'
);

-- 测试WHERE子查询（EXISTS操作）
/*& tenant:'sxlq' */ SELECT u.username, u.email
FROM global_ma.users u
WHERE EXISTS (
    SELECT 1 FROM global_ma.orders o 
    WHERE o.user_id = u.id AND o.tenant = u.tenant AND o.status = 'completed'
);

-- 测试WHERE子查询（NOT EXISTS操作）
/*& tenant:'sxlq' */ SELECT u.username, u.email
FROM global_ma.users u
WHERE NOT EXISTS (
    SELECT 1 FROM global_ma.orders o 
    WHERE o.user_id = u.id AND o.tenant = u.tenant
);

-- 测试FROM子查询（派生表）
/*& tenant:'sxlq' */ SELECT user_stats.tenant, user_stats.username, user_stats.order_count, user_stats.total_spent
FROM (
    SELECT u.tenant, u.username, COUNT(o.order_id) as order_count, SUM(o.amount) as total_spent
    FROM global_ma.users u
    LEFT JOIN global_ma.orders o ON u.id = o.user_id AND u.tenant = o.tenant
    GROUP BY u.id, u.username, u.tenant
) user_stats
WHERE user_stats.order_count > 0;

-- 测试SELECT子查询（标量子查询）
/*& tenant:'sxlq' */ SELECT 
    u.username,
    u.email,
    (SELECT COUNT(*) FROM global_ma.orders o WHERE o.user_id = u.id AND o.tenant = u.tenant) as order_count,
    (SELECT MAX(o.amount) FROM global_ma.orders o WHERE o.user_id = u.id AND o.tenant = u.tenant) as max_order_amount
FROM global_ma.users u;




-- 测试相关子查询
/*& tenant:'sxlq' */ SELECT u.username, u.age
FROM global_ma.users u
WHERE u.age > (
    SELECT AVG(u2.age) 
    FROM global_ma.users u2 
    WHERE u2.tenant = u.tenant
);



-- 测试多级嵌套子查询
/*& tenant:'sxlq' */ SELECT product_name, price
FROM global_ma.products p
WHERE p.price > (
    SELECT AVG(price) 
    FROM global_ma.products p2 
    WHERE p2.category IN (
        SELECT DISTINCT category 
        FROM global_ma.products p3 
        WHERE p3.stock_quantity > 10
    ) 
);


-- 测试基本WITH语句
/*& tenant:'sxlq' */ WITH user_orders AS (
    SELECT u.id as user_id, u.username, COUNT(o.order_id) as order_count
    FROM global_ma.users u
    LEFT JOIN global_ma.orders o ON u.id = o.user_id AND u.tenant = o.tenant
    GROUP BY u.id, u.username
)
SELECT j.username, j.order_count, h.email
FROM user_orders j
join global_ma.users h on j.username = h.username
WHERE j.order_count > 0
ORDER BY j.order_count DESC;




-- 测试多个CTE
/*& tenant:'sxlq' */ WITH 
active_users AS (
    SELECT u.id, u.username, u.email
    FROM global_ma.users u
    WHERE u.tenant = 'sxlq' AND u.created_at >= '2023-01-01'
),
completed_orders AS (
    SELECT o.user_id, COUNT(*) as completed_count, SUM(o.amount) as total_amount
    FROM global_ma.orders o
    WHERE o.tenant = 'sxlq' AND o.status = 'completed'
    GROUP BY o.user_id
)
SELECT au.username, au.email, 
       COALESCE(co.completed_count, 0) as completed_orders,
       COALESCE(co.total_amount, 0) as total_spent
FROM active_users au
LEFT JOIN completed_orders co ON au.id = co.user_id
ORDER BY total_spent DESC;




-- 测试递归CTE（分层数据）- 模拟组织层级
/*& tenant:'sxlq' */ WITH RECURSIVE dept_hierarchy AS (
    -- 锚点查询：顶级部门
    SELECT dept_id, dept_name, manager_id, tenant, 1 as level, 
           CAST(dept_name AS CHAR(1000)) as path
    FROM global_mtlp.departments
    WHERE tenant = 'sxlq' AND manager_id IS NULL OR manager_id = 0
    
    UNION ALL
    
    -- 递归查询：子部门
    SELECT d.dept_id, d.dept_name, d.manager_id, d.tenant, dh.level + 1,
           CONCAT(dh.path, ' -> ', d.dept_name)
    FROM global_mtlp.departments d
    JOIN dept_hierarchy dh ON d.manager_id = dh.dept_id
    WHERE d.tenant = 'sxlq' AND dh.level < 5
)
SELECT level, dept_name, path, manager_id
FROM dept_hierarchy
ORDER BY level, dept_name;


-- 测试CTE中的窗口函数
/*& tenant:'sxlq' */ WITH ranked_products AS (
    SELECT product_name, price, stock_quantity,
           ROW_NUMBER() OVER (PARTITION BY category ORDER BY price DESC) as price_rank,
           DENSE_RANK() OVER (PARTITION BY category ORDER BY stock_quantity DESC) as stock_rank
    FROM global_ma.products
    WHERE tenant = 'sxlq'
)
SELECT product_name, price, stock_quantity, price_rank, stock_rank
FROM ranked_products
WHERE price_rank <= 2 OR stock_rank <= 2
ORDER BY price_rank, stock_rank;



-- 测试ROW_NUMBER窗口函数
/*& tenant:'sxlq' */ SELECT 
    username, age, created_at,
    ROW_NUMBER() OVER (ORDER BY created_at) as row_num,
    ROW_NUMBER() OVER (ORDER BY age DESC) as age_rank
FROM global_ma.users;

-- 测试RANK和DENSE_RANK
/*& tenant:'sxlq' */ SELECT 
    product_name, price, category,
    RANK() OVER (PARTITION BY category ORDER BY price DESC) as price_rank,
    DENSE_RANK() OVER (PARTITION BY category ORDER BY price DESC) as dense_price_rank,
    PERCENT_RANK() OVER (PARTITION BY category ORDER BY price) as price_percentile
FROM global_ma.products;

-- 测试LEAD和LAG函数
/*& tenant:'sxlq' */ SELECT 
    order_id, user_id, amount, order_date,
    LAG(amount, 1) OVER (PARTITION BY user_id ORDER BY order_date) as prev_order_amount,
    LEAD(amount, 1) OVER (PARTITION BY user_id ORDER BY order_date) as next_order_amount,
    amount - LAG(amount, 1) OVER (PARTITION BY user_id ORDER BY order_date) as amount_diff
FROM global_ma.orders
ORDER BY user_id, order_date;

-- 测试聚合窗口函数
/*& tenant:'sxlq' */ SELECT 
    order_id, user_id, amount, order_date,
    SUM(amount) OVER (PARTITION BY user_id ORDER BY order_date) as running_total,
    AVG(amount) OVER (PARTITION BY user_id ORDER BY order_date ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) as moving_avg_3,
    COUNT(*) OVER (PARTITION BY user_id) as total_orders_by_user
FROM global_ma.orders
ORDER BY user_id, order_date;

-- 测试FIRST_VALUE和LAST_VALUE
/*& tenant:'sxlq' */ SELECT 
    username, age, created_at,
    FIRST_VALUE(username) OVER (ORDER BY created_at) as first_user,
    LAST_VALUE(username) OVER (ORDER BY created_at ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) as last_user,
    FIRST_VALUE(age) OVER (ORDER BY age DESC) as max_age,
    LAST_VALUE(age) OVER (ORDER BY age DESC ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) as min_age
FROM global_ma.users;

-- =====================================================
-- 第十五部分：复杂聚合和分组查询测试
-- =====================================================

SELECT '=== 复杂聚合和分组查询测试 ===' as info;


-- 测试CUBE（如果TiDB支持）
/*& tenant:'sxlq' */ SELECT 
    YEAR(order_date) as order_year,
    status,
    COUNT(*) as order_count,
    SUM(amount) as total_amount
FROM global_ma.orders
WHERE order_date >= '2024-01-01'
GROUP BY CUBE(YEAR(order_date), status);

-- 测试复杂HAVING子句
/*& tenant:'sxlq' */ SELECT 
    category,
    COUNT(*) as product_count,
    AVG(price) as avg_price,
    MIN(price) as min_price,
    MAX(price) as max_price
FROM global_ma.products
GROUP BY category
HAVING COUNT(*) > 1 
   AND AVG(price) > (SELECT AVG(price) FROM global_ma.products )
ORDER BY avg_price DESC;

-- 测试UNION ALL（已有，但增加更多场景）
/*& tenant:'sxlq' */ SELECT 'user' as type, username as name, created_at FROM global_ma.users
UNION ALL
SELECT 'product', product_name, created_at FROM global_ma.products;

-- 测试UNION（去重）
/*& tenant:'sxlq' */ SELECT category FROM global_ma.products
UNION
SELECT 'Electronics' as category;

-- 测试带ORDER BY的UNION
/*& tenant:'sxlq' */ (SELECT username as name, age, 'user' as type FROM global_ma.users ORDER BY age LIMIT 3)
UNION ALL
(SELECT product_name, CAST(price/100 AS SIGNED), 'product' FROM global_ma.products ORDER BY price LIMIT 3)
ORDER BY age DESC;

-- 测试多个UNION
/*& tenant:'sxlq' */ SELECT 'users' as source, COUNT(*) as count FROM global_ma.users
UNION ALL
SELECT 'orders', COUNT(*) FROM global_ma.orders
UNION ALL
SELECT 'products', COUNT(*) FROM global_ma.products
UNION ALL
SELECT 'employees', COUNT(*) FROM global_mtlp.employees;


-- 测试CROSS JOIN
/*& tenant:'sxlq' */ SELECT u.username, p.product_name, p.price
FROM global_ma.users u
CROSS JOIN global_ma.products p
WHERE u.tenant = 'sxlq' AND p.tenant = 'sxlq'
ORDER BY u.username, p.price;


-- 测试NATURAL JOIN（如果表结构支持）
/*& tenant:'sxlq' */ SELECT u.username, o.product_name, o.amount
FROM global_ma.users u
NATURAL JOIN global_ma.orders o
WHERE u.tenant = 'sxlq';


-- 测试多表JOIN with ON vs WHERE
/*& tenant:'sxlq' */ SELECT u.username, o.product_name, p.price
FROM global_ma.users u
JOIN global_ma.orders o ON u.id = o.user_id AND u.tenant = o.tenant
JOIN global_ma.products p ON o.product_name = p.product_name AND o.tenant = p.tenant
WHERE u.tenant = 'sxlq' AND o.status = 'completed';

-- 测试自连接
/*& tenant:'sxlq' */ SELECT u1.username as user1, u2.username as user2
FROM global_ma.users u1
JOIN global_ma.users u2 ON u1.age = u2.age AND u1.id != u2.id AND u1.tenant = u2.tenant
WHERE u1.tenant = 'sxlq';




-- 测试CASE WHEN表达式
/*& tenant:'sxlq' */ SELECT 
    username,
    age,
    CASE 
        WHEN age < 25 THEN 'Young'
        WHEN age BETWEEN 25 AND 35 THEN 'Middle'
        ELSE 'Senior'
    END as age_group,
    CASE 
        WHEN age < 30 THEN '青年'
        ELSE '中年'
    END as age_category_cn
FROM global_ma.users;



-- 测试INSERT IGNORE
/*& tenant:'sxlq' */ INSERT IGNORE INTO global_ma.users (username, email, age) VALUES 
('duplicate_user', 'dup@test.com', 25),
('zhang_san', 'existing@test.com', 30); -- 可能重复

-- 测试INSERT ... ON DUPLICATE KEY UPDATE
/*& tenant:'sxlq' */ INSERT INTO global_ma.products (product_name, category, price, stock_quantity) 
VALUES ('iPhone 15', 'Electronics', 7999.00, 30)
ON DUPLICATE KEY UPDATE 
    price = VALUES(price),
    stock_quantity = stock_quantity + VALUES(stock_quantity);

-- 测试多表INSERT SELECT
/*& tenant:'sxlq' */ INSERT INTO global_ma.orders (user_id, product_name, amount, status, order_date)
SELECT u.id, p.product_name, p.price, 'pending', CURRENT_DATE
FROM global_ma.users u
CROSS JOIN global_ma.products p
WHERE u.tenant = 'sxlq' AND p.tenant = 'sxlq' 
  AND u.username = 'zhang_san' AND p.product_name = 'AirPods Pro';

-- =====================================================
-- 第二十部分：UPDATE和DELETE的复杂场景测试
-- =====================================================


-- 测试带子查询的UPDATE
/*& tenant:'sxlq' */ UPDATE global_ma.products 
SET stock_quantity = stock_quantity - 1
WHERE product_name IN (
    SELECT DISTINCT product_name FROM global_ma.orders 
    WHERE status = 'completed'
);


-- 测试多表UPDATE
/*& tenant:'sxlq' */ UPDATE global_ma.users u
JOIN global_ma.orders o ON u.id = o.user_id AND u.tenant = o.tenant
SET u.age = u.age + 1
WHERE o.amount > 10000 AND u.tenant = 'sxlq';




-- 测试带子查询的DELETE
/*& tenant:'sxlq' */ DELETE FROM global_ma.orders
WHERE user_id IN (
    SELECT id FROM global_ma.users 
    WHERE  age < 25
) AND  status = 'pending';

-- 测试LIMIT的DELETE
/*& tenant:'sxlq' */ DELETE FROM global_ma.orders 
WHERE  status = 'cancelled' 
ORDER BY created_at 
LIMIT 5;



-- 测试显式事务
START TRANSACTION;
/*& tenant:'sxlq' */ INSERT INTO global_ma.users (username, email, age) VALUES ('tx_user', 'tx@test.com', 30);
/*& tenant:'sxlq' */ UPDATE global_ma.products SET stock_quantity = stock_quantity - 1 WHERE product_name = 'iPhone 15';
COMMIT;

-- 测试回滚事务
START TRANSACTION;
/*& tenant:'sxlq' */ DELETE FROM global_ma.users WHERE username = 'tx_user';
ROLLBACK;

/*& tenant:'sxlq' */ select  * FROM global_ma.users WHERE username = 'tx_user';

-- 测试FOR UPDATE锁（悲观锁）
/*& tenant:'sxlq' */ SELECT * FROM global_ma.products WHERE product_name = 'iPhone 15' FOR UPDATE;


```

