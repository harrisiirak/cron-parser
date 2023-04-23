// empty around comma

var test = require('tap').test;
var {CronDate} = require('../lib/date');

test('is the last weekday of the month', function (t) {
    // Last monday of septhember
    const date1 = new CronDate(new Date(2021, 8, 27));
    t.equal(date1.isLastWeekdayOfMonth(), true);

    // Second-to-last monday of septhember
    const date2 = new CronDate(new Date(2021, 8, 20));
    t.equal(date2.isLastWeekdayOfMonth(), false);

    t.end();
});


test('CronDate should handle addSecond correctly', function (t) {
    const date1 = new CronDate(new Date('2021-12-30T00:59:58.000-00:00'), 'UTC');
    date1.addSecond();
    t.equal(date1.getMonth(), 11);
    t.equal(date1.getDate(), 30);
    t.equal(date1.getMinutes(), 59);
    t.equal(date1.getSeconds(), 59);

    const date2 = new CronDate(new Date('2021-12-31T23:59:59.000-00:00'), 'UTC');
    date2.addSecond();
    t.equal(date2.getFullYear(), 2022);
    t.equal(date2.getMonth(), 0);
    t.equal(date2.getDate(), 1);
    t.equal(date2.getMinutes(), 0);
    t.equal(date2.getSeconds(), 0);

    t.end();
});

test('CronDate should handle addMinute correctly', function (t) {
    const date1 = new CronDate(new Date('2021-12-30T00:58:58.000-00:00'), 'UTC');
    date1.addMinute();
    t.equal(date1.getMonth(), 11);
    t.equal(date1.getDate(), 30);
    t.equal(date1.getMinutes(), 59);
    // todo: the addMinute function sets the seconds to 0?
    t.equal(date1.getSeconds(), 0);

    const date2 = new CronDate(new Date('2021-12-31T23:59:59.000-00:00'), 'UTC');
    date2.addMinute();
    t.equal(date2.getFullYear(), 2022);
    t.equal(date2.getMonth(), 0);
    t.equal(date2.getDate(), 1);
    t.equal(date2.getMinutes(), 0);
    // todo: the addMinute function sets the seconds to 0?
    t.equal(date2.getSeconds(), 0);

    t.end();
});

test('CronDate should handle addHour correctly', function (t) {
    const date1 = new CronDate(new Date('2021-12-30T00:58:58.000-00:00'), 'UTC');
    date1.addHour();
    t.equal(date1.getMonth(), 11);
    t.equal(date1.getDate(), 30);
    // todo: the addHour function sets the seconds and minutes to 0?
    t.equal(date1.getHours(), 1);
    t.equal(date1.getMinutes(), 0);
    t.equal(date1.getSeconds(), 0);

    const date2 = new CronDate(new Date('2021-12-31T23:59:59.000-00:00'), 'UTC');
    date2.addHour();
    t.equal(date2.getFullYear(), 2022);
    t.equal(date2.getMonth(), 0);
    t.equal(date2.getDate(), 1);
    t.equal(date2.getHours(), 0);
    // todo: the addHour function sets the seconds and minutes to 0?
    t.equal(date2.getMinutes(), 0);
    t.equal(date2.getSeconds(), 0);

    t.end();
});

test('CronDate should handle addDay correctly', function (t) {
    const date1 = new CronDate(new Date('2021-12-30T00:58:58.000-00:00'), 'UTC');
    date1.addDay();
    t.equal(date1.getMonth(), 11);
    t.equal(date1.getDate(), 31);
    // todo: the addDay function sets the seconds, minutes, and hour to 0?
    t.equal(date1.getHours(), 0);
    t.equal(date1.getMinutes(), 0);
    t.equal(date1.getSeconds(), 0);

    const date2 = new CronDate(new Date('2021-12-31T23:59:59.000-00:00'), 'UTC');
    date2.addDay();
    t.equal(date2.getFullYear(), 2022);
    t.equal(date2.getMonth(), 0);
    t.equal(date2.getDate(), 1);
    // todo: the addDay function sets the seconds, minutes, and hour to 0?
    t.equal(date2.getHours(), 0);
    t.equal(date2.getMinutes(), 0);
    t.equal(date2.getSeconds(), 0);

    t.end();
});

