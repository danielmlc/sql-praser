import { SqlRewriter, DatabaseNameRewriter } from '../src/index';

/**
 * 包装型语句功能测试
 */

console.log('🚀 ========== 包装型语句功能测试 ==========\n');

// 测试1: SqlRewriter的EXPLAIN支持（hint改写）
console.log('📋 测试1: SqlRewriter + EXPLAIN + hint改写');

const sqlRewriter = new SqlRewriter({
  tenantField: 'tenant',
  targetDatabases: {
    prefixes: ['tnt_'],
    fullNames: ['global_mb'],
    defaultDatabase: 'main',
  },
  wrapperStatements: {
    enabled: true,
    supportedTypes: ['EXPLAIN'],
    validateInnerSql: true,
  },
});

const explainWithHint =
  "/* from:'node-pf-db-upgrade-program', addr:'192.168.5.41:3004' */ /*& global:true */ EXPLAIN delete from `tnt_mb`.`company_scope`";
console.log('原始SQL:', explainWithHint);

const hintResult = sqlRewriter.rewrite(explainWithHint);
console.log('改写结果:', hintResult.sql);
console.log('是否修改:', hintResult.modified);
console.log('提取的hint:', hintResult.hint);

console.log('\n' + '-'.repeat(80) + '\n');

// 测试2: DatabaseNameRewriter的EXPLAIN支持（数据库名改写）
console.log('📋 测试2: DatabaseNameRewriter + EXPLAIN + 数据库名改写');

const dbRewriter = new DatabaseNameRewriter({
  enabled: true,
  dbPrefix: 'prod_',
  preserveOriginalName: true,
  wrapperStatements: {
    enabled: true,
    supportedTypes: ['EXPLAIN', 'DESCRIBE'],
    validateInnerSql: true,
  },
});

const explainInsert =
  "EXPLAIN INSERT INTO `dev_tnt_mb`.`company_scope` (id, name) VALUES (1, '研发部')";
console.log('原始SQL:', explainInsert);

const dbResult = dbRewriter.rewriteDatabase(explainInsert);
console.log('改写结果:', dbResult.sql);
console.log('是否修改:', dbResult.modified);
console.log('数据库改写详情:', dbResult.databaseRewrites);

console.log('\n' + '-'.repeat(80) + '\n');

// 测试3: DatabaseNameRewriter的DESCRIBE支持
console.log('📋 测试3: DatabaseNameRewriter + DESCRIBE + 数据库名改写');

const describeTable = 'DESCRIBE dev_tnt_mb.users';
console.log('原始SQL:', describeTable);

const descResult = dbRewriter.rewriteDatabase(describeTable);
console.log('改写结果:', descResult.sql);
console.log('是否修改:', descResult.modified);
console.log('数据库改写详情:', descResult.databaseRewrites);

console.log('\n' + '-'.repeat(80) + '\n');

// 测试4: 未启用包装型语句支持时的行为
console.log('📋 测试4: 未启用包装型语句支持（默认行为）');

const basicRewriter = new SqlRewriter({
  tenantField: 'tenant',
  // wrapperStatements默认为enabled: false
});

const explainSql = 'EXPLAIN SELECT * FROM users';
console.log('原始SQL:', explainSql);

const basicResult = basicRewriter.rewrite(explainSql);
console.log('改写结果:', basicResult.sql);
console.log('是否修改:', basicResult.modified);
console.log('说明: 未启用包装型语句支持，SQL保持不变');

console.log('\n' + '-'.repeat(80) + '\n');

// 测试5: 动态更新配置
console.log('📋 测试5: 动态更新包装型语句配置');

console.log(
  '更新前配置:',
  JSON.stringify(sqlRewriter.getConfig().wrapperStatements, null, 2),
);

sqlRewriter.updateConfig({
  wrapperStatements: {
    enabled: true,
    supportedTypes: ['EXPLAIN', 'DESCRIBE'],
    validateInnerSql: false,
  },
});

console.log(
  '更新后配置:',
  JSON.stringify(sqlRewriter.getConfig().wrapperStatements, null, 2),
);

console.log('\n🎉 ========== 包装型语句功能测试完成 ==========');
