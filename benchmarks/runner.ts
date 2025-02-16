import * as fs from 'fs';
import chalk from 'chalk';
import Table from 'cli-table3';
import { CronExpressionParser } from '../src/CronExpressionParser';
import { VersionManager } from './version-manager';

export interface BenchmarkResult {
  pattern: string;
  oldMean: number;
  newMean: number;
  change: number;
}

export const benchmarkResults: BenchmarkResult[] = [];

type ParseExpressionFn = (expression: string, options?: { currentDate?: Date }) => { next: () => any };

let oldParseExpression: ParseExpressionFn;
const newParseExpression = CronExpressionParser.parse as ParseExpressionFn;

export async function initializeBenchmark(version?: string) {
  const { version: resolvedVersion, packagePath } = await VersionManager.getPackageVersion(version);
  console.log(`Using cron-parser version ${resolvedVersion} for comparison`);

  const module = require(packagePath);
  oldParseExpression = (module.default?.parse as ParseExpressionFn) ?? (module.parseExpression as ParseExpressionFn);
}

interface BenchmarkStats {
  min: number;
  max: number;
  mean: number;
  stddev: number;
}

function calculateStats(times: number[]): BenchmarkStats {
  const min = Math.min(...times);
  const max = Math.max(...times);
  const mean = times.reduce((a, b) => a + b, 0) / times.length;
  const variance = times.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / times.length;
  const stddev = Math.sqrt(variance);

  return { min, max, mean, stddev };
}

function formatTime(ms: number): string {
  return `${ms.toFixed(2)}ms`;
}

function getChangeIndicator(percentChange: number): string {
  if (Math.abs(percentChange) <= 1) {
    return chalk.yellow('⟷'); // minimal change
  }
  return percentChange > 0
    ? chalk.green('↑') // improvement
    : chalk.red('↓'); // degradation
}

function formatPercentage(value: number): string {
  const formatted = `${Math.abs(value).toFixed(2)}%`;
  if (Math.abs(value) <= 1) {
    return chalk.yellow(formatted);
  }
  return value > 0 ? chalk.green(formatted) : chalk.red(formatted);
}

