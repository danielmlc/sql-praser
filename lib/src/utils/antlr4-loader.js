"use strict";
/**
 * ANTLR4 生成代码加载器
 * 统一处理动态加载 ANTLR4 生成代码的逻辑
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Antlr4Loader = void 0;
const path = __importStar(require("path"));
const types_1 = require("../core/types");
/**
 * ANTLR4 生成代码加载器
 * 提供统一的加载逻辑，支持多种加载路径和错误处理
 */
class Antlr4Loader {
    /**
     * 加载 ANTLR4 生成的模块
     * @param moduleName 模块名称（不含路径和扩展名）
     * @param exportName 导出名称（默认与模块名相同）
     * @param options 加载选项
     * @returns 加载结果
     */
    static loadModule(moduleName, exportName, options = {}) {
        const { throwOnError = true, logger = console.error, callerPath = __dirname, } = options;
        const actualExportName = exportName || moduleName;
        const result = {
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
            }
            catch (e) {
                // 继续尝试下一个路径
                continue;
            }
        }
        // 所有路径都加载失败
        const error = new types_1.ParserError(`Failed to load ANTLR4 module '${moduleName}' (export '${actualExportName}'). ` +
            `Tried paths:\n  - ${paths.join('\n  - ')}\n` +
            `Make sure to run 'pnpm run generate:parser' to generate the parser files.`, '');
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
    static getLoadPaths(callerPath, moduleName) {
        const relativePath = path.join(callerPath, '../../../');
        // require() 调用本身已在 try/catch 中，无需 existsSync 预检（TOCTOU 反模式）
        return [
            // 1. 编译后的 lib 目录（生产环境）
            path.join(relativePath, 'lib/generated/mysql', `${moduleName}.js`),
            // 2. 源目录（开发环境，ts-node 场景）
            path.join(relativePath, 'generated/mysql', moduleName),
            // 3. Node.js 模块解析兜底
            `antlr4ng/src/${moduleName}`,
        ];
    }
    /**
     * 批量加载多个模块
     * @param modules 模块配置数组
     * @returns 加载结果映射
     */
    static loadModules(modules) {
        const results = {};
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
    static validateRequired(results, requiredKeys) {
        for (const key of requiredKeys) {
            const result = results[key];
            if (!result || !result.success) {
                return false;
            }
        }
        return true;
    }
}
exports.Antlr4Loader = Antlr4Loader;
