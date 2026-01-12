/**
 * @cs/sql-parser-antlr4 测试套件
 *
 * 基于 ANTLR4 的 SQL 解析器测试
 * 测试租户隔离、库名改写、CTE、JOIN、子查询等功能
 */

import { SqlParserService, SqlRewriter } from '../src/index';
import type { SqlParserConfig } from '../src/core/types';

// 测试结果类型
interface TestCase {
  name: string;
  input: string;
  expected: {
    sql: string;
    tenant?: string;
  };
  // 测试用例专属配置
  config?: Partial<SqlParserConfig>;
  only?: boolean;
}

// 断言工具
function assertContains (sql: string, fragment: string, message?: string): void {
  if (!sql.includes(fragment)) {
    throw new Error(
      `${message || 'Assertion failed'}: Expected SQL to contain "${fragment}"\n` +
      `Actual SQL: ${sql}`
    );
  }
}

function assertNotContains (sql: string, fragment: string, message?: string): void {
  if (sql.includes(fragment)) {
    throw new Error(
      `${message || 'Assertion failed'}: Expected SQL NOT to contain "${fragment}"\n` +
      `Actual SQL: ${sql}`
    );
  }
}

function assertEqual (actual: string, expected: string, message?: string): void {
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

// 测试套件
class TestSuite {
  private passed = 0;
  private failed = 0;
  private failedTests: Array<{ name: string; error: string; originalSql: string; resultSql: string }> = [];
  private verbose = true; // 显示详细输出

  // 基础默认配置（所有测试用例共享）
  private readonly baseConfig: Partial<SqlParserConfig> = {
    dialect: 'mysql' as any,
    listeners: {
      tenant: {
        enabled: true,
        priority: 100,
        abortOnError: false,
        tenantField: 'tenant',
        targetDatabases: {
          prefixes: ['tnt_'],
          fullNames: [],
          defaultDatabase: 'tnt_ma'
        }
      },
      hint: {
        enabled: true,
        priority: 10,
        abortOnError: false,
        preserveHint: false
      }
    },
    errorHandling: {
      throwOnError: false,
      collectAll: true,
      maxErrors: 10,
      logErrors: false
    }
  };

  /**
   * 合并基础配置和测试用例配置
   */
  private mergeConfig (testCaseConfig?: Partial<SqlParserConfig>): Partial<SqlParserConfig> {
    if (!testCaseConfig) {
      return this.baseConfig;
    }

    // 深度合并配置
    return {
      dialect: testCaseConfig.dialect || this.baseConfig.dialect,
      listeners: {
        tenant: {
          ...this.baseConfig.listeners!.tenant,
          ...testCaseConfig.listeners?.tenant,
          targetDatabases: {
            ...this.baseConfig.listeners!.tenant.targetDatabases,
            ...testCaseConfig.listeners?.tenant?.targetDatabases
          }
        } as any,
        hint: {
          ...this.baseConfig.listeners!.hint,
          ...testCaseConfig.listeners?.hint
        } as any
      },
      errorHandling: {
        ...this.baseConfig.errorHandling,
        ...testCaseConfig.errorHandling
      } as any
    } as any;
  }

  async runTest (testCase: TestCase): Promise<void> {
    try {
      // 合并基础配置和测试用例配置
      const finalConfig = this.mergeConfig(testCase.config);
      const rewriter = new SqlRewriter(finalConfig);
      const result = rewriter.rewrite(testCase.input);

      // 验证 SQL 包含预期内容
      if (testCase.expected.sql) {
        assertContains(result.sql, testCase.expected.sql, `Test "${testCase.name}" failed`);
      }

      // 验证租户信息
      if (testCase.expected.tenant) {
        const tenantInfo = SqlParserService.extractHint(testCase.input);
        if (tenantInfo?.tenant !== testCase.expected.tenant) {
          throw new Error(`Expected tenant "${testCase.expected.tenant}", got "${tenantInfo?.tenant}"`);
        }
      }

      this.passed++;

      // 显示详细输出
      if (this.verbose) {
        const hasModified = result.modified ? ' [已修改]' : ' [未修改]';
        const configInfo = testCase.config ? ' [自定义配置]' : ' [默认配置]';
        console.log(`✓ ${testCase.name}${hasModified}${configInfo}`);
        console.log(`  原始: ${testCase.input.trim()}`);
        console.log(`  改写: ${result.sql.trim()}`);

        // 显示配置信息
        const configParts: string[] = [];
        const tenantConfig = finalConfig.listeners?.tenant as any;
        if (tenantConfig) {
          configParts.push(`租户字段: ${tenantConfig.tenantField}`);
          const td = tenantConfig.targetDatabases;
          if (td?.prefixes?.length) {
            configParts.push(`前缀: [${td.prefixes.join(', ')}]`);
          }
          if (td?.fullNames?.length) {
            configParts.push(`完整库名: [${td.fullNames.join(', ')}]`);
          }
          if (td?.defaultDatabase) {
            configParts.push(`默认库: ${td.defaultDatabase}`);
          }
        }
        if (configParts.length > 0) {
          console.log(`  配置: ${configParts.join(' | ')}`);
        }

        // 如果有修改，显示差异
        if (result.modified && testCase.input.trim() !== result.sql.trim()) {
          console.log(`  状态: SQL 已被改写`);
        }
        console.log(''); // 空行分隔
      }
    } catch (error) {
      this.failed++;
      const finalConfig = this.mergeConfig(testCase.config);
      const result = new SqlRewriter(finalConfig).rewrite(testCase.input);
      this.failedTests.push({
        name: testCase.name,
        error: error instanceof Error ? error.message : String(error),
        originalSql: testCase.input,
        resultSql: result.sql
      });
      console.error(`✗ ${testCase.name}`);
      console.error(`  原始: ${testCase.input}`);
      console.error(`  改写: ${result.sql}`);
      console.error(`  错误: ${error instanceof Error ? error.message : error}`);
      console.error('');
    }
  }

  async run (name: string, tests: TestCase[]): Promise<void> {
    console.log(`\n=== ${name} ===`);
    for (const test of tests) {
      await this.runTest(test);
    }
  }

  summary (): void {
    console.log('\n=== 测试结果汇总 ===');
    console.log(`通过: ${this.passed}`);
    console.log(`失败: ${this.failed}`);

    if (this.failedTests.length > 0) {
      console.log('\n失败的测试:');
      this.failedTests.forEach(({ name, error }) => {
        console.log(`  - ${name}`);
        console.log(`    ${error}`);
      });
    }

    if (this.failed > 0) {
      process.exit(1);
    }
  }
}

// 主测试运行器
async function runAllTests (): Promise<void> {
  const suite = new TestSuite();

  // ============================================
  // 第一部分：基础 INSERT/SELECT/UPDATE/DELETE
  // ============================================
  await suite.run('基础 INSERT 测试', [
    {
      name: 'INSERT 多行数据',
      input: "/*& tenant:'sxlq' */ INSERT INTO tnt_ma.users (username, email, age) VALUES ('zhang_san', 'zhang@sxlq.com', 28), ('li_si', 'li@sxlq.com', 32)",
      expected: {
        sql: "tenant",
        tenant: 'sxlq'
      }
    },
    {
      name: 'INSERT INTO ... SELECT',
      input: "/*& tenant:'sxlq' */ INSERT INTO tnt_ma.orders (user_id, product_name, amount, status, order_date) SELECT u.id, 'iPhone 15', 6999.00, 'completed', '2024-01-15' FROM tnt_ma.users u WHERE u.tenant = 'sxlq' AND u.username = 'zhang_san'",
      expected: {
        sql: "INSERT INTO",
        tenant: 'sxlq'
      }
    },
    {
      name: 'INSERT ... SET 语法',
      input: "/*& tenant:'sxlq' */ INSERT INTO tnt_ma.products SET product_name='iPad Air', category='Electronics', price=4999.00, stock_quantity=25",
      expected: {
        sql: "INSERT INTO",
        tenant: 'sxlq'
      }
    },
    {
      name: 'INSERT IGNORE',
      input: "/*& tenant:'sxlq' */ INSERT IGNORE INTO tnt_ma.users (username, email, age) VALUES ('duplicate_user', 'dup@test.com', 25)",
      expected: {
        sql: "INSERT IGNORE",
        tenant: 'sxlq'
      }
    }
  ]);

  await suite.run('基础 SELECT 测试', [
    {
      name: 'SELECT 所有字段',
      input: "/*& tenant:'sxlq' */ SELECT * FROM tnt_ma.users",
      expected: {
        sql: "SELECT",
        tenant: 'sxlq'
      }
    },
    {
      name: 'SELECT 特定字段',
      input: "/*& tenant:'sxlq' */ SELECT username, email, age FROM tnt_ma.users WHERE age > 25",
      expected: {
        sql: "SELECT",
        tenant: 'sxlq'
      }
    },
    {
      name: 'SELECT 带 WHERE 条件',
      input: "/*& tenant:'sxlq' */ SELECT * FROM tnt_ma.users WHERE tenant = 'gslq' AND id = 1",
      expected: {
        sql: "SELECT",
        tenant: 'sxlq'
      }
    },
    {
      name: 'SELECT 跨租户联合主键查询',
      input: "/*& tenant:'sxlq' */ SELECT * FROM tnt_ma.users WHERE id = 1",
      expected: {
        sql: "SELECT",
        tenant: 'sxlq'
      }
    }
  ]);

  await suite.run('基础 UPDATE 测试', [
    {
      name: 'UPDATE 单表',
      input: "/*& tenant:'sxlq' */ UPDATE tnt_ma.users SET age = 29 WHERE username = 'zhang_san'",
      expected: {
        sql: "UPDATE",
        tenant: 'sxlq'
      }
    },
    {
      name: 'UPDATE 批量',
      input: "/*& tenant:'sxlq' */ UPDATE tnt_ma.products SET stock_quantity = stock_quantity - 1 WHERE category = 'Electronics' AND stock_quantity > 0",
      expected: {
        sql: "UPDATE",
        tenant: 'sxlq'
      }
    }
  ]);

  await suite.run('基础 DELETE 测试', [
    {
      name: 'DELETE 单表',
      input: "/*& tenant:'sxlq' */ DELETE FROM tnt_ma.users WHERE age < 26",
      expected: {
        sql: "DELETE",
        tenant: 'sxlq'
      }
    },
    {
      name: 'DELETE 带 LIMIT',
      input: "/*& tenant:'sxlq' */ DELETE FROM tnt_ma.orders WHERE status = 'cancelled' ORDER BY created_at LIMIT 5",
      expected: {
        sql: "DELETE",
        tenant: 'sxlq'
      }
    }
  ]);

  // ============================================
  // 第二部分：JOIN 查询测试
  // ============================================
  await suite.run('JOIN 查询测试', [
    {
      name: 'INNER JOIN 两表',
      input: "/*& tenant:'sxlq' */ SELECT u.username, o.product_name, o.amount, o.status FROM tnt_ma.users u JOIN tnt_ma.orders o ON u.id = o.user_id WHERE o.status = 'completed'",
      expected: {
        sql: "JOIN",
        tenant: 'sxlq'
      }
    },
    {
      name: 'LEFT JOIN',
      input: "/*& tenant:'sxlq' */ SELECT u.tenant, u.username, COUNT(o.order_id) as order_count FROM tnt_ma.users u LEFT JOIN tnt_ma.orders o ON u.tenant = o.tenant AND u.id = o.user_id GROUP BY u.tenant, u.id",
      expected: {
        sql: "LEFT JOIN",
        tenant: 'sxlq'
      }
    },
    {
      name: '三表 JOIN',
      input: "/*& tenant:'sxlq' */ SELECT u.username, o.product_name, p.price FROM tnt_ma.users u JOIN tnt_ma.orders o ON u.id = o.user_id JOIN tnt_ma.products p ON o.product_name = p.product_name WHERE u.tenant = 'sxlq'",
      expected: {
        sql: "JOIN",
        tenant: 'sxlq'
      }
    },
    {
      name: 'CROSS JOIN',
      input: "/*& tenant:'sxlq' */ SELECT u.username, p.product_name, p.price FROM tnt_ma.users u CROSS JOIN tnt_ma.products p WHERE u.tenant = 'sxlq' AND p.tenant = 'sxlq'",
      expected: {
        sql: "CROSS JOIN",
        tenant: 'sxlq'
      }
    },
    {
      name: '自连接',
      input: "/*& tenant:'sxlq' */ SELECT u1.username as user1, u2.username as user2 FROM tnt_ma.users u1 JOIN tnt_ma.users u2 ON u1.age = u2.age AND u1.id != u2.id WHERE u1.tenant = 'sxlq'",
      expected: {
        sql: "JOIN",
        tenant: 'sxlq'
      }
    },
    {
      name: 'UPDATE with JOIN',
      input: "/*& tenant:'sxlq' */ UPDATE tnt_ma.orders o JOIN tnt_ma.users u ON o.tenant = u.tenant AND o.user_id = u.id SET o.status = 'shipped' WHERE u.username = 'li_si'",
      expected: {
        sql: "UPDATE",
        tenant: 'sxlq'
      }
    },
    {
      name: 'DELETE with JOIN',
      input: "/*& tenant:'bjzh' */ DELETE o FROM tnt_ma.orders o JOIN tnt_ma.users u ON o.tenant = u.tenant AND o.user_id = u.id WHERE u.username = 'qian_qi'",
      expected: {
        sql: "DELETE",
        tenant: 'bjzh'
      }
    }
  ]);

  // ============================================
  // 第三部分：子查询测试
  // ============================================
  await suite.run('WHERE 子查询测试', [
    {
      name: 'WHERE 标量子查询',
      input: "/*& tenant:'sxlq' */ SELECT u.username, u.email FROM tnt_ma.users u WHERE u.age > (SELECT AVG(age) FROM tnt_ma.users)",
      expected: {
        sql: "SELECT",
        tenant: 'sxlq'
      }
    },
    {
      name: 'WHERE IN 子查询',
      input: "/*& tenant:'sxlq' */ SELECT p.product_name, p.price FROM tnt_ma.products p WHERE p.product_id IN (SELECT DISTINCT o.product_name FROM tnt_ma.orders o WHERE o.status = 'completed')",
      expected: {
        sql: "IN",
        tenant: 'sxlq'
      }
    },
    {
      name: 'WHERE EXISTS 子查询',
      input: "/*& tenant:'sxlq' */ SELECT u.username, u.email FROM tnt_ma.users u WHERE EXISTS (SELECT 1 FROM tnt_ma.orders o WHERE o.user_id = u.id)",
      expected: {
        sql: "EXISTS",
        tenant: 'sxlq'
      }
    },
    {
      name: 'WHERE NOT EXISTS 子查询',
      input: "/*& tenant:'sxlq' */ SELECT u.username, u.email FROM tnt_ma.users u WHERE NOT EXISTS (SELECT 1 FROM tnt_ma.orders o WHERE o.user_id = u.id)",
      expected: {
        sql: "NOT EXISTS",
        tenant: 'sxlq'
      }
    }
  ]);

  await suite.run('FROM 子查询测试', [
    {
      name: 'FROM 派生表',
      input: "/*& tenant:'sxlq' */ SELECT user_stats.username, user_stats.order_count FROM (SELECT u.username, COUNT(o.order_id) as order_count FROM tnt_ma.users u LEFT JOIN tnt_ma.orders o ON u.id = o.user_id GROUP BY u.id) user_stats WHERE user_stats.order_count > 0",
      expected: {
        sql: "SELECT",
        tenant: 'sxlq'
      }
    }
  ]);

  await suite.run('SELECT 子查询测试', [
    {
      name: 'SELECT 标量子查询',
      input: "/*& tenant:'sxlq' */ SELECT u.username, (SELECT COUNT(*) FROM tnt_ma.orders o WHERE o.user_id = u.id) as order_count FROM tnt_ma.users u",
      expected: {
        sql: "SELECT",
        tenant: 'sxlq'
      }
    }
  ]);

  await suite.run('相关子查询测试', [
    {
      name: '相关子查询',
      input: "/*& tenant:'sxlq' */ SELECT u.username, u.age FROM tnt_ma.users u WHERE u.age > (SELECT AVG(u2.age) FROM tnt_ma.users u2 WHERE u2.tenant = u.tenant)",
      expected: {
        sql: "SELECT",
        tenant: 'sxlq'
      }
    }
  ]);

  await suite.run('多级嵌套子查询测试', [
    {
      name: '多级嵌套子查询',
      input: "/*& tenant:'sxlq' */ SELECT product_name, price FROM tnt_ma.products p WHERE p.price > (SELECT AVG(price) FROM tnt_ma.products p2 WHERE p2.category IN (SELECT DISTINCT category FROM tnt_ma.products p3 WHERE p3.stock_quantity > 10))",
      expected: {
        sql: "SELECT",
        tenant: 'sxlq'
      }
    }
  ]);

  // ============================================
  // 第四部分：CTE (WITH) 测试
  // ============================================
  await suite.run('CTE 测试', [
    {
      name: '基本 WITH 子句',
      input: "/*& tenant:'sxlq' */ WITH user_orders AS (SELECT u.id as user_id, u.username, COUNT(o.order_id) as order_count FROM tnt_ma.users u LEFT JOIN tnt_ma.orders o ON u.id = o.user_id GROUP BY u.id) SELECT j.username, j.order_count FROM user_orders j WHERE j.order_count > 0",
      expected: {
        sql: "WITH",
        tenant: 'sxlq'
      }
    },
    {
      name: '多个 CTE',
      input: "/*& tenant:'sxlq' */ WITH active_users AS (SELECT u.id, u.username FROM tnt_ma.users u WHERE u.created_at >= '2023-01-01'), completed_orders AS (SELECT o.user_id, COUNT(*) as count FROM tnt_ma.orders o WHERE o.status = 'completed' GROUP BY o.user_id) SELECT au.username, COALESCE(co.count, 0) as orders FROM active_users au LEFT JOIN completed_orders co ON au.id = co.user_id",
      expected: {
        sql: "WITH",
        tenant: 'sxlq'
      }
    },
    {
      name: '递归 CTE',
      input: "/*& tenant:'sxlq' */ WITH RECURSIVE dept_hierarchy AS (SELECT dept_id, dept_name, manager_id, 1 as level FROM global_mtlp.departments WHERE manager_id IS NULL UNION ALL SELECT d.dept_id, d.dept_name, d.manager_id, dh.level + 1 FROM global_mtlp.departments d JOIN dept_hierarchy dh ON d.manager_id = dh.dept_id WHERE dh.level < 5) SELECT level, dept_name FROM dept_hierarchy ORDER BY level",
      expected: {
        sql: "WITH RECURSIVE",
        tenant: 'sxlq'
      }
    },
    {
      name: 'CTE with 窗口函数',
      input: "/*& tenant:'sxlq' */ WITH ranked_products AS (SELECT product_name, price, ROW_NUMBER() OVER (PARTITION BY category ORDER BY price DESC) as price_rank FROM tnt_ma.products) SELECT product_name, price_rank FROM ranked_products WHERE price_rank <= 2",
      expected: {
        sql: "WITH",
        tenant: 'sxlq'
      }
    }
  ]);

  // ============================================
  // 第五部分：窗口函数测试
  // ============================================
  await suite.run('窗口函数测试', [
    {
      name: 'ROW_NUMBER',
      input: "/*& tenant:'sxlq' */ SELECT username, age, ROW_NUMBER() OVER (ORDER BY created_at) as row_num FROM tnt_ma.users",
      expected: {
        sql: "ROW_NUMBER",
        tenant: 'sxlq'
      }
    },
    {
      name: 'RANK 和 DENSE_RANK',
      input: "/*& tenant:'sxlq' */ SELECT product_name, price, RANK() OVER (PARTITION BY category ORDER BY price DESC) as price_rank FROM tnt_ma.products",
      expected: {
        sql: "RANK",
        tenant: 'sxlq'
      }
    },
    {
      name: 'LAG 和 LEAD',
      input: "/*& tenant:'sxlq' */ SELECT order_id, amount, LAG(amount, 1) OVER (PARTITION BY user_id ORDER BY order_date) as prev_amount FROM tnt_ma.orders",
      expected: {
        sql: "LAG",
        tenant: 'sxlq'
      }
    },
    {
      name: '聚合窗口函数',
      input: "/*& tenant:'sxlq' */ SELECT order_id, amount, SUM(amount) OVER (PARTITION BY user_id ORDER BY order_date) as running_total FROM tnt_ma.orders",
      expected: {
        sql: "SUM",
        tenant: 'sxlq'
      }
    },
    {
      name: 'FIRST_VALUE 和 LAST_VALUE',
      input: "/*& tenant:'sxlq' */ SELECT username, age, FIRST_VALUE(username) OVER (ORDER BY created_at) as first_user FROM tnt_ma.users",
      expected: {
        sql: "FIRST_VALUE",
        tenant: 'sxlq'
      }
    }
  ]);

  // ============================================
  // 第六部分：UNION 测试
  // ============================================
  await suite.run('UNION 测试', [
    {
      name: 'UNION ALL',
      input: "/*& tenant:'sxlq' */ SELECT 'user' as type, username as name FROM tnt_ma.users UNION ALL SELECT 'product', product_name FROM tnt_ma.products",
      expected: {
        sql: "UNION ALL",
        tenant: 'sxlq'
      }
    },
    {
      name: 'UNION (去重)',
      input: "/*& tenant:'sxlq' */ SELECT category FROM tnt_ma.products UNION SELECT 'Electronics' as category",
      expected: {
        sql: "UNION",
        tenant: 'sxlq'
      }
    },
    {
      name: '多个 UNION',
      input: "/*& tenant:'sxlq' */ SELECT 'users' as source, COUNT(*) as count FROM tnt_ma.users UNION ALL SELECT 'orders', COUNT(*) FROM tnt_ma.orders UNION ALL SELECT 'products', COUNT(*) FROM tnt_ma.products",
      expected: {
        sql: "UNION",
        tenant: 'sxlq'
      }
    },
    {
      name: 'INSERT with UNION',
      input: "/*& tenant:'sxlq' */ INSERT INTO tnt_ma.orders (user_id, product_name, amount, status) SELECT u.id, 'iPhone 15', 6999.00, 'completed' FROM tnt_ma.users u WHERE u.username = 'zhang_san' UNION ALL SELECT u.id, 'MacBook Pro', 12999.00, 'pending' FROM tnt_ma.users u WHERE u.username = 'li_si'",
      expected: {
        sql: "INSERT",
        tenant: 'sxlq'
      }
    }
  ]);

  // ============================================
  // 第七部分：聚合和分组测试
  // ============================================
  await suite.run('聚合和分组测试', [
    {
      name: 'GROUP BY',
      input: "/*& tenant:'sxlq' */ SELECT tenant, COUNT(*) as count FROM tnt_ma.users GROUP BY tenant",
      expected: {
        sql: "GROUP BY",
        tenant: 'sxlq'
      }
    },
    {
      name: 'GROUP BY with HAVING',
      input: "/*& tenant:'sxlq' */ SELECT category, COUNT(*) as product_count FROM tnt_ma.products GROUP BY category HAVING COUNT(*) > 1",
      expected: {
        sql: "HAVING",
        tenant: 'sxlq'
      }
    },
    {
      name: '复杂 HAVING 子句',
      input: "/*& tenant:'sxlq' */ SELECT category, AVG(price) as avg_price FROM tnt_ma.products GROUP BY category HAVING AVG(price) > (SELECT AVG(price) FROM tnt_ma.products)",
      expected: {
        sql: "HAVING",
        tenant: 'sxlq'
      }
    },
    {
      name: '聚合函数',
      input: "/*& tenant:'sxlq' */ SELECT COUNT(*) as total, SUM(amount) as total_amount, AVG(amount) as avg_amount FROM tnt_ma.orders WHERE status = 'completed'",
      expected: {
        sql: "COUNT",
        tenant: 'sxlq'
      }
    }
  ]);

  // ============================================
  // 第八部分：复杂表达式测试
  // ============================================
  await suite.run('复杂表达式测试', [
    {
      name: 'CASE WHEN',
      input: "/*& tenant:'sxlq' */ SELECT username, age, CASE WHEN age < 25 THEN 'Young' WHEN age BETWEEN 25 AND 35 THEN 'Middle' ELSE 'Senior' END as age_group FROM tnt_ma.users",
      expected: {
        sql: "CASE",
        tenant: 'sxlq'
      }
    },
    {
      name: 'INSERT ON DUPLICATE KEY UPDATE',
      input: "/*& tenant:'sxlq' */ INSERT INTO tnt_ma.products (product_name, price) VALUES ('iPhone 15', 7999.00) ON DUPLICATE KEY UPDATE price = VALUES(price)",
      expected: {
        sql: "ON DUPLICATE KEY UPDATE",
        tenant: 'sxlq'
      }
    },
    {
      name: 'EXPLAIN',
      input: "/*& tenant:'sxlq' */ EXPLAIN SELECT * FROM tnt_ma.users WHERE tenant = 'sxlq'",
      expected: {
        sql: "EXPLAIN",
        tenant: 'sxlq'
      }
    }
  ]);

  // ============================================
  // 第九部分：事务测试
  // ============================================
  await suite.run('事务测试', [
    {
      name: 'START TRANSACTION',
      input: "START TRANSACTION",
      expected: {
        sql: "START TRANSACTION"
      }
    },
    {
      name: 'COMMIT',
      input: "COMMIT",
      expected: {
        sql: "COMMIT"
      }
    },
    {
      name: 'ROLLBACK',
      input: "ROLLBACK",
      expected: {
        sql: "ROLLBACK"
      }
    },
    {
      name: 'SELECT FOR UPDATE',
      input: "/*& tenant:'sxlq' */ SELECT * FROM tnt_ma.products WHERE product_name = 'iPhone 15' FOR UPDATE",
      expected: {
        sql: "FOR UPDATE",
        tenant: 'sxlq'
      }
    }
  ]);

  // ============================================
  // 第十部分：Hint 提取测试
  // ============================================
  await suite.run('Hint 功能测试', [
    {
      name: '提取 Hint 信息',
      input: "/*& tenant:'test_tenant' */ SELECT * FROM users",
      expected: {
        sql: "SELECT",
        tenant: 'test_tenant'
      }
    },
    {
      name: 'Hint 双引号',
      input: "/*& tenant:\"double_quotes\" */ SELECT * FROM users",
      expected: {
        sql: "SELECT",
        tenant: 'double_quotes'
      }
    },
    {
      name: 'Hint 大小写不敏感',
      input: "/*& TENANT:'uppercase' */ SELECT * FROM users",
      expected: {
        sql: "SELECT",
        tenant: 'uppercase'
      }
    }
  ]);

  // ============================================
  // 第十一部分：边界情况测试
  // ============================================
  await suite.run('边界情况测试', [
    {
      name: '无 Hint 的 SQL',
      input: "SELECT * FROM users",
      expected: {
        sql: "SELECT"
      }
    },
    {
      name: '空 SQL',
      input: "",
      expected: {
        sql: ""
      }
    },
    {
      name: '只有注释的 SQL',
      input: "-- This is a comment\nSELECT * FROM users",
      expected: {
        sql: "SELECT"
      }
    },
    {
      name: '复杂嵌套查询',
      input: "/*& tenant:'sxlq' */ WITH cte AS (SELECT * FROM users) SELECT * FROM cte WHERE id IN (SELECT user_id FROM orders WHERE amount > (SELECT AVG(amount) FROM orders))",
      expected: {
        sql: "WITH",
        tenant: 'sxlq'
      }
    }
  ]);

  // ============================================
  // 第十二部分：自定义配置测试
  // ============================================
  await suite.run('自定义配置测试', [
    {
      name: '自定义租户字段名 (company_id)',
      input: "/*& tenant:'acme' */ SELECT * FROM tnt_ma.users",
      expected: {
        sql: "SELECT",
        tenant: 'acme'
      },
      config: {
        dialect: 'mysql' as any,
        listeners: {
          tenant: {
            enabled: true,
            priority: 100,
            abortOnError: false,
            tenantField: 'company_id',
            targetDatabases: {
              prefixes: ['global_ma', 'global_mtlp'],
              fullNames: ['specific_db'],
              defaultDatabase: 'default_db'
            }
          },
          hint: {
            enabled: true,
            priority: 10,
            abortOnError: false,
            preserveHint: false
          }
        },
        errorHandling: {
          throwOnError: false,
          collectAll: true,
          maxErrors: 10,
          logErrors: false
        }
      }
    },
    {
      name: '自定义前缀配置 (tenant_)',
      input: "/*& tenant:'tenant1' */ SELECT * FROM customer_data.orders",
      expected: {
        sql: "SELECT",
        tenant: 'tenant1'
      },
      config: {
        dialect: 'mysql' as any,
        listeners: {
          tenant: {
            enabled: true,
            priority: 100,
            abortOnError: false,
            tenantField: 'tenant',
            targetDatabases: {
              prefixes: ['customer_data', 'user_data'],
              fullNames: [],
              defaultDatabase: 'main_db'
            }
          },
          hint: {
            enabled: true,
            priority: 10,
            abortOnError: false,
            preserveHint: false
          }
        },
        errorHandling: {
          throwOnError: false,
          collectAll: true,
          maxErrors: 10,
          logErrors: false
        }
      }
    },
    {
      name: '多个完整库名配置',
      input: "/*& tenant:'org1' */ SELECT * FROM db1.users",
      expected: {
        sql: "SELECT",
        tenant: 'org1'
      },
      config: {
        dialect: 'mysql' as any,
        listeners: {
          tenant: {
            enabled: true,
            priority: 100,
            abortOnError: false,
            tenantField: 'org_id',
            targetDatabases: {
              prefixes: [],
              fullNames: ['db1', 'db2', 'db3'],
              defaultDatabase: 'db1'
            }
          },
          hint: {
            enabled: true,
            priority: 10,
            abortOnError: false,
            preserveHint: false
          }
        },
        errorHandling: {
          throwOnError: false,
          collectAll: true,
          maxErrors: 10,
          logErrors: false
        }
      }
    },
    {
      name: '保留 Hint 配置',
      input: "/*& tenant:'test' */ SELECT * FROM users",
      expected: {
        sql: "SELECT",
        tenant: 'test'
      },
      config: {
        dialect: 'mysql' as any,
        listeners: {
          tenant: {
            enabled: true,
            priority: 100,
            abortOnError: false,
            tenantField: 'tenant',
            targetDatabases: {
              prefixes: [],
              fullNames: [],
              defaultDatabase: 'default_db'
            }
          },
          hint: {
            enabled: true,
            priority: 10,
            abortOnError: false,
            preserveHint: true  // 保留 Hint
          }
        },
        errorHandling: {
          throwOnError: false,
          collectAll: true,
          maxErrors: 10,
          logErrors: false
        }
      }
    },
    {
      name: '禁用租户过滤 Listener',
      input: "/*& tenant:'test' */ SELECT * FROM tnt_ma.users",
      expected: {
        sql: "SELECT",
        tenant: 'test'
      },
      config: {
        dialect: 'mysql' as any,
        listeners: {
          tenant: {
            enabled: false,  // 禁用租户过滤
            priority: 100,
            abortOnError: false,
            tenantField: 'tenant',
            targetDatabases: {
              prefixes: [],
              fullNames: [],
              defaultDatabase: 'default_db'
            }
          },
          hint: {
            enabled: true,
            priority: 10,
            abortOnError: false,
            preserveHint: false
          }
        },
        errorHandling: {
          throwOnError: false,
          collectAll: true,
          maxErrors: 10,
          logErrors: false
        }
      }
    }
  ]);

  // 输出测试结果汇总
  suite.summary();
}

// 运行测试
runAllTests().catch(error => {
  console.error('测试运行失败:', error);
  process.exit(1);
});
