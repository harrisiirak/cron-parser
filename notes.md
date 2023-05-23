# Cron Expression Parser
## Todos
- [ x ] 2 Tests failing
- [ x ] 6 FIXMEs in code
- [ x ] 3 TODOs in code
- [ x ] Update README.md
- [ ] Update package.json version and manually lint it, removing any unused dependencies or config values
- [ x ] Path: component.json - do we need this?
- [ x ] Redundant Typescript types ICronExpressionParserOptions and ICronParser
- [ x ] Constant Constraints should be refactored out
- [ x ] Should use Enums instead of constants
- [ x ] Should likely remove .editorconfig in favor of eslint
- [ x ] Should remove archive folder
- [ x ] Call pettier as part of pre-commit hook? 

## Changes
 * Complete refactor of code into Typescript, should not be any breaking changes based on documented API. Users should be able to use the library as before. If they were using undocumented features, they will very likely need to update their code.
 * Added builds for both CommonJS(CJS) and EcmaScript Modules(ESM)
 * Improved linting
 * Improved test coverage to effectively 100%
 * Add documentation generation from code
 * Add pre-commit hook to run linting and tests
 * Added many tests, fixed unreported bugs
 * Added code coverage badges
 * Updated .npmignore to ignore build artifacts for lightweight library
 * Added tsconfig files for both CJS and ESM builds
 * Converted primary test to Typescript Jest test
 * Updated TSD tests for updated types
 * Updated package.json to include new scripts and dependencies
 * Added debug library for debugging via DEBUG=cron-parser
 * Fixed issues: 112, 153, 156, 190, 222, 236, 269, 299, 309, 322
 * Fixed issue: 244 in strict mode only, 
 * Might be fixed: 273, 309
 * Note on issue: 249, strict mode basically covers this but might not be 100% complete


## Pull Request
Title: Complete Refactor to TypeScript, Improved Test Coverage, and Bug Fixes

Summary:

This pull request introduces a complete refactor of the codebase into TypeScript, maintaining compatibility with the documented API. Users should not experience any breaking changes, however, those relying on undocumented features may need to update their code. The update includes builds for both CommonJS (CJS) and EcmaScript Modules (ESM), as well as improved linting, enhanced test coverage to nearly 100%, and automatic documentation generation from code.

Additional changes include the implementation of a pre-commit hook to run linting and tests, the addition of numerous tests and bug fixes, and the inclusion of code coverage badges. The .npmignore file has been updated to ignore build artifacts for a lightweight library, and tsconfig files for both CJS and ESM builds have been added. The primary test has been converted to a TypeScript Jest test, with TSD tests updated for revised types. The package.json file has been updated to incorporate new scripts and dependencies. A debug library has also been added for debugging via DEBUG=cron-parser.

