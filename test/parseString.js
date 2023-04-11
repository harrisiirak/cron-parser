'use strict';

var test = require('tap').test;
var CronParser = require('../lib/parser');

test('parseString allows to generate seconds', function (t) {
    try {
        var interval = CronParser.parseString('12 * * * * *');
        var str = interval.expressions[0].fields.second[0];
        t.equal(str, 12);

    } catch (err) {
        t.error(err, 'Parse read error');
    }

    t.end();
});
