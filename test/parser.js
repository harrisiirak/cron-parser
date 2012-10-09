var util = require('util');
var test = require('tap').test;
var CronInterval = require('../lib/interval');

//test('parse primary interval', function(t) {
  CronInterval.parse('*/5 5,12-14 12-26 4-6 3-4 *', function(err, interval) {
  	if (err) {
  		throw err;
  	}

  	for (var i = 0, c = 100; i < c; i++) {
  		console.log(interval.next());
  	}

  	console.log('----');

  	for (var i = 0, c = 50; i < c; i++) {
  		//console.log(interval.prev());
  	}

  	console.log(util.inspect(interval, false, 100));
  });
//});

/*
test('parse primary interval 2', function(t) {
  CronInterval.parse('20,30,40 * * * mon,fri', function(err, interval) {
  	t.end();
  });
});
*/