test('CronDate should handle addMonth correctly', function (t) {
    const date1 = new CronDate(new Date('2021-11-30T00:58:58.000-00:00'), 'UTC');
    date1.addMonth();
    t.equal(date1.getMonth(), 11);
    // todo: the addDay function sets the seconds, minutes, hour, day(0) to 0?
    t.equal(date1.getDate(), 1);
    t.equal(date1.getHours(), 0);
    t.equal(date1.getMinutes(), 0);
    t.equal(date1.getSeconds(), 0);

    const date2 = new CronDate(new Date('2021-12-31T23:59:59.000-00:00'), 'UTC');
    date2.addMonth();
    t.equal(date2.getFullYear(), 2022);
    t.equal(date2.getMonth(), 0);
    // todo: the addDay function sets the seconds, minutes, hour, day(1) to 0?
    t.equal(date2.getDate(), 1);
    t.equal(date2.getHours(), 0);
    t.equal(date2.getMinutes(), 0);
    t.equal(date2.getSeconds(), 0);

    t.end();
});


test('CronDate should handle addYear correctly', function (t) {
    const date1 = new CronDate(new Date('2021-11-30T00:58:58.000-00:00'), 'UTC');
    date1.addYear();
    t.equal(date1.getFullYear(), 2022);
    // todo: the addYear function does not sets the seconds, minutes, hour, day(0), month to 0?
    t.equal(date1.getMonth(), 10);
    t.equal(date1.getDate(), 30);
    t.equal(date1.getHours(), 0);
    t.equal(date1.getMinutes(), 58);
    t.equal(date1.getSeconds(), 58);

    const date2 = new CronDate(new Date('2020-02-29T23:59:59.000-00:00'), 'UTC');
    date2.addYear();
    t.equal(date2.getFullYear(), 2021);
    // todo: the addYear function does not sets the seconds, minutes, hour, day(0), month to 0?
    t.equal(date2.getMonth(), 1);
    t.equal(date2.getDate(), 28);
    t.equal(date2.getHours(), 23);
    t.equal(date2.getMinutes(), 59);
    t.equal(date2.getSeconds(), 59);

    t.end();
});

test('CronDate should handle subtractSecond correctly', function (t) {
    const date1 = new CronDate(new Date('2020-12-30T00:59:59.000-00:00'), 'UTC');
    date1.subtractSecond();
    t.equal(date1.getFullYear(), 2020);
    t.equal(date1.getMonth(), 11);
    t.equal(date1.getDate(), 30);
    t.equal(date1.getMinutes(), 59);
    t.equal(date1.getSeconds(), 58);

    const date2 = new CronDate(new Date('2020-01-01T00:00:00.000-00:00'), 'UTC');
    date2.subtractSecond();
    t.equal(date2.getFullYear(), 2019);
    t.equal(date2.getMonth(), 11);
    t.equal(date2.getDate(), 31);
    t.equal(date2.getMinutes(), 59);
    t.equal(date2.getSeconds(), 59);

    t.end();
});

test('CronDate should handle subtractMinute correctly', function (t) {
    const date1 = new CronDate(new Date('2020-12-30T00:59:59.000-00:00'), 'UTC');
    date1.subtractMinute();
    t.equal(date1.getFullYear(), 2020);
    t.equal(date1.getMonth(), 11);
    t.equal(date1.getDate(), 30);
    t.equal(date1.getMinutes(), 58);
    // todo: the subtractMinute function does not sets the seconds to 0? This is different from the add function
    t.equal(date1.getSeconds(), 59);

    const date2 = new CronDate(new Date('2020-01-01T00:00:00.000-00:00'), 'UTC');
    date2.subtractMinute();
    t.equal(date2.getFullYear(), 2019);
    t.equal(date2.getMonth(), 11);
    t.equal(date2.getDate(), 31);
    t.equal(date2.getMinutes(), 59);
    // todo: the subtractMinute function does not sets the seconds to 0? This is different from the add function
    t.equal(date2.getSeconds(), 59);

    t.end();
});

test('CronDate should handle subtractHour correctly', function (t) {
    const date1 = new CronDate(new Date('2020-12-30T01:59:59.000-00:00'), 'UTC');
    date1.subtractHour();
    t.equal(date1.getFullYear(), 2020);
    t.equal(date1.getMonth(), 11);
    t.equal(date1.getDate(), 30);
    t.equal(date1.getHours(), 0);
    // todo: the subtractHour function does not sets the seconds, minutes to 0? This is different from the add function
    t.equal(date1.getMinutes(), 59);
    t.equal(date1.getSeconds(), 59);

    const date2 = new CronDate(new Date('2020-01-01T00:00:00.000-00:00'), 'UTC');
    date2.subtractHour();
    t.equal(date2.getFullYear(), 2019);
    t.equal(date2.getMonth(), 11);
    t.equal(date2.getDate(), 31);
    t.equal(date2.getHours(), 23);
    // todo: the subtractHour function does not sets the seconds, minutes to 0? This is different from the add function
    t.equal(date2.getMinutes(), 59);
    t.equal(date2.getSeconds(), 59);

    t.end();
});

