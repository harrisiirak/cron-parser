cron-parser
================

[![Build Status](https://github.com/harrisiirak/cron-parser/actions/workflows/push.yml/badge.svg?branch=master)](https://github.com/harrisiirak/cron-parser/actions/workflows/push.yml)
[![NPM version](https://badge.fury.io/js/cron-parser.png)](http://badge.fury.io/js/cron-parser)![Statements](./coverage/badge-statements.svg)

[//]: # (![Branches]&#40;./coverage/badge-branches.svg&#41;)

[//]: # (![Functions]&#40;./coverage/badge-functions.svg&#41;)

[//]: # (![Lines]&#40;./coverage/badge-lines.svg&#41;)



Node.js library for parsing and manipulating crontab instructions. It includes support for timezones and DST transitions.

__Compatibility__  
Node >= 12.0.0
TypeScript >= 4.2

Setup
========
```bash
npm install cron-parser
```

Supported format
========

```
*    *    *    *    *    *
┬    ┬    ┬    ┬    ┬    ┬
│    │    │    │    │    |
│    │    │    │    │    └ day of week (0 - 7, 1L - 7L) (0 or 7 is Sun)
│    │    │    │    └───── month (1 - 12)
│    │    │    └────────── day of month (1 - 31, L)
│    │    └─────────────── hour (0 - 23)
│    └──────────────────── minute (0 - 59)
└───────────────────────── second (0 - 59, optional)
```

Supports mixed use of ranges and range increments (W character not supported currently). See tests for examples.

Usage
========

Simple expression.

```javascript
var parser = require('cron-parser');

try {
  var interval = parser.parseExpression('*/2 * * * *');

  console.log('Date: ', interval.next().toString()); // Sat Dec 29 2012 00:42:00 GMT+0200 (EET)
  console.log('Date: ', interval.next().toString()); // Sat Dec 29 2012 00:44:00 GMT+0200 (EET)

  console.log('Date: ', interval.prev().toString()); // Sat Dec 29 2012 00:42:00 GMT+0200 (EET)
  console.log('Date: ', interval.prev().toString()); // Sat Dec 29 2012 00:40:00 GMT+0200 (EET)
} catch (err) {
  console.log('Error: ' + err.message);
}

```

Iteration with limited timespan. Also returns ES6 compatible iterator (when iterator flag is set to true).

```javascript
var parser = require('cron-parser');

var options = {
  currentDate: new Date('Wed, 26 Dec 2012 12:38:53 UTC'),
  endDate: new Date('Wed, 26 Dec 2012 14:40:00 UTC'),
  iterator: true
};

try {
  var interval = parser.parseExpression('*/22 * * * *', options);

  while (true) {
    try {
      var obj = interval.next();
      console.log('value:', obj.value.toString(), 'done:', obj.done);
    } catch (e) {
      break;
    }
  }

  // value: Wed Dec 26 2012 14:44:00 GMT+0200 (EET) done: false
  // value: Wed Dec 26 2012 15:00:00 GMT+0200 (EET) done: false
  // value: Wed Dec 26 2012 15:22:00 GMT+0200 (EET) done: false
  // value: Wed Dec 26 2012 15:44:00 GMT+0200 (EET) done: false
  // value: Wed Dec 26 2012 16:00:00 GMT+0200 (EET) done: false
  // value: Wed Dec 26 2012 16:22:00 GMT+0200 (EET) done: true
} catch (err) {
  console.log('Error: ' + err.message);
}

```

Timezone support

```javascript
var parser = require('cron-parser');

var options = {
  currentDate: '2016-03-27 00:00:01',
  tz: 'Europe/Athens'
};

try {
  var interval = parser.parseExpression('0 * * * *', options);

  console.log('Date: ', interval.next().toString()); // Date:  Sun Mar 27 2016 01:00:00 GMT+0200
  console.log('Date: ', interval.next().toString()); // Date:  Sun Mar 27 2016 02:00:00 GMT+0200
  console.log('Date: ', interval.next().toString()); // Date:  Sun Mar 27 2016 04:00:00 GMT+0300 (Notice DST transition)
} catch (err) {
  console.log('Error: ' + err.message);
}
```

Manipulation

```javascript
var parser = require('cron-parser');

var interval = parser.parseExpression('0 7 * * 0-4');
var fields = JSON.parse(JSON.stringify(interval.#fields)); // Fields is immutable
fields.hour = [8];
fields.minute = [29];
fields.dayOfWeek = [1, 3, 4, 5, 6, 7];
var modifiedInterval = parser.fieldsToExpression(fields);
var cronString = modifiedInterval.stringify();
console.log(cronString); // "29 8 * * 1,3-7"
```

Strict Mode

In several implementations of CRON, it's ambiguous to specify both the Day Of Month and Day Of Week parameters simultaneously, as it's unclear which one should take precedence. Despite this ambiguity, this library allows both parameters to be set by default, although the resultant behavior might not align with your expectations.

To resolve this ambiguity, you can activate the strict mode of the library. In strict mode, the library prevents the simultaneous setting of both Day Of Month and Day Of Week, effectively serving as a validation method for user inputs. To enable strict mode, set the `options.strict` flag to true.

Consider the example below:

```javascript
// Specifies a schedule that occurs at 12:00 on every day-of-month from 1 through 31 and on Monday.
const options = {
  currentDate: new CronDate('Mon, 12 Sep 2022 14:00:00', 'UTC'),
  strict: true,
};
const expression = '0 0 12 1-31 * 1';
// With strict mode enabled, the parser throws an error as both dayOfMonth and dayOfWeek are used together.
CronExpression.parse(expression, options); // throws: Cannot use both dayOfMonth and dayOfWeek together in strict mode!
```

In this example, the CRON expression is meant to trigger an event at 12:00 on every day from the 1st through the 31st and on every Monday. However, since strict mode is enabled in the options, an error is thrown, indicating that both the dayOfMonth and dayOfWeek parameters cannot be used together.

Options
========

* *currentDate* - Start date of the iteration
* *endDate* - End date of the iteration

`currentDate` and `endDate` accept `string`, `integer` and `Date` as input.

In case of using `string` as input, not every string format accepted
by the `Date` constructor will work correctly. 
The supported formats are: 
- [`ISO8601`](https://moment.github.io/luxon/#/parsing?id=iso-8601)
- [`HTTP and RFC2822`](https://moment.github.io/luxon/#/parsing?id=http-and-rfc2822)
- [`SQL`](https://moment.github.io/luxon/#/parsing?id=sql) 

The reason being that those are the formats accepted by the
[`luxon`](https://moment.github.io/luxon/) library which is being used to handle dates.

Using `Date` as an input can be problematic specially when using the `tz` option. The issue being that, when creating a new `Date` object without
any timezone information, it will be created in the timezone of the system that is running the code. This (most of the times) won't be what the user
will be expecting. Using one of the supported `string` formats will solve the issue(see timezone example).

* *iterator* - Return ES6 compatible iterator object 
* *utc* - Enable UTC
* *tz* - Timezone string. It won't be used in case `utc` is enabled

Last weekday of the month
=========================

This library supports parsing the range `0L - 7L` in the `weekday` position of
the cron expression, where the `L` means "last occurrence of this weekday for
the month in progress".

For example, the following expression will run on the last monday of the month
at midnight:

```
0 0 0 * * 1L
```

The library also supports combining `L` expressions with other weekday
expressions. For example, the following cron will run every Monday as well
as the last Wednesday of the month:

```
0 0 0 * * 1,3L
```
