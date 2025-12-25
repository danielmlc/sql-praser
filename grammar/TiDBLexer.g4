lexer grammar TiDBLexer;

// Keywords (TiDB/MySQL compatible)
SELECT: S E L E C T;
FROM: F R O M;
WHERE: W H E R E;
AND: A N D;
OR: O R;
NOT: N O T;
IN: I N;
IS: I S;
NULL: N U L L;
LIKE: L I K E;
AS: A S;
JOIN: J O I N;
LEFT: L E F T;
RIGHT: R I G H T;
INNER: I N N E R;
OUTER: O U T E R;
ON: O N;
GROUP: G R O U P;
BY: B Y;
HAVING: H A V I N G;
ORDER: O R D E R;
ASC: A S C;
DESC: D E S C;
LIMIT: L I M I T;
OFFSET: O F F S E T;
UNION: U N I O N;
ALL: A L L;
DISTINCT: D I S T I N C T;

// DML
INSERT: I N S E R T;
INTO: I N T O;
VALUES: V A L U E S;
UPDATE: U P D A T E;
SET: S E T;
DELETE: D E L E T E;

// DDL
CREATE: C R E A T E;
ALTER: A L T E R;
DROP: D R O P;
TABLE: T A B L E;
DATABASE: D A T A B A S E;
INDEX: I N D E X;
VIEW: V I E W;
SCHEMA: S C H E M A;

// Data Types
INT: I N T;
INTEGER: I N T E G E R;
BIGINT: B I G I N T;
SMALLINT: S M A L L I N T;
TINYINT: T I N Y I N T;
VARCHAR: V A R C H A R;
CHAR: C H A R;
TEXT: T E X T;
DECIMAL: D E C I M A L;
NUMERIC: N U M E R I C;
FLOAT: F L O A T;
DOUBLE: D O U B L E;
DATE: D A T E;
DATETIME: D A T E T I M E;
TIMESTAMP: T I M E S T A M P;
BOOLEAN: B O O L E A N;
BOOL: B O O L;

// Constraints
PRIMARY: P R I M A R Y;
KEY: K E Y;
UNIQUE: U N I Q U E;
FOREIGN: F O R E I G N;
REFERENCES: R E F E R E N C E S;
CONSTRAINT: C O N S T R A I N T;
DEFAULT: D E F A U L T;
AUTO_INCREMENT: A U T O '_' I N C R E M E N T;

// TiDB Specific
PARTITION: P A R T I T I O N;
PARTITIONS: P A R T I T I O N S;
HASH: H A S H;
RANGE: R A N G E;
LIST: L I S T;
SHARD_ROW_ID_BITS: S H A R D '_' R O W '_' I D '_' B I T S;
PRE_SPLIT_REGIONS: P R E '_' S P L I T '_' R E G I O N S;

// Functions
COUNT: C O U N T;
SUM: S U M;
AVG: A V G;
MAX: M A X;
MIN: M I N;
CASE: C A S E;
WHEN: W H E N;
THEN: T H E N;
ELSE: E L S E;
END: E N D;

// Operators
PLUS: '+';
MINUS: '-';
STAR: '*';
DIVIDE: '/';
MOD: '%';
EQ: '=';
NEQ: '!=' | '<>';
LT: '<';
LE: '<=';
GT: '>';
GE: '>=';

// Delimiters
LPAREN: '(';
RPAREN: ')';
COMMA: ',';
SEMICOLON: ';';
DOT: '.';

// Literals
NUMBER: DIGIT+ ('.' DIGIT+)?;
STRING: '\'' (~'\'' | '\'\'')* '\'';
IDENTIFIER: [a-zA-Z_] [a-zA-Z0-9_]*;
QUOTED_IDENTIFIER: '`' (~'`' | '``')* '`';

// Whitespace and Comments
WS: [ \t\r\n]+ -> skip;
LINE_COMMENT: '--' ~[\r\n]* -> skip;
BLOCK_COMMENT: '/*' .*? '*/' -> skip;

// Fragments
fragment A: [aA];
fragment B: [bB];
fragment C: [cC];
fragment D: [dD];
fragment E: [eE];
fragment F: [fF];
fragment G: [gG];
fragment H: [hH];
fragment I: [iI];
fragment J: [jJ];
fragment K: [kK];
fragment L: [lL];
fragment M: [mM];
fragment N: [nN];
fragment O: [oO];
fragment P: [pP];
fragment Q: [qQ];
fragment R: [rR];
fragment S: [sS];
fragment T: [tT];
fragment U: [uU];
fragment V: [vV];
fragment W: [wW];
fragment X: [xX];
fragment Y: [yY];
fragment Z: [zZ];
fragment DIGIT: [0-9];
