import { AST } from 'node-sql-parser';
import { SqlParserUtils } from './sql-parser-utils';
import { CommentInfo, WrapperStatementConfig, WrapperInfo } from './types';
import { ErrorUtils } from './errors';

/**
 * SQL处理器抽象基类
 * 提供模板方法模式，封装通用的SQL处理流程
 * 子类只需实现特定的AST处理逻辑
 */
export abstract class BaseSqlProcessor {
  /**
   * 获取支持的SQL类型列表
   * 子类需要实现此方法来指定支持哪些SQL类型
   */
  protected abstract getSupportedSqlTypes(): string[];

  /**
   * 获取数据库类型
   * 子类需要实现此方法来指定数据库类型
   */
  protected abstract getDatabase(): string;

  /**
   * 是否在遇到不支持的SQL类型时抛出异常
   * 默认为false（仅警告），子类可以重写
   */
  protected shouldThrowOnUnsupportedType(): boolean {
    return false;
  }

  /**
   * 处理AST的具体实现
   * 子类需要实现此方法来定义如何处理AST
   * @param ast 解析后的AST
   * @returns 处理结果，如果返回修改信息，则表示AST被修改了
   */
  protected abstract processAst(ast: AST | AST[]): any;

  /**
   * 子类可以重写此方法来决定是否支持包装型语句
   * 默认返回false，子类需要显式启用
   */
  protected supportWrapperStatements(): boolean {
    return false;
  }

  /**
   * 子类可以重写此方法来提供包装型语句配置
   * 默认返回undefined，子类需要提供具体配置
   */
  protected getWrapperStatementsConfig(): WrapperStatementConfig | undefined {
    return undefined;
  }

  /**
   * 子类可以重写此方法来指定支持的包装型语句类型
   * 这是getWrapperStatementsConfig的简化版本
   */
  protected getSupportedWrapperTypes(): string[] {
    return [];
  }

  /**
   * 模板方法：完整的SQL处理流程
   * 1. 预处理包装型语句
   * 2. 提取注释
   * 3. 预处理DEFAULT值
   * 4. 解析AST
   * 5. 验证SQL类型
   * 6. 调用子类的具体处理方法
   * 7. 转换回SQL
   * 8. 后处理DEFAULT值
   * 9. 组合注释
   * 10. 恢复包装型语句
   *
   * @param sql 原始SQL语句
   * @returns 处理结果
   */
  protected processWithComments(sql: string): {
    sql: string;
    modified: boolean;
    result?: any;
    comments: CommentInfo[];
  } {
    // 输入验证
    if (!sql || typeof sql !== 'string' || sql.trim().length === 0) {
      return {
        sql,
        modified: false,
        comments: [],
      };
    }

    // 1. 预处理包装型语句（新增）
    let wrapperInfo: WrapperInfo = {
      hasWrapper: false,
      wrapperType: '',
      prefix: '',
      innerSql: sql,
      originalSql: sql,
    };
    let sqlToProcess = sql;

    if (this.supportWrapperStatements()) {
      // 获取包装型语句配置
      let wrapperConfig = this.getWrapperStatementsConfig();

      // 如果没有提供完整配置，则使用简化配置
      if (!wrapperConfig) {
        const supportedTypes = this.getSupportedWrapperTypes();
        if (supportedTypes.length > 0) {
          wrapperConfig = {
            enabled: true,
            supportedTypes,
            validateInnerSql: true,
          };
        }
      }

      if (wrapperConfig) {
        wrapperInfo = SqlParserUtils.preprocessWrapperStatements(
          sql,
          wrapperConfig,
        );

        // if (wrapperInfo.hasWrapper) {
        //   sqlToProcess = wrapperInfo.innerSql;
        //   console.log(`检测到包装型语句: ${wrapperInfo.wrapperType}`);
        // }
      }
    }

    // 2. 提取注释信息（容错处理）
    let allComments: CommentInfo[] = [];
    let cleanSql: string = sqlToProcess;

    try {
      allComments = SqlParserUtils.extractAllComments(sqlToProcess);
      cleanSql = SqlParserUtils.removeAllComments(sqlToProcess);
    } catch (error) {
      console.warn(
        '提取注释失败，使用原始SQL:',
        ErrorUtils.getErrorMessage(error),
      );
      // 注释提取失败，cleanSql 保持为原始 sqlToProcess
    }

    try {
      // 3. 解析纯SQL为AST（包含DEFAULT预处理）
      const ast = SqlParserUtils.parseToAst(cleanSql, this.getDatabase());

      // 4. 验证SQL类型是否支持
      SqlParserUtils.validateSqlType(
        ast,
        this.getSupportedSqlTypes(),
        cleanSql,
        this.shouldThrowOnUnsupportedType(),
      );

      // 5. 执行子类的具体处理逻辑
      const result = this.processAst(ast);

      // 6. 将AST转换回SQL（包含DEFAULT后处理）
      const processedCleanSql = SqlParserUtils.astToSql(
        ast,
        this.getDatabase(),
      );

      // 7. 重新组合注释和SQL
      const sqlWithComments =
        allComments.length > 0
          ? SqlParserUtils.combineCommentsAndSql(allComments, processedCleanSql)
          : processedCleanSql;

      // 8. 恢复包装型语句（新增）
      const finalSql = SqlParserUtils.postprocessWrapperStatements(
        sqlWithComments,
        wrapperInfo,
      );

      return {
        sql: finalSql,
        modified:
          processedCleanSql !== cleanSql.trim() || wrapperInfo.hasWrapper,
        result,
        comments: allComments,
      };
    } catch (error) {
      // 处理失败时返回原SQL（包含注释和包装）
      console.warn(
        'SQL处理失败，返回原SQL:',
        ErrorUtils.getErrorMessage(error),
      );

      // 失败时也要恢复包装结构
      const fallbackSql =
        allComments.length > 0
          ? SqlParserUtils.combineCommentsAndSql(allComments, cleanSql)
          : sqlToProcess;

      const finalSql = SqlParserUtils.postprocessWrapperStatements(
        fallbackSql,
        wrapperInfo,
      );

      return {
        sql: finalSql,
        modified: false,
        comments: allComments,
      };
    }
  }

