import {
  HERMES_EXECUTION_RESULT_SCHEMA,
  HERMES_EXECUTION_STATUSES,
  HERMES_MEMORY_EPISTEMIC_STATES,
  HERMES_MEMORY_EVENT_SCHEMA,
  HERMES_MEMORY_KINDS,
  HERMES_MEMORY_SCOPES,
  HERMES_SKILL_PROPOSAL_SCHEMA,
  HERMES_STEP_STATUSES,
  HERMES_TRAJECTORY_SCHEMA,
  HERMES_TRAJECTORY_STATUSES,
} from './constants.js';

function result(errors) {
  return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
}

function validTimestamp(value) {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}

function inUnitIntervalOrNull(value) {
  return value === null || value === undefined || (
    typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1
  );
}

function nonNegativeInteger(value) {
  return Number.isInteger(value) && value >= 0;
}

function nonNegativeFiniteOrNull(value) {
  return value === null || value === undefined || (
    typeof value === 'number' && Number.isFinite(value) && value >= 0
  );
}

function stringArray(value) {
  return Array.isArray(value) && value.every((item) => typeof item === 'string' && item.trim());
}

function safeSkillId(value) {
  return typeof value === 'string'
    && /^[A-Za-z0-9][A-Za-z0-9._:-]*$/.test(value)
    && !value.includes('..');
}

export function validateHermesMemoryEvent(memory) {
  const errors = [];
  if (!memory || typeof memory !== 'object') return result(['memory must be an object']);
  if (memory.schema !== HERMES_MEMORY_EVENT_SCHEMA) errors.push('invalid Hermes memory schema');
  if (typeof memory.memory_id !== 'string' || !memory.memory_id.trim()) errors.push('memory_id required');
  if (!validTimestamp(memory.timestamp)) errors.push('valid timestamp required');
  if (!HERMES_MEMORY_SCOPES.includes(memory.scope)) errors.push('invalid memory scope');
  if (!HERMES_MEMORY_KINDS.includes(memory.kind)) errors.push('invalid memory kind');
  if (typeof memory.content !== 'string' || !memory.content.trim()) errors.push('content required');
  if (!stringArray(memory.source_refs)) errors.push('source_refs must be a string array');
  if (!inUnitIntervalOrNull(memory.confidence)) errors.push('confidence must be in [0,1] or null');
  if (!HERMES_MEMORY_EPISTEMIC_STATES.includes(memory.epistemic_state)) {
    errors.push('Hermes memory epistemic state must be INFERRED, UNVERIFIED or BLOCKED; OBSERVED is forbidden');
  }
  if (memory.evidence_authority !== false) errors.push('evidence_authority must be false');
  if (memory.metadata !== undefined && (typeof memory.metadata !== 'object' || memory.metadata === null || Array.isArray(memory.metadata))) {
    errors.push('metadata must be an object');
  }
  return result(errors);
}

export function validateHermesSkillProposal(proposal) {
  const errors = [];
  if (!proposal || typeof proposal !== 'object') return result(['proposal must be an object']);
  if (proposal.schema !== HERMES_SKILL_PROPOSAL_SCHEMA) errors.push('invalid Hermes skill proposal schema');
  if (typeof proposal.proposal_id !== 'string' || !proposal.proposal_id.trim()) errors.push('proposal_id required');
  if (!validTimestamp(proposal.timestamp)) errors.push('valid timestamp required');
  if (!safeSkillId(proposal.skill_id)) errors.push('skill_id must be a safe identifier without path separators or traversal');
  if (typeof proposal.change_summary !== 'string' || !proposal.change_summary.trim()) errors.push('change_summary required');
  if (typeof proposal.proposal !== 'string' || !proposal.proposal.trim()) errors.push('proposal required');
  if (!stringArray(proposal.source_refs)) errors.push('source_refs must be a string array');
  if (!proposal.metrics || typeof proposal.metrics !== 'object') {
    errors.push('metrics required');
  } else {
    if (!nonNegativeInteger(proposal.metrics.successes)) errors.push('metrics.successes must be a non-negative integer');
    if (!nonNegativeInteger(proposal.metrics.failures)) errors.push('metrics.failures must be a non-negative integer');
  }
  if (!inUnitIntervalOrNull(proposal.confidence)) errors.push('confidence must be in [0,1] or null');
  if (proposal.mode !== 'shadow') errors.push('skill proposal mode must be shadow');
  if (proposal.requires_review !== true) errors.push('requires_review must be true');
  if (proposal.requires_tests !== true) errors.push('requires_tests must be true');
  if (proposal.evidence_authority !== false) errors.push('evidence_authority must be false');
  return result(errors);
}

