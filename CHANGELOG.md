# Changelog

## v5.9.0 - 2026-08-13

### What's Changed
* fix: keep explicit range bounds when stringifying stepped fields (#279) by @harrisiirak in https://github.com/harrisiirak/cron-parser/pull/440
* fix: compensate DST transitions wider than one hour by @aniket-3001 in https://github.com/harrisiirak/cron-parser/pull/435
* fix: keep a hashed step wider than its range from emptying the field by @Jaybhade in https://github.com/harrisiirak/cron-parser/pull/437

### New Contributors
* @aniket-3001 made their first contribution in https://github.com/harrisiirak/cron-parser/pull/435
* @Jaybhade made their first contribution in https://github.com/harrisiirak/cron-parser/pull/437

**Full Changelog**: https://github.com/harrisiirak/cron-parser/compare/v5.8.1...v5.9.0

## v5.8.1 - 2026-08-09

### What's Changed
* ci: automate releases by @harrisiirak in https://github.com/harrisiirak/cron-parser/pull/439


**Full Changelog**: https://github.com/harrisiirak/cron-parser/compare/v5.8.0...v5.8.1

## v5.8.0 - 2026-08-09

### What's Changed
* chore: report coverage and benchmark on every PR commit by @harrisiirak in https://github.com/harrisiirak/cron-parser/pull/430
* docs: document benchmark environment variables by @harrisiirak in https://github.com/harrisiirak/cron-parser/pull/431
* docs: add security policy and code of conduct by @harrisiirak in https://github.com/harrisiirak/cron-parser/pull/432
* fix: drop day of month values the month does not have by @harrisiirak in https://github.com/harrisiirak/cron-parser/pull/433
* fix: keep day fields that cover their whole range out of the wildcard form by @harrisiirak in https://github.com/harrisiirak/cron-parser/pull/434
* fix: round the current date to whole seconds so occurrences on the end date are returned by @harrisiirak in https://github.com/harrisiirak/cron-parser/pull/436
* fix: keep a day-of-week step from adding Sunday when it never reaches 7 by @spokodev in https://github.com/harrisiirak/cron-parser/pull/438


**Full Changelog**: https://github.com/harrisiirak/cron-parser/compare/v5.7.0...v5.8.0

## v5.7.0 - 2026-08-01

### What's Changed
* fix: enforce iteration loop limit so unsatisfiable expressions throw instead of returning a bogus date by @spokodev in https://github.com/harrisiirak/cron-parser/pull/415
* fix: do not drop a matching day of month when the day of week uses an nth (#) occurrence by @spokodev in https://github.com/harrisiirak/cron-parser/pull/414
* chore: switch tsconfig to nodenext module resolution and remove ignoreDeprecations by @harrisiirak in https://github.com/harrisiirak/cron-parser/pull/417
* fix: escape hyphen in #parseNthDay character class by @harrisiirak in https://github.com/harrisiirak/cron-parser/pull/426
* fix: copy values array in CronField constructor by @harrisiirak in https://github.com/harrisiirak/cron-parser/pull/427
* fix: reject standalone L in day of week at construction by @harrisiirak in https://github.com/harrisiirak/cron-parser/pull/428
* chore: publish coverage badges from CI, replace jest-coverage-badges by @harrisiirak in https://github.com/harrisiirak/cron-parser/pull/429


**Full Changelog**: https://github.com/harrisiirak/cron-parser/compare/v5.6.1...v5.7.0

## v5.6.2 - 2026-07-13

> [!WARNING]
> **The npm package published for this version does not contain these fixes.** The tarball was built from a stale `dist/` and shipped the 5.6.1 source tree, so #414 and #415 are not present in `cron-parser@5.6.2`. This version is deprecated on npm - use 5.7.0 instead.

### What's Changed
* fix: enforce iteration loop limit so unsatisfiable expressions throw instead of returning a bogus date by @spokodev in https://github.com/harrisiirak/cron-parser/pull/415
* fix: do not drop a matching day of month when the day of week uses an nth (#) occurrence by @spokodev in https://github.com/harrisiirak/cron-parser/pull/414


**Full Changelog**: https://github.com/harrisiirak/cron-parser/compare/v5.6.1...v5.6.2

## v5.6.1 - 2026-06-24

### What's Changed
* fix: handle DST gap correctly and prevent iteration from stopping prematurely by @cyber-hari in https://github.com/harrisiirak/cron-parser/pull/405
* fix: CronDate throws on .bind in bundled/CDN builds by @harrisiirak in https://github.com/harrisiirak/cron-parser/pull/413
* fix: do not reject an out-of-range day of month when the day of week is restricted by @spokodev in https://github.com/harrisiirak/cron-parser/pull/410

### New Contributors
* @cyber-hari made their first contribution in https://github.com/harrisiirak/cron-parser/pull/405
* @spokodev made their first contribution in https://github.com/harrisiirak/cron-parser/pull/410

**Full Changelog**: https://github.com/harrisiirak/cron-parser/compare/v5.6.0...v5.6.1

## v5.5.0 - 2026-01-16

### What's Changed
* Speed up CronExpression iteration by @kirill578 in https://github.com/harrisiirak/cron-parser/pull/394

### New Contributors
* @kirill578 made their first contribution in https://github.com/harrisiirak/cron-parser/pull/394

**Full Changelog**: https://github.com/harrisiirak/cron-parser/compare/v5.4.0...v5.5.0

## v5.4.0 - 2025-09-15

### What's Changed
* Clamp currentDate value when startDate or endDate are provided by @harrisiirak in https://github.com/harrisiirak/cron-parser/pull/391


**Full Changelog**: https://github.com/harrisiirak/cron-parser/compare/v5.3.1...v5.4.0

## v5.3.1 - 2025-08-31

### What's Changed

* Fix invalid start and end time span validation logic by @harrisiirak in https://github.com/harrisiirak/cron-parser/pull/386
* CronFieldCollection.from should allow passing in special chars by @harrisiirak in https://github.com/harrisiirak/cron-parser/pull/387
* Update luxon to the latest version 1c32a8498cd71a8eaa8bc114754a6470f08b6305

**Full Changelog**: https://github.com/harrisiirak/cron-parser/compare/v5.3.0...v5.3.1

## v5.3.0 - 2025-06-08

### What's Changed
* Hashed values (H) ranges and steps support by @harrisiirak in https://github.com/harrisiirak/cron-parser/pull/382


**Full Changelog**: https://github.com/harrisiirak/cron-parser/compare/v5.2.0...v5.3.0

## v5.2.0 - 2025-05-11

### What's Changed
* Adding support for the H syntax, allowing to add jitter to a cron expression by @MYDIH in https://github.com/harrisiirak/cron-parser/pull/377
* Extended serialization for cron fields by @harrisiirak in https://github.com/harrisiirak/cron-parser/pull/379

### Breaking Changes

* https://github.com/harrisiirak/cron-parser/pull/379 changed `CronField` constructor signature and removed `nthDayOfWeek` field from `CronExpressionOptions`. See PR for more details.

### New Contributors
* @MYDIH made their first contribution in https://github.com/harrisiirak/cron-parser/pull/377

**Full Changelog**: https://github.com/harrisiirak/cron-parser/compare/v5.1.1...v5.2.0

## v5.1.1 - 2025-04-04

- e6b004681f22831fda57032d67b373c3915ec2db - Fix last day of month handling when explicit month is set (#375)
- a306f80860127e3084092927d50dd051190022c7 - Update `luxon` to the latest (`3.6.1`) version
- 099bc2860c825970a5200392f977c2705c469bb9 - Update development dependencies to the latest versions

## v5.1.0 - 2025-03-31

- https://github.com/harrisiirak/cron-parser/pull/374 - Improve handling and support for special characters (L, #) in the `includesDate` method

## v5.0.6 - 2025-03-20

- 8f2081ec042cbfe6ee98148b7bc50162e058124a - Simplify strict mode flag usage in getRawFields
- 6599e154461b5e91f505b8bd041e7421969e4c16 - Update strict mode documentation

## v5.0.5 - 2025-03-17

- 38a84580ff072cba1dda7add4da08bc90fc1caff - Restore `4.x` compatibility and use the current timezone for currentDate instead of setting it to UTC (#370)

## v5.0.4 - 2025-02-22

- 84e100f75d8ae2ab651f8b72c19b00cb871500f0 - Set milliseconds to 0 before returning schedule (#368)

## v5.0.3 - 2025-02-19

- e0bda7ec2c66305d87dd75bf902116f60166b2a4 - Parse field for day of week should allow 0 or SUN values  (#366)

## v5.0.2 - 2025-02-18

- fe6b90eefefec24673ddbfb9c78d8dbc5ac46a63 - Add fs/promises to browser import ignore list  (#365)

## v5.0.1 - 2025-02-16

This first patch release contains couple of quick bugfixes that were reported after the first release of v5. Thanks for everybody that tried the new version out and provided some feedback.

- 9b1e0f3e4f8d97fc4a8fd761eec471a4f1df78e0 - Removed unused `jest-runner-tsd` dev dependency (https://github.com/harrisiirak/cron-parser/issues/361)
- 683f58558061a1820427bb2b38f2961ae83dd1dd - Use dynamic loading for `fs` and `fs/promises` to restore ability to use this package in the browser environment (https://github.com/harrisiirak/cron-parser/issues/362)
- 5e10db0e2a7ee5d6c23bd00c88e096bed1eec2f0 - Remove `assert` module usage (can't be used in the browser environment without polyfill or included extra package) and improve/add test cases (https://github.com/harrisiirak/cron-parser/issues/364)
- 7ca5c94fc570efdae734bcfbe1e5ac8621911b22 - Remove unused `.npmignore`
- 9ddf705708fc8f5c8b4adc993f0040c20e91377c - Fix benchmarking tool for module interface

## v5.0.0 - 2025-02-13

All changes come from https://github.com/harrisiirak/cron-parser/pull/360

### Changelog

- **BREAKING CHANGE**: Bumped the minimum Node.js version to **>= 18** and TypeScript to **>= 5**.
- **BREAKING CHANGE**: `interval.fields` (`CronExpression.interval`) now returns a **readonly** instance of `CronFieldsCollection` instead of a regular array. See `CronFieldsCollection.from` for how to modify the underlying data structure.
- **BREAKING CHANGE**: Moved crontab file parsing from `CronParser` to a standalone `CronFileParser` class (fixes #112).
- **BREAKING CHANGE**:  Removal of `utc` flag from the options. Pass in `UTC` timezone instead.
- Refactored the codebase to TypeScript (fixes #190).
- Cleaned up test suites, removed duplicate test cases, and switched from `tap` to `jest`.
- Improved documentation and introduced documentation generated by `typedoc` (fixes #309, #322, #269).
- Added benchmark tooling to help detect future performance regressions.
- Added `CronExpression.includesDate` to evaluate whether a given date matches the pattern (closes #299).
- Fixed issues where certain range and repeat field expressions produced invalid intervals (fixes #156).
- Fixed an issue with day-of-month handling when the range is explicitly set and no wildcard is used (fixes #284).
- Improved repeat serialization for stringification (fixes #236).

### Performance improvements

While this release won't address the performance issues reported in #287, it will bring some performance improvements of around 20-30% on average, depending on the pattern complexity. The following benchmark results were produced on my 2023 MBP.

<pre>
┌────────────────────┬────────────┬────────────┬──────────┬─────┐
│ Pattern            │   Old Mean │   New Mean │   Change │     │
├────────────────────┼────────────┼────────────┼──────────┼─────┤
│ * * * * * *        │    73.55ms │    37.43ms │   49.10% │  ↑  │
├────────────────────┼────────────┼────────────┼──────────┼─────┤
│ 0 * * 1,4-10,L * * │  3504.51ms │  2338.42ms │   33.27% │  ↑  │
├────────────────────┼────────────┼────────────┼──────────┼─────┤
│ 10-30/2 2 12 8 0   │  3111.18ms │  2234.32ms │   28.18% │  ↑  │
├────────────────────┼────────────┼────────────┼──────────┼─────┤
│ 0 0 0 * * 4,6L     │  9400.33ms │  6825.61ms │   27.39% │  ↑  │
├────────────────────┼────────────┼────────────┼──────────┼─────┤
│ 0 12 */5 6 *       │  7442.68ms │  5645.95ms │   24.14% │  ↑  │
├────────────────────┼────────────┼────────────┼──────────┼─────┤
│ 0 15 */5 5 *       │  6998.87ms │  5443.22ms │   22.23% │  ↑  │
├────────────────────┼────────────┼────────────┼──────────┼─────┤
│ 0 0 6-20/2,L 2 *   │  8832.87ms │  6947.63ms │   21.34% │  ↑  │
├────────────────────┼────────────┼────────────┼──────────┼─────┤
│ 0 0 0 * * 1L,5L    │ 15416.07ms │ 12474.12ms │   19.08% │  ↑  │
├────────────────────┼────────────┼────────────┼──────────┼─────┤
│ 10 2 12 8 7        │  7105.79ms │  5947.91ms │   16.29% │  ↑  │
└────────────────────┴────────────┴────────────┴──────────┴─────┘
</pre>

Benchmarks can be run locally by executing the command.:

```
npm run bench
```

Individual patterns can be benchmarked by executing `bench:pattern` command:

```
npm run bench:pattern "* * * * * *"
```

## 4.9.0 - 2023-08-14

- Remove superfluous files from npm package (#328) (@sheerlox)

## 4.8.1 - 2023-03-07

- Fix multiple value ranges serialisation (#316)

## 4.8.0 - 2023-03-06

- Fix expression stringify range step handling (#312)
- Fix invalid expression example in the documentation (#314)
- Update deps

## 4.7.1 - 2023-01-09

- Update deps (https://github.com/harrisiirak/cron-parser/pull/305)

## 4.7.0 - 2022-11-16

- Fix to allow the same value for range start and end value (https://github.com/harrisiirak/cron-parser/pull/291)
- Fix Sunday DOW handling in the range value (https://github.com/harrisiirak/cron-parser/pull/292)
- Stricter repeat value validation (https://github.com/harrisiirak/cron-parser/pull/294)
- Remove duplicate day of week values upon stringify (https://github.com/harrisiirak/cron-parser/pull/295)
- Update Travis test matrix and include nodejs v18/v19 (https://github.com/harrisiirak/cron-parser/commit/e17df0b096c5570ca2b3df074a9cef8b574bd800)
- Update package-lock.json from v1 to v2 (https://github.com/harrisiirak/cron-parser/pull/298)
- Update outdated dependencies (https://github.com/harrisiirak/cron-parser/pull/296)
- Update min required TypeScript version information (https://github.com/harrisiirak/cron-parser/commit/fefd0a23f334fa0120d619951c3e5900be8cd37e)

## 4.6.0 - 2022-08-02

- #280 Fix day of month stringify output handling with single month input
- 60891285df2fcacd371becff4a0f909706da8f5b Upgrade to luxon@v3

## 4.5.0 - 2022-06-28

- #272 upgrade `luxon` to `v2.4.0` (see v2 support matrix [documentation](https://github.com/moment/luxon/blob/master/docs/matrix.md)) (@DonBrinn)
- aaed261a77a5b954ab955c647837d63688897731 bump outdated version requirements

## 4.4.0 - 2022-05-01

- #267 Fix multiple dayofmonth ranges handling

## 4.3.0 - 2022-03-29

- Update deps (fce854ec49e204085462698ae91cf245bbbbfb90)
- #260 Fix last weekday of month handling (@pafik13)

## 4.2.1 - 2021-12-22

- Update deps (f687555f25ff0e4e12a951f3a4827b382436692f)
- #253 Normalize Regex expression  (@webdevium)
- #252 Update docs

## 4.2.0 - 2021-11-20

- Update deps (17681cd6493b1cf53dacdee9aa541629197679fa)

## 4.1.0 - 2021-10-12

- #245 Support "last weekday of the month" expressions (@albertorestifo)

## 4.0.0 - 2021-09-07

- #241 Remove `is-nan` dependency; it's possibly breaking IE support, therefore bumping to v4 (@amiram)
- Update dev dependencies

## 3.5.0 - 2021-04-26

- #225 Fixes prev() issue (#178) when cron expression contains 59 seconds

## 3.4.0 - 2021-04-20

- #224 Fix issue with wildcard day of mont handling
- Upgrade dependencies 
- Update tests and resolve `tap@15` deprecation warnings

## 3.3.0 - 2021-03-04

- #213 Add support for serializing a cron expression instance into a string (@regevbr)

## 3.2.0 - 2021-02-22

- #211 Expose parsed fields (@regevbr)

## 3.1.0 - 2021-01-12

- #207 Fix `toISOString()` and `toString()` behaviour

## 3.0.0 - 2021-01-10

- #204 Add a basic eslint setup for codestyle rules (@andytson)
- #202 Switch from moment-timezone to luxon for smaller bundle (@andytson)

## 2.18.0 - 2020-11-19

- #197 Add validation for empty comma separated values (@DevXiaolan)

## 2.17.0 - 2020-11-04

- #183 Support last day of month (@heitara)
- Update deps 4db6cad1cba9ad0d0c561fc1f062df83a40f40f2

## 2.16.3 - 2020-08-09

## 2.16.0 - 2020-08-07

- Remove limitation for range values. Fixes #191

## 2.15.0 - 2020-05-26

- Fixes issue with repeat value parsing and handling (#169)

## 2.14.0 - 2020-05-20

- Sort input atoms in ascending order (#179)

## 2.13.1 - 2020-05-20

## 2.13.0 - 2019-07-22

- Lodash security issue fix (#163)
- `reset()` accepts arbitrary input date (#162)

## 2.12.0 - 2019-06-10

- Improve explicit day of month definition handling and validation. Fixes #158
- Upgrade deps

## 2.11.0 - 2019-04-10

Adds support for '#' character in the dayOfWeek field #155 (@DiskImage)

## 2.10.0 - 2019-03-29

- Implement parser loop limit and simplify and simplify invalid explicit day of month definition validation logic (#152)

## 2.9.0 - 2019-03-11

- Fix issue with day of month validation (#151)
- Add additional parser validation for expressions with too many fields (https://github.com/harrisiirak/cron-parser/commit/9f3691ad822f3759a1c65aae621496425a908b36)
- Improve parsing test cases to avoid possible false-positive results (https://github.com/harrisiirak/cron-parser/commit/63546752f59ba28c58f466c97efb38bbd29e2f8a)

## 2.8.0 - 2019-03-10

- Fix issue with GAS #150 (@skyksandr)
- Fix invalid range parsing #147 (@santigimeno)
- Update outdated dependencies
- Remove node 4/5 from travis build configuration

## 2.7.3 - 2018-11-18

- Add .npmignore and exclude project configuration. Reduces package size around ~21%.

## 2.7.2 - 2018-11-18

- Fix bug with sequences #140 (@santigimeno)

## 2.7.1 - 2018-11-11

- Fix issues with DST boundaries and revert previous release breaking changes #138 (@santigimeno)

## 2.7.0 - 2018-11-07

- Fix issue with TZ sensitive iterations #131 #134
- Fix issue with leap year expression parsing #135 (@fishcharlie)
- Update dependencies #136 (@fishcharlie)
- Drop support for node 0.10 and 0.12
- Add support for node 10

## 2.6.0 - 2018-08-19

#128 Add partial question mark support

## 2.5.0 - 2018-04-15

#120

## 2.4.4 - 2018-01-24

## 2.4.3 - 2017-10-12

Fixes #110 Restrict days in month validation only for February

## 2.4.1 - 2017-06-30

#99 fix prev when current date msecs are not zero

## 2.4.0 - 2017-04-04

#93 fix calculation when starting on full hours (@santigimeno)
#89 implement reverse directional cron date searching capabilities (@faazshift)

## 2.3.1 - 2017-02-09

Bugfix release that fixes ES5 compatibility.

#90 hasNext did not change hasIterated
#88 Use var instead of const

## 2.3.0 - 2016-12-12

#83 add complete whitespace and tab support

## 2.2.2 - 2016-12-07

## 2.2.1 - 2016-11-08

## 2.2.0 - 2016-10-16

## 2.1.1 - 2016-08-22

## 2.1.0 - 2016-06-04

- Fix matching intervals being skipped when both dayOfWeek and dayOfMonth are restricted

## 2.0.3 - 2016-04-14

- use "is-nan" module
- deprecate old nodejs version in travis configuration

## 2.0.1 - 2016-03-25

## 2.0.0 - 2016-03-21

Adds support for timezones and DST transitions.
Internal Date class uses momentjs for time manipulations.

## 1.1.1 - 2016-03-18

## 1.1.0 - 2015-12-15

Fix the issue when first second iteration doesn't increase the value correctly. Related to #51.

## 1.0.0 - 2015-09-12

- Date class global pollution cleanup
- UTC

## 0.7.1 - 2015-09-02

## 0.7.0 - 2015-07-30

Fixes critical day and weekday parsing issues. Credits goes to @mpsk

## 0.6.4 - 2015-07-16

## 0.6.3 - 2015-06-26

## 0.6.2 - 2015-05-19

## 0.6.0 - 2015-02-02

- Removed deprecated async behaviour support (no dummy callbacks anymore)
- When iterator options is set true, then ES6 compatible iterator will be returned

## 0.5.0 - 2014-11-17

- Improved expressions parsing performance
- Days in month constraints validation
- DST fixes

## 0.4.5 - 2014-10-21

Fixes regression introduced in version 0.4.4

## 0.4.4 - 2014-10-16

Now supports 0-7 (0 and 7 is sunday) as weekday values.

## 0.4 - 2014-06-13

Deprecate and remove existing synchronous methods. Make parse functions synchronous by the default.
The day of a command's execution can be specified by two fields.
Minor improvements and code cleanup.

## 0.3.5 - 2014-05-12

## 0.3.4 - 2014-05-08

## 0.3.3 - 2014-04-11

Fixes month iteration bug #11

## 0.3.2 - 2014-04-01

## 0.3.0 - 2014-02-20
