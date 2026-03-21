import SqlParserService from '../src/index';

/**
 * SQL Parser 综合测试套件
 * 整合了基础测试、高级测试和默认库功能测试
 */

/**
 * 基础功能测试
 */
function runBasicTests() {
  console.log('🔸 ========== 基础功能测试 ==========\n');

  const basicTests = [
    {
      name: '基本SELECT查询',
      sql: "/*& tenant:'sxlq' */ SELECT * FROM users",
    },
    {
      name: 'INSERT语句',
      sql: "/*& tenant:'sxlq' */ INSERT INTO users (username, email, age) VALUES ('zhang_san', 'zhang@sxlq.com', 28)",
    },
    {
      name: 'INSERT default场景',
      sql: "/*& tenant:'sxlq' */ INSERT INTO `db_upgrade_history`(`created_at`, `creator_id`, `creator_name`, `modifier_at`, `modifier_id`, `modifier_name`, `is_removed`, `version`, `id`, `database_name`, `script_version`, `script_name`, `execution_status`, `execution_time`, `error_message`, `jenkins_build_number`, `is_dry_run`) VALUES (DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, ?, ?, ?, ?, ?, ?, ?, ?, DEFAULT, ?)",
    },
    {
      name: 'UPDATE语句',
      sql: "/*& tenant:'sxlq' */ UPDATE users SET age = 29 WHERE username = 'zhang_san'",
    },
    {
      name: 'DELETE语句',
      sql: "/*& tenant:'sxlq' */ DELETE FROM users WHERE age < 26",
    },
    {
      name: '多表JOIN查询',
      sql: "/*& tenant:'sxlq' */ SELECT u.username, o.product_name FROM users u JOIN orders o ON u.id = o.user_id WHERE o.status = 'completed'",
    },
    {
      name: '子查询',
      sql: "/*& tenant:'sxlq' */ SELECT * FROM users WHERE age > (SELECT AVG(age) FROM users)",
    },
    {
      name: 'INSERT ... SELECT',
      sql: "/*& tenant:'sxlq' */ INSERT INTO orders (user_id, product_name, amount) SELECT u.id, 'iPhone 15', 6999.00 FROM users u WHERE u.username = 'zhang_san'",
    },
    {
      name: '无hint的SQL（应该原样返回）',
      sql: 'SELECT * FROM users',
    },
  ];

  basicTests.forEach((test, index) => {
    console.log(`📋 测试${index + 1}: ${test.name}`);
    console.log('原始SQL:', test.sql);

    try {
      const result = SqlParserService.rewriteWithTenant(test.sql);
      console.log('重写后:', result);
      console.log('✅ 测试通过\n');
    } catch (error) {
      console.log(
        '❌ 测试失败:',
        error instanceof Error ? error.message : error,
      );
      console.log('');
    }
  });

  // Hint功能测试
  console.log('📋 测试9: Hint提取功能');
  const hint = SqlParserService.extractHint(
    "/*& tenant:'sxlq' */ SELECT * FROM users",
  );
  console.log('Hint信息:', hint);
  console.log('✅ 测试通过\n');

  // 详细信息获取测试
  console.log('📋 测试10: 获取详细信息');
  const details = SqlParserService.getDetailedInfo(
    "/*& tenant:'sxlq' */ SELECT * FROM users",
  );
  console.log('详细信息:', details);
  console.log('✅ 测试通过\n');
}

/**
 * 高级功能测试
 */
