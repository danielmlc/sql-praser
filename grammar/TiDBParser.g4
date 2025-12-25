parser grammar TiDBParser;

options {
    tokenVocab = TiDBLexer;
}

// Root rule
root
    : sqlStatements? EOF
    ;

sqlStatements
    : sqlStatement (SEMICOLON sqlStatement)* SEMICOLON?
    ;

sqlStatement
    : dmlStatement
    | ddlStatement
    | utilityStatement
    ;

// DML Statements
dmlStatement
    : selectStatement
    | insertStatement
    | updateStatement
    | deleteStatement
    ;

// SELECT Statement
selectStatement
    : SELECT selectElements
      fromClause?
      whereClause?
      groupByClause?
      havingClause?
      orderByClause?
      limitClause?
    | selectStatement UNION (ALL | DISTINCT)? selectStatement
    ;

selectElements
    : (DISTINCT | ALL)? selectElement (COMMA selectElement)*
    ;

selectElement
    : STAR                                          # SelectStarElement
    | tableName DOT STAR                            # SelectTableStarElement
    | expression (AS? columnAlias)?                 # SelectExpressionElement
    ;

fromClause
    : FROM tableSource (COMMA tableSource)*
    ;

tableSource
    : tableName (AS? tableAlias)?                   # TableSourceBase
    | LPAREN selectStatement RPAREN AS? tableAlias  # TableSourceSubquery
    | tableSource joinPart                          # TableSourceJoin
    ;

joinPart
    : (INNER | LEFT | RIGHT)? (OUTER)? JOIN tableSource (ON expression)?
    ;

whereClause
    : WHERE expression
    ;

groupByClause
    : GROUP BY groupByItem (COMMA groupByItem)*
    ;

groupByItem
    : expression
    ;

havingClause
    : HAVING expression
    ;

orderByClause
    : ORDER BY orderByExpression (COMMA orderByExpression)*
    ;

orderByExpression
    : expression (ASC | DESC)?
    ;

limitClause
    : LIMIT limit=NUMBER (OFFSET offset=NUMBER)?
    | LIMIT offset=NUMBER COMMA limit=NUMBER
    ;

// INSERT Statement
insertStatement
    : INSERT INTO tableName (LPAREN columnName (COMMA columnName)* RPAREN)? insertStatementValue
    ;

insertStatementValue
    : VALUES expressionList (COMMA expressionList)*
    | selectStatement
    ;

// UPDATE Statement
updateStatement
    : UPDATE tableName SET updatedElement (COMMA updatedElement)* whereClause?
    ;

updatedElement
    : columnName EQ expression
    ;

// DELETE Statement
deleteStatement
    : DELETE FROM tableName whereClause?
    ;

// DDL Statements
ddlStatement
    : createTable
    | createDatabase
    | alterTable
    | dropTable
    | dropDatabase
    ;

createDatabase
    : CREATE (DATABASE | SCHEMA) databaseName
    ;

dropDatabase
    : DROP (DATABASE | SCHEMA) databaseName
    ;

createTable
    : CREATE TABLE tableName LPAREN createDefinitions RPAREN tableOption*
    ;

createDefinitions
    : createDefinition (COMMA createDefinition)*
    ;

createDefinition
    : columnName columnDefinition                   # ColumnDeclaration
    | (CONSTRAINT constraintName?)? PRIMARY KEY LPAREN indexColumnNames RPAREN  # PrimaryKeyDeclaration
    | (CONSTRAINT constraintName?)? UNIQUE (INDEX | KEY)? indexName? LPAREN indexColumnNames RPAREN  # UniqueKeyDeclaration
    | (CONSTRAINT constraintName?)? FOREIGN KEY indexName? LPAREN indexColumnNames RPAREN REFERENCES tableName LPAREN indexColumnNames RPAREN  # ForeignKeyDeclaration
    | (INDEX | KEY) indexName? LPAREN indexColumnNames RPAREN  # IndexDeclaration
    ;

columnDefinition
    : dataType columnConstraint*
    ;

