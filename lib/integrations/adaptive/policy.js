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
  if (!Array.isArray(candidateActions) || candidateActions.length === 0) {
    throw new TypeError('candidateActions deve conter ações');
  }

  const valid = experiences.filter((item) => validateAcmeExperience(item).valid);
  const ranked = candidateActions.map((actionId) => {
    const samples = valid.filter((item) => item.action.id === actionId);
    let weightedReward = 0;
    let weightSum = 0;
    for (const item of samples) {
      const weight = similarity(observation.vector, item.observation.vector);
      weightedReward += Number(item.reward.score) * weight;
      weightSum += weight;
    }
    const empirical = weightSum > 0 ? weightedReward / weightSum : 0;
    const uncertaintyBonus = Number(exploration) / Math.sqrt(samples.length + 1);
    return Object.freeze({
      action_id: actionId,
      samples: samples.length,
      empirical_reward: Number(empirical.toFixed(6)),
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
  const actionDecision = validateAdaptiveAction(winner.action_id, candidateActions);
  const confidence = winner.samples === 0
    ? 0
    : Math.max(0, Math.min(1, (winner.empirical_reward + 1) / 2));

  return Object.freeze({
    policy: 'contextual-shadow-v1',
    mode: 'shadow',
    action_id: winner.action_id,
    confidence: Number(confidence.toFixed(6)),
    history_count: experiences.length,
    evidence_authority: false,
    allowed: actionDecision.allowed,
    requires_approval: actionDecision.requires_approval,
    ranking,
  });
}