export function validateHermesTrajectory(trajectory) {
  const errors = [];
  if (!trajectory || typeof trajectory !== 'object') return result(['trajectory must be an object']);
  if (trajectory.schema !== HERMES_TRAJECTORY_SCHEMA) errors.push('invalid Hermes trajectory schema');
  if (typeof trajectory.trajectory_id !== 'string' || !trajectory.trajectory_id.trim()) errors.push('trajectory_id required');
  if (typeof trajectory.task_id !== 'string' || !trajectory.task_id.trim()) errors.push('task_id required');
  if (!validTimestamp(trajectory.started_at)) errors.push('valid started_at required');
  if (trajectory.ended_at !== null && trajectory.ended_at !== undefined && !validTimestamp(trajectory.ended_at)) {
    errors.push('ended_at must be a valid timestamp or null');
  }
  if (validTimestamp(trajectory.started_at) && validTimestamp(trajectory.ended_at)
    && Date.parse(trajectory.ended_at) < Date.parse(trajectory.started_at)) {
    errors.push('ended_at must not be earlier than started_at');
  }
  if (!HERMES_TRAJECTORY_STATUSES.includes(trajectory.status)) errors.push('invalid trajectory status');
  if (!Array.isArray(trajectory.steps)) {
    errors.push('steps must be an array');
  } else {
    trajectory.steps.forEach((step, index) => {
      if (!step || typeof step !== 'object') {
        errors.push(`step ${index} must be an object`);
        return;
      }
      if (step.index !== index) errors.push(`step index/order invalid at position ${index}`);
      if (typeof step.action !== 'string' || !step.action.trim()) errors.push(`step ${index} action required`);
      if (step.tool !== null && step.tool !== undefined && (typeof step.tool !== 'string' || !step.tool.trim())) {
        errors.push(`step ${index} tool must be string or null`);
      }
      if (!HERMES_STEP_STATUSES.includes(step.status)) errors.push(`step ${index} status invalid`);
      if (!nonNegativeFiniteOrNull(step.duration_ms)) errors.push(`step ${index} duration_ms invalid`);
    });
  }
  if (trajectory.evidence_authority !== false) errors.push('evidence_authority must be false');
  return result(errors);
}

export function validateHermesExecutionResult(execution) {
  const errors = [];
  if (!execution || typeof execution !== 'object') return result(['execution must be an object']);
  if (execution.schema !== HERMES_EXECUTION_RESULT_SCHEMA) errors.push('invalid Hermes execution result schema');
  if (typeof execution.execution_id !== 'string' || !execution.execution_id.trim()) errors.push('execution_id required');
  if (typeof execution.task_id !== 'string' || !execution.task_id.trim()) errors.push('task_id required');
  if (!validTimestamp(execution.timestamp)) errors.push('valid timestamp required');
  if (!HERMES_EXECUTION_STATUSES.includes(execution.status)) errors.push('invalid execution status');
  if (typeof execution.action_id !== 'string' || !execution.action_id.trim()) errors.push('action_id required');
  if (!stringArray(execution.artifacts)) errors.push('artifacts must be a string array');
  if (!execution.tests || typeof execution.tests !== 'object' || Array.isArray(execution.tests)) errors.push('tests object required');
  if (!execution.metrics || typeof execution.metrics !== 'object' || Array.isArray(execution.metrics)) errors.push('metrics object required');
  if (!Array.isArray(execution.direct_evidence)) {
    errors.push('direct_evidence must be an array');
  } else {
    execution.direct_evidence.forEach((item, index) => {
      if (!item || typeof item !== 'object') {
        errors.push(`direct_evidence ${index} must be an object`);
        return;
      }
      if (typeof item.kind !== 'string' || !item.kind.trim()) errors.push(`direct_evidence ${index} kind required`);
      if (typeof item.ref !== 'string' || !item.ref.trim()) errors.push(`direct_evidence ${index} ref required`);
      if (item.direct !== true) errors.push(`direct_evidence ${index} direct must be true`);
      if (item.claim_id !== undefined && (typeof item.claim_id !== 'string' || !item.claim_id.trim())) {
        errors.push(`direct_evidence ${index} claim_id invalid`);
      }
    });
  }
  if (execution.evidence_authority !== false) errors.push('evidence_authority must be false');
  return result(errors);
}

export function assertHermesValid(value, validator, label = 'Hermes contract') {
  const checked = validator(value);
  if (!checked.valid) throw new TypeError(`${label} inválido: ${checked.errors.join('; ')}`);
  return value;
}
