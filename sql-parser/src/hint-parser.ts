import { HintInfo } from './types';
import { HintParseError } from './errors';

/**
 * Hint解析器
 * 负责从SQL注释中提取租户信息
 */
export class HintParser {
  // 匹配 /*& tenant:'xxx' */ 格式的hint
  private static readonly HINT_REGEX = /\/\*&\s*([^*]+)\s*\*\//g;
  // 匹配租户信息 tenant:'xxx' 或 tenant:"xxx"
  private static readonly TENANT_REGEX = /tenant\s*:\s*['"]([^'"]+)['"]/i;

  /**
   * 从SQL中提取hint信息
   * @param sql 原始SQL语句
   * @returns hint信息对象
   */
  static extractHint(sql: string): HintInfo {
    if (!sql || typeof sql !== 'string') {
      return {};
    }

    try {
      const hints = this.findAllHints(sql);

      if (hints.length === 0) {
        return {};
      }

      // 如果有多个hint，使用最后一个（按照SQL中出现的顺序）
      const lastHint = hints[hints.length - 1];
      const tenantMatch = this.TENANT_REGEX.exec(lastHint.content);

      if (!tenantMatch) {
        return { original: lastHint.original };
      }

      const tenant = tenantMatch[1].trim();
      if (!tenant) {
        throw new HintParseError('租户编码不能为空', sql);
      }

      return {
        tenant,
        original: lastHint.original,
      };
    } catch (error) {
      if (error instanceof HintParseError) {
        throw error;
      }
      throw new HintParseError(
        `解析hint时发生未知错误: ${error}`,
        sql,
        error as Error,
      );
    }
  }

  /**
   * 检查SQL是否包含hint
   * @param sql SQL语句
   * @returns 是否包含hint
   */
  static hasHint(sql: string): boolean {
    if (!sql || typeof sql !== 'string') {
      return false;
    }
    return this.HINT_REGEX.test(sql);
  }

  /**
   * 从SQL中移除所有hint注释
   * @param sql 原始SQL
   * @returns 移除hint后的SQL
   */
  static removeHints(sql: string): string {
    if (!sql || typeof sql !== 'string') {
      return sql;
    }
    return sql.replace(this.HINT_REGEX, '').trim();
  }

  /**
   * 从SQL中移除所有注释（包括hint和普通注释）
   * @param sql 原始SQL
   * @returns 移除注释后的SQL
   */
  static removeAllComments(sql: string): string {
    if (!sql || typeof sql !== 'string') {
      return sql;
    }

    // 移除多行注释 /* ... */
    let cleanSql = sql.replace(/\/\*[\s\S]*?\*\//g, '');

    // 移除单行注释 -- ...
    cleanSql = cleanSql.replace(/--.*$/gm, '');

    // 移除单行注释 # ...
    // cleanSql = cleanSql.replace(/#.*$/gm, '');

    return cleanSql.trim();
  }

  /**
   * 验证租户编码格式
   * @param tenant 租户编码
   * @returns 是否有效
   */
  static isValidTenant(tenant: string): boolean {
    if (!tenant || typeof tenant !== 'string') {
      return false;
    }

    // 租户编码应该只包含字母、数字、下划线和连字符
    const validPattern = /^[a-zA-Z0-9_-]+$/;
    return validPattern.test(tenant.trim()) && tenant.trim().length > 0;
  }

  /**
   * 查找SQL中的所有hint
   * @param sql SQL语句
   * @returns hint列表
   */
  private static findAllHints(
    sql: string,
  ): Array<{ original: string; content: string }> {
    const hints: Array<{ original: string; content: string }> = [];
    let match;

    // 重置正则表达式的lastIndex
    this.HINT_REGEX.lastIndex = 0;

    while ((match = this.HINT_REGEX.exec(sql)) !== null) {
      const original = match[0];
      const content = match[1];
      hints.push({ original, content });
    }

    return hints;
  }

  /**
   * 构建hint字符串
   * @param tenant 租户编码
   * @returns hint字符串
   */
  static buildHint(tenant: string): string {
    if (!this.isValidTenant(tenant)) {
      throw new Error(`无效的租户编码: ${tenant}`);
    }
    return `/*& tenant:'${tenant.trim()}' */`;
  }

  /**
   * 规范化hint格式
   * @param hintContent hint内容（不包括注释符号部分）
   * @returns 规范化后的hint
   */
  static normalizeHint(hintContent: string): string {
    const tenantMatch = this.TENANT_REGEX.exec(hintContent);
    if (!tenantMatch) {
      throw new Error('无效的hint格式');
    }

    const tenant = tenantMatch[1].trim();
    return this.buildHint(tenant);
  }
}
