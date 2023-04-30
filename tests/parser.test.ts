import {CronDate, CronParser} from '../src';

describe('CronParser', () => {
  test('load crontab file', function () {
    CronParser.parseFile(__dirname + '/crontab.example', (err, result) => {
      if (err) {
        err.message = 'File read error: ' + err.message;
        throw err;
      }
      if (!(result && 'variables' in result && 'expressions' in result && 'errors' in result)) {
        throw new Error('result is not ParseStringResponse');
      }
      // t.ok(result, 'Crontab parsed parsed');
      expect(Object.keys(result.variables).length).toEqual(2); // variables length matches
      expect(Object.keys(result.errors).length).toEqual(0); // errors length matches
      expect(result.expressions.length).toEqual(3); // expressions length matches

      // Parse expressions
      let next;
      expect(result.expressions[0].hasNext()).toEqual(true);
      next = result.expressions[0].next();
      expect(next).toBeInstanceOf(CronDate); // first date

      next = result.expressions[1].next();
      expect(next).toBeInstanceOf(CronDate); // second date

      next = result.expressions[2].next();
      expect(next).toBeInstanceOf(CronDate); // third date
    });
  });

  test('no next date', function () {
    const options = {
      currentDate: new Date(2014, 0, 1),
      endDate: new Date(2014, 0, 1),
    };

    const interval = CronParser.parseExpression('* * 2 * *', options);
    expect(interval.hasNext()).toEqual(false);
  });
});




