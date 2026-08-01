# Security Policy

## Supported Versions

Security fixes are released for the `5.x` line only. Older majors are end-of-life and will not receive patches; please upgrade before reporting an issue against them.

| Version | Supported          |
| ------- | ------------------ |
| 5.x     | :white_check_mark: |
| 4.x     | :x:                |
| < 4.0   | :x:                |

Fixes land on the latest `5.x` release. There are no long-term support branches for earlier minors, so the remedy for any advisory is to upgrade to the newest `5.x` version.

## Reporting a Vulnerability

**Please do not report security issues through public GitHub issues, pull requests or discussions.**

Report privately through GitHub Security Advisories: open [Report a vulnerability](https://github.com/harrisiirak/cron-parser/security/advisories/new), or go to the repository's **Security** tab and click **Report a vulnerability**. This creates a private thread visible only to you and the maintainers.

Please include as much of the following as you can:

- The cron expression, crontab file content, or API call that triggers the issue
- A minimal reproduction (a short script is ideal) and the observed behaviour
- The version of cron-parser and Node.js you tested against
- Your assessment of the impact, and any suggested fix or mitigation

## What to Expect

cron-parser is maintained by volunteers, so response times are best-effort rather than contractual:

- **Acknowledgement** - receipt is confirmed within 5 business days
- **Assessment** - the report is confirmed or dismissed, with reasoning, within 14 days
- **Fix** - confirmed issues are patched and released as soon as practical, prioritised by severity
- **Updates** - the advisory thread is kept up to date while the report is open

If you have not heard back within 14 days, feel free to post a nudge in the advisory thread.

## Disclosure Policy

This project follows coordinated disclosure. Please allow a reasonable window for a fix to ship before disclosing publicly. Once a patched release is available, a GitHub Security Advisory is published (requesting a CVE where warranted) and the reporter is credited by name unless anonymity is requested.

## Scope

cron-parser is a pure parsing and date-calculation library. It parses cron expressions and computes matching dates. It never executes commands, spawns processes, opens network connections, or acts as a scheduler. The security-relevant surface is therefore what happens when it is handed untrusted input.

**In scope:**

- A crafted cron expression that causes a hang, unbounded loop, unbounded memory growth, or a non-`Error` crash in `CronExpressionParser.parse()`
- Catastrophic backtracking (ReDoS) in expression validation
- Prototype pollution or similar object-integrity issues via parsed field values or crontab variable names
- Path handling or resource-exhaustion issues in `CronFileParser.parseFile()` / `parseFileSync()` when pointed at a crafted crontab file
- Any way to make the library reach outside its documented behaviour (executing, reading, or writing something it should not)

**Out of scope:**

- Vulnerabilities in dependencies such as [luxon](https://github.com/moment/luxon) - report those upstream, though please do open an advisory here if cron-parser needs to ship a version bump
- Incorrect schedules, wrong DST handling, or other correctness bugs with no security impact - these are normal [bug reports](https://github.com/harrisiirak/cron-parser/issues/new?template=bug_report.md)
- Slow iteration over expressions you control that are valid but expensive (for example stepping across many years) - see the hardening notes below
- Anything that requires the attacker to already control the host process or its dependencies

## Hardening Notes for Users

If you accept cron expressions from your users, treat them as untrusted input:

- **Bound the input.** Cap expression length and reject obviously malformed input before parsing.
- **Wrap parsing in `try`/`catch`.** Invalid expressions throw by design; an uncaught throw in a request handler is an availability bug in your service.
- **Bound the iteration.** Date stepping is internally limited and throws rather than looping forever, but the amount of work you request is up to you - decide up front how many occurrences you will compute, and prefer bounded iteration with `endDate` over open-ended loops.
- **Never build shell commands from parsed output.** This library gives you dates and field values, not a vetted command line.
- **Keep the dependency current.** Watch releases and enable Dependabot or an equivalent so security releases reach you promptly.
