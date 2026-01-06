---
name: Bug Report
about: Report a bug to help us improve cron-parser
title: '[BUG] '
labels: ['bug']
assignees: ''
---

## Bug Description

A clear and concise description of what the bug is.

## Steps to Reproduce

1. Go to '...'
2. Create cron expression '...'
3. Call method '...'
4. See error

## Expected Behavior

A clear and concise description of what you expected to happen.

## Actual Behavior

A clear and concise description of what actually happened.

## Code Example

Please provide a minimal, reproducible code example:

```javascript
const cron = require('cron-parser');

// Your code that demonstrates the issue
const interval = cron.parseExpression('0 0 * * *');
// ... rest of your code
```

## Environment

**System Information:**

- OS: [e.g. macOS 13.1, Ubuntu 22.04, Windows 11]
- Node.js version: [e.g. 18.17.0]
- cron-parser version: [e.g. 5.4.0]

**Additional Environment Details:**

- Package manager: [npm/yarn/pnpm]
- Installation method: [npm install, yarn add, etc.]

## Related Issues

Are there any related issues or pull requests? Please link them here.

## Additional Context

Add any other context about the problem here, such as:

- When did this issue start occurring?
- Does this work in previous versions?
- Are there any workarounds you've found?
- Screenshots or logs (if applicable)

## Checklist

- [ ] I have searched for existing issues that match this bug
- [ ] I have tested this with the latest version of cron-parser
- [ ] I have provided a minimal, reproducible code example
- [ ] I have included all relevant environment information
