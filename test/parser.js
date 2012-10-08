var test = require('tap').test;
var CronInterval = require('../lib/interval');

//test('parse primary interval', function(t) {
  CronInterval.parse('2-59/5 1,10-20/2,10-20/4,22 11-26 1-6 *', function(err, interval) {
  	console.log(arguments);
  });
//});

/*
test('parse primary interval 2', function(t) {
  CronInterval.parse('20,30,40 * * * mon,fri', function(err, interval) {
  	t.end();
  });
});
*/