import { initializeBenchmark, parseAndBenchMarkExpression } from './runner';
import * as fs from 'fs';
import * as path from 'path';

async function runPatternBenchmark() {
  const pattern = process.argv[2];
  if (!pattern) {
    console.error('Error: No pattern provided');
    console.error('Usage: npm run bench:pattern "* * * * *"');
    process.exit(1);
  }

  const version = process.env.PACKAGE_VERSION;
  const iterations = process.env.BENCHMARK_ITERATIONS ? parseInt(process.env.BENCHMARK_ITERATIONS, 10) : 10000;
  const samples = process.env.BENCHMARK_SAMPLES ? parseInt(process.env.BENCHMARK_SAMPLES, 10) : 5;

  await initializeBenchmark(version);

  // Create results directory
  const resultsDir = path.join(__dirname, 'results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir);
  }

  // Create timestamped file in results directory
  const timestamp = Date.now();
  const outputFile = path.join(resultsDir, `benchmark-${pattern.replace(/\s/g, '-')}-${timestamp}.txt`);

  // Write header to results file
  const header = `Benchmark Results for pattern: ${pattern}
Timestamp: ${new Date().toISOString()}
Package Version: ${version || 'latest'}
${'-'.repeat(50)}\n\n`;
  
  fs.writeFileSync(outputFile, header);

  console.log('Running benchmark...\n');

  await parseAndBenchMarkExpression(pattern, iterations, samples, outputFile);
}

runPatternBenchmark().catch(error => {
  console.error('Benchmark failed:', error);
  process.exit(1);
});
