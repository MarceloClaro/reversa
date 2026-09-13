function safeRatio(a, b) {
  if (!Number.isFinite(a) || !Number.isFinite(b) || b <= 0) return null;
  return a / b;
}

export function createQualityGateRunner({ mutationThreshold = 0.8 } = {}) {
  return Object.freeze({
    evaluate({ tests = {}, static_analysis = {}, mutation = {}, metadata = {} } = {}) {
      const passed = Number.isInteger(tests.passed) ? tests.passed : 0;
      const failed = Number.isInteger(tests.failed) ? tests.failed : 0;
      const critical = Number.isInteger(static_analysis.critical) ? static_analysis.critical : 0;
      const high = Number.isInteger(static_analysis.high) ? static_analysis.high : 0;
      const killed = Number.isInteger(mutation.killed) ? mutation.killed : 0;
      const survived = Number.isInteger(mutation.survived) ? mutation.survived : 0;
      const mutationScore = safeRatio(killed, killed + survived);
      const testGate = failed === 0 && passed > 0;
      const staticGate = critical === 0 && high === 0;
      const mutationGate = mutationScore === null ? null : mutationScore >= mutationThreshold;
      return Object.freeze({
        schema: 'reversa.quality.report/v1',
        tests: Object.freeze({ passed, failed, gate: testGate }),
        static_analysis: Object.freeze({ critical, high, gate: staticGate }),
        mutation_score: mutationScore,
        mutation_gate: mutationGate,
        passed: testGate && staticGate && mutationGate !== false,
        feynman_gate: 'FEG-04',
        provider_hints: Object.freeze(['Semgrep', 'ast-grep custom lint', 'StrykerJS', 'language-native test runner']),
        metadata: Object.freeze({ ...metadata }),
        evidence_authority: false,
      });
    },
  });
}
