/**
 * 工具方法测试套件
 *
 * 测试 SqlParserService 上的实用工具方法
 * 对标旧库 SqlParserService 的 API
 */

import { SqlParserService, SqlRewriter } from '../src/index';

// ============================================================================
// 测试工具
// ============================================================================

function assertEqual(actual: any, expected: any, message?: string): void {
  const a = typeof actual === 'string' ? actual.replace(/\s+/g, ' ').trim() : actual;
  const b = typeof expected === 'string' ? expected.replace(/\s+/g, ' ').trim() : expected;
  if (a !== b) {
    throw new Error(
      `${message || 'Assertion failed'}: Values are not equal\n` +
      `Expected: ${JSON.stringify(b)}\n` +
      `Actual:   ${JSON.stringify(a)}`
    );
  }
}

function assertTrue(value: boolean, message?: string): void {
  if (!value) {
    throw new Error(message || 'Expected true but got false');
  }
}

function assertFalse(value: boolean, message?: string): void {
  if (value) {
    throw new Error(message || 'Expected false but got true');
  }
}

function assertDefined(value: any, message?: string): void {
  if (value === undefined || value === null) {
    throw new Error(message || 'Expected defined value but got null/undefined');
  }
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
  console.log('工具方法测试');
  console.log('========================================\n');

  // ------------------------------------------
  // getSqlType
  // ------------------------------------------
  console.log('--- getSqlType ---');

  await runTest('getSqlType: SELECT', () => {
    assertEqual(SqlParserService.getSqlType('SELECT * FROM users'), 'SELECT');
  });

  await runTest('getSqlType: INSERT', () => {
    assertEqual(SqlParserService.getSqlType("INSERT INTO users (name) VALUES ('test')"), 'INSERT');
  });

  await runTest('getSqlType: UPDATE', () => {
    assertEqual(SqlParserService.getSqlType("UPDATE users SET name = 'test'"), 'UPDATE');
  });

  await runTest('getSqlType: DELETE', () => {
    assertEqual(SqlParserService.getSqlType('DELETE FROM users WHERE id = 1'), 'DELETE');
  });

  await runTest('getSqlType: CREATE', () => {
    assertEqual(SqlParserService.getSqlType('CREATE TABLE users (id INT)'), 'CREATE');
  });

  await runTest('getSqlType: DROP', () => {
    assertEqual(SqlParserService.getSqlType('DROP TABLE users'), 'DROP');
  });

  await runTest('getSqlType: ALTER', () => {
    assertEqual(SqlParserService.getSqlType('ALTER TABLE users ADD COLUMN age INT'), 'ALTER');
  });

  await runTest('getSqlType: 带 hint 的 SELECT', () => {
    assertEqual(SqlParserService.getSqlType("/*& tenant:'sxlq' */ SELECT * FROM users"), 'SELECT');
  });

  await runTest('getSqlType: 无效 SQL 返回 null', () => {
    assertEqual(SqlParserService.getSqlType('THIS IS NOT SQL'), null);
  });

  // ------------------------------------------
  // createHint
  // ------------------------------------------
  console.log('\n--- createHint ---');

  await runTest('createHint: 正常租户', () => {
    assertEqual(SqlParserService.createHint('sxlq'), "/*& tenant:'sxlq' */");
  });

  await runTest('createHint: 带下划线的租户', () => {
    assertEqual(SqlParserService.createHint('tenant_001'), "/*& tenant:'tenant_001' */");
  });

  await runTest('createHint: 带连字符的租户', () => {
    assertEqual(SqlParserService.createHint('tenant-001'), "/*& tenant:'tenant-001' */");
  });

  // ------------------------------------------
  // addHintToSql
  // ------------------------------------------
  console.log('\n--- addHintToSql ---');

  await runTest('addHintToSql: 在 SQL 前添加 hint', () => {
    const result = SqlParserService.addHintToSql('SELECT * FROM users', 'sxlq');
    assertEqual(result, "/*& tenant:'sxlq' */ SELECT * FROM users");
  });

  await runTest('addHintToSql: 保留原始 SQL 格式', () => {
    const result = SqlParserService.addHintToSql('  SELECT * FROM users  ', 'sxlq');
    // 应该在前面加 hint
    assertTrue(result.includes("/*& tenant:'sxlq' */"), 'Should contain hint');
    assertTrue(result.includes('SELECT * FROM users'), 'Should contain original SQL');
  });

  // ------------------------------------------
  // removeAllComments
  // ------------------------------------------
  console.log('\n--- removeAllComments ---');

  await runTest('removeAllComments: 移除块注释', () => {
    const result = SqlParserService.removeAllComments('SELECT /* comment */ * FROM users');
    assertTrue(!result.includes('comment'), 'Should remove block comment');
    assertTrue(result.includes('SELECT'), 'Should keep SQL');
    assertTrue(result.includes('FROM users'), 'Should keep SQL');
  });

  await runTest('removeAllComments: 移除行注释', () => {
    const result = SqlParserService.removeAllComments('SELECT * FROM users -- this is a comment');
    assertTrue(!result.includes('this is a comment'), 'Should remove line comment');
    assertTrue(result.includes('SELECT'), 'Should keep SQL');
  });

  await runTest('removeAllComments: 移除 hint 注释', () => {
    const result = SqlParserService.removeAllComments("/*& tenant:'sxlq' */ SELECT * FROM users");
    assertTrue(!result.includes('tenant'), 'Should remove hint');
    assertTrue(result.includes('SELECT'), 'Should keep SQL');
  });

  await runTest('removeAllComments: 多种注释混合', () => {
    const result = SqlParserService.removeAllComments(
      "/*& tenant:'sxlq' */ SELECT /* inline */ * FROM users -- end comment"
    );
    assertTrue(!result.includes('tenant'), 'Should remove hint');
    assertTrue(!result.includes('inline'), 'Should remove inline comment');
    assertTrue(!result.includes('end comment'), 'Should remove end comment');
  });

  // ------------------------------------------
  // getDetailedInfo
  // ------------------------------------------
  console.log('\n--- getDetailedInfo ---');

  await runTest('getDetailedInfo: 基础 SELECT', () => {
    const info = SqlParserService.getDetailedInfo('SELECT * FROM users');
    assertDefined(info, 'Should return info');
    assertFalse(info.hasHint, 'Should not have hint');
    assertEqual(info.sqlType, 'SELECT');
    assertTrue(info.isValid, 'Should be valid');
  });

  await runTest('getDetailedInfo: 带 hint 的 SQL', () => {
    const info = SqlParserService.getDetailedInfo("/*& tenant:'sxlq' */ SELECT * FROM users");
    assertTrue(info.hasHint, 'Should have hint');
    assertEqual(info.hint?.tenant, 'sxlq');
    assertEqual(info.sqlType, 'SELECT');
    assertTrue(info.isValid, 'Should be valid');
  });

  await runTest('getDetailedInfo: INSERT 类型', () => {
    const info = SqlParserService.getDetailedInfo("INSERT INTO users (name) VALUES ('test')");
    assertEqual(info.sqlType, 'INSERT');
    assertFalse(info.hasHint, 'Should not have hint');
    assertTrue(info.isValid, 'Should be valid');
  });

  // ------------------------------------------
  // isValidTenant
  // ------------------------------------------
  console.log('\n--- isValidTenant ---');

  await runTest('isValidTenant: 合法租户编码', () => {
    assertTrue(SqlParserService.isValidTenant('sxlq'), 'sxlq should be valid');
    assertTrue(SqlParserService.isValidTenant('tenant_001'), 'tenant_001 should be valid');
    assertTrue(SqlParserService.isValidTenant('tenant-001'), 'tenant-001 should be valid');
    assertTrue(SqlParserService.isValidTenant('ABC123'), 'ABC123 should be valid');
  });

  await runTest('isValidTenant: 非法租户编码', () => {
    assertFalse(SqlParserService.isValidTenant(''), 'empty should be invalid');
    assertFalse(SqlParserService.isValidTenant("tenant'; DROP TABLE"), 'SQL injection should be invalid');
    assertFalse(SqlParserService.isValidTenant('tenant name'), 'spaces should be invalid');
  });

  // ------------------------------------------
  // validateSql
  // ------------------------------------------
  console.log('\n--- validateSql ---');

  await runTest('validateSql: 合法 SQL', () => {
    assertTrue(SqlParserService.validateSql('SELECT * FROM users'), 'Valid SQL should return true');
  });

  await runTest('validateSql: 合法 INSERT', () => {
    assertTrue(SqlParserService.validateSql("INSERT INTO users (name) VALUES ('test')"), 'Valid INSERT should return true');
  });

  await runTest('validateSql: 无效 SQL', () => {
    assertFalse(SqlParserService.validateSql('THIS IS NOT SQL AT ALL BLAH BLAH'), 'Invalid SQL should return false');
  });

  // ------------------------------------------
  // batchRewriteWithDetails (任务 4 的测试也放在这里)
  // ------------------------------------------
  console.log('\n--- batchRewriteWithDetails ---');

  await runTest('batchRewriteWithDetails: 多条 SQL 批量处理', () => {
    const results = SqlParserService.batchRewriteWithDetails([
      "/*& tenant:'sxlq' */ SELECT * FROM tnt_ma.users",
      "/*& tenant:'sxlq' */ UPDATE tnt_ma.users SET name = 'test' WHERE id = 1",
    ]);
    assertEqual(results.length, 2);
    assertTrue(results[0].modified, 'First SQL should be modified');
    assertTrue(results[1].modified, 'Second SQL should be modified');
    assertTrue(results[0].sql.includes("tenant = 'sxlq'"), 'First SQL should contain tenant');
    assertTrue(results[1].sql.includes("tenant = 'sxlq'"), 'Second SQL should contain tenant');
  });

  await runTest('batchRewriteWithDetails: 混合类型', () => {
    const results = SqlParserService.batchRewriteWithDetails([
      "/*& tenant:'sxlq' */ SELECT * FROM tnt_ma.users",
      "INSERT INTO tnt_ma.users (name) VALUES ('test')",  // 无 hint，不改写租户
      "BEGIN",
    ]);
    assertEqual(results.length, 3);
    assertTrue(results[0].modified, 'SELECT with hint should be modified');
  });

  await runTest('batchRewriteWithDetails: 部分失败不影响其余', () => {
    const results = SqlParserService.batchRewriteWithDetails([
      "/*& tenant:'sxlq' */ SELECT * FROM tnt_ma.users",
      "TOTALLY INVALID SQL THAT SHOULD FAIL",
      "/*& tenant:'sxlq' */ DELETE FROM tnt_ma.users WHERE id = 1",
    ]);
    assertEqual(results.length, 3);
    // 第一条和第三条应正常处理
    assertTrue(results[0].sql.includes("tenant = 'sxlq'"), 'First SQL should be processed');
    assertTrue(results[2].sql.includes("tenant = 'sxlq'"), 'Third SQL should be processed');
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
