const DEFAULT_WEIGHTS = Object.freeze({
  specAcceptance: 0.20,
  testsPassing: 0.18,
  evidenceGain: 0.14,
  uncertaintyReduction: 0.12,
  calibration: 0.10,
  regressionPenalty: 0.10,
  findingPenalty: 0.08,
  costPenalty: 0.03,
  latencyPenalty: 0.03,
  retryPenalty: 0.02,
});

function clamp(value, min = -1, max = 1) {
  return Math.min(max, Math.max(min, Number(value) || 0));
}

function boolScore(value) {
  if (value === true) return 1;
  if (value === false) return -1;
  return 0;
}

export function computeRewardComponents(outcome = {}) {
  const high = Math.max(0, Number(outcome.highFindings) || 0);
  const critical = Math.max(0, Number(outcome.criticalFindings) || 0);
  const regressions = Math.max(0, Number(outcome.regressionCount) || 0);
  const retries = Math.max(0, Number(outcome.retries) || 0);

  const calibratedConfidence = outcome.calibratedConfidence;
  const actualSuccess = outcome.actualSuccess;
  let calibration = 0;
  if (typeof calibratedConfidence === 'number' && typeof actualSuccess === 'boolean') {
    const target = actualSuccess ? 1 : 0;
    const brier = (clamp(calibratedConfidence, 0, 1) - target) ** 2;
    calibration = 1 - (2 * brier);
  }

  return Object.freeze({
    specAcceptance: boolScore(outcome.specAccepted),
    testsPassing: boolScore(outcome.testsPassing),
    evidenceGain: clamp(outcome.observedEvidenceDelta ?? 0, -1, 1),
    uncertaintyReduction: clamp(outcome.uncertaintyReduction ?? 0, -1, 1),
    calibration: clamp(calibration, -1, 1),
    regressionPenalty: -clamp(regressions / 3, 0, 1),
    findingPenalty: -clamp((critical * 0.5) + (high * 0.2), 0, 1),
    costPenalty: -clamp(outcome.costRatio ?? 0, 0, 1),
    latencyPenalty: -clamp(outcome.latencyRatio ?? 0, 0, 1),
    retryPenalty: -clamp(retries / 5, 0, 1),
  });
}

export function computeAdaptiveReward(outcome = {}, weights = {}) {
  const components = computeRewardComponents(outcome);
  const effectiveWeights = { ...DEFAULT_WEIGHTS, ...weights };

  let total = 0;
  let norm = 0;
  for (const [key, value] of Object.entries(components)) {
    const weight = Math.max(0, Number(effectiveWeights[key]) || 0);
    total += value * weight;
    norm += weight;
  }

  const score = norm > 0 ? clamp(total / norm, -1, 1) : 0;
  return Object.freeze({
    score: Number(score.toFixed(6)),
    components,
    weights: Object.freeze(effectiveWeights),
    policy: 'heuristic-v1',
  });
}

export { DEFAULT_WEIGHTS };
