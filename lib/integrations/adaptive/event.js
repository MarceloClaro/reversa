import { randomUUID } from 'node:crypto';
import {
  HUMAN_SOURCE_STATES,
  LEARNING_EVENT_SCHEMA,
} from './constants.js';
import { assertEpistemicState } from './evidence-guard.js';
import { validateLearningEvent } from './schema.js';

function asFiniteNumber(value, fallback = null) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function unitOrNull(value, label) {
  if (value === null || value === undefined) return null;
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0 || number > 1) {
    throw new TypeError(`${label} deve estar em [0,1]`);
  }
  return number;
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
  if (Number.isNaN(Date.parse(timestamp))) {
    throw new TypeError('timestamp inválido');
  }

  const evidenceState = assertEpistemicState(epistemic.state ?? 'UNVERIFIED');
  const humanState = epistemic.humanSourceState ?? null;
  if (humanState !== null && !HUMAN_SOURCE_STATES.includes(humanState)) {
    throw new TypeError(`estado humano inválido: ${humanState}`);
  }

  const { eventId, ...cleanMetadata } = metadata;
  const event = Object.freeze({
    schema: LEARNING_EVENT_SCHEMA,
    event_id: eventId ?? randomUUID(),
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
      confidence: unitOrNull(confidence.calibrated, 'confidence.calibrated'),
      trust: unitOrNull(confidence.trust, 'confidence.trust'),
    }),
    action: Object.freeze({ ...action }),
    outcome: Object.freeze({ ...outcome }),
    metadata: Object.freeze(cleanMetadata),
  });

  const validation = validateLearningEvent(event);
  if (!validation.valid) {
    throw new TypeError(`learning event inválido: ${validation.errors.join('; ')}`);
  }
  return event;
}

export function isLearningEvent(value) {
  return validateLearningEvent(value).valid;
}
