import assert from 'node:assert/strict';

import {
  createBenchmarkTask,
  createBenchmarkRun,
  createReversaBenchExperimentalHarness,
} from '../lib/integrations/software-engineering/experimental-harness.js';

const task = createBenchmarkTask({
  task_id: 'smoke-001',
  suite: 'smoke',
  repository_url: 'https://github.com/example/repo',
  commit_sha: '0123456789abcdef0123456789abcdef01234567',
  kind: 'repair',
  smoke: true,
  metadata: { language: 'javascript' },
});
assert.equal(task.schema, 'reversa.bench.task/v1');
assert.equal(task.evidence_authority, false);
assert.throws(() => createBenchmarkTask({ task_id: 'x' }), /suite|repository_url|commit_sha/i);
assert.throws(() => createBenchmarkTask({
  task_id: 'bad-sha',
  suite: 'x',
  repository_url: 'https://github.com/example/repo',
  commit_sha: 'main',
}), /commit_sha/i);

const run = createBenchmarkRun({
  task,
  variant: 'reversafeynman-v5',
  seed: 7,
  success: true,
  latency_ms: 100,
  cost: 0.25,
  regressions: 0,
  observed_claims: 10,
  false_observed_claims: 1,
  ablation: {
    feynman: true,
    hermes_governor: true,
    code_intelligence: true,
    multi_candidate_repair: true,
    mutation_gate: true,
    optimizer: false,
  },
});
assert.equal(run.schema, 'reversa.bench.run/v1');
assert.equal(run.evidence_authority, false);
assert.equal(run.false_observed_claims, 1);
assert.throws(() => createBenchmarkRun({ task, variant: 'x', seed: '7', success: true }), /seed/i);
assert.throws(() => createBenchmarkRun({ task, variant: 'x', seed: -1, success: true }), /seed/i);

const bench = createReversaBenchExperimentalHarness({ bootstrapSamples: 400, bootstrapSeed: 1234 });
bench.registerTask(task);

for (const variant of ['reversa-original', 'reversafeynman-core', 'minimal-repair', 'reversafeynman-v5']) {
  bench.recordRun(createBenchmarkRun({
    task,
    variant,
    seed: 1,
    success: variant !== 'minimal-repair',
    latency_ms: variant === 'reversafeynman-v5' ? 110 : 90,
    cost: 0.1,
    regressions: variant === 'minimal-repair' ? 1 : 0,
    observed_claims: 10,
    false_observed_claims: variant === 'reversa-original' ? 2 : 0,
  }));
}

const pilot = bench.report({ confirmatory: false });
assert.equal(pilot.schema, 'reversa.bench.report/v1');
assert.equal(pilot.confirmatory, false);
assert.equal(pilot.causal_claim, false);
assert.equal(pilot.results.length, 4);
assert.ok(pilot.results.every((x) => Array.isArray(x.success_rate_ci95) && x.success_rate_ci95.length === 2));
assert.equal(pilot.results.find((x) => x.variant === 'reversa-original').false_observed_rate, 0.2);
assert.equal(pilot.paired_cells, 1);
assert.ok(pilot.results.every((x) => x.evidence_authority === false));

const confirmatory = bench.report({ confirmatory: true });
assert.equal(confirmatory.confirmatory, false, 'smoke-only data must not become confirmatory');
assert.equal(confirmatory.confirmatory_blocked_reason, 'no non-smoke runs available');

const oneVariantBench = createReversaBenchExperimentalHarness({ variants: ['reversa-original'], bootstrapSamples: 100 });
const oneVariantTask = createBenchmarkTask({
  task_id: 'single-variant',
  suite: 'pilot',
  repository_url: 'https://github.com/example/single',
  commit_sha: '3333333333333333333333333333333333333333',
  smoke: false,
});
oneVariantBench.registerTask(oneVariantTask);
oneVariantBench.recordRun(createBenchmarkRun({
  task: oneVariantTask,
  variant: 'reversa-original',
  seed: 1,
  success: true,
}));
const oneVariantReport = oneVariantBench.report({ confirmatory: true });
assert.equal(oneVariantReport.confirmatory, false);
assert.equal(oneVariantReport.confirmatory_blocked_reason, 'fewer than two variants available');
assert.equal(oneVariantReport.paired_cells, 0);

const task2 = createBenchmarkTask({
  task_id: 'real-001',
  suite: 'pilot-public',
  repository_url: 'https://github.com/example/repo2',
  commit_sha: 'abcdefabcdefabcdefabcdefabcdefabcdefabcd',
  kind: 'repair',
  smoke: false,
});
bench.registerTask(task2);
for (const variant of ['reversa-original', 'reversafeynman-v5']) {
  for (const seed of [1, 2, 3]) {
    bench.recordRun(createBenchmarkRun({
      task: task2,
      variant,
      seed,
      success: variant === 'reversafeynman-v5' || seed !== 3,
      latency_ms: 100 + seed,
      cost: 0.2,
      regressions: 0,
      observed_claims: 5,
      false_observed_claims: variant === 'reversa-original' && seed === 3 ? 1 : 0,
    }));
  }
}
const reportA = bench.report({ confirmatory: true });
const reportB = bench.report({ confirmatory: true });
assert.equal(reportA.confirmatory, true);
assert.equal(reportA.paired_cells, 3);
assert.deepEqual(reportA, reportB, 'bootstrap must be deterministic under configured seed');
assert.ok(reportA.results.every((x) => x.evidence_authority === false));

const exported = bench.exportRecords();
assert.equal(exported.tasks.length, 2);
assert.ok(exported.runs.length >= 10);
assert.equal(exported.evidence_authority, false);

console.log('✓ ReversaBench Experimental Harness v1: contratos, pairing e estatística conservadora OK');
