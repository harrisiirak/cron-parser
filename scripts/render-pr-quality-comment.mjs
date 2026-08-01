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

const pct = (metric) => {
  const value = coverage.total?.[metric]?.pct;
  if (typeof value !== 'number') {
    fail(`Coverage summary is missing total.${metric}.pct`);
  }
  return `${value}%`;
};

const ms = (value) => `${value.toFixed(2)}ms`;
const signed = (value) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;

const benchmarkRow = (result) =>
  `| \`${result.pattern}\` | ${ms(result.oldMean)} | ${ms(result.newMean)} | ${signed(result.change)} |`;

const benchmarkRows = benchmark.results.map(benchmarkRow).join('\n');

process.stdout.write(`${MARKER}
## Quality gates · commit \`${headSha.slice(0, 7)}\`

### Coverage

| Statements | Branches | Functions | Lines |
|---|---|---|---|
| ${pct('statements')} | ${pct('branches')} | ${pct('functions')} | ${pct('lines')} |

### Benchmark — vs \`cron-parser@${benchmark.baselineVersion}\` (npm latest)

${benchmark.iterations} iterations × ${benchmark.samples} ${benchmark.samples === 1 ? 'sample' : 'samples'} per pattern. A positive change is faster than the baseline.

| Pattern | Baseline | This PR | Change |
|---|---|---|---|
${benchmarkRows}

<sub>Informational only. Runner timings are noisy and this check never fails.</sub>
`);
