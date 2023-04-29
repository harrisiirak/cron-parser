import {CronField} from './CronField';
import {CronConstants} from '../CronConstants';
import {DayOfTheWeekRange} from '../types';

const {min, max, chars} = CronConstants.constraints.dayOfWeek;

export class CronDayOfTheWeek extends CronField {
  get values(): DayOfTheWeekRange[] {
    return super.values as DayOfTheWeekRange[];
  }

  constructor(values: DayOfTheWeekRange[], wildcard = false) {
    super(values, min, max, chars, wildcard);
    this.validate();
  }
}
