import assert from 'node:assert/strict';

import {
  applyEvidenceProposal,
  buildAcmeExperience,
  buildMciEnvelope,
  computeAdaptiveReward,
  createAdaptiveRuntime,
  createAuditLedger,
  createLearningEvent,
  detectAdaptiveDrift,
  governAdaptiveProposal,
  proposeShadowAction,
  shouldForceAbstention,
  validateAcmeExperience,
  validateAdaptiveAction,
  validateLearningEvent,
  validateMciEnvelope,
} from '../lib/integrations/adaptive/index.js';

function sampleEvent(overrides = {}) {
  return createLearningEvent({
    taskId: 'FWD-042',
    stage: 'audit',
    epistemic: {
      state: 'INFERRED',
      feynmanScore: 8,
      highFindings: 1,
      criticalFindings: 0,
      blockedCount: 0,
    },
    confidence: { calibrated: 0.63, trust: 0.74 },
    action: { id: 'route:clarify' },
    outcome: {
      specAccepted: true,
      testsPassing: true,
      observedEvidenceDelta: 0.25,
      uncertaintyReduction: 0.31,
      regressionCount: 0,
      retries: 1,
      calibratedConfidence: 0.63,
      actualSuccess: true,
    },
    ...overrides,
  });
}

function experienceFor(actionId, good = true, epistemicState = 'INFERRED') {
  return buildAcmeExperience(sampleEvent({
    action: { id: actionId },
    epistemic: {
      state: epistemicState,
      feynmanScore: good ? 10 : 4,
      highFindings: good ? 0 : 2,
      criticalFindings: good ? 0 : 1,
      blockedCount: good ? 0 : 1,
    },
    confidence: { calibrated: good ? 0.82 : 0.28, trust: good ? 0.80 : 0.35 },
    outcome: {
      specAccepted: good,
      testsPassing: good,
      observedEvidenceDelta: good ? 0.35 : -0.20,
      uncertaintyReduction: good ? 0.30 : -0.15,
      regressionCount: good ? 0 : 2,
      retries: good ? 0 : 4,
      calibratedConfidence: good ? 0.82 : 0.28,
      actualSuccess: good,
    },
  }));
}

const event = sampleEvent();
assert.equal(event.schema, 'reversa.learning.event/v1');
assert.equal(event.state.epistemic_state, 'INFERRED');
assert.equal(validateLearningEvent(event).valid, true);
assert.throws(() => sampleEvent({ confidence: { calibrated: 1.2, trust: 0.5 } }), /\[0,1\]/);

const mci = buildMciEnvelope(event);
assert.equal(mci.schema, 'reversa.mci.envelope/v1');
assert.equal(mci.source, 'ReversaFeynman');
assert.ok(mci.metacognition.required_gates.includes('FEG-02'));
assert.ok(mci.metacognition.required_gates.includes('FEG-03'));
assert.equal(validateMciEnvelope(mci).valid, true);

const experience = buildAcmeExperience(event);
assert.equal(experience.schema, 'reversa.acme.experience/v1');
assert.equal(experience.action.allowed, true);
assert.equal(experience.action.requires_approval, false);
assert.equal(experience.extras.evidence_authority, false);
assert.equal(experience.observation.vector.length, 7);
assert.equal(validateAcmeExperience(experience).valid, true);

const reward = computeAdaptiveReward(event.outcome);
assert.ok(reward.score >= -1 && reward.score <= 1);
assert.equal(reward.policy, 'heuristic-v1');

const blockedAction = validateAdaptiveAction('exec:rm-rf');
assert.equal(blockedAction.allowed, false);

const codingAction = validateAdaptiveAction('route:coding');
assert.equal(codingAction.allowed, true);
assert.equal(codingAction.requires_approval, true);

const learnedPromotion = applyEvidenceProposal(
  { id: 'claim-1', epistemic_state: 'INFERRED' },
  {
    proposed: 'OBSERVED',
    source: { kind: 'learned-policy', direct: false, ref: 'policy:acme' },
  },
);
assert.equal(learnedPromotion.epistemic_state, 'INFERRED');
assert.equal(learnedPromotion.epistemic_guard.accepted, false);

const directPromotion = applyEvidenceProposal(
  { id: 'claim-2', epistemic_state: 'INFERRED' },
  {
    proposed: 'OBSERVED',
    source: { kind: 'test', direct: true, ref: 'tests/example.test.js:42' },
  },
);
assert.equal(directPromotion.epistemic_state, 'OBSERVED');
assert.equal(directPromotion.epistemic_guard.accepted, true);

