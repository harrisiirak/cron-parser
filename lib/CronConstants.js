"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CronConstants = void 0;
class CronConstants {
    constructor() {
        throw new Error('This class is not meant to be instantiated.');
    }
    static get constraints() {
        return {
            second: { min: 0, max: 59, chars: [] },
            minute: { min: 0, max: 59, chars: [] },
            hour: { min: 0, max: 23, chars: [] },
            dayOfMonth: { min: 1, max: 31, chars: ['L'] },
            month: { min: 1, max: 12, chars: [] },
            dayOfWeek: { min: 0, max: 7, chars: ['L'] },
        };
    }
    static get daysInMonth() {
        return [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    }
}
exports.CronConstants = CronConstants;
