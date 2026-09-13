import {
  DEFAULT_OFFLINE_PROMOTION_THRESHOLDS,
  OFFLINE_DECISION_SCHEMA,
  OFFLINE_EVALUATION_SCHEMA,
} from './constants.js';
import { validateAdaptiveAction } from './acme-bridge.js';
import { validateAcmeExperience, validateLearningEvent } from './schema.js';

function finite(value, fallback = null) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function mean(values) {
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function round(value, digits = 6) {
  return value === null || value === undefined || !Number.isFinite(value)
    ? null
    : Number(value.toFixed(digits));
}

function clamp01(value) {
  return Math.max(0, Math.min(1, finite(value, 0)));
}

function seededRandom(seed = 20260913) {
  let state = (Number(seed) >>> 0) || 1;
  return () => {
    state = ((1664525 * state) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function percentile(sorted, probability) {
  if (!sorted.length) return null;
  const index = (sorted.length - 1) * probability;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower];
  const weight = index - lower;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

export function bootstrapMeanCI(values, { iterations = 800, seed = 20260913 } = {}) {
  const sample = values.filter((value) => Number.isFinite(Number(value))).map(Number);
  if (!sample.length) {
    return Object.freeze({ n: 0, mean: null, low: null, high: null, method: 'bootstrap-percentile-95' });
  }
  if (!Number.isInteger(iterations) || iterations < 100) {
    throw new TypeError('iterations deve ser inteiro >= 100');
  }

  const random = seededRandom(seed);
  const boot = [];
  for (let iteration = 0; iteration < iterations; iteration += 1) {
    let total = 0;
    for (let index = 0; index < sample.length; index += 1) {
      total += sample[Math.floor(random() * sample.length)];
    }
    boot.push(total / sample.length);
  }
  boot.sort((a, b) => a - b);

  return Object.freeze({
    n: sample.length,
    mean: round(mean(sample)),
    low: round(percentile(boot, 0.025)),
    high: round(percentile(boot, 0.975)),
    method: 'bootstrap-percentile-95',
    iterations,
    seed,
  });
}

export function createDecisionRecord({
  event,
  proposal,
  experience,
  baselineAction,
  decidedAt,
} = {}) {
  const eventCheck = validateLearningEvent(event);
  if (!eventCheck.valid) throw new TypeError(`learning event inválido: ${eventCheck.errors.join('; ')}`);
  const experienceCheck = validateAcmeExperience(experience);
  if (!experienceCheck.valid) throw new TypeError(`ACME experience inválida: ${experienceCheck.errors.join('; ')}`);
  if (!proposal || typeof proposal.action_id !== 'string') {
    throw new TypeError('proposal.action_id é obrigatório');
  }

  const baseline = baselineAction ?? event.action.id;
  if (!validateAdaptiveAction(baseline).allowed) throw new TypeError(`baseline action fora da allowlist: ${baseline}`);
  if (!validateAdaptiveAction(proposal.action_id).allowed) {
    throw new TypeError(`shadow action fora da allowlist: ${proposal.action_id}`);
  }

  const actualSuccess = typeof event.outcome.actualSuccess === 'boolean'
    ? event.outcome.actualSuccess
    : null;

  return Object.freeze({
    schema: OFFLINE_DECISION_SCHEMA,
    event_id: event.event_id,
    decided_at: decidedAt ?? event.timestamp,
    observed_at: event.timestamp,
    task_id: event.task_id,
    stage: event.stage,
    baseline_action: baseline,
    shadow_action: proposal.action_id,
    executed_action: event.action.id,
    baseline_matches_executed: baseline === event.action.id,
    shadow_matches_executed: proposal.action_id === event.action.id,
    policy: proposal.policy ?? 'unknown',
    policy_confidence: clamp01(proposal.confidence),
    policy_history_count: Math.max(0, finite(proposal.history_count, 0)),
    reward: finite(experience.reward.score, 0),
    actual_success: actualSuccess,
    epistemic_state: event.state.epistemic_state,
    evidence_authority: false,
  });
}

export function computeCalibrationMetrics(records, { bins = 10 } = {}) {
  if (!Number.isInteger(bins) || bins < 2) throw new TypeError('bins deve ser inteiro >= 2');
  const eligible = records.filter((record) => (
    record.shadow_matches_executed
    && typeof record.actual_success === 'boolean'
    && Number.isFinite(Number(record.policy_confidence))
  ));

  if (!eligible.length) {
    return Object.freeze({
      n: 0,
      brier: null,
      ece: null,
      bins: Object.freeze([]),
      scope: 'shadow-matched-only',
    });
  }

  const brier = mean(eligible.map((record) => {
    const target = record.actual_success ? 1 : 0;
    return (clamp01(record.policy_confidence) - target) ** 2;
  }));

  const buckets = Array.from({ length: bins }, (_, index) => ({ index, confidences: [], outcomes: [] }));
  for (const record of eligible) {
    const confidence = clamp01(record.policy_confidence);
    const index = Math.min(bins - 1, Math.floor(confidence * bins));
    buckets[index].confidences.push(confidence);
    buckets[index].outcomes.push(record.actual_success ? 1 : 0);
  }

  let ece = 0;
  const summaries = [];
  for (const bucket of buckets) {
    if (!bucket.confidences.length) continue;
    const avgConfidence = mean(bucket.confidences);
    const accuracy = mean(bucket.outcomes);
    const weight = bucket.confidences.length / eligible.length;
    ece += weight * Math.abs(avgConfidence - accuracy);
    summaries.push(Object.freeze({
      bin: bucket.index,
      n: bucket.confidences.length,
      avg_confidence: round(avgConfidence),
      accuracy: round(accuracy),
      calibration_gap: round(Math.abs(avgConfidence - accuracy)),
    }));
  }

  return Object.freeze({
    n: eligible.length,
    brier: round(brier),
    ece: round(ece),
    bins: Object.freeze(summaries),
    scope: 'shadow-matched-only',
  });
}

function performanceKey(stage, action) {
  return `${stage}\u0000${action}`;
}

export function buildPerformanceMatrix(records) {
  const groups = new Map();
  for (const record of records) {
    const key = performanceKey(record.stage, record.executed_action);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(record);
  }

  const rows = [];
  for (const [key, items] of groups.entries()) {
    const [stage, action] = key.split('\u0000');
    const successItems = items.filter((item) => typeof item.actual_success === 'boolean');
    const matched = items.filter((item) => item.shadow_matches_executed);
    rows.push(Object.freeze({
      stage,
      action,
      n: items.length,
      mean_reward: round(mean(items.map((item) => item.reward))),
      success_rate: successItems.length
        ? round(mean(successItems.map((item) => (item.actual_success ? 1 : 0))))
        : null,
      shadow_match_n: matched.length,
      mean_shadow_confidence: matched.length
        ? round(mean(matched.map((item) => item.policy_confidence)))
        : null,
    }));
  }

  rows.sort((left, right) => left.stage.localeCompare(right.stage) || left.action.localeCompare(right.action));
  return Object.freeze(rows);
}

function trainingMeans(records, minActionSupport = 2) {
  const matrix = buildPerformanceMatrix(records);
  const means = new Map();
  const bestByStage = new Map();
  for (const row of matrix) {
    if (row.n < minActionSupport || row.mean_reward === null) continue;
    means.set(performanceKey(row.stage, row.action), row.mean_reward);
    const current = bestByStage.get(row.stage);
    if (current === undefined || row.mean_reward > current) bestByStage.set(row.stage, row.mean_reward);
  }
  return { matrix, means, bestByStage };
}

function estimateHoldout(records, model) {
  const baselineValues = [];
  const shadowValues = [];
  const baselineRegrets = [];
  const shadowRegrets = [];
  const pairedDeltas = [];

  for (const record of records) {
    const best = model.bestByStage.get(record.stage);
    const baseline = model.means.get(performanceKey(record.stage, record.baseline_action));
    const shadow = model.means.get(performanceKey(record.stage, record.shadow_action));
    if (baseline !== undefined) baselineValues.push(baseline);
    if (shadow !== undefined) shadowValues.push(shadow);
    if (best !== undefined && baseline !== undefined) baselineRegrets.push(best - baseline);
    if (best !== undefined && shadow !== undefined) shadowRegrets.push(best - shadow);
    if (baseline !== undefined && shadow !== undefined) pairedDeltas.push(shadow - baseline);
  }

  return Object.freeze({
    comparable_n: pairedDeltas.length,
    estimated_baseline_reward: round(mean(baselineValues)),
    estimated_shadow_reward: round(mean(shadowValues)),
    estimated_reward_delta: round(mean(pairedDeltas)),
    estimated_reward_delta_ci95: bootstrapMeanCI(pairedDeltas),
    estimated_baseline_regret: round(mean(baselineRegrets)),
    estimated_shadow_regret: round(mean(shadowRegrets)),
    note: 'model-based observational estimate from training-stage action means; not a causal counterfactual',
  });
}

export function evaluateOfflinePolicy(records, {
  trainFraction = 0.70,
  minActionSupport = 2,
  calibrationBins = 10,
} = {}) {
  if (!Array.isArray(records)) throw new TypeError('records deve ser array');
  const valid = records.filter((record) => record?.schema === OFFLINE_DECISION_SCHEMA);
  if (valid.length < 2) {
    return Object.freeze({
      schema: OFFLINE_EVALUATION_SCHEMA,
      status: 'insufficient_data',
      total_records: valid.length,
      caveat: 'offline evaluation requires more decision records',
    });
  }
  if (!(trainFraction > 0 && trainFraction < 1)) throw new TypeError('trainFraction deve estar em (0,1)');

  const ordered = [...valid].sort((left, right) => String(left.decided_at).localeCompare(String(right.decided_at)));
  const split = Math.max(1, Math.min(ordered.length - 1, Math.floor(ordered.length * trainFraction)));
  const train = ordered.slice(0, split);
  const holdout = ordered.slice(split);
  const model = trainingMeans(train, minActionSupport);
  const estimate = estimateHoldout(holdout, model);

  const baselineLogged = holdout.filter((record) => record.baseline_matches_executed);
  const shadowMatched = holdout.filter((record) => record.shadow_matches_executed);
  const agreement = holdout.filter((record) => record.baseline_action === record.shadow_action);

  return Object.freeze({
    schema: OFFLINE_EVALUATION_SCHEMA,
    status: 'evaluated',
    methodology: 'temporal-holdout-observational-v1',
    total_records: ordered.length,
    train_records: train.length,
    holdout_records: holdout.length,
    train_fraction: trainFraction,
    baseline: Object.freeze({
      logged_n: baselineLogged.length,
      logged_mean_reward: round(mean(baselineLogged.map((record) => record.reward))),
    }),
    shadow: Object.freeze({
      matched_n: shadowMatched.length,
      coverage: round(shadowMatched.length / holdout.length),
      matched_mean_reward: round(mean(shadowMatched.map((record) => record.reward))),
      agreement_with_baseline: round(agreement.length / holdout.length),
    }),
    calibration: computeCalibrationMetrics(holdout, { bins: calibrationBins }),
    estimate,
    training_matrix: model.matrix,
    holdout_matrix: buildPerformanceMatrix(holdout),
    caveats: Object.freeze([
      'shadow outcomes are directly observed only when shadow_action equals executed_action',
      'estimated reward/regret uses training action means and is observational, not causal',
      'promotion criteria are governance baselines and require project-specific calibration',
    ]),
  });
}

export function evaluatePromotionReadiness(evaluation, {
  drift = { detected: false, status: 'unknown' },
  ledger = { valid: true },
  thresholds = {},
} = {}) {
  const effective = Object.freeze({ ...DEFAULT_OFFLINE_PROMOTION_THRESHOLDS, ...thresholds });
  const reasons = [];

  if (!evaluation || evaluation.status !== 'evaluated') reasons.push('offline-evaluation-unavailable');
  if (evaluation?.total_records < effective.minRecords) reasons.push('insufficient-records');
  if (evaluation?.shadow?.matched_n < effective.minMatchedShadow) reasons.push('insufficient-shadow-matches');
  if ((evaluation?.shadow?.coverage ?? 0) < effective.minShadowCoverage) reasons.push('low-shadow-coverage');
  if (evaluation?.calibration?.brier === null || evaluation.calibration.brier > effective.maxBrier) reasons.push('brier-above-threshold');
  if (evaluation?.calibration?.ece === null || evaluation.calibration.ece > effective.maxEce) reasons.push('ece-above-threshold');
  if (evaluation?.estimate?.estimated_shadow_regret === null
    || evaluation.estimate.estimated_shadow_regret > effective.maxEstimatedShadowRegret) {
    reasons.push('estimated-shadow-regret-high');
  }
  const deltaLow = evaluation?.estimate?.estimated_reward_delta_ci95?.low;
  if (deltaLow === null || deltaLow === undefined || deltaLow < effective.minEstimatedRewardDelta) {
    reasons.push('reward-delta-ci-not-positive-enough');
  }
  if (drift.detected) reasons.push('drift-detected');
  if (ledger.valid !== true) reasons.push('ledger-invalid');

  return Object.freeze({
    eligible_for_activation_request: reasons.length === 0,
    auto_activate: false,
    reasons: Object.freeze(reasons),
    thresholds: effective,
    epistemic_authority: false,
    note: 'readiness only permits requesting activation; it never activates a policy automatically',
  });
}