dataType
    : typeName=(INT | INTEGER | TINYINT | SMALLINT | BIGINT) (LPAREN length=NUMBER RPAREN)?  # IntDataType
    | typeName=(VARCHAR | CHAR) LPAREN length=NUMBER RPAREN  # StringDataType
    | typeName=TEXT  # TextDataType
    | typeName=(DECIMAL | NUMERIC) (LPAREN precision=NUMBER (COMMA scale=NUMBER)? RPAREN)?  # DecimalDataType
    | typeName=(FLOAT | DOUBLE) (LPAREN precision=NUMBER (COMMA scale=NUMBER)? RPAREN)?  # FloatDataType
    | typeName=(DATE | DATETIME | TIMESTAMP)  # DateTimeDataType
    | typeName=(BOOLEAN | BOOL)  # BoolDataType
    ;

columnConstraint
    : NOT NULL                                      # NotNullConstraint
    | NULL                                          # NullConstraint
    | DEFAULT defaultValue                          # DefaultConstraint
    | AUTO_INCREMENT                                # AutoIncrementConstraint
    | PRIMARY KEY                                   # PrimaryKeyConstraint
    | UNIQUE (KEY)?                                 # UniqueConstraint
    ;

defaultValue
    : constant
    | expression
    ;

tableOption
    : PARTITION BY partitionType LPAREN expression RPAREN partitionDefinitions?  # PartitionOption
    | SHARD_ROW_ID_BITS EQ NUMBER  # ShardRowIdBitsOption
    | PRE_SPLIT_REGIONS EQ NUMBER  # PreSplitRegionsOption
    ;

partitionType
    : HASH
    | RANGE
    | LIST
    ;

partitionDefinitions
    : PARTITIONS NUMBER
    | LPAREN partitionDefinition (COMMA partitionDefinition)* RPAREN
    ;

partitionDefinition
    : PARTITION partitionName VALUES LESS THAN LPAREN expression RPAREN
    ;

indexColumnNames
    : indexColumnName (COMMA indexColumnName)*
    ;

indexColumnName
    : columnName
    ;

alterTable
    : ALTER TABLE tableName alterSpecification (COMMA alterSpecification)*
    ;

alterSpecification
    : ADD COLUMN? columnName columnDefinition
    | DROP COLUMN? columnName
    | MODIFY COLUMN? columnName columnDefinition
    ;

dropTable
    : DROP TABLE tableName
    ;

// Utility Statements
utilityStatement
    : /* Can add SHOW, DESCRIBE, etc. */
    ;

// Expressions
expression
    : constant                                      # ConstantExpression
    | columnName                                    # ColumnNameExpression
    | tableName DOT columnName                      # QualifiedColumnExpression
    | functionCall                                  # FunctionCallExpression
    | LPAREN expression RPAREN                      # NestedExpression
    | left=expression op=(STAR | DIVIDE | MOD) right=expression  # BinaryExpression
    | left=expression op=(PLUS | MINUS) right=expression  # BinaryExpression
    | left=expression comparisonOperator right=expression  # ComparisonExpression
    | left=expression IS NOT? NULL                  # IsNullExpression
    | left=expression NOT? IN expressionList        # InExpression
    | left=expression NOT? LIKE right=expression    # LikeExpression
    | left=expression AND right=expression          # LogicalExpression
    | left=expression OR right=expression           # LogicalExpression
    | NOT expression                                # NotExpression
    | CASE expression? whenClause+ (ELSE elseArg=expression)? END  # CaseExpression
    ;

comparisonOperator
    : EQ | NEQ | LT | LE | GT | GE
    ;

whenClause
    : WHEN condition=expression THEN result=expression
    ;

functionCall
    : aggregateFunction
    | scalarFunction
    ;

aggregateFunction
    : (COUNT | SUM | AVG | MAX | MIN) LPAREN (STAR | DISTINCT? expression) RPAREN
    ;

scalarFunction
    : functionName LPAREN (expression (COMMA expression)*)? RPAREN
    ;

expressionList
    : LPAREN expression (COMMA expression)* RPAREN
    ;

// Constants
constant
    : NUMBER                                        # NumberLiteral
    | STRING                                        # StringLiteral
    | NULL                                          # NullLiteral
    ;

// Names
databaseName: identifier;
tableName: identifier;
columnName: identifier;
indexName: identifier;
constraintName: identifier;
partitionName: identifier;
tableAlias: identifier;
columnAlias: identifier;
functionName: identifier;

identifier
    : IDENTIFIER
    | QUOTED_IDENTIFIER
    ;
