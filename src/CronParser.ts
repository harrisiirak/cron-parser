import fs from 'fs';
import {CronExpression} from './CronExpression';
import {CronFields} from './CronFields';
import assert from 'assert';

// noinspection JSUnusedGlobalSymbols
class CronParser {
    /**
     * Parse crontab entry
     *
     * @private
     * @param {string} entry Crontab file entry/line
     */
    static #parseEntry(entry: string) {
        const atoms = entry.split(' ');

        if (atoms.length === 6) {
            return {interval: CronExpression.parse(entry)};
        } else if (atoms.length > 6) {
            return {interval: CronExpression.parse(atoms.slice(0, 6).join(' ')), command: atoms.slice(6, atoms.length)};
        } else {
            throw new Error(`Invalid entry: ${entry}`);
        }
    }

    /**
     * Wrapper for CronExpression.parse method
     *
     * @public
     * @param {string} expression Input expression
     * @param {object} [options] Parsing options
     * @return {object}
     */
    static parseExpression(expression: string, options?: object) {
        return CronExpression.parse(expression, options);
    }

    /**
     * Wrapper for CronExpression.fieldsToExpression method
     *
     * @public
     * @param {object} fields Input fields
     * @param {object} [options] Parsing options
     * @return {object}
     */
    static fieldsToExpression(fields: CronFields, options?: object) {
        return CronExpression.fieldsToExpression(fields, options);
    }

    /**
     * Parse content string
     *
     * @public
     * @param {string} data Crontab content
     * @return {object}
     */
    static parseString(data: string) {
        const blocks = data.split('\n');

        type Response = { variables: { [key: string]: number | string }, expressions: CronExpression[], errors: { [key: string]: unknown } }
        const response: Response = {variables: {}, expressions: [], errors: {}};

        for (const block of blocks) {
            const entry = block.trim(); // Remove surrounding spaces

            if (entry.length > 0) {
                if (entry.match(/^#/)) {
                    // Comment
                    // continue; // unnecessary
                } else if (entry.match(/^(.*)=(.*)$/)) {
                    // Variable
                    const matches = entry.match(/^(.*)=(.*)$/);
                    assert(matches !== null, 'parseString: matches is null');
                    const [/* unused */, key, value] = matches;
                    response.variables[key] = value;
                } else {
                    // Expression?
                    try {
                        const result = CronParser.#parseEntry('0 ' + entry);
                        response.expressions.push(result.interval);
                    } catch (err: unknown) {
                        response.errors[entry] = err;
                    }
                }
            }
        }

        return response;
    }

    /**
     * Parse crontab file
     *
     * @public
     * @param {string} filePath Path to file
     * @param {function} callback
     */
    static parseFile(filePath: string, callback: (error: Error | null, data?: object) => void) {
        fs.readFile(filePath, (err, data) => {
            if (err) {
                return void callback(err);
            }
            callback(null, CronParser.parseString(data.toString()));
        });
    }
}

export {CronParser};

