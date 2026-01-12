import { SqlParserConfig } from '../core/types';
/**
 * 配置管理器
 * 负责配置的验证、合并和管理
 */
export declare class ConfigManager {
    private static DEFAULT_CONFIG;
    /**
     * 创建配置（与默认配置合并）
     */
    static createConfig(userConfig?: Partial<SqlParserConfig>): SqlParserConfig;
    /**
     * 合并配置
     */
    private static mergeConfigs;
    /**
     * 验证配置
     */
    static validateConfig(config: SqlParserConfig): void;
    /**
     * 获取默认配置
     */
    static getDefaultConfig(): SqlParserConfig;
}
