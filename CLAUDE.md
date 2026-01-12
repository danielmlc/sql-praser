# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 构建和开发命令

```bash
# 生成 ANTLR4 解析器（修改 .g4 语法文件后需要运行）
pnpm run generate:parser      # 仅 MySQL 解析器
pnpm run generate:parser:tidb # 仅 TiDB 解析器
pnpm run generate:all         # 所有解析器

# 构建 TypeScript 到 JavaScript
pnpm run build                # 清理并编译到 lib/
pnpm run watch                # 监视模式（开发时使用）

# 运行测试
pnpm run test                 # 运行租户过滤测试
```

## 高层架构

项目采用**分层架构**，以 **Listener 模式**作为核心转换机制：

```
应用层 (index.ts)
    ↓
编排层 (sql-processor-orchestrator.ts)
    ↓
监听器链 (listener-chain.ts)
    ├── HintListener (优先级: 10) - 提取/移除租户 hint
    └── TenantFilterListener (优先级: 100) - 注入租户条件
    ↓
解析器层 (mysql-parser.ts)
    ↓
ANTLR4 生成代码 (generated/mysql/)
```

### 核心流程

1. **SQLProcessorOrchestrator** 协调整个处理过程
2. **ParserFactory** 创建特定方言的解析器（MySQL/TiDB）
3. **BaseSQLParser.parseWithDetails()** 返回：`{ parseTree, tokenStream, rewriter, ... }`
4. **ListenerChain.execute()** 按优先级顺序执行监听器
5. 每个监听器接收 **ListenerContext**，通过 sharedState 实现监听器间通信
6. **TokenStreamRewriter** 修改 SQL 同时保留原有格式

## 关键实现细节

### tenant-filter-listener.ts 中的方法绑定问题

生成的 `MySqlParserListener` 基类将所有监听器方法定义为实例上的 `undefined` 属性。这会遮蔽原型方法，导致 `ParseTreeWalker` 找不到你的实现。

**解决方案**：创建监听器实例后，显式绑定原型方法到实例：

```typescript
const antlrListener = new TenantConditionListener(...);
(antlrListener as any).enterQuerySpecification = TenantConditionListener.prototype.enterQuerySpecification.bind(antlrListener);
(antlrListener as any).enterUpdateStatement = TenantConditionListener.prototype.enterUpdateStatement.bind(antlrListener);
// ... 绑定所有你实现的方法
```

### ANTLR4 语法树导航

MySQL 语法结构与你预期的可能不同：

- **SELECT**：WHERE 子句在 `fromClause()` 内部，而不是直接在 `QuerySpecificationContext` 上
  - 使用 `ctx.fromClause().WHERE()` 检查 WHERE 是否存在
  - 使用 `ctx.fromClause().expression()` 获取表达式

- **UPDATE**：使用 `ctx.singleUpdateStatement()` 访问实际的语句
  - 表源：`singleUpdate.tableSources()`
  - WHERE 检查：`singleUpdate.WHERE() !== null`

- **DELETE**：使用 `ctx.singleDeleteStatement()` 访问实际的语句
  - 表名：`singleDelete.tableName()`
  - WHERE 检查：`singleDelete.WHERE() !== null`

### 动态模块加载

生成的 ANTLR4 文件在运行时使用 `require()` 加载，以避免编译依赖。代码会尝试多个路径：

1. `lib/generated/mysql/`（编译输出）
2. `generated/mysql/`（开发环境，TypeScript）

如果加载失败，会使用占位符类，但功能将无法正常工作。

## 类型系统说明

- 许多类型定义为 `any`，因为 ANTLR4 生成的代码没有正确的 TypeScript 类型
- tsconfig.json 中配置了路径别名：`@core/*`、`@parser/*`、`@adapter/*`、`@listeners/*`、`@orchestrator/*`、`@config/*`

## 租户 Hint 格式

Hint 语法为：`/*& tenant:'xxx' */`

该 hint 由 `HintListener` 提取并存储在 `sharedState` 中，供 `TenantFilterListener` 使用。

## 测试

主测试文件：`test/tenant-filter.test.ts`（63 个测试，覆盖 SELECT/INSERT/UPDATE/DELETE 的各种场景）
