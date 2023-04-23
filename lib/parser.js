"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CronParser = void 0;
const fs_1 = __importDefault(require("fs"));
const expression_1 = require("./expression");
const assert_1 = __importDefault(require("assert"));
// noinspection JSUnusedGlobalSymbols
class CronParser {
    /**
     * Parse crontab entry
     *
     * @private
     * @param {string} entry Crontab file entry/line
     */
    static #parseEntry(entry) {
        const atoms = entry.split(' ');
        if (atoms.length === 6) {
            return { interval: expression_1.CronExpression.parse(entry) };
        }
        else if (atoms.length > 6) {
            return { interval: expression_1.CronExpression.parse(atoms.slice(0, 6).join(' ')), command: atoms.slice(6, atoms.length) };
        }
        else {
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
    static parseExpression(expression, options) {
        return expression_1.CronExpression.parse(expression, options);
    }
    /**
     * Wrapper for CronExpression.fieldsToExpression method
     *
     * @public
     * @param {object} fields Input fields
     * @param {object} [options] Parsing options
     * @return {object}
     */
    static fieldsToExpression(fields, options) {
        console.log('######################### fieldsToExpression', fields.constructor.name);
        return expression_1.CronExpression.fieldsToExpression(fields, options);
    }
    /**
     * Parse content string
     *
     * @public
     * @param {string} data Crontab content
     * @return {object}
     */
    static parseString(data) {
        const blocks = data.split('\n');
        const response = { variables: {}, expressions: [], errors: {} };
        for (const block of blocks) {
            const entry = block.trim(); // Remove surrounding spaces
            if (entry.length > 0) {
                if (entry.match(/^#/)) {
                    // Comment
                    // continue; // unnecessary
                }
                else if (entry.match(/^(.*)=(.*)$/)) {
                    // Variable
                    const matches = entry.match(/^(.*)=(.*)$/);
                    (0, assert_1.default)(matches !== null, 'parseString: matches is null');
                    const [/* unused */ , key, value] = matches;
                    response.variables[key] = value;
                }
                else {
                    // Expression?
                    try {
                        const result = CronParser.#parseEntry('0 ' + entry);
                        response.expressions.push(result.interval);
                    }
                    catch (err) {
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
    static parseFile(filePath, callback) {
        fs_1.default.readFile(filePath, (err, data) => {
            if (err) {
                return void callback(err);
            }
            callback(null, CronParser.parseString(data.toString()));
        });
    }
}
exports.CronParser = CronParser;
