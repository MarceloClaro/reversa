import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import {
  HERMES_EVIDENCE_DECISION_SCHEMA,
  applyHermesEvidenceProposal,
  buildHermesExecutionResult,
  buildHermesMemoryEvent,
  createHermesBridge,
  createHermesEvidenceAuthority,
  evaluateHermesEvidenceProposal,
  executionResultToEvidenceProposals,
  isHermesDirectEvidence,
} from '../lib/integrations/hermes/index.js';

import {
  applyEvidenceProposal,
  evaluateEvidenceProposal,
} from '../lib/integrations/adaptive/index.js';

const authority = createHermesEvidenceAuthority();
const bridge = createHermesBridge();
assert.equal(bridge.evidenceAuthority.engine, 'hermes-evidence-authority-v2');
assert.strictEqual(bridge.evaluateEvidence, bridge.evidenceAuthority.evaluate);
assert.strictEqual(bridge.applyEvidence, bridge.evidenceAuthority.apply);

const directSource = { kind: 'test', direct: true, ref: 'tests/payment.test.js:42' };
assert.equal(isHermesDirectEvidence(directSource), true);

const directDecision = evaluateHermesEvidenceProposal({
  current: 'INFERRED',
  proposed: 'OBSERVED',
  source: directSource,
});
assert.equal(directDecision.schema, HERMES_EVIDENCE_DECISION_SCHEMA);
assert.equal(directDecision.authority, 'hermes');
assert.equal(directDecision.engine, 'hermes-evidence-authority-v2');
assert.equal(directDecision.accepted, true);
assert.equal(directDecision.effective, 'OBSERVED');
assert.equal(directDecision.direct_evidence, true);
assert.equal(directDecision.evidence_authority, true);

const memory = buildHermesMemoryEvent({
  memoryId: 'mem-authority-001',
  scope: 'project',
  kind: 'fact',
  content: 'O pagamento parece idempotente segundo memória de sessão.',
  sourceRefs: ['session:42'],
  confidence: 1.0,
  epistemicState: 'INFERRED',
});

const memoryOnlyDecision = evaluateHermesEvidenceProposal({
  current: 'INFERRED',
  proposed: 'OBSERVED',
  source: { kind: 'hermes-memory', direct: false, ref: 'memory:mem-authority-001', confidence: 1.0 },
  memoryContext: [memory],
});
assert.equal(memoryOnlyDecision.accepted, false);
assert.equal(memoryOnlyDecision.effective, 'INFERRED');
assert.equal(memoryOnlyDecision.memory_context_count, 1);
assert.equal(memoryOnlyDecision.direct_evidence, false);

for (const kind of ['learned-policy', 'mci-trust', 'human', 'hermes-skill', 'hermes-confidence']) {
  const rejected = authority.evaluate({
    current: 'UNVERIFIED',
    proposed: 'OBSERVED',
    source: { kind, direct: false, ref: `${kind}:1` },
  });
  assert.equal(rejected.accepted, false, `${kind} must not promote OBSERVED`);
  assert.equal(rejected.authority, 'hermes');
}

const nonObserved = authority.evaluate({
  current: 'UNVERIFIED',
  proposed: 'INFERRED',
  source: { kind: 'hermes-memory', direct: false, ref: 'memory:1' },
});
assert.equal(nonObserved.accepted, true);
assert.equal(nonObserved.effective, 'INFERRED');

const indirectWithoutMemory = authority.evaluate({
  current: 'INFERRED',
  proposed: 'OBSERVED',
  source: { kind: 'hermes-memory', direct: false, ref: 'memory:1' },
});
const indirectWithMemory = authority.evaluate({
  current: 'INFERRED',
  proposed: 'OBSERVED',
  source: { kind: 'hermes-memory', direct: false, ref: 'memory:1' },
  memoryContext: [memory],
});
assert.equal(indirectWithoutMemory.accepted, false);
assert.equal(indirectWithMemory.accepted, false);

const directWithMemory = authority.evaluate({
  current: 'INFERRED',
  proposed: 'OBSERVED',
  source: directSource,
  memoryContext: [memory],
});
assert.equal(directWithMemory.accepted, directDecision.accepted);
assert.equal(directWithMemory.effective, directDecision.effective);
assert.equal(directWithMemory.memory_context_count, 1);

const applied = applyHermesEvidenceProposal(
  { id: 'claim-1', epistemic_state: 'INFERRED', text: 'payment is idempotent' },
  { proposed: 'OBSERVED', source: directSource },
  { memoryContext: [memory] },
);
assert.equal(applied.epistemic_state, 'OBSERVED');
assert.equal(applied.hermes_evidence_authority.authority, 'hermes');
assert.strictEqual(applied.epistemic_guard, applied.hermes_evidence_authority);
assert.equal(applied.text, 'payment is idempotent');

const legacyDecision = evaluateEvidenceProposal({
  current: 'INFERRED',
  proposed: 'OBSERVED',
  source: directSource,
});
assert.equal(legacyDecision.authority, 'hermes');
assert.equal(legacyDecision.engine, 'hermes-evidence-authority-v2');

const legacyApplied = applyEvidenceProposal(
  { id: 'claim-legacy', epistemic_state: 'INFERRED' },
  { proposed: 'OBSERVED', source: directSource },
);
assert.equal(legacyApplied.epistemic_state, 'OBSERVED');
assert.equal(legacyApplied.hermes_evidence_authority.authority, 'hermes');
assert.strictEqual(legacyApplied.epistemic_guard, legacyApplied.hermes_evidence_authority);

const execution = buildHermesExecutionResult({
  executionId: 'exec-authority-001',
  taskId: 'FWD-042',
  status: 'succeeded',
  actionId: 'route:reviewer',
  artifacts: ['tests/payment.test.js'],
  tests: { passing: true, total: 12, failed: 0 },
  metrics: { duration_ms: 8000 },
  directEvidence: [
    { kind: 'test', ref: 'tests/payment.test.js:42', direct: true, claimId: 'claim-1' },
    { kind: 'hermes-memory', ref: 'memory:1', direct: true, claimId: 'claim-2' },
  ],
});
const proposals = executionResultToEvidenceProposals(execution, [
  { id: 'claim-1', epistemic_state: 'INFERRED' },
  { id: 'claim-2', epistemic_state: 'INFERRED' },
]);
assert.equal(proposals.length, 1);
assert.equal(proposals[0].claim_id, 'claim-1');
assert.equal(proposals[0].proposal.source.kind, 'test');

const facadeSource = await readFile(
  new URL('../lib/integrations/adaptive/evidence-guard.js', import.meta.url),
  'utf8',
);
assert.match(facadeSource, /hermes\/evidence-authority\.js/);
assert.doesNotMatch(facadeSource, /DIRECT_EVIDENCE_KINDS/);
assert.doesNotMatch(facadeSource, /source\.kind\s*===\s*['"]learned-policy['"]/);

console.log('✓ Hermes Evidence Authority v2 replaces standalone Evidence Guard implementation');
