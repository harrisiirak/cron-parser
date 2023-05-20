import { CronExpression } from '../src';
import { CronFieldCollection } from '../src';

describe('CronExpression', () => {
  test('Fields are exposed', () => {
    const interval = CronExpression.parse('0 1 2 3 * 1-3,5');
    expect(interval).toBeTruthy();

    // CronExpression.map.forEach((field) => {
    //   Object.defineProperty(interval.fields, field, {
    //     value: [],
    //     writable: false,
    //   });
    //
    //
    //   const key = field as keyof CronFieldCollection;
    //   const expected = Array.from(interval.fields[key] as number[]);
    //   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //   // @ts-ignore
    //   interval.fields[key].push(-1);
    //   expect(interval.fields[key]).toEqual(expected);
    //   delete interval.fields[key];
    //   expect(interval.fields[key]).toEqual(expected);
    // });

    // interval.fields['dummy' as keyof CronFieldCollection] = [];
    expect(interval.fields['dummy' as keyof CronFieldCollection]).toBeUndefined();
    expect(interval.fields.second.values).toEqual([0]);
    expect(interval.fields.minute.values).toEqual([1]);
    expect(interval.fields.hour.values).toEqual([2]);
    expect(interval.fields.dayOfMonth.values).toEqual([3]);
    expect(interval.fields.month.values).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
    ]);
    expect(interval.fields.dayOfWeek.values).toEqual([1, 2, 3, 5]);
  });
});
