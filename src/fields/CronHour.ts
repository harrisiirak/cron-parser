import {CronField} from './CronField';
import {CronConstants} from '../CronConstants';
import {HourRange} from '../types';

const {min, max, chars} = CronConstants.constraints.hour;

export class CronHour extends CronField {
  get values(): HourRange[] {
    return super.values as HourRange[];
  }

  constructor(values: HourRange[], wildcard = false) {
    super(values, min, max, chars, wildcard);
    this.validate();
  }
}
