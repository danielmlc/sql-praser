import SqlParserService from '../src/index';
import * as fs from 'fs';
import * as path from 'path';

/**
 * SQL 文件测试程序
 * 读取 test/sql 目录下的所有 SQL 文件，进行改写测试
 */

/**
 * 测试结果接口
 */
interface TestResult {
  fileName: string;
  tenant: string | undefined;
  success: boolean;
  originalSql: string;
  rewrittenSql: string;
  error?: string;
  statistics: {
    originalLength: number;
    rewrittenLength: number;
    hasHint: boolean;
    sqlType: string | null;
    modified: boolean;
  };
}

/**
 * 初始化配置
 */
function initConfig() {
  SqlParserService.setConfig({
    tenantField: 'tenant',
    database: 'mysql',
    throwOnError: false, // 设置为 false，容错处理
    targetDatabases: {
      prefixes: ['tnt_'], // 只配置 tnt_ 前缀
      fullNames: ['global_platform', 'global_mtlp'], // 通过完整库名匹配
      defaultDatabase: 'tnt_mb',
    },
  });
}

/**
 * 读取 SQL 文件
 * @param filePath 文件路径
 * @returns SQL 内容
 */
function readSqlFile(filePath: string): string {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    throw new Error(
      `读取文件失败: ${error instanceof Error ? error.message : error}`,
    );
  }
}

/**
 * 获取 test/sql 目录下的所有 SQL 文件
 * @param sqlDir SQL 目录路径
 * @returns SQL 文件路径数组
 */
function getSqlFiles(sqlDir: string): string[] {
  try {
    const files = fs.readdirSync(sqlDir);
    return files
      .filter((file) => file.endsWith('.sql'))
      .map((file) => path.join(sqlDir, file))
      .sort(); // 按文件名排序
  } catch (error) {
    throw new Error(
      `读取目录失败: ${error instanceof Error ? error.message : error}`,
    );
  }
}

/**
 * 测试单个 SQL 文件
 * @param filePath SQL 文件路径
 * @returns 测试结果
 */
