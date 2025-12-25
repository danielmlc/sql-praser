import { CharStream, CommonTokenStream } from 'antlr4';
import { TiDBLexer } from './generated/TiDBLexer';
import { TiDBParser, RootContext } from './generated/TiDBParser';

/**
 * TiDB SQL Parser - Main parser interface
 *
 * @example
 * ```typescript
 * const parser = new TiDBSQLParser();
 * const ast = parser.parse('SELECT * FROM users WHERE id = 1');
 * console.log(ast.toStringTree(parser.parser));
 * ```
 */
export class TiDBSQLParser {
    public lexer?: TiDBLexer;
    public parser?: TiDBParser;

    /**
     * Parse SQL string and return the AST root node
     *
     * @param sql - SQL string to parse
     * @returns Root context of the parsed SQL
     * @throws Error if parsing fails
     */
    parse(sql: string): RootContext {
        // Create character stream from input SQL
        const inputStream = new CharStream(sql);

        // Create lexer
        this.lexer = new TiDBLexer(inputStream);

        // Create token stream
        const tokenStream = new CommonTokenStream(this.lexer);

        // Create parser
        this.parser = new TiDBParser(tokenStream);

        // Optional: Custom error handling
        this.parser.removeErrorListeners();
        this.parser.addErrorListener({
            syntaxError: (recognizer, offendingSymbol, line, column, msg, e) => {
                throw new Error(`Syntax Error at line ${line}:${column} - ${msg}`);
            }
        });

        // Parse and return AST
        return this.parser.root();
    }

    /**
     * Validate SQL syntax without returning AST
     *
     * @param sql - SQL string to validate
     * @returns true if valid, false otherwise
     */
    validate(sql: string): boolean {
        try {
            this.parse(sql);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get detailed error information for invalid SQL
     *
     * @param sql - SQL string to validate
     * @returns Error message or null if valid
     */
    getErrors(sql: string): string | null {
        try {
            this.parse(sql);
            return null;
        } catch (error) {
            return error instanceof Error ? error.message : String(error);
        }
    }
}
