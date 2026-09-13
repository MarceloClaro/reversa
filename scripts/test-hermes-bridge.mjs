import assert from 'node:assert/strict';

import {
  HERMES_EXECUTION_RESULT_SCHEMA,
  HERMES_MEMORY_EVENT_SCHEMA,
  HERMES_SKILL_PROPOSAL_SCHEMA,
  HERMES_TRAJECTORY_SCHEMA,
  buildHermesExecutionResult,
  buildHermesMemoryEvent,
  buildHermesSkillProposal,
  buildHermesTrajectory,
  classifyHermesMemory,
  createHermesBridge,
  executionResultToEvidenceProposals,
  governHermesSkillProposal,
  trajectoryToLearningSignals,
  validateHermesExecutionResult,
  validateHermesMemoryEvent,
  validateHermesSkillProposal,
  validateHermesTrajectory,
} from '../lib/integrations/hermes/index.js';

import { applyEvidenceProposal } from '../lib/integrations/adaptive/index.js';

const memory = buildHermesMemoryEvent({
  memoryId: 'mem-001',
  scope: 'project',
  kind: 'decision',
  content: 'O módulo de pagamentos usa idempotência por chave.',
  sourceRefs: ['session:42'],
  confidence: 0.84,
  epistemicState: 'INFERRED',
});
assert.equal(memory.schema, HERMES_MEMORY_EVENT_SCHEMA);
assert.equal(memory.evidence_authority, false);
assert.equal(validateHermesMemoryEvent(memory).valid, true);
assert.throws(() => buildHermesMemoryEvent({
  memoryId: 'mem-observed',
  scope: 'project',
  kind: 'fact',
  content: 'Não pode ser OBSERVED só por memória.',
  epistemicState: 'OBSERVED',
}), /OBSERVED|epistemic/i);

const personalMemory = buildHermesMemoryEvent({
  memoryId: 'mem-personal',
  scope: 'personalization',
  kind: 'preference',
  content: 'Usuário prefere respostas concisas.',
  confidence: 0.99,
  epistemicState: 'UNVERIFIED',
});
const personalClassification = classifyHermesMemory(personalMemory);
assert.equal(personalClassification.accepted, true);
assert.equal(personalClassification.evidence_authority, false);
assert.equal(personalClassification.epistemic_state, 'UNVERIFIED');
assert.match(personalClassification.reason, /personalization/i);

const skillProposal = buildHermesSkillProposal({
  proposalId: 'skill-prop-001',
  skillId: 'reversa-clarify',
  changeSummary: 'Adicionar pergunta de mecanismo antes de aceitar uma suposição de domínio.',
  proposal: 'Inserir uma checagem FEG-01 antes da resolução de [DOUBT].',
  sourceRefs: ['trajectory:abc', 'session:42'],
  successes: 17,
  failures: 4,
  confidence: 0.81,
});
assert.equal(skillProposal.schema, HERMES_SKILL_PROPOSAL_SCHEMA);
assert.equal(skillProposal.mode, 'shadow');
assert.equal(skillProposal.requires_review, true);
assert.equal(skillProposal.requires_tests, true);
assert.equal(skillProposal.evidence_authority, false);
assert.equal(validateHermesSkillProposal(skillProposal).valid, true);

assert.throws(() => buildHermesSkillProposal({
  skillId: '../reversa-clarify',
  changeSummary: 'Identificador inseguro não deve passar.',
  proposal: 'n/a',
}), /skill_id|skill/i);
assert.throws(() => buildHermesSkillProposal({
  skillId: 'reversa-clarify',
  changeSummary: 'Métrica numérica em string não deve passar.',
  proposal: 'n/a',
  successes: '17',
}), /successes|integer/i);

const blockedSkill = governHermesSkillProposal(skillProposal);
assert.equal(blockedSkill.eligible, false);
assert.ok(blockedSkill.reasons.includes('review-required'));
assert.ok(blockedSkill.reasons.includes('tests-required'));
assert.ok(blockedSkill.reasons.includes('feynman-required'));

const approvedSkill = governHermesSkillProposal(skillProposal, {
  reviewApproved: true,
  testsPassing: true,
  feynmanApproved: true,
  drift: { detected: false, status: 'stable' },
});
assert.equal(approvedSkill.eligible, true);
assert.equal(approvedSkill.executable, false);
assert.equal(approvedSkill.file_mutation_performed, false);

const driftBlocked = governHermesSkillProposal(skillProposal, {
  reviewApproved: true,
  testsPassing: true,
  feynmanApproved: true,
  drift: { detected: true, status: 'drift' },
});
assert.equal(driftBlocked.eligible, false);
assert.ok(driftBlocked.reasons.includes('drift-detected'));

