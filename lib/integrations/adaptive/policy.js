import { validateAdaptiveAction } from './acme-bridge.js';
import { validateAcmeExperience } from './schema.js';

function distance(a = [], b = []) {
  const size = Math.max(a.length, b.length);
  let total = 0;
  for (let index = 0; index < size; index += 1) {
    const delta = Number(a[index] ?? 0) - Number(b[index] ?? 0);
    total += delta * delta;
  }
  return Math.sqrt(total);
}

function similarity(a, b) {
  return 1 / (1 + distance(a, b));
}

function safeCandidates(candidateActions) {
  if (!Array.isArray(candidateActions) || candidateActions.length === 0) {
    throw new TypeError('candidateActions deve conter ações');
  }
  const unique = [...new Set(candidateActions)];
  const safe = unique.filter((actionId) => validateAdaptiveAction(actionId).allowed);
  if (safe.length === 0) {
    throw new TypeError('nenhuma candidateAction pertence à allowlist adaptativa');
  }
  return safe;
}

export function rankContextualActions({
  observation,
  experiences = [],
  candidateActions = [],
  exploration = 0.15,
} = {}) {
  if (!observation || !Array.isArray(observation.vector)) {
    throw new TypeError('observation.vector é obrigatório');
  }
  if (!Array.isArray(experiences)) throw new TypeError('experiences deve ser array');

  const safeActions = safeCandidates(candidateActions);
  const valid = experiences.filter((item) => validateAcmeExperience(item).valid);
  const ranked = safeActions.map((actionId) => {
    const samples = valid.filter((item) => item.action.id === actionId);
    let weightedReward = 0;
    let rewardWeightSum = 0;
    let weightedSuccess = 0;
    let successWeightSum = 0;
    let successSamples = 0;

    for (const item of samples) {
      const weight = similarity(observation.vector, item.observation.vector);
      weightedReward += Number(item.reward.score) * weight;
      rewardWeightSum += weight;
      if (typeof item.extras?.actual_success === 'boolean') {
        weightedSuccess += (item.extras.actual_success ? 1 : 0) * weight;
        successWeightSum += weight;
        successSamples += 1;
      }
    }

    const empirical = rewardWeightSum > 0 ? weightedReward / rewardWeightSum : 0;
    const predictedSuccess = successWeightSum > 0 ? weightedSuccess / successWeightSum : null;
    const uncertaintyBonus = Number(exploration) / Math.sqrt(samples.length + 1);
    return Object.freeze({
      action_id: actionId,
      samples: samples.length,
      success_samples: successSamples,
      empirical_reward: Number(empirical.toFixed(6)),
      predicted_success: predictedSuccess === null ? null : Number(predictedSuccess.toFixed(6)),
      uncertainty_bonus: Number(uncertaintyBonus.toFixed(6)),
      score: Number((empirical + uncertaintyBonus).toFixed(6)),
    });
  });

  return Object.freeze(ranked.sort((left, right) => {
    if (right.score !== left.score) return right.score - left.score;
    return left.action_id.localeCompare(right.action_id);
  }));
}

export function proposeShadowAction({
  observation,
  experiences = [],
  candidateActions = [],
  exploration = 0.15,
} = {}) {
  const ranking = rankContextualActions({ observation, experiences, candidateActions, exploration });
  const winner = ranking[0];
  const actionDecision = validateAdaptiveAction(winner.action_id);
  const confidence = winner.predicted_success ?? 0;

  return Object.freeze({
    policy: 'contextual-shadow-v1',
    mode: 'shadow',
    action_id: winner.action_id,
    confidence: Number(confidence.toFixed(6)),
    confidence_semantics: 'estimated-success-probability',
    utility_score: winner.score,
    history_count: experiences.length,
    evidence_authority: false,
    allowed: actionDecision.allowed,
    requires_approval: actionDecision.requires_approval,
    ranking,
  });
}