function printStats(oldStats: BenchmarkStats, newStats: BenchmarkStats, expression: string, outputFile: string): void {
  const tableData: Record<
    string,
    {
      Old: string;
      New: string;
      Change: string;
      Indicator: string;
    }
  > = {};

  const metrics = ['stddev', 'min', 'max', 'mean'] as const;
  const meanPercentChange = ((oldStats.mean - newStats.mean) / oldStats.mean) * 100;
  const hasWarnings = meanPercentChange < 0;

  metrics.forEach((metric) => {
    const oldValue = oldStats[metric];
    const newValue = newStats[metric];
    const percentChange = ((oldValue - newValue) / oldValue) * 100;

    tableData[metric] = {
      Old: formatTime(oldValue),
      New: formatTime(newValue),
      Change: formatPercentage(percentChange),
      Indicator: getChangeIndicator(percentChange),
    };
  });

  // Create table
  const table = new Table({
    head: ['Metric', 'Old', 'New', 'Change', ' '],
    style: {
      head: [],
      border: [],
    },
    colWidths: [10, 12, 12, 10, 5],
    colAligns: ['left', 'right', 'right', 'right', 'center'],
  });

  // Add rows
  metrics.forEach((metric) => {
    const data = tableData[metric];
    const row = [
      metric === 'mean' ? chalk.bold(metric) : metric,
      metric === 'mean' ? chalk.bold(data.Old) : data.Old,
      metric === 'mean' ? chalk.bold(data.New) : data.New,
      metric === 'mean' ? chalk.bold(data.Change) : data.Change,
      metric === 'mean' ? chalk.bold(data.Indicator) : data.Indicator,
    ];
    table.push(row);
  });

  console.log(`\nResults for pattern: ${expression}`);
  console.log(table.toString());

  if (hasWarnings) {
    console.log(chalk.bold.red(`WARNING: Overall performance degraded by ${formatPercentage(-meanPercentChange)}!`));
  }

  // Save results to file
  const resultContent = `
Pattern: ${expression}
Timestamp: ${new Date().toISOString()}
${'-'.repeat(50)}
${Object.entries(tableData)
  .map(([metric, data]) => `${metric}: ${data.Old} -> ${data.New} (${data.Change.replace(/\u001b\[\d+m/g, '')})`)
  .join('\n')}
${hasWarnings ? `\nWARNING: Overall performance degraded by ${formatPercentage(-meanPercentChange)}!` : ''}
${'-'.repeat(50)}\n
`;

  fs.appendFileSync(outputFile, resultContent);
}

export function printSummary() {
  // Print summary table
  console.log('\nSummary of all benchmarks:');
  const summaryTable = new Table({
    head: ['Pattern', 'Old Mean', 'New Mean', 'Change', ''],
    style: {
      head: [],
      border: [],
    },
    colWidths: [20, 12, 12, 10, 5],
    colAligns: ['left', 'right', 'right', 'right', 'center'],
  });

  // Sort by improvement percentage
  benchmarkResults.sort((a, b) => b.change - a.change);

  benchmarkResults.forEach((result) => {
    summaryTable.push([
      result.pattern,
      `${result.oldMean.toFixed(2)}ms`,
      `${result.newMean.toFixed(2)}ms`,
      result.change > 0 ? chalk.green(`${result.change.toFixed(2)}%`) : chalk.red(`${result.change.toFixed(2)}%`),
      result.change > 0 ? chalk.green('↑') : chalk.red('↓'),
    ]);
  });

  console.log(summaryTable.toString());
}

function runBenchmark(
  expression: string,
  currentDate: Date,
  parser: ParseExpressionFn,
  iterations: number,
): [number, string[]] {
  const start = performance.now();
  const result = parser(expression, { currentDate });
  const dates: string[] = [];
  for (let i = 0; i < iterations; i++) {
    dates.push(result.next().toString());
  }
  const end = performance.now();
  return [end - start, dates];
}

export async function parseAndBenchMarkExpression(
  expression: string,
  iterations = 10000,
  samples = 5,
  outputFile: string,
) {
  const currentDate = new Date();
  const oldTimes: number[] = [];
  const newTimes: number[] = [];

  console.log(`\nstart pattern: ${expression}`);
  console.log(`running ${samples} samples of ${iterations} iterations each\n`);

  // Warm up run
  runBenchmark(expression, currentDate, oldParseExpression, Math.min(1000, iterations));
  runBenchmark(expression, currentDate, newParseExpression, Math.min(1000, iterations));

  // Actual benchmark runs
  for (let i = 0; i < samples; i++) {
    console.log(`sample ${i + 1}/${samples}`);
    const [oldTime, oldDates] = runBenchmark(expression, currentDate, oldParseExpression, iterations);
    const [newTime, newDates] = runBenchmark(expression, currentDate, newParseExpression, iterations);

    // Validate results
    const allMatched = oldDates.every((date, index) => {
      if (date !== newDates[index]) {
        console.warn(`Mismatch at index ${index}: ${date} !== ${newDates[index]}`);
        return false;
      }
      return true;
    });

    if (!allMatched) {
      console.error('Results do not match!', oldDates, newDates);
    }

    oldTimes.push(oldTime);
    newTimes.push(newTime);
  }

  const oldStats = calculateStats(oldTimes);
  const newStats = calculateStats(newTimes);

  // Store results for summary
  benchmarkResults.push({
    pattern: expression,
    oldMean: oldStats.mean,
    newMean: newStats.mean,
    change: ((oldStats.mean - newStats.mean) / oldStats.mean) * 100,
  });

  printStats(oldStats, newStats, expression, outputFile);
}