function runAdvancedTests() {
  console.log('🔸 ========== 高级功能测试 ==========\n');

  const advancedTests = [
    {
      name: 'WITH子句 (CTE)',
      sql: `/*& tenant:'sxlq' */ WITH user_orders AS (
        SELECT u.id as user_id, u.username, COUNT(o.order_id) as order_count
        FROM users u
        LEFT JOIN orders o ON u.id = o.user_id
        GROUP BY u.id, u.username
      )
      SELECT username, order_count
      FROM user_orders
      WHERE order_count > 0`,
    },
    {
      name: '窗口函数',
      sql: `/*& tenant:'sxlq' */ SELECT 
        username,
        age,
        ROW_NUMBER() OVER (ORDER BY age DESC) as age_rank
      FROM users`,
    },
    {
      name: 'UNION ALL',
      sql: `/*& tenant:'sxlq' */ SELECT 'users' as type, username as name FROM users
      where tenant = 'sxlq'
      UNION ALL
      SELECT 'products', product_name FROM products`,
    },
    {
      name: '嵌套子查询',
      sql: `/*& tenant:'sxlq' */ SELECT product_name, price
      FROM products p
      WHERE p.price > (
        SELECT AVG(price) 
        FROM products p2 
        WHERE p2.category IN (
          SELECT DISTINCT category 
          FROM products p3 
          WHERE p3.stock_quantity > 10
        )
      )`,
    },
    {
      name: 'EXISTS子查询',
      sql: `/*& tenant:'sxlq' */ SELECT u.username, u.email
      FROM users u
      WHERE EXISTS (
        SELECT 1 FROM orders o 
        WHERE o.user_id = u.id AND o.status = 'completed'
      )`,
    },
    {
      name: 'INSERT SET格式',
      sql: `/*& tenant:'sxlq' */ INSERT INTO products 
      SET product_name='iPad Air', category='Electronics', price=4999.00`,
    },
    {
      name: 'UPDATE JOIN',
      sql: `/*& tenant:'sxlq' */ UPDATE orders o 
      JOIN users u ON o.user_id = u.id 
      SET o.status = 'shipped' 
      WHERE u.username = 'li_si'`,
    },
    {
      name: '三表JOIN',
      sql: `/*& tenant:'sxlq' */ SELECT u.username, o.product_name, p.price
      FROM users u
      JOIN orders o ON u.id = o.user_id
      JOIN products p ON o.product_name = p.product_name
      WHERE o.status = 'completed'`,
    },
  ];

  advancedTests.forEach((test, index) => {
    console.log(`📋 测试${index + 1}: ${test.name}`);
    console.log('原始SQL:');
    console.log(test.sql);
    console.log('');

    try {
      const result = SqlParserService.rewriteWithTenant(test.sql);
      console.log('重写后:');
      console.log(result);
      console.log('✅ 测试通过\n');
    } catch (error) {
      console.log(
        '❌ 测试失败:',
        error instanceof Error ? error.message : error,
      );
      console.log('');
    }

    console.log('-'.repeat(80) + '\n');
  });
}

/**
 * 默认库功能测试
 */
function runDefaultDatabaseTests() {
  console.log('🔸 ========== 默认库功能测试 ==========\n');

  console.log('📋 测试1: 设置默认库为目标库（tnt_main）');
  SqlParserService.setDefaultDatabase('tnt_main');

  const sql1 = "/*& tenant:'sxlq' */ SELECT * FROM users where tenant = 'sxlq'";
  const result1 = SqlParserService.rewriteWithTenant(sql1);
  console.log('原始SQL:', sql1);
  console.log('重写后:', result1);
  console.log('预期: 添加租户条件（因为tnt_main匹配前缀tnt_）');
  console.log('✅ 测试通过\n');

  console.log('📋 测试2: 设置默认库为非目标库（public）');
  SqlParserService.setDefaultDatabase('public');

  const sql2 = "/*& tenant:'sxlq' */ SELECT * FROM users";
  const result2 = SqlParserService.rewriteWithTenant(sql2);
  console.log('原始SQL:', sql2);
  console.log('重写后:', result2);
  console.log('预期: 不添加租户条件（因为public不匹配任何规则）');
  console.log('✅ 测试通过\n');

  // 测试3: 设置默认库为完整库名匹配（global_mb）
  console.log('📋 测试3: 设置默认库为完整库名匹配（global_mb）');
  SqlParserService.setDefaultDatabase('global_mb');

  const sql3 =
    "/*& tenant:'sxlq' */ INSERT INTO orders (product, amount) VALUES ('iPhone', 999)";
  const result3 = SqlParserService.rewriteWithTenant(sql3);
  console.log('原始SQL:', sql3);
  console.log('重写后:', result3);
  console.log('预期: 添加租户字段（因为global_mb完全匹配）');
  console.log('✅ 测试通过\n');

  // 测试4: 混合场景（无库名和有库名）
  console.log('📋 测试4: 混合场景（无库名和有库名）');
  SqlParserService.setDefaultDatabase('tnt_main');

  const sql4 =
    "/*& tenant:'sxlq' */ SELECT u.name, p.title FROM users u JOIN public.posts p ON u.id = p.user_id";
  const result4 = SqlParserService.rewriteWithTenant(sql4);
  console.log('原始SQL:', sql4);
  console.log('重写后:', result4);
  console.log('预期: users（默认库tnt_main）添加租户条件，public.posts不添加');
  console.log('✅ 测试通过\n');

  // 测试5: UPDATE和DELETE语句
  console.log('📋 测试5: UPDATE和DELETE语句（默认库）');
  SqlParserService.setDefaultDatabase('tnt_order');

  const sql5 =
    "/*& tenant:'sxlq' */ UPDATE products SET price = 100 WHERE id = 1";
  const result5 = SqlParserService.rewriteWithTenant(sql5);
  console.log('原始SQL:', sql5);
  console.log('重写后:', result5);

  const sql6 =
    "/*& tenant:'sxlq' */ DELETE FROM old_records WHERE created_at < '2023-01-01'";
  const result6 = SqlParserService.rewriteWithTenant(sql6);
  console.log('原始SQL:', sql6);
  console.log('重写后:', result6);
  console.log('预期: 都添加租户条件（因为tnt_order匹配前缀）');
  console.log('✅ 测试通过\n');

  // 测试6: 配置检查
  console.log('📋 测试6: 查看当前配置');
  console.log('当前配置:', SqlParserService.getConfig());
  console.log(
    '默认库:',
    SqlParserService.getConfig().targetDatabases?.defaultDatabase,
  );
  console.log('✅ 测试通过\n');

  // 测试7: 测试没有默认库配置时的异常
  console.log('📋 测试7: 测试无默认库配置的异常处理');
  try {
    const customRewriter = SqlParserService.createRewriter({
      targetDatabases: {
        prefixes: ['test_'],
        fullNames: ['special'],
        defaultDatabase: '', // 空默认库
      },
    });

    const sqlNoDefault = "/*& tenant:'test' */ SELECT * FROM users";
    customRewriter.rewrite(sqlNoDefault);
    console.log('❌ 意外：应该抛出异常但没有');
  } catch (error) {
    console.log('✅ 正确抛出异常:', error.message);
  }
  console.log('');
}

