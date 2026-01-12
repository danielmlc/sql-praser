"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MySqlParserListener = void 0;
/**
 * This interface defines a complete listener for a parse tree produced by
 * `MySqlParser`.
 */
class MySqlParserListener {
    /**
     * Enter a parse tree produced by `MySqlParser.root`.
     * @param ctx the parse tree
     */
    enterRoot;
    /**
     * Exit a parse tree produced by `MySqlParser.root`.
     * @param ctx the parse tree
     */
    exitRoot;
    /**
     * Enter a parse tree produced by `MySqlParser.sqlStatements`.
     * @param ctx the parse tree
     */
    enterSqlStatements;
    /**
     * Exit a parse tree produced by `MySqlParser.sqlStatements`.
     * @param ctx the parse tree
     */
    exitSqlStatements;
    /**
     * Enter a parse tree produced by `MySqlParser.sqlStatement`.
     * @param ctx the parse tree
     */
    enterSqlStatement;
    /**
     * Exit a parse tree produced by `MySqlParser.sqlStatement`.
     * @param ctx the parse tree
     */
    exitSqlStatement;
    /**
     * Enter a parse tree produced by `MySqlParser.emptyStatement_`.
     * @param ctx the parse tree
     */
    enterEmptyStatement_;
    /**
     * Exit a parse tree produced by `MySqlParser.emptyStatement_`.
     * @param ctx the parse tree
     */
    exitEmptyStatement_;
    /**
     * Enter a parse tree produced by `MySqlParser.ddlStatement`.
     * @param ctx the parse tree
     */
    enterDdlStatement;
    /**
     * Exit a parse tree produced by `MySqlParser.ddlStatement`.
     * @param ctx the parse tree
     */
    exitDdlStatement;
    /**
     * Enter a parse tree produced by `MySqlParser.dmlStatement`.
     * @param ctx the parse tree
     */
    enterDmlStatement;
    /**
     * Exit a parse tree produced by `MySqlParser.dmlStatement`.
     * @param ctx the parse tree
     */
    exitDmlStatement;
    /**
     * Enter a parse tree produced by `MySqlParser.transactionStatement`.
     * @param ctx the parse tree
     */
    enterTransactionStatement;
    /**
     * Exit a parse tree produced by `MySqlParser.transactionStatement`.
     * @param ctx the parse tree
     */
    exitTransactionStatement;
    /**
     * Enter a parse tree produced by `MySqlParser.replicationStatement`.
     * @param ctx the parse tree
     */
    enterReplicationStatement;
    /**
     * Exit a parse tree produced by `MySqlParser.replicationStatement`.
     * @param ctx the parse tree
     */
    exitReplicationStatement;
    /**
     * Enter a parse tree produced by `MySqlParser.preparedStatement`.
     * @param ctx the parse tree
     */
    enterPreparedStatement;
    /**
     * Exit a parse tree produced by `MySqlParser.preparedStatement`.
     * @param ctx the parse tree
     */
    exitPreparedStatement;
    /**
     * Enter a parse tree produced by `MySqlParser.compoundStatement`.
     * @param ctx the parse tree
     */
    enterCompoundStatement;
    /**
     * Exit a parse tree produced by `MySqlParser.compoundStatement`.
     * @param ctx the parse tree
     */
    exitCompoundStatement;
    /**
     * Enter a parse tree produced by `MySqlParser.administrationStatement`.
     * @param ctx the parse tree
     */
    enterAdministrationStatement;
    /**
     * Exit a parse tree produced by `MySqlParser.administrationStatement`.
     * @param ctx the parse tree
     */
    exitAdministrationStatement;
    /**
     * Enter a parse tree produced by `MySqlParser.utilityStatement`.
     * @param ctx the parse tree
     */
    enterUtilityStatement;
    /**
     * Exit a parse tree produced by `MySqlParser.utilityStatement`.
     * @param ctx the parse tree
     */
    exitUtilityStatement;
    /**
     * Enter a parse tree produced by `MySqlParser.createDatabase`.
     * @param ctx the parse tree
     */
    enterCreateDatabase;
    /**
     * Exit a parse tree produced by `MySqlParser.createDatabase`.
     * @param ctx the parse tree
     */
    exitCreateDatabase;
    /**
     * Enter a parse tree produced by `MySqlParser.createEvent`.
     * @param ctx the parse tree
     */
    enterCreateEvent;
    /**
     * Exit a parse tree produced by `MySqlParser.createEvent`.
     * @param ctx the parse tree
     */
    exitCreateEvent;
    /**
     * Enter a parse tree produced by `MySqlParser.createIndex`.
     * @param ctx the parse tree
     */
    enterCreateIndex;
    /**
     * Exit a parse tree produced by `MySqlParser.createIndex`.
     * @param ctx the parse tree
     */
    exitCreateIndex;
    /**
     * Enter a parse tree produced by `MySqlParser.createLogfileGroup`.
     * @param ctx the parse tree
     */
    enterCreateLogfileGroup;
    /**
     * Exit a parse tree produced by `MySqlParser.createLogfileGroup`.
     * @param ctx the parse tree
     */
    exitCreateLogfileGroup;
    /**
     * Enter a parse tree produced by `MySqlParser.createProcedure`.
     * @param ctx the parse tree
     */
    enterCreateProcedure;
    /**
     * Exit a parse tree produced by `MySqlParser.createProcedure`.
     * @param ctx the parse tree
     */
    exitCreateProcedure;
    /**
     * Enter a parse tree produced by `MySqlParser.createFunction`.
     * @param ctx the parse tree
     */
    enterCreateFunction;
    /**
     * Exit a parse tree produced by `MySqlParser.createFunction`.
     * @param ctx the parse tree
     */
    exitCreateFunction;
    /**
     * Enter a parse tree produced by `MySqlParser.createRole`.
     * @param ctx the parse tree
     */
    enterCreateRole;
    /**
     * Exit a parse tree produced by `MySqlParser.createRole`.
     * @param ctx the parse tree
     */
    exitCreateRole;
    /**
     * Enter a parse tree produced by `MySqlParser.createServer`.
     * @param ctx the parse tree
     */
    enterCreateServer;
    /**
     * Exit a parse tree produced by `MySqlParser.createServer`.
     * @param ctx the parse tree
     */
    exitCreateServer;
    /**
     * Enter a parse tree produced by the `copyCreateTable`
     * labeled alternative in `MySqlParser.createTable`.
     * @param ctx the parse tree
     */
    enterCopyCreateTable;
    /**
     * Exit a parse tree produced by the `copyCreateTable`
     * labeled alternative in `MySqlParser.createTable`.
     * @param ctx the parse tree
     */
    exitCopyCreateTable;
    /**
     * Enter a parse tree produced by the `queryCreateTable`
     * labeled alternative in `MySqlParser.createTable`.
     * @param ctx the parse tree
     */
    enterQueryCreateTable;
    /**
     * Exit a parse tree produced by the `queryCreateTable`
     * labeled alternative in `MySqlParser.createTable`.
     * @param ctx the parse tree
     */
    exitQueryCreateTable;
    /**
     * Enter a parse tree produced by the `columnCreateTable`
     * labeled alternative in `MySqlParser.createTable`.
     * @param ctx the parse tree
     */
    enterColumnCreateTable;
    /**
     * Exit a parse tree produced by the `columnCreateTable`
     * labeled alternative in `MySqlParser.createTable`.
     * @param ctx the parse tree
     */
    exitColumnCreateTable;
    /**
     * Enter a parse tree produced by `MySqlParser.createTablespaceInnodb`.
     * @param ctx the parse tree
     */
    enterCreateTablespaceInnodb;
    /**
     * Exit a parse tree produced by `MySqlParser.createTablespaceInnodb`.
     * @param ctx the parse tree
     */
    exitCreateTablespaceInnodb;
    /**
     * Enter a parse tree produced by `MySqlParser.createTablespaceNdb`.
     * @param ctx the parse tree
     */
    enterCreateTablespaceNdb;
    /**
     * Exit a parse tree produced by `MySqlParser.createTablespaceNdb`.
     * @param ctx the parse tree
     */
    exitCreateTablespaceNdb;
    /**
     * Enter a parse tree produced by `MySqlParser.createTrigger`.
     * @param ctx the parse tree
     */
    enterCreateTrigger;
    /**
     * Exit a parse tree produced by `MySqlParser.createTrigger`.
     * @param ctx the parse tree
     */
    exitCreateTrigger;
    /**
     * Enter a parse tree produced by `MySqlParser.withClause`.
     * @param ctx the parse tree
     */
    enterWithClause;
    /**
     * Exit a parse tree produced by `MySqlParser.withClause`.
     * @param ctx the parse tree
     */
    exitWithClause;
    /**
     * Enter a parse tree produced by `MySqlParser.commonTableExpressions`.
     * @param ctx the parse tree
     */
    enterCommonTableExpressions;
    /**
     * Exit a parse tree produced by `MySqlParser.commonTableExpressions`.
     * @param ctx the parse tree
     */
    exitCommonTableExpressions;
    /**
     * Enter a parse tree produced by `MySqlParser.cteName`.
     * @param ctx the parse tree
     */
    enterCteName;
    /**
     * Exit a parse tree produced by `MySqlParser.cteName`.
     * @param ctx the parse tree
     */
    exitCteName;
    /**
     * Enter a parse tree produced by `MySqlParser.cteColumnName`.
     * @param ctx the parse tree
     */
    enterCteColumnName;
    /**
     * Exit a parse tree produced by `MySqlParser.cteColumnName`.
     * @param ctx the parse tree
     */
    exitCteColumnName;
    /**
     * Enter a parse tree produced by `MySqlParser.createView`.
     * @param ctx the parse tree
     */
    enterCreateView;
    /**
     * Exit a parse tree produced by `MySqlParser.createView`.
     * @param ctx the parse tree
     */
    exitCreateView;
    /**
     * Enter a parse tree produced by `MySqlParser.createDatabaseOption`.
     * @param ctx the parse tree
     */
    enterCreateDatabaseOption;
    /**
     * Exit a parse tree produced by `MySqlParser.createDatabaseOption`.
     * @param ctx the parse tree
     */
    exitCreateDatabaseOption;
    /**
     * Enter a parse tree produced by `MySqlParser.charSet`.
     * @param ctx the parse tree
     */
    enterCharSet;
    /**
     * Exit a parse tree produced by `MySqlParser.charSet`.
     * @param ctx the parse tree
     */
    exitCharSet;
    /**
     * Enter a parse tree produced by `MySqlParser.currentUserExpression`.
     * @param ctx the parse tree
     */
    enterCurrentUserExpression;
    /**
     * Exit a parse tree produced by `MySqlParser.currentUserExpression`.
     * @param ctx the parse tree
     */
    exitCurrentUserExpression;
    /**
     * Enter a parse tree produced by `MySqlParser.ownerStatement`.
     * @param ctx the parse tree
     */
    enterOwnerStatement;
    /**
     * Exit a parse tree produced by `MySqlParser.ownerStatement`.
     * @param ctx the parse tree
     */
    exitOwnerStatement;
    /**
     * Enter a parse tree produced by the `preciseSchedule`
     * labeled alternative in `MySqlParser.scheduleExpression`.
     * @param ctx the parse tree
     */
    enterPreciseSchedule;
    /**
     * Exit a parse tree produced by the `preciseSchedule`
     * labeled alternative in `MySqlParser.scheduleExpression`.
     * @param ctx the parse tree
     */
    exitPreciseSchedule;
    /**
     * Enter a parse tree produced by the `intervalSchedule`
     * labeled alternative in `MySqlParser.scheduleExpression`.
     * @param ctx the parse tree
     */
    enterIntervalSchedule;
    /**
     * Exit a parse tree produced by the `intervalSchedule`
     * labeled alternative in `MySqlParser.scheduleExpression`.
     * @param ctx the parse tree
     */
    exitIntervalSchedule;
    /**
     * Enter a parse tree produced by `MySqlParser.timestampValue`.
     * @param ctx the parse tree
     */
    enterTimestampValue;
    /**
     * Exit a parse tree produced by `MySqlParser.timestampValue`.
     * @param ctx the parse tree
     */
    exitTimestampValue;
    /**
     * Enter a parse tree produced by `MySqlParser.intervalExpr`.
     * @param ctx the parse tree
     */
    enterIntervalExpr;
    /**
     * Exit a parse tree produced by `MySqlParser.intervalExpr`.
     * @param ctx the parse tree
     */
    exitIntervalExpr;
    /**
     * Enter a parse tree produced by `MySqlParser.intervalType`.
     * @param ctx the parse tree
     */
    enterIntervalType;
    /**
     * Exit a parse tree produced by `MySqlParser.intervalType`.
     * @param ctx the parse tree
     */
    exitIntervalType;
    /**
     * Enter a parse tree produced by `MySqlParser.enableType`.
     * @param ctx the parse tree
     */
    enterEnableType;
    /**
     * Exit a parse tree produced by `MySqlParser.enableType`.
     * @param ctx the parse tree
     */
    exitEnableType;
    /**
     * Enter a parse tree produced by `MySqlParser.indexType`.
     * @param ctx the parse tree
     */
    enterIndexType;
    /**
     * Exit a parse tree produced by `MySqlParser.indexType`.
     * @param ctx the parse tree
     */
    exitIndexType;
    /**
     * Enter a parse tree produced by `MySqlParser.indexOption`.
     * @param ctx the parse tree
     */
    enterIndexOption;
    /**
     * Exit a parse tree produced by `MySqlParser.indexOption`.
     * @param ctx the parse tree
     */
    exitIndexOption;
    /**
     * Enter a parse tree produced by `MySqlParser.procedureParameter`.
     * @param ctx the parse tree
     */
    enterProcedureParameter;
    /**
     * Exit a parse tree produced by `MySqlParser.procedureParameter`.
     * @param ctx the parse tree
     */
    exitProcedureParameter;
    /**
     * Enter a parse tree produced by `MySqlParser.functionParameter`.
     * @param ctx the parse tree
     */
    enterFunctionParameter;
    /**
     * Exit a parse tree produced by `MySqlParser.functionParameter`.
     * @param ctx the parse tree
     */
    exitFunctionParameter;
    /**
     * Enter a parse tree produced by the `routineComment`
     * labeled alternative in `MySqlParser.routineOption`.
     * @param ctx the parse tree
     */
    enterRoutineComment;
    /**
     * Exit a parse tree produced by the `routineComment`
     * labeled alternative in `MySqlParser.routineOption`.
     * @param ctx the parse tree
     */
    exitRoutineComment;
    /**
     * Enter a parse tree produced by the `routineLanguage`
     * labeled alternative in `MySqlParser.routineOption`.
     * @param ctx the parse tree
     */
    enterRoutineLanguage;
    /**
     * Exit a parse tree produced by the `routineLanguage`
     * labeled alternative in `MySqlParser.routineOption`.
     * @param ctx the parse tree
     */
    exitRoutineLanguage;
    /**
     * Enter a parse tree produced by the `routineBehavior`
     * labeled alternative in `MySqlParser.routineOption`.
     * @param ctx the parse tree
     */
    enterRoutineBehavior;
    /**
     * Exit a parse tree produced by the `routineBehavior`
     * labeled alternative in `MySqlParser.routineOption`.
     * @param ctx the parse tree
     */
    exitRoutineBehavior;
    /**
     * Enter a parse tree produced by the `routineData`
     * labeled alternative in `MySqlParser.routineOption`.
     * @param ctx the parse tree
     */
    enterRoutineData;
    /**
     * Exit a parse tree produced by the `routineData`
     * labeled alternative in `MySqlParser.routineOption`.
     * @param ctx the parse tree
     */
    exitRoutineData;
    /**
     * Enter a parse tree produced by the `routineSecurity`
     * labeled alternative in `MySqlParser.routineOption`.
     * @param ctx the parse tree
     */
    enterRoutineSecurity;
    /**
     * Exit a parse tree produced by the `routineSecurity`
     * labeled alternative in `MySqlParser.routineOption`.
     * @param ctx the parse tree
     */
    exitRoutineSecurity;
    /**
     * Enter a parse tree produced by `MySqlParser.serverOption`.
     * @param ctx the parse tree
     */
    enterServerOption;
    /**
     * Exit a parse tree produced by `MySqlParser.serverOption`.
     * @param ctx the parse tree
     */
    exitServerOption;
    /**
     * Enter a parse tree produced by `MySqlParser.createDefinitions`.
     * @param ctx the parse tree
     */
    enterCreateDefinitions;
    /**
     * Exit a parse tree produced by `MySqlParser.createDefinitions`.
     * @param ctx the parse tree
     */
    exitCreateDefinitions;
    /**
     * Enter a parse tree produced by the `columnDeclaration`
     * labeled alternative in `MySqlParser.createDefinition`.
     * @param ctx the parse tree
     */
    enterColumnDeclaration;
    /**
     * Exit a parse tree produced by the `columnDeclaration`
     * labeled alternative in `MySqlParser.createDefinition`.
     * @param ctx the parse tree
     */
    exitColumnDeclaration;
    /**
     * Enter a parse tree produced by the `constraintDeclaration`
     * labeled alternative in `MySqlParser.createDefinition`.
     * @param ctx the parse tree
     */
    enterConstraintDeclaration;
    /**
     * Exit a parse tree produced by the `constraintDeclaration`
     * labeled alternative in `MySqlParser.createDefinition`.
     * @param ctx the parse tree
     */
    exitConstraintDeclaration;
    /**
     * Enter a parse tree produced by the `indexDeclaration`
     * labeled alternative in `MySqlParser.createDefinition`.
     * @param ctx the parse tree
     */
    enterIndexDeclaration;
    /**
     * Exit a parse tree produced by the `indexDeclaration`
     * labeled alternative in `MySqlParser.createDefinition`.
     * @param ctx the parse tree
     */
    exitIndexDeclaration;
    /**
     * Enter a parse tree produced by `MySqlParser.columnDefinition`.
     * @param ctx the parse tree
     */
    enterColumnDefinition;
    /**
     * Exit a parse tree produced by `MySqlParser.columnDefinition`.
     * @param ctx the parse tree
     */
    exitColumnDefinition;
    /**
     * Enter a parse tree produced by the `nullColumnConstraint`
     * labeled alternative in `MySqlParser.columnConstraint`.
     * @param ctx the parse tree
     */
    enterNullColumnConstraint;
    /**
     * Exit a parse tree produced by the `nullColumnConstraint`
     * labeled alternative in `MySqlParser.columnConstraint`.
     * @param ctx the parse tree
     */
    exitNullColumnConstraint;
    /**
     * Enter a parse tree produced by the `defaultColumnConstraint`
     * labeled alternative in `MySqlParser.columnConstraint`.
     * @param ctx the parse tree
     */
    enterDefaultColumnConstraint;
    /**
     * Exit a parse tree produced by the `defaultColumnConstraint`
     * labeled alternative in `MySqlParser.columnConstraint`.
     * @param ctx the parse tree
     */
    exitDefaultColumnConstraint;
    /**
     * Enter a parse tree produced by the `visibilityColumnConstraint`
     * labeled alternative in `MySqlParser.columnConstraint`.
     * @param ctx the parse tree
     */
    enterVisibilityColumnConstraint;
    /**
     * Exit a parse tree produced by the `visibilityColumnConstraint`
     * labeled alternative in `MySqlParser.columnConstraint`.
     * @param ctx the parse tree
     */
    exitVisibilityColumnConstraint;
    /**
     * Enter a parse tree produced by the `invisibilityColumnConstraint`
     * labeled alternative in `MySqlParser.columnConstraint`.
     * @param ctx the parse tree
     */
    enterInvisibilityColumnConstraint;
    /**
     * Exit a parse tree produced by the `invisibilityColumnConstraint`
     * labeled alternative in `MySqlParser.columnConstraint`.
     * @param ctx the parse tree
     */
    exitInvisibilityColumnConstraint;
    /**
     * Enter a parse tree produced by the `autoIncrementColumnConstraint`
     * labeled alternative in `MySqlParser.columnConstraint`.
     * @param ctx the parse tree
     */
    enterAutoIncrementColumnConstraint;
    /**
     * Exit a parse tree produced by the `autoIncrementColumnConstraint`
     * labeled alternative in `MySqlParser.columnConstraint`.
     * @param ctx the parse tree
     */
    exitAutoIncrementColumnConstraint;
    /**
     * Enter a parse tree produced by the `primaryKeyColumnConstraint`
     * labeled alternative in `MySqlParser.columnConstraint`.
     * @param ctx the parse tree
     */
    enterPrimaryKeyColumnConstraint;
    /**
     * Exit a parse tree produced by the `primaryKeyColumnConstraint`
     * labeled alternative in `MySqlParser.columnConstraint`.
     * @param ctx the parse tree
     */
    exitPrimaryKeyColumnConstraint;
    /**
     * Enter a parse tree produced by the `clusteringKeyColumnConstraint`
     * labeled alternative in `MySqlParser.columnConstraint`.
     * @param ctx the parse tree
     */
    enterClusteringKeyColumnConstraint;
    /**
     * Exit a parse tree produced by the `clusteringKeyColumnConstraint`
     * labeled alternative in `MySqlParser.columnConstraint`.
     * @param ctx the parse tree
     */
    exitClusteringKeyColumnConstraint;
    /**
     * Enter a parse tree produced by the `uniqueKeyColumnConstraint`
     * labeled alternative in `MySqlParser.columnConstraint`.
     * @param ctx the parse tree
     */
    enterUniqueKeyColumnConstraint;
    /**
     * Exit a parse tree produced by the `uniqueKeyColumnConstraint`
     * labeled alternative in `MySqlParser.columnConstraint`.
     * @param ctx the parse tree
     */
    exitUniqueKeyColumnConstraint;
    /**
     * Enter a parse tree produced by the `commentColumnConstraint`
     * labeled alternative in `MySqlParser.columnConstraint`.
     * @param ctx the parse tree
     */
    enterCommentColumnConstraint;
    /**
     * Exit a parse tree produced by the `commentColumnConstraint`
     * labeled alternative in `MySqlParser.columnConstraint`.
     * @param ctx the parse tree
     */
    exitCommentColumnConstraint;
    /**
     * Enter a parse tree produced by the `formatColumnConstraint`
     * labeled alternative in `MySqlParser.columnConstraint`.
     * @param ctx the parse tree
     */
    enterFormatColumnConstraint;
    /**
     * Exit a parse tree produced by the `formatColumnConstraint`
     * labeled alternative in `MySqlParser.columnConstraint`.
     * @param ctx the parse tree
     */
    exitFormatColumnConstraint;
    /**
     * Enter a parse tree produced by the `storageColumnConstraint`
     * labeled alternative in `MySqlParser.columnConstraint`.
     * @param ctx the parse tree
     */
    enterStorageColumnConstraint;
    /**
     * Exit a parse tree produced by the `storageColumnConstraint`
     * labeled alternative in `MySqlParser.columnConstraint`.
     * @param ctx the parse tree
     */
    exitStorageColumnConstraint;
    /**
     * Enter a parse tree produced by the `referenceColumnConstraint`
     * labeled alternative in `MySqlParser.columnConstraint`.
     * @param ctx the parse tree
     */
    enterReferenceColumnConstraint;
    /**
     * Exit a parse tree produced by the `referenceColumnConstraint`
     * labeled alternative in `MySqlParser.columnConstraint`.
     * @param ctx the parse tree
     */
    exitReferenceColumnConstraint;
    /**
     * Enter a parse tree produced by the `collateColumnConstraint`
     * labeled alternative in `MySqlParser.columnConstraint`.
     * @param ctx the parse tree
     */
    enterCollateColumnConstraint;
    /**
     * Exit a parse tree produced by the `collateColumnConstraint`
     * labeled alternative in `MySqlParser.columnConstraint`.
     * @param ctx the parse tree
     */
    exitCollateColumnConstraint;
    /**
     * Enter a parse tree produced by the `generatedColumnConstraint`
     * labeled alternative in `MySqlParser.columnConstraint`.
     * @param ctx the parse tree
     */
    enterGeneratedColumnConstraint;
    /**
     * Exit a parse tree produced by the `generatedColumnConstraint`
     * labeled alternative in `MySqlParser.columnConstraint`.
     * @param ctx the parse tree
     */
    exitGeneratedColumnConstraint;
    /**
     * Enter a parse tree produced by the `serialDefaultColumnConstraint`
     * labeled alternative in `MySqlParser.columnConstraint`.
     * @param ctx the parse tree
     */
    enterSerialDefaultColumnConstraint;
    /**
     * Exit a parse tree produced by the `serialDefaultColumnConstraint`
     * labeled alternative in `MySqlParser.columnConstraint`.
     * @param ctx the parse tree
     */
    exitSerialDefaultColumnConstraint;
    /**
     * Enter a parse tree produced by the `checkColumnConstraint`
     * labeled alternative in `MySqlParser.columnConstraint`.
     * @param ctx the parse tree
     */
    enterCheckColumnConstraint;
    /**
     * Exit a parse tree produced by the `checkColumnConstraint`
     * labeled alternative in `MySqlParser.columnConstraint`.
     * @param ctx the parse tree
     */
    exitCheckColumnConstraint;
    /**
     * Enter a parse tree produced by the `primaryKeyTableConstraint`
     * labeled alternative in `MySqlParser.tableConstraint`.
     * @param ctx the parse tree
     */
    enterPrimaryKeyTableConstraint;
    /**
     * Exit a parse tree produced by the `primaryKeyTableConstraint`
     * labeled alternative in `MySqlParser.tableConstraint`.
     * @param ctx the parse tree
     */
    exitPrimaryKeyTableConstraint;
    /**
     * Enter a parse tree produced by the `uniqueKeyTableConstraint`
     * labeled alternative in `MySqlParser.tableConstraint`.
     * @param ctx the parse tree
     */
    enterUniqueKeyTableConstraint;
    /**
     * Exit a parse tree produced by the `uniqueKeyTableConstraint`
     * labeled alternative in `MySqlParser.tableConstraint`.
     * @param ctx the parse tree
     */
    exitUniqueKeyTableConstraint;
    /**
     * Enter a parse tree produced by the `foreignKeyTableConstraint`
     * labeled alternative in `MySqlParser.tableConstraint`.
     * @param ctx the parse tree
     */
    enterForeignKeyTableConstraint;
    /**
     * Exit a parse tree produced by the `foreignKeyTableConstraint`
     * labeled alternative in `MySqlParser.tableConstraint`.
     * @param ctx the parse tree
     */
    exitForeignKeyTableConstraint;
    /**
     * Enter a parse tree produced by the `checkTableConstraint`
     * labeled alternative in `MySqlParser.tableConstraint`.
     * @param ctx the parse tree
     */
    enterCheckTableConstraint;
    /**
     * Exit a parse tree produced by the `checkTableConstraint`
     * labeled alternative in `MySqlParser.tableConstraint`.
     * @param ctx the parse tree
     */
    exitCheckTableConstraint;
    /**
     * Enter a parse tree produced by the `clusteringKeyTableConstraint`
     * labeled alternative in `MySqlParser.tableConstraint`.
     * @param ctx the parse tree
     */
    enterClusteringKeyTableConstraint;
    /**
     * Exit a parse tree produced by the `clusteringKeyTableConstraint`
     * labeled alternative in `MySqlParser.tableConstraint`.
     * @param ctx the parse tree
     */
    exitClusteringKeyTableConstraint;
    /**
     * Enter a parse tree produced by `MySqlParser.referenceDefinition`.
     * @param ctx the parse tree
     */
    enterReferenceDefinition;
    /**
     * Exit a parse tree produced by `MySqlParser.referenceDefinition`.
     * @param ctx the parse tree
     */
    exitReferenceDefinition;
    /**
     * Enter a parse tree produced by `MySqlParser.referenceAction`.
     * @param ctx the parse tree
     */
    enterReferenceAction;
    /**
     * Exit a parse tree produced by `MySqlParser.referenceAction`.
     * @param ctx the parse tree
     */
    exitReferenceAction;
    /**
     * Enter a parse tree produced by `MySqlParser.referenceControlType`.
     * @param ctx the parse tree
     */
    enterReferenceControlType;
    /**
     * Exit a parse tree produced by `MySqlParser.referenceControlType`.
     * @param ctx the parse tree
     */
    exitReferenceControlType;
    /**
     * Enter a parse tree produced by the `simpleIndexDeclaration`
     * labeled alternative in `MySqlParser.indexColumnDefinition`.
     * @param ctx the parse tree
     */
    enterSimpleIndexDeclaration;
    /**
     * Exit a parse tree produced by the `simpleIndexDeclaration`
     * labeled alternative in `MySqlParser.indexColumnDefinition`.
     * @param ctx the parse tree
     */
    exitSimpleIndexDeclaration;
    /**
     * Enter a parse tree produced by the `specialIndexDeclaration`
     * labeled alternative in `MySqlParser.indexColumnDefinition`.
     * @param ctx the parse tree
     */
    enterSpecialIndexDeclaration;
    /**
     * Exit a parse tree produced by the `specialIndexDeclaration`
     * labeled alternative in `MySqlParser.indexColumnDefinition`.
     * @param ctx the parse tree
     */
    exitSpecialIndexDeclaration;
    /**
     * Enter a parse tree produced by the `tableOptionEngine`
     * labeled alternative in `MySqlParser.tableOption`.
     * @param ctx the parse tree
     */
    enterTableOptionEngine;
    /**
     * Exit a parse tree produced by the `tableOptionEngine`
     * labeled alternative in `MySqlParser.tableOption`.
     * @param ctx the parse tree
     */
    exitTableOptionEngine;
    /**
     * Enter a parse tree produced by the `tableOptionEngineAttribute`
     * labeled alternative in `MySqlParser.tableOption`.
     * @param ctx the parse tree
     */
    enterTableOptionEngineAttribute;
    /**
     * Exit a parse tree produced by the `tableOptionEngineAttribute`
     * labeled alternative in `MySqlParser.tableOption`.
     * @param ctx the parse tree
     */
    exitTableOptionEngineAttribute;
    /**
     * Enter a parse tree produced by the `tableOptionAutoextendSize`
     * labeled alternative in `MySqlParser.tableOption`.
     * @param ctx the parse tree
     */
    enterTableOptionAutoextendSize;
    /**
     * Exit a parse tree produced by the `tableOptionAutoextendSize`
     * labeled alternative in `MySqlParser.tableOption`.
     * @param ctx the parse tree
     */
    exitTableOptionAutoextendSize;
    /**
     * Enter a parse tree produced by the `tableOptionAutoIncrement`
     * labeled alternative in `MySqlParser.tableOption`.
     * @param ctx the parse tree
     */
    enterTableOptionAutoIncrement;
    /**
     * Exit a parse tree produced by the `tableOptionAutoIncrement`
     * labeled alternative in `MySqlParser.tableOption`.
     * @param ctx the parse tree
     */
    exitTableOptionAutoIncrement;
    /**
     * Enter a parse tree produced by the `tableOptionAverage`
     * labeled alternative in `MySqlParser.tableOption`.
     * @param ctx the parse tree
     */
    enterTableOptionAverage;
    /**
     * Exit a parse tree produced by the `tableOptionAverage`
     * labeled alternative in `MySqlParser.tableOption`.
     * @param ctx the parse tree
     */
    exitTableOptionAverage;
    /**
     * Enter a parse tree produced by the `tableOptionCharset`
     * labeled alternative in `MySqlParser.tableOption`.
     * @param ctx the parse tree
     */
    enterTableOptionCharset;
    /**
     * Exit a parse tree produced by the `tableOptionCharset`
     * labeled alternative in `MySqlParser.tableOption`.
     * @param ctx the parse tree
     */
    exitTableOptionCharset;
    /**
     * Enter a parse tree produced by the `tableOptionChecksum`
     * labeled alternative in `MySqlParser.tableOption`.
     * @param ctx the parse tree
     */
    enterTableOptionChecksum;
    /**
     * Exit a parse tree produced by the `tableOptionChecksum`
     * labeled alternative in `MySqlParser.tableOption`.
     * @param ctx the parse tree
     */
    exitTableOptionChecksum;
    /**
     * Enter a parse tree produced by the `tableOptionCollate`
     * labeled alternative in `MySqlParser.tableOption`.
     * @param ctx the parse tree
     */
    enterTableOptionCollate;
    /**
     * Exit a parse tree produced by the `tableOptionCollate`
     * labeled alternative in `MySqlParser.tableOption`.
     * @param ctx the parse tree
     */
    exitTableOptionCollate;
    /**
     * Enter a parse tree produced by the `tableOptionComment`
     * labeled alternative in `MySqlParser.tableOption`.
     * @param ctx the parse tree
     */
    enterTableOptionComment;
    /**
     * Exit a parse tree produced by the `tableOptionComment`
     * labeled alternative in `MySqlParser.tableOption`.
     * @param ctx the parse tree
     */
    exitTableOptionComment;
    /**
     * Enter a parse tree produced by the `tableOptionCompression`
     * labeled alternative in `MySqlParser.tableOption`.
     * @param ctx the parse tree
     */
    enterTableOptionCompression;
    /**
     * Exit a parse tree produced by the `tableOptionCompression`
     * labeled alternative in `MySqlParser.tableOption`.
     * @param ctx the parse tree
     */
    exitTableOptionCompression;
    /**
     * Enter a parse tree produced by the `tableOptionConnection`
     * labeled alternative in `MySqlParser.tableOption`.
     * @param ctx the parse tree
     */
    enterTableOptionConnection;
    /**
     * Exit a parse tree produced by the `tableOptionConnection`
     * labeled alternative in `MySqlParser.tableOption`.
     * @param ctx the parse tree
     */
    exitTableOptionConnection;
    /**
     * Enter a parse tree produced by the `tableOptionDataDirectory`
     * labeled alternative in `MySqlParser.tableOption`.
     * @param ctx the parse tree
     */
    enterTableOptionDataDirectory;
    /**
     * Exit a parse tree produced by the `tableOptionDataDirectory`
     * labeled alternative in `MySqlParser.tableOption`.
     * @param ctx the parse tree
     */
    exitTableOptionDataDirectory;
    /**
     * Enter a parse tree produced by the `tableOptionDelay`
     * labeled alternative in `MySqlParser.tableOption`.
     * @param ctx the parse tree
     */
    enterTableOptionDelay;
    /**
     * Exit a parse tree produced by the `tableOptionDelay`
     * labeled alternative in `MySqlParser.tableOption`.
     * @param ctx the parse tree
     */
    exitTableOptionDelay;
    /**
     * Enter a parse tree produced by the `tableOptionEncryption`
     * labeled alternative in `MySqlParser.tableOption`.
     * @param ctx the parse tree
     */
    enterTableOptionEncryption;
    /**
     * Exit a parse tree produced by the `tableOptionEncryption`
     * labeled alternative in `MySqlParser.tableOption`.
     * @param ctx the parse tree
     */
    exitTableOptionEncryption;
    /**
     * Enter a parse tree produced by the `tableOptionPageCompressed`
     * labeled alternative in `MySqlParser.tableOption`.
     * @param ctx the parse tree
     */
    enterTableOptionPageCompressed;
    /**
     * Exit a parse tree produced by the `tableOptionPageCompressed`
     * labeled alternative in `MySqlParser.tableOption`.
     * @param ctx the parse tree
     */
    exitTableOptionPageCompressed;
    /**
     * Enter a parse tree produced by the `tableOptionPageCompressionLevel`
     * labeled alternative in `MySqlParser.tableOption`.
     * @param ctx the parse tree
     */
    enterTableOptionPageCompressionLevel;
    /**
     * Exit a parse tree produced by the `tableOptionPageCompressionLevel`
     * labeled alternative in `MySqlParser.tableOption`.
     * @param ctx the parse tree
     */
    exitTableOptionPageCompressionLevel;
    /**
     * Enter a parse tree produced by the `tableOptionEncryptionKeyId`
     * labeled alternative in `MySqlParser.tableOption`.
     * @param ctx the parse tree
     */
    enterTableOptionEncryptionKeyId;
    /**
     * Exit a parse tree produced by the `tableOptionEncryptionKeyId`
     * labeled alternative in `MySqlParser.tableOption`.
     * @param ctx the parse tree
     */
    exitTableOptionEncryptionKeyId;
    /**
     * Enter a parse tree produced by the `tableOptionIndexDirectory`
     * labeled alternative in `MySqlParser.tableOption`.
     * @param ctx the parse tree
     */
    enterTableOptionIndexDirectory;
    /**
     * Exit a parse tree produced by the `tableOptionIndexDirectory`
     * labeled alternative in `MySqlParser.tableOption`.
     * @param ctx the parse tree
     */
    exitTableOptionIndexDirectory;
    /**
     * Enter a parse tree produced by the `tableOptionInsertMethod`
     * labeled alternative in `MySqlParser.tableOption`.
     * @param ctx the parse tree
     */
    enterTableOptionInsertMethod;
    /**
     * Exit a parse tree produced by the `tableOptionInsertMethod`
     * labeled alternative in `MySqlParser.tableOption`.
     * @param ctx the parse tree
     */
    exitTableOptionInsertMethod;
    /**
     * Enter a parse tree produced by the `tableOptionKeyBlockSize`
     * labeled alternative in `MySqlParser.tableOption`.
     * @param ctx the parse tree
     */
    enterTableOptionKeyBlockSize;
    /**
     * Exit a parse tree produced by the `tableOptionKeyBlockSize`
     * labeled alternative in `MySqlParser.tableOption`.
     * @param ctx the parse tree
     */
    exitTableOptionKeyBlockSize;
    /**
     * Enter a parse tree produced by the `tableOptionMaxRows`
     * labeled alternative in `MySqlParser.tableOption`.
     * @param ctx the parse tree
     */
    enterTableOptionMaxRows;
    /**
     * Exit a parse tree produced by the `tableOptionMaxRows`
     * labeled alternative in `MySqlParser.tableOption`.
     * @param ctx the parse tree
     */
    exitTableOptionMaxRows;
    /**
     * Enter a parse tree produced by the `tableOptionMinRows`
     * labeled alternative in `MySqlParser.tableOption`.
     * @param ctx the parse tree
     */
    enterTableOptionMinRows;
    /**
     * Exit a parse tree produced by the `tableOptionMinRows`
     * labeled alternative in `MySqlParser.tableOption`.
     * @param ctx the parse tree
     */
    exitTableOptionMinRows;
    /**
     * Enter a parse tree produced by the `tableOptionPackKeys`
     * labeled alternative in `MySqlParser.tableOption`.
     * @param ctx the parse tree
     */
    enterTableOptionPackKeys;
    /**
     * Exit a parse tree produced by the `tableOptionPackKeys`
     * labeled alternative in `MySqlParser.tableOption`.
     * @param ctx the parse tree
     */
    exitTableOptionPackKeys;
    /**
     * Enter a parse tree produced by the `tableOptionPassword`
     * labeled alternative in `MySqlParser.tableOption`.
     * @param ctx the parse tree
     */
    enterTableOptionPassword;
    /**
     * Exit a parse tree produced by the `tableOptionPassword`
     * labeled alternative in `MySqlParser.tableOption`.
     * @param ctx the parse tree
     */
    exitTableOptionPassword;
    /**
     * Enter a parse tree produced by the `tableOptionRowFormat`
     * labeled alternative in `MySqlParser.tableOption`.
     * @param ctx the parse tree
     */
    enterTableOptionRowFormat;
    /**
     * Exit a parse tree produced by the `tableOptionRowFormat`
     * labeled alternative in `MySqlParser.tableOption`.
     * @param ctx the parse tree
     */
    exitTableOptionRowFormat;
    /**
     * Enter a parse tree produced by the `tableOptionStartTransaction`
     * labeled alternative in `MySqlParser.tableOption`.
     * @param ctx the parse tree
     */
    enterTableOptionStartTransaction;
    /**
     * Exit a parse tree produced by the `tableOptionStartTransaction`
     * labeled alternative in `MySqlParser.tableOption`.
     * @param ctx the parse tree
     */
    exitTableOptionStartTransaction;
    /**
     * Enter a parse tree produced by the `tableOptionSecondaryEngine`
     * labeled alternative in `MySqlParser.tableOption`.
     * @param ctx the parse tree
     */
    enterTableOptionSecondaryEngine;
    /**
     * Exit a parse tree produced by the `tableOptionSecondaryEngine`
     * labeled alternative in `MySqlParser.tableOption`.
     * @param ctx the parse tree
     */
    exitTableOptionSecondaryEngine;
    /**
     * Enter a parse tree produced by the `tableOptionSecondaryEngineAttribute`
     * labeled alternative in `MySqlParser.tableOption`.
     * @param ctx the parse tree
     */
    enterTableOptionSecondaryEngineAttribute;
    /**
     * Exit a parse tree produced by the `tableOptionSecondaryEngineAttribute`
     * labeled alternative in `MySqlParser.tableOption`.
     * @param ctx the parse tree
     */
    exitTableOptionSecondaryEngineAttribute;
    /**
     * Enter a parse tree produced by the `tableOptionRecalculation`
     * labeled alternative in `MySqlParser.tableOption`.
     * @param ctx the parse tree
     */
    enterTableOptionRecalculation;
    /**
     * Exit a parse tree produced by the `tableOptionRecalculation`
     * labeled alternative in `MySqlParser.tableOption`.
     * @param ctx the parse tree
     */
    exitTableOptionRecalculation;
    /**
     * Enter a parse tree produced by the `tableOptionPersistent`
     * labeled alternative in `MySqlParser.tableOption`.
     * @param ctx the parse tree
     */
    enterTableOptionPersistent;
    /**
     * Exit a parse tree produced by the `tableOptionPersistent`
     * labeled alternative in `MySqlParser.tableOption`.
     * @param ctx the parse tree
     */
    exitTableOptionPersistent;
    /**
     * Enter a parse tree produced by the `tableOptionSamplePage`
     * labeled alternative in `MySqlParser.tableOption`.
     * @param ctx the parse tree
     */
    enterTableOptionSamplePage;
    /**
     * Exit a parse tree produced by the `tableOptionSamplePage`
     * labeled alternative in `MySqlParser.tableOption`.
     * @param ctx the parse tree
     */
    exitTableOptionSamplePage;
    /**
     * Enter a parse tree produced by the `tableOptionTablespace`
     * labeled alternative in `MySqlParser.tableOption`.
     * @param ctx the parse tree
     */
    enterTableOptionTablespace;
    /**
     * Exit a parse tree produced by the `tableOptionTablespace`
     * labeled alternative in `MySqlParser.tableOption`.
     * @param ctx the parse tree
     */
    exitTableOptionTablespace;
    /**
     * Enter a parse tree produced by the `tableOptionTableType`
     * labeled alternative in `MySqlParser.tableOption`.
     * @param ctx the parse tree
     */
    enterTableOptionTableType;
    /**
     * Exit a parse tree produced by the `tableOptionTableType`
     * labeled alternative in `MySqlParser.tableOption`.
     * @param ctx the parse tree
     */
    exitTableOptionTableType;
    /**
     * Enter a parse tree produced by the `tableOptionTransactional`
     * labeled alternative in `MySqlParser.tableOption`.
     * @param ctx the parse tree
     */
    enterTableOptionTransactional;
    /**
     * Exit a parse tree produced by the `tableOptionTransactional`
     * labeled alternative in `MySqlParser.tableOption`.
     * @param ctx the parse tree
     */
    exitTableOptionTransactional;
    /**
     * Enter a parse tree produced by the `tableOptionUnion`
     * labeled alternative in `MySqlParser.tableOption`.
     * @param ctx the parse tree
     */
    enterTableOptionUnion;
    /**
     * Exit a parse tree produced by the `tableOptionUnion`
     * labeled alternative in `MySqlParser.tableOption`.
     * @param ctx the parse tree
     */
    exitTableOptionUnion;
    /**
     * Enter a parse tree produced by `MySqlParser.tableType`.
     * @param ctx the parse tree
     */
    enterTableType;
    /**
     * Exit a parse tree produced by `MySqlParser.tableType`.
     * @param ctx the parse tree
     */
    exitTableType;
    /**
     * Enter a parse tree produced by `MySqlParser.tablespaceStorage`.
     * @param ctx the parse tree
     */
    enterTablespaceStorage;
    /**
     * Exit a parse tree produced by `MySqlParser.tablespaceStorage`.
     * @param ctx the parse tree
     */
    exitTablespaceStorage;
    /**
     * Enter a parse tree produced by `MySqlParser.partitionDefinitions`.
     * @param ctx the parse tree
     */
    enterPartitionDefinitions;
    /**
     * Exit a parse tree produced by `MySqlParser.partitionDefinitions`.
     * @param ctx the parse tree
     */
    exitPartitionDefinitions;
    /**
     * Enter a parse tree produced by the `partitionFunctionHash`
     * labeled alternative in `MySqlParser.partitionFunctionDefinition`.
     * @param ctx the parse tree
     */
    enterPartitionFunctionHash;
    /**
     * Exit a parse tree produced by the `partitionFunctionHash`
     * labeled alternative in `MySqlParser.partitionFunctionDefinition`.
     * @param ctx the parse tree
     */
    exitPartitionFunctionHash;
    /**
     * Enter a parse tree produced by the `partitionFunctionKey`
     * labeled alternative in `MySqlParser.partitionFunctionDefinition`.
     * @param ctx the parse tree
     */
    enterPartitionFunctionKey;
    /**
     * Exit a parse tree produced by the `partitionFunctionKey`
     * labeled alternative in `MySqlParser.partitionFunctionDefinition`.
     * @param ctx the parse tree
     */
    exitPartitionFunctionKey;
    /**
     * Enter a parse tree produced by the `partitionFunctionRange`
     * labeled alternative in `MySqlParser.partitionFunctionDefinition`.
     * @param ctx the parse tree
     */
    enterPartitionFunctionRange;
    /**
     * Exit a parse tree produced by the `partitionFunctionRange`
     * labeled alternative in `MySqlParser.partitionFunctionDefinition`.
     * @param ctx the parse tree
     */
    exitPartitionFunctionRange;
    /**
     * Enter a parse tree produced by the `partitionFunctionList`
     * labeled alternative in `MySqlParser.partitionFunctionDefinition`.
     * @param ctx the parse tree
     */
    enterPartitionFunctionList;
    /**
     * Exit a parse tree produced by the `partitionFunctionList`
     * labeled alternative in `MySqlParser.partitionFunctionDefinition`.
     * @param ctx the parse tree
     */
    exitPartitionFunctionList;
    /**
     * Enter a parse tree produced by the `subPartitionFunctionHash`
     * labeled alternative in `MySqlParser.subpartitionFunctionDefinition`.
     * @param ctx the parse tree
     */
    enterSubPartitionFunctionHash;
    /**
     * Exit a parse tree produced by the `subPartitionFunctionHash`
     * labeled alternative in `MySqlParser.subpartitionFunctionDefinition`.
     * @param ctx the parse tree
     */
    exitSubPartitionFunctionHash;
    /**
     * Enter a parse tree produced by the `subPartitionFunctionKey`
     * labeled alternative in `MySqlParser.subpartitionFunctionDefinition`.
     * @param ctx the parse tree
     */
    enterSubPartitionFunctionKey;
    /**
     * Exit a parse tree produced by the `subPartitionFunctionKey`
     * labeled alternative in `MySqlParser.subpartitionFunctionDefinition`.
     * @param ctx the parse tree
     */
    exitSubPartitionFunctionKey;
    /**
     * Enter a parse tree produced by the `partitionComparison`
     * labeled alternative in `MySqlParser.partitionDefinition`.
     * @param ctx the parse tree
     */
    enterPartitionComparison;
    /**
     * Exit a parse tree produced by the `partitionComparison`
     * labeled alternative in `MySqlParser.partitionDefinition`.
     * @param ctx the parse tree
     */
    exitPartitionComparison;
    /**
     * Enter a parse tree produced by the `partitionListAtom`
     * labeled alternative in `MySqlParser.partitionDefinition`.
     * @param ctx the parse tree
     */
    enterPartitionListAtom;
    /**
     * Exit a parse tree produced by the `partitionListAtom`
     * labeled alternative in `MySqlParser.partitionDefinition`.
     * @param ctx the parse tree
     */
    exitPartitionListAtom;
    /**
     * Enter a parse tree produced by the `partitionListVector`
     * labeled alternative in `MySqlParser.partitionDefinition`.
     * @param ctx the parse tree
     */
    enterPartitionListVector;
    /**
     * Exit a parse tree produced by the `partitionListVector`
     * labeled alternative in `MySqlParser.partitionDefinition`.
     * @param ctx the parse tree
     */
    exitPartitionListVector;
    /**
     * Enter a parse tree produced by the `partitionSimple`
     * labeled alternative in `MySqlParser.partitionDefinition`.
     * @param ctx the parse tree
     */
    enterPartitionSimple;
    /**
     * Exit a parse tree produced by the `partitionSimple`
     * labeled alternative in `MySqlParser.partitionDefinition`.
     * @param ctx the parse tree
     */
    exitPartitionSimple;
    /**
     * Enter a parse tree produced by `MySqlParser.partitionDefinerAtom`.
     * @param ctx the parse tree
     */
    enterPartitionDefinerAtom;
    /**
     * Exit a parse tree produced by `MySqlParser.partitionDefinerAtom`.
     * @param ctx the parse tree
     */
    exitPartitionDefinerAtom;
    /**
     * Enter a parse tree produced by `MySqlParser.partitionDefinerVector`.
     * @param ctx the parse tree
     */
    enterPartitionDefinerVector;
    /**
     * Exit a parse tree produced by `MySqlParser.partitionDefinerVector`.
     * @param ctx the parse tree
     */
    exitPartitionDefinerVector;
    /**
     * Enter a parse tree produced by `MySqlParser.subpartitionDefinition`.
     * @param ctx the parse tree
     */
    enterSubpartitionDefinition;
    /**
     * Exit a parse tree produced by `MySqlParser.subpartitionDefinition`.
     * @param ctx the parse tree
     */
    exitSubpartitionDefinition;
    /**
     * Enter a parse tree produced by the `partitionOptionEngine`
     * labeled alternative in `MySqlParser.partitionOption`.
     * @param ctx the parse tree
     */
    enterPartitionOptionEngine;
    /**
     * Exit a parse tree produced by the `partitionOptionEngine`
     * labeled alternative in `MySqlParser.partitionOption`.
     * @param ctx the parse tree
     */
    exitPartitionOptionEngine;
    /**
     * Enter a parse tree produced by the `partitionOptionComment`
     * labeled alternative in `MySqlParser.partitionOption`.
     * @param ctx the parse tree
     */
    enterPartitionOptionComment;
    /**
     * Exit a parse tree produced by the `partitionOptionComment`
     * labeled alternative in `MySqlParser.partitionOption`.
     * @param ctx the parse tree
     */
    exitPartitionOptionComment;
    /**
     * Enter a parse tree produced by the `partitionOptionDataDirectory`
     * labeled alternative in `MySqlParser.partitionOption`.
     * @param ctx the parse tree
     */
    enterPartitionOptionDataDirectory;
    /**
     * Exit a parse tree produced by the `partitionOptionDataDirectory`
     * labeled alternative in `MySqlParser.partitionOption`.
     * @param ctx the parse tree
     */
    exitPartitionOptionDataDirectory;
    /**
     * Enter a parse tree produced by the `partitionOptionIndexDirectory`
     * labeled alternative in `MySqlParser.partitionOption`.
     * @param ctx the parse tree
     */
    enterPartitionOptionIndexDirectory;
    /**
     * Exit a parse tree produced by the `partitionOptionIndexDirectory`
     * labeled alternative in `MySqlParser.partitionOption`.
     * @param ctx the parse tree
     */
    exitPartitionOptionIndexDirectory;
    /**
     * Enter a parse tree produced by the `partitionOptionMaxRows`
     * labeled alternative in `MySqlParser.partitionOption`.
     * @param ctx the parse tree
     */
    enterPartitionOptionMaxRows;
    /**
     * Exit a parse tree produced by the `partitionOptionMaxRows`
     * labeled alternative in `MySqlParser.partitionOption`.
     * @param ctx the parse tree
     */
    exitPartitionOptionMaxRows;
    /**
     * Enter a parse tree produced by the `partitionOptionMinRows`
     * labeled alternative in `MySqlParser.partitionOption`.
     * @param ctx the parse tree
     */
    enterPartitionOptionMinRows;
    /**
     * Exit a parse tree produced by the `partitionOptionMinRows`
     * labeled alternative in `MySqlParser.partitionOption`.
     * @param ctx the parse tree
     */
    exitPartitionOptionMinRows;
    /**
     * Enter a parse tree produced by the `partitionOptionTablespace`
     * labeled alternative in `MySqlParser.partitionOption`.
     * @param ctx the parse tree
     */
    enterPartitionOptionTablespace;
    /**
     * Exit a parse tree produced by the `partitionOptionTablespace`
     * labeled alternative in `MySqlParser.partitionOption`.
     * @param ctx the parse tree
     */
    exitPartitionOptionTablespace;
    /**
     * Enter a parse tree produced by the `partitionOptionNodeGroup`
     * labeled alternative in `MySqlParser.partitionOption`.
     * @param ctx the parse tree
     */
    enterPartitionOptionNodeGroup;
    /**
     * Exit a parse tree produced by the `partitionOptionNodeGroup`
     * labeled alternative in `MySqlParser.partitionOption`.
     * @param ctx the parse tree
     */
    exitPartitionOptionNodeGroup;
    /**
     * Enter a parse tree produced by the `alterSimpleDatabase`
     * labeled alternative in `MySqlParser.alterDatabase`.
     * @param ctx the parse tree
     */
    enterAlterSimpleDatabase;
    /**
     * Exit a parse tree produced by the `alterSimpleDatabase`
     * labeled alternative in `MySqlParser.alterDatabase`.
     * @param ctx the parse tree
     */
    exitAlterSimpleDatabase;
    /**
     * Enter a parse tree produced by the `alterUpgradeName`
     * labeled alternative in `MySqlParser.alterDatabase`.
     * @param ctx the parse tree
     */
    enterAlterUpgradeName;
    /**
     * Exit a parse tree produced by the `alterUpgradeName`
     * labeled alternative in `MySqlParser.alterDatabase`.
     * @param ctx the parse tree
     */
    exitAlterUpgradeName;
    /**
     * Enter a parse tree produced by `MySqlParser.alterEvent`.
     * @param ctx the parse tree
     */
    enterAlterEvent;
    /**
     * Exit a parse tree produced by `MySqlParser.alterEvent`.
     * @param ctx the parse tree
     */
    exitAlterEvent;
    /**
     * Enter a parse tree produced by `MySqlParser.alterFunction`.
     * @param ctx the parse tree
     */
    enterAlterFunction;
    /**
     * Exit a parse tree produced by `MySqlParser.alterFunction`.
     * @param ctx the parse tree
     */
    exitAlterFunction;
    /**
     * Enter a parse tree produced by `MySqlParser.alterInstance`.
     * @param ctx the parse tree
     */
    enterAlterInstance;
    /**
     * Exit a parse tree produced by `MySqlParser.alterInstance`.
     * @param ctx the parse tree
     */
    exitAlterInstance;
    /**
     * Enter a parse tree produced by `MySqlParser.alterLogfileGroup`.
     * @param ctx the parse tree
     */
    enterAlterLogfileGroup;
    /**
     * Exit a parse tree produced by `MySqlParser.alterLogfileGroup`.
     * @param ctx the parse tree
     */
    exitAlterLogfileGroup;
    /**
     * Enter a parse tree produced by `MySqlParser.alterProcedure`.
     * @param ctx the parse tree
     */
    enterAlterProcedure;
    /**
     * Exit a parse tree produced by `MySqlParser.alterProcedure`.
     * @param ctx the parse tree
     */
    exitAlterProcedure;
    /**
     * Enter a parse tree produced by `MySqlParser.alterServer`.
     * @param ctx the parse tree
     */
    enterAlterServer;
    /**
     * Exit a parse tree produced by `MySqlParser.alterServer`.
     * @param ctx the parse tree
     */
    exitAlterServer;
    /**
     * Enter a parse tree produced by `MySqlParser.alterTable`.
     * @param ctx the parse tree
     */
    enterAlterTable;
    /**
     * Exit a parse tree produced by `MySqlParser.alterTable`.
     * @param ctx the parse tree
     */
    exitAlterTable;
    /**
     * Enter a parse tree produced by `MySqlParser.alterTablespace`.
     * @param ctx the parse tree
     */
    enterAlterTablespace;
    /**
     * Exit a parse tree produced by `MySqlParser.alterTablespace`.
     * @param ctx the parse tree
     */
    exitAlterTablespace;
    /**
     * Enter a parse tree produced by `MySqlParser.alterView`.
     * @param ctx the parse tree
     */
    enterAlterView;
    /**
     * Exit a parse tree produced by `MySqlParser.alterView`.
     * @param ctx the parse tree
     */
    exitAlterView;
    /**
     * Enter a parse tree produced by the `alterByTableOption`
     * labeled alternative in `MySqlParser.alterSpecification`.
     * @param ctx the parse tree
     */
    enterAlterByTableOption;
    /**
     * Exit a parse tree produced by the `alterByTableOption`
     * labeled alternative in `MySqlParser.alterSpecification`.
     * @param ctx the parse tree
     */
    exitAlterByTableOption;
    /**
     * Enter a parse tree produced by the `alterByAddColumn`
     * labeled alternative in `MySqlParser.alterSpecification`.
     * @param ctx the parse tree
     */
    enterAlterByAddColumn;
    /**
     * Exit a parse tree produced by the `alterByAddColumn`
     * labeled alternative in `MySqlParser.alterSpecification`.
     * @param ctx the parse tree
     */
    exitAlterByAddColumn;
    /**
     * Enter a parse tree produced by the `alterByAddColumns`
     * labeled alternative in `MySqlParser.alterSpecification`.
     * @param ctx the parse tree
     */
    enterAlterByAddColumns;
    /**
     * Exit a parse tree produced by the `alterByAddColumns`
     * labeled alternative in `MySqlParser.alterSpecification`.
     * @param ctx the parse tree
     */
    exitAlterByAddColumns;
    /**
     * Enter a parse tree produced by the `alterByAddIndex`
     * labeled alternative in `MySqlParser.alterSpecification`.
     * @param ctx the parse tree
     */
    enterAlterByAddIndex;
    /**
     * Exit a parse tree produced by the `alterByAddIndex`
     * labeled alternative in `MySqlParser.alterSpecification`.
     * @param ctx the parse tree
     */
    exitAlterByAddIndex;
    /**
     * Enter a parse tree produced by the `alterByAddPrimaryKey`
     * labeled alternative in `MySqlParser.alterSpecification`.
     * @param ctx the parse tree
     */
    enterAlterByAddPrimaryKey;
    /**
     * Exit a parse tree produced by the `alterByAddPrimaryKey`
     * labeled alternative in `MySqlParser.alterSpecification`.
     * @param ctx the parse tree
     */
    exitAlterByAddPrimaryKey;
    /**
     * Enter a parse tree produced by the `alterByAddUniqueKey`
     * labeled alternative in `MySqlParser.alterSpecification`.
     * @param ctx the parse tree
     */
    enterAlterByAddUniqueKey;
    /**
     * Exit a parse tree produced by the `alterByAddUniqueKey`
     * labeled alternative in `MySqlParser.alterSpecification`.
     * @param ctx the parse tree
     */
    exitAlterByAddUniqueKey;
    /**
     * Enter a parse tree produced by the `alterByAddSpecialIndex`
     * labeled alternative in `MySqlParser.alterSpecification`.
     * @param ctx the parse tree
     */
    enterAlterByAddSpecialIndex;
    /**
     * Exit a parse tree produced by the `alterByAddSpecialIndex`
     * labeled alternative in `MySqlParser.alterSpecification`.
     * @param ctx the parse tree
     */
    exitAlterByAddSpecialIndex;
    /**
     * Enter a parse tree produced by the `alterByAddForeignKey`
     * labeled alternative in `MySqlParser.alterSpecification`.
     * @param ctx the parse tree
     */
    enterAlterByAddForeignKey;
    /**
     * Exit a parse tree produced by the `alterByAddForeignKey`
     * labeled alternative in `MySqlParser.alterSpecification`.
     * @param ctx the parse tree
     */
    exitAlterByAddForeignKey;
    /**
     * Enter a parse tree produced by the `alterByAddCheckTableConstraint`
     * labeled alternative in `MySqlParser.alterSpecification`.
     * @param ctx the parse tree
     */
    enterAlterByAddCheckTableConstraint;
    /**
     * Exit a parse tree produced by the `alterByAddCheckTableConstraint`
     * labeled alternative in `MySqlParser.alterSpecification`.
     * @param ctx the parse tree
     */
    exitAlterByAddCheckTableConstraint;
    /**
     * Enter a parse tree produced by the `alterByAlterCheckTableConstraint`
     * labeled alternative in `MySqlParser.alterSpecification`.
     * @param ctx the parse tree
     */
    enterAlterByAlterCheckTableConstraint;
    /**
     * Exit a parse tree produced by the `alterByAlterCheckTableConstraint`
     * labeled alternative in `MySqlParser.alterSpecification`.
     * @param ctx the parse tree
     */
    exitAlterByAlterCheckTableConstraint;
    /**
     * Enter a parse tree produced by the `alterBySetAlgorithm`
     * labeled alternative in `MySqlParser.alterSpecification`.
     * @param ctx the parse tree
     */
    enterAlterBySetAlgorithm;
    /**
     * Exit a parse tree produced by the `alterBySetAlgorithm`
     * labeled alternative in `MySqlParser.alterSpecification`.
     * @param ctx the parse tree
     */
    exitAlterBySetAlgorithm;
    /**
     * Enter a parse tree produced by the `alterByChangeDefault`
     * labeled alternative in `MySqlParser.alterSpecification`.
     * @param ctx the parse tree
     */
    enterAlterByChangeDefault;
    /**
     * Exit a parse tree produced by the `alterByChangeDefault`
     * labeled alternative in `MySqlParser.alterSpecification`.
     * @param ctx the parse tree
     */
    exitAlterByChangeDefault;
    /**
     * Enter a parse tree produced by the `alterByChangeColumn`
     * labeled alternative in `MySqlParser.alterSpecification`.
     * @param ctx the parse tree
     */
    enterAlterByChangeColumn;
    /**
     * Exit a parse tree produced by the `alterByChangeColumn`
     * labeled alternative in `MySqlParser.alterSpecification`.
     * @param ctx the parse tree
     */
    exitAlterByChangeColumn;
    /**
     * Enter a parse tree produced by the `alterByRenameColumn`
     * labeled alternative in `MySqlParser.alterSpecification`.
     * @param ctx the parse tree
     */
    enterAlterByRenameColumn;
    /**
     * Exit a parse tree produced by the `alterByRenameColumn`
     * labeled alternative in `MySqlParser.alterSpecification`.
     * @param ctx the parse tree
     */
    exitAlterByRenameColumn;
    /**
     * Enter a parse tree produced by the `alterByLock`
     * labeled alternative in `MySqlParser.alterSpecification`.
     * @param ctx the parse tree
     */
    enterAlterByLock;
    /**
     * Exit a parse tree produced by the `alterByLock`
     * labeled alternative in `MySqlParser.alterSpecification`.
     * @param ctx the parse tree
     */
    exitAlterByLock;
    /**
     * Enter a parse tree produced by the `alterByModifyColumn`
     * labeled alternative in `MySqlParser.alterSpecification`.
     * @param ctx the parse tree
     */
    enterAlterByModifyColumn;
    /**
     * Exit a parse tree produced by the `alterByModifyColumn`
     * labeled alternative in `MySqlParser.alterSpecification`.
     * @param ctx the parse tree
     */
    exitAlterByModifyColumn;
    /**
     * Enter a parse tree produced by the `alterByDropColumn`
     * labeled alternative in `MySqlParser.alterSpecification`.
     * @param ctx the parse tree
     */
    enterAlterByDropColumn;
    /**
     * Exit a parse tree produced by the `alterByDropColumn`
     * labeled alternative in `MySqlParser.alterSpecification`.
     * @param ctx the parse tree
     */
    exitAlterByDropColumn;
    /**
     * Enter a parse tree produced by the `alterByDropConstraintCheck`
     * labeled alternative in `MySqlParser.alterSpecification`.
     * @param ctx the parse tree
     */
    enterAlterByDropConstraintCheck;
    /**
     * Exit a parse tree produced by the `alterByDropConstraintCheck`
     * labeled alternative in `MySqlParser.alterSpecification`.
     * @param ctx the parse tree
     */
    exitAlterByDropConstraintCheck;
    /**
     * Enter a parse tree produced by the `alterByDropPrimaryKey`
     * labeled alternative in `MySqlParser.alterSpecification`.
     * @param ctx the parse tree
     */
    enterAlterByDropPrimaryKey;
    /**
     * Exit a parse tree produced by the `alterByDropPrimaryKey`
     * labeled alternative in `MySqlParser.alterSpecification`.
     * @param ctx the parse tree
     */
    exitAlterByDropPrimaryKey;
    /**
     * Enter a parse tree produced by the `alterByDropIndex`
     * labeled alternative in `MySqlParser.alterSpecification`.
     * @param ctx the parse tree
     */
    enterAlterByDropIndex;
    /**
     * Exit a parse tree produced by the `alterByDropIndex`
     * labeled alternative in `MySqlParser.alterSpecification`.
     * @param ctx the parse tree
     */
    exitAlterByDropIndex;
    /**
     * Enter a parse tree produced by the `alterByRenameIndex`
     * labeled alternative in `MySqlParser.alterSpecification`.
     * @param ctx the parse tree
     */
    enterAlterByRenameIndex;
    /**
     * Exit a parse tree produced by the `alterByRenameIndex`
     * labeled alternative in `MySqlParser.alterSpecification`.
     * @param ctx the parse tree
     */
    exitAlterByRenameIndex;
    /**
     * Enter a parse tree produced by the `alterByAlterColumnDefault`
     * labeled alternative in `MySqlParser.alterSpecification`.
     * @param ctx the parse tree
     */
    enterAlterByAlterColumnDefault;
    /**
     * Exit a parse tree produced by the `alterByAlterColumnDefault`
     * labeled alternative in `MySqlParser.alterSpecification`.
     * @param ctx the parse tree
     */
    exitAlterByAlterColumnDefault;
    /**
     * Enter a parse tree produced by the `alterByAlterIndexVisibility`
     * labeled alternative in `MySqlParser.alterSpecification`.
     * @param ctx the parse tree
     */
    enterAlterByAlterIndexVisibility;
    /**
     * Exit a parse tree produced by the `alterByAlterIndexVisibility`
     * labeled alternative in `MySqlParser.alterSpecification`.
     * @param ctx the parse tree
     */
    exitAlterByAlterIndexVisibility;
    /**
     * Enter a parse tree produced by the `alterByDropForeignKey`
     * labeled alternative in `MySqlParser.alterSpecification`.
     * @param ctx the parse tree
     */
    enterAlterByDropForeignKey;
    /**
     * Exit a parse tree produced by the `alterByDropForeignKey`
     * labeled alternative in `MySqlParser.alterSpecification`.
     * @param ctx the parse tree
     */
    exitAlterByDropForeignKey;
    /**
     * Enter a parse tree produced by the `alterByDisableKeys`
     * labeled alternative in `MySqlParser.alterSpecification`.
     * @param ctx the parse tree
     */
    enterAlterByDisableKeys;
    /**
     * Exit a parse tree produced by the `alterByDisableKeys`
     * labeled alternative in `MySqlParser.alterSpecification`.
     * @param ctx the parse tree
     */
    exitAlterByDisableKeys;
    /**
     * Enter a parse tree produced by the `alterByEnableKeys`
     * labeled alternative in `MySqlParser.alterSpecification`.
     * @param ctx the parse tree
     */
    enterAlterByEnableKeys;
    /**
     * Exit a parse tree produced by the `alterByEnableKeys`
     * labeled alternative in `MySqlParser.alterSpecification`.
     * @param ctx the parse tree
     */
    exitAlterByEnableKeys;
    /**
     * Enter a parse tree produced by the `alterByRename`
     * labeled alternative in `MySqlParser.alterSpecification`.
     * @param ctx the parse tree
     */
    enterAlterByRename;
    /**
     * Exit a parse tree produced by the `alterByRename`
     * labeled alternative in `MySqlParser.alterSpecification`.
     * @param ctx the parse tree
     */
    exitAlterByRename;
    /**
     * Enter a parse tree produced by the `alterByOrder`
     * labeled alternative in `MySqlParser.alterSpecification`.
     * @param ctx the parse tree
     */
    enterAlterByOrder;
    /**
     * Exit a parse tree produced by the `alterByOrder`
     * labeled alternative in `MySqlParser.alterSpecification`.
     * @param ctx the parse tree
     */
    exitAlterByOrder;
    /**
     * Enter a parse tree produced by the `alterByConvertCharset`
     * labeled alternative in `MySqlParser.alterSpecification`.
     * @param ctx the parse tree
     */
    enterAlterByConvertCharset;
    /**
     * Exit a parse tree produced by the `alterByConvertCharset`
     * labeled alternative in `MySqlParser.alterSpecification`.
     * @param ctx the parse tree
     */
    exitAlterByConvertCharset;
    /**
     * Enter a parse tree produced by the `alterByDefaultCharset`
     * labeled alternative in `MySqlParser.alterSpecification`.
     * @param ctx the parse tree
     */
    enterAlterByDefaultCharset;
    /**
     * Exit a parse tree produced by the `alterByDefaultCharset`
     * labeled alternative in `MySqlParser.alterSpecification`.
     * @param ctx the parse tree
     */
    exitAlterByDefaultCharset;
    /**
     * Enter a parse tree produced by the `alterByDiscardTablespace`
     * labeled alternative in `MySqlParser.alterSpecification`.
     * @param ctx the parse tree
     */
    enterAlterByDiscardTablespace;
    /**
     * Exit a parse tree produced by the `alterByDiscardTablespace`
     * labeled alternative in `MySqlParser.alterSpecification`.
     * @param ctx the parse tree
     */
    exitAlterByDiscardTablespace;
    /**
     * Enter a parse tree produced by the `alterByImportTablespace`
     * labeled alternative in `MySqlParser.alterSpecification`.
     * @param ctx the parse tree
     */
    enterAlterByImportTablespace;
    /**
     * Exit a parse tree produced by the `alterByImportTablespace`
     * labeled alternative in `MySqlParser.alterSpecification`.
     * @param ctx the parse tree
     */
    exitAlterByImportTablespace;
    /**
     * Enter a parse tree produced by the `alterByForce`
     * labeled alternative in `MySqlParser.alterSpecification`.
     * @param ctx the parse tree
     */
    enterAlterByForce;
    /**
     * Exit a parse tree produced by the `alterByForce`
     * labeled alternative in `MySqlParser.alterSpecification`.
     * @param ctx the parse tree
     */
    exitAlterByForce;
    /**
     * Enter a parse tree produced by the `alterByValidate`
     * labeled alternative in `MySqlParser.alterSpecification`.
     * @param ctx the parse tree
     */
    enterAlterByValidate;
    /**
     * Exit a parse tree produced by the `alterByValidate`
     * labeled alternative in `MySqlParser.alterSpecification`.
     * @param ctx the parse tree
     */
    exitAlterByValidate;
    /**
     * Enter a parse tree produced by the `alterByAddDefinitions`
     * labeled alternative in `MySqlParser.alterSpecification`.
     * @param ctx the parse tree
     */
    enterAlterByAddDefinitions;
    /**
     * Exit a parse tree produced by the `alterByAddDefinitions`
     * labeled alternative in `MySqlParser.alterSpecification`.
     * @param ctx the parse tree
     */
    exitAlterByAddDefinitions;
    /**
     * Enter a parse tree produced by the `alterPartition`
     * labeled alternative in `MySqlParser.alterSpecification`.
     * @param ctx the parse tree
     */
    enterAlterPartition;
    /**
     * Exit a parse tree produced by the `alterPartition`
     * labeled alternative in `MySqlParser.alterSpecification`.
     * @param ctx the parse tree
     */
    exitAlterPartition;
    /**
     * Enter a parse tree produced by the `alterByAddPartition`
     * labeled alternative in `MySqlParser.alterPartitionSpecification`.
     * @param ctx the parse tree
     */
    enterAlterByAddPartition;
    /**
     * Exit a parse tree produced by the `alterByAddPartition`
     * labeled alternative in `MySqlParser.alterPartitionSpecification`.
     * @param ctx the parse tree
     */
    exitAlterByAddPartition;
    /**
     * Enter a parse tree produced by the `alterByDropPartition`
     * labeled alternative in `MySqlParser.alterPartitionSpecification`.
     * @param ctx the parse tree
     */
    enterAlterByDropPartition;
    /**
     * Exit a parse tree produced by the `alterByDropPartition`
     * labeled alternative in `MySqlParser.alterPartitionSpecification`.
     * @param ctx the parse tree
     */
    exitAlterByDropPartition;
    /**
     * Enter a parse tree produced by the `alterByDiscardPartition`
     * labeled alternative in `MySqlParser.alterPartitionSpecification`.
     * @param ctx the parse tree
     */
    enterAlterByDiscardPartition;
    /**
     * Exit a parse tree produced by the `alterByDiscardPartition`
     * labeled alternative in `MySqlParser.alterPartitionSpecification`.
     * @param ctx the parse tree
     */
    exitAlterByDiscardPartition;
    /**
     * Enter a parse tree produced by the `alterByImportPartition`
     * labeled alternative in `MySqlParser.alterPartitionSpecification`.
     * @param ctx the parse tree
     */
    enterAlterByImportPartition;
    /**
     * Exit a parse tree produced by the `alterByImportPartition`
     * labeled alternative in `MySqlParser.alterPartitionSpecification`.
     * @param ctx the parse tree
     */
    exitAlterByImportPartition;
    /**
     * Enter a parse tree produced by the `alterByTruncatePartition`
     * labeled alternative in `MySqlParser.alterPartitionSpecification`.
     * @param ctx the parse tree
     */
    enterAlterByTruncatePartition;
    /**
     * Exit a parse tree produced by the `alterByTruncatePartition`
     * labeled alternative in `MySqlParser.alterPartitionSpecification`.
     * @param ctx the parse tree
     */
    exitAlterByTruncatePartition;
    /**
     * Enter a parse tree produced by the `alterByCoalescePartition`
     * labeled alternative in `MySqlParser.alterPartitionSpecification`.
     * @param ctx the parse tree
     */
    enterAlterByCoalescePartition;
    /**
     * Exit a parse tree produced by the `alterByCoalescePartition`
     * labeled alternative in `MySqlParser.alterPartitionSpecification`.
     * @param ctx the parse tree
     */
    exitAlterByCoalescePartition;
    /**
     * Enter a parse tree produced by the `alterByReorganizePartition`
     * labeled alternative in `MySqlParser.alterPartitionSpecification`.
     * @param ctx the parse tree
     */
    enterAlterByReorganizePartition;
    /**
     * Exit a parse tree produced by the `alterByReorganizePartition`
     * labeled alternative in `MySqlParser.alterPartitionSpecification`.
     * @param ctx the parse tree
     */
    exitAlterByReorganizePartition;
    /**
     * Enter a parse tree produced by the `alterByExchangePartition`
     * labeled alternative in `MySqlParser.alterPartitionSpecification`.
     * @param ctx the parse tree
     */
    enterAlterByExchangePartition;
    /**
     * Exit a parse tree produced by the `alterByExchangePartition`
     * labeled alternative in `MySqlParser.alterPartitionSpecification`.
     * @param ctx the parse tree
     */
    exitAlterByExchangePartition;
    /**
     * Enter a parse tree produced by the `alterByAnalyzePartition`
     * labeled alternative in `MySqlParser.alterPartitionSpecification`.
     * @param ctx the parse tree
     */
    enterAlterByAnalyzePartition;
    /**
     * Exit a parse tree produced by the `alterByAnalyzePartition`
     * labeled alternative in `MySqlParser.alterPartitionSpecification`.
     * @param ctx the parse tree
     */
    exitAlterByAnalyzePartition;
    /**
     * Enter a parse tree produced by the `alterByCheckPartition`
     * labeled alternative in `MySqlParser.alterPartitionSpecification`.
     * @param ctx the parse tree
     */
    enterAlterByCheckPartition;
    /**
     * Exit a parse tree produced by the `alterByCheckPartition`
     * labeled alternative in `MySqlParser.alterPartitionSpecification`.
     * @param ctx the parse tree
     */
    exitAlterByCheckPartition;
    /**
     * Enter a parse tree produced by the `alterByOptimizePartition`
     * labeled alternative in `MySqlParser.alterPartitionSpecification`.
     * @param ctx the parse tree
     */
    enterAlterByOptimizePartition;
    /**
     * Exit a parse tree produced by the `alterByOptimizePartition`
     * labeled alternative in `MySqlParser.alterPartitionSpecification`.
     * @param ctx the parse tree
     */
    exitAlterByOptimizePartition;
    /**
     * Enter a parse tree produced by the `alterByRebuildPartition`
     * labeled alternative in `MySqlParser.alterPartitionSpecification`.
     * @param ctx the parse tree
     */
    enterAlterByRebuildPartition;
    /**
     * Exit a parse tree produced by the `alterByRebuildPartition`
     * labeled alternative in `MySqlParser.alterPartitionSpecification`.
     * @param ctx the parse tree
     */
    exitAlterByRebuildPartition;
    /**
     * Enter a parse tree produced by the `alterByRepairPartition`
     * labeled alternative in `MySqlParser.alterPartitionSpecification`.
     * @param ctx the parse tree
     */
    enterAlterByRepairPartition;
    /**
     * Exit a parse tree produced by the `alterByRepairPartition`
     * labeled alternative in `MySqlParser.alterPartitionSpecification`.
     * @param ctx the parse tree
     */
    exitAlterByRepairPartition;
    /**
     * Enter a parse tree produced by the `alterByRemovePartitioning`
     * labeled alternative in `MySqlParser.alterPartitionSpecification`.
     * @param ctx the parse tree
     */
    enterAlterByRemovePartitioning;
    /**
     * Exit a parse tree produced by the `alterByRemovePartitioning`
     * labeled alternative in `MySqlParser.alterPartitionSpecification`.
     * @param ctx the parse tree
     */
    exitAlterByRemovePartitioning;
    /**
     * Enter a parse tree produced by the `alterByUpgradePartitioning`
     * labeled alternative in `MySqlParser.alterPartitionSpecification`.
     * @param ctx the parse tree
     */
    enterAlterByUpgradePartitioning;
    /**
     * Exit a parse tree produced by the `alterByUpgradePartitioning`
     * labeled alternative in `MySqlParser.alterPartitionSpecification`.
     * @param ctx the parse tree
     */
    exitAlterByUpgradePartitioning;
    /**
     * Enter a parse tree produced by `MySqlParser.dropDatabase`.
     * @param ctx the parse tree
     */
    enterDropDatabase;
    /**
     * Exit a parse tree produced by `MySqlParser.dropDatabase`.
     * @param ctx the parse tree
     */
    exitDropDatabase;
    /**
     * Enter a parse tree produced by `MySqlParser.dropEvent`.
     * @param ctx the parse tree
     */
    enterDropEvent;
    /**
     * Exit a parse tree produced by `MySqlParser.dropEvent`.
     * @param ctx the parse tree
     */
    exitDropEvent;
    /**
     * Enter a parse tree produced by `MySqlParser.dropIndex`.
     * @param ctx the parse tree
     */
    enterDropIndex;
    /**
     * Exit a parse tree produced by `MySqlParser.dropIndex`.
     * @param ctx the parse tree
     */
    exitDropIndex;
    /**
     * Enter a parse tree produced by `MySqlParser.dropLogfileGroup`.
     * @param ctx the parse tree
     */
    enterDropLogfileGroup;
    /**
     * Exit a parse tree produced by `MySqlParser.dropLogfileGroup`.
     * @param ctx the parse tree
     */
    exitDropLogfileGroup;
    /**
     * Enter a parse tree produced by `MySqlParser.dropProcedure`.
     * @param ctx the parse tree
     */
    enterDropProcedure;
    /**
     * Exit a parse tree produced by `MySqlParser.dropProcedure`.
     * @param ctx the parse tree
     */
    exitDropProcedure;
    /**
     * Enter a parse tree produced by `MySqlParser.dropFunction`.
     * @param ctx the parse tree
     */
    enterDropFunction;
    /**
     * Exit a parse tree produced by `MySqlParser.dropFunction`.
     * @param ctx the parse tree
     */
    exitDropFunction;
    /**
     * Enter a parse tree produced by `MySqlParser.dropServer`.
     * @param ctx the parse tree
     */
    enterDropServer;
    /**
     * Exit a parse tree produced by `MySqlParser.dropServer`.
     * @param ctx the parse tree
     */
    exitDropServer;
    /**
     * Enter a parse tree produced by `MySqlParser.dropTable`.
     * @param ctx the parse tree
     */
    enterDropTable;
    /**
     * Exit a parse tree produced by `MySqlParser.dropTable`.
     * @param ctx the parse tree
     */
    exitDropTable;
    /**
     * Enter a parse tree produced by `MySqlParser.dropTablespace`.
     * @param ctx the parse tree
     */
    enterDropTablespace;
    /**
     * Exit a parse tree produced by `MySqlParser.dropTablespace`.
     * @param ctx the parse tree
     */
    exitDropTablespace;
    /**
     * Enter a parse tree produced by `MySqlParser.dropTrigger`.
     * @param ctx the parse tree
     */
    enterDropTrigger;
    /**
     * Exit a parse tree produced by `MySqlParser.dropTrigger`.
     * @param ctx the parse tree
     */
    exitDropTrigger;
    /**
     * Enter a parse tree produced by `MySqlParser.dropView`.
     * @param ctx the parse tree
     */
    enterDropView;
    /**
     * Exit a parse tree produced by `MySqlParser.dropView`.
     * @param ctx the parse tree
     */
    exitDropView;
    /**
     * Enter a parse tree produced by `MySqlParser.dropRole`.
     * @param ctx the parse tree
     */
    enterDropRole;
    /**
     * Exit a parse tree produced by `MySqlParser.dropRole`.
     * @param ctx the parse tree
     */
    exitDropRole;
    /**
     * Enter a parse tree produced by `MySqlParser.setRole`.
     * @param ctx the parse tree
     */
    enterSetRole;
    /**
     * Exit a parse tree produced by `MySqlParser.setRole`.
     * @param ctx the parse tree
     */
    exitSetRole;
    /**
     * Enter a parse tree produced by `MySqlParser.renameTable`.
     * @param ctx the parse tree
     */
    enterRenameTable;
    /**
     * Exit a parse tree produced by `MySqlParser.renameTable`.
     * @param ctx the parse tree
     */
    exitRenameTable;
    /**
     * Enter a parse tree produced by `MySqlParser.renameTableClause`.
     * @param ctx the parse tree
     */
    enterRenameTableClause;
    /**
     * Exit a parse tree produced by `MySqlParser.renameTableClause`.
     * @param ctx the parse tree
     */
    exitRenameTableClause;
    /**
     * Enter a parse tree produced by `MySqlParser.truncateTable`.
     * @param ctx the parse tree
     */
    enterTruncateTable;
    /**
     * Exit a parse tree produced by `MySqlParser.truncateTable`.
     * @param ctx the parse tree
     */
    exitTruncateTable;
    /**
     * Enter a parse tree produced by `MySqlParser.callStatement`.
     * @param ctx the parse tree
     */
    enterCallStatement;
    /**
     * Exit a parse tree produced by `MySqlParser.callStatement`.
     * @param ctx the parse tree
     */
    exitCallStatement;
    /**
     * Enter a parse tree produced by `MySqlParser.deleteStatement`.
     * @param ctx the parse tree
     */
    enterDeleteStatement;
    /**
     * Exit a parse tree produced by `MySqlParser.deleteStatement`.
     * @param ctx the parse tree
     */
    exitDeleteStatement;
    /**
     * Enter a parse tree produced by `MySqlParser.doStatement`.
     * @param ctx the parse tree
     */
    enterDoStatement;
    /**
     * Exit a parse tree produced by `MySqlParser.doStatement`.
     * @param ctx the parse tree
     */
    exitDoStatement;
    /**
     * Enter a parse tree produced by `MySqlParser.handlerStatement`.
     * @param ctx the parse tree
     */
    enterHandlerStatement;
    /**
     * Exit a parse tree produced by `MySqlParser.handlerStatement`.
     * @param ctx the parse tree
     */
    exitHandlerStatement;
    /**
     * Enter a parse tree produced by `MySqlParser.insertStatement`.
     * @param ctx the parse tree
     */
    enterInsertStatement;
    /**
     * Exit a parse tree produced by `MySqlParser.insertStatement`.
     * @param ctx the parse tree
     */
    exitInsertStatement;
    /**
     * Enter a parse tree produced by `MySqlParser.loadDataStatement`.
     * @param ctx the parse tree
     */
    enterLoadDataStatement;
    /**
     * Exit a parse tree produced by `MySqlParser.loadDataStatement`.
     * @param ctx the parse tree
     */
    exitLoadDataStatement;
    /**
     * Enter a parse tree produced by `MySqlParser.loadXmlStatement`.
     * @param ctx the parse tree
     */
    enterLoadXmlStatement;
    /**
     * Exit a parse tree produced by `MySqlParser.loadXmlStatement`.
     * @param ctx the parse tree
     */
    exitLoadXmlStatement;
    /**
     * Enter a parse tree produced by `MySqlParser.replaceStatement`.
     * @param ctx the parse tree
     */
    enterReplaceStatement;
    /**
     * Exit a parse tree produced by `MySqlParser.replaceStatement`.
     * @param ctx the parse tree
     */
    exitReplaceStatement;
    /**
     * Enter a parse tree produced by the `simpleSelect`
     * labeled alternative in `MySqlParser.selectStatement`.
     * @param ctx the parse tree
     */
    enterSimpleSelect;
    /**
     * Exit a parse tree produced by the `simpleSelect`
     * labeled alternative in `MySqlParser.selectStatement`.
     * @param ctx the parse tree
     */
    exitSimpleSelect;
    /**
     * Enter a parse tree produced by the `parenthesisSelect`
     * labeled alternative in `MySqlParser.selectStatement`.
     * @param ctx the parse tree
     */
    enterParenthesisSelect;
    /**
     * Exit a parse tree produced by the `parenthesisSelect`
     * labeled alternative in `MySqlParser.selectStatement`.
     * @param ctx the parse tree
     */
    exitParenthesisSelect;
    /**
     * Enter a parse tree produced by the `unionSelect`
     * labeled alternative in `MySqlParser.selectStatement`.
     * @param ctx the parse tree
     */
    enterUnionSelect;
    /**
     * Exit a parse tree produced by the `unionSelect`
     * labeled alternative in `MySqlParser.selectStatement`.
     * @param ctx the parse tree
     */
    exitUnionSelect;
    /**
     * Enter a parse tree produced by the `unionParenthesisSelect`
     * labeled alternative in `MySqlParser.selectStatement`.
     * @param ctx the parse tree
     */
    enterUnionParenthesisSelect;
    /**
     * Exit a parse tree produced by the `unionParenthesisSelect`
     * labeled alternative in `MySqlParser.selectStatement`.
     * @param ctx the parse tree
     */
    exitUnionParenthesisSelect;
    /**
     * Enter a parse tree produced by the `withLateralStatement`
     * labeled alternative in `MySqlParser.selectStatement`.
     * @param ctx the parse tree
     */
    enterWithLateralStatement;
    /**
     * Exit a parse tree produced by the `withLateralStatement`
     * labeled alternative in `MySqlParser.selectStatement`.
     * @param ctx the parse tree
     */
    exitWithLateralStatement;
    /**
     * Enter a parse tree produced by `MySqlParser.updateStatement`.
     * @param ctx the parse tree
     */
    enterUpdateStatement;
    /**
     * Exit a parse tree produced by `MySqlParser.updateStatement`.
     * @param ctx the parse tree
     */
    exitUpdateStatement;
    /**
     * Enter a parse tree produced by `MySqlParser.valuesStatement`.
     * @param ctx the parse tree
     */
    enterValuesStatement;
    /**
     * Exit a parse tree produced by `MySqlParser.valuesStatement`.
     * @param ctx the parse tree
     */
    exitValuesStatement;
    /**
     * Enter a parse tree produced by `MySqlParser.insertStatementValue`.
     * @param ctx the parse tree
     */
    enterInsertStatementValue;
    /**
     * Exit a parse tree produced by `MySqlParser.insertStatementValue`.
     * @param ctx the parse tree
     */
    exitInsertStatementValue;
    /**
     * Enter a parse tree produced by `MySqlParser.updatedElement`.
     * @param ctx the parse tree
     */
    enterUpdatedElement;
    /**
     * Exit a parse tree produced by `MySqlParser.updatedElement`.
     * @param ctx the parse tree
     */
    exitUpdatedElement;
    /**
     * Enter a parse tree produced by `MySqlParser.assignmentField`.
     * @param ctx the parse tree
     */
    enterAssignmentField;
    /**
     * Exit a parse tree produced by `MySqlParser.assignmentField`.
     * @param ctx the parse tree
     */
    exitAssignmentField;
    /**
     * Enter a parse tree produced by `MySqlParser.lockClause`.
     * @param ctx the parse tree
     */
    enterLockClause;
    /**
     * Exit a parse tree produced by `MySqlParser.lockClause`.
     * @param ctx the parse tree
     */
    exitLockClause;
    /**
     * Enter a parse tree produced by `MySqlParser.singleDeleteStatement`.
     * @param ctx the parse tree
     */
    enterSingleDeleteStatement;
    /**
     * Exit a parse tree produced by `MySqlParser.singleDeleteStatement`.
     * @param ctx the parse tree
     */
    exitSingleDeleteStatement;
    /**
     * Enter a parse tree produced by `MySqlParser.multipleDeleteStatement`.
     * @param ctx the parse tree
     */
    enterMultipleDeleteStatement;
    /**
     * Exit a parse tree produced by `MySqlParser.multipleDeleteStatement`.
     * @param ctx the parse tree
     */
    exitMultipleDeleteStatement;
    /**
     * Enter a parse tree produced by `MySqlParser.handlerOpenStatement`.
     * @param ctx the parse tree
     */
    enterHandlerOpenStatement;
    /**
     * Exit a parse tree produced by `MySqlParser.handlerOpenStatement`.
     * @param ctx the parse tree
     */
    exitHandlerOpenStatement;
    /**
     * Enter a parse tree produced by `MySqlParser.handlerReadIndexStatement`.
     * @param ctx the parse tree
     */
    enterHandlerReadIndexStatement;
    /**
     * Exit a parse tree produced by `MySqlParser.handlerReadIndexStatement`.
     * @param ctx the parse tree
     */
    exitHandlerReadIndexStatement;
    /**
     * Enter a parse tree produced by `MySqlParser.handlerReadStatement`.
     * @param ctx the parse tree
     */
    enterHandlerReadStatement;
    /**
     * Exit a parse tree produced by `MySqlParser.handlerReadStatement`.
     * @param ctx the parse tree
     */
    exitHandlerReadStatement;
    /**
     * Enter a parse tree produced by `MySqlParser.handlerCloseStatement`.
     * @param ctx the parse tree
     */
    enterHandlerCloseStatement;
    /**
     * Exit a parse tree produced by `MySqlParser.handlerCloseStatement`.
     * @param ctx the parse tree
     */
    exitHandlerCloseStatement;
    /**
     * Enter a parse tree produced by `MySqlParser.singleUpdateStatement`.
     * @param ctx the parse tree
     */
    enterSingleUpdateStatement;
    /**
     * Exit a parse tree produced by `MySqlParser.singleUpdateStatement`.
     * @param ctx the parse tree
     */
    exitSingleUpdateStatement;
    /**
     * Enter a parse tree produced by `MySqlParser.multipleUpdateStatement`.
     * @param ctx the parse tree
     */
    enterMultipleUpdateStatement;
    /**
     * Exit a parse tree produced by `MySqlParser.multipleUpdateStatement`.
     * @param ctx the parse tree
     */
    exitMultipleUpdateStatement;
    /**
     * Enter a parse tree produced by `MySqlParser.orderByClause`.
     * @param ctx the parse tree
     */
    enterOrderByClause;
    /**
     * Exit a parse tree produced by `MySqlParser.orderByClause`.
     * @param ctx the parse tree
     */
    exitOrderByClause;
    /**
     * Enter a parse tree produced by `MySqlParser.orderByExpression`.
     * @param ctx the parse tree
     */
    enterOrderByExpression;
    /**
     * Exit a parse tree produced by `MySqlParser.orderByExpression`.
     * @param ctx the parse tree
     */
    exitOrderByExpression;
    /**
     * Enter a parse tree produced by `MySqlParser.tableSources`.
     * @param ctx the parse tree
     */
    enterTableSources;
    /**
     * Exit a parse tree produced by `MySqlParser.tableSources`.
     * @param ctx the parse tree
     */
    exitTableSources;
    /**
     * Enter a parse tree produced by the `tableSourceBase`
     * labeled alternative in `MySqlParser.tableSource`.
     * @param ctx the parse tree
     */
    enterTableSourceBase;
    /**
     * Exit a parse tree produced by the `tableSourceBase`
     * labeled alternative in `MySqlParser.tableSource`.
     * @param ctx the parse tree
     */
    exitTableSourceBase;
    /**
     * Enter a parse tree produced by the `tableSourceNested`
     * labeled alternative in `MySqlParser.tableSource`.
     * @param ctx the parse tree
     */
    enterTableSourceNested;
    /**
     * Exit a parse tree produced by the `tableSourceNested`
     * labeled alternative in `MySqlParser.tableSource`.
     * @param ctx the parse tree
     */
    exitTableSourceNested;
    /**
     * Enter a parse tree produced by the `tableJson`
     * labeled alternative in `MySqlParser.tableSource`.
     * @param ctx the parse tree
     */
    enterTableJson;
    /**
     * Exit a parse tree produced by the `tableJson`
     * labeled alternative in `MySqlParser.tableSource`.
     * @param ctx the parse tree
     */
    exitTableJson;
    /**
     * Enter a parse tree produced by the `atomTableItem`
     * labeled alternative in `MySqlParser.tableSourceItem`.
     * @param ctx the parse tree
     */
    enterAtomTableItem;
    /**
     * Exit a parse tree produced by the `atomTableItem`
     * labeled alternative in `MySqlParser.tableSourceItem`.
     * @param ctx the parse tree
     */
    exitAtomTableItem;
    /**
     * Enter a parse tree produced by the `sequenceTableItem`
     * labeled alternative in `MySqlParser.tableSourceItem`.
     * @param ctx the parse tree
     */
    enterSequenceTableItem;
    /**
     * Exit a parse tree produced by the `sequenceTableItem`
     * labeled alternative in `MySqlParser.tableSourceItem`.
     * @param ctx the parse tree
     */
    exitSequenceTableItem;
    /**
     * Enter a parse tree produced by the `subqueryTableItem`
     * labeled alternative in `MySqlParser.tableSourceItem`.
     * @param ctx the parse tree
     */
    enterSubqueryTableItem;
    /**
     * Exit a parse tree produced by the `subqueryTableItem`
     * labeled alternative in `MySqlParser.tableSourceItem`.
     * @param ctx the parse tree
     */
    exitSubqueryTableItem;
    /**
     * Enter a parse tree produced by the `tableSourcesItem`
     * labeled alternative in `MySqlParser.tableSourceItem`.
     * @param ctx the parse tree
     */
    enterTableSourcesItem;
    /**
     * Exit a parse tree produced by the `tableSourcesItem`
     * labeled alternative in `MySqlParser.tableSourceItem`.
     * @param ctx the parse tree
     */
    exitTableSourcesItem;
    /**
     * Enter a parse tree produced by `MySqlParser.indexHint`.
     * @param ctx the parse tree
     */
    enterIndexHint;
    /**
     * Exit a parse tree produced by `MySqlParser.indexHint`.
     * @param ctx the parse tree
     */
    exitIndexHint;
    /**
     * Enter a parse tree produced by `MySqlParser.indexHintType`.
     * @param ctx the parse tree
     */
    enterIndexHintType;
    /**
     * Exit a parse tree produced by `MySqlParser.indexHintType`.
     * @param ctx the parse tree
     */
    exitIndexHintType;
    /**
     * Enter a parse tree produced by the `innerJoin`
     * labeled alternative in `MySqlParser.joinPart`.
     * @param ctx the parse tree
     */
    enterInnerJoin;
    /**
     * Exit a parse tree produced by the `innerJoin`
     * labeled alternative in `MySqlParser.joinPart`.
     * @param ctx the parse tree
     */
    exitInnerJoin;
    /**
     * Enter a parse tree produced by the `straightJoin`
     * labeled alternative in `MySqlParser.joinPart`.
     * @param ctx the parse tree
     */
    enterStraightJoin;
    /**
     * Exit a parse tree produced by the `straightJoin`
     * labeled alternative in `MySqlParser.joinPart`.
     * @param ctx the parse tree
     */
    exitStraightJoin;
    /**
     * Enter a parse tree produced by the `outerJoin`
     * labeled alternative in `MySqlParser.joinPart`.
     * @param ctx the parse tree
     */
    enterOuterJoin;
    /**
     * Exit a parse tree produced by the `outerJoin`
     * labeled alternative in `MySqlParser.joinPart`.
     * @param ctx the parse tree
     */
    exitOuterJoin;
    /**
     * Enter a parse tree produced by the `naturalJoin`
     * labeled alternative in `MySqlParser.joinPart`.
     * @param ctx the parse tree
     */
    enterNaturalJoin;
    /**
     * Exit a parse tree produced by the `naturalJoin`
     * labeled alternative in `MySqlParser.joinPart`.
     * @param ctx the parse tree
     */
    exitNaturalJoin;
    /**
     * Enter a parse tree produced by `MySqlParser.joinSpec`.
     * @param ctx the parse tree
     */
    enterJoinSpec;
    /**
     * Exit a parse tree produced by `MySqlParser.joinSpec`.
     * @param ctx the parse tree
     */
    exitJoinSpec;
    /**
     * Enter a parse tree produced by `MySqlParser.queryExpression`.
     * @param ctx the parse tree
     */
    enterQueryExpression;
    /**
     * Exit a parse tree produced by `MySqlParser.queryExpression`.
     * @param ctx the parse tree
     */
    exitQueryExpression;
    /**
     * Enter a parse tree produced by `MySqlParser.queryExpressionNointo`.
     * @param ctx the parse tree
     */
    enterQueryExpressionNointo;
    /**
     * Exit a parse tree produced by `MySqlParser.queryExpressionNointo`.
     * @param ctx the parse tree
     */
    exitQueryExpressionNointo;
    /**
     * Enter a parse tree produced by `MySqlParser.querySpecification`.
     * @param ctx the parse tree
     */
    enterQuerySpecification;
    /**
     * Exit a parse tree produced by `MySqlParser.querySpecification`.
     * @param ctx the parse tree
     */
    exitQuerySpecification;
    /**
     * Enter a parse tree produced by `MySqlParser.querySpecificationNointo`.
     * @param ctx the parse tree
     */
    enterQuerySpecificationNointo;
    /**
     * Exit a parse tree produced by `MySqlParser.querySpecificationNointo`.
     * @param ctx the parse tree
     */
    exitQuerySpecificationNointo;
    /**
     * Enter a parse tree produced by `MySqlParser.unionParenthesis`.
     * @param ctx the parse tree
     */
    enterUnionParenthesis;
    /**
     * Exit a parse tree produced by `MySqlParser.unionParenthesis`.
     * @param ctx the parse tree
     */
    exitUnionParenthesis;
    /**
     * Enter a parse tree produced by `MySqlParser.unionStatement`.
     * @param ctx the parse tree
     */
    enterUnionStatement;
    /**
     * Exit a parse tree produced by `MySqlParser.unionStatement`.
     * @param ctx the parse tree
     */
    exitUnionStatement;
    /**
     * Enter a parse tree produced by `MySqlParser.lateralStatement`.
     * @param ctx the parse tree
     */
    enterLateralStatement;
    /**
     * Exit a parse tree produced by `MySqlParser.lateralStatement`.
     * @param ctx the parse tree
     */
    exitLateralStatement;
    /**
     * Enter a parse tree produced by `MySqlParser.jsonTable`.
     * @param ctx the parse tree
     */
    enterJsonTable;
    /**
     * Exit a parse tree produced by `MySqlParser.jsonTable`.
     * @param ctx the parse tree
     */
    exitJsonTable;
    /**
     * Enter a parse tree produced by `MySqlParser.jsonColumnList`.
     * @param ctx the parse tree
     */
    enterJsonColumnList;
    /**
     * Exit a parse tree produced by `MySqlParser.jsonColumnList`.
     * @param ctx the parse tree
     */
    exitJsonColumnList;
    /**
     * Enter a parse tree produced by `MySqlParser.jsonColumn`.
     * @param ctx the parse tree
     */
    enterJsonColumn;
    /**
     * Exit a parse tree produced by `MySqlParser.jsonColumn`.
     * @param ctx the parse tree
     */
    exitJsonColumn;
    /**
     * Enter a parse tree produced by `MySqlParser.jsonOnEmpty`.
     * @param ctx the parse tree
     */
    enterJsonOnEmpty;
    /**
     * Exit a parse tree produced by `MySqlParser.jsonOnEmpty`.
     * @param ctx the parse tree
     */
    exitJsonOnEmpty;
    /**
     * Enter a parse tree produced by `MySqlParser.jsonOnError`.
     * @param ctx the parse tree
     */
    enterJsonOnError;
    /**
     * Exit a parse tree produced by `MySqlParser.jsonOnError`.
     * @param ctx the parse tree
     */
    exitJsonOnError;
    /**
     * Enter a parse tree produced by `MySqlParser.selectSpec`.
     * @param ctx the parse tree
     */
    enterSelectSpec;
    /**
     * Exit a parse tree produced by `MySqlParser.selectSpec`.
     * @param ctx the parse tree
     */
    exitSelectSpec;
    /**
     * Enter a parse tree produced by `MySqlParser.selectElements`.
     * @param ctx the parse tree
     */
    enterSelectElements;
    /**
     * Exit a parse tree produced by `MySqlParser.selectElements`.
     * @param ctx the parse tree
     */
    exitSelectElements;
    /**
     * Enter a parse tree produced by the `selectStarElement`
     * labeled alternative in `MySqlParser.selectElement`.
     * @param ctx the parse tree
     */
    enterSelectStarElement;
    /**
     * Exit a parse tree produced by the `selectStarElement`
     * labeled alternative in `MySqlParser.selectElement`.
     * @param ctx the parse tree
     */
    exitSelectStarElement;
    /**
     * Enter a parse tree produced by the `selectColumnElement`
     * labeled alternative in `MySqlParser.selectElement`.
     * @param ctx the parse tree
     */
    enterSelectColumnElement;
    /**
     * Exit a parse tree produced by the `selectColumnElement`
     * labeled alternative in `MySqlParser.selectElement`.
     * @param ctx the parse tree
     */
    exitSelectColumnElement;
    /**
     * Enter a parse tree produced by the `selectFunctionElement`
     * labeled alternative in `MySqlParser.selectElement`.
     * @param ctx the parse tree
     */
    enterSelectFunctionElement;
    /**
     * Exit a parse tree produced by the `selectFunctionElement`
     * labeled alternative in `MySqlParser.selectElement`.
     * @param ctx the parse tree
     */
    exitSelectFunctionElement;
    /**
     * Enter a parse tree produced by the `selectExpressionElement`
     * labeled alternative in `MySqlParser.selectElement`.
     * @param ctx the parse tree
     */
    enterSelectExpressionElement;
    /**
     * Exit a parse tree produced by the `selectExpressionElement`
     * labeled alternative in `MySqlParser.selectElement`.
     * @param ctx the parse tree
     */
    exitSelectExpressionElement;
    /**
     * Enter a parse tree produced by the `selectIntoVariables`
     * labeled alternative in `MySqlParser.selectIntoExpression`.
     * @param ctx the parse tree
     */
    enterSelectIntoVariables;
    /**
     * Exit a parse tree produced by the `selectIntoVariables`
     * labeled alternative in `MySqlParser.selectIntoExpression`.
     * @param ctx the parse tree
     */
    exitSelectIntoVariables;
    /**
     * Enter a parse tree produced by the `selectIntoDumpFile`
     * labeled alternative in `MySqlParser.selectIntoExpression`.
     * @param ctx the parse tree
     */
    enterSelectIntoDumpFile;
    /**
     * Exit a parse tree produced by the `selectIntoDumpFile`
     * labeled alternative in `MySqlParser.selectIntoExpression`.
     * @param ctx the parse tree
     */
    exitSelectIntoDumpFile;
    /**
     * Enter a parse tree produced by the `selectIntoTextFile`
     * labeled alternative in `MySqlParser.selectIntoExpression`.
     * @param ctx the parse tree
     */
    enterSelectIntoTextFile;
    /**
     * Exit a parse tree produced by the `selectIntoTextFile`
     * labeled alternative in `MySqlParser.selectIntoExpression`.
     * @param ctx the parse tree
     */
    exitSelectIntoTextFile;
    /**
     * Enter a parse tree produced by `MySqlParser.selectFieldsInto`.
     * @param ctx the parse tree
     */
    enterSelectFieldsInto;
    /**
     * Exit a parse tree produced by `MySqlParser.selectFieldsInto`.
     * @param ctx the parse tree
     */
    exitSelectFieldsInto;
    /**
     * Enter a parse tree produced by `MySqlParser.selectLinesInto`.
     * @param ctx the parse tree
     */
    enterSelectLinesInto;
    /**
     * Exit a parse tree produced by `MySqlParser.selectLinesInto`.
     * @param ctx the parse tree
     */
    exitSelectLinesInto;
    /**
     * Enter a parse tree produced by `MySqlParser.fromClause`.
     * @param ctx the parse tree
     */
    enterFromClause;
    /**
     * Exit a parse tree produced by `MySqlParser.fromClause`.
     * @param ctx the parse tree
     */
    exitFromClause;
    /**
     * Enter a parse tree produced by `MySqlParser.groupByClause`.
     * @param ctx the parse tree
     */
    enterGroupByClause;
    /**
     * Exit a parse tree produced by `MySqlParser.groupByClause`.
     * @param ctx the parse tree
     */
    exitGroupByClause;
    /**
     * Enter a parse tree produced by `MySqlParser.havingClause`.
     * @param ctx the parse tree
     */
    enterHavingClause;
    /**
     * Exit a parse tree produced by `MySqlParser.havingClause`.
     * @param ctx the parse tree
     */
    exitHavingClause;
    /**
     * Enter a parse tree produced by `MySqlParser.windowClause`.
     * @param ctx the parse tree
     */
    enterWindowClause;
    /**
     * Exit a parse tree produced by `MySqlParser.windowClause`.
     * @param ctx the parse tree
     */
    exitWindowClause;
    /**
     * Enter a parse tree produced by `MySqlParser.groupByItem`.
     * @param ctx the parse tree
     */
    enterGroupByItem;
    /**
     * Exit a parse tree produced by `MySqlParser.groupByItem`.
     * @param ctx the parse tree
     */
    exitGroupByItem;
    /**
     * Enter a parse tree produced by `MySqlParser.limitClause`.
     * @param ctx the parse tree
     */
    enterLimitClause;
    /**
     * Exit a parse tree produced by `MySqlParser.limitClause`.
     * @param ctx the parse tree
     */
    exitLimitClause;
    /**
     * Enter a parse tree produced by `MySqlParser.limitClauseAtom`.
     * @param ctx the parse tree
     */
    enterLimitClauseAtom;
    /**
     * Exit a parse tree produced by `MySqlParser.limitClauseAtom`.
     * @param ctx the parse tree
     */
    exitLimitClauseAtom;
    /**
     * Enter a parse tree produced by `MySqlParser.startTransaction`.
     * @param ctx the parse tree
     */
    enterStartTransaction;
    /**
     * Exit a parse tree produced by `MySqlParser.startTransaction`.
     * @param ctx the parse tree
     */
    exitStartTransaction;
    /**
     * Enter a parse tree produced by `MySqlParser.beginWork`.
     * @param ctx the parse tree
     */
    enterBeginWork;
    /**
     * Exit a parse tree produced by `MySqlParser.beginWork`.
     * @param ctx the parse tree
     */
    exitBeginWork;
    /**
     * Enter a parse tree produced by `MySqlParser.commitWork`.
     * @param ctx the parse tree
     */
    enterCommitWork;
    /**
     * Exit a parse tree produced by `MySqlParser.commitWork`.
     * @param ctx the parse tree
     */
    exitCommitWork;
    /**
     * Enter a parse tree produced by `MySqlParser.rollbackWork`.
     * @param ctx the parse tree
     */
    enterRollbackWork;
    /**
     * Exit a parse tree produced by `MySqlParser.rollbackWork`.
     * @param ctx the parse tree
     */
    exitRollbackWork;
    /**
     * Enter a parse tree produced by `MySqlParser.savepointStatement`.
     * @param ctx the parse tree
     */
    enterSavepointStatement;
    /**
     * Exit a parse tree produced by `MySqlParser.savepointStatement`.
     * @param ctx the parse tree
     */
    exitSavepointStatement;
    /**
     * Enter a parse tree produced by `MySqlParser.rollbackStatement`.
     * @param ctx the parse tree
     */
    enterRollbackStatement;
    /**
     * Exit a parse tree produced by `MySqlParser.rollbackStatement`.
     * @param ctx the parse tree
     */
    exitRollbackStatement;
    /**
     * Enter a parse tree produced by `MySqlParser.releaseStatement`.
     * @param ctx the parse tree
     */
    enterReleaseStatement;
    /**
     * Exit a parse tree produced by `MySqlParser.releaseStatement`.
     * @param ctx the parse tree
     */
    exitReleaseStatement;
    /**
     * Enter a parse tree produced by `MySqlParser.lockTables`.
     * @param ctx the parse tree
     */
    enterLockTables;
    /**
     * Exit a parse tree produced by `MySqlParser.lockTables`.
     * @param ctx the parse tree
     */
    exitLockTables;
    /**
     * Enter a parse tree produced by `MySqlParser.unlockTables`.
     * @param ctx the parse tree
     */
    enterUnlockTables;
    /**
     * Exit a parse tree produced by `MySqlParser.unlockTables`.
     * @param ctx the parse tree
     */
    exitUnlockTables;
    /**
     * Enter a parse tree produced by `MySqlParser.setAutocommitStatement`.
     * @param ctx the parse tree
     */
    enterSetAutocommitStatement;
    /**
     * Exit a parse tree produced by `MySqlParser.setAutocommitStatement`.
     * @param ctx the parse tree
     */
    exitSetAutocommitStatement;
    /**
     * Enter a parse tree produced by `MySqlParser.setTransactionStatement`.
     * @param ctx the parse tree
     */
    enterSetTransactionStatement;
    /**
     * Exit a parse tree produced by `MySqlParser.setTransactionStatement`.
     * @param ctx the parse tree
     */
    exitSetTransactionStatement;
    /**
     * Enter a parse tree produced by `MySqlParser.transactionMode`.
     * @param ctx the parse tree
     */
    enterTransactionMode;
    /**
     * Exit a parse tree produced by `MySqlParser.transactionMode`.
     * @param ctx the parse tree
     */
    exitTransactionMode;
    /**
     * Enter a parse tree produced by `MySqlParser.lockTableElement`.
     * @param ctx the parse tree
     */
    enterLockTableElement;
    /**
     * Exit a parse tree produced by `MySqlParser.lockTableElement`.
     * @param ctx the parse tree
     */
    exitLockTableElement;
    /**
     * Enter a parse tree produced by `MySqlParser.lockAction`.
     * @param ctx the parse tree
     */
    enterLockAction;
    /**
     * Exit a parse tree produced by `MySqlParser.lockAction`.
     * @param ctx the parse tree
     */
    exitLockAction;
    /**
     * Enter a parse tree produced by `MySqlParser.transactionOption`.
     * @param ctx the parse tree
     */
    enterTransactionOption;
    /**
     * Exit a parse tree produced by `MySqlParser.transactionOption`.
     * @param ctx the parse tree
     */
    exitTransactionOption;
    /**
     * Enter a parse tree produced by `MySqlParser.transactionLevel`.
     * @param ctx the parse tree
     */
    enterTransactionLevel;
    /**
     * Exit a parse tree produced by `MySqlParser.transactionLevel`.
     * @param ctx the parse tree
     */
    exitTransactionLevel;
    /**
     * Enter a parse tree produced by `MySqlParser.changeMaster`.
     * @param ctx the parse tree
     */
    enterChangeMaster;
    /**
     * Exit a parse tree produced by `MySqlParser.changeMaster`.
     * @param ctx the parse tree
     */
    exitChangeMaster;
    /**
     * Enter a parse tree produced by `MySqlParser.changeReplicationFilter`.
     * @param ctx the parse tree
     */
    enterChangeReplicationFilter;
    /**
     * Exit a parse tree produced by `MySqlParser.changeReplicationFilter`.
     * @param ctx the parse tree
     */
    exitChangeReplicationFilter;
    /**
     * Enter a parse tree produced by `MySqlParser.purgeBinaryLogs`.
     * @param ctx the parse tree
     */
    enterPurgeBinaryLogs;
    /**
     * Exit a parse tree produced by `MySqlParser.purgeBinaryLogs`.
     * @param ctx the parse tree
     */
    exitPurgeBinaryLogs;
    /**
     * Enter a parse tree produced by `MySqlParser.resetMaster`.
     * @param ctx the parse tree
     */
    enterResetMaster;
    /**
     * Exit a parse tree produced by `MySqlParser.resetMaster`.
     * @param ctx the parse tree
     */
    exitResetMaster;
    /**
     * Enter a parse tree produced by `MySqlParser.resetSlave`.
     * @param ctx the parse tree
     */
    enterResetSlave;
    /**
     * Exit a parse tree produced by `MySqlParser.resetSlave`.
     * @param ctx the parse tree
     */
    exitResetSlave;
    /**
     * Enter a parse tree produced by `MySqlParser.startSlave`.
     * @param ctx the parse tree
     */
    enterStartSlave;
    /**
     * Exit a parse tree produced by `MySqlParser.startSlave`.
     * @param ctx the parse tree
     */
    exitStartSlave;
    /**
     * Enter a parse tree produced by `MySqlParser.stopSlave`.
     * @param ctx the parse tree
     */
    enterStopSlave;
    /**
     * Exit a parse tree produced by `MySqlParser.stopSlave`.
     * @param ctx the parse tree
     */
    exitStopSlave;
    /**
     * Enter a parse tree produced by `MySqlParser.startGroupReplication`.
     * @param ctx the parse tree
     */
    enterStartGroupReplication;
    /**
     * Exit a parse tree produced by `MySqlParser.startGroupReplication`.
     * @param ctx the parse tree
     */
    exitStartGroupReplication;
    /**
     * Enter a parse tree produced by `MySqlParser.stopGroupReplication`.
     * @param ctx the parse tree
     */
    enterStopGroupReplication;
    /**
     * Exit a parse tree produced by `MySqlParser.stopGroupReplication`.
     * @param ctx the parse tree
     */
    exitStopGroupReplication;
    /**
     * Enter a parse tree produced by the `masterStringOption`
     * labeled alternative in `MySqlParser.masterOption`.
     * @param ctx the parse tree
     */
    enterMasterStringOption;
    /**
     * Exit a parse tree produced by the `masterStringOption`
     * labeled alternative in `MySqlParser.masterOption`.
     * @param ctx the parse tree
     */
    exitMasterStringOption;
    /**
     * Enter a parse tree produced by the `masterDecimalOption`
     * labeled alternative in `MySqlParser.masterOption`.
     * @param ctx the parse tree
     */
    enterMasterDecimalOption;
    /**
     * Exit a parse tree produced by the `masterDecimalOption`
     * labeled alternative in `MySqlParser.masterOption`.
     * @param ctx the parse tree
     */
    exitMasterDecimalOption;
    /**
     * Enter a parse tree produced by the `masterBoolOption`
     * labeled alternative in `MySqlParser.masterOption`.
     * @param ctx the parse tree
     */
    enterMasterBoolOption;
    /**
     * Exit a parse tree produced by the `masterBoolOption`
     * labeled alternative in `MySqlParser.masterOption`.
     * @param ctx the parse tree
     */
    exitMasterBoolOption;
    /**
     * Enter a parse tree produced by the `masterRealOption`
     * labeled alternative in `MySqlParser.masterOption`.
     * @param ctx the parse tree
     */
    enterMasterRealOption;
    /**
     * Exit a parse tree produced by the `masterRealOption`
     * labeled alternative in `MySqlParser.masterOption`.
     * @param ctx the parse tree
     */
    exitMasterRealOption;
    /**
     * Enter a parse tree produced by the `masterUidListOption`
     * labeled alternative in `MySqlParser.masterOption`.
     * @param ctx the parse tree
     */
    enterMasterUidListOption;
    /**
     * Exit a parse tree produced by the `masterUidListOption`
     * labeled alternative in `MySqlParser.masterOption`.
     * @param ctx the parse tree
     */
    exitMasterUidListOption;
    /**
     * Enter a parse tree produced by `MySqlParser.stringMasterOption`.
     * @param ctx the parse tree
     */
    enterStringMasterOption;
    /**
     * Exit a parse tree produced by `MySqlParser.stringMasterOption`.
     * @param ctx the parse tree
     */
    exitStringMasterOption;
    /**
     * Enter a parse tree produced by `MySqlParser.decimalMasterOption`.
     * @param ctx the parse tree
     */
    enterDecimalMasterOption;
    /**
     * Exit a parse tree produced by `MySqlParser.decimalMasterOption`.
     * @param ctx the parse tree
     */
    exitDecimalMasterOption;
    /**
     * Enter a parse tree produced by `MySqlParser.boolMasterOption`.
     * @param ctx the parse tree
     */
    enterBoolMasterOption;
    /**
     * Exit a parse tree produced by `MySqlParser.boolMasterOption`.
     * @param ctx the parse tree
     */
    exitBoolMasterOption;
    /**
     * Enter a parse tree produced by `MySqlParser.channelOption`.
     * @param ctx the parse tree
     */
    enterChannelOption;
    /**
     * Exit a parse tree produced by `MySqlParser.channelOption`.
     * @param ctx the parse tree
     */
    exitChannelOption;
    /**
     * Enter a parse tree produced by the `doDbReplication`
     * labeled alternative in `MySqlParser.replicationFilter`.
     * @param ctx the parse tree
     */
    enterDoDbReplication;
    /**
     * Exit a parse tree produced by the `doDbReplication`
     * labeled alternative in `MySqlParser.replicationFilter`.
     * @param ctx the parse tree
     */
    exitDoDbReplication;
    /**
     * Enter a parse tree produced by the `ignoreDbReplication`
     * labeled alternative in `MySqlParser.replicationFilter`.
     * @param ctx the parse tree
     */
    enterIgnoreDbReplication;
    /**
     * Exit a parse tree produced by the `ignoreDbReplication`
     * labeled alternative in `MySqlParser.replicationFilter`.
     * @param ctx the parse tree
     */
    exitIgnoreDbReplication;
    /**
     * Enter a parse tree produced by the `doTableReplication`
     * labeled alternative in `MySqlParser.replicationFilter`.
     * @param ctx the parse tree
     */
    enterDoTableReplication;
    /**
     * Exit a parse tree produced by the `doTableReplication`
     * labeled alternative in `MySqlParser.replicationFilter`.
     * @param ctx the parse tree
     */
    exitDoTableReplication;
    /**
     * Enter a parse tree produced by the `ignoreTableReplication`
     * labeled alternative in `MySqlParser.replicationFilter`.
     * @param ctx the parse tree
     */
    enterIgnoreTableReplication;
    /**
     * Exit a parse tree produced by the `ignoreTableReplication`
     * labeled alternative in `MySqlParser.replicationFilter`.
     * @param ctx the parse tree
     */
    exitIgnoreTableReplication;
    /**
     * Enter a parse tree produced by the `wildDoTableReplication`
     * labeled alternative in `MySqlParser.replicationFilter`.
     * @param ctx the parse tree
     */
    enterWildDoTableReplication;
    /**
     * Exit a parse tree produced by the `wildDoTableReplication`
     * labeled alternative in `MySqlParser.replicationFilter`.
     * @param ctx the parse tree
     */
    exitWildDoTableReplication;
    /**
     * Enter a parse tree produced by the `wildIgnoreTableReplication`
     * labeled alternative in `MySqlParser.replicationFilter`.
     * @param ctx the parse tree
     */
    enterWildIgnoreTableReplication;
    /**
     * Exit a parse tree produced by the `wildIgnoreTableReplication`
     * labeled alternative in `MySqlParser.replicationFilter`.
     * @param ctx the parse tree
     */
    exitWildIgnoreTableReplication;
    /**
     * Enter a parse tree produced by the `rewriteDbReplication`
     * labeled alternative in `MySqlParser.replicationFilter`.
     * @param ctx the parse tree
     */
    enterRewriteDbReplication;
    /**
     * Exit a parse tree produced by the `rewriteDbReplication`
     * labeled alternative in `MySqlParser.replicationFilter`.
     * @param ctx the parse tree
     */
    exitRewriteDbReplication;
    /**
     * Enter a parse tree produced by `MySqlParser.tablePair`.
     * @param ctx the parse tree
     */
    enterTablePair;
    /**
     * Exit a parse tree produced by `MySqlParser.tablePair`.
     * @param ctx the parse tree
     */
    exitTablePair;
    /**
     * Enter a parse tree produced by `MySqlParser.threadType`.
     * @param ctx the parse tree
     */
    enterThreadType;
    /**
     * Exit a parse tree produced by `MySqlParser.threadType`.
     * @param ctx the parse tree
     */
    exitThreadType;
    /**
     * Enter a parse tree produced by the `gtidsUntilOption`
     * labeled alternative in `MySqlParser.untilOption`.
     * @param ctx the parse tree
     */
    enterGtidsUntilOption;
    /**
     * Exit a parse tree produced by the `gtidsUntilOption`
     * labeled alternative in `MySqlParser.untilOption`.
     * @param ctx the parse tree
     */
    exitGtidsUntilOption;
    /**
     * Enter a parse tree produced by the `masterLogUntilOption`
     * labeled alternative in `MySqlParser.untilOption`.
     * @param ctx the parse tree
     */
    enterMasterLogUntilOption;
    /**
     * Exit a parse tree produced by the `masterLogUntilOption`
     * labeled alternative in `MySqlParser.untilOption`.
     * @param ctx the parse tree
     */
    exitMasterLogUntilOption;
    /**
     * Enter a parse tree produced by the `relayLogUntilOption`
     * labeled alternative in `MySqlParser.untilOption`.
     * @param ctx the parse tree
     */
    enterRelayLogUntilOption;
    /**
     * Exit a parse tree produced by the `relayLogUntilOption`
     * labeled alternative in `MySqlParser.untilOption`.
     * @param ctx the parse tree
     */
    exitRelayLogUntilOption;
    /**
     * Enter a parse tree produced by the `sqlGapsUntilOption`
     * labeled alternative in `MySqlParser.untilOption`.
     * @param ctx the parse tree
     */
    enterSqlGapsUntilOption;
    /**
     * Exit a parse tree produced by the `sqlGapsUntilOption`
     * labeled alternative in `MySqlParser.untilOption`.
     * @param ctx the parse tree
     */
    exitSqlGapsUntilOption;
    /**
     * Enter a parse tree produced by the `userConnectionOption`
     * labeled alternative in `MySqlParser.connectionOption`.
     * @param ctx the parse tree
     */
    enterUserConnectionOption;
    /**
     * Exit a parse tree produced by the `userConnectionOption`
     * labeled alternative in `MySqlParser.connectionOption`.
     * @param ctx the parse tree
     */
    exitUserConnectionOption;
    /**
     * Enter a parse tree produced by the `passwordConnectionOption`
     * labeled alternative in `MySqlParser.connectionOption`.
     * @param ctx the parse tree
     */
    enterPasswordConnectionOption;
    /**
     * Exit a parse tree produced by the `passwordConnectionOption`
     * labeled alternative in `MySqlParser.connectionOption`.
     * @param ctx the parse tree
     */
    exitPasswordConnectionOption;
    /**
     * Enter a parse tree produced by the `defaultAuthConnectionOption`
     * labeled alternative in `MySqlParser.connectionOption`.
     * @param ctx the parse tree
     */
    enterDefaultAuthConnectionOption;
    /**
     * Exit a parse tree produced by the `defaultAuthConnectionOption`
     * labeled alternative in `MySqlParser.connectionOption`.
     * @param ctx the parse tree
     */
    exitDefaultAuthConnectionOption;
    /**
     * Enter a parse tree produced by the `pluginDirConnectionOption`
     * labeled alternative in `MySqlParser.connectionOption`.
     * @param ctx the parse tree
     */
    enterPluginDirConnectionOption;
    /**
     * Exit a parse tree produced by the `pluginDirConnectionOption`
     * labeled alternative in `MySqlParser.connectionOption`.
     * @param ctx the parse tree
     */
    exitPluginDirConnectionOption;
    /**
     * Enter a parse tree produced by `MySqlParser.gtuidSet`.
     * @param ctx the parse tree
     */
    enterGtuidSet;
    /**
     * Exit a parse tree produced by `MySqlParser.gtuidSet`.
     * @param ctx the parse tree
     */
    exitGtuidSet;
    /**
     * Enter a parse tree produced by `MySqlParser.xaStartTransaction`.
     * @param ctx the parse tree
     */
    enterXaStartTransaction;
    /**
     * Exit a parse tree produced by `MySqlParser.xaStartTransaction`.
     * @param ctx the parse tree
     */
    exitXaStartTransaction;
    /**
     * Enter a parse tree produced by `MySqlParser.xaEndTransaction`.
     * @param ctx the parse tree
     */
    enterXaEndTransaction;
    /**
     * Exit a parse tree produced by `MySqlParser.xaEndTransaction`.
     * @param ctx the parse tree
     */
    exitXaEndTransaction;
    /**
     * Enter a parse tree produced by `MySqlParser.xaPrepareStatement`.
     * @param ctx the parse tree
     */
    enterXaPrepareStatement;
    /**
     * Exit a parse tree produced by `MySqlParser.xaPrepareStatement`.
     * @param ctx the parse tree
     */
    exitXaPrepareStatement;
    /**
     * Enter a parse tree produced by `MySqlParser.xaCommitWork`.
     * @param ctx the parse tree
     */
    enterXaCommitWork;
    /**
     * Exit a parse tree produced by `MySqlParser.xaCommitWork`.
     * @param ctx the parse tree
     */
    exitXaCommitWork;
    /**
     * Enter a parse tree produced by `MySqlParser.xaRollbackWork`.
     * @param ctx the parse tree
     */
    enterXaRollbackWork;
    /**
     * Exit a parse tree produced by `MySqlParser.xaRollbackWork`.
     * @param ctx the parse tree
     */
    exitXaRollbackWork;
    /**
     * Enter a parse tree produced by `MySqlParser.xaRecoverWork`.
     * @param ctx the parse tree
     */
    enterXaRecoverWork;
    /**
     * Exit a parse tree produced by `MySqlParser.xaRecoverWork`.
     * @param ctx the parse tree
     */
    exitXaRecoverWork;
    /**
     * Enter a parse tree produced by `MySqlParser.prepareStatement`.
     * @param ctx the parse tree
     */
    enterPrepareStatement;
    /**
     * Exit a parse tree produced by `MySqlParser.prepareStatement`.
     * @param ctx the parse tree
     */
    exitPrepareStatement;
    /**
     * Enter a parse tree produced by `MySqlParser.executeStatement`.
     * @param ctx the parse tree
     */
    enterExecuteStatement;
    /**
     * Exit a parse tree produced by `MySqlParser.executeStatement`.
     * @param ctx the parse tree
     */
    exitExecuteStatement;
    /**
     * Enter a parse tree produced by `MySqlParser.deallocatePrepare`.
     * @param ctx the parse tree
     */
    enterDeallocatePrepare;
    /**
     * Exit a parse tree produced by `MySqlParser.deallocatePrepare`.
     * @param ctx the parse tree
     */
    exitDeallocatePrepare;
    /**
     * Enter a parse tree produced by `MySqlParser.routineBody`.
     * @param ctx the parse tree
     */
    enterRoutineBody;
    /**
     * Exit a parse tree produced by `MySqlParser.routineBody`.
     * @param ctx the parse tree
     */
    exitRoutineBody;
    /**
     * Enter a parse tree produced by `MySqlParser.blockStatement`.
     * @param ctx the parse tree
     */
    enterBlockStatement;
    /**
     * Exit a parse tree produced by `MySqlParser.blockStatement`.
     * @param ctx the parse tree
     */
    exitBlockStatement;
    /**
     * Enter a parse tree produced by `MySqlParser.caseStatement`.
     * @param ctx the parse tree
     */
    enterCaseStatement;
    /**
     * Exit a parse tree produced by `MySqlParser.caseStatement`.
     * @param ctx the parse tree
     */
    exitCaseStatement;
    /**
     * Enter a parse tree produced by `MySqlParser.ifStatement`.
     * @param ctx the parse tree
     */
    enterIfStatement;
    /**
     * Exit a parse tree produced by `MySqlParser.ifStatement`.
     * @param ctx the parse tree
     */
    exitIfStatement;
    /**
     * Enter a parse tree produced by `MySqlParser.iterateStatement`.
     * @param ctx the parse tree
     */
    enterIterateStatement;
    /**
     * Exit a parse tree produced by `MySqlParser.iterateStatement`.
     * @param ctx the parse tree
     */
    exitIterateStatement;
    /**
     * Enter a parse tree produced by `MySqlParser.leaveStatement`.
     * @param ctx the parse tree
     */
    enterLeaveStatement;
    /**
     * Exit a parse tree produced by `MySqlParser.leaveStatement`.
     * @param ctx the parse tree
     */
    exitLeaveStatement;
    /**
     * Enter a parse tree produced by `MySqlParser.loopStatement`.
     * @param ctx the parse tree
     */
    enterLoopStatement;
    /**
     * Exit a parse tree produced by `MySqlParser.loopStatement`.
     * @param ctx the parse tree
     */
    exitLoopStatement;
    /**
     * Enter a parse tree produced by `MySqlParser.repeatStatement`.
     * @param ctx the parse tree
     */
    enterRepeatStatement;
    /**
     * Exit a parse tree produced by `MySqlParser.repeatStatement`.
     * @param ctx the parse tree
     */
    exitRepeatStatement;
    /**
     * Enter a parse tree produced by `MySqlParser.returnStatement`.
     * @param ctx the parse tree
     */
    enterReturnStatement;
    /**
     * Exit a parse tree produced by `MySqlParser.returnStatement`.
     * @param ctx the parse tree
     */
    exitReturnStatement;
    /**
     * Enter a parse tree produced by `MySqlParser.whileStatement`.
     * @param ctx the parse tree
     */
    enterWhileStatement;
    /**
     * Exit a parse tree produced by `MySqlParser.whileStatement`.
     * @param ctx the parse tree
     */
    exitWhileStatement;
    /**
     * Enter a parse tree produced by the `CloseCursor`
     * labeled alternative in `MySqlParser.cursorStatement`.
     * @param ctx the parse tree
     */
    enterCloseCursor;
    /**
     * Exit a parse tree produced by the `CloseCursor`
     * labeled alternative in `MySqlParser.cursorStatement`.
     * @param ctx the parse tree
     */
    exitCloseCursor;
    /**
     * Enter a parse tree produced by the `FetchCursor`
     * labeled alternative in `MySqlParser.cursorStatement`.
     * @param ctx the parse tree
     */
    enterFetchCursor;
    /**
     * Exit a parse tree produced by the `FetchCursor`
     * labeled alternative in `MySqlParser.cursorStatement`.
     * @param ctx the parse tree
     */
    exitFetchCursor;
    /**
     * Enter a parse tree produced by the `OpenCursor`
     * labeled alternative in `MySqlParser.cursorStatement`.
     * @param ctx the parse tree
     */
    enterOpenCursor;
    /**
     * Exit a parse tree produced by the `OpenCursor`
     * labeled alternative in `MySqlParser.cursorStatement`.
     * @param ctx the parse tree
     */
    exitOpenCursor;
    /**
     * Enter a parse tree produced by `MySqlParser.declareVariable`.
     * @param ctx the parse tree
     */
    enterDeclareVariable;
    /**
     * Exit a parse tree produced by `MySqlParser.declareVariable`.
     * @param ctx the parse tree
     */
    exitDeclareVariable;
    /**
     * Enter a parse tree produced by `MySqlParser.declareCondition`.
     * @param ctx the parse tree
     */
    enterDeclareCondition;
    /**
     * Exit a parse tree produced by `MySqlParser.declareCondition`.
     * @param ctx the parse tree
     */
    exitDeclareCondition;
    /**
     * Enter a parse tree produced by `MySqlParser.declareCursor`.
     * @param ctx the parse tree
     */
    enterDeclareCursor;
    /**
     * Exit a parse tree produced by `MySqlParser.declareCursor`.
     * @param ctx the parse tree
     */
    exitDeclareCursor;
    /**
     * Enter a parse tree produced by `MySqlParser.declareHandler`.
     * @param ctx the parse tree
     */
    enterDeclareHandler;
    /**
     * Exit a parse tree produced by `MySqlParser.declareHandler`.
     * @param ctx the parse tree
     */
    exitDeclareHandler;
    /**
     * Enter a parse tree produced by the `handlerConditionCode`
     * labeled alternative in `MySqlParser.handlerConditionValue`.
     * @param ctx the parse tree
     */
    enterHandlerConditionCode;
    /**
     * Exit a parse tree produced by the `handlerConditionCode`
     * labeled alternative in `MySqlParser.handlerConditionValue`.
     * @param ctx the parse tree
     */
    exitHandlerConditionCode;
    /**
     * Enter a parse tree produced by the `handlerConditionState`
     * labeled alternative in `MySqlParser.handlerConditionValue`.
     * @param ctx the parse tree
     */
    enterHandlerConditionState;
    /**
     * Exit a parse tree produced by the `handlerConditionState`
     * labeled alternative in `MySqlParser.handlerConditionValue`.
     * @param ctx the parse tree
     */
    exitHandlerConditionState;
    /**
     * Enter a parse tree produced by the `handlerConditionName`
     * labeled alternative in `MySqlParser.handlerConditionValue`.
     * @param ctx the parse tree
     */
    enterHandlerConditionName;
    /**
     * Exit a parse tree produced by the `handlerConditionName`
     * labeled alternative in `MySqlParser.handlerConditionValue`.
     * @param ctx the parse tree
     */
    exitHandlerConditionName;
    /**
     * Enter a parse tree produced by the `handlerConditionWarning`
     * labeled alternative in `MySqlParser.handlerConditionValue`.
     * @param ctx the parse tree
     */
    enterHandlerConditionWarning;
    /**
     * Exit a parse tree produced by the `handlerConditionWarning`
     * labeled alternative in `MySqlParser.handlerConditionValue`.
     * @param ctx the parse tree
     */
    exitHandlerConditionWarning;
    /**
     * Enter a parse tree produced by the `handlerConditionNotfound`
     * labeled alternative in `MySqlParser.handlerConditionValue`.
     * @param ctx the parse tree
     */
    enterHandlerConditionNotfound;
    /**
     * Exit a parse tree produced by the `handlerConditionNotfound`
     * labeled alternative in `MySqlParser.handlerConditionValue`.
     * @param ctx the parse tree
     */
    exitHandlerConditionNotfound;
    /**
     * Enter a parse tree produced by the `handlerConditionException`
     * labeled alternative in `MySqlParser.handlerConditionValue`.
     * @param ctx the parse tree
     */
    enterHandlerConditionException;
    /**
     * Exit a parse tree produced by the `handlerConditionException`
     * labeled alternative in `MySqlParser.handlerConditionValue`.
     * @param ctx the parse tree
     */
    exitHandlerConditionException;
    /**
     * Enter a parse tree produced by `MySqlParser.procedureSqlStatement`.
     * @param ctx the parse tree
     */
    enterProcedureSqlStatement;
    /**
     * Exit a parse tree produced by `MySqlParser.procedureSqlStatement`.
     * @param ctx the parse tree
     */
    exitProcedureSqlStatement;
    /**
     * Enter a parse tree produced by `MySqlParser.caseAlternative`.
     * @param ctx the parse tree
     */
    enterCaseAlternative;
    /**
     * Exit a parse tree produced by `MySqlParser.caseAlternative`.
     * @param ctx the parse tree
     */
    exitCaseAlternative;
    /**
     * Enter a parse tree produced by `MySqlParser.elifAlternative`.
     * @param ctx the parse tree
     */
    enterElifAlternative;
    /**
     * Exit a parse tree produced by `MySqlParser.elifAlternative`.
     * @param ctx the parse tree
     */
    exitElifAlternative;
    /**
     * Enter a parse tree produced by the `alterUserMysqlV56`
     * labeled alternative in `MySqlParser.alterUser`.
     * @param ctx the parse tree
     */
    enterAlterUserMysqlV56;
    /**
     * Exit a parse tree produced by the `alterUserMysqlV56`
     * labeled alternative in `MySqlParser.alterUser`.
     * @param ctx the parse tree
     */
    exitAlterUserMysqlV56;
    /**
     * Enter a parse tree produced by the `alterUserMysqlV80`
     * labeled alternative in `MySqlParser.alterUser`.
     * @param ctx the parse tree
     */
    enterAlterUserMysqlV80;
    /**
     * Exit a parse tree produced by the `alterUserMysqlV80`
     * labeled alternative in `MySqlParser.alterUser`.
     * @param ctx the parse tree
     */
    exitAlterUserMysqlV80;
    /**
     * Enter a parse tree produced by the `createUserMysqlV56`
     * labeled alternative in `MySqlParser.createUser`.
     * @param ctx the parse tree
     */
    enterCreateUserMysqlV56;
    /**
     * Exit a parse tree produced by the `createUserMysqlV56`
     * labeled alternative in `MySqlParser.createUser`.
     * @param ctx the parse tree
     */
    exitCreateUserMysqlV56;
    /**
     * Enter a parse tree produced by the `createUserMysqlV80`
     * labeled alternative in `MySqlParser.createUser`.
     * @param ctx the parse tree
     */
    enterCreateUserMysqlV80;
    /**
     * Exit a parse tree produced by the `createUserMysqlV80`
     * labeled alternative in `MySqlParser.createUser`.
     * @param ctx the parse tree
     */
    exitCreateUserMysqlV80;
    /**
     * Enter a parse tree produced by `MySqlParser.dropUser`.
     * @param ctx the parse tree
     */
    enterDropUser;
    /**
     * Exit a parse tree produced by `MySqlParser.dropUser`.
     * @param ctx the parse tree
     */
    exitDropUser;
    /**
     * Enter a parse tree produced by `MySqlParser.grantStatement`.
     * @param ctx the parse tree
     */
    enterGrantStatement;
    /**
     * Exit a parse tree produced by `MySqlParser.grantStatement`.
     * @param ctx the parse tree
     */
    exitGrantStatement;
    /**
     * Enter a parse tree produced by `MySqlParser.roleOption`.
     * @param ctx the parse tree
     */
    enterRoleOption;
    /**
     * Exit a parse tree produced by `MySqlParser.roleOption`.
     * @param ctx the parse tree
     */
    exitRoleOption;
    /**
     * Enter a parse tree produced by `MySqlParser.grantProxy`.
     * @param ctx the parse tree
     */
    enterGrantProxy;
    /**
     * Exit a parse tree produced by `MySqlParser.grantProxy`.
     * @param ctx the parse tree
     */
    exitGrantProxy;
    /**
     * Enter a parse tree produced by `MySqlParser.renameUser`.
     * @param ctx the parse tree
     */
    enterRenameUser;
    /**
     * Exit a parse tree produced by `MySqlParser.renameUser`.
     * @param ctx the parse tree
     */
    exitRenameUser;
    /**
     * Enter a parse tree produced by the `detailRevoke`
     * labeled alternative in `MySqlParser.revokeStatement`.
     * @param ctx the parse tree
     */
    enterDetailRevoke;
    /**
     * Exit a parse tree produced by the `detailRevoke`
     * labeled alternative in `MySqlParser.revokeStatement`.
     * @param ctx the parse tree
     */
    exitDetailRevoke;
    /**
     * Enter a parse tree produced by the `shortRevoke`
     * labeled alternative in `MySqlParser.revokeStatement`.
     * @param ctx the parse tree
     */
    enterShortRevoke;
    /**
     * Exit a parse tree produced by the `shortRevoke`
     * labeled alternative in `MySqlParser.revokeStatement`.
     * @param ctx the parse tree
     */
    exitShortRevoke;
    /**
     * Enter a parse tree produced by the `roleRevoke`
     * labeled alternative in `MySqlParser.revokeStatement`.
     * @param ctx the parse tree
     */
    enterRoleRevoke;
    /**
     * Exit a parse tree produced by the `roleRevoke`
     * labeled alternative in `MySqlParser.revokeStatement`.
     * @param ctx the parse tree
     */
    exitRoleRevoke;
    /**
     * Enter a parse tree produced by `MySqlParser.revokeProxy`.
     * @param ctx the parse tree
     */
    enterRevokeProxy;
    /**
     * Exit a parse tree produced by `MySqlParser.revokeProxy`.
     * @param ctx the parse tree
     */
    exitRevokeProxy;
    /**
     * Enter a parse tree produced by `MySqlParser.setPasswordStatement`.
     * @param ctx the parse tree
     */
    enterSetPasswordStatement;
    /**
     * Exit a parse tree produced by `MySqlParser.setPasswordStatement`.
     * @param ctx the parse tree
     */
    exitSetPasswordStatement;
    /**
     * Enter a parse tree produced by `MySqlParser.userSpecification`.
     * @param ctx the parse tree
     */
    enterUserSpecification;
    /**
     * Exit a parse tree produced by `MySqlParser.userSpecification`.
     * @param ctx the parse tree
     */
    exitUserSpecification;
    /**
     * Enter a parse tree produced by the `hashAuthOption`
     * labeled alternative in `MySqlParser.userAuthOption`.
     * @param ctx the parse tree
     */
    enterHashAuthOption;
    /**
     * Exit a parse tree produced by the `hashAuthOption`
     * labeled alternative in `MySqlParser.userAuthOption`.
     * @param ctx the parse tree
     */
    exitHashAuthOption;
    /**
     * Enter a parse tree produced by the `randomAuthOption`
     * labeled alternative in `MySqlParser.userAuthOption`.
     * @param ctx the parse tree
     */
    enterRandomAuthOption;
    /**
     * Exit a parse tree produced by the `randomAuthOption`
     * labeled alternative in `MySqlParser.userAuthOption`.
     * @param ctx the parse tree
     */
    exitRandomAuthOption;
    /**
     * Enter a parse tree produced by the `stringAuthOption`
     * labeled alternative in `MySqlParser.userAuthOption`.
     * @param ctx the parse tree
     */
    enterStringAuthOption;
    /**
     * Exit a parse tree produced by the `stringAuthOption`
     * labeled alternative in `MySqlParser.userAuthOption`.
     * @param ctx the parse tree
     */
    exitStringAuthOption;
    /**
     * Enter a parse tree produced by the `moduleAuthOption`
     * labeled alternative in `MySqlParser.userAuthOption`.
     * @param ctx the parse tree
     */
    enterModuleAuthOption;
    /**
     * Exit a parse tree produced by the `moduleAuthOption`
     * labeled alternative in `MySqlParser.userAuthOption`.
     * @param ctx the parse tree
     */
    exitModuleAuthOption;
    /**
     * Enter a parse tree produced by the `simpleAuthOption`
     * labeled alternative in `MySqlParser.userAuthOption`.
     * @param ctx the parse tree
     */
    enterSimpleAuthOption;
    /**
     * Exit a parse tree produced by the `simpleAuthOption`
     * labeled alternative in `MySqlParser.userAuthOption`.
     * @param ctx the parse tree
     */
    exitSimpleAuthOption;
    /**
     * Enter a parse tree produced by `MySqlParser.authOptionClause`.
     * @param ctx the parse tree
     */
    enterAuthOptionClause;
    /**
     * Exit a parse tree produced by `MySqlParser.authOptionClause`.
     * @param ctx the parse tree
     */
    exitAuthOptionClause;
    /**
     * Enter a parse tree produced by the `module`
     * labeled alternative in `MySqlParser.authenticationRule`.
     * @param ctx the parse tree
     */
    enterModule;
    /**
     * Exit a parse tree produced by the `module`
     * labeled alternative in `MySqlParser.authenticationRule`.
     * @param ctx the parse tree
     */
    exitModule;
    /**
     * Enter a parse tree produced by the `passwordModuleOption`
     * labeled alternative in `MySqlParser.authenticationRule`.
     * @param ctx the parse tree
     */
    enterPasswordModuleOption;
    /**
     * Exit a parse tree produced by the `passwordModuleOption`
     * labeled alternative in `MySqlParser.authenticationRule`.
     * @param ctx the parse tree
     */
    exitPasswordModuleOption;
    /**
     * Enter a parse tree produced by `MySqlParser.tlsOption`.
     * @param ctx the parse tree
     */
    enterTlsOption;
    /**
     * Exit a parse tree produced by `MySqlParser.tlsOption`.
     * @param ctx the parse tree
     */
    exitTlsOption;
    /**
     * Enter a parse tree produced by `MySqlParser.userResourceOption`.
     * @param ctx the parse tree
     */
    enterUserResourceOption;
    /**
     * Exit a parse tree produced by `MySqlParser.userResourceOption`.
     * @param ctx the parse tree
     */
    exitUserResourceOption;
    /**
     * Enter a parse tree produced by `MySqlParser.userPasswordOption`.
     * @param ctx the parse tree
     */
    enterUserPasswordOption;
    /**
     * Exit a parse tree produced by `MySqlParser.userPasswordOption`.
     * @param ctx the parse tree
     */
    exitUserPasswordOption;
    /**
     * Enter a parse tree produced by `MySqlParser.userLockOption`.
     * @param ctx the parse tree
     */
    enterUserLockOption;
    /**
     * Exit a parse tree produced by `MySqlParser.userLockOption`.
     * @param ctx the parse tree
     */
    exitUserLockOption;
    /**
     * Enter a parse tree produced by `MySqlParser.privelegeClause`.
     * @param ctx the parse tree
     */
    enterPrivelegeClause;
    /**
     * Exit a parse tree produced by `MySqlParser.privelegeClause`.
     * @param ctx the parse tree
     */
    exitPrivelegeClause;
    /**
     * Enter a parse tree produced by `MySqlParser.privilege`.
     * @param ctx the parse tree
     */
    enterPrivilege;
    /**
     * Exit a parse tree produced by `MySqlParser.privilege`.
     * @param ctx the parse tree
     */
    exitPrivilege;
    /**
     * Enter a parse tree produced by the `currentSchemaPriviLevel`
     * labeled alternative in `MySqlParser.privilegeLevel`.
     * @param ctx the parse tree
     */
    enterCurrentSchemaPriviLevel;
    /**
     * Exit a parse tree produced by the `currentSchemaPriviLevel`
     * labeled alternative in `MySqlParser.privilegeLevel`.
     * @param ctx the parse tree
     */
    exitCurrentSchemaPriviLevel;
    /**
     * Enter a parse tree produced by the `globalPrivLevel`
     * labeled alternative in `MySqlParser.privilegeLevel`.
     * @param ctx the parse tree
     */
    enterGlobalPrivLevel;
    /**
     * Exit a parse tree produced by the `globalPrivLevel`
     * labeled alternative in `MySqlParser.privilegeLevel`.
     * @param ctx the parse tree
     */
    exitGlobalPrivLevel;
    /**
     * Enter a parse tree produced by the `definiteSchemaPrivLevel`
     * labeled alternative in `MySqlParser.privilegeLevel`.
     * @param ctx the parse tree
     */
    enterDefiniteSchemaPrivLevel;
    /**
     * Exit a parse tree produced by the `definiteSchemaPrivLevel`
     * labeled alternative in `MySqlParser.privilegeLevel`.
     * @param ctx the parse tree
     */
    exitDefiniteSchemaPrivLevel;
    /**
     * Enter a parse tree produced by the `definiteFullTablePrivLevel`
     * labeled alternative in `MySqlParser.privilegeLevel`.
     * @param ctx the parse tree
     */
    enterDefiniteFullTablePrivLevel;
    /**
     * Exit a parse tree produced by the `definiteFullTablePrivLevel`
     * labeled alternative in `MySqlParser.privilegeLevel`.
     * @param ctx the parse tree
     */
    exitDefiniteFullTablePrivLevel;
    /**
     * Enter a parse tree produced by the `definiteFullTablePrivLevel2`
     * labeled alternative in `MySqlParser.privilegeLevel`.
     * @param ctx the parse tree
     */
    enterDefiniteFullTablePrivLevel2;
    /**
     * Exit a parse tree produced by the `definiteFullTablePrivLevel2`
     * labeled alternative in `MySqlParser.privilegeLevel`.
     * @param ctx the parse tree
     */
    exitDefiniteFullTablePrivLevel2;
    /**
     * Enter a parse tree produced by the `definiteTablePrivLevel`
     * labeled alternative in `MySqlParser.privilegeLevel`.
     * @param ctx the parse tree
     */
    enterDefiniteTablePrivLevel;
    /**
     * Exit a parse tree produced by the `definiteTablePrivLevel`
     * labeled alternative in `MySqlParser.privilegeLevel`.
     * @param ctx the parse tree
     */
    exitDefiniteTablePrivLevel;
    /**
     * Enter a parse tree produced by `MySqlParser.renameUserClause`.
     * @param ctx the parse tree
     */
    enterRenameUserClause;
    /**
     * Exit a parse tree produced by `MySqlParser.renameUserClause`.
     * @param ctx the parse tree
     */
    exitRenameUserClause;
    /**
     * Enter a parse tree produced by `MySqlParser.analyzeTable`.
     * @param ctx the parse tree
     */
    enterAnalyzeTable;
    /**
     * Exit a parse tree produced by `MySqlParser.analyzeTable`.
     * @param ctx the parse tree
     */
    exitAnalyzeTable;
    /**
     * Enter a parse tree produced by `MySqlParser.checkTable`.
     * @param ctx the parse tree
     */
    enterCheckTable;
    /**
     * Exit a parse tree produced by `MySqlParser.checkTable`.
     * @param ctx the parse tree
     */
    exitCheckTable;
    /**
     * Enter a parse tree produced by `MySqlParser.checksumTable`.
     * @param ctx the parse tree
     */
    enterChecksumTable;
    /**
     * Exit a parse tree produced by `MySqlParser.checksumTable`.
     * @param ctx the parse tree
     */
    exitChecksumTable;
    /**
     * Enter a parse tree produced by `MySqlParser.optimizeTable`.
     * @param ctx the parse tree
     */
    enterOptimizeTable;
    /**
     * Exit a parse tree produced by `MySqlParser.optimizeTable`.
     * @param ctx the parse tree
     */
    exitOptimizeTable;
    /**
     * Enter a parse tree produced by `MySqlParser.repairTable`.
     * @param ctx the parse tree
     */
    enterRepairTable;
    /**
     * Exit a parse tree produced by `MySqlParser.repairTable`.
     * @param ctx the parse tree
     */
    exitRepairTable;
    /**
     * Enter a parse tree produced by `MySqlParser.checkTableOption`.
     * @param ctx the parse tree
     */
    enterCheckTableOption;
    /**
     * Exit a parse tree produced by `MySqlParser.checkTableOption`.
     * @param ctx the parse tree
     */
    exitCheckTableOption;
    /**
     * Enter a parse tree produced by `MySqlParser.createUdfunction`.
     * @param ctx the parse tree
     */
    enterCreateUdfunction;
    /**
     * Exit a parse tree produced by `MySqlParser.createUdfunction`.
     * @param ctx the parse tree
     */
    exitCreateUdfunction;
    /**
     * Enter a parse tree produced by `MySqlParser.installPlugin`.
     * @param ctx the parse tree
     */
    enterInstallPlugin;
    /**
     * Exit a parse tree produced by `MySqlParser.installPlugin`.
     * @param ctx the parse tree
     */
    exitInstallPlugin;
    /**
     * Enter a parse tree produced by `MySqlParser.uninstallPlugin`.
     * @param ctx the parse tree
     */
    enterUninstallPlugin;
    /**
     * Exit a parse tree produced by `MySqlParser.uninstallPlugin`.
     * @param ctx the parse tree
     */
    exitUninstallPlugin;
    /**
     * Enter a parse tree produced by the `setVariable`
     * labeled alternative in `MySqlParser.setStatement`.
     * @param ctx the parse tree
     */
    enterSetVariable;
    /**
     * Exit a parse tree produced by the `setVariable`
     * labeled alternative in `MySqlParser.setStatement`.
     * @param ctx the parse tree
     */
    exitSetVariable;
    /**
     * Enter a parse tree produced by the `setCharset`
     * labeled alternative in `MySqlParser.setStatement`.
     * @param ctx the parse tree
     */
    enterSetCharset;
    /**
     * Exit a parse tree produced by the `setCharset`
     * labeled alternative in `MySqlParser.setStatement`.
     * @param ctx the parse tree
     */
    exitSetCharset;
    /**
     * Enter a parse tree produced by the `setNames`
     * labeled alternative in `MySqlParser.setStatement`.
     * @param ctx the parse tree
     */
    enterSetNames;
    /**
     * Exit a parse tree produced by the `setNames`
     * labeled alternative in `MySqlParser.setStatement`.
     * @param ctx the parse tree
     */
    exitSetNames;
    /**
     * Enter a parse tree produced by the `setPassword`
     * labeled alternative in `MySqlParser.setStatement`.
     * @param ctx the parse tree
     */
    enterSetPassword;
    /**
     * Exit a parse tree produced by the `setPassword`
     * labeled alternative in `MySqlParser.setStatement`.
     * @param ctx the parse tree
     */
    exitSetPassword;
    /**
     * Enter a parse tree produced by the `setTransaction`
     * labeled alternative in `MySqlParser.setStatement`.
     * @param ctx the parse tree
     */
    enterSetTransaction;
    /**
     * Exit a parse tree produced by the `setTransaction`
     * labeled alternative in `MySqlParser.setStatement`.
     * @param ctx the parse tree
     */
    exitSetTransaction;
    /**
     * Enter a parse tree produced by the `setAutocommit`
     * labeled alternative in `MySqlParser.setStatement`.
     * @param ctx the parse tree
     */
    enterSetAutocommit;
    /**
     * Exit a parse tree produced by the `setAutocommit`
     * labeled alternative in `MySqlParser.setStatement`.
     * @param ctx the parse tree
     */
    exitSetAutocommit;
    /**
     * Enter a parse tree produced by the `setNewValueInsideTrigger`
     * labeled alternative in `MySqlParser.setStatement`.
     * @param ctx the parse tree
     */
    enterSetNewValueInsideTrigger;
    /**
     * Exit a parse tree produced by the `setNewValueInsideTrigger`
     * labeled alternative in `MySqlParser.setStatement`.
     * @param ctx the parse tree
     */
    exitSetNewValueInsideTrigger;
    /**
     * Enter a parse tree produced by the `showMasterLogs`
     * labeled alternative in `MySqlParser.showStatement`.
     * @param ctx the parse tree
     */
    enterShowMasterLogs;
    /**
     * Exit a parse tree produced by the `showMasterLogs`
     * labeled alternative in `MySqlParser.showStatement`.
     * @param ctx the parse tree
     */
    exitShowMasterLogs;
    /**
     * Enter a parse tree produced by the `showLogEvents`
     * labeled alternative in `MySqlParser.showStatement`.
     * @param ctx the parse tree
     */
    enterShowLogEvents;
    /**
     * Exit a parse tree produced by the `showLogEvents`
     * labeled alternative in `MySqlParser.showStatement`.
     * @param ctx the parse tree
     */
    exitShowLogEvents;
    /**
     * Enter a parse tree produced by the `showObjectFilter`
     * labeled alternative in `MySqlParser.showStatement`.
     * @param ctx the parse tree
     */
    enterShowObjectFilter;
    /**
     * Exit a parse tree produced by the `showObjectFilter`
     * labeled alternative in `MySqlParser.showStatement`.
     * @param ctx the parse tree
     */
    exitShowObjectFilter;
    /**
     * Enter a parse tree produced by the `showColumns`
     * labeled alternative in `MySqlParser.showStatement`.
     * @param ctx the parse tree
     */
    enterShowColumns;
    /**
     * Exit a parse tree produced by the `showColumns`
     * labeled alternative in `MySqlParser.showStatement`.
     * @param ctx the parse tree
     */
    exitShowColumns;
    /**
     * Enter a parse tree produced by the `showCreateDb`
     * labeled alternative in `MySqlParser.showStatement`.
     * @param ctx the parse tree
     */
    enterShowCreateDb;
    /**
     * Exit a parse tree produced by the `showCreateDb`
     * labeled alternative in `MySqlParser.showStatement`.
     * @param ctx the parse tree
     */
    exitShowCreateDb;
    /**
     * Enter a parse tree produced by the `showCreateFullIdObject`
     * labeled alternative in `MySqlParser.showStatement`.
     * @param ctx the parse tree
     */
    enterShowCreateFullIdObject;
    /**
     * Exit a parse tree produced by the `showCreateFullIdObject`
     * labeled alternative in `MySqlParser.showStatement`.
     * @param ctx the parse tree
     */
    exitShowCreateFullIdObject;
    /**
     * Enter a parse tree produced by the `showCreateUser`
     * labeled alternative in `MySqlParser.showStatement`.
     * @param ctx the parse tree
     */
    enterShowCreateUser;
    /**
     * Exit a parse tree produced by the `showCreateUser`
     * labeled alternative in `MySqlParser.showStatement`.
     * @param ctx the parse tree
     */
    exitShowCreateUser;
    /**
     * Enter a parse tree produced by the `showEngine`
     * labeled alternative in `MySqlParser.showStatement`.
     * @param ctx the parse tree
     */
    enterShowEngine;
    /**
     * Exit a parse tree produced by the `showEngine`
     * labeled alternative in `MySqlParser.showStatement`.
     * @param ctx the parse tree
     */
    exitShowEngine;
    /**
     * Enter a parse tree produced by the `showGlobalInfo`
     * labeled alternative in `MySqlParser.showStatement`.
     * @param ctx the parse tree
     */
    enterShowGlobalInfo;
    /**
     * Exit a parse tree produced by the `showGlobalInfo`
     * labeled alternative in `MySqlParser.showStatement`.
     * @param ctx the parse tree
     */
    exitShowGlobalInfo;
    /**
     * Enter a parse tree produced by the `showErrors`
     * labeled alternative in `MySqlParser.showStatement`.
     * @param ctx the parse tree
     */
    enterShowErrors;
    /**
     * Exit a parse tree produced by the `showErrors`
     * labeled alternative in `MySqlParser.showStatement`.
     * @param ctx the parse tree
     */
    exitShowErrors;
    /**
     * Enter a parse tree produced by the `showCountErrors`
     * labeled alternative in `MySqlParser.showStatement`.
     * @param ctx the parse tree
     */
    enterShowCountErrors;
    /**
     * Exit a parse tree produced by the `showCountErrors`
     * labeled alternative in `MySqlParser.showStatement`.
     * @param ctx the parse tree
     */
    exitShowCountErrors;
    /**
     * Enter a parse tree produced by the `showSchemaFilter`
     * labeled alternative in `MySqlParser.showStatement`.
     * @param ctx the parse tree
     */
    enterShowSchemaFilter;
    /**
     * Exit a parse tree produced by the `showSchemaFilter`
     * labeled alternative in `MySqlParser.showStatement`.
     * @param ctx the parse tree
     */
    exitShowSchemaFilter;
    /**
     * Enter a parse tree produced by the `showRoutine`
     * labeled alternative in `MySqlParser.showStatement`.
     * @param ctx the parse tree
     */
    enterShowRoutine;
    /**
     * Exit a parse tree produced by the `showRoutine`
     * labeled alternative in `MySqlParser.showStatement`.
     * @param ctx the parse tree
     */
    exitShowRoutine;
    /**
     * Enter a parse tree produced by the `showGrants`
     * labeled alternative in `MySqlParser.showStatement`.
     * @param ctx the parse tree
     */
    enterShowGrants;
    /**
     * Exit a parse tree produced by the `showGrants`
     * labeled alternative in `MySqlParser.showStatement`.
     * @param ctx the parse tree
     */
    exitShowGrants;
    /**
     * Enter a parse tree produced by the `showIndexes`
     * labeled alternative in `MySqlParser.showStatement`.
     * @param ctx the parse tree
     */
    enterShowIndexes;
    /**
     * Exit a parse tree produced by the `showIndexes`
     * labeled alternative in `MySqlParser.showStatement`.
     * @param ctx the parse tree
     */
    exitShowIndexes;
    /**
     * Enter a parse tree produced by the `showOpenTables`
     * labeled alternative in `MySqlParser.showStatement`.
     * @param ctx the parse tree
     */
    enterShowOpenTables;
    /**
     * Exit a parse tree produced by the `showOpenTables`
     * labeled alternative in `MySqlParser.showStatement`.
     * @param ctx the parse tree
     */
    exitShowOpenTables;
    /**
     * Enter a parse tree produced by the `showProfile`
     * labeled alternative in `MySqlParser.showStatement`.
     * @param ctx the parse tree
     */
    enterShowProfile;
    /**
     * Exit a parse tree produced by the `showProfile`
     * labeled alternative in `MySqlParser.showStatement`.
     * @param ctx the parse tree
     */
    exitShowProfile;
    /**
     * Enter a parse tree produced by the `showSlaveStatus`
     * labeled alternative in `MySqlParser.showStatement`.
     * @param ctx the parse tree
     */
    enterShowSlaveStatus;
    /**
     * Exit a parse tree produced by the `showSlaveStatus`
     * labeled alternative in `MySqlParser.showStatement`.
     * @param ctx the parse tree
     */
    exitShowSlaveStatus;
    /**
     * Enter a parse tree produced by `MySqlParser.variableClause`.
     * @param ctx the parse tree
     */
    enterVariableClause;
    /**
     * Exit a parse tree produced by `MySqlParser.variableClause`.
     * @param ctx the parse tree
     */
    exitVariableClause;
    /**
     * Enter a parse tree produced by `MySqlParser.showCommonEntity`.
     * @param ctx the parse tree
     */
    enterShowCommonEntity;
    /**
     * Exit a parse tree produced by `MySqlParser.showCommonEntity`.
     * @param ctx the parse tree
     */
    exitShowCommonEntity;
    /**
     * Enter a parse tree produced by `MySqlParser.showFilter`.
     * @param ctx the parse tree
     */
    enterShowFilter;
    /**
     * Exit a parse tree produced by `MySqlParser.showFilter`.
     * @param ctx the parse tree
     */
    exitShowFilter;
    /**
     * Enter a parse tree produced by `MySqlParser.showGlobalInfoClause`.
     * @param ctx the parse tree
     */
    enterShowGlobalInfoClause;
    /**
     * Exit a parse tree produced by `MySqlParser.showGlobalInfoClause`.
     * @param ctx the parse tree
     */
    exitShowGlobalInfoClause;
    /**
     * Enter a parse tree produced by `MySqlParser.showSchemaEntity`.
     * @param ctx the parse tree
     */
    enterShowSchemaEntity;
    /**
     * Exit a parse tree produced by `MySqlParser.showSchemaEntity`.
     * @param ctx the parse tree
     */
    exitShowSchemaEntity;
    /**
     * Enter a parse tree produced by `MySqlParser.showProfileType`.
     * @param ctx the parse tree
     */
    enterShowProfileType;
    /**
     * Exit a parse tree produced by `MySqlParser.showProfileType`.
     * @param ctx the parse tree
     */
    exitShowProfileType;
    /**
     * Enter a parse tree produced by `MySqlParser.binlogStatement`.
     * @param ctx the parse tree
     */
    enterBinlogStatement;
    /**
     * Exit a parse tree produced by `MySqlParser.binlogStatement`.
     * @param ctx the parse tree
     */
    exitBinlogStatement;
    /**
     * Enter a parse tree produced by `MySqlParser.cacheIndexStatement`.
     * @param ctx the parse tree
     */
    enterCacheIndexStatement;
    /**
     * Exit a parse tree produced by `MySqlParser.cacheIndexStatement`.
     * @param ctx the parse tree
     */
    exitCacheIndexStatement;
    /**
     * Enter a parse tree produced by `MySqlParser.flushStatement`.
     * @param ctx the parse tree
     */
    enterFlushStatement;
    /**
     * Exit a parse tree produced by `MySqlParser.flushStatement`.
     * @param ctx the parse tree
     */
    exitFlushStatement;
    /**
     * Enter a parse tree produced by `MySqlParser.killStatement`.
     * @param ctx the parse tree
     */
    enterKillStatement;
    /**
     * Exit a parse tree produced by `MySqlParser.killStatement`.
     * @param ctx the parse tree
     */
    exitKillStatement;
    /**
     * Enter a parse tree produced by `MySqlParser.loadIndexIntoCache`.
     * @param ctx the parse tree
     */
    enterLoadIndexIntoCache;
    /**
     * Exit a parse tree produced by `MySqlParser.loadIndexIntoCache`.
     * @param ctx the parse tree
     */
    exitLoadIndexIntoCache;
    /**
     * Enter a parse tree produced by `MySqlParser.resetStatement`.
     * @param ctx the parse tree
     */
    enterResetStatement;
    /**
     * Exit a parse tree produced by `MySqlParser.resetStatement`.
     * @param ctx the parse tree
     */
    exitResetStatement;
    /**
     * Enter a parse tree produced by `MySqlParser.shutdownStatement`.
     * @param ctx the parse tree
     */
    enterShutdownStatement;
    /**
     * Exit a parse tree produced by `MySqlParser.shutdownStatement`.
     * @param ctx the parse tree
     */
    exitShutdownStatement;
    /**
     * Enter a parse tree produced by `MySqlParser.tableIndexes`.
     * @param ctx the parse tree
     */
    enterTableIndexes;
    /**
     * Exit a parse tree produced by `MySqlParser.tableIndexes`.
     * @param ctx the parse tree
     */
    exitTableIndexes;
    /**
     * Enter a parse tree produced by the `simpleFlushOption`
     * labeled alternative in `MySqlParser.flushOption`.
     * @param ctx the parse tree
     */
    enterSimpleFlushOption;
    /**
     * Exit a parse tree produced by the `simpleFlushOption`
     * labeled alternative in `MySqlParser.flushOption`.
     * @param ctx the parse tree
     */
    exitSimpleFlushOption;
    /**
     * Enter a parse tree produced by the `channelFlushOption`
     * labeled alternative in `MySqlParser.flushOption`.
     * @param ctx the parse tree
     */
    enterChannelFlushOption;
    /**
     * Exit a parse tree produced by the `channelFlushOption`
     * labeled alternative in `MySqlParser.flushOption`.
     * @param ctx the parse tree
     */
    exitChannelFlushOption;
    /**
     * Enter a parse tree produced by the `tableFlushOption`
     * labeled alternative in `MySqlParser.flushOption`.
     * @param ctx the parse tree
     */
    enterTableFlushOption;
    /**
     * Exit a parse tree produced by the `tableFlushOption`
     * labeled alternative in `MySqlParser.flushOption`.
     * @param ctx the parse tree
     */
    exitTableFlushOption;
    /**
     * Enter a parse tree produced by `MySqlParser.flushTableOption`.
     * @param ctx the parse tree
     */
    enterFlushTableOption;
    /**
     * Exit a parse tree produced by `MySqlParser.flushTableOption`.
     * @param ctx the parse tree
     */
    exitFlushTableOption;
    /**
     * Enter a parse tree produced by `MySqlParser.loadedTableIndexes`.
     * @param ctx the parse tree
     */
    enterLoadedTableIndexes;
    /**
     * Exit a parse tree produced by `MySqlParser.loadedTableIndexes`.
     * @param ctx the parse tree
     */
    exitLoadedTableIndexes;
    /**
     * Enter a parse tree produced by `MySqlParser.simpleDescribeStatement`.
     * @param ctx the parse tree
     */
    enterSimpleDescribeStatement;
    /**
     * Exit a parse tree produced by `MySqlParser.simpleDescribeStatement`.
     * @param ctx the parse tree
     */
    exitSimpleDescribeStatement;
    /**
     * Enter a parse tree produced by `MySqlParser.fullDescribeStatement`.
     * @param ctx the parse tree
     */
    enterFullDescribeStatement;
    /**
     * Exit a parse tree produced by `MySqlParser.fullDescribeStatement`.
     * @param ctx the parse tree
     */
    exitFullDescribeStatement;
    /**
     * Enter a parse tree produced by `MySqlParser.helpStatement`.
     * @param ctx the parse tree
     */
    enterHelpStatement;
    /**
     * Exit a parse tree produced by `MySqlParser.helpStatement`.
     * @param ctx the parse tree
     */
    exitHelpStatement;
    /**
     * Enter a parse tree produced by `MySqlParser.useStatement`.
     * @param ctx the parse tree
     */
    enterUseStatement;
    /**
     * Exit a parse tree produced by `MySqlParser.useStatement`.
     * @param ctx the parse tree
     */
    exitUseStatement;
    /**
     * Enter a parse tree produced by `MySqlParser.signalStatement`.
     * @param ctx the parse tree
     */
    enterSignalStatement;
    /**
     * Exit a parse tree produced by `MySqlParser.signalStatement`.
     * @param ctx the parse tree
     */
    exitSignalStatement;
    /**
     * Enter a parse tree produced by `MySqlParser.resignalStatement`.
     * @param ctx the parse tree
     */
    enterResignalStatement;
    /**
     * Exit a parse tree produced by `MySqlParser.resignalStatement`.
     * @param ctx the parse tree
     */
    exitResignalStatement;
    /**
     * Enter a parse tree produced by `MySqlParser.signalConditionInformation`.
     * @param ctx the parse tree
     */
    enterSignalConditionInformation;
    /**
     * Exit a parse tree produced by `MySqlParser.signalConditionInformation`.
     * @param ctx the parse tree
     */
    exitSignalConditionInformation;
    /**
     * Enter a parse tree produced by `MySqlParser.withStatement`.
     * @param ctx the parse tree
     */
    enterWithStatement;
    /**
     * Exit a parse tree produced by `MySqlParser.withStatement`.
     * @param ctx the parse tree
     */
    exitWithStatement;
    /**
     * Enter a parse tree produced by `MySqlParser.tableStatement`.
     * @param ctx the parse tree
     */
    enterTableStatement;
    /**
     * Exit a parse tree produced by `MySqlParser.tableStatement`.
     * @param ctx the parse tree
     */
    exitTableStatement;
    /**
     * Enter a parse tree produced by `MySqlParser.diagnosticsStatement`.
     * @param ctx the parse tree
     */
    enterDiagnosticsStatement;
    /**
     * Exit a parse tree produced by `MySqlParser.diagnosticsStatement`.
     * @param ctx the parse tree
     */
    exitDiagnosticsStatement;
    /**
     * Enter a parse tree produced by `MySqlParser.diagnosticsConditionInformationName`.
     * @param ctx the parse tree
     */
    enterDiagnosticsConditionInformationName;
    /**
     * Exit a parse tree produced by `MySqlParser.diagnosticsConditionInformationName`.
     * @param ctx the parse tree
     */
    exitDiagnosticsConditionInformationName;
    /**
     * Enter a parse tree produced by the `describeStatements`
     * labeled alternative in `MySqlParser.describeObjectClause`.
     * @param ctx the parse tree
     */
    enterDescribeStatements;
    /**
     * Exit a parse tree produced by the `describeStatements`
     * labeled alternative in `MySqlParser.describeObjectClause`.
     * @param ctx the parse tree
     */
    exitDescribeStatements;
    /**
     * Enter a parse tree produced by the `describeConnection`
     * labeled alternative in `MySqlParser.describeObjectClause`.
     * @param ctx the parse tree
     */
    enterDescribeConnection;
    /**
     * Exit a parse tree produced by the `describeConnection`
     * labeled alternative in `MySqlParser.describeObjectClause`.
     * @param ctx the parse tree
     */
    exitDescribeConnection;
    /**
     * Enter a parse tree produced by `MySqlParser.fullId`.
     * @param ctx the parse tree
     */
    enterFullId;
    /**
     * Exit a parse tree produced by `MySqlParser.fullId`.
     * @param ctx the parse tree
     */
    exitFullId;
    /**
     * Enter a parse tree produced by `MySqlParser.tableName`.
     * @param ctx the parse tree
     */
    enterTableName;
    /**
     * Exit a parse tree produced by `MySqlParser.tableName`.
     * @param ctx the parse tree
     */
    exitTableName;
    /**
     * Enter a parse tree produced by `MySqlParser.roleName`.
     * @param ctx the parse tree
     */
    enterRoleName;
    /**
     * Exit a parse tree produced by `MySqlParser.roleName`.
     * @param ctx the parse tree
     */
    exitRoleName;
    /**
     * Enter a parse tree produced by `MySqlParser.fullColumnName`.
     * @param ctx the parse tree
     */
    enterFullColumnName;
    /**
     * Exit a parse tree produced by `MySqlParser.fullColumnName`.
     * @param ctx the parse tree
     */
    exitFullColumnName;
    /**
     * Enter a parse tree produced by `MySqlParser.indexColumnName`.
     * @param ctx the parse tree
     */
    enterIndexColumnName;
    /**
     * Exit a parse tree produced by `MySqlParser.indexColumnName`.
     * @param ctx the parse tree
     */
    exitIndexColumnName;
    /**
     * Enter a parse tree produced by `MySqlParser.simpleUserName`.
     * @param ctx the parse tree
     */
    enterSimpleUserName;
    /**
     * Exit a parse tree produced by `MySqlParser.simpleUserName`.
     * @param ctx the parse tree
     */
    exitSimpleUserName;
    /**
     * Enter a parse tree produced by `MySqlParser.hostName`.
     * @param ctx the parse tree
     */
    enterHostName;
    /**
     * Exit a parse tree produced by `MySqlParser.hostName`.
     * @param ctx the parse tree
     */
    exitHostName;
    /**
     * Enter a parse tree produced by `MySqlParser.userName`.
     * @param ctx the parse tree
     */
    enterUserName;
    /**
     * Exit a parse tree produced by `MySqlParser.userName`.
     * @param ctx the parse tree
     */
    exitUserName;
    /**
     * Enter a parse tree produced by `MySqlParser.mysqlVariable`.
     * @param ctx the parse tree
     */
    enterMysqlVariable;
    /**
     * Exit a parse tree produced by `MySqlParser.mysqlVariable`.
     * @param ctx the parse tree
     */
    exitMysqlVariable;
    /**
     * Enter a parse tree produced by `MySqlParser.charsetName`.
     * @param ctx the parse tree
     */
    enterCharsetName;
    /**
     * Exit a parse tree produced by `MySqlParser.charsetName`.
     * @param ctx the parse tree
     */
    exitCharsetName;
    /**
     * Enter a parse tree produced by `MySqlParser.collationName`.
     * @param ctx the parse tree
     */
    enterCollationName;
    /**
     * Exit a parse tree produced by `MySqlParser.collationName`.
     * @param ctx the parse tree
     */
    exitCollationName;
    /**
     * Enter a parse tree produced by `MySqlParser.engineName`.
     * @param ctx the parse tree
     */
    enterEngineName;
    /**
     * Exit a parse tree produced by `MySqlParser.engineName`.
     * @param ctx the parse tree
     */
    exitEngineName;
    /**
     * Enter a parse tree produced by `MySqlParser.engineNameBase`.
     * @param ctx the parse tree
     */
    enterEngineNameBase;
    /**
     * Exit a parse tree produced by `MySqlParser.engineNameBase`.
     * @param ctx the parse tree
     */
    exitEngineNameBase;
    /**
     * Enter a parse tree produced by `MySqlParser.uuidSet`.
     * @param ctx the parse tree
     */
    enterUuidSet;
    /**
     * Exit a parse tree produced by `MySqlParser.uuidSet`.
     * @param ctx the parse tree
     */
    exitUuidSet;
    /**
     * Enter a parse tree produced by `MySqlParser.xid`.
     * @param ctx the parse tree
     */
    enterXid;
    /**
     * Exit a parse tree produced by `MySqlParser.xid`.
     * @param ctx the parse tree
     */
    exitXid;
    /**
     * Enter a parse tree produced by `MySqlParser.xuidStringId`.
     * @param ctx the parse tree
     */
    enterXuidStringId;
    /**
     * Exit a parse tree produced by `MySqlParser.xuidStringId`.
     * @param ctx the parse tree
     */
    exitXuidStringId;
    /**
     * Enter a parse tree produced by `MySqlParser.authPlugin`.
     * @param ctx the parse tree
     */
    enterAuthPlugin;
    /**
     * Exit a parse tree produced by `MySqlParser.authPlugin`.
     * @param ctx the parse tree
     */
    exitAuthPlugin;
    /**
     * Enter a parse tree produced by `MySqlParser.uid`.
     * @param ctx the parse tree
     */
    enterUid;
    /**
     * Exit a parse tree produced by `MySqlParser.uid`.
     * @param ctx the parse tree
     */
    exitUid;
    /**
     * Enter a parse tree produced by `MySqlParser.simpleId`.
     * @param ctx the parse tree
     */
    enterSimpleId;
    /**
     * Exit a parse tree produced by `MySqlParser.simpleId`.
     * @param ctx the parse tree
     */
    exitSimpleId;
    /**
     * Enter a parse tree produced by `MySqlParser.dottedId`.
     * @param ctx the parse tree
     */
    enterDottedId;
    /**
     * Exit a parse tree produced by `MySqlParser.dottedId`.
     * @param ctx the parse tree
     */
    exitDottedId;
    /**
     * Enter a parse tree produced by `MySqlParser.decimalLiteral`.
     * @param ctx the parse tree
     */
    enterDecimalLiteral;
    /**
     * Exit a parse tree produced by `MySqlParser.decimalLiteral`.
     * @param ctx the parse tree
     */
    exitDecimalLiteral;
    /**
     * Enter a parse tree produced by `MySqlParser.fileSizeLiteral`.
     * @param ctx the parse tree
     */
    enterFileSizeLiteral;
    /**
     * Exit a parse tree produced by `MySqlParser.fileSizeLiteral`.
     * @param ctx the parse tree
     */
    exitFileSizeLiteral;
    /**
     * Enter a parse tree produced by `MySqlParser.stringLiteral`.
     * @param ctx the parse tree
     */
    enterStringLiteral;
    /**
     * Exit a parse tree produced by `MySqlParser.stringLiteral`.
     * @param ctx the parse tree
     */
    exitStringLiteral;
    /**
     * Enter a parse tree produced by `MySqlParser.booleanLiteral`.
     * @param ctx the parse tree
     */
    enterBooleanLiteral;
    /**
     * Exit a parse tree produced by `MySqlParser.booleanLiteral`.
     * @param ctx the parse tree
     */
    exitBooleanLiteral;
    /**
     * Enter a parse tree produced by `MySqlParser.hexadecimalLiteral`.
     * @param ctx the parse tree
     */
    enterHexadecimalLiteral;
    /**
     * Exit a parse tree produced by `MySqlParser.hexadecimalLiteral`.
     * @param ctx the parse tree
     */
    exitHexadecimalLiteral;
    /**
     * Enter a parse tree produced by `MySqlParser.nullNotnull`.
     * @param ctx the parse tree
     */
    enterNullNotnull;
    /**
     * Exit a parse tree produced by `MySqlParser.nullNotnull`.
     * @param ctx the parse tree
     */
    exitNullNotnull;
    /**
     * Enter a parse tree produced by `MySqlParser.constant`.
     * @param ctx the parse tree
     */
    enterConstant;
    /**
     * Exit a parse tree produced by `MySqlParser.constant`.
     * @param ctx the parse tree
     */
    exitConstant;
    /**
     * Enter a parse tree produced by the `stringDataType`
     * labeled alternative in `MySqlParser.dataType`.
     * @param ctx the parse tree
     */
    enterStringDataType;
    /**
     * Exit a parse tree produced by the `stringDataType`
     * labeled alternative in `MySqlParser.dataType`.
     * @param ctx the parse tree
     */
    exitStringDataType;
    /**
     * Enter a parse tree produced by the `nationalVaryingStringDataType`
     * labeled alternative in `MySqlParser.dataType`.
     * @param ctx the parse tree
     */
    enterNationalVaryingStringDataType;
    /**
     * Exit a parse tree produced by the `nationalVaryingStringDataType`
     * labeled alternative in `MySqlParser.dataType`.
     * @param ctx the parse tree
     */
    exitNationalVaryingStringDataType;
    /**
     * Enter a parse tree produced by the `nationalStringDataType`
     * labeled alternative in `MySqlParser.dataType`.
     * @param ctx the parse tree
     */
    enterNationalStringDataType;
    /**
     * Exit a parse tree produced by the `nationalStringDataType`
     * labeled alternative in `MySqlParser.dataType`.
     * @param ctx the parse tree
     */
    exitNationalStringDataType;
    /**
     * Enter a parse tree produced by the `dimensionDataType`
     * labeled alternative in `MySqlParser.dataType`.
     * @param ctx the parse tree
     */
    enterDimensionDataType;
    /**
     * Exit a parse tree produced by the `dimensionDataType`
     * labeled alternative in `MySqlParser.dataType`.
     * @param ctx the parse tree
     */
    exitDimensionDataType;
    /**
     * Enter a parse tree produced by the `simpleDataType`
     * labeled alternative in `MySqlParser.dataType`.
     * @param ctx the parse tree
     */
    enterSimpleDataType;
    /**
     * Exit a parse tree produced by the `simpleDataType`
     * labeled alternative in `MySqlParser.dataType`.
     * @param ctx the parse tree
     */
    exitSimpleDataType;
    /**
     * Enter a parse tree produced by the `collectionDataType`
     * labeled alternative in `MySqlParser.dataType`.
     * @param ctx the parse tree
     */
    enterCollectionDataType;
    /**
     * Exit a parse tree produced by the `collectionDataType`
     * labeled alternative in `MySqlParser.dataType`.
     * @param ctx the parse tree
     */
    exitCollectionDataType;
    /**
     * Enter a parse tree produced by the `spatialDataType`
     * labeled alternative in `MySqlParser.dataType`.
     * @param ctx the parse tree
     */
    enterSpatialDataType;
    /**
     * Exit a parse tree produced by the `spatialDataType`
     * labeled alternative in `MySqlParser.dataType`.
     * @param ctx the parse tree
     */
    exitSpatialDataType;
    /**
     * Enter a parse tree produced by the `longVarcharDataType`
     * labeled alternative in `MySqlParser.dataType`.
     * @param ctx the parse tree
     */
    enterLongVarcharDataType;
    /**
     * Exit a parse tree produced by the `longVarcharDataType`
     * labeled alternative in `MySqlParser.dataType`.
     * @param ctx the parse tree
     */
    exitLongVarcharDataType;
    /**
     * Enter a parse tree produced by the `longVarbinaryDataType`
     * labeled alternative in `MySqlParser.dataType`.
     * @param ctx the parse tree
     */
    enterLongVarbinaryDataType;
    /**
     * Exit a parse tree produced by the `longVarbinaryDataType`
     * labeled alternative in `MySqlParser.dataType`.
     * @param ctx the parse tree
     */
    exitLongVarbinaryDataType;
    /**
     * Enter a parse tree produced by `MySqlParser.collectionOptions`.
     * @param ctx the parse tree
     */
    enterCollectionOptions;
    /**
     * Exit a parse tree produced by `MySqlParser.collectionOptions`.
     * @param ctx the parse tree
     */
    exitCollectionOptions;
    /**
     * Enter a parse tree produced by `MySqlParser.collectionOption`.
     * @param ctx the parse tree
     */
    enterCollectionOption;
    /**
     * Exit a parse tree produced by `MySqlParser.collectionOption`.
     * @param ctx the parse tree
     */
    exitCollectionOption;
    /**
     * Enter a parse tree produced by `MySqlParser.convertedDataType`.
     * @param ctx the parse tree
     */
    enterConvertedDataType;
    /**
     * Exit a parse tree produced by `MySqlParser.convertedDataType`.
     * @param ctx the parse tree
     */
    exitConvertedDataType;
    /**
     * Enter a parse tree produced by `MySqlParser.lengthOneDimension`.
     * @param ctx the parse tree
     */
    enterLengthOneDimension;
    /**
     * Exit a parse tree produced by `MySqlParser.lengthOneDimension`.
     * @param ctx the parse tree
     */
    exitLengthOneDimension;
    /**
     * Enter a parse tree produced by `MySqlParser.lengthTwoDimension`.
     * @param ctx the parse tree
     */
    enterLengthTwoDimension;
    /**
     * Exit a parse tree produced by `MySqlParser.lengthTwoDimension`.
     * @param ctx the parse tree
     */
    exitLengthTwoDimension;
    /**
     * Enter a parse tree produced by `MySqlParser.lengthTwoOptionalDimension`.
     * @param ctx the parse tree
     */
    enterLengthTwoOptionalDimension;
    /**
     * Exit a parse tree produced by `MySqlParser.lengthTwoOptionalDimension`.
     * @param ctx the parse tree
     */
    exitLengthTwoOptionalDimension;
    /**
     * Enter a parse tree produced by `MySqlParser.uidList`.
     * @param ctx the parse tree
     */
    enterUidList;
    /**
     * Exit a parse tree produced by `MySqlParser.uidList`.
     * @param ctx the parse tree
     */
    exitUidList;
    /**
     * Enter a parse tree produced by `MySqlParser.fullColumnNameList`.
     * @param ctx the parse tree
     */
    enterFullColumnNameList;
    /**
     * Exit a parse tree produced by `MySqlParser.fullColumnNameList`.
     * @param ctx the parse tree
     */
    exitFullColumnNameList;
    /**
     * Enter a parse tree produced by `MySqlParser.tables`.
     * @param ctx the parse tree
     */
    enterTables;
    /**
     * Exit a parse tree produced by `MySqlParser.tables`.
     * @param ctx the parse tree
     */
    exitTables;
    /**
     * Enter a parse tree produced by `MySqlParser.indexColumnNames`.
     * @param ctx the parse tree
     */
    enterIndexColumnNames;
    /**
     * Exit a parse tree produced by `MySqlParser.indexColumnNames`.
     * @param ctx the parse tree
     */
    exitIndexColumnNames;
    /**
     * Enter a parse tree produced by `MySqlParser.expressions`.
     * @param ctx the parse tree
     */
    enterExpressions;
    /**
     * Exit a parse tree produced by `MySqlParser.expressions`.
     * @param ctx the parse tree
     */
    exitExpressions;
    /**
     * Enter a parse tree produced by `MySqlParser.expressionsWithDefaults`.
     * @param ctx the parse tree
     */
    enterExpressionsWithDefaults;
    /**
     * Exit a parse tree produced by `MySqlParser.expressionsWithDefaults`.
     * @param ctx the parse tree
     */
    exitExpressionsWithDefaults;
    /**
     * Enter a parse tree produced by `MySqlParser.constants`.
     * @param ctx the parse tree
     */
    enterConstants;
    /**
     * Exit a parse tree produced by `MySqlParser.constants`.
     * @param ctx the parse tree
     */
    exitConstants;
    /**
     * Enter a parse tree produced by `MySqlParser.simpleStrings`.
     * @param ctx the parse tree
     */
    enterSimpleStrings;
    /**
     * Exit a parse tree produced by `MySqlParser.simpleStrings`.
     * @param ctx the parse tree
     */
    exitSimpleStrings;
    /**
     * Enter a parse tree produced by `MySqlParser.userVariables`.
     * @param ctx the parse tree
     */
    enterUserVariables;
    /**
     * Exit a parse tree produced by `MySqlParser.userVariables`.
     * @param ctx the parse tree
     */
    exitUserVariables;
    /**
     * Enter a parse tree produced by `MySqlParser.defaultValue`.
     * @param ctx the parse tree
     */
    enterDefaultValue;
    /**
     * Exit a parse tree produced by `MySqlParser.defaultValue`.
     * @param ctx the parse tree
     */
    exitDefaultValue;
    /**
     * Enter a parse tree produced by `MySqlParser.currentTimestamp`.
     * @param ctx the parse tree
     */
    enterCurrentTimestamp;
    /**
     * Exit a parse tree produced by `MySqlParser.currentTimestamp`.
     * @param ctx the parse tree
     */
    exitCurrentTimestamp;
    /**
     * Enter a parse tree produced by `MySqlParser.expressionOrDefault`.
     * @param ctx the parse tree
     */
    enterExpressionOrDefault;
    /**
     * Exit a parse tree produced by `MySqlParser.expressionOrDefault`.
     * @param ctx the parse tree
     */
    exitExpressionOrDefault;
    /**
     * Enter a parse tree produced by `MySqlParser.ifExists`.
     * @param ctx the parse tree
     */
    enterIfExists;
    /**
     * Exit a parse tree produced by `MySqlParser.ifExists`.
     * @param ctx the parse tree
     */
    exitIfExists;
    /**
     * Enter a parse tree produced by `MySqlParser.ifNotExists`.
     * @param ctx the parse tree
     */
    enterIfNotExists;
    /**
     * Exit a parse tree produced by `MySqlParser.ifNotExists`.
     * @param ctx the parse tree
     */
    exitIfNotExists;
    /**
     * Enter a parse tree produced by `MySqlParser.orReplace`.
     * @param ctx the parse tree
     */
    enterOrReplace;
    /**
     * Exit a parse tree produced by `MySqlParser.orReplace`.
     * @param ctx the parse tree
     */
    exitOrReplace;
    /**
     * Enter a parse tree produced by the `specificFunctionCall`
     * labeled alternative in `MySqlParser.functionCall`.
     * @param ctx the parse tree
     */
    enterSpecificFunctionCall;
    /**
     * Exit a parse tree produced by the `specificFunctionCall`
     * labeled alternative in `MySqlParser.functionCall`.
     * @param ctx the parse tree
     */
    exitSpecificFunctionCall;
    /**
     * Enter a parse tree produced by the `aggregateFunctionCall`
     * labeled alternative in `MySqlParser.functionCall`.
     * @param ctx the parse tree
     */
    enterAggregateFunctionCall;
    /**
     * Exit a parse tree produced by the `aggregateFunctionCall`
     * labeled alternative in `MySqlParser.functionCall`.
     * @param ctx the parse tree
     */
    exitAggregateFunctionCall;
    /**
     * Enter a parse tree produced by the `nonAggregateFunctionCall`
     * labeled alternative in `MySqlParser.functionCall`.
     * @param ctx the parse tree
     */
    enterNonAggregateFunctionCall;
    /**
     * Exit a parse tree produced by the `nonAggregateFunctionCall`
     * labeled alternative in `MySqlParser.functionCall`.
     * @param ctx the parse tree
     */
    exitNonAggregateFunctionCall;
    /**
     * Enter a parse tree produced by the `scalarFunctionCall`
     * labeled alternative in `MySqlParser.functionCall`.
     * @param ctx the parse tree
     */
    enterScalarFunctionCall;
    /**
     * Exit a parse tree produced by the `scalarFunctionCall`
     * labeled alternative in `MySqlParser.functionCall`.
     * @param ctx the parse tree
     */
    exitScalarFunctionCall;
    /**
     * Enter a parse tree produced by the `udfFunctionCall`
     * labeled alternative in `MySqlParser.functionCall`.
     * @param ctx the parse tree
     */
    enterUdfFunctionCall;
    /**
     * Exit a parse tree produced by the `udfFunctionCall`
     * labeled alternative in `MySqlParser.functionCall`.
     * @param ctx the parse tree
     */
    exitUdfFunctionCall;
    /**
     * Enter a parse tree produced by the `passwordFunctionCall`
     * labeled alternative in `MySqlParser.functionCall`.
     * @param ctx the parse tree
     */
    enterPasswordFunctionCall;
    /**
     * Exit a parse tree produced by the `passwordFunctionCall`
     * labeled alternative in `MySqlParser.functionCall`.
     * @param ctx the parse tree
     */
    exitPasswordFunctionCall;
    /**
     * Enter a parse tree produced by the `simpleFunctionCall`
     * labeled alternative in `MySqlParser.specificFunction`.
     * @param ctx the parse tree
     */
    enterSimpleFunctionCall;
    /**
     * Exit a parse tree produced by the `simpleFunctionCall`
     * labeled alternative in `MySqlParser.specificFunction`.
     * @param ctx the parse tree
     */
    exitSimpleFunctionCall;
    /**
     * Enter a parse tree produced by the `currentUser`
     * labeled alternative in `MySqlParser.specificFunction`.
     * @param ctx the parse tree
     */
    enterCurrentUser;
    /**
     * Exit a parse tree produced by the `currentUser`
     * labeled alternative in `MySqlParser.specificFunction`.
     * @param ctx the parse tree
     */
    exitCurrentUser;
    /**
     * Enter a parse tree produced by the `dataTypeFunctionCall`
     * labeled alternative in `MySqlParser.specificFunction`.
     * @param ctx the parse tree
     */
    enterDataTypeFunctionCall;
    /**
     * Exit a parse tree produced by the `dataTypeFunctionCall`
     * labeled alternative in `MySqlParser.specificFunction`.
     * @param ctx the parse tree
     */
    exitDataTypeFunctionCall;
    /**
     * Enter a parse tree produced by the `valuesFunctionCall`
     * labeled alternative in `MySqlParser.specificFunction`.
     * @param ctx the parse tree
     */
    enterValuesFunctionCall;
    /**
     * Exit a parse tree produced by the `valuesFunctionCall`
     * labeled alternative in `MySqlParser.specificFunction`.
     * @param ctx the parse tree
     */
    exitValuesFunctionCall;
    /**
     * Enter a parse tree produced by the `caseExpressionFunctionCall`
     * labeled alternative in `MySqlParser.specificFunction`.
     * @param ctx the parse tree
     */
    enterCaseExpressionFunctionCall;
    /**
     * Exit a parse tree produced by the `caseExpressionFunctionCall`
     * labeled alternative in `MySqlParser.specificFunction`.
     * @param ctx the parse tree
     */
    exitCaseExpressionFunctionCall;
    /**
     * Enter a parse tree produced by the `caseFunctionCall`
     * labeled alternative in `MySqlParser.specificFunction`.
     * @param ctx the parse tree
     */
    enterCaseFunctionCall;
    /**
     * Exit a parse tree produced by the `caseFunctionCall`
     * labeled alternative in `MySqlParser.specificFunction`.
     * @param ctx the parse tree
     */
    exitCaseFunctionCall;
    /**
     * Enter a parse tree produced by the `charFunctionCall`
     * labeled alternative in `MySqlParser.specificFunction`.
     * @param ctx the parse tree
     */
    enterCharFunctionCall;
    /**
     * Exit a parse tree produced by the `charFunctionCall`
     * labeled alternative in `MySqlParser.specificFunction`.
     * @param ctx the parse tree
     */
    exitCharFunctionCall;
    /**
     * Enter a parse tree produced by the `positionFunctionCall`
     * labeled alternative in `MySqlParser.specificFunction`.
     * @param ctx the parse tree
     */
    enterPositionFunctionCall;
    /**
     * Exit a parse tree produced by the `positionFunctionCall`
     * labeled alternative in `MySqlParser.specificFunction`.
     * @param ctx the parse tree
     */
    exitPositionFunctionCall;
    /**
     * Enter a parse tree produced by the `substrFunctionCall`
     * labeled alternative in `MySqlParser.specificFunction`.
     * @param ctx the parse tree
     */
    enterSubstrFunctionCall;
    /**
     * Exit a parse tree produced by the `substrFunctionCall`
     * labeled alternative in `MySqlParser.specificFunction`.
     * @param ctx the parse tree
     */
    exitSubstrFunctionCall;
    /**
     * Enter a parse tree produced by the `trimFunctionCall`
     * labeled alternative in `MySqlParser.specificFunction`.
     * @param ctx the parse tree
     */
    enterTrimFunctionCall;
    /**
     * Exit a parse tree produced by the `trimFunctionCall`
     * labeled alternative in `MySqlParser.specificFunction`.
     * @param ctx the parse tree
     */
    exitTrimFunctionCall;
    /**
     * Enter a parse tree produced by the `weightFunctionCall`
     * labeled alternative in `MySqlParser.specificFunction`.
     * @param ctx the parse tree
     */
    enterWeightFunctionCall;
    /**
     * Exit a parse tree produced by the `weightFunctionCall`
     * labeled alternative in `MySqlParser.specificFunction`.
     * @param ctx the parse tree
     */
    exitWeightFunctionCall;
    /**
     * Enter a parse tree produced by the `extractFunctionCall`
     * labeled alternative in `MySqlParser.specificFunction`.
     * @param ctx the parse tree
     */
    enterExtractFunctionCall;
    /**
     * Exit a parse tree produced by the `extractFunctionCall`
     * labeled alternative in `MySqlParser.specificFunction`.
     * @param ctx the parse tree
     */
    exitExtractFunctionCall;
    /**
     * Enter a parse tree produced by the `getFormatFunctionCall`
     * labeled alternative in `MySqlParser.specificFunction`.
     * @param ctx the parse tree
     */
    enterGetFormatFunctionCall;
    /**
     * Exit a parse tree produced by the `getFormatFunctionCall`
     * labeled alternative in `MySqlParser.specificFunction`.
     * @param ctx the parse tree
     */
    exitGetFormatFunctionCall;
    /**
     * Enter a parse tree produced by the `jsonValueFunctionCall`
     * labeled alternative in `MySqlParser.specificFunction`.
     * @param ctx the parse tree
     */
    enterJsonValueFunctionCall;
    /**
     * Exit a parse tree produced by the `jsonValueFunctionCall`
     * labeled alternative in `MySqlParser.specificFunction`.
     * @param ctx the parse tree
     */
    exitJsonValueFunctionCall;
    /**
     * Enter a parse tree produced by `MySqlParser.caseFuncAlternative`.
     * @param ctx the parse tree
     */
    enterCaseFuncAlternative;
    /**
     * Exit a parse tree produced by `MySqlParser.caseFuncAlternative`.
     * @param ctx the parse tree
     */
    exitCaseFuncAlternative;
    /**
     * Enter a parse tree produced by the `levelWeightList`
     * labeled alternative in `MySqlParser.levelsInWeightString`.
     * @param ctx the parse tree
     */
    enterLevelWeightList;
    /**
     * Exit a parse tree produced by the `levelWeightList`
     * labeled alternative in `MySqlParser.levelsInWeightString`.
     * @param ctx the parse tree
     */
    exitLevelWeightList;
    /**
     * Enter a parse tree produced by the `levelWeightRange`
     * labeled alternative in `MySqlParser.levelsInWeightString`.
     * @param ctx the parse tree
     */
    enterLevelWeightRange;
    /**
     * Exit a parse tree produced by the `levelWeightRange`
     * labeled alternative in `MySqlParser.levelsInWeightString`.
     * @param ctx the parse tree
     */
    exitLevelWeightRange;
    /**
     * Enter a parse tree produced by `MySqlParser.levelInWeightListElement`.
     * @param ctx the parse tree
     */
    enterLevelInWeightListElement;
    /**
     * Exit a parse tree produced by `MySqlParser.levelInWeightListElement`.
     * @param ctx the parse tree
     */
    exitLevelInWeightListElement;
    /**
     * Enter a parse tree produced by `MySqlParser.aggregateWindowedFunction`.
     * @param ctx the parse tree
     */
    enterAggregateWindowedFunction;
    /**
     * Exit a parse tree produced by `MySqlParser.aggregateWindowedFunction`.
     * @param ctx the parse tree
     */
    exitAggregateWindowedFunction;
    /**
     * Enter a parse tree produced by `MySqlParser.nonAggregateWindowedFunction`.
     * @param ctx the parse tree
     */
    enterNonAggregateWindowedFunction;
    /**
     * Exit a parse tree produced by `MySqlParser.nonAggregateWindowedFunction`.
     * @param ctx the parse tree
     */
    exitNonAggregateWindowedFunction;
    /**
     * Enter a parse tree produced by `MySqlParser.overClause`.
     * @param ctx the parse tree
     */
    enterOverClause;
    /**
     * Exit a parse tree produced by `MySqlParser.overClause`.
     * @param ctx the parse tree
     */
    exitOverClause;
    /**
     * Enter a parse tree produced by `MySqlParser.windowSpec`.
     * @param ctx the parse tree
     */
    enterWindowSpec;
    /**
     * Exit a parse tree produced by `MySqlParser.windowSpec`.
     * @param ctx the parse tree
     */
    exitWindowSpec;
    /**
     * Enter a parse tree produced by `MySqlParser.windowName`.
     * @param ctx the parse tree
     */
    enterWindowName;
    /**
     * Exit a parse tree produced by `MySqlParser.windowName`.
     * @param ctx the parse tree
     */
    exitWindowName;
    /**
     * Enter a parse tree produced by `MySqlParser.frameClause`.
     * @param ctx the parse tree
     */
    enterFrameClause;
    /**
     * Exit a parse tree produced by `MySqlParser.frameClause`.
     * @param ctx the parse tree
     */
    exitFrameClause;
    /**
     * Enter a parse tree produced by `MySqlParser.frameUnits`.
     * @param ctx the parse tree
     */
    enterFrameUnits;
    /**
     * Exit a parse tree produced by `MySqlParser.frameUnits`.
     * @param ctx the parse tree
     */
    exitFrameUnits;
    /**
     * Enter a parse tree produced by `MySqlParser.frameExtent`.
     * @param ctx the parse tree
     */
    enterFrameExtent;
    /**
     * Exit a parse tree produced by `MySqlParser.frameExtent`.
     * @param ctx the parse tree
     */
    exitFrameExtent;
    /**
     * Enter a parse tree produced by `MySqlParser.frameBetween`.
     * @param ctx the parse tree
     */
    enterFrameBetween;
    /**
     * Exit a parse tree produced by `MySqlParser.frameBetween`.
     * @param ctx the parse tree
     */
    exitFrameBetween;
    /**
     * Enter a parse tree produced by `MySqlParser.frameRange`.
     * @param ctx the parse tree
     */
    enterFrameRange;
    /**
     * Exit a parse tree produced by `MySqlParser.frameRange`.
     * @param ctx the parse tree
     */
    exitFrameRange;
    /**
     * Enter a parse tree produced by `MySqlParser.partitionClause`.
     * @param ctx the parse tree
     */
    enterPartitionClause;
    /**
     * Exit a parse tree produced by `MySqlParser.partitionClause`.
     * @param ctx the parse tree
     */
    exitPartitionClause;
    /**
     * Enter a parse tree produced by `MySqlParser.sequenceFunctionName`.
     * @param ctx the parse tree
     */
    enterSequenceFunctionName;
    /**
     * Exit a parse tree produced by `MySqlParser.sequenceFunctionName`.
     * @param ctx the parse tree
     */
    exitSequenceFunctionName;
    /**
     * Enter a parse tree produced by `MySqlParser.scalarFunctionName`.
     * @param ctx the parse tree
     */
    enterScalarFunctionName;
    /**
     * Exit a parse tree produced by `MySqlParser.scalarFunctionName`.
     * @param ctx the parse tree
     */
    exitScalarFunctionName;
    /**
     * Enter a parse tree produced by `MySqlParser.passwordFunctionClause`.
     * @param ctx the parse tree
     */
    enterPasswordFunctionClause;
    /**
     * Exit a parse tree produced by `MySqlParser.passwordFunctionClause`.
     * @param ctx the parse tree
     */
    exitPasswordFunctionClause;
    /**
     * Enter a parse tree produced by `MySqlParser.functionArgs`.
     * @param ctx the parse tree
     */
    enterFunctionArgs;
    /**
     * Exit a parse tree produced by `MySqlParser.functionArgs`.
     * @param ctx the parse tree
     */
    exitFunctionArgs;
    /**
     * Enter a parse tree produced by `MySqlParser.functionArg`.
     * @param ctx the parse tree
     */
    enterFunctionArg;
    /**
     * Exit a parse tree produced by `MySqlParser.functionArg`.
     * @param ctx the parse tree
     */
    exitFunctionArg;
    /**
     * Enter a parse tree produced by the `notExpression`
     * labeled alternative in `MySqlParser.expression`.
     * @param ctx the parse tree
     */
    enterNotExpression;
    /**
     * Exit a parse tree produced by the `notExpression`
     * labeled alternative in `MySqlParser.expression`.
     * @param ctx the parse tree
     */
    exitNotExpression;
    /**
     * Enter a parse tree produced by the `isExpression`
     * labeled alternative in `MySqlParser.expression`.
     * @param ctx the parse tree
     */
    enterIsExpression;
    /**
     * Exit a parse tree produced by the `isExpression`
     * labeled alternative in `MySqlParser.expression`.
     * @param ctx the parse tree
     */
    exitIsExpression;
    /**
     * Enter a parse tree produced by the `predicateExpression`
     * labeled alternative in `MySqlParser.expression`.
     * @param ctx the parse tree
     */
    enterPredicateExpression;
    /**
     * Exit a parse tree produced by the `predicateExpression`
     * labeled alternative in `MySqlParser.expression`.
     * @param ctx the parse tree
     */
    exitPredicateExpression;
    /**
     * Enter a parse tree produced by the `logicalExpression`
     * labeled alternative in `MySqlParser.expression`.
     * @param ctx the parse tree
     */
    enterLogicalExpression;
    /**
     * Exit a parse tree produced by the `logicalExpression`
     * labeled alternative in `MySqlParser.expression`.
     * @param ctx the parse tree
     */
    exitLogicalExpression;
    /**
     * Enter a parse tree produced by the `expressionAtomPredicate`
     * labeled alternative in `MySqlParser.predicate`.
     * @param ctx the parse tree
     */
    enterExpressionAtomPredicate;
    /**
     * Exit a parse tree produced by the `expressionAtomPredicate`
     * labeled alternative in `MySqlParser.predicate`.
     * @param ctx the parse tree
     */
    exitExpressionAtomPredicate;
    /**
     * Enter a parse tree produced by the `binaryComparisonPredicate`
     * labeled alternative in `MySqlParser.predicate`.
     * @param ctx the parse tree
     */
    enterBinaryComparisonPredicate;
    /**
     * Exit a parse tree produced by the `binaryComparisonPredicate`
     * labeled alternative in `MySqlParser.predicate`.
     * @param ctx the parse tree
     */
    exitBinaryComparisonPredicate;
    /**
     * Enter a parse tree produced by the `betweenPredicate`
     * labeled alternative in `MySqlParser.predicate`.
     * @param ctx the parse tree
     */
    enterBetweenPredicate;
    /**
     * Exit a parse tree produced by the `betweenPredicate`
     * labeled alternative in `MySqlParser.predicate`.
     * @param ctx the parse tree
     */
    exitBetweenPredicate;
    /**
     * Enter a parse tree produced by the `soundsLikePredicate`
     * labeled alternative in `MySqlParser.predicate`.
     * @param ctx the parse tree
     */
    enterSoundsLikePredicate;
    /**
     * Exit a parse tree produced by the `soundsLikePredicate`
     * labeled alternative in `MySqlParser.predicate`.
     * @param ctx the parse tree
     */
    exitSoundsLikePredicate;
    /**
     * Enter a parse tree produced by the `regexpPredicate`
     * labeled alternative in `MySqlParser.predicate`.
     * @param ctx the parse tree
     */
    enterRegexpPredicate;
    /**
     * Exit a parse tree produced by the `regexpPredicate`
     * labeled alternative in `MySqlParser.predicate`.
     * @param ctx the parse tree
     */
    exitRegexpPredicate;
    /**
     * Enter a parse tree produced by the `inPredicate`
     * labeled alternative in `MySqlParser.predicate`.
     * @param ctx the parse tree
     */
    enterInPredicate;
    /**
     * Exit a parse tree produced by the `inPredicate`
     * labeled alternative in `MySqlParser.predicate`.
     * @param ctx the parse tree
     */
    exitInPredicate;
    /**
     * Enter a parse tree produced by the `isNullPredicate`
     * labeled alternative in `MySqlParser.predicate`.
     * @param ctx the parse tree
     */
    enterIsNullPredicate;
    /**
     * Exit a parse tree produced by the `isNullPredicate`
     * labeled alternative in `MySqlParser.predicate`.
     * @param ctx the parse tree
     */
    exitIsNullPredicate;
    /**
     * Enter a parse tree produced by the `subqueryComparisonPredicate`
     * labeled alternative in `MySqlParser.predicate`.
     * @param ctx the parse tree
     */
    enterSubqueryComparisonPredicate;
    /**
     * Exit a parse tree produced by the `subqueryComparisonPredicate`
     * labeled alternative in `MySqlParser.predicate`.
     * @param ctx the parse tree
     */
    exitSubqueryComparisonPredicate;
    /**
     * Enter a parse tree produced by the `likePredicate`
     * labeled alternative in `MySqlParser.predicate`.
     * @param ctx the parse tree
     */
    enterLikePredicate;
    /**
     * Exit a parse tree produced by the `likePredicate`
     * labeled alternative in `MySqlParser.predicate`.
     * @param ctx the parse tree
     */
    exitLikePredicate;
    /**
     * Enter a parse tree produced by the `jsonMemberOfPredicate`
     * labeled alternative in `MySqlParser.predicate`.
     * @param ctx the parse tree
     */
    enterJsonMemberOfPredicate;
    /**
     * Exit a parse tree produced by the `jsonMemberOfPredicate`
     * labeled alternative in `MySqlParser.predicate`.
     * @param ctx the parse tree
     */
    exitJsonMemberOfPredicate;
    /**
     * Enter a parse tree produced by the `constantExpressionAtom`
     * labeled alternative in `MySqlParser.expressionAtom`.
     * @param ctx the parse tree
     */
    enterConstantExpressionAtom;
    /**
     * Exit a parse tree produced by the `constantExpressionAtom`
     * labeled alternative in `MySqlParser.expressionAtom`.
     * @param ctx the parse tree
     */
    exitConstantExpressionAtom;
    /**
     * Enter a parse tree produced by the `fullColumnNameExpressionAtom`
     * labeled alternative in `MySqlParser.expressionAtom`.
     * @param ctx the parse tree
     */
    enterFullColumnNameExpressionAtom;
    /**
     * Exit a parse tree produced by the `fullColumnNameExpressionAtom`
     * labeled alternative in `MySqlParser.expressionAtom`.
     * @param ctx the parse tree
     */
    exitFullColumnNameExpressionAtom;
    /**
     * Enter a parse tree produced by the `functionCallExpressionAtom`
     * labeled alternative in `MySqlParser.expressionAtom`.
     * @param ctx the parse tree
     */
    enterFunctionCallExpressionAtom;
    /**
     * Exit a parse tree produced by the `functionCallExpressionAtom`
     * labeled alternative in `MySqlParser.expressionAtom`.
     * @param ctx the parse tree
     */
    exitFunctionCallExpressionAtom;
    /**
     * Enter a parse tree produced by the `mysqlVariableExpressionAtom`
     * labeled alternative in `MySqlParser.expressionAtom`.
     * @param ctx the parse tree
     */
    enterMysqlVariableExpressionAtom;
    /**
     * Exit a parse tree produced by the `mysqlVariableExpressionAtom`
     * labeled alternative in `MySqlParser.expressionAtom`.
     * @param ctx the parse tree
     */
    exitMysqlVariableExpressionAtom;
    /**
     * Enter a parse tree produced by the `unaryExpressionAtom`
     * labeled alternative in `MySqlParser.expressionAtom`.
     * @param ctx the parse tree
     */
    enterUnaryExpressionAtom;
    /**
     * Exit a parse tree produced by the `unaryExpressionAtom`
     * labeled alternative in `MySqlParser.expressionAtom`.
     * @param ctx the parse tree
     */
    exitUnaryExpressionAtom;
    /**
     * Enter a parse tree produced by the `binaryExpressionAtom`
     * labeled alternative in `MySqlParser.expressionAtom`.
     * @param ctx the parse tree
     */
    enterBinaryExpressionAtom;
    /**
     * Exit a parse tree produced by the `binaryExpressionAtom`
     * labeled alternative in `MySqlParser.expressionAtom`.
     * @param ctx the parse tree
     */
    exitBinaryExpressionAtom;
    /**
     * Enter a parse tree produced by the `variableAssignExpressionAtom`
     * labeled alternative in `MySqlParser.expressionAtom`.
     * @param ctx the parse tree
     */
    enterVariableAssignExpressionAtom;
    /**
     * Exit a parse tree produced by the `variableAssignExpressionAtom`
     * labeled alternative in `MySqlParser.expressionAtom`.
     * @param ctx the parse tree
     */
    exitVariableAssignExpressionAtom;
    /**
     * Enter a parse tree produced by the `nestedExpressionAtom`
     * labeled alternative in `MySqlParser.expressionAtom`.
     * @param ctx the parse tree
     */
    enterNestedExpressionAtom;
    /**
     * Exit a parse tree produced by the `nestedExpressionAtom`
     * labeled alternative in `MySqlParser.expressionAtom`.
     * @param ctx the parse tree
     */
    exitNestedExpressionAtom;
    /**
     * Enter a parse tree produced by the `nestedRowExpressionAtom`
     * labeled alternative in `MySqlParser.expressionAtom`.
     * @param ctx the parse tree
     */
    enterNestedRowExpressionAtom;
    /**
     * Exit a parse tree produced by the `nestedRowExpressionAtom`
     * labeled alternative in `MySqlParser.expressionAtom`.
     * @param ctx the parse tree
     */
    exitNestedRowExpressionAtom;
    /**
     * Enter a parse tree produced by the `existsExpressionAtom`
     * labeled alternative in `MySqlParser.expressionAtom`.
     * @param ctx the parse tree
     */
    enterExistsExpressionAtom;
    /**
     * Exit a parse tree produced by the `existsExpressionAtom`
     * labeled alternative in `MySqlParser.expressionAtom`.
     * @param ctx the parse tree
     */
    exitExistsExpressionAtom;
    /**
     * Enter a parse tree produced by the `subqueryExpressionAtom`
     * labeled alternative in `MySqlParser.expressionAtom`.
     * @param ctx the parse tree
     */
    enterSubqueryExpressionAtom;
    /**
     * Exit a parse tree produced by the `subqueryExpressionAtom`
     * labeled alternative in `MySqlParser.expressionAtom`.
     * @param ctx the parse tree
     */
    exitSubqueryExpressionAtom;
    /**
     * Enter a parse tree produced by the `intervalExpressionAtom`
     * labeled alternative in `MySqlParser.expressionAtom`.
     * @param ctx the parse tree
     */
    enterIntervalExpressionAtom;
    /**
     * Exit a parse tree produced by the `intervalExpressionAtom`
     * labeled alternative in `MySqlParser.expressionAtom`.
     * @param ctx the parse tree
     */
    exitIntervalExpressionAtom;
    /**
     * Enter a parse tree produced by the `bitExpressionAtom`
     * labeled alternative in `MySqlParser.expressionAtom`.
     * @param ctx the parse tree
     */
    enterBitExpressionAtom;
    /**
     * Exit a parse tree produced by the `bitExpressionAtom`
     * labeled alternative in `MySqlParser.expressionAtom`.
     * @param ctx the parse tree
     */
    exitBitExpressionAtom;
    /**
     * Enter a parse tree produced by the `mathExpressionAtom`
     * labeled alternative in `MySqlParser.expressionAtom`.
     * @param ctx the parse tree
     */
    enterMathExpressionAtom;
    /**
     * Exit a parse tree produced by the `mathExpressionAtom`
     * labeled alternative in `MySqlParser.expressionAtom`.
     * @param ctx the parse tree
     */
    exitMathExpressionAtom;
    /**
     * Enter a parse tree produced by the `jsonExpressionAtom`
     * labeled alternative in `MySqlParser.expressionAtom`.
     * @param ctx the parse tree
     */
    enterJsonExpressionAtom;
    /**
     * Exit a parse tree produced by the `jsonExpressionAtom`
     * labeled alternative in `MySqlParser.expressionAtom`.
     * @param ctx the parse tree
     */
    exitJsonExpressionAtom;
    /**
     * Enter a parse tree produced by the `collateExpressionAtom`
     * labeled alternative in `MySqlParser.expressionAtom`.
     * @param ctx the parse tree
     */
    enterCollateExpressionAtom;
    /**
     * Exit a parse tree produced by the `collateExpressionAtom`
     * labeled alternative in `MySqlParser.expressionAtom`.
     * @param ctx the parse tree
     */
    exitCollateExpressionAtom;
    /**
     * Enter a parse tree produced by `MySqlParser.unaryOperator`.
     * @param ctx the parse tree
     */
    enterUnaryOperator;
    /**
     * Exit a parse tree produced by `MySqlParser.unaryOperator`.
     * @param ctx the parse tree
     */
    exitUnaryOperator;
    /**
     * Enter a parse tree produced by `MySqlParser.comparisonOperator`.
     * @param ctx the parse tree
     */
    enterComparisonOperator;
    /**
     * Exit a parse tree produced by `MySqlParser.comparisonOperator`.
     * @param ctx the parse tree
     */
    exitComparisonOperator;
    /**
     * Enter a parse tree produced by `MySqlParser.logicalOperator`.
     * @param ctx the parse tree
     */
    enterLogicalOperator;
    /**
     * Exit a parse tree produced by `MySqlParser.logicalOperator`.
     * @param ctx the parse tree
     */
    exitLogicalOperator;
    /**
     * Enter a parse tree produced by `MySqlParser.bitOperator`.
     * @param ctx the parse tree
     */
    enterBitOperator;
    /**
     * Exit a parse tree produced by `MySqlParser.bitOperator`.
     * @param ctx the parse tree
     */
    exitBitOperator;
    /**
     * Enter a parse tree produced by `MySqlParser.multOperator`.
     * @param ctx the parse tree
     */
    enterMultOperator;
    /**
     * Exit a parse tree produced by `MySqlParser.multOperator`.
     * @param ctx the parse tree
     */
    exitMultOperator;
    /**
     * Enter a parse tree produced by `MySqlParser.addOperator`.
     * @param ctx the parse tree
     */
    enterAddOperator;
    /**
     * Exit a parse tree produced by `MySqlParser.addOperator`.
     * @param ctx the parse tree
     */
    exitAddOperator;
    /**
     * Enter a parse tree produced by `MySqlParser.jsonOperator`.
     * @param ctx the parse tree
     */
    enterJsonOperator;
    /**
     * Exit a parse tree produced by `MySqlParser.jsonOperator`.
     * @param ctx the parse tree
     */
    exitJsonOperator;
    /**
     * Enter a parse tree produced by `MySqlParser.charsetNameBase`.
     * @param ctx the parse tree
     */
    enterCharsetNameBase;
    /**
     * Exit a parse tree produced by `MySqlParser.charsetNameBase`.
     * @param ctx the parse tree
     */
    exitCharsetNameBase;
    /**
     * Enter a parse tree produced by `MySqlParser.transactionLevelBase`.
     * @param ctx the parse tree
     */
    enterTransactionLevelBase;
    /**
     * Exit a parse tree produced by `MySqlParser.transactionLevelBase`.
     * @param ctx the parse tree
     */
    exitTransactionLevelBase;
    /**
     * Enter a parse tree produced by `MySqlParser.privilegesBase`.
     * @param ctx the parse tree
     */
    enterPrivilegesBase;
    /**
     * Exit a parse tree produced by `MySqlParser.privilegesBase`.
     * @param ctx the parse tree
     */
    exitPrivilegesBase;
    /**
     * Enter a parse tree produced by `MySqlParser.intervalTypeBase`.
     * @param ctx the parse tree
     */
    enterIntervalTypeBase;
    /**
     * Exit a parse tree produced by `MySqlParser.intervalTypeBase`.
     * @param ctx the parse tree
     */
    exitIntervalTypeBase;
    /**
     * Enter a parse tree produced by `MySqlParser.dataTypeBase`.
     * @param ctx the parse tree
     */
    enterDataTypeBase;
    /**
     * Exit a parse tree produced by `MySqlParser.dataTypeBase`.
     * @param ctx the parse tree
     */
    exitDataTypeBase;
    /**
     * Enter a parse tree produced by `MySqlParser.keywordsCanBeId`.
     * @param ctx the parse tree
     */
    enterKeywordsCanBeId;
    /**
     * Exit a parse tree produced by `MySqlParser.keywordsCanBeId`.
     * @param ctx the parse tree
     */
    exitKeywordsCanBeId;
    /**
     * Enter a parse tree produced by `MySqlParser.functionNameBase`.
     * @param ctx the parse tree
     */
    enterFunctionNameBase;
    /**
     * Exit a parse tree produced by `MySqlParser.functionNameBase`.
     * @param ctx the parse tree
     */
    exitFunctionNameBase;
    visitTerminal(node) { }
    visitErrorNode(node) { }
    enterEveryRule(node) { }
    exitEveryRule(node) { }
}
exports.MySqlParserListener = MySqlParserListener;
