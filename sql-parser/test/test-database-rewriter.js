const { DatabaseNameRewriter } = require('../lib/index.js');

console.log('=== 数据库名改写器测试 ===\n');

// 创建测试配置
const config = {
  enabled: true,
  dbPrefix: 'xxxxxxxx_',
  targetDatabases: [],
  excludeDatabases: ['system', 'information_schema'],
  preserveOriginalName: true,
};

const rewriter = new DatabaseNameRewriter(config);

// 测试用例集合
const testCases = [
  {
    name: '基本SELECT',
    sql: 'SELECT * FROM global_platform.users',
  },
  {
    name: 'INNER JOIN with ON条件',
    sql: "SELECT * FROM `global_mtlp`.`c_supplier` INNER JOIN `company` ON `global_mtlp`.`c_supplier`.`id` = `company`.`id` WHERE `c_supplier`.`tenant` = 'sxlq' LIMIT 0, 100",
  },
  {
    name: 'LEFT JOIN with多个ON条件',
    sql: 'SELECT * FROM global_mtlp.users u LEFT JOIN company_db.departments d ON global_mtlp.users.dept_id = company_db.departments.id AND global_mtlp.users.active = 1',
  },
  {
    name: '多表JOIN',
    sql: 'SELECT * FROM global_mtlp.users u LEFT JOIN company_db.departments d ON u.dept_id = d.id RIGHT JOIN user_db.profiles p ON global_mtlp.users.id = user_db.profiles.user_id',
  },
  {
    name: 'INSERT语句',
    sql: 'INSERT INTO global_mtlp.users (name, dept_id) SELECT name, dept_id FROM company_db.temp_users',
  },
  {
    name: 'UPDATE with EXISTS子查询',
    sql: 'UPDATE global_mtlp.users u SET u.status = 1 WHERE EXISTS (SELECT 1 FROM company_db.active_dept d WHERE global_mtlp.users.dept_id = company_db.active_dept.id)',
  },
  {
    name: 'DELETE with IN子查询',
    sql: 'DELETE FROM global_mtlp.users WHERE dept_id IN (SELECT id FROM company_db.departments WHERE company_db.departments.active = 0)',
  },
  {
    name: 'WHERE子句中的列引用和子查询',
    sql: 'SELECT * FROM global_mtlp.users WHERE global_mtlp.users.created_at > (SELECT MAX(user_db.logs.created_at) FROM user_db.logs)',
  },
  {
    name: '复杂嵌套查询',
    sql: 'SELECT * FROM (SELECT u.*, d.name as dept_name FROM global_mtlp.users u JOIN company_db.departments d ON global_mtlp.users.dept_id = company_db.departments.id) t WHERE t.dept_name IS NOT NULL',
  },
  {
    name: 'insert Default场景',
    sql: 'INSERT INTO `db_upgrade_history`(`created_at`, `creator_id`, `creator_name`, `modifier_at`, `modifier_id`, `modifier_name`, `is_removed`, `version`, `id`, `database_name`, `script_version`, `script_name`, `execution_status`, `execution_time`, `error_message`, `jenkins_build_number`, `is_dry_run`) VALUES (DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, ?, ?, ?, ?, ?, ?, ?, ?, DEFAULT, ?)',
  },
  {
    name: 'UPDATE 场景',
    sql: 'UPDATE `db_upgrade_config` SET `current_version` = ?, `status` = ?, `version` = ?, `modifier_at` = CURRENT_TIMESTAMP WHERE (`database_name` = ? AND `is_removed` = ?)',
  },
  {
    name: 'SELECT 场景',
    sql: 'SELECT `DbUpgradeHistory`.`created_at` AS `DbUpgradeHistory_created_at`, `DbUpgradeHistory`.`modifier_at` AS `DbUpgradeHistory_modifier_at`, `DbUpgradeHistory`.`is_removed` AS `DbUpgradeHistory_is_removed`, `DbUpgradeHistory`.`id` AS `DbUpgradeHistory_id`, `DbUpgradeHistory`.`execution_time` AS `DbUpgradeHistory_execution_time`, `DbUpgradeHistory`.`is_dry_run` AS `DbUpgradeHistory_is_dry_run` FROM `db_upgrade_history` `DbUpgradeHistory` WHERE `DbUpgradeHistory`.`id` = ?',
  },
  {
    name: 'WITH语句（CTE）- 简单场景',
    sql: 'WITH active_users AS (SELECT id, name FROM global_mtlp.users WHERE status = 1) SELECT * FROM active_users a JOIN company_db.departments d ON a.dept_id = d.id',
  },
  {
    name: 'WITH语句（CTE）- 多个CTE',
    sql: "WITH dept_summary AS (SELECT dept_id, COUNT(*) as user_count FROM global_mtlp.users GROUP BY dept_id), active_depts AS (SELECT id, name FROM company_db.departments WHERE status = 'active') SELECT ds.dept_id, ds.user_count, ad.name FROM dept_summary ds JOIN active_depts ad ON ds.dept_id = ad.id",
  },
  {
    name: 'WITH语句（CTE）- 递归CTE',
    sql: 'WITH RECURSIVE dept_hierarchy AS (SELECT id, name, parent_id, 0 as level FROM company_db.departments WHERE parent_id IS NULL UNION ALL SELECT d.id, d.name, d.parent_id, dh.level + 1 FROM company_db.departments d INNER JOIN dept_hierarchy dh ON d.parent_id = dh.id) SELECT * FROM dept_hierarchy WHERE level <= 3',
  },
  {
    name: 'WITH语句（CTE）- 包含子查询',
    sql: 'WITH user_stats AS (SELECT user_id, COUNT(*) as order_count FROM global_mtlp.orders WHERE EXISTS (SELECT 1 FROM company_db.active_products p WHERE global_mtlp.orders.product_id = p.id) GROUP BY user_id) SELECT us.*, u.name FROM user_stats us JOIN global_mtlp.users u ON us.user_id = u.id',
  },
  {
    name: '排除数据库测试（system不应被改写）',
    sql: 'SELECT * FROM system.config JOIN global_mtlp.users ON system.config.user_id = global_mtlp.users.id',
  },
  {
    name: '复杂真实场景测试',
    sql: 'SELECT s.*, c.name as company_name FROM global_mtlp.suppliers s LEFT JOIN company_db.companies c ON global_mtlp.suppliers.company_id = company_db.companies.id WHERE global_mtlp.suppliers.status = 1 AND EXISTS (SELECT 1 FROM user_db.user_suppliers us WHERE global_mtlp.suppliers.id = user_db.user_suppliers.supplier_id)',
  },
];

// 执行测试
testCases.forEach((testCase, index) => {
  console.log(`${index + 1}. ${testCase.name}`);
  console.log(`原始SQL:`);
  console.log(`  ${testCase.sql}`);
  console.log('');

  const result = rewriter.rewriteDatabase(testCase.sql);
  console.log(`改写后:`);
  console.log(`  ${result.sql}`);
  console.log(`是否修改: ${result.modified ? '✅ 是' : '❌ 否'}`);

  if (result.databaseRewrites.length > 0) {
    console.log('改写详情:');
    result.databaseRewrites.forEach((rewrite) => {
      console.log(`  📝 ${rewrite.originalName} → ${rewrite.rewrittenName}`);
    });
  } else if (result.modified === false) {
    console.log('📋 无改写（可能原因：数据库不在目标列表或在排除列表中）');
  }

  console.log(''.padEnd(80, '='));
  console.log('');
});

console.log('测试完成！');
console.log('\\n配置说明:');
console.log(`- 前缀:  ${config.dbPrefix}`);
console.log(
  `- 目标数据库: ${config.targetDatabases.length > 0 ? config.targetDatabases.join(',') : '无限制'}`,
);
console.log(`- 排除数据库: ${config.excludeDatabases.join(',')}`);