const trajectory = buildHermesTrajectory({
  trajectoryId: 'traj-001',
  taskId: 'FWD-042',
  startedAt: '2026-09-13T12:00:00.000Z',
  endedAt: '2026-09-13T12:00:08.000Z',
  status: 'succeeded',
  steps: [
    { index: 0, action: 'inspect-spec', tool: 'read', status: 'succeeded', durationMs: 1200 },
    { index: 1, action: 'run-tests', tool: 'shell', status: 'failed', durationMs: 2400 },
    { index: 2, action: 'run-tests', tool: 'shell', status: 'succeeded', durationMs: 2100 },
    { index: 3, action: 'write-report', tool: null, status: 'succeeded', durationMs: 900 },
  ],
});
assert.equal(trajectory.schema, HERMES_TRAJECTORY_SCHEMA);
assert.equal(trajectory.evidence_authority, false);
assert.equal(validateHermesTrajectory(trajectory).valid, true);

assert.throws(() => buildHermesTrajectory({
  trajectoryId: 'traj-bad',
  taskId: 'FWD-043',
  status: 'failed',
  steps: [
    { index: 1, action: 'second', status: 'failed' },
    { index: 0, action: 'first', status: 'succeeded' },
  ],
}), /order|index|sequ/i);

const signals = trajectoryToLearningSignals(trajectory);
assert.equal(signals.step_count, 4);
assert.equal(signals.failed_steps, 1);
assert.equal(signals.tool_calls, 3);
assert.equal(signals.known_duration_ms, 6600);
assert.equal(signals.repeated_actions, 1);
assert.equal(signals.completed, true);
assert.equal(signals.evidence_authority, false);

const noEvidenceResult = buildHermesExecutionResult({
  executionId: 'exec-001',
  taskId: 'FWD-042',
  status: 'succeeded',
  actionId: 'route:reviewer',
  artifacts: ['_reversa_forward/042/audit/cross-check.md'],
  tests: { passing: true, total: 12, failed: 0 },
  metrics: { duration_ms: 8000 },
  directEvidence: [],
});
assert.equal(noEvidenceResult.schema, HERMES_EXECUTION_RESULT_SCHEMA);
assert.equal(noEvidenceResult.evidence_authority, false);
assert.equal(validateHermesExecutionResult(noEvidenceResult).valid, true);
assert.deepEqual(executionResultToEvidenceProposals(noEvidenceResult, [
  { id: 'claim-no-evidence', epistemic_state: 'INFERRED' },
]), []);

const evidencedResult = buildHermesExecutionResult({
  executionId: 'exec-002',
  taskId: 'FWD-042',
  status: 'succeeded',
  actionId: 'route:reviewer',
  artifacts: ['tests/payment.test.js'],
  tests: { passing: true, total: 12, failed: 0 },
  metrics: { duration_ms: 8200 },
  directEvidence: [
    { kind: 'test', ref: 'tests/payment.test.js:42', direct: true, claimId: 'claim-idempotency' },
  ],
});
const proposals = executionResultToEvidenceProposals(evidencedResult, [
  { id: 'claim-idempotency', epistemic_state: 'INFERRED' },
  { id: 'claim-unmapped', epistemic_state: 'UNVERIFIED' },
]);
assert.equal(proposals.length, 1);
assert.equal(proposals[0].claim_id, 'claim-idempotency');
assert.equal(proposals[0].proposal.proposed, 'OBSERVED');
assert.equal(proposals[0].proposal.source.kind, 'test');
assert.equal(proposals[0].proposal.source.direct, true);

const applied = applyEvidenceProposal(
  { id: 'claim-idempotency', epistemic_state: 'INFERRED' },
  proposals[0].proposal,
);
assert.equal(applied.epistemic_state, 'OBSERVED');
assert.equal(applied.epistemic_guard.accepted, true);

const bridge = createHermesBridge();
assert.equal((await bridge.dispatch(memory)).requested, false);
assert.equal((await bridge.dispatch(skillProposal)).requested, false);
assert.equal((await bridge.dispatch(trajectory)).requested, false);
assert.equal((await bridge.dispatch(evidencedResult)).requested, false);

assert.equal(bridge.memory({
  memoryId: 'mem-bridge',
  scope: 'execution',
  kind: 'observation',
  content: 'Execução produziu um log, ainda não validado como evidência.',
}).evidence_authority, false);

console.log('✓ Hermes Bridge v1: SDD/TDD contracts, memory firewall, skill gate, trajectory signals e evidence adapter OK');
