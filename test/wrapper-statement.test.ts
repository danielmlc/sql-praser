/**
 * EXPLAIN/DESCRIBE 包装语句测试套件
 *
 * 测试对 EXPLAIN SELECT/UPDATE/DELETE 等包装语句中
 * 内嵌 DML 的租户条件注入能力
 */

import { SqlRewriter } from '../src/index';
import type { SqlParserConfig } from '../src/core/types';

// ============================================================================
// 测试工具
// ============================================================================

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

function createRewriter(overrides?: {
  tenantEnabled?: boolean;
  databaseRewriteEnabled?: boolean;
}): SqlRewriter {
  const config: Partial<SqlParserConfig> = {
    dialect: 'mysql' as any,
    listeners: {
      tenant: {
        enabled: overrides?.tenantEnabled ?? true,
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
        enabled: overrides?.databaseRewriteEnabled ?? false,
        priority: 50,
        abortOnError: false,
        dbPrefix: 'dev_mc_',
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
}

const results: TestResult[] = [];

async function runTest(name: string, fn: () => void): Promise<void> {
  try {
    fn();
    results.push({ name, passed: true });
    console.log(`  ✓ ${name}`);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    results.push({ name, passed: false, error: msg });
    console.log(`  ✗ ${name}`);
    console.log(`    ${msg}`);
  }
}

async function runAllTests(): Promise<void> {
  console.log('\n========================================');
  console.log('EXPLAIN/DESCRIBE 包装语句测试');
  console.log('========================================\n');

  // ------------------------------------------
  // EXPLAIN SELECT
  // ------------------------------------------
  console.log('--- EXPLAIN SELECT ---');

  await runTest('EXPLAIN SELECT 注入租户条件', () => {
    const rewriter = createRewriter();
    const result = rewriter.rewrite(
      "/*& tenant:'sxlq' */ EXPLAIN SELECT * FROM tnt_ma.users"
    );
    assertContains(result.sql, "tenant = 'sxlq'", 'EXPLAIN SELECT 应注入租户条件');
    assertContains(result.sql, 'EXPLAIN', '应保留 EXPLAIN 关键字');
  });

  await runTest('EXPLAIN SELECT 带 WHERE 条件', () => {
    const rewriter = createRewriter();
    const result = rewriter.rewrite(
      "/*& tenant:'sxlq' */ EXPLAIN SELECT * FROM tnt_ma.users WHERE age > 18"
    );
    assertContains(result.sql, "tenant = 'sxlq'", '应注入租户条件');
    assertContains(result.sql, 'age > 18', '应保留原有条件');
  });

  await runTest('EXPLAIN SELECT 带 JOIN', () => {
    const rewriter = createRewriter();
    const result = rewriter.rewrite(
      "/*& tenant:'sxlq' */ EXPLAIN SELECT u.name, o.amount FROM tnt_ma.users u " +
      "JOIN tnt_ma.orders o ON u.id = o.user_id"
    );
    assertContains(result.sql, "u.tenant = 'sxlq'", 'JOIN 左表应注入租户条件');
    assertContains(result.sql, "o.tenant = 'sxlq'", 'JOIN 右表应注入租户条件');
  });

  await runTest('EXPLAIN EXTENDED SELECT 注入租户条件', () => {
    const rewriter = createRewriter();
    const result = rewriter.rewrite(
      "/*& tenant:'sxlq' */ EXPLAIN EXTENDED SELECT * FROM tnt_ma.users"
    );
    assertContains(result.sql, "tenant = 'sxlq'", 'EXPLAIN EXTENDED 应注入租户条件');
    assertContains(result.sql, 'EXPLAIN', '应保留 EXPLAIN');
  });

  await runTest('EXPLAIN FORMAT=JSON SELECT 注入租户条件', () => {
    const rewriter = createRewriter();
    const result = rewriter.rewrite(
      "/*& tenant:'sxlq' */ EXPLAIN FORMAT = JSON SELECT * FROM tnt_ma.users"
    );
    assertContains(result.sql, "tenant = 'sxlq'", 'EXPLAIN FORMAT=JSON 应注入租户条件');
  });

  // ------------------------------------------
  // EXPLAIN UPDATE
  // ------------------------------------------
  console.log('\n--- EXPLAIN UPDATE ---');

  await runTest('EXPLAIN UPDATE 注入租户条件', () => {
    const rewriter = createRewriter();
    const result = rewriter.rewrite(
      "/*& tenant:'sxlq' */ EXPLAIN UPDATE tnt_ma.users SET name = 'test' WHERE id = 1"
    );
    assertContains(result.sql, "tenant = 'sxlq'", 'EXPLAIN UPDATE 应注入租户条件');
    assertContains(result.sql, 'EXPLAIN', '应保留 EXPLAIN');
  });

  // ------------------------------------------
  // EXPLAIN DELETE
  // ------------------------------------------
  console.log('\n--- EXPLAIN DELETE ---');

  await runTest('EXPLAIN DELETE 注入租户条件', () => {
    const rewriter = createRewriter();
    const result = rewriter.rewrite(
      "/*& tenant:'sxlq' */ EXPLAIN DELETE FROM tnt_ma.users WHERE id = 1"
    );
    assertContains(result.sql, "tenant = 'sxlq'", 'EXPLAIN DELETE 应注入租户条件');
    assertContains(result.sql, 'EXPLAIN', '应保留 EXPLAIN');
  });

  // ------------------------------------------
  // DESCRIBE 表（DDL类，不注入）
  // ------------------------------------------
  console.log('\n--- DESCRIBE 表 ---');

  await runTest('DESCRIBE 表结构不注入租户条件', () => {
    const rewriter = createRewriter();
    const result = rewriter.rewrite(
      "/*& tenant:'sxlq' */ DESCRIBE tnt_ma.users"
    );
    // DESCRIBE table 是查看表结构，不应注入 WHERE 子句
    assertNotContains(result.sql, "tenant = 'sxlq'", 'DESCRIBE 表结构不应注入租户条件');
  });

  await runTest('DESC 表结构不注入租户条件', () => {
    const rewriter = createRewriter();
    const result = rewriter.rewrite(
      "/*& tenant:'sxlq' */ DESC tnt_ma.users"
    );
    assertNotContains(result.sql, "tenant = 'sxlq'", 'DESC 表结构不应注入租户条件');
  });

  // ------------------------------------------
  // 无 hint 的 EXPLAIN
  // ------------------------------------------
  console.log('\n--- 无 hint 场景 ---');

  await runTest('无 hint 的 EXPLAIN 不处理', () => {
    const rewriter = createRewriter();
    const result = rewriter.rewrite(
      'EXPLAIN SELECT * FROM tnt_ma.users'
    );
    assertNotContains(result.sql, 'tenant', '无 hint 时不应注入租户条件');
  });

  // ------------------------------------------
  // 联合库名改写
  // ------------------------------------------
  console.log('\n--- 联合库名改写 ---');

  await runTest('EXPLAIN SELECT 同时改写库名和注入租户条件', () => {
    const rewriter = createRewriter({ databaseRewriteEnabled: true });
    const result = rewriter.rewrite(
      "/*& tenant:'sxlq' */ EXPLAIN SELECT * FROM tnt_ma.users"
    );
    assertContains(result.sql, 'dev_mc_tnt_ma.users', '库名应被改写');
    assertContains(result.sql, "tenant = 'sxlq'", '租户条件应被注入');
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
