import { benchmarkResults, initializeBenchmark, parseAndBenchMarkExpression, printSummary } from './runner';
import { benchmarkInputs } from './benchmark-inputs';
import * as fs from 'fs';
import * as path from 'path';

async function runBenchmarks() {
  const version = process.env.PACKAGE_VERSION;
  const iterations = process.env.BENCHMARK_ITERATIONS ? parseInt(process.env.BENCHMARK_ITERATIONS, 10) : 10000;
  const samples = process.env.BENCHMARK_SAMPLES ? parseInt(process.env.BENCHMARK_SAMPLES, 10) : 5;

  const baselineVersion = await initializeBenchmark(version);

  // Create results directory
  const resultsDir = path.join(__dirname, 'results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir);
  }

  // Create timestamped file in results directory
  const outputFile = path.join(resultsDir, `benchmark-results-${Date.now()}.txt`);

  // Write header to results file
  const header = `Benchmark Results
Timestamp: ${new Date().toISOString()}
Package Version: ${baselineVersion}
${'-'.repeat(50)}\n\n`;

  fs.writeFileSync(outputFile, header);

  console.log('Running benchmarks...\n');

  // Run benchmarks for each pattern
  for (const input of benchmarkInputs) {
    if (input.description) {
      console.log(`\nPattern: ${input.pattern}`);
      console.log(`Description: ${input.description}`);
    }
    await parseAndBenchMarkExpression(input.pattern, iterations, samples, outputFile);
  }

  printSummary();

  const jsonOutputFile = path.join(resultsDir, 'benchmark-results.json');
  fs.writeFileSync(
    jsonOutputFile,
    JSON.stringify({ baselineVersion, iterations, samples, results: benchmarkResults }, null, 2),
  );

  console.log(`\nResults written to:\n  ${outputFile}\n  ${jsonOutputFile}`);
}

runBenchmarks().catch(console.error);
