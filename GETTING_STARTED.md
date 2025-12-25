# 快速开始指南

## 安装依赖

首先，安装项目依赖：

```bash
npm install
```

这会安装以下关键依赖：
- `antlr4` - ANTLR4 运行时库
- `antlr4-cli` - ANTLR4 命令行工具
- `typescript` - TypeScript 编译器
- `ts-node` - TypeScript 执行环境

## 构建项目

运行以下命令生成解析器并编译 TypeScript：

```bash
npm run build
```

这个命令会：
1. 使用 ANTLR4 从 `.g4` 语法文件生成 TypeScript 解析器代码
2. 将生成的代码放在 `src/parser/generated/` 目录
3. 使用 TypeScript 编译器编译所有代码到 `dist/` 目录

## 运行示例

查看所有功能的演示：

```bash
npm run example
```

这会运行 `examples/basic-usage.ts`，展示：
- SQL 解析
- SQL 验证
- 表名/列名提取
- SQL 改写（添加前缀、WHERE 条件、LIMIT 等）
- TiDB 特有语法支持

## 开发模式

如果你要修改代码，可以使用监听模式：

```bash
npm run watch
```

这样 TypeScript 编译器会监听文件变化并自动重新编译。

## 在你的项目中使用

### 安装为依赖

如果你要在其他项目中使用这个解析器，可以：

1. 将这个项目打包：
```bash
npm pack
```

2. 在你的项目中安装：
```bash
npm install /path/to/tidb-sql-parser-1.0.0.tgz
```

### 基本使用

```typescript
import { TiDBSQLParser, SQLRewriter } from 'tidb-sql-parser';

// 创建解析器实例
const parser = new TiDBSQLParser();

// 解析 SQL
const sql = 'SELECT * FROM users WHERE id = 1';
const ast = parser.parse(sql);

// 使用改写器
const rewriter = new SQLRewriter();
const rewritten = rewriter.addTablePrefix(sql, 'prod_');
console.log(rewritten); // SELECT * FROM prod_users WHERE id = 1
```

## 常见问题

### Q: 如何添加新的 SQL 语法支持？

A: 编辑 `grammar/TiDBLexer.g4` 和 `grammar/TiDBParser.g4` 文件，然后重新运行 `npm run build`。

### Q: 生成的文件在哪里？

A:
- ANTLR4 生成的代码：`src/parser/generated/`
- TypeScript 编译输出：`dist/`

### Q: 如何清理生成的文件？

A: 运行 `npm run clean`

### Q: 支持哪些 TiDB 特有语法？

A: 当前支持：
- PARTITION BY (HASH, RANGE, LIST)
- SHARD_ROW_ID_BITS
- PRE_SPLIT_REGIONS

可以通过修改语法文件添加更多支持。

## 下一步

- 查看 `examples/basic-usage.ts` 了解详细用法
- 阅读 `README.md` 了解完整 API
- 探索 `src/visitor/TiDBVisitor.ts` 学习如何创建自定义 Visitor
- 查看 `src/rewriter/SQLRewriter.ts` 学习如何实现 SQL 改写