test('CronDate should handle subtractDay correctly', function (t) {
    const date1 = new CronDate(new Date('2020-12-30T01:59:59.000-00:00'), 'UTC');
    date1.subtractDay();
    t.equal(date1.getFullYear(), 2020);
    t.equal(date1.getMonth(), 11);
    t.equal(date1.getDate(), 29);
    // todo: the subtractDay function differently than the add functions or other subtract functions
    t.equal(date1.getHours(), 23);
    t.equal(date1.getMinutes(), 59);
    t.equal(date1.getSeconds(), 59);

    const date2 = new CronDate(new Date('2020-01-01T00:00:00.000-00:00'), 'UTC');
    date2.subtractDay();
    t.equal(date2.getFullYear(), 2019);
    t.equal(date2.getMonth(), 11);
    t.equal(date2.getDate(), 31);
    // todo: the subtractDay function differently than the add functions or other subtract functions
    t.equal(date2.getHours(), 23);
    t.equal(date2.getMinutes(), 59);
    t.equal(date2.getSeconds(), 59);

    t.end();
});

test('CronDate should handle subtractYear correctly', function (t) {
    const date1 = new CronDate(new Date('2020-12-30T01:59:59.000-00:00'), 'UTC');
    date1.subtractYear();
    t.equal(date1.getFullYear(), 2019);
    t.equal(date1.getMonth(), 11);
    t.equal(date1.getDate(), 30);
    t.equal(date1.getHours(), 1);
    t.equal(date1.getMinutes(), 59);
    t.equal(date1.getSeconds(), 59);

    const date2 = new CronDate(new Date('2020-02-29T00:00:00.000-00:00'), 'UTC');
    date2.subtractYear();
    t.equal(date2.getFullYear(), 2019);
    t.equal(date2.getMonth(), 1);
    t.equal(date2.getDate(), 28);
    t.equal(date2.getHours(), 0);
    t.equal(date2.getMinutes(), 0);
    t.equal(date2.getSeconds(), 0);

    t.end();
});


test('CronDate should handle addUnit correctly', function (t) {
    const date1 = new CronDate(new Date('2020-11-30T01:01:01.000-00:00'), 'UTC');
    date1.addUnit('Year');
    t.equal(date1.getFullYear(), 2021);
    const date2 = new CronDate(new Date('2020-11-30T01:01:01.000-00:00'), 'UTC');
    date2.addUnit('Month');
    t.equal(date2.getMonth(), 11);
    const date3 = new CronDate(new Date('2020-11-30T01:01:01.000-00:00'), 'UTC');
    date3.addUnit('Day');
    t.equal(date3.getDate(), 1);
    const date4 = new CronDate(new Date('2020-11-30T01:01:01.000-00:00'), 'UTC');
    date4.addUnit('Hour');
    t.equal(date4.getHours(), 2);
    const date5 = new CronDate(new Date('2020-11-30T01:01:01.000-00:00'), 'UTC');
    date5.addUnit('Minute');
    t.equal(date5.getMinutes(), 2);
    const date6 = new CronDate(new Date('2020-11-30T01:01:01.000-00:00'), 'UTC');
    date6.addUnit('Second');
    t.equal(date6.getSeconds(), 2);
    t.end();
});

test('CronDate should handle subtractUnit correctly', function (t) {
    const date1 = new CronDate(new Date('2020-11-30T01:01:01.000-00:00'), 'UTC');
    date1.subtractUnit('Year');
    t.equal(date1.getFullYear(), 2019);
    const date2 = new CronDate(new Date('2020-11-30T01:01:01.000-00:00'), 'UTC');
    date2.subtractUnit('Month');
    t.equal(date2.getMonth(), 9);
    const date3 = new CronDate(new Date('2020-11-30T01:01:01.000-00:00'), 'UTC');
    date3.subtractUnit('Day');
    t.equal(date3.getDate(), 29);
    const date4 = new CronDate(new Date('2020-11-30T01:01:01.000-00:00'), 'UTC');
    date4.subtractUnit('Hour');
    t.equal(date4.getHours(), 0);
    const date5 = new CronDate(new Date('2020-11-30T01:01:01.000-00:00'), 'UTC');
    date5.subtractUnit('Minute');
    t.equal(date5.getMinutes(), 0);
    const date6 = new CronDate(new Date('2020-11-30T01:01:01.000-00:00'), 'UTC');
    date6.subtractUnit('Second');
    t.equal(date6.getSeconds(), 0);
    t.end();
});

