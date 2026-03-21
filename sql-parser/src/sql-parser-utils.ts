import { Parser, AST } from 'node-sql-parser';
import { CommentInfo, WrapperStatementConfig, WrapperInfo } from './types';
import { SqlParseError, SqlRewriteError, ErrorUtils } from './errors';

/**
 * SQL解析工具类
 * 提供通用的SQL处理功能，供SqlRewriter和DatabaseNameRewriter共用
 */
export class SqlParserUtils {
  private static parser = new Parser();

  /**
   * 预处理 DEFAULT 值
   * 将 DEFAULT 关键字替换为占位符，因为 node-sql-parser 不支持 DEFAULT
   * @param sql 原始SQL
   * @returns 预处理后的SQL
   */
  static preprocessDefaultValues(sql: string): string {
    // 使用不太可能与实际数据冲突的占位符
    return sql.replace(/\bDEFAULT\b/gi, "'__SQL_PARSER_DEFAULT_PLACEHOLDER__'");
  }

  /**
   * 后处理恢复 DEFAULT 值
   * 将占位符恢复为 DEFAULT 关键字
   * @param sql 处理后的SQL
   * @returns 恢复DEFAULT关键字的SQL
   */
  static postprocessDefaultValues(sql: string): string {
    // 恢复 DEFAULT 关键字
    return sql.replace(/'__SQL_PARSER_DEFAULT_PLACEHOLDER__'/g, 'DEFAULT');
  }

  /**
   * 提取SQL中的所有注释
   * @param sql 原始SQL
   * @returns 注释信息数组
   */
  static extractAllComments(sql: string): CommentInfo[] {
    const comments: CommentInfo[] = [];

    // 匹配块注释 /* ... */
    const blockCommentRegex = /\/\*[\s\S]*?\*\//g;
    let match;

    while ((match = blockCommentRegex.exec(sql)) !== null) {
      comments.push({
        content: match[0],
        type: 'block',
        start: match.index,
        end: match.index + match[0].length,
      });
    }

    // 匹配行注释 -- ... (到行末)
    const lineCommentRegex = /--.*$/gm;
    while ((match = lineCommentRegex.exec(sql)) !== null) {
      comments.push({
        content: match[0],
        type: 'line',
        start: match.index,
        end: match.index + match[0].length,
      });
    }

    // 匹配行注释 # ... (到行末)
    // const hashCommentRegex = /#.*$/gm;
    // while ((match = hashCommentRegex.exec(sql)) !== null) {
    //   comments.push({
    //     content: match[0],
    //     type: 'line',
    //     start: match.index,
    //     end: match.index + match[0].length,
    //   });
    // }

    // 按位置排序
    return comments.sort((a, b) => a.start - b.start);
  }

  /**
   * 将注释和纯SQL重新组合
   * @param comments 注释信息数组
   * @param cleanSql 纯SQL
   * @returns 组合后的完整SQL
   */
  static combineCommentsAndSql(
    comments: CommentInfo[],
    cleanSql: string,
  ): string {
    if (comments.length === 0) {
      return cleanSql;
    }

    // 简单策略：将所有注释放在SQL前面，用空格分隔
    const commentStrings = comments.map((comment) => comment.content);
    return `${commentStrings.join(' ')} ${cleanSql}`;
  }

  /**
   * 解析SQL为AST
   * @param sql SQL语句
   * @param database 数据库类型，默认为mysql
   * @returns 解析后的AST
   */
  static parseToAst(sql: string, database = 'mysql'): AST | AST[] {
    try {
      // 预处理 DEFAULT 值
      const preprocessedSql = SqlParserUtils.preprocessDefaultValues(sql);

      return SqlParserUtils.parser.astify(preprocessedSql, {
        database,
      });
    } catch (error) {
      throw new SqlParseError(
        `SQL解析失败: ${ErrorUtils.getErrorMessage(error)}`,
        sql,
        error instanceof Error ? error : undefined,
      );
    }
  }

  /**
   * 将AST转换为SQL
   * @param ast AST对象
   * @param database 数据库类型，默认为mysql
   * @returns 转换后的SQL
   */
  static astToSql(ast: AST | AST[], database = 'mysql'): string {
    try {
      const sql = SqlParserUtils.parser.sqlify(ast, {
        database,
      });

      // 恢复 DEFAULT 值
      return SqlParserUtils.postprocessDefaultValues(sql);
    } catch (error) {
      throw new SqlRewriteError(
        `AST转SQL失败: ${ErrorUtils.getErrorMessage(error)}`,
        JSON.stringify(ast),
        error instanceof Error ? error : undefined,
      );
    }
  }

