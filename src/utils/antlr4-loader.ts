/**
 * ANTLR4 生成代码加载器
 * 统一处理动态加载 ANTLR4 生成代码的逻辑
 */

import * as path from 'path';
import * as fs from 'fs';
import { ParserError } from '../core/types';

/**
 * 加载结果
 */
export interface LoadResult<T> {
  /** 加载的模块 */
  module: T | null;
  /** 是否成功加载 */
  success: boolean;
  /** 错误信息（如果加载失败） */
  error?: Error;
  /** 加载路径 */
  loadedFrom?: string;
}

/**
 * ANTLR4 生成代码加载器
 * 提供统一的加载逻辑，支持多种加载路径和错误处理
 */
export class Antlr4Loader {
  /**
   * 加载 ANTLR4 生成的模块
   * @param moduleName 模块名称（不含路径和扩展名）
   * @param exportName 导出名称（默认与模块名相同）
   * @param options 加载选项
   * @returns 加载结果
   */
  static loadModule<T>(
    moduleName: string,
    exportName?: string,
    options: {
      /** 是否在加载失败时抛出异常（默认 true） */
      throwOnError?: boolean;
      /** 自定义日志函数（默认 console.error） */
      logger?: (msg: string, ...args: any[]) => void;
      /** 调用方路径（用于解析相对路径） */
      callerPath?: string;
    } = {}
  ): LoadResult<T> {
    const {
      throwOnError = true,
      logger = console.error,
      callerPath = __dirname,
    } = options;

    const actualExportName = exportName || moduleName;
    const result: LoadResult<T> = {
      module: null,
      success: false,
    };

    // 定义可能的加载路径
    const paths = this.getLoadPaths(callerPath, moduleName);

    // 尝试从每个路径加载
    for (const loadPath of paths) {
      try {
        const module = require(loadPath);
        const exported = module[actualExportName] || module.default?.[actualExportName];

        if (exported) {
          result.module = exported;
          result.success = true;
          result.loadedFrom = loadPath;
          return result;
        }
      } catch (e) {
        // 继续尝试下一个路径
        continue;
      }
    }

    // 所有路径都加载失败
    const error = new ParserError(
      `Failed to load ANTLR4 module '${moduleName}' (export '${actualExportName}'). ` +
        `Tried paths:\n  - ${paths.join('\n  - ')}\n` +
        `Make sure to run 'pnpm run generate:parser' to generate the parser files.`,
      ''
    );

    result.error = error;

    if (throwOnError) {
      throw error;
    }

    logger(`[ERROR] ${error.message}`);

    return result;
  }

  /**
   * 获取模块加载路径列表
   * @param callerPath 调用方路径
   * @param moduleName 模块名称
   * @returns 路径列表
   */
  private static getLoadPaths(callerPath: string, moduleName: string): string[] {
    const relativePath = path.join(callerPath, '../../../');
    const paths: string[] = [];

    // 1. 尝试从编译后的 lib 目录加载（生产环境）
    const libPath = path.join(relativePath, 'lib/generated/mysql');
    const libJsPath = path.join(libPath, `${moduleName}.js`);
    if (fs.existsSync(libJsPath)) {
      paths.push(libJsPath);
    }

    // 2. 尝试从源目录加载（开发环境）
    const genPath = path.join(relativePath, 'generated/mysql');
    const genTsPath = path.join(genPath, `${moduleName}.ts`);
    const genJsPath = path.join(genPath, `${moduleName}`);
    if (fs.existsSync(genTsPath) || fs.existsSync(genJsPath + '.js')) {
      paths.push(genJsPath);
    }

    // 3. 尝试直接导入（Node.js 模块解析）
    paths.push(`antlr4ng/src/${moduleName}`);

    return paths;
  }

  /**
   * 批量加载多个模块
   * @param modules 模块配置数组
   * @returns 加载结果映射
   */
  static loadModules<T extends Record<string, any>>(
    modules: Array<{ name: string; export?: string; key: string }>
  ): Record<string, LoadResult<any>> {
    const results: Record<string, LoadResult<any>> = {};

    for (const config of modules) {
      results[config.key] = this.loadModule(config.name, config.export, {
        throwOnError: false,
      });
    }

    return results;
  }

  /**
   * 验证必需的模块是否都已加载
   * @param results 加载结果映射
   * @param requiredKeys 必需的键列表
   * @returns 是否全部成功
   */
  static validateRequired(
    results: Record<string, LoadResult<any>>,
    requiredKeys: string[]
  ): boolean {
    for (const key of requiredKeys) {
      const result = results[key];
      if (!result || !result.success) {
        return false;
      }
    }
    return true;
  }
}
