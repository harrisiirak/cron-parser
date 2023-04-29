import {SixtyRange} from '../types';
import {CronField} from './CronField';
import {CronConstants} from '../CronConstants';

const {min, max, chars} = CronConstants.constraints.second;

export class CronSecond extends CronField {
  get values(): SixtyRange[] {
    return super.values as SixtyRange[];
  }

  constructor(values: SixtyRange[], wildcard = false) {
    super(values, min, max, chars, wildcard);
    this.validate();
  }
}
