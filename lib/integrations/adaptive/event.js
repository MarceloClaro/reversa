import {
  HUMAN_SOURCE_STATES,
  LEARNING_EVENT_SCHEMA,
} from './constants.js';
import { assertEpistemicState } from './evidence-guard.js';

function asFiniteNumber(value, fallback = null) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

export function createLearningEvent({
  taskId,
  stage,
  epistemic = {},
  confidence = {},
  action,
  outcome = {},
  metadata = {},
  timestamp = new Date().toISOString(),
} = {}) {
  if (typeof taskId !== 'string' || !taskId.trim()) {
    throw new TypeError('taskId é obrigatório');
  }
  if (typeof stage !== 'string' || !stage.trim()) {
    throw new TypeError('stage é obrigatório');
  }
  if (!action || typeof action !== 'object' || typeof action.id !== 'string' || !action.id.trim()) {
    throw new TypeError('action.id é obrigatório');
  }

  const evidenceState = assertEpistemicState(epistemic.state ?? 'UNVERIFIED');
  const humanState = epistemic.humanSourceState ?? null;
  if (humanState !== null && !HUMAN_SOURCE_STATES.includes(humanState)) {
    throw new TypeError(`estado humano inválido: ${humanState}`);
  }

  return Object.freeze({
    schema: LEARNING_EVENT_SCHEMA,
    event_id: metadata.eventId ?? `${taskId}:${stage}:${Date.parse(timestamp)}`,
    timestamp,
    task_id: taskId,
    stage,
    state: Object.freeze({
      epistemic_state: evidenceState,
      human_source_state: humanState,
      feynman_score: asFiniteNumber(epistemic.feynmanScore),
      high_findings: Math.max(0, asFiniteNumber(epistemic.highFindings, 0)),
      critical_findings: Math.max(0, asFiniteNumber(epistemic.criticalFindings, 0)),
      blocked_count: Math.max(0, asFiniteNumber(epistemic.blockedCount, 0)),
      confidence: asFiniteNumber(confidence.calibrated),
      trust: asFiniteNumber(confidence.trust),
    }),
    action: Object.freeze({ ...action }),
    outcome: Object.freeze({ ...outcome }),
    metadata: Object.freeze({ ...metadata, eventId: undefined }),
  });
}

export function isLearningEvent(value) {
  return Boolean(
    value
      && value.schema === LEARNING_EVENT_SCHEMA
      && typeof value.task_id === 'string'
      && typeof value.stage === 'string'
      && value.action
      && typeof value.action.id === 'string',
  );
}
