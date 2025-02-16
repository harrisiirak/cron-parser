import { CronExpression } from './CronExpression';
import { CronExpressionParser } from './CronExpressionParser';

export type CronFileParserResult = {
  variables: { [key: string]: string };
  expressions: CronExpression[];
  errors: { [key: string]: unknown };
};

/**
 * Parser for crontab files that handles both synchronous and asynchronous operations.
 */
export class CronFileParser {
  /**
   * Parse a crontab file asynchronously
   * @param filePath Path to crontab file
   * @returns Promise resolving to parse results
   * @throws If file cannot be read
   */
  static async parseFile(filePath: string): Promise<CronFileParserResult> {
    const { readFile } = await import('fs/promises');
    const data = await readFile(filePath, 'utf8');
    return CronFileParser.#parseContent(data);
  }

  /**
   * Parse a crontab file synchronously
   * @param filePath Path to crontab file
   * @returns Parse results
   * @throws If file cannot be read
   */
  static parseFileSync(filePath: string): CronFileParserResult {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { readFileSync } = require('fs');
    const data = readFileSync(filePath, 'utf8');
    return CronFileParser.#parseContent(data);
  }

  /**
   * Internal method to parse crontab file content
   * @private
   */
  static #parseContent(data: string): CronFileParserResult {
    const blocks = data.split('\n');
    const result: CronFileParserResult = {
      variables: {},
      expressions: [],
      errors: {},
    };

    for (const block of blocks) {
      const entry = block.trim();
      if (entry.length === 0 || entry.startsWith('#')) {
        continue;
      }

      const variableMatch = entry.match(/^(.*)=(.*)$/);
      if (variableMatch) {
        const [, key, value] = variableMatch;
        result.variables[key] = value.replace(/["']/g, ''); // Remove quotes
        continue;
      }

      try {
        const parsedEntry = CronFileParser.#parseEntry(entry);
        result.expressions.push(parsedEntry.interval);
      } catch (err: unknown) {
        result.errors[entry] = err;
      }
    }

    return result;
  }

  /**
   * Parse a single crontab entry
   * @private
   */
  static #parseEntry(entry: string): { interval: CronExpression; command?: string[] } {
    const atoms = entry.split(' ');
    return {
      interval: CronExpressionParser.parse(atoms.slice(0, 5).join(' ')),
      command: atoms.slice(5, atoms.length),
    };
  }
}