This pull request addresses and potentially fixes several issues (#112, #153, #156, #190, #222, #236, #269, #299, #309, #322). Issue #244 is fixed in strict mode only, and issues #273 and #309 may be resolved as well. Issue #249 is partially addressed through the implementation of strict mode, although it may not be entirely complete.

The commit history provides a detailed overview of the work in progress, including refactoring, cleanup, and updates to various components of the codebase.

This pull request still has several items that need to be addressed before it can be considered complete:
1. There are currently 2 tests failing that require attention.
2. There are 6 FIXMEs and 3 TODOs in the code that need to be resolved.
3. The README.md file needs to be updated to reflect the changes introduced in the pull request.
4. The package.json version should be updated, and a manual linting process should be performed to remove any unused dependencies or configuration values.
5. The necessity of the component.json file should be evaluated.
6. Redundant TypeScript types ICronExpressionParserOptions and ICronParser should be resolved.
7. Constant constraints should be refactored out of the code.
8. Enums should be used instead of constants for better code readability and maintainability.
9. The .editorconfig file should be removed in favor of using eslint for consistent code formatting.
10. The archive folder should be removed from the repository.

Once these items have been addressed, the pull request will be more comprehensive and ready for review.

## todo test?
// export const expressions = {
//   '/every-second': '* * * * * *',
//   '/every-minute': '* * * * *',
//   '/every-1-minute': '* * * * *',
//   '/every-2-minutes': '*/2 * * * *',
//   '/every-even-minute': '*/2 * * * *',
//   '/every-uneven-minute': '1-59/2 * * * *',
//   '/every-3-minutes': '*/3 * * * *',
//   '/every-4-minutes': '*/4 * * * *',
//   '/every-5-minutes': '*/5 * * * *',
//   '/every-five-minutes': '*/5 * * * *',
//   '/every-6-minutes': '*/6 * * * *',
//   '/every-10-minutes': '*/10 * * * *',
//   '/every-ten-minutes': '*/10 * * * *',
//   '/every-15-minutes': '*/15 * * * *',
//   '/every-fifteen-minutes': '*/15 * * * *',
//   '/every-quarter-hour': '*/15 * * * *',
//   '/every-20-minutes': '*/20 * * * *',
//   '/every-30-minutes': '*/30 * * * *',
//   '/every-hour-at-30-minutes': '30 * * * *',
//   '/every-hour-at-15-30-45-minutes': '15,30,45 * * * *',
//   '/every-half-hour': '*/30 * * * *',
//   '/every-60-minutes': '0 * * * *',
//   '/every-hour': '0 * * * *',
//   '/every-1-hour': '0 * * * *',
//   '/every-2-hours': '0 */2 * * *',
//   '/every-two-hours': '0 */2 * * *',
//   '/every-even-hour': '0 */2 * * *',
//   '/every-other-hour': '0 */2 * * *',
//   '/every-3-hours': '0 */3 * * *',
//   '/every-three-hours': '0 */3 * * *',
//   '/every-4-hours': '0 */4 * * *',
//   '/every-6-hours': '0 */6 * * *',
//   '/every-six-hours': '0 */6 * * *',
//   '/every-8-hours': '0 */8 * * *',
//   '/every-12-hours': '0 */12 * * *',
//   '/hour-range': '0 9-17 * * *',
//   '/between-certain-hours': '0 9-17 * * *',
//   '/every-day': '0 0 * * *',
//   '/daily': '0 0 * * *',
//   '/once-a-day': '0 0 * * *',
//   '/every-night': '0 0 * * *',
//   '/every-day-at-1am': '0 1 * * *',
//   '/every-day-at-2am': '0 2 * * *',
//   '/every-day-8am': '0 8 * * *',
//   '/every-morning': '0 9 * * *',
//   '/every-midnight': '0 0 * * *',
//   '/every-day-at-midnight': '0 0 * * *',
//   '/every-night-at-midnight': '0 0 * * *',
//   '/every-sunday': '0 0 * * SUN',
//   '/every-monday': '0 0 * * MON',
//   '/every-tuesday': '0 0 * * TUE',
//   '/every-wednesday': '0 0 * * WED',
//   '/every-thursday': '0 0 * * THU',
//   '/every-friday': '0 0 * * FRI',
//   '/every-friday-at-midnight': '0 0 * * FRI',
//   '/every-saturday': '0 0 * * SAT',
//   '/every-saturday-and-sunday': '0 0 * * SAT,SUN',
//   '/every-saturday-and-sunday-at-noon': '0 12 ? * SAT,SUN',
//   '/every-weekday': '0 0 * * 1-5',
//   '/weekdays-only': '0 0 * * 1-5',
//   '/monday-to-friday': '0 0 * * 1-5',
//   '/every-weekend': '0 0 * * 6,0',
//   '/weekends-only': '0 0 * * 6,0',
//   '/every-2-days-at-noon': '0 12 1/2 * ?',
//   '/every-4-days-at-noon': '0 12 1/4 * ?',
//   '/every-7-days': '0 0 * * 0',
//   '/weekly': '0 0 * * 0',
//   '/once-a-week': '0 0 * * 0',
//   '/every-week': '0 0 * * 0',
//   '/every-month': '0 0 1 * *',
//   '/every-month-on-second': '0 1 2 * ?',
//   // '/every-month-on-last-day-at-noon': '0 12 L * ?',
//   // '/every-month-on-second-to-last-day-at-noon': '0 12 L-2 * ?',
//   // '/every-month-on-last-weekday-at-noon': '0 12 LW * ?',
//   // '/every-month-on-last-sunday-at-noon': '0 12 1L * ?',
//   // '/every-month-on-last-monday-at-noon': '0 12 2L * ?',
//   // '/every-month-on-nearest-weekday-to-1st-of-month-at-noon': '0 12 1W * ?',
//   // '/every-month-on-nearest-weekday-to-15th-of-month-at-noon': '0 12 15W * ?',
//   // '/every-month-on-first-monday-of-month-at-noon': '0 12 ? * 2#1',
//   // '/every-month-on-first-friday-of-month-at-noon': '0 12 ? * 6#1',
//   // '/every-month-on-third-thursday-of-month-at-noon': '0 12 ? * 5#3',
//   '/monthly': '0 0 1 * *',
//   '/once-a-month': '0 0 1 * *',
//   '/every-other-month': '0 0 1 */2 *',
//   '/every-quarter': '0 0 1 */3 *',
//   '/every-6-months': '0 0 1 */6 *',
//   '/every-year': '0 0 1 1 *',
//   '/every-day-at-noon-in-january-only': '0 12 ? JAN *',
//   '/every-day-at-noon-in-june-only': '0 12 ? JUN *',
//   '/every-day-at-noon-in-january-and-june-only': '0 12 ? JAN,JUN *',
//   '/every-day-at-noon-in-january-february-june-november-only': '0 12 ? JAN,FEB,JUN,NOV *',
//   '/every-day-at-noon-between-september-and-december': '0 12 ? 8-11 *',
//   '/every-day-at-noon-between-january-to-march-and-september-to-december': '0 12 ? 0-2,8-11 *',
//
// };
