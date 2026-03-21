/**
 * 库名改写 Listener 测试套件
 *
 * 测试 DatabaseRewriteListener 的库名前缀添加功能
 * 对标旧库 DatabaseNameRewriter 的核心能力
 */

import { SqlRewriter } from '../src/index';
import type { SqlParserConfig } from '../src/core/types';

// ============================================================================
// 测试工具
// ============================================================================

function assertEqual(actual: string, expected: string, message?: string): void {
  const normalizedActual = actual.replace(/\s+/g, ' ').trim();
  const normalizedExpected = expected.replace(/\s+/g, ' ').trim();
  if (normalizedActual !== normalizedExpected) {
    throw new Error(
      `${message || 'Assertion failed'}: Values are not equal\n` +
      `Expected: ${normalizedExpected}\n` +
      `Actual:   ${normalizedActual}`
    );
  }
}

function assertContains(sql: string, fragment: string, message?: string): void {
  if (!sql.includes(fragment)) {
    throw new Error(
      `${message || 'Assertion failed'}: Expected SQL to contain "${fragment}"\n` +
      `Actual SQL: ${sql}`
    );
  }
}

function assertNotContains(sql: string, fragment: string, message?: string): void {
  if (sql.includes(fragment)) {
    throw new Error(
      `${message || 'Assertion failed'}: Expected SQL NOT to contain "${fragment}"\n` +
      `Actual SQL: ${sql}`
    );
  }
}

// ============================================================================
// 测试配置
// ============================================================================

/**
 * 创建测试用的 Rewriter
 * 同时启用库名改写和租户注入
 */
function createRewriter(overrides?: {
  dbPrefix?: string;
  targetDatabases?: string[];
  excludeDatabases?: string[];
  tenantEnabled?: boolean;
  databaseRewriteEnabled?: boolean;
}): SqlRewriter {
  const config: Partial<SqlParserConfig> = {
    dialect: 'mysql' as any,
    listeners: {
      tenant: {
        enabled: overrides?.tenantEnabled ?? false,
        priority: 100,
        abortOnError: false,
        tenantField: 'tenant',
        targetDatabases: {
          prefixes: ['tnt_'],
          fullNames: [],
          defaultDatabase: 'tnt_ma',
        },
      },
      hint: {
        enabled: true,
        priority: 10,
        abortOnError: false,
        preserveHint: false,
      },
      databaseRewrite: {
        enabled: overrides?.databaseRewriteEnabled ?? true,
        priority: 50,
        abortOnError: false,
        dbPrefix: overrides?.dbPrefix ?? 'dev_mc_',
        targetDatabases: overrides?.targetDatabases,
        excludeDatabases: overrides?.excludeDatabases,
      },
    } as any,
    errorHandling: {
      throwOnError: false,
      collectAll: true,
      maxErrors: 10,
      logErrors: false,
    },
  };

  return new SqlRewriter(config);
}

// ============================================================================
// 测试套件
// ============================================================================

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  originalSql?: string;
  rewrittenSql?: string;
}

const results: TestResult[] = [];

