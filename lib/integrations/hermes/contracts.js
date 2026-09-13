import { randomUUID } from 'node:crypto';

import {
  HERMES_EXECUTION_RESULT_SCHEMA,
  HERMES_MEMORY_EVENT_SCHEMA,
  HERMES_SKILL_PROPOSAL_SCHEMA,
  HERMES_TRAJECTORY_SCHEMA,
} from './constants.js';
import {
  assertHermesValid,
  validateHermesExecutionResult,
  validateHermesMemoryEvent,
  validateHermesSkillProposal,
  validateHermesTrajectory,
} from './schema.js';

function freezeArray(items) {
  return Object.freeze(items.map((item) => (
    item && typeof item === 'object' && !Array.isArray(item)
      ? Object.freeze({ ...item })
      : item
  )));
}

function freezeObject(value) {
  return Object.freeze({ ...(value ?? {}) });
}

export function buildHermesMemoryEvent({
  memoryId = randomUUID(),
  timestamp = new Date().toISOString(),
  scope = 'project',
  kind = 'observation',
  content,
  sourceRefs = [],
  confidence = null,
  epistemicState = 'UNVERIFIED',
  metadata = {},
} = {}) {
  const memory = Object.freeze({
    schema: HERMES_MEMORY_EVENT_SCHEMA,
    memory_id: memoryId,
    timestamp,
    scope,
    kind,
    content,
    source_refs: freezeArray(sourceRefs),
    confidence,
    epistemic_state: epistemicState,
    evidence_authority: false,
    metadata: freezeObject(metadata),
  });
  return assertHermesValid(memory, validateHermesMemoryEvent, 'Hermes memory event');
}

export function buildHermesSkillProposal({
  proposalId = randomUUID(),
  timestamp = new Date().toISOString(),
  skillId,
  changeSummary,
  proposal,
  sourceRefs = [],
  successes = 0,
  failures = 0,
  confidence = null,
  metadata = {},
} = {}) {
  const contract = Object.freeze({
    schema: HERMES_SKILL_PROPOSAL_SCHEMA,
    proposal_id: proposalId,
    timestamp,
    skill_id: skillId,
    change_summary: changeSummary,
    proposal,
    source_refs: freezeArray(sourceRefs),
    metrics: Object.freeze({ successes, failures }),
    confidence,
    mode: 'shadow',
    requires_review: true,
    requires_tests: true,
    evidence_authority: false,
    metadata: freezeObject(metadata),
  });
  return assertHermesValid(contract, validateHermesSkillProposal, 'Hermes skill proposal');
}

export function buildHermesTrajectory({
  trajectoryId = randomUUID(),
  taskId,
  startedAt = new Date().toISOString(),
  endedAt = null,
  steps = [],
  status = 'running',
  metadata = {},
} = {}) {
  const contract = Object.freeze({
    schema: HERMES_TRAJECTORY_SCHEMA,
    trajectory_id: trajectoryId,
    task_id: taskId,
    started_at: startedAt,
    ended_at: endedAt,
    steps: freezeArray(steps.map((step) => ({
      index: step.index,
      action: step.action,
      tool: step.tool ?? null,
      status: step.status,
      duration_ms: step.durationMs ?? step.duration_ms ?? null,
    }))),
    status,
    evidence_authority: false,
    metadata: freezeObject(metadata),
  });
  return assertHermesValid(contract, validateHermesTrajectory, 'Hermes trajectory');
}

export function buildHermesExecutionResult({
  executionId = randomUUID(),
  taskId,
  timestamp = new Date().toISOString(),
  status,
  actionId,
  artifacts = [],
  tests = {},
  metrics = {},
  directEvidence = [],
  metadata = {},
} = {}) {
  const contract = Object.freeze({
    schema: HERMES_EXECUTION_RESULT_SCHEMA,
    execution_id: executionId,
    task_id: taskId,
    timestamp,
    status,
    action_id: actionId,
    artifacts: freezeArray(artifacts),
    tests: freezeObject(tests),
    metrics: freezeObject(metrics),
    direct_evidence: freezeArray(directEvidence.map((item) => ({
      kind: item.kind,
      ref: item.ref,
      direct: item.direct,
      ...(item.claimId || item.claim_id ? { claim_id: item.claimId ?? item.claim_id } : {}),
    }))),
    evidence_authority: false,
    metadata: freezeObject(metadata),
  });
  return assertHermesValid(contract, validateHermesExecutionResult, 'Hermes execution result');
}