  /**
   * 验证SQL类型是否支持
   * @param ast 解析后的AST
   * @param supportedTypes 支持的SQL类型数组
   * @param originalSql 原始SQL（用于错误信息）
   * @param throwOnUnsupported 遇到不支持的类型是否抛出异常，默认为false（仅警告）
   */
  static validateSqlType(
    ast: AST | AST[],
    supportedTypes: string[],
    originalSql?: string,
    throwOnUnsupported = false,
  ): void {
    const astArray = Array.isArray(ast) ? ast : [ast];

    for (const astItem of astArray) {
      if (!supportedTypes.includes(astItem.type)) {
        const message = `SQL type '${astItem.type}' is not supported. Supported types: ${supportedTypes.join(', ')}`;

        if (throwOnUnsupported) {
          throw new SqlRewriteError(message, originalSql || '');
        } else {
          console.warn(message);
        }
      }
    }
  }

  /**
   * 安全的SQL解析，失败时返回null而不抛出异常
   * @param sql SQL语句
   * @param database 数据库类型
   * @returns 解析成功返回AST，失败返回null
   */
  static safeParseToAst(sql: string, database = 'mysql'): AST | AST[] | null {
    try {
      return SqlParserUtils.parseToAst(sql, database);
    } catch {
      return null;
    }
  }

  /**
   * 安全的AST转SQL，失败时返回原始输入
   * @param ast AST对象
   * @param database 数据库类型
   * @param fallbackSql 失败时的降级SQL
   * @returns 转换后的SQL或降级SQL
   */
  static safeAstToSql(
    ast: AST | AST[],
    database = 'mysql',
    fallbackSql = '',
  ): string {
    try {
      return SqlParserUtils.astToSql(ast, database);
    } catch {
      return fallbackSql;
    }
  }

  /**
   * 检查SQL是否可以被正确解析
   * @param sql SQL语句
   * @param database 数据库类型
   * @returns 是否可以解析
   */
  static isValidSql(sql: string, database = 'mysql'): boolean {
    return SqlParserUtils.safeParseToAst(sql, database) !== null;
  }

  /**
   * 获取SQL的类型
   * @param sql SQL语句
   * @param database 数据库类型
   * @returns SQL类型或null（解析失败时）
   */
  static getSqlType(sql: string, database = 'mysql'): string | null {
    const ast = SqlParserUtils.safeParseToAst(sql, database);
    if (!ast) {
      return null;
    }

    if (Array.isArray(ast)) {
      return ast.length > 0 ? ast[0].type : null;
    }

    return ast.type;
  }

