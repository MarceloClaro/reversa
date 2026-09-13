const DEFAULT_VARIANTS = Object.freeze([
  'reversa-original',
  'reversafeynman-core',
  'minimal-repair',
  'reversafeynman-v5',
]);

function assertNonEmptyString(value, name) {
  if (typeof value !== 'string' || !value.trim()) throw new TypeError(`${name} required`);
  return value;
}

function assertNonNegativeNumber(value, name) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw new TypeError(`${name} must be a non-negative finite number`);
  }
  return value;
}

function assertNonNegativeInteger(value, name) {
  if (!Number.isInteger(value) || value < 0) throw new TypeError(`${name} must be a non-negative integer`);
  return value;
}

function freezeObject(value = {}) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError('metadata/object expected');
  return Object.freeze({ ...value });
}

function mean(values) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function lcg(seed) {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function quantile(sorted, p) {
  if (!sorted.length) return 0;
  const idx = (sorted.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  const weight = idx - lo;
  return sorted[lo] * (1 - weight) + sorted[hi] * weight;
}

function bootstrapRate(values, samples, seed) {
  if (!values.length) return Object.freeze([0, 0]);
  if (values.length === 1) return Object.freeze([values[0], values[0]]);
  const random = lcg(seed);
  const estimates = [];
  for (let s = 0; s < samples; s += 1) {
    let total = 0;
    for (let i = 0; i < values.length; i += 1) {
      total += values[Math.floor(random() * values.length)];
    }
    estimates.push(total / values.length);
  }
  estimates.sort((a, b) => a - b);
  return Object.freeze([quantile(estimates, 0.025), quantile(estimates, 0.975)]);
}

function normalizeAblation(value = {}) {
  const defaults = {
    feynman: false,
    hermes_governor: false,
    code_intelligence: false,
    multi_candidate_repair: false,
    mutation_gate: false,
    optimizer: false,
  };
  const result = { ...defaults };
  for (const [key, candidate] of Object.entries(value ?? {})) {
    if (!(key in result)) continue;
    if (typeof candidate !== 'boolean') throw new TypeError(`ablation.${key} must be boolean`);
    result[key] = candidate;
  }
  return Object.freeze(result);
}

export function createBenchmarkTask({
  task_id,
  suite,
  repository_url,
  commit_sha,
  kind = 'repair',
  smoke = false,
  metadata = {},
} = {}) {
  assertNonEmptyString(task_id, 'task_id');
  assertNonEmptyString(suite, 'suite');
  assertNonEmptyString(repository_url, 'repository_url');
  assertNonEmptyString(commit_sha, 'commit_sha');
  assertNonEmptyString(kind, 'kind');
  if (typeof smoke !== 'boolean') throw new TypeError('smoke must be boolean');
  return Object.freeze({
    schema: 'reversa.bench.task/v1',
    task_id,
    suite,
    repository_url,
    commit_sha,
    kind,
    smoke,
    metadata: freezeObject(metadata),
    evidence_authority: false,
  });
}

export function createBenchmarkRun({
  task,
  variant,
  seed,
  success,
  latency_ms = 0,
  cost = 0,
  regressions = 0,
  observed_claims = 0,
  false_observed_claims = 0,
  status = 'completed',
  ablation = {},
  metadata = {},
} = {}) {
  if (!task || task.schema !== 'reversa.bench.task/v1') throw new TypeError('valid task required');
  assertNonEmptyString(variant, 'variant');
  if (!Number.isInteger(seed)) throw new TypeError('seed must be an integer');
  if (typeof success !== 'boolean') throw new TypeError('success must be boolean');
  assertNonEmptyString(status, 'status');
  const latency = assertNonNegativeNumber(latency_ms, 'latency_ms');
  const normalizedCost = assertNonNegativeNumber(cost, 'cost');
  const normalizedRegressions = assertNonNegativeInteger(regressions, 'regressions');
  const observed = assertNonNegativeInteger(observed_claims, 'observed_claims');
  const falseObserved = assertNonNegativeInteger(false_observed_claims, 'false_observed_claims');
  if (falseObserved > observed) throw new RangeError('false_observed_claims cannot exceed observed_claims');
  return Object.freeze({
    schema: 'reversa.bench.run/v1',
    task_id: task.task_id,
    suite: task.suite,
    repository_url: task.repository_url,
    commit_sha: task.commit_sha,
    smoke: task.smoke,
    variant,
    seed,
    success,
    status,
    latency_ms: latency,
    cost: normalizedCost,
    regressions: normalizedRegressions,
    observed_claims: observed,
    false_observed_claims: falseObserved,
    ablation: normalizeAblation(ablation),
    metadata: freezeObject(metadata),
    evidence_authority: false,
  });
}

function aggregateVariant(rows, bootstrapSamples, bootstrapSeed) {
  const successValues = rows.map((row) => (row.success ? 1 : 0));
  const totalObserved = rows.reduce((sum, row) => sum + row.observed_claims, 0);
  const totalFalseObserved = rows.reduce((sum, row) => sum + row.false_observed_claims, 0);
  return Object.freeze({
    schema: 'reversa.bench.variant.result/v1',
    variant: rows[0]?.variant ?? 'unknown',
    total_runs: rows.length,
    succeeded: successValues.reduce((sum, value) => sum + value, 0),
    success_rate: mean(successValues),
    success_rate_ci95: bootstrapRate(successValues, bootstrapSamples, bootstrapSeed),
    regression_rate: rows.length ? rows.filter((row) => row.regressions > 0).length / rows.length : 0,
    mean_regressions: mean(rows.map((row) => row.regressions)),
    mean_latency_ms: mean(rows.map((row) => row.latency_ms)),
    mean_cost: mean(rows.map((row) => row.cost)),
    false_observed_rate: totalObserved ? totalFalseObserved / totalObserved : 0,
    observed_claims: totalObserved,
    false_observed_claims: totalFalseObserved,
    evidence_authority: false,
  });
}

function pairedCells(rows) {
  const byCell = new Map();
  for (const row of rows) {
    const key = `${row.task_id}::${row.seed}`;
    if (!byCell.has(key)) byCell.set(key, new Set());
    byCell.get(key).add(row.variant);
  }
  const maxVariants = new Set(rows.map((row) => row.variant)).size;
  return [...byCell.values()].filter((variants) => variants.size === maxVariants && maxVariants > 0).length;
}

export function createReversaBenchExperimentalHarness({
  variants = DEFAULT_VARIANTS,
  bootstrapSamples = 2000,
  bootstrapSeed = 20260913,
} = {}) {
  if (!Array.isArray(variants) || variants.length < 1) throw new TypeError('variants must be a non-empty array');
  if (!Number.isInteger(bootstrapSamples) || bootstrapSamples < 100) throw new TypeError('bootstrapSamples must be an integer >= 100');
  if (!Number.isInteger(bootstrapSeed)) throw new TypeError('bootstrapSeed must be an integer');
  const allowedVariants = new Set(variants.map((variant) => assertNonEmptyString(variant, 'variant')));
  const tasks = new Map();
  const runs = [];

  return Object.freeze({
    registerTask(task) {
      if (!task || task.schema !== 'reversa.bench.task/v1') throw new TypeError('valid task required');
      if (tasks.has(task.task_id)) throw new Error(`duplicate task_id: ${task.task_id}`);
      tasks.set(task.task_id, task);
      return task;
    },
    recordRun(run) {
      if (!run || run.schema !== 'reversa.bench.run/v1') throw new TypeError('valid run required');
      if (!tasks.has(run.task_id)) throw new Error(`task not registered: ${run.task_id}`);
      if (!allowedVariants.has(run.variant)) allowedVariants.add(run.variant);
      const duplicate = runs.some((row) => row.task_id === run.task_id && row.variant === run.variant && row.seed === run.seed);
      if (duplicate) throw new Error(`duplicate run cell: ${run.task_id}/${run.variant}/${run.seed}`);
      runs.push(run);
      return run;
    },
    report({ confirmatory = false } = {}) {
      if (typeof confirmatory !== 'boolean') throw new TypeError('confirmatory must be boolean');
      const selected = confirmatory ? runs.filter((row) => !row.smoke) : [...runs];
      const effectiveConfirmatory = confirmatory && selected.length > 0;
      const variantsPresent = [...new Set(selected.map((row) => row.variant))].sort();
      const results = variantsPresent.map((variant, index) => aggregateVariant(
        selected.filter((row) => row.variant === variant),
        bootstrapSamples,
        (bootstrapSeed + index * 1009) >>> 0,
      ));
      return Object.freeze({
        schema: 'reversa.bench.report/v1',
        generated_from_runs: selected.length,
        task_count: new Set(selected.map((row) => row.task_id)).size,
        variants: Object.freeze(variantsPresent),
        paired_cells: pairedCells(selected),
        confirmatory: effectiveConfirmatory,
        confirmatory_blocked_reason: confirmatory && !selected.length ? 'no non-smoke runs available' : null,
        causal_claim: false,
        results: Object.freeze(results),
        bootstrap: Object.freeze({ samples: bootstrapSamples, seed: bootstrapSeed, method: 'percentile-lcg-v1' }),
        evidence_authority: false,
      });
    },
    exportRecords() {
      return Object.freeze({
        schema: 'reversa.bench.dataset/v1',
        tasks: Object.freeze([...tasks.values()]),
        runs: Object.freeze([...runs]),
        evidence_authority: false,
      });
    },
    variants: Object.freeze([...allowedVariants]),
  });
}

export const REVERSABENCH_DEFAULT_VARIANTS = DEFAULT_VARIANTS;
