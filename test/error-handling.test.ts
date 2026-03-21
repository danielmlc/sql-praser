/**
 * 错误体系测试套件
 *
 * 测试错误分类、ErrorUtils 工具类、类型守卫
 * 对标旧库的 6 种错误类 + ErrorUtils
 */

import { SqlRewriter } from '../src/index';
import {
  SqlParseError,
  ConfigError,
  ParserError,
} from '../src/core/types';
import { ErrorType } from '../src/core/enums';

// 延迟导入，实现后才存在的类
let HintParseError: any;
let TransformError: any;
let UnsupportedSqlError: any;
let ErrorUtils: any;

try {
  const types = require('../src/core/types');
  HintParseError = types.HintParseError;
  TransformError = types.TransformError;
  UnsupportedSqlError = types.UnsupportedSqlError;
  ErrorUtils = types.ErrorUtils;
} catch {
  // Will be loaded after implementation
}

// ============================================================================
// 测试工具
// ============================================================================

function assertTrue(value: boolean, message?: string): void {
  if (!value) throw new Error(message || 'Expected true but got false');
}

function assertFalse(value: boolean, message?: string): void {
  if (value) throw new Error(message || 'Expected false but got true');
}

function assertEqual(actual: any, expected: any, message?: string): void {
  if (actual !== expected) {
    throw new Error(
      `${message || 'Assertion failed'}: Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`
    );
  }
}

function assertInstanceOf(value: any, cls: any, message?: string): void {
  if (!(value instanceof cls)) {
    throw new Error(
      `${message || 'Assertion failed'}: Expected instance of ${cls.name}, got ${value?.constructor?.name}`
    );
  }
}