const lowConfidence = sampleEvent({
  epistemic: { state: 'BLOCKED', feynmanScore: 4, blockedCount: 2 },
  confidence: { calibrated: 0.10, trust: 0.30 },
});
const lowEnvelope = buildMciEnvelope(lowConfidence);
assert.equal(lowEnvelope.metacognition.should_abstain, true);
assert.ok(lowEnvelope.metacognition.required_gates.includes('FEG-06'));

// Ledger: deduplicação + hash-chain auditável.
const ledger = createAuditLedger();
const firstAppend = ledger.append(event);
assert.equal(firstAppend.appended, true);
const duplicateAppend = ledger.append(event);
assert.equal(duplicateAppend.duplicate, true);
assert.equal(ledger.size(), 1);
assert.equal(ledger.verify().valid, true);
assert.match(ledger.toJSONL(), /entry_hash/);

// Contextual shadow policy: aprende ranking, mas nunca ganha autoridade epistemológica.
const policyHistory = [
  ...Array.from({ length: 10 }, () => experienceFor('route:reviewer', true)),
  ...Array.from({ length: 6 }, () => experienceFor('route:clarify', false)),
];
const shadowProposal = proposeShadowAction({
  observation: experienceFor('route:reviewer', true).observation,
  experiences: policyHistory,
  candidateActions: ['route:reviewer', 'route:clarify'],
});
assert.equal(shadowProposal.policy, 'contextual-shadow-v1');
assert.equal(shadowProposal.mode, 'shadow');
assert.equal(shadowProposal.action_id, 'route:reviewer');
assert.equal(shadowProposal.evidence_authority, false);

assert.throws(() => proposeShadowAction({
  observation: experience.observation,
  experiences: policyHistory,
  candidateActions: ['exec:rm-rf'],
}), /allowlist adaptativa/);

const shadowGovernance = governAdaptiveProposal({ proposal: shadowProposal });
assert.equal(shadowGovernance.executable, false);
assert.ok(shadowGovernance.reasons.includes('shadow-mode'));

const activeProposal = { ...shadowProposal, mode: 'active', confidence: 0.90, history_count: 20 };
const activeGovernance = governAdaptiveProposal({
  proposal: activeProposal,
  drift: { detected: false, status: 'stable' },
  activeMode: true,
});
assert.equal(activeGovernance.executable, true);

const codingGovernance = governAdaptiveProposal({
  proposal: {
    policy: 'test', mode: 'active', action_id: 'route:coding', confidence: 0.95, history_count: 20,
  },
  drift: { detected: false, status: 'stable' },
  activeMode: true,
  approved: false,
});
assert.equal(codingGovernance.executable, false);
assert.ok(codingGovernance.reasons.includes('approval-required'));

// Drift: mudança forte no reward/confiança deve bloquear promoção automática.
const driftHistory = [
  ...Array.from({ length: 40 }, () => experienceFor('route:reviewer', true, 'OBSERVED')),
  ...Array.from({ length: 15 }, () => experienceFor('route:reviewer', false, 'UNVERIFIED')),
];
const drift = detectAdaptiveDrift(driftHistory);
assert.equal(drift.detected, true);
const driftGovernance = governAdaptiveProposal({
  proposal: activeProposal,
  drift,
  activeMode: true,
});
assert.equal(driftGovernance.executable, false);
assert.equal(shouldForceAbstention({ governance: driftGovernance, mciEnvelope: mci }), true);

// Runtime integra ledger + MCI + ACME + shadow policy sem executar ações automaticamente.
const runtime = createAdaptiveRuntime({
  candidateActions: ['route:reviewer', 'route:clarify'],
  maxHistory: 20,
});
const runtimeResult = await runtime.ingest(sampleEvent({ action: { id: 'route:reviewer' } }));
assert.equal(runtimeResult.duplicate, false);
assert.equal(runtimeResult.ledger.valid, true);
assert.equal(runtimeResult.proposal.mode, 'shadow');
assert.equal(runtimeResult.governance.executable, false);
assert.equal(runtimeResult.dispatch.requested, false);
assert.equal(runtime.history().length, 1);
const runtimeDuplicate = await runtime.ingest(runtimeResult.mci_envelope.provenance.event_id === event.event_id
  ? event
  : runtime.ledgerSnapshot()[0].event);
assert.equal(runtimeDuplicate.duplicate, true);

console.log('✓ Adaptive MCI/ACME v2: contratos, evidência, ledger, policy, drift, runtime e governança OK');
