#!/usr/bin/env node

/**
 * Renders the sticky pull request quality-gates comment from the artifact uploaded by the
 * PR Quality Gates workflow. Takes the artifact directory (default: pr-quality) and writes
 * markdown to stdout. Run by the PR Quality Gates Comment workflow, which pipes the output
 * to a file and posts it.
 */

import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const MARKER = '<!-- pr-quality-gates -->';
const ARTIFACT_DIR = resolve(process.argv[2] ?? 'pr-quality');

const fail = (message) => {
  console.error(message);
  process.exit(1);
};

const readArtifact = (name) => {
  try {
    return readFileSync(join(ARTIFACT_DIR, name), 'utf8');
  } catch {
    return fail(`Unable to read ${join(ARTIFACT_DIR, name)}`);
  }
};

const coverage = JSON.parse(readArtifact('coverage-summary.json'));
const benchmark = JSON.parse(readArtifact('benchmark-results.json'));
const headSha = readArtifact('head-sha.txt').trim();

// Both JSON files are produced by code running from the pull request -- benchmark-inputs.ts,
// benchmarks/index.ts and jest.config.js are all fork-modifiable -- so every value read out of
// them is untrusted. Nothing here is executed, but interpolating a raw string into the comment
// would let a fork break out of a code span or table cell and post arbitrary markdown under the
// github-actions[bot] identity. Sanitize on the way in and bound the output size.

const MAX_FIELD_LENGTH = 120;
const MAX_ROWS = 100;

const clean = (value, maxLength = MAX_FIELD_LENGTH) =>
  String(value)
    .replace(/[`|<>\r\n]/g, ' ')
    .trim()
    .slice(0, maxLength);

const number = (value) => (Number.isFinite(Number(value)) ? Number(value) : 0);

const pct = (metric) => {
  const value = coverage.total?.[metric]?.pct;
  if (typeof value !== 'number') {
    fail(`Coverage summary is missing total.${metric}.pct`);
  }
  return `${value}%`;
};

const ms = (value) => `${number(value).toFixed(2)}ms`;
const signed = (value) => `${number(value) >= 0 ? '+' : ''}${number(value).toFixed(2)}%`;

const benchmarkRow = (result) =>
  `| \`${clean(result.pattern)}\` | ${ms(result.oldMean)} | ${ms(result.newMean)} | ${signed(result.change)} |`;

const results = Array.isArray(benchmark.results) ? benchmark.results : [];
const shownResults = results.slice(0, MAX_ROWS);
const benchmarkRows = shownResults.map(benchmarkRow).join('\n');
const truncatedNote =
  results.length > shownResults.length ? `\n\n_Showing the first ${MAX_ROWS} of ${results.length} patterns._` : '';

process.stdout.write(`${MARKER}
## Quality gates · commit \`${clean(headSha, 7)}\`

### Coverage

| Statements | Branches | Functions | Lines |
|---|---|---|---|
| ${pct('statements')} | ${pct('branches')} | ${pct('functions')} | ${pct('lines')} |

### Benchmark — vs \`cron-parser@${clean(benchmark.baselineVersion, 40)}\` (npm latest)

${number(benchmark.iterations)} iterations × ${number(benchmark.samples)} ${number(benchmark.samples) === 1 ? 'sample' : 'samples'} per pattern. A positive change is faster than the baseline.

| Pattern | Baseline | This PR | Change |
|---|---|---|---|
${benchmarkRows}${truncatedNote}

<sub>Informational only. Runner timings are noisy and this check never fails.</sub>
`);
