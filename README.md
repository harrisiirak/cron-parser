cron-parser
================

[![Build Status](https://travis-ci.org/harrisiirak/cron-parser.png?branch=master)](https://travis-ci.org/harrisiirak/cron-parser)
[![NPM version](https://badge.fury.io/js/cron-parser.png)](http://badge.fury.io/js/cron-parser)

Node.js library for parsing crontab instructions

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
│    │    │    │    │    └ day of week (0 - 6)
│    │    │    │    └───── month (1 - 12)
│    │    │    └────────── day of month (1 - 31)
│    │    └─────────────── hour (0 - 23)
│    └──────────────────── minute (0 - 59)
└───────────────────────── second (0 - 59, optional)
```

Supports mixed use of ranges and range increments (L, W and # characters are not supported currently). See tests for examples.

Usage
========

Simple expression.

```javascript
var parser = require('cron-parser');

parser.parseExpression('*/2 * * * *', function(err, interval) {
  if (err) {
    console.log('Error: ' + err.message);
    return;
  }

  console.log('Date: ', interval.next()); // Sat Dec 29 2012 00:42:00 GMT+0200 (EET)
  console.log('Date: ', interval.next()); // Sat Dec 29 2012 00:44:00 GMT+0200 (EET)
});
```
Alternatively this can be done synchronously.

```javascript
var parser = require('cron-parser');

var interval = parser.parseExpressionSync('*/2 * * * *');
console.log('Date: ', interval.next()); // Sat Dec 29 2012 00:42:00 GMT+0200 (EET)
console.log('Date: ', interval.next()); // Sat Dec 29 2012 00:44:00 GMT+0200 (EET)
```

Define start and end date (limited timespan).

```javascript
var parser = require('cron-parser');

var options = {
  currentDate: new Date('Wed, 26 Dec 2012 12:38:53 UTC'),
  endDate: new Date('Wed, 26 Dec 2012 14:40:00 UTC')
};

parser.parseExpression('*/22 * * * *', options, function(err, interval) {
  if (err) {
    console.log('Error: ' + err.message);
    return;
  }

  while (true) {
    try {
  		console.log(interval.next());
  	} catch (e) {
  		break;
  	}
  }

  // Wed Dec 26 2012 14:44:00 GMT+0200 (EET)
  // Wed Dec 26 2012 15:00:00 GMT+0200 (EET)
  // Wed Dec 26 2012 15:22:00 GMT+0200 (EET)
  // Wed Dec 26 2012 15:44:00 GMT+0200 (EET)
  // Wed Dec 26 2012 16:00:00 GMT+0200 (EET)
  // Wed Dec 26 2012 16:22:00 GMT+0200 (EET)
});
```
