#!/usr/bin/env node

/**
 * Renders the coverage badges from the json-summary reporter output. Run after
 * `npm run test:coverage`. Takes an optional output directory, defaulting to
 * coverage/; the Documentation workflow points it at docs/ so the badges are
 * published to GitHub Pages rather than committed.
 */

import { makeBadge } from 'badge-maker';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const COVERAGE_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'coverage');
const SUMMARY_PATH = join(COVERAGE_DIR, 'coverage-summary.json');
const OUTPUT_DIR = process.argv[2] ? resolve(process.argv[2]) : COVERAGE_DIR;

const METRICS = ['statements', 'branches', 'functions', 'lines'];

const colorFor = (pct) => {
  if (pct >= 95) return 'brightgreen';
  if (pct >= 90) return 'green';
  if (pct >= 80) return 'yellowgreen';
  if (pct >= 70) return 'yellow';
  if (pct >= 60) return 'orange';
  return 'red';
};

const fail = (message) => {
  console.error(message);
  process.exit(1);
};

let summary;
try {
  summary = JSON.parse(readFileSync(SUMMARY_PATH, 'utf8'));
} catch {
  fail(`Unable to read ${SUMMARY_PATH}. Run "npm run test:coverage" first.`);
}

mkdirSync(OUTPUT_DIR, { recursive: true });

for (const metric of METRICS) {
  const pct = summary.total?.[metric]?.pct;
  if (typeof pct !== 'number') {
    fail(`Coverage summary is missing total.${metric}.pct`);
  }

  const svg = makeBadge({
    label: `Coverage:${metric}`,
    message: `${pct}%`,
    color: colorFor(pct),
    style: 'flat',
  });

  writeFileSync(join(OUTPUT_DIR, `badge-${metric}.svg`), svg);
}
