"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MySQLAdapter = void 0;
const base_adapter_1 = require("./base-adapter");
const enums_1 = require("../core/enums");
/**
 * MySQL Adapter
 * MySQL 是标准方言，不需要特殊适配
 */
class MySQLAdapter extends base_adapter_1.BaseDialectAdapter {
    /**
     * MySQL 支持的特性
     */
    static FEATURES = new Set([
        'CTE', // Common Table Expressions (WITH)
        'WINDOW_FUNCTIONS', // Window Functions (OVER)
        'SUBQUERY', // Subqueries
        'JOIN', // JOIN operations
        'UNION', // UNION / UNION ALL
        'UNION_ALL', // UNION ALL
        'INSERT_SELECT', // INSERT ... SELECT
        'MULTI_TABLE_DELETE', // Multi-table DELETE
        'MULTI_TABLE_UPDATE', // Multi-table UPDATE
        'REPLACE', // REPLACE statement
        'HANDLER', // HANDLER statement
        'OPTIMIZE', // OPTIMIZE TABLE
        'ANALYZE', // ANALYZE TABLE
        'CHECK', // CHECK TABLE
        'REPAIR', // REPAIR TABLE
        'SHOW', // SHOW commands
        'DESCRIBE', // DESCRIBE command
        'EXPLAIN', // EXPLAIN command
        'PREPARE', // PREPARE statement
        'EXECUTE', // EXECUTE statement
        'DEALLOCATE', // DEALLOCATE statement
        'TRANSACTION', // BEGIN, COMMIT, ROLLBACK
        'SAVEPOINT', // SAVEPOINT support
        'LOCK', // LOCK TABLES
        'UNLOCK', // UNLOCK TABLES
        'SET', // SET variable
        'GRANT', // GRANT
        'REVOKE', // REVOKE
        'CREATE_USER', // CREATE USER
        'DROP_USER', // DROP USER
        'ALTER_USER', // ALTER USER
        'CREATE_DATABASE', // CREATE DATABASE
        'DROP_DATABASE', // DROP DATABASE
        'ALTER_DATABASE', // ALTER DATABASE
        'CREATE_TABLE', // CREATE TABLE
        'DROP_TABLE', // DROP TABLE
        'ALTER_TABLE', // ALTER TABLE
        'CREATE_INDEX', // CREATE INDEX
        'DROP_INDEX', // DROP INDEX
        'CREATE_VIEW', // CREATE VIEW
        'DROP_VIEW', // DROP VIEW
        'ALTER_VIEW', // ALTER VIEW
        'CREATE_TRIGGER', // CREATE TRIGGER
        'DROP_TRIGGER', // DROP TRIGGER
        'CREATE_PROCEDURE', // CREATE PROCEDURE
        'DROP_PROCEDURE', // DROP PROCEDURE
        'CREATE_FUNCTION', // CREATE FUNCTION
        'DROP_FUNCTION', // DROP FUNCTION
    ]);
    /**
     * 获取方言类型
     */
    getDialect() {
        return enums_1.SQLDialect.MYSQL;
    }
    /**
     * 获取支持的特性
     */
    getSupportedFeatures() {
        return MySQLAdapter.FEATURES;
    }
    /**
     * MySQL AST 不需要转换，已经是标准格式
     */
    adaptAST(ast) {
        return ast;
    }
}
exports.MySQLAdapter = MySQLAdapter;
