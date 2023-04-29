import {CronField} from './CronField';
import {CronConstants} from '../CronConstants';
import {SixtyRange} from '../types';

const {min, max, chars} = CronConstants.constraints.minute;

export class CronMinute extends CronField {
  get values(): SixtyRange[] {
    return super.values as SixtyRange[];
  }

  constructor(values: SixtyRange[], wildcard = false) {
    super(values, min, max, chars, wildcard);
    this.validate();
  }
}