test('CronDate should handle getUTCDate correctly', function (t) {
    const date1 = new CronDate(new Date('2020-11-30T01:01:01.000-00:00'), 'UTC');
    t.equal(date1.getUTCDate(), 30);
    t.end();
});

test('CronDate should handle getUTCDay correctly', function (t) {
    // Day of week starts at 0 for Sunday
    const date1 = new CronDate(new Date('2020-11-28T01:01:01.000-00:00'), 'UTC');
    t.equal(date1.getUTCDay(), 6);
    const date2 = new CronDate(new Date('2020-11-22T01:01:01.000-00:00'), 'UTC');
    t.equal(date2.getUTCDay(), 0);
    const date3 = new CronDate(new Date('2020-11-29T01:01:01.000-00:00'), 'UTC');
    t.equal(date3.getUTCDay(), 0);
    t.end();
});


test('CronDate should handle getUTCFullYear correctly', function (t) {
    const date1 = new CronDate(new Date('2020-11-30T01:01:01.000-00:00'), 'UTC');
    t.equal(date1.getUTCFullYear(), 2020);
    t.end();
});

test('CronDate should handle getUTCMonth correctly', function (t) {
    const date1 = new CronDate(new Date('2020-11-30T01:01:01.000-00:00'), 'UTC');
    t.equal(date1.getUTCMonth(), 10);
    t.end();
});

test('CronDate should handle getUTCHours correctly', function (t) {
    const date1 = new CronDate(new Date('2020-11-30T01:01:01.000-00:00'), 'UTC');
    t.equal(date1.getUTCHours(), 1);
    t.end();
});

test('CronDate should handle getUTCMinutes correctly', function (t) {
    const date1 = new CronDate(new Date('2020-11-30T01:01:01.000-00:00'), 'UTC');
    t.equal(date1.getUTCMinutes(), 1);
    t.end();
});

test('CronDate should handle getUTCSeconds correctly', function (t) {
    const date1 = new CronDate(new Date('2020-11-30T01:01:01.000-00:00'), 'UTC');
    t.equal(date1.getUTCSeconds(), 1);
    t.end();
});

test('CronDate should handle toJSON correctly', function (t) {
    const date1 = new CronDate(new Date('2020-11-30T01:01:01.000-00:00'), 'UTC');
    // TODO: not sure how this is JSON?
    t.equal(date1.toJSON(), '2020-11-30T01:01:01.000Z');
    t.end();
});

test('CronDate should handle toString correctly', function (t) {
    const date1 = new CronDate(new Date('2020-11-30T01:01:01.000-00:00'), 'UTC');
    // FIXME: this test will fail in other timezones
    t.equal(date1.toString(), 'Sun Nov 29 2020 20:01:01 GMT-0500 (Eastern Standard Time)');
    t.end();
});


test('CronDate should handle setDate correctly', function (t) {
    const date1 = new CronDate(new Date('2021-12-30T00:59:58.000-00:00'), 'UTC');
    date1.setDate(1);
    t.equal(date1.getDate(), 1);
    t.end();
});

test('CronDate should handle setFullYear correctly', function (t) {
    const date1 = new CronDate(new Date('2021-12-30T00:59:58.000-00:00'), 'UTC');
    date1.setFullYear(2222);
    t.equal(date1.getFullYear(), 2222);
    t.end();
});

test('CronDate should handle setDay correctly', function (t) {
    const date1 = new CronDate(new Date('2021-12-30T00:59:58.000-00:00'), 'UTC');
    date1.setDay(3);
    t.equal(date1.getDay(), 3);
    t.end();
});

test('CronDate should handle setMonth correctly', function (t) {
    const date1 = new CronDate(new Date('2021-12-30T00:59:58.000-00:00'), 'UTC');
    date1.setMonth(3);
    t.equal(date1.getMonth(), 3);
    t.end();
});

test('CronDate should handle setHours correctly', function (t) {
    const date1 = new CronDate(new Date('2021-12-30T00:59:58.000-00:00'), 'UTC');
    date1.setHours(3);
    t.equal(date1.getHours(), 3);
    t.end();
});

test('CronDate should handle setMinutes correctly', function (t) {
    const date1 = new CronDate(new Date('2021-12-30T00:59:58.000-00:00'), 'UTC');
    date1.setMinutes(30);
    t.equal(date1.getMinutes(), 30);
    t.end();
});

test('CronDate should handle setSeconds correctly', function (t) {
    const date1 = new CronDate(new Date('2021-12-30T00:59:58.000-00:00'), 'UTC');
    date1.setSeconds(30);
    t.equal(date1.getSeconds(), 30);
    t.end();
});
