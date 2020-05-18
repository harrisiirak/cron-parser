var util = require('util');
var test = require('tap').test;
var CronParser = require('../lib/parser');

test('parse cron with last day in month', function(t) {
  var options = {
    currentDate: new Date(2014, 0, 1),
    endDate: new Date(2014, 10, 1)
  };

  try {
    var interval = CronParser.parseExpression('0 0 L * *', options);
    t.equal(interval.hasNext(), true);
    // t.equal(interval.hasNext(), !true);

    // for (i = 0; i < 24; ++i) {
    //   var next = interval.next();
    //   console.log(next.toString());
    //   t.ok(next, 'first date');
    // }
    for (i = 0; i < 10; ++i) {
      var next = interval.next();
      console.log(next.toString());
      t.ok(next, 'has a date');
    }

  } catch (err) {
    t.ifError(err, 'Parse read error');
  }

  t.end();
});

// test('parse cron with last day in month for fixed month', function(t) {
//   var options = {
//     currentDate: new Date(2014, 0, 1),
//     endDate: new Date(2014, 0, 1)
//   };

//   try {
//     var interval = CronParser.parseExpression('* * L 2 *', options);
//     t.equal(interval.hasNext(), false);
//   } catch (err) {
//     t.ifError(err, 'Parse read error');
//   }

//   t.end();
// });

