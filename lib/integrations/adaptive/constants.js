export const LEARNING_EVENT_SCHEMA = 'reversa.learning.event/v1';
export const MCI_ENVELOPE_SCHEMA = 'reversa.mci.envelope/v1';
export const ACME_EXPERIENCE_SCHEMA = 'reversa.acme.experience/v1';

export const EPISTEMIC_STATES = Object.freeze([
  'OBSERVED',
  'INFERRED',
  'UNVERIFIED',
  'BLOCKED',
]);

export const HUMAN_SOURCE_STATES = Object.freeze([
  'HUMAN-VALIDATED',
  'HUMAN-PARTIAL',
  'HUMAN-CONFLICT',
]);

export const DEFAULT_ADAPTIVE_ACTIONS = Object.freeze([
  'route:scout',
  'route:architect',
  'route:reviewer',
  'route:feynman',
  'route:teachback',
  'route:clarify',
  'route:audit',
  'route:coding',
  'strategy:sequential',
  'strategy:parallel',
  'control:request-evidence',
  'control:abstain',
]);

export const DIRECT_EVIDENCE_KINDS = Object.freeze([
  'code',
  'contract',
  'test',
  'execution',
  'log',
  'dataset',
  'artifact',
]);