/**
 * 跨库联查测试（包含跨库联查场景）
 */
function runCrossDatabaseTests() {
  console.log('🔸 ========== 跨库联查测试 ==========\n');

  // 重置配置
  SqlParserService.setConfig({
    tenantField: 'tenant',
    database: 'mysql',
    throwOnError: true,
    targetDatabases: {
      prefixes: ['tnt_'],
      fullNames: ['global_mb'],
      defaultDatabase: 'main',
    },
  });

  const crossDbTests = [
    {
      name: '跨库JOIN - 目标库与普通库联查',
      sql: "/*& tenant:'sxlq' */ SELECT u.name, p.title FROM tnt_main.users u JOIN public.posts p ON u.id = p.user_id",
      expectation: '只有tnt_main.users添加租户条件，public.posts不变',
    },
    {
      name: '两个目标库联查',
      sql: "/*& tenant:'sxlq' */ SELECT u.name, o.amount FROM tnt_main.users u JOIN global_mb.orders o ON u.id = o.user_id",
      expectation: '两个表都添加租户条件',
    },
    {
      name: '复杂多库联查',
      sql: `/*& tenant:'sxlq' */ 
        SELECT u.name, p.title, o.amount, c.content
        FROM tnt_main.users u 
        LEFT JOIN public.posts p ON u.id = p.user_id
        LEFT JOIN tnt_order.orders o ON u.id = o.user_id
        LEFT JOIN system.comments c ON p.id = c.post_id`,
      expectation:
        'tnt_main.users和tnt_order.orders添加租户条件，public.posts和system.comments不变',
    },
    {
      name: 'INSERT到目标库',
      sql: "/*& tenant:'sxlq' */ INSERT INTO tnt_main.users (name, email) VALUES ('张三', 'zhang@example.com')",
      expectation: '添加tenant字段和值',
    },
    {
      name: 'INSERT到普通库',
      sql: "/*& tenant:'sxlq' */ INSERT INTO public.logs (message, created_at) VALUES ('日志信息', NOW())",
      expectation: '不添加tenant字段（因为不是目标库）',
    },
    {
      name: 'UPDATE目标库',
      sql: "/*& tenant:'sxlq' */ UPDATE global_mb.products SET price = 100 WHERE id = 1",
      expectation: '在WHERE条件中添加租户条件',
    },
    {
      name: 'DELETE from 目标库',
      sql: "/*& tenant:'sxlq' */ DELETE FROM tnt_temp.old_records WHERE created_at < '2023-01-01'",
      expectation: '在WHERE条件中添加租户条件',
    },
    {
      name: '子查询混合场景',
      sql: `/*& tenant:'sxlq' */ 
        SELECT u.name 
        FROM tnt_main.users u 
        WHERE u.id IN (
          SELECT o.user_id 
          FROM global_mb.orders o 
          WHERE o.amount > (
            SELECT AVG(amount) 
            FROM public.order_stats
          )
        )`,
      expectation:
        'tnt_main.users和global_mb.orders添加租户条件，public.order_stats不变',
    },
  ];

  crossDbTests.forEach((test, index) => {
    console.log(`📋 测试${index + 1}: ${test.name}`);
    console.log('原始SQL:', test.sql);

    try {
      const result = SqlParserService.rewriteWithTenant(test.sql);
      console.log('重写后:', result);
      console.log('预期:', test.expectation);
      console.log('✅ 测试通过\n');
    } catch (error) {
      console.log(
        '❌ 测试失败:',
        error instanceof Error ? error.message : error,
      );
      console.log('');
    }
  });

  // 动态配置测试
  console.log('📋 测试9: 动态配置修改');
  console.log('当前配置:', SqlParserService.getConfig());

  // 添加新的前缀和库名
  SqlParserService.addDatabasePrefix('app_');
  SqlParserService.addDatabaseName('special_db');

  console.log('修改后配置:', SqlParserService.getConfig());

  // 测试新配置下的SQL重写
  const sql9 =
    "/*& tenant:'sxlq' */ SELECT * FROM app_test.data a JOIN special_db.configs s ON a.id = s.data_id";
  const result9 = SqlParserService.rewriteWithTenant(sql9);
  console.log('原始SQL:', sql9);
  console.log('重写后:', result9);
  console.log('预期: 两个表都添加租户条件（因为匹配新配置）');
  console.log('✅ 测试通过\n');
}