function testSqlFile(filePath: string): TestResult {
  const fileName = path.basename(filePath);
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📄 正在测试: ${fileName}`);
  console.log(`${'='.repeat(80)}`);

  try {
    // 读取 SQL 文件
    const originalSql = readSqlFile(filePath);
    console.log(`✅ 文件读取成功，SQL 长度: ${originalSql.length} 字符\n`);

    // 提取 hint 信息
    const hint = SqlParserService.extractHint(originalSql);
    const hasHint = SqlParserService.hasHint(originalSql);
    const sqlType = SqlParserService.getSqlType(originalSql);

    console.log(`📋 SQL 信息:`);
    console.log(`   - 是否包含 Hint: ${hasHint ? '是' : '否'}`);
    console.log(`   - 租户编码: ${hint.tenant || '无'}`);
    console.log(`   - SQL 类型: ${sqlType || '未知'}`);
    console.log(`   - 原始 Hint: ${hint.original || '无'}\n`);

    // 执行改写
    console.log(`🔄 开始 SQL 改写...`);
    const startTime = Date.now();
    const result = SqlParserService.rewriteWithDetails(originalSql);
    const endTime = Date.now();

    console.log(`✅ SQL 改写完成，耗时: ${endTime - startTime}ms`);
    console.log(`   - 是否被修改: ${result.modified ? '是' : '否'}`);
    console.log(`   - 改写后长度: ${result.sql.length} 字符\n`);

    // 显示原始 SQL（截取前 500 字符）
    console.log(`📝 原始 SQL (前 500 字符):`);
    console.log(`${'-'.repeat(80)}`);
    console.log(originalSql.substring(0, 500));
    if (originalSql.length > 500) {
      console.log(`... (共 ${originalSql.length} 字符)`);
    }
    console.log(`${'-'.repeat(80)}\n`);

    // 显示改写后的 SQL（截取前 500 字符）
    console.log(`✨ 改写后 SQL (前 500 字符):`);
    console.log(`${'-'.repeat(80)}`);
    console.log(result.sql.substring(0, 500));
    if (result.sql.length > 500) {
      console.log(`... (共 ${result.sql.length} 字符)`);
    }
    console.log(`${'-'.repeat(80)}\n`);

    return {
      fileName,
      tenant: hint.tenant,
      success: true,
      originalSql,
      rewrittenSql: result.sql,
      statistics: {
        originalLength: originalSql.length,
        rewrittenLength: result.sql.length,
        hasHint,
        sqlType,
        modified: result.modified,
      },
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`❌ 测试失败: ${errorMsg}\n`);

    return {
      fileName,
      tenant: undefined,
      success: false,
      originalSql: '',
      rewrittenSql: '',
      error: errorMsg,
      statistics: {
        originalLength: 0,
        rewrittenLength: 0,
        hasHint: false,
        sqlType: null,
        modified: false,
      },
    };
  }
}

/**
 * 生成测试报告
 * @param results 测试结果数组
 */
function generateReport(results: TestResult[]): void {
  console.log(`\n\n${'#'.repeat(80)}`);
  console.log(`📊 测试报告汇总`);
  console.log(`${'#'.repeat(80)}\n`);

  const successCount = results.filter((r) => r.success).length;
  const failureCount = results.filter((r) => !r.success).length;
  const modifiedCount = results.filter((r) => r.statistics.modified).length;

  console.log(`📈 总体统计:`);
  console.log(`   - 测试文件总数: ${results.length}`);
  console.log(`   - 成功: ${successCount} ✅`);
  console.log(`   - 失败: ${failureCount} ❌`);
  console.log(`   - 被修改: ${modifiedCount}`);
  console.log(`   - 未修改: ${successCount - modifiedCount}\n`);

  // 详细结果表格
  console.log(`📋 详细结果:\n`);
  console.log(
    `${'序号'.padEnd(6)}${'文件名'.padEnd(20)}${'租户'.padEnd(12)}${'SQL类型'.padEnd(10)}${'状态'.padEnd(8)}${'修改'.padEnd(8)}`,
  );
  console.log(`${'-'.repeat(80)}`);

  results.forEach((result, index) => {
    const statusIcon = result.success ? '✅' : '❌';
    const modifiedIcon = result.statistics.modified ? '是' : '否';
    const tenant = result.tenant || '无';
    const sqlType = result.statistics.sqlType || '未知';

    console.log(
      `${String(index + 1).padEnd(6)}${result.fileName.padEnd(20)}${tenant.padEnd(12)}${sqlType.padEnd(10)}${statusIcon.padEnd(8)}${modifiedIcon.padEnd(8)}`,
    );
  });

  console.log(`${'-'.repeat(80)}\n`);

  // 失败的文件
  const failures = results.filter((r) => !r.success);
  if (failures.length > 0) {
    console.log(`❌ 失败的文件:\n`);
    failures.forEach((failure, index) => {
      console.log(`   ${index + 1}. ${failure.fileName}`);
      console.log(`      错误: ${failure.error}\n`);
    });
  }

  // 统计信息
  const totalOriginalLength = results.reduce(
    (sum, r) => sum + r.statistics.originalLength,
    0,
  );
  const totalRewrittenLength = results.reduce(
    (sum, r) => sum + r.statistics.rewrittenLength,
    0,
  );

  console.log(`📊 SQL 统计:`);
  console.log(`   - 原始 SQL 总长度: ${totalOriginalLength} 字符`);
  console.log(`   - 改写后 SQL 总长度: ${totalRewrittenLength} 字符`);
  console.log(
    `   - 长度变化: ${totalRewrittenLength - totalOriginalLength > 0 ? '+' : ''}${totalRewrittenLength - totalOriginalLength} 字符\n`,
  );

  // 租户统计
  const tenantStats = new Map<string, number>();
  results.forEach((r) => {
    if (r.tenant) {
      tenantStats.set(r.tenant, (tenantStats.get(r.tenant) || 0) + 1);
    }
  });

  if (tenantStats.size > 0) {
    console.log(`👥 租户统计:`);
    tenantStats.forEach((count, tenant) => {
      console.log(`   - ${tenant}: ${count} 个文件`);
    });
    console.log('');
  }

  // SQL 类型统计
  const sqlTypeStats = new Map<string, number>();
  results.forEach((r) => {
    const type = r.statistics.sqlType || '未知';
    sqlTypeStats.set(type, (sqlTypeStats.get(type) || 0) + 1);
  });

  console.log(`📝 SQL 类型统计:`);
  sqlTypeStats.forEach((count, type) => {
    console.log(`   - ${type}: ${count} 个文件`);
  });

  console.log(`\n${'#'.repeat(80)}`);
  console.log(
    `${successCount === results.length ? '🎉 所有测试通过！' : '⚠️  部分测试失败'}`,
  );
  console.log(`${'#'.repeat(80)}\n`);
}

/**
 * 将测试结果保存到文件
 * @param results 测试结果数组
 * @param outputDir 输出目录
 */
function saveResults(results: TestResult[], outputDir: string): void {
  try {
    // 确保输出目录存在
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 保存每个 SQL 的改写结果
    results.forEach((result) => {
      if (result.success && result.statistics.modified) {
        const outputFileName = result.fileName.replace(
          '.sql',
          '_rewritten.sql',
        );
        const outputPath = path.join(outputDir, outputFileName);
        fs.writeFileSync(outputPath, result.rewrittenSql, 'utf-8');
        console.log(`💾 保存改写结果: ${outputFileName}`);
      }
    });

    // 保存 JSON 格式的完整报告
    const reportPath = path.join(outputDir, 'test-report.json');
    fs.writeFileSync(
      reportPath,
      JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          summary: {
            total: results.length,
            success: results.filter((r) => r.success).length,
            failure: results.filter((r) => !r.success).length,
            modified: results.filter((r) => r.statistics.modified).length,
          },
          results: results.map((r) => ({
            fileName: r.fileName,
            tenant: r.tenant,
            success: r.success,
            error: r.error,
            statistics: r.statistics,
          })),
        },
        null,
        2,
      ),
      'utf-8',
    );
    console.log(`💾 保存测试报告: test-report.json\n`);
  } catch (error) {
    console.error(
      `❌ 保存结果失败: ${error instanceof Error ? error.message : error}`,
    );
  }
}

/**
 * 主测试函数
 */
function runSqlFileTests() {
  console.log(`🚀 SQL 文件测试程序启动\n`);
  console.log(`📅 测试时间: ${new Date().toLocaleString('zh-CN')}`);
  console.log(`💻 Node.js 版本: ${process.version}`);
  console.log(`📁 工作目录: ${process.cwd()}\n`);

  const startTime = Date.now();

  try {
    // 初始化配置
    console.log(`🔧 初始化 SQL Parser 配置...`);
    initConfig();
    const config = SqlParserService.getConfig();
    console.log(`✅ 配置初始化完成`);
    console.log(`   - 租户字段: ${config.tenantField}`);
    console.log(`   - 数据库类型: ${config.database}`);
    console.log(
      `   - 目标库前缀: ${config.targetDatabases?.prefixes.join(', ')}`,
    );
    console.log(
      `   - 目标库全名: ${config.targetDatabases?.fullNames.join(', ')}\n`,
    );

    // 获取 SQL 文件列表
    const sqlDir = path.join(__dirname, 'sql');
    console.log(`📂 扫描 SQL 文件目录: ${sqlDir}`);
    const sqlFiles = getSqlFiles(sqlDir);
    console.log(`✅ 找到 ${sqlFiles.length} 个 SQL 文件\n`);

    if (sqlFiles.length === 0) {
      console.log(`⚠️  没有找到 SQL 文件，测试结束`);
      return;
    }

    // 显示文件列表
    console.log(`📋 文件列表:`);
    sqlFiles.forEach((file, index) => {
      console.log(`   ${index + 1}. ${path.basename(file)}`);
    });

    // 测试所有 SQL 文件
    const results: TestResult[] = [];
    for (const sqlFile of sqlFiles) {
      const result = testSqlFile(sqlFile);
      results.push(result);
    }

    // 生成测试报告
    generateReport(results);

    // 保存测试结果
    const outputDir = path.join(__dirname, 'output');
    console.log(`\n💾 保存测试结果到: ${outputDir}\n`);
    saveResults(results, outputDir);

    const endTime = Date.now();
    console.log(`⏱️  总耗时: ${endTime - startTime}ms`);
    console.log(`\n✅ 测试程序执行完成！\n`);
  } catch (error) {
    console.error(
      `❌ 测试程序执行失败: ${error instanceof Error ? error.message : error}`,
    );
    process.exit(1);
  }
}

// 如果直接运行此文件，则执行测试
if (require.main === module) {
  runSqlFileTests();
}

// 导出测试函数
export { runSqlFileTests, testSqlFile, generateReport };

// 默认导出
export default runSqlFileTests;
