export type CronConstraints = {
  second: { min: number, max: number, chars: string[] },
  minute: { min: number, max: number, chars: string[] },
  hour: { min: number, max: number, chars: string[] },
  dayOfMonth: { min: number, max: number, chars: string[] },
  month: { min: number, max: number, chars: string[] },
  dayOfWeek: { min: number, max: number, chars: string[] },
}

export class CronConstants {
  constructor() {
    throw new Error('This class is not meant to be instantiated.');
  }

  static get constraints(): CronConstraints {
    return {
      second: {min: 0, max: 59, chars: []},
      minute: {min: 0, max: 59, chars: []},
      hour: {min: 0, max: 23, chars: []},
      dayOfMonth: {min: 1, max: 31, chars: ['L']},
      month: {min: 1, max: 12, chars: []},
      dayOfWeek: {min: 0, max: 7, chars: ['L']},
    };
  }

  static get daysInMonth(): number[] {
    return [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  }
}
