var util = require('util');
var test = require('tap').test;
var CronParser = require('../lib/parser');

// Globals

test('load crontab file', function(t) {
  CronParser.parseFile('./crontab.example', function(result) {
  	//t.ifError(err, 'Interval parse error');
  	//t.ok(interval, 'Interval parsed');

    console.log(util.inspect(result, false, 100));
    console.log(result.expressions[0].next());
  	t.end();
  });
});