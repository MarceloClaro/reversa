function mean(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function nonNegativeNumber(value, name) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw new TypeError(`${name} must be a non-negative finite number`);
  }
  return value;
}

export function createReversaBench() {
  const records = [];
  return Object.freeze({
    record({ variant, success, latency_ms = 0, cost = 0, regressions = 0, metadata = {} } = {}) {
      if (typeof variant !== 'string' || !variant.trim()) throw new TypeError('variant required');
      if (typeof success !== 'boolean') throw new TypeError('success must be boolean');
      const latency = nonNegativeNumber(latency_ms, 'latency_ms');
      const normalizedCost = nonNegativeNumber(cost, 'cost');
      if (!Number.isInteger(regressions) || regressions < 0) throw new TypeError('regressions must be a non-negative integer');
      const record = Object.freeze({
        variant,
        success,
        latency_ms: latency,
        cost: normalizedCost,
        regressions,
        metadata: Object.freeze({ ...metadata }),
      });
      records.push(record);
      return record;
    },
    compare() {
      const variants = [...new Set(records.map((r) => r.variant))].sort();
      const results = variants.map((variant) => {
        const rows = records.filter((r) => r.variant === variant);
        const succeeded = rows.filter((r) => r.success).length;
        return Object.freeze({
          schema: 'reversa.benchmark.result/v1',
          variant,
          total: rows.length,
          succeeded,
          success_rate: rows.length ? succeeded / rows.length : 0,
          mean_latency_ms: mean(rows.map((r) => r.latency_ms)),
          mean_cost: mean(rows.map((r) => r.cost)),
          regressions: rows.reduce((sum, r) => sum + r.regressions, 0),
          evidence_authority: false,
        });
      });
      return Object.freeze({
        schema: 'reversa.benchmark.comparison/v1',
        results: Object.freeze(results),
        causal_claim: false,
        note: 'comparative benchmark is empirical/observational unless experimental design establishes causal identification',
        evidence_authority: false,
      });
    },
    size: () => records.length,
  });
}
