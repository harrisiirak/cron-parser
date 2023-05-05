# Cron Expression Parser
## Todos
- [ ] 2 Tests failing
- [ ] 6 FIXMEs in code
- [ ] 3 TODOs in code
- [ ] Update README.md
- [ ] Update package.json version and manually lint it, removing any unused dependencies or config values
- [ ] Path: component.json - do we need this?
- [ ] Redundant Typescript types ICronExpressionParserOptions and ICronParser
- [ ] Constant Constraints should be refactored out
- [ ] Should use Enums instead of constants
- [ ] Should likely remove .editorconfig in favor of eslint
- [ ] Should remove archive folder
- [ ] Call pettier as part of pre-commit hook? 

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