  /**
   * 简化的处理方法，不保留注释
   * 适用于只需要处理纯SQL的场景
   *
   * @param cleanSql 纯SQL语句（不包含注释）
   * @returns 处理结果
   */
  protected processCleanSql(cleanSql: string): {
    sql: string;
    modified: boolean;
    result?: any;
  } {
    // 输入验证
    if (
      !cleanSql ||
      typeof cleanSql !== 'string' ||
      cleanSql.trim().length === 0
    ) {
      return {
        sql: cleanSql,
        modified: false,
      };
    }

    try {
      // 1. 解析SQL为AST
      const ast = SqlParserUtils.parseToAst(cleanSql, this.getDatabase());

      // 2. 验证SQL类型
      SqlParserUtils.validateSqlType(
        ast,
        this.getSupportedSqlTypes(),
        cleanSql,
        this.shouldThrowOnUnsupportedType(),
      );

      // 3. 执行处理
      const result = this.processAst(ast);

      // 4. 转换回SQL
      const processedSql = SqlParserUtils.astToSql(ast, this.getDatabase());

      return {
        sql: processedSql,
        modified: processedSql !== cleanSql.trim(),
        result,
      };
    } catch (error) {
      // 处理失败时返回原SQL
      console.warn(
        'SQL处理失败，返回原SQL:',
        ErrorUtils.getErrorMessage(error),
      );

      return {
        sql: cleanSql,
        modified: false,
      };
    }
  }

  /**
   * 批量处理SQL列表
   * @param sqlList SQL列表
   * @returns 处理结果列表
   */
  protected batchProcess(sqlList: string[]): Array<{
    sql: string;
    modified: boolean;
    result?: any;
    comments: CommentInfo[];
  }> {
    return sqlList.map((sql) => {
      try {
        return this.processWithComments(sql);
      } catch (error) {
        console.warn('SQL处理失败:', ErrorUtils.getErrorMessage(error));
        return {
          sql,
          modified: false,
          comments: [],
        };
      }
    });
  }

  /**
   * 验证SQL是否可以被当前处理器处理
   * @param sql SQL语句
   * @returns 是否可以处理
   */
  protected canProcess(sql: string): boolean {
    if (!sql || typeof sql !== 'string' || sql.trim().length === 0) {
      return false;
    }

    try {
      const cleanSql = SqlParserUtils.removeAllComments(sql);
      const ast = SqlParserUtils.parseToAst(cleanSql, this.getDatabase());

      // 检查是否为支持的SQL类型
      const astArray = Array.isArray(ast) ? ast : [ast];
      const supportedTypes = this.getSupportedSqlTypes();

      return astArray.every((astItem) => supportedTypes.includes(astItem.type));
    } catch {
      return false;
    }
  }

  /**
   * 获取SQL的详细信息
   * @param sql SQL语句
   * @returns 详细信息
   */
  protected getDetailedInfo(sql: string): {
    isValid: boolean;
    sqlType: string | null;
    canProcess: boolean;
    hasComments: boolean;
    cleanSql: string;
  } {
    const cleanSql = SqlParserUtils.removeAllComments(sql);
    const isValid = SqlParserUtils.isValidSql(cleanSql, this.getDatabase());
    const sqlType = SqlParserUtils.getSqlType(cleanSql, this.getDatabase());
    const canProcess = this.canProcess(sql);
    const hasComments = SqlParserUtils.extractAllComments(sql).length > 0;

    return {
      isValid,
      sqlType,
      canProcess,
      hasComments,
      cleanSql,
    };
  }

  /**
   * 子类可以重写此方法来自定义错误处理
   * @param error 错误对象
   * @param sql 原始SQL
   * @returns 是否应该重新抛出错误
   */
  protected handleError(error: any, sql: string): boolean {
    console.warn(
      'SQL处理出错:',
      ErrorUtils.getErrorMessage(error),
      'SQL:',
      sql.substring(0, 100),
    );
    return false; // 默认不重新抛出，子类可以重写
  }
}
