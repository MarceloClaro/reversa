export const LEARNING_EVENT_SCHEMA = 'reversa.learning.event/v1';
export const MCI_ENVELOPE_SCHEMA = 'reversa.mci.envelope/v1';
export const ACME_EXPERIENCE_SCHEMA = 'reversa.acme.experience/v1';
export const OFFLINE_DECISION_SCHEMA = 'reversa.offline.decision/v1';
export const OFFLINE_EVALUATION_SCHEMA = 'reversa.offline.evaluation/v1';
export const ADAPTIVE_REPORT_SCHEMA = 'reversa.adaptive.report/v1';

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

// Estar na allowlist significa que a política pode propor a ação; não significa
// que a ação possa ser executada sem os gates normais do workflow.
export const MUTATING_ADAPTIVE_ACTIONS = Object.freeze([
  'route:coding',
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

// Baseline de governança, não limiares cientificamente ótimos. Todos são
// configuráveis e devem ser recalibrados com dados do projeto.
export const DEFAULT_OFFLINE_PROMOTION_THRESHOLDS = Object.freeze({
  minRecords: 30,
  minMatchedShadow: 12,
  minShadowCoverage: 0.20,
  maxBrier: 0.25,
  maxEce: 0.20,
  maxEstimatedShadowRegret: 0.10,
  minEstimatedRewardDelta: 0.00,
});