  /**
   * 移除SQL中的所有注释，返回纯SQL
   * @param sql 原始SQL
   * @returns 移除注释后的SQL
   */
  static removeAllComments(sql: string): string {
    return (
      sql
        .replace(/\/\*[\s\S]*?\*\//g, ' ') // 移除块注释
        .replace(/--.*$/gm, '') // 移除行注释 --
        // .replace(/#.*$/gm, '') // 移除行注释 #
        .replace(/\s+/g, ' ') // 合并多个空格
        .trim()
    );
  }

  /**
   * 完整的SQL处理流程模板
   * 包含注释提取、预处理、解析、处理、转换、后处理、注释组合的完整流程
   * @param sql 原始SQL
   * @param processor AST处理函数
   * @param database 数据库类型
   * @param supportedTypes 支持的SQL类型
   * @returns 处理结果
   */
  static processWithTemplate<T>(
    sql: string,
    processor: (ast: AST | AST[]) => T,
    database = 'mysql',
    supportedTypes: string[] = [
      'select',
      'insert',
      'replace',
      'update',
      'delete',
    ],
  ): {
    result: T | null;
    finalSql: string;
    modified: boolean;
    comments: CommentInfo[];
  } {
    // 1. 提取注释
    let allComments: CommentInfo[] = [];
    let cleanSql: string = sql;

    try {
      allComments = SqlParserUtils.extractAllComments(sql);
      cleanSql = SqlParserUtils.removeAllComments(sql);
    } catch (error) {
      console.warn(
        '提取注释失败，使用原始SQL:',
        ErrorUtils.getErrorMessage(error),
      );
    }

    try {
      // 2. 解析AST
      const ast = SqlParserUtils.parseToAst(cleanSql, database);

      // 3. 验证SQL类型
      SqlParserUtils.validateSqlType(ast, supportedTypes, cleanSql, false);

      // 4. 执行处理
      const result = processor(ast);

      // 5. 转换回SQL
      const processedSql = SqlParserUtils.astToSql(ast, database);

      // 6. 组合注释
      const finalSql =
        allComments.length > 0
          ? SqlParserUtils.combineCommentsAndSql(allComments, processedSql)
          : processedSql;

      return {
        result,
        finalSql,
        modified: processedSql !== cleanSql.trim(),
        comments: allComments,
      };
    } catch (error) {
      console.warn(
        'SQL处理失败，返回原SQL:',
        ErrorUtils.getErrorMessage(error),
      );

      const finalSql =
        allComments.length > 0
          ? SqlParserUtils.combineCommentsAndSql(allComments, cleanSql)
          : sql;

      return {
        result: null,
        finalSql,
        modified: false,
        comments: allComments,
      };
    }
  }

  /**
   * 增强的包装型语句预处理，支持配置驱动
   * @param sql 原始SQL语句
   * @param config 包装型语句配置
   * @returns 包装型语句信息
   */
  static preprocessWrapperStatements(
    sql: string,
    config?: WrapperStatementConfig,
  ): WrapperInfo {
    const trimmedSql = sql.trim();

    // 如果未启用或无配置，直接返回
    if (!config?.enabled) {
      return {
        hasWrapper: false,
        wrapperType: '',
        prefix: '',
        innerSql: trimmedSql,
        originalSql: trimmedSql,
      };
    }

    // 先移除所有注释以便进行包装型语句模式匹配
    // 但保留原始SQL用于后续处理
    let sqlForMatching: string;
    try {
      sqlForMatching = SqlParserUtils.removeAllComments(trimmedSql).trim();
    } catch (error) {
      // 注释移除失败，使用原始SQL
      console.warn(
        '移除注释失败，使用原始SQL进行包装型语句匹配:',
        ErrorUtils.getErrorMessage(error),
      );
      sqlForMatching = trimmedSql;
    }

    // 默认的包装型语句模式
    const defaultPatterns = [
      {
        type: 'EXPLAIN',
        pattern: /^(EXPLAIN\s+)(.+)$/i,
        validateInner: (innerSql: string) => {
          return /^\s*(SELECT|INSERT|UPDATE|DELETE|REPLACE|WITH)\s+/i.test(
            innerSql,
          );
        },
      },
    ];

    // 合并自定义模式
    const allPatterns = [...defaultPatterns, ...(config.customPatterns || [])];

    // 只处理配置中启用的类型
    const enabledPatterns = allPatterns.filter((pattern) =>
      config.supportedTypes.includes(pattern.type),
    );

    // 尝试匹配（使用移除了注释的SQL）
    for (const wrapper of enabledPatterns) {
      const match = sqlForMatching.match(wrapper.pattern);
      if (match) {
        const cleanInnerSql = match[2] || match[1];

        // 验证内层SQL（如果启用验证）
        if (config.validateInnerSql !== false) {
          const isValidInner = wrapper.validateInner
            ? wrapper.validateInner(cleanInnerSql)
            : true;

          if (!isValidInner) {
            console.warn(
              `包装型语句 ${wrapper.type} 的内层SQL验证失败: ${cleanInnerSql.substring(0, 50)}...`,
            );
            continue; // 内层SQL无效，继续尝试下一个模式
          }
        }

        // 从原始SQL（包含注释的）中提取内层SQL
        // 需要找到包装型语句前缀在原始SQL中的位置
        const wrapperPrefix = match[1]; // 例如 "EXPLAIN "

        // 在原始SQL中查找包装型语句前缀的位置（忽略大小写）
        const regex = new RegExp(`(${wrapperPrefix.trim()})\\s+`, 'i');
        const originalMatch = trimmedSql.match(regex);

        if (originalMatch) {
          // 计算包装前缀在原始SQL中的结束位置
          const prefixEndIndex = originalMatch.index! + originalMatch[0].length;
          // 提取从前缀结束位置到SQL结尾的部分作为内层SQL
          const innerSqlFromOriginal = trimmedSql.substring(prefixEndIndex);

          return {
            hasWrapper: true,
            wrapperType: wrapper.type,
            prefix: originalMatch[0], // 使用原始SQL中的前缀（可能包含不同的空格格式）
            innerSql: innerSqlFromOriginal,
            originalSql: trimmedSql,
          };
        } else {
          // 如果在原始SQL中找不到前缀，回退到使用清理后的SQL
          console.warn(`在原始SQL中找不到包装型语句前缀: ${wrapperPrefix}`);
          return {
            hasWrapper: true,
            wrapperType: wrapper.type,
            prefix: wrapperPrefix,
            innerSql: cleanInnerSql,
            originalSql: trimmedSql,
          };
        }
      }
    }

    return {
      hasWrapper: false,
      wrapperType: '',
      prefix: '',
      innerSql: trimmedSql,
      originalSql: trimmedSql,
    };
  }

  /**
   * 包装型语句后处理：重新组装完整语句
   * @param processedSql 处理后的内层SQL
   * @param wrapperInfo 包装型语句信息
   * @returns 重新组装的完整SQL
   */
  static postprocessWrapperStatements(
    processedSql: string,
    wrapperInfo: WrapperInfo,
  ): string {
    if (!wrapperInfo.hasWrapper) {
      return processedSql;
    }
    return `${wrapperInfo.prefix}${processedSql}`;
  }
}