function assertThrows(fn: () => void, errorClass?: any, message?: string): Error {
  try {
    fn();
    throw new Error(message || 'Expected function to throw');
  } catch (error) {
    if (error instanceof Error && error.message === (message || 'Expected function to throw')) {
      throw error; // 重新抛出我们自己的断言错误
    }
    if (errorClass && !(error instanceof errorClass)) {
      throw new Error(
        `${message || 'Wrong error type'}: Expected ${errorClass.name}, got ${(error as any)?.constructor?.name}`
      );
    }
    return error as Error;
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
  // 重新加载（实现后才存在的类）
  try {
    const types = require('../src/core/types');
    HintParseError = types.HintParseError;
    TransformError = types.TransformError;
    UnsupportedSqlError = types.UnsupportedSqlError;
    ErrorUtils = types.ErrorUtils;
  } catch { /* will fail tests if not implemented */ }

  console.log('\n========================================');
  console.log('错误体系测试');
  console.log('========================================\n');

  // ------------------------------------------
  // 错误类继承关系
  // ------------------------------------------
  console.log('--- 错误类继承关系 ---');

  await runTest('SqlParseError 是 Error 的子类', () => {
    const err = new SqlParseError(ErrorType.PARSE_ERROR, 'test error', 'SELECT 1');
    assertInstanceOf(err, Error);
    assertInstanceOf(err, SqlParseError);
    assertEqual(err.name, 'SqlParseError');
    assertEqual(err.originalSql, 'SELECT 1');
  });

  await runTest('ParserError 是 SqlParseError 的子类', () => {
    const err = new ParserError('parse failed', 'BAD SQL');
    assertInstanceOf(err, SqlParseError);
    assertInstanceOf(err, Error);
    assertEqual(err.name, 'ParserError');
    assertEqual(err.type, ErrorType.PARSE_ERROR);
  });

  await runTest('ConfigError 是 SqlParseError 的子类', () => {
    const err = new ConfigError('bad config');
    assertInstanceOf(err, SqlParseError);
    assertInstanceOf(err, Error);
    assertEqual(err.name, 'ConfigError');
    assertEqual(err.type, ErrorType.CONFIG_ERROR);
  });

  await runTest('HintParseError 存在且是 SqlParseError 的子类', () => {
    assertTrue(!!HintParseError, 'HintParseError should be defined');
    const err = new HintParseError('bad hint', '/*& bad */');
    assertInstanceOf(err, SqlParseError);
    assertEqual(err.name, 'HintParseError');
  });

  await runTest('TransformError 存在且是 SqlParseError 的子类', () => {
    assertTrue(!!TransformError, 'TransformError should be defined');
    const err = new TransformError('transform failed', 'SELECT 1');
    assertInstanceOf(err, SqlParseError);
    assertEqual(err.name, 'TransformError');
  });

  await runTest('UnsupportedSqlError 存在且是 SqlParseError 的子类', () => {
    assertTrue(!!UnsupportedSqlError, 'UnsupportedSqlError should be defined');
    const err = new UnsupportedSqlError('GRANT', 'GRANT ALL ON *');
    assertInstanceOf(err, SqlParseError);
    assertEqual(err.name, 'UnsupportedSqlError');
    assertEqual(err.sqlType, 'GRANT');
  });

  // ------------------------------------------
  // throwOnError 场景
  // ------------------------------------------
  console.log('\n--- throwOnError 场景 ---');

  await runTest('throwOnError=true 时无效 SQL 抛出错误', () => {
    const rewriter = new SqlRewriter({
      dialect: 'mysql' as any,
      errorHandling: {
        throwOnError: true,
        collectAll: true,
        maxErrors: 10,
        logErrors: false,
      },
    } as any);
    assertThrows(() => {
      rewriter.rewrite('TOTALLY INVALID SQL THAT PARSER CANNOT HANDLE');
    });
  });

  await runTest('throwOnError=false 时无效 SQL 返回原始 SQL', () => {
    const rewriter = new SqlRewriter({
      dialect: 'mysql' as any,
      errorHandling: {
        throwOnError: false,
        collectAll: true,
        maxErrors: 10,
        logErrors: false,
      },
    } as any);
    const result = rewriter.rewrite('TOTALLY INVALID SQL THAT PARSER CANNOT HANDLE');
    assertEqual(result.sql, 'TOTALLY INVALID SQL THAT PARSER CANNOT HANDLE');
    assertFalse(result.modified);
  });

  // ------------------------------------------
  // ErrorUtils
  // ------------------------------------------
  console.log('\n--- ErrorUtils ---');

  await runTest('ErrorUtils.formatError 输出格式正确', () => {
    assertTrue(!!ErrorUtils, 'ErrorUtils should be defined');
    const err = new ParserError('syntax error near SELECT', 'SELECT * FORM users');
    const formatted = ErrorUtils.formatError(err);
    assertTrue(formatted.includes('ParserError'), 'Should contain error name');
    assertTrue(formatted.includes('syntax error'), 'Should contain error message');
    assertTrue(formatted.includes('SELECT * FORM'), 'Should contain original SQL');
  });

  await runTest('ErrorUtils.formatError 截断长 SQL', () => {
    const longSql = 'SELECT ' + 'a, '.repeat(200) + 'b FROM users';
    const err = new ParserError('error', longSql);
    const formatted = ErrorUtils.formatError(err);
    assertTrue(formatted.includes('...'), 'Should truncate long SQL');
  });

  await runTest('ErrorUtils.isSqlParseError 类型守卫', () => {
    assertTrue(!!ErrorUtils, 'ErrorUtils should be defined');
    const sqlErr = new ParserError('test', 'SELECT 1');
    const regularErr = new Error('regular');

    assertTrue(ErrorUtils.isSqlParseError(sqlErr), 'SqlParseError should match');
    assertFalse(ErrorUtils.isSqlParseError(regularErr), 'Regular Error should not match');
    assertFalse(ErrorUtils.isSqlParseError(null), 'null should not match');
    assertFalse(ErrorUtils.isSqlParseError('string'), 'string should not match');
  });

  await runTest('ErrorUtils.getErrorMessage 安全获取消息', () => {
    assertTrue(!!ErrorUtils, 'ErrorUtils should be defined');
    assertEqual(ErrorUtils.getErrorMessage(new Error('hello')), 'hello');
    assertEqual(ErrorUtils.getErrorMessage('string error'), 'string error');
    assertEqual(ErrorUtils.getErrorMessage(42), '42');
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
