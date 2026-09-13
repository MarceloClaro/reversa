export const HERMES_MEMORY_EVENT_SCHEMA = 'reversa.hermes.memory/v1';
export const HERMES_SKILL_PROPOSAL_SCHEMA = 'reversa.hermes.skill.proposal/v1';
export const HERMES_TRAJECTORY_SCHEMA = 'reversa.hermes.trajectory/v1';
export const HERMES_EXECUTION_RESULT_SCHEMA = 'reversa.hermes.execution.result/v1';

export const HERMES_MEMORY_SCOPES = Object.freeze([
  'project',
  'personalization',
  'execution',
]);

export const HERMES_MEMORY_KINDS = Object.freeze([
  'fact',
  'decision',
  'preference',
  'procedure',
  'session-summary',
  'observation',
]);

export const HERMES_MEMORY_EPISTEMIC_STATES = Object.freeze([
  'INFERRED',
  'UNVERIFIED',
  'BLOCKED',
]);

export const HERMES_TRAJECTORY_STATUSES = Object.freeze([
  'running',
  'succeeded',
  'failed',
  'cancelled',
]);

export const HERMES_STEP_STATUSES = Object.freeze([
  'running',
  'succeeded',
  'failed',
  'cancelled',
]);

export const HERMES_EXECUTION_STATUSES = Object.freeze([
  'succeeded',
  'failed',
  'cancelled',
]);
