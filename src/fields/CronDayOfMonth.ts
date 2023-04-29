import {CronField} from './CronField';
import {CronConstants} from '../CronConstants';
import {DayOfTheMonthRange} from '../types';
const {min, max, chars} = CronConstants.constraints.dayOfMonth;

export class CronDayOfMonth extends CronField {
  get values(): DayOfTheMonthRange[] {
    return super.values as DayOfTheMonthRange[];
  }
  constructor(values: DayOfTheMonthRange[], wildcard = false) {
    super(values, min, max, chars, wildcard);
    this.validate();
  }
}
