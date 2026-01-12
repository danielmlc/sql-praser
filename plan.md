主要功能：
通过sql语句中的hint信息来改写sql语句。
当sql语句中包含/*& tenant:'租户编码' */时，对sql语句进行改写，
针对select、update、delete、等sql增加对租户字段的过滤条件。租户字段统一为tenant。
针对对insert语句增加租户字段的插入值。
注意要处理子查询的场景以及with语句的场景。
要处理insert into ... select ... from ...的场景。
要处理嵌套子查询的场景。
要处理多表查询的场景。


设计思路：
1. 解析hint信息，获取租户编码。如果没有hint信息，则不进行改写。返回原始sql。
2. 解析sql语句，生成抽象语法树（AST）。
3. 遍历AST，根据不同的SQL类型进行改写：
   - 对于SELECT语句，在WHERE子句中添加租户过滤条件。
   - 对于UPDATE语句，在WHERE子句中添加租户过滤条件。
   - 对对于DELETE语句，在WHERE子句中添加租户过滤条件。
   - 对于INSERT语句，在VALUES部分添加租户字段的值。
4. 处理子查询和WITH语句，确保在所有相关的查询中都添加租户过滤条件。
5. 处理INSERT INTO ... SELECT ... FROM ...的场景，确保在SELECT部分添加租户过滤条件。
6. 处理嵌套子查询，确保在所有层级的查询中都添加租户过滤条件。
7.  处理多表查询，确保在所有相关的表中都添加租户过滤条件。
8. 生成改写后的SQL语句。
9. 返回改写后的SQL语句。  
10. 编写单元测试，覆盖各种SQL类型和复杂场景，确保改写逻辑的正确性。

测试sql脚本范围：
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