async function runTest(
  name: string,
  fn: () => { original: string; rewritten: string } | void
): Promise<void> {
  try {
    const sqlInfo = fn();
    const result: TestResult = { name, passed: true };
    if (sqlInfo) {
      result.originalSql = sqlInfo.original;
      result.rewrittenSql = sqlInfo.rewritten;
    }
    results.push(result);
    console.log(`  ✓ ${name}`);
    if (sqlInfo) {
      console.log(`    改写前: ${sqlInfo.original}`);
      console.log(`    改写后: ${sqlInfo.rewritten}`);
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    results.push({ name, passed: false, error: msg });
    console.log(`  ✗ ${name}`);
    console.log(`    ${msg}`);
  }
}

// ============================================================================
// 测试用例
// ============================================================================

async function runAllTests(): Promise<void> {
  console.log('\n========================================');
  console.log('库名改写 Listener 测试');
  console.log('========================================\n');

  // ------------------------------------------
  // 基础改写
  // ------------------------------------------
  console.log('--- 基础改写 ---');

  await runTest('SELECT 基础库名改写：添加前缀', () => {
    const rewriter = createRewriter();
    const input = 'SELECT * FROM tnt_ma.users';
    const result = rewriter.rewrite(input);
    assertContains(result.sql, 'dev_mc_tnt_ma.users', 'SELECT 库名应添加前缀');
    assertNotContains(result.sql, ' tnt_ma.users', '原始库名不应保留');
    return { original: input, rewritten: result.sql };
  });

  await runTest('SELECT 多表库名改写', () => {
    const rewriter = createRewriter();
    const input = 'SELECT * FROM tnt_ma.users, tnt_mb.orders';
    const result = rewriter.rewrite(input);
    assertContains(result.sql, 'dev_mc_tnt_ma.users', '第一个表库名应改写');
    assertContains(result.sql, 'dev_mc_tnt_mb.orders', '第二个表库名应改写');
    return { original: input, rewritten: result.sql };
  });

  await runTest('INSERT 库名改写', () => {
    const rewriter = createRewriter();
    const input = "INSERT INTO tnt_ma.users (name, age) VALUES ('test', 18)";
    const result = rewriter.rewrite(input);
    assertContains(result.sql, 'dev_mc_tnt_ma.users', 'INSERT 表库名应改写');
    return { original: input, rewritten: result.sql };
  });

  await runTest('UPDATE 库名改写', () => {
    const rewriter = createRewriter();
    const input = "UPDATE tnt_ma.users SET name = 'test' WHERE id = 1";
    const result = rewriter.rewrite(input);
    assertContains(result.sql, 'dev_mc_tnt_ma.users', 'UPDATE 表库名应改写');
    return { original: input, rewritten: result.sql };
  });

  await runTest('DELETE 库名改写', () => {
    const rewriter = createRewriter();
    const input = 'DELETE FROM tnt_ma.users WHERE id = 1';
    const result = rewriter.rewrite(input);
    assertContains(result.sql, 'dev_mc_tnt_ma.users', 'DELETE 表库名应改写');
    return { original: input, rewritten: result.sql };
  });

  // ------------------------------------------
  // 已有前缀跳过
  // ------------------------------------------
  console.log('\n--- 已有前缀跳过 ---');

  await runTest('已有前缀的库名不重复添加', () => {
    const rewriter = createRewriter();
    const input = 'SELECT * FROM dev_mc_tnt_ma.users';
    const result = rewriter.rewrite(input);
    // 不应出现 dev_mc_dev_mc_tnt_ma
    assertNotContains(result.sql, 'dev_mc_dev_mc_', '不应重复添加前缀');
    assertContains(result.sql, 'dev_mc_tnt_ma.users', '应保持原有前缀');
    return { original: input, rewritten: result.sql };
  });

  // ------------------------------------------
  // 排除列表
  // ------------------------------------------
  console.log('\n--- 排除列表 ---');

  await runTest('排除列表中的库名不改写', () => {
    const rewriter = createRewriter({
      excludeDatabases: ['system_db', 'information_schema'],
    });
    const input = 'SELECT * FROM system_db.config';
    const result = rewriter.rewrite(input);
    assertContains(result.sql, 'system_db.config', '排除库应保持原样');
    assertNotContains(result.sql, 'dev_mc_system_db', '排除库不应添加前缀');
    return { original: input, rewritten: result.sql };
  });

  await runTest('排除列表与非排除库混合使用', () => {
    const rewriter = createRewriter({
      excludeDatabases: ['system_db'],
    });
    const input = 'SELECT u.name, c.value FROM tnt_ma.users u JOIN system_db.config c ON u.config_id = c.id';
    const result = rewriter.rewrite(input);
    assertContains(result.sql, 'dev_mc_tnt_ma.users', '非排除库应改写');
    assertContains(result.sql, 'system_db.config', '排除库应保持原样');
    assertNotContains(result.sql, 'dev_mc_system_db', '排除库不应添加前缀');
    return { original: input, rewritten: result.sql };
  });

  // ------------------------------------------
  // 目标列表
  // ------------------------------------------
  console.log('\n--- 目标列表 ---');

  await runTest('仅改写目标列表中的库名', () => {
    const rewriter = createRewriter({
      targetDatabases: ['tnt_ma'],
    });
    const input = 'SELECT * FROM tnt_ma.users u JOIN tnt_mb.orders o ON u.id = o.user_id';
    const result = rewriter.rewrite(input);
    assertContains(result.sql, 'dev_mc_tnt_ma.users', '目标库应改写');
    // tnt_mb 不在目标列表中，不应改写
    assertContains(result.sql, 'tnt_mb.orders', '非目标库应保持原样');
    assertNotContains(result.sql, 'dev_mc_tnt_mb', '非目标库不应添加前缀');
    return { original: input, rewritten: result.sql };
  });

  // ------------------------------------------
  // JOIN 跨库查询
  // ------------------------------------------
  console.log('\n--- JOIN 跨库查询 ---');

  await runTest('INNER JOIN 两个库都改写', () => {
    const rewriter = createRewriter();
    const input = 'SELECT u.name, o.amount FROM tnt_ma.users u INNER JOIN tnt_ma.orders o ON u.id = o.user_id';
    const result = rewriter.rewrite(input);
    assertContains(result.sql, 'dev_mc_tnt_ma.users', 'JOIN 左表应改写');
    assertContains(result.sql, 'dev_mc_tnt_ma.orders', 'JOIN 右表应改写');
    return { original: input, rewritten: result.sql };
  });

  await runTest('LEFT JOIN 跨不同库', () => {
    const rewriter = createRewriter();
    const input = 'SELECT u.name, o.amount FROM tnt_ma.users u LEFT JOIN tnt_mb.orders o ON u.id = o.user_id';
    const result = rewriter.rewrite(input);
    assertContains(result.sql, 'dev_mc_tnt_ma.users', 'LEFT JOIN 左表应改写');
    assertContains(result.sql, 'dev_mc_tnt_mb.orders', 'LEFT JOIN 右表应改写');
    return { original: input, rewritten: result.sql };
  });

  await runTest('多重 JOIN', () => {
    const rewriter = createRewriter();
    const input = 'SELECT u.name, o.amount, p.name FROM tnt_ma.users u ' +
      'JOIN tnt_ma.orders o ON u.id = o.user_id ' +
      'JOIN tnt_mb.products p ON o.product_id = p.id';
    const result = rewriter.rewrite(input);
    assertContains(result.sql, 'dev_mc_tnt_ma.users', '第一个表应改写');
    assertContains(result.sql, 'dev_mc_tnt_ma.orders', '第二个表应改写');
    assertContains(result.sql, 'dev_mc_tnt_mb.products', '第三个表应改写');
    return { original: input, rewritten: result.sql };
  });

  // ------------------------------------------
  // 子查询中的库名改写
  // ------------------------------------------
  console.log('\n--- 子查询 ---');

  await runTest('WHERE 子查询中的库名改写', () => {
    const rewriter = createRewriter();
    const input = 'SELECT * FROM tnt_ma.users WHERE id IN (SELECT user_id FROM tnt_ma.orders WHERE amount > 100)';
    const result = rewriter.rewrite(input);
    assertContains(result.sql, 'dev_mc_tnt_ma.users', '外层表应改写');
    assertContains(result.sql, 'dev_mc_tnt_ma.orders', '子查询表应改写');
    return { original: input, rewritten: result.sql };
  });

  await runTest('FROM 子查询中的库名改写', () => {
    const rewriter = createRewriter();
    const input = 'SELECT t.name FROM (SELECT * FROM tnt_ma.users WHERE age > 18) t';
    const result = rewriter.rewrite(input);
    assertContains(result.sql, 'dev_mc_tnt_ma.users', '子查询中的表应改写');
    return { original: input, rewritten: result.sql };
  });

  // ------------------------------------------
  // CTE 中的库名改写
  // ------------------------------------------
  console.log('\n--- CTE ---');

  await runTest('CTE 中引用的库名改写', () => {
    const rewriter = createRewriter();
    const input = 'WITH active_users AS (SELECT * FROM tnt_ma.users WHERE status = 1) ' +
      'SELECT * FROM active_users';
    const result = rewriter.rewrite(input);
    assertContains(result.sql, 'dev_mc_tnt_ma.users', 'CTE 内的表应改写');
    return { original: input, rewritten: result.sql };
  });

  await runTest('多 CTE 中的库名改写', () => {
    const rewriter = createRewriter();
    const input = 'WITH active_users AS (SELECT * FROM tnt_ma.users WHERE status = 1), ' +
      'recent_orders AS (SELECT * FROM tnt_mb.orders WHERE created_at > "2024-01-01") ' +
      'SELECT u.name, o.amount FROM active_users u JOIN recent_orders o ON u.id = o.user_id';
    const result = rewriter.rewrite(input);
    assertContains(result.sql, 'dev_mc_tnt_ma.users', 'CTE-1 内的表应改写');
    assertContains(result.sql, 'dev_mc_tnt_mb.orders', 'CTE-2 内的表应改写');
    return { original: input, rewritten: result.sql };
  });

  // ------------------------------------------
  // 与租户注入联合使用
  // ------------------------------------------
  console.log('\n--- 联合使用（库名改写 + 租户注入） ---');

  await runTest('库名改写 + 租户注入同时生效', () => {
    const rewriter = createRewriter({ tenantEnabled: true });
    const input = "/*& tenant:'sxlq' */ SELECT * FROM tnt_ma.users";
    const result = rewriter.rewrite(input);
    // 库名应被改写
    assertContains(result.sql, 'dev_mc_tnt_ma.users', '库名应被改写');
    // 租户条件应被注入
    assertContains(result.sql, "tenant = 'sxlq'", '租户条件应被注入');
    return { original: input, rewritten: result.sql };
  });

  await runTest('联合使用：INSERT 场景', () => {
    const rewriter = createRewriter({ tenantEnabled: true });
    const input = "/*& tenant:'sxlq' */ INSERT INTO tnt_ma.users (name, age) VALUES ('test', 18)";
    const result = rewriter.rewrite(input);
    assertContains(result.sql, 'dev_mc_tnt_ma.users', 'INSERT 库名应被改写');
    // INSERT 应注入租户字段和值
    assertContains(result.sql, 'tenant', '应注入租户字段');
    assertContains(result.sql, 'sxlq', '应注入租户值');
    return { original: input, rewritten: result.sql };
  });

  await runTest('联合使用：UPDATE 场景', () => {
    const rewriter = createRewriter({ tenantEnabled: true });
    const input = "/*& tenant:'sxlq' */ UPDATE tnt_ma.users SET name = 'test' WHERE id = 1";
    const result = rewriter.rewrite(input);
    assertContains(result.sql, 'dev_mc_tnt_ma.users', 'UPDATE 库名应被改写');
    assertContains(result.sql, "tenant = 'sxlq'", 'UPDATE 应注入租户条件');
    return { original: input, rewritten: result.sql };
  });

  await runTest('联合使用：DELETE 场景', () => {
    const rewriter = createRewriter({ tenantEnabled: true });
    const input = "/*& tenant:'sxlq' */ DELETE FROM tnt_ma.users WHERE id = 1";
    const result = rewriter.rewrite(input);
    assertContains(result.sql, 'dev_mc_tnt_ma.users', 'DELETE 库名应被改写');
    assertContains(result.sql, "tenant = 'sxlq'", 'DELETE 应注入租户条件');
    return { original: input, rewritten: result.sql };
  });

  await runTest('联合使用：JOIN 场景', () => {
    const rewriter = createRewriter({ tenantEnabled: true });
    const input = "/*& tenant:'sxlq' */ SELECT u.name, o.amount FROM tnt_ma.users u " +
      "JOIN tnt_ma.orders o ON u.id = o.user_id WHERE u.status = 1";
    const result = rewriter.rewrite(input);
    assertContains(result.sql, 'dev_mc_tnt_ma.users', 'JOIN 左表库名应改写');
    assertContains(result.sql, 'dev_mc_tnt_ma.orders', 'JOIN 右表库名应改写');
    assertContains(result.sql, "u.tenant = 'sxlq'", '左表应注入租户条件');
    assertContains(result.sql, "o.tenant = 'sxlq'", '右表应注入租户条件');
    return { original: input, rewritten: result.sql };
  });

  // ------------------------------------------
  // 边界场景
  // ------------------------------------------
  console.log('\n--- 边界场景 ---');

  await runTest('无库名的表不处理', () => {
    const rewriter = createRewriter();
    const input = 'SELECT * FROM users';
    const result = rewriter.rewrite(input);
    // 无库名的表不应被改写（因为没有库名可以添加前缀）
    assertNotContains(result.sql, 'dev_mc_', '无库名的表不应被添加前缀');
    return { original: input, rewritten: result.sql };
  });

  await runTest('禁用库名改写时不处理', () => {
    const rewriter = createRewriter({ databaseRewriteEnabled: false });
    const input = 'SELECT * FROM tnt_ma.users';
    const result = rewriter.rewrite(input);
    assertContains(result.sql, 'tnt_ma.users', '禁用时应保持原样');
    assertNotContains(result.sql, 'dev_mc_', '禁用时不应添加前缀');
    return { original: input, rewritten: result.sql };
  });

  await runTest('空前缀不处理', () => {
    const rewriter = createRewriter({ dbPrefix: '' });
    const input = 'SELECT * FROM tnt_ma.users';
    const result = rewriter.rewrite(input);
    assertContains(result.sql, 'tnt_ma.users', '空前缀时应保持原样');
    return { original: input, rewritten: result.sql };
  });

  await runTest('REPLACE INTO 库名改写', () => {
    const rewriter = createRewriter();
    const input = "REPLACE INTO tnt_ma.users (id, name) VALUES (1, 'test')";
    const result = rewriter.rewrite(input);
    assertContains(result.sql, 'dev_mc_tnt_ma.users', 'REPLACE 表库名应改写');
    return { original: input, rewritten: result.sql };
  });

  await runTest('UNION 查询中的库名改写', () => {
    const rewriter = createRewriter();
    const input = 'SELECT name FROM tnt_ma.users UNION SELECT name FROM tnt_mb.customers';
    const result = rewriter.rewrite(input);
    assertContains(result.sql, 'dev_mc_tnt_ma.users', 'UNION 左侧表应改写');
    assertContains(result.sql, 'dev_mc_tnt_mb.customers', 'UNION 右侧表应改写');
    return { original: input, rewritten: result.sql };
  });

  // ------------------------------------------
  // 输出结果
  // ------------------------------------------
  console.log('\n========================================');
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  console.log(`结果: ${passed} 通过, ${failed} 失败, 共 ${results.length} 个测试`);
  console.log('========================================\n');

  if (failed > 0) {
    console.log('失败的测试:');
    for (const r of results.filter(r => !r.passed)) {
      console.log(`  ✗ ${r.name}`);
      console.log(`    ${r.error}`);
    }
    process.exit(1);
  }
}

runAllTests().catch(console.error);
