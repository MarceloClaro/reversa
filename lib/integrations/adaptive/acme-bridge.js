import {
  ACME_EXPERIENCE_SCHEMA,
  DEFAULT_ADAPTIVE_ACTIONS,
  MUTATING_ADAPTIVE_ACTIONS,
} from './constants.js';
import { isLearningEvent } from './event.js';
import { computeAdaptiveReward } from './reward.js';

const EPISTEMIC_ENCODING = Object.freeze({
  OBSERVED: 1.0,
  INFERRED: 0.5,
  UNVERIFIED: 0.0,
  BLOCKED: -1.0,
});

function finite(value, fallback = 0) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function unit(value, fallback = 0.5) {
  return Math.max(0, Math.min(1, finite(value, fallback)));
}

export function buildAcmeObservation(event) {
  if (!isLearningEvent(event)) {
    throw new TypeError('evento Reversa inválido');
  }

  return Object.freeze({
    task_id: event.task_id,
    stage: event.stage,
    vector: Object.freeze([
      EPISTEMIC_ENCODING[event.state.epistemic_state] ?? 0,
      Math.max(0, Math.min(1, finite(event.state.feynman_score) / 12)),
      Math.min(1, finite(event.state.high_findings) / 5),
      Math.min(1, finite(event.state.critical_findings) / 3),
      Math.min(1, finite(event.state.blocked_count) / 5),
      unit(event.state.confidence),
      unit(event.state.trust),
    ]),
    labels: Object.freeze({
      epistemic_state: event.state.epistemic_state,
      human_source_state: event.state.human_source_state,
    }),
  });
}

export function validateAdaptiveAction(actionId, allowedActions = DEFAULT_ADAPTIVE_ACTIONS) {
  if (typeof actionId !== 'string' || !actionId.trim()) {
    throw new TypeError('actionId inválido');
  }
  if (!Array.isArray(allowedActions)) {
    throw new TypeError('allowedActions deve ser um array');
  }
  if (!allowedActions.includes(actionId)) {
    return Object.freeze({
      allowed: false,
      action_id: actionId,
      requires_approval: false,
      reason: 'ação fora da allowlist adaptativa',
    });
  }
  return Object.freeze({
    allowed: true,
    action_id: actionId,
    requires_approval: MUTATING_ADAPTIVE_ACTIONS.includes(actionId),
    reason: MUTATING_ADAPTIVE_ACTIONS.includes(actionId)
      ? 'allowlisted, mas sujeita aos gates de aprovação do workflow'
      : 'allowlisted',
  });
}

export function buildAcmeExperience(event, options = {}) {
  if (!isLearningEvent(event)) {
    throw new TypeError('evento Reversa inválido');
  }

  const actionDecision = validateAdaptiveAction(
    event.action.id,
    options.allowedActions ?? DEFAULT_ADAPTIVE_ACTIONS,
  );
  const reward = computeAdaptiveReward(event.outcome, options.weights);

  return Object.freeze({
    schema: ACME_EXPERIENCE_SCHEMA,
    observation: buildAcmeObservation(event),
    action: Object.freeze({
      id: event.action.id,
      allowed: actionDecision.allowed,
      requires_approval: actionDecision.requires_approval,
      parameters: Object.freeze({ ...(event.action.parameters ?? {}) }),
    }),
    reward,
    terminal: Boolean(event.outcome.terminal),
    extras: Object.freeze({
      event_id: event.event_id,
      evidence_authority: false,
      note: 'reward/policy never promotes claims to OBSERVED',
    }),
  });
}

export function createAcmeBridge({ transport, allowedActions = DEFAULT_ADAPTIVE_ACTIONS, weights } = {}) {
  if (transport !== undefined && typeof transport !== 'function') {
    throw new TypeError('transport deve ser função assíncrona/síncrona');
  }

  return Object.freeze({
    buildExperience(event) {
      return buildAcmeExperience(event, { allowedActions, weights });
    },
    validateAction(actionId) {
      return validateAdaptiveAction(actionId, allowedActions);
    },
    async submit(event) {
      const experience = buildAcmeExperience(event, { allowedActions, weights });
      if (!experience.action.allowed) {
        return Object.freeze({
          sent: false,
          experience,
          reason: 'policy action rejected by safety allowlist',
        });
      }
      if (!transport) {
        return Object.freeze({ sent: false, experience, reason: 'no transport configured' });
      }
      const response = await transport(experience);
      return Object.freeze({ sent: true, experience, response });
    },
  });
}
