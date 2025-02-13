# cron-parser

[![Build Status](https://github.com/harrisiirak/cron-parser/actions/workflows/push.yml/badge.svg?branch=master)](https://github.com/harrisiirak/cron-parser/actions/workflows/push.yml)
[![NPM version](https://badge.fury.io/js/cron-parser.png)](http://badge.fury.io/js/cron-parser)
![Statements](./coverage/badge-statements.svg)

A JavaScript library for parsing and manipulating cron expressions. Features timezone support, DST handling, and iterator capabilities.

[API documentation](https://harrisiirak.github.io/cron-parser/)

## Requirements

- Node.js >= 18
- TypeScript >= 5

## Installation

```bash
npm install cron-parser
```

## Cron Format

```
*    *    *    *    *    *
┬    ┬    ┬    ┬    ┬    ┬
│    │    │    │    │    │
│    │    │    │    │    └─ day of week (0-7, 1L-7L) (0 or 7 is Sun)
│    │    │    │    └────── month (1-12, JAN-DEC)
│    │    │    └─────────── day of month (1-31, L)
│    │    └──────────────── hour (0-23)
│    └───────────────────── minute (0-59)
└────────────────────────── second (0-59, optional)
```

### Special Characters

| Character | Description               | Example                                       |
| --------- | ------------------------- | --------------------------------------------- |
| `*`       | Any value                 | `* * * * *` (every minute)                    |
| `?`       | Any value (alias for `*`) | `? * * * *` (every minute)                    |
| `,`       | Value list separator      | `1,2,3 * * * *` (1st, 2nd, and 3rd minute)    |
| `-`       | Range of values           | `1-5 * * * *` (every minute from 1 through 5) |
| `/`       | Step values               | `*/5 * * * *` (every 5th minute)              |
| `L`       | Last day of month/week    | `0 0 L * *` (midnight on last day of month)   |
| `#`       | Nth day of month          | `0 0 * * 1#1` (first Monday of month)         |

### Predefined Expressions

| Expression  | Description                               | Equivalent      |
| ----------- | ----------------------------------------- | --------------- |
| `@yearly`   | Once a year at midnight of January 1      | `0 0 0 1 1 *`   |
| `@monthly`  | Once a month at midnight of first day     | `0 0 0 1 * *`   |
| `@weekly`   | Once a week at midnight on Sunday         | `0 0 0 * * 0`   |
| `@daily`    | Once a day at midnight                    | `0 0 0 * * *`   |
| `@hourly`   | Once an hour at the beginning of the hour | `0 0 * * * *`   |
| `@minutely` | Once a minute                             | `0 * * * * *`   |
| `@secondly` | Once a second                             | `* * * * * *`   |
| `@weekdays` | Every weekday at midnight                 | `0 0 0 * * 1-5` |
| `@weekends` | Every weekend at midnight                 | `0 0 0 * * 0,6` |

### Field Values

| Field        | Values | Special Characters          | Aliases                        |
| ------------ | ------ | --------------------------- | ------------------------------ |
| second       | 0-59   | `*` `?` `,` `-` `/`         |                                |
| minute       | 0-59   | `*` `?` `,` `-` `/`         |                                |
| hour         | 0-23   | `*` `?` `,` `-` `/`         |                                |
| day of month | 1-31   | `*` `?` `,` `-` `/` `L`     |                                |
| month        | 1-12   | `*` `?` `,` `-` `/`         | `JAN`-`DEC`                    |
| day of week  | 0-7    | `*` `?` `,` `-` `/` `L` `#` | `SUN`-`SAT` (0 or 7 is Sunday) |

## Options

| Option      | Type                     | Description                                                    |
| ----------- | ------------------------ | -------------------------------------------------------------- |
| currentDate | Date \| string \| number | Current date. Defaults to current local time in UTC            |
| endDate     | Date \| string \| number | End date of iteration range. Sets iteration range end point    |
| startDate   | Date \| string \| number | Start date of iteration range. Set iteration range start point |
| tz          | string                   | Timezone (e.g., 'Europe/London')                               |
| strict      | boolean                  | Enable strict mode validation                                  |

When using string dates, the following formats are supported:

- ISO8601
- HTTP and RFC2822
- SQL

## Basic Usage

### Expression Parsing

```typescript
import { CronExpressionParser } from 'cron-parser';

try {
  const interval = CronExpressionParser.parse('*/2 * * * *');

  // Get next date
  console.log('Next:', interval.next().toString());
  // Get next 3 dates
  console.log(
    'Next 3:',
    interval.take(3).map((date) => date.toString()),
  );

  // Get previous date
  console.log('Previous:', interval.prev().toString());
} catch (err) {
  console.log('Error:', err.message);
}
```

### With Options

```typescript
import { CronExpressionParser } from 'cron-parser';

const options = {
  currentDate: '2023-01-01T00:00:00Z',
  endDate: '2024-01-01T00:00:00Z',
  tz: 'Europe/London',
};

try {
  const interval = CronExpressionParser.parse('0 0 * * *', options);
  console.log('Next:', interval.next().toString());
} catch (err) {
  console.log('Error:', err.message);
}
```

### Crontab File Operations

For working with crontab files, use the CronFileParser:

```typescript
import { CronFileParser } from 'cron-parser';

// Async file parsing
try {
  const result = await CronFileParser.parseFile('/path/to/crontab');
  console.log('Variables:', result.variables);
  console.log('Expressions:', result.expressions);
  console.log('Errors:', result.errors);
} catch (err) {
  console.log('Error:', err.message);
}

// Sync file parsing
try {
  const result = CronFileParser.parseFileSync('/path/to/crontab');
  console.log('Variables:', result.variables);
  console.log('Expressions:', result.expressions);
  console.log('Errors:', result.errors);
} catch (err) {
  console.log('Error:', err.message);
}
```

## Advanced Features

### Strict Mode

In several implementations of CRON, it's ambiguous to specify both the Day Of Month and Day Of Week parameters simultaneously, as it's unclear which one should take precedence. Despite this ambiguity, this library allows both parameters to be set by default, although the resultant behavior might not align with your expectations.

To resolve this ambiguity, you can activate the strict mode of the library. In strict mode, the library prevents the simultaneous setting of both Day Of Month and Day Of Week, effectively serving as a validation method for user inputs.

```typescript
import { CronExpressionParser } from 'cron-parser';

// Specifies a schedule that occurs at 12:00 on every day-of-month from 1 through 31 and on Monday
const options = {
  currentDate: new Date('Mon, 12 Sep 2022 14:00:00'),
  strict: true,
};

try {
  // This will throw an error in strict mode
  CronExpressionParser.parse('0 0 12 1-31 * 1', options);
} catch (err) {
  console.log('Error:', err.message);
  // Error: Cannot use both dayOfMonth and dayOfWeek together in strict mode!
}
```

### Last Day of Month/Week Support

The library supports parsing the range `0L - 7L` in the `weekday` position of the cron expression, where the `L` means "last occurrence of this weekday for the month in progress".

For example, the following expression will run on the last Monday of the month at midnight:

```typescript
import { CronExpressionParser } from 'cron-parser';

// Last Monday of every month at midnight
const lastMonday = CronExpressionParser.parse('0 0 0 * * 1L');

// You can also combine L expressions with other weekday expressions
// This will run every Monday and the last Wednesday of the month
const mixedWeekdays = CronExpressionParser.parse('0 0 0 * * 1,3L');

// Last day of every month
const lastDay = CronExpressionParser.parse('0 0 L * *');
```

### Using Iterator

```typescript
import { CronExpressionParser } from 'cron-parser';

const interval = CronExpressionParser.parse('0 */2 * * *');

// Using for...of
for (const date of interval) {
  console.log('Iterator value:', date.toString());
  if (someCondition) break;
}

// Using take() for a specific number of iterations
const nextFiveDates = interval.take(5);
console.log(
  'Next 5 dates:',
  nextFiveDates.map((date) => date.toString()),
);
```

### Timezone Support

The library provides robust timezone support using Luxon, handling DST transitions correctly:

```typescript
import { CronExpressionParser } from 'cron-parser';

const options = {
  currentDate: '2023-03-26T01:00:00',
  tz: 'Europe/London',
};

const interval = CronExpressionParser.parse('0 * * * *', options);

// Will correctly handle DST transition
console.log('Next dates during DST transition:');
console.log(interval.next().toString());
console.log(interval.next().toString());
console.log(interval.next().toString());
```

### Field Manipulation

You can modify cron fields programmatically using `CronFieldCollection.from` and construct a new expression:

```typescript
import { CronExpressionParser, CronFieldCollection, CronHour, CronMinute } from 'cron-parser';

// Parse original expression
const interval = CronExpressionParser.parse('0 7 * * 1-5');

// Create new collection with modified fields using raw values
const modified = CronFieldCollection.from(interval.fields, {
  hour: [8],
  minute: [30],
  dayOfWeek: [1, 3, 5],
});

console.log(modified.stringify()); // "30 8 * * 1,3,5"

// You can also use CronField instances
const modified2 = CronFieldCollection.from(interval.fields, {
  hour: new CronHour([15]),
  minute: new CronMinute([30]),
});

console.log(modified2.stringify()); // "30 15 * * 1-5"
```

The `CronFieldCollection.from` method accepts either CronField instances or raw values that would be valid for creating new CronField instances. This is particularly useful when you need to modify only specific fields while keeping others unchanged.

## License

MIT
