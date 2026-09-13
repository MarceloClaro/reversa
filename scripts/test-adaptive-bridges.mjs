import assert from 'node:assert/strict';

import {
  applyEvidenceProposal,
  buildAcmeExperience,
  buildMciEnvelope,
  computeAdaptiveReward,
  createLearningEvent,
  validateAdaptiveAction,
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

const event = sampleEvent();
assert.equal(event.schema, 'reversa.learning.event/v1');
assert.equal(event.state.epistemic_state, 'INFERRED');

const mci = buildMciEnvelope(event);
assert.equal(mci.schema, 'reversa.mci.envelope/v1');
assert.equal(mci.source, 'ReversaFeynman');
assert.ok(mci.metacognition.required_gates.includes('FEG-02'));
assert.ok(mci.metacognition.required_gates.includes('FEG-03'));

const experience = buildAcmeExperience(event);
assert.equal(experience.schema, 'reversa.acme.experience/v1');
assert.equal(experience.action.allowed, true);
assert.equal(experience.extras.evidence_authority, false);
assert.equal(experience.observation.vector.length, 7);

const reward = computeAdaptiveReward(event.outcome);
assert.ok(reward.score >= -1 && reward.score <= 1);
assert.equal(reward.policy, 'heuristic-v1');

const blockedAction = validateAdaptiveAction('exec:rm-rf');
assert.equal(blockedAction.allowed, false);

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

console.log('✓ Adaptive MCI/ACME bridges: contratos e invariantes OK');
