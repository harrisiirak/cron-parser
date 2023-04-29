import {CronField} from './CronField';
import {CronConstants} from '../CronConstants';
import {MonthRange} from '../types';
const {min, max, chars} = CronConstants.constraints.month;

export class CronMonth extends CronField {
  get values(): MonthRange[] {
    return super.values as MonthRange[];
  }
  constructor(values: MonthRange[], wildcard = false) {
    super(values, min, max, chars, wildcard);
    this.validate();
  }
}
