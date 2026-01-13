/**
 * 租户 ID 验证和转义工具
 */
export class TenantIdValidator {
  /**
   * 租户 ID 格式验证正则
   * 只允许字母、数字、下划线和连字符
   */
  private static readonly TENANT_ID_PATTERN = /^[a-zA-Z0-9_-]+$/;

  /**
   * 最大租户 ID 长度
   */
  private static readonly MAX_TENANT_ID_LENGTH = 128;

  /**
   * 验证租户 ID 格式
   * @param tenantId 租户 ID
   * @returns 是否有效
   */
  static isValid(tenantId: string): boolean {
    if (!tenantId || typeof tenantId !== 'string') {
      return false;
    }

    // 检查长度
    if (tenantId.length > this.MAX_TENANT_ID_LENGTH) {
      return false;
    }

    // 检查格式
    return this.TENANT_ID_PATTERN.test(tenantId);
  }

  /**
   * 验证租户 ID，如果不合法则抛出错误
   * @param tenantId 租户 ID
   * @throws {Error} 如果租户 ID 格式不合法
   */
  static validate(tenantId: string): void {
    if (!tenantId || typeof tenantId !== 'string') {
      throw new Error(
        'TenantId is required and must be a string'
      );
    }

    if (tenantId.length === 0) {
      throw new Error('TenantId cannot be empty');
    }

    if (tenantId.length > this.MAX_TENANT_ID_LENGTH) {
      throw new Error(
        `TenantId exceeds maximum length of ${this.MAX_TENANT_ID_LENGTH} characters`
      );
    }

    if (!this.TENANT_ID_PATTERN.test(tenantId)) {
      throw new Error(
        `TenantId contains invalid characters. ` +
        `Only alphanumeric characters, underscores and hyphens are allowed. ` +
        `Received: "${tenantId}"`
      );
    }
  }

  /**
   * 转义租户 ID 以便安全地嵌入 SQL 字符串字面量
   * 转义规则：
   * - 反斜杠 (\) -> 双反斜杠 (\\)
   * - 单引号 (') -> 反斜杠单引号 (\')
   * - 双引号 (") -> 反斜杠双引号 (\")
   * - 换行符 -> \n
   * - 回车符 -> \r
   * - 制表符 -> \t
   * - NULL 字符 -> \0
   *
   * 注意：这只能防御基本的 SQL 注入。对于生产环境，建议使用参数化查询。
   *
   * @param tenantId 租户 ID
   * @returns 转义后的租户 ID
   */
  static escapeForSql(tenantId: string): string {
    // 首先验证格式
    this.validate(tenantId);

    // 替换特殊字符
    return tenantId
      .replace(/\\/g, '\\\\')   // 反斜杠必须首先处理
      .replace(/'/g, "\\'")     // 单引号
      .replace(/"/g, '\\"')     // 双引号
      .replace(/\n/g, '\\n')    // 换行符
      .replace(/\r/g, '\\r')    // 回车符
      .replace(/\t/g, '\\t')    // 制表符
      .replace(/\0/g, '\\0');   // NULL 字符
  }

  /**
   * 获取安全的 SQL 字符串字面量
   * 返回带单引号包围的转义后租户 ID
   *
   * @param tenantId 租户 ID
   * @returns SQL 安全的字面量字符串，如 "'tenant_123'"
   */
  static toSqlLiteral(tenantId: string): string {
    const escaped = this.escapeForSql(tenantId);
    return `'${escaped}'`;
  }
}
