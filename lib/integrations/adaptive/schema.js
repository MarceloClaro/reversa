import {
  ACME_EXPERIENCE_SCHEMA,
  EPISTEMIC_STATES,
  HUMAN_SOURCE_STATES,
  LEARNING_EVENT_SCHEMA,
  MCI_ENVELOPE_SCHEMA,
} from './constants.js';

function finiteOrNull(value) {
  return value === null || value === undefined || Number.isFinite(Number(value));
}

function inUnitIntervalOrNull(value) {
  return value === null || value === undefined || (
    Number.isFinite(Number(value)) && Number(value) >= 0 && Number(value) <= 1
  );
}

function nonNegativeIntegerOrNull(value) {
  return value === null || value === undefined || (
    Number.isInteger(Number(value)) && Number(value) >= 0
  );
}

function result(errors) {
  return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
}

export function validateLearningEvent(event) {
  const errors = [];
  if (!event || typeof event !== 'object') return result(['event must be an object']);
  if (event.schema !== LEARNING_EVENT_SCHEMA) errors.push('invalid learning event schema');
  if (typeof event.event_id !== 'string' || !event.event_id.trim()) errors.push('event_id required');
  if (typeof event.timestamp !== 'string' || Number.isNaN(Date.parse(event.timestamp))) errors.push('valid timestamp required');
  if (typeof event.task_id !== 'string' || !event.task_id.trim()) errors.push('task_id required');
  if (typeof event.stage !== 'string' || !event.stage.trim()) errors.push('stage required');
  if (!event.state || typeof event.state !== 'object') {
    errors.push('state required');
  } else {
    if (!EPISTEMIC_STATES.includes(event.state.epistemic_state)) errors.push('invalid epistemic_state');
    if (event.state.human_source_state !== null
      && event.state.human_source_state !== undefined
      && !HUMAN_SOURCE_STATES.includes(event.state.human_source_state)) {
      errors.push('invalid human_source_state');
    }
    if (!finiteOrNull(event.state.feynman_score)) errors.push('feynman_score must be finite or null');
    else if (event.state.feynman_score !== null
      && event.state.feynman_score !== undefined
      && (Number(event.state.feynman_score) < 0 || Number(event.state.feynman_score) > 12)) {
      errors.push('feynman_score must be in [0,12] or null');
    }
    if (!nonNegativeIntegerOrNull(event.state.high_findings)) errors.push('high_findings must be a non-negative integer');
    if (!nonNegativeIntegerOrNull(event.state.critical_findings)) errors.push('critical_findings must be a non-negative integer');
    if (!nonNegativeIntegerOrNull(event.state.blocked_count)) errors.push('blocked_count must be a non-negative integer');
    if (!inUnitIntervalOrNull(event.state.confidence)) errors.push('confidence must be in [0,1] or null');
    if (!inUnitIntervalOrNull(event.state.trust)) errors.push('trust must be in [0,1] or null');
  }
  if (!event.action || typeof event.action !== 'object' || typeof event.action.id !== 'string' || !event.action.id.trim()) {
    errors.push('action.id required');
  }
  if (!event.outcome || typeof event.outcome !== 'object' || Array.isArray(event.outcome)) errors.push('outcome object required');
  if (!event.metadata || typeof event.metadata !== 'object' || Array.isArray(event.metadata)) errors.push('metadata object required');
  return result(errors);
}

export function validateMciEnvelope(envelope) {
  const errors = [];
  if (!envelope || typeof envelope !== 'object') return result(['envelope must be an object']);
  if (envelope.schema !== MCI_ENVELOPE_SCHEMA) errors.push('invalid MCI envelope schema');
  if (envelope.source !== 'ReversaFeynman') errors.push('unexpected MCI source');
  if (typeof envelope.task_id !== 'string' || !envelope.task_id.trim()) errors.push('task_id required');
  if (!envelope.epistemic || !EPISTEMIC_STATES.includes(envelope.epistemic.state)) errors.push('valid epistemic state required');
  if (!envelope.metacognition || typeof envelope.metacognition !== 'object') {
    errors.push('metacognition required');
  } else {
    if (!inUnitIntervalOrNull(envelope.metacognition.confidence)) errors.push('confidence must be in [0,1] or null');
    if (!inUnitIntervalOrNull(envelope.metacognition.trust)) errors.push('trust must be in [0,1] or null');
    if (!Array.isArray(envelope.metacognition.required_gates)) errors.push('required_gates must be an array');
    else if (envelope.metacognition.required_gates.some((gate) => !/^FEG-0[1-7]$/.test(gate))) {
      errors.push('required_gates contains invalid FEG id');
    }
  }
  if (!envelope.provenance || typeof envelope.provenance.event_id !== 'string') errors.push('provenance.event_id required');
  return result(errors);
}

export function validateAcmeExperience(experience) {
  const errors = [];
  if (!experience || typeof experience !== 'object') return result(['experience must be an object']);
  if (experience.schema !== ACME_EXPERIENCE_SCHEMA) errors.push('invalid ACME experience schema');
  if (!experience.observation || !Array.isArray(experience.observation.vector)) {
    errors.push('observation.vector required');
  } else {
    if (experience.observation.vector.length !== 7) errors.push('observation.vector must have 7 dimensions');
    if (experience.observation.vector.some((value) => !Number.isFinite(Number(value)))) errors.push('observation.vector must be finite');
  }
  if (!experience.action || typeof experience.action.id !== 'string' || !experience.action.id.trim()) errors.push('action.id required');
  if (typeof experience.action?.allowed !== 'boolean') errors.push('action.allowed must be boolean');
  if (typeof experience.action?.requires_approval !== 'boolean') errors.push('action.requires_approval must be boolean');
  if (!experience.reward || !Number.isFinite(Number(experience.reward.score))) errors.push('reward.score required');
  else if (Number(experience.reward.score) < -1 || Number(experience.reward.score) > 1) errors.push('reward.score must be in [-1,1]');
  if (!experience.extras || experience.extras.evidence_authority !== false) errors.push('evidence_authority must be false');
  if (typeof experience.extras?.event_id !== 'string' || !experience.extras.event_id.trim()) errors.push('extras.event_id required');
  return result(errors);
}

export function assertValid(value, validator, label = 'contract') {
  const checked = validator(value);
  if (!checked.valid) {
    throw new TypeError(`${label} inválido: ${checked.errors.join('; ')}`);
  }
  return value;
}
