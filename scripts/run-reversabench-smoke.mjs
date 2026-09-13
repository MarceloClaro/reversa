import fs from 'node:fs';
import path from 'node:path';

import {
  createBenchmarkRun,
  createBenchmarkTask,
  createReversaBenchExperimentalHarness,
  REVERSABENCH_DEFAULT_VARIANTS,
} from '../lib/integrations/software-engineering/experimental-harness.js';

const manifestPath = process.argv[2] ?? path.resolve('benchmarks/reversabench/manifest.smoke.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
if (manifest.confirmatory !== false) throw new Error('smoke manifest must set confirmatory=false');

const bench = createReversaBenchExperimentalHarness({ bootstrapSamples: 400, bootstrapSeed: 20260913 });
const tasks = manifest.tasks.map((item) => createBenchmarkTask(item));
for (const task of tasks) bench.registerTask(task);

// Deterministic engineering fixtures only. These values are intentionally synthetic
// and exist solely to verify pairing, aggregation, calibration-safe metadata and output shape.
const outcomeMap = {
  'reversa-original': { success: true, latency_ms: 80, cost: 0.10, regressions: 0, false_observed_claims: 1 },
  'reversafeynman-core': { success: true, latency_ms: 95, cost: 0.12, regressions: 0, false_observed_claims: 0 },
  'minimal-repair': { success: false, latency_ms: 60, cost: 0.08, regressions: 1, false_observed_claims: 0 },
  'reversafeynman-v5': { success: true, latency_ms: 110, cost: 0.14, regressions: 0, false_observed_claims: 0 },
};

for (const task of tasks) {
  for (const variant of REVERSABENCH_DEFAULT_VARIANTS) {
    const base = outcomeMap[variant];
    bench.recordRun(createBenchmarkRun({
      task,
      variant,
      seed: 1,
      success: base.success,
      latency_ms: base.latency_ms,
      cost: base.cost,
      regressions: base.regressions,
      observed_claims: 10,
      false_observed_claims: base.false_observed_claims,
      metadata: { synthetic_fixture: true },
    }));
  }
}

const payload = {
  smoke: true,
  scientific_result: false,
  warning: 'Synthetic smoke fixtures validate the benchmark machinery only and MUST NOT be cited as comparative performance evidence.',
  report: bench.report({ confirmatory: false }),
  confirmatory_attempt: bench.report({ confirmatory: true }),
  dataset: bench.exportRecords(),
};

const output = JSON.stringify(payload, null, 2);
const outputPath = process.argv[3];
if (outputPath) {
  fs.mkdirSync(path.dirname(path.resolve(outputPath)), { recursive: true });
  fs.writeFileSync(outputPath, `${output}\n`, 'utf8');
}
console.log(output);
