import { validateAcmeExperience } from './schema.js';

function mean(values) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function observedShare(items) {
  if (!items.length) return 0;
  return items.filter((item) => item.observation?.labels?.epistemic_state === 'OBSERVED').length / items.length;
}

export function detectAdaptiveDrift(experiences, {
  referenceSize = 40,
  recentSize = 15,
  rewardDelta = 0.25,
  confidenceDelta = 0.20,
  observedShareDelta = 0.30,
} = {}) {
  if (!Array.isArray(experiences)) throw new TypeError('experiences deve ser array');
  const valid = experiences.filter((item) => validateAcmeExperience(item).valid);
  const minimum = referenceSize + recentSize;
  if (valid.length < minimum) {
    return Object.freeze({
      detected: false,
      status: 'insufficient_data',
      sample_size: valid.length,
      required: minimum,
      metrics: Object.freeze({}),
    });
  }

  const recent = valid.slice(-recentSize);
  const reference = valid.slice(-(recentSize + referenceSize), -recentSize);
  const refReward = mean(reference.map((item) => Number(item.reward.score)));
  const recentReward = mean(recent.map((item) => Number(item.reward.score)));
  const refConfidence = mean(reference.map((item) => Number(item.observation.vector?.[5] ?? 0.5)));
  const recentConfidence = mean(recent.map((item) => Number(item.observation.vector?.[5] ?? 0.5)));
  const refObserved = observedShare(reference);
  const recentObserved = observedShare(recent);

  const metrics = Object.freeze({
    reward_delta: Number((recentReward - refReward).toFixed(6)),
    confidence_delta: Number((recentConfidence - refConfidence).toFixed(6)),
    observed_share_delta: Number((recentObserved - refObserved).toFixed(6)),
  });
  const reasons = [];
  if (Math.abs(metrics.reward_delta) >= rewardDelta) reasons.push('reward drift');
  if (Math.abs(metrics.confidence_delta) >= confidenceDelta) reasons.push('confidence drift');
  if (Math.abs(metrics.observed_share_delta) >= observedShareDelta) reasons.push('epistemic mix drift');

  return Object.freeze({
    detected: reasons.length > 0,
    status: reasons.length ? 'drift' : 'stable',
    sample_size: valid.length,
    reference_size: reference.length,
    recent_size: recent.length,
    metrics,
    reasons: Object.freeze(reasons),
  });
}