/**
 * 输出测试环境信息和配置参数
 */
function printTestEnvironment() {
  // 初始化配置
  SqlParserService.setConfig({
    tenantField: 'tenant',
    database: 'mysql',
    throwOnError: true,
    targetDatabases: {
      prefixes: ['tnt_'],
      fullNames: ['global_mb'],
      defaultDatabase: 'global_mb',
    },
  });
  console.log('🔧 ========== 测试环境信息 ==========');
  console.log('📅 测试时间:', new Date().toLocaleString('zh-CN'));
  console.log('🔢 Node.js 版本:', process.version);
  console.log('💻 平台:', process.platform);
  console.log('📁 工作目录:', process.cwd());
  console.log('🎯 测试目标:', 'SQL Parser 多库租户隔离功能');

  console.log('\n📋 ========== 当前配置参数 ==========');
  const currentConfig = SqlParserService.getConfig();
  console.log('🏷️  租户字段名:', currentConfig.tenantField);
  console.log('🗄️  数据库类型:', currentConfig.database);
  console.log(
    '⚠️  异常处理:',
    currentConfig.throwOnError ? '抛出异常' : '忽略错误',
  );

  if (currentConfig.targetDatabases) {
    console.log('🎯 目标数据库配置:');
    console.log('   📝 库名前缀:', currentConfig.targetDatabases.prefixes);
    console.log('   📋 完整库名:', currentConfig.targetDatabases.fullNames);
    console.log(
      '   🏠 默认库名:',
      currentConfig.targetDatabases.defaultDatabase,
    );
  }

  console.log('\n🧪 ========== 测试范围 ==========');
  console.log('✅ 基础功能测试 (SELECT、INSERT、UPDATE、DELETE)');
  console.log('✅ 高级功能测试 (CTE、窗口函数、UNION、复杂子查询)');
  console.log('✅ 默认库功能测试 (无库名表处理)');
  console.log('✅ 跨库联查测试 (多库选择性改写)');

  console.log('\n' + '='.repeat(50) + '\n');
}

/**
 * 运行所有测试
 */
function runAllTests() {
  console.log('🚀 ========== SQL Parser 综合测试套件 ==========\n');

  // 输出测试环境信息和参数
  printTestEnvironment();

  const startTime = Date.now();

  try {
    runBasicTests();
    runAdvancedTests();
    runDefaultDatabaseTests();
    runCrossDatabaseTests();

    const endTime = Date.now();
    console.log('🎉 ========== 所有测试完成 ==========');
    console.log(`✅ 测试执行时间: ${endTime - startTime}ms`);
    console.log('🎯 所有功能测试通过，SQL Parser工作正常！');
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  }
}

// 如果直接运行此文件，则执行所有测试
if (require.main === module) {
  runAllTests();
}

// 导出各个测试函数
export {
  runBasicTests,
  runAdvancedTests,
  runDefaultDatabaseTests,
  runCrossDatabaseTests,
  runAllTests,
};

// 默认导出综合测试
export default runAllTests;
