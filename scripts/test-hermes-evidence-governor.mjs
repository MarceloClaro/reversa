import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import {
  HERMES_EVIDENCE_GOVERNOR,
  applyHermesEvidenceProposal,
  createHermesEvidenceGovernor,
  evaluateHermesEvidence,
} from '../lib/integrations/hermes/index.js';

import {
  applyEvidenceProposal,
  evaluateEvidenceProposal,
} from '../lib/integrations/adaptive/index.js';

const direct = applyHermesEvidenceProposal(
  { id: 'claim-direct', epistemic_state: 'INFERRED' },
  {
    proposed: 'OBSERVED',
    source: { kind: 'test', direct: true, ref: 'tests/example.test.js:42' },
  },
);
assert.equal(direct.epistemic_state, 'OBSERVED');
assert.equal(direct.epistemic_governor.accepted, true);
assert.equal(direct.epistemic_governor.governor, HERMES_EVIDENCE_GOVERNOR);
assert.equal(direct.epistemic_governor.evidence_authority, 'direct-traceable-evidence');

for (const kind of [
  'hermes-memory',
  'hermes-confidence',
  'hermes-user-model',
  'hermes-skill-proposal',
  'learned-policy',
  'mci-trust',
  'human',
]) {
  const rejected = applyHermesEvidenceProposal(
    { id: `claim-${kind}`, epistemic_state: 'INFERRED' },
    {
      proposed: 'OBSERVED',
      source: { kind, direct: true, ref: `${kind}:1`, confidence: 1.0 },
    },
  );
  assert.equal(rejected.epistemic_state, 'INFERRED');
  assert.equal(rejected.epistemic_governor.accepted, false);
  assert.notEqual(rejected.epistemic_governor.evidence_authority, 'direct-traceable-evidence');
}

const weaker = evaluateHermesEvidence({
  current: 'UNVERIFIED',
  proposed: 'INFERRED',
  source: { kind: 'hermes-memory', direct: false, ref: 'memory:42' },
});
assert.equal(weaker.accepted, true);
assert.equal(weaker.effective, 'INFERRED');
assert.equal(weaker.governor, HERMES_EVIDENCE_GOVERNOR);

assert.throws(() => evaluateHermesEvidence({
  current: 'INVALID',
  proposed: 'INFERRED',
}), /estado epistemol[oó]gico inv[aá]lido/i);

const localGovernor = createHermesEvidenceGovernor();
const localDecision = localGovernor.evaluate({
  current: 'INFERRED',
  proposed: 'OBSERVED',
  source: { kind: 'log', direct: true, ref: 'logs/run-42.log:88' },
});
assert.equal(localDecision.accepted, true);
assert.equal((await localGovernor.collectEvidence({ claim_id: 'x' })).requested, false);

const remoteGovernor = createHermesEvidenceGovernor({
  transport: async () => ({
    proposed: 'OBSERVED',
    source: { kind: 'hermes-memory', direct: true, ref: 'memory:remote' },
  }),
});
const collected = await remoteGovernor.collectEvidence({ claim_id: 'remote-claim' });
assert.equal(collected.requested, true);
assert.equal(collected.decision.accepted, false);
assert.equal(collected.decision.effective, 'UNVERIFIED');

const legacy = applyEvidenceProposal(
  { id: 'claim-legacy', epistemic_state: 'INFERRED' },
  {
    proposed: 'OBSERVED',
    source: { kind: 'test', direct: true, ref: 'tests/legacy.test.js:5' },
  },
);
assert.equal(legacy.epistemic_state, 'OBSERVED');
assert.equal(legacy.epistemic_governor.governor, HERMES_EVIDENCE_GOVERNOR);
assert.equal(legacy.epistemic_guard.accepted, true);

const legacyDecision = evaluateEvidenceProposal({
  current: 'INFERRED',
  proposed: 'OBSERVED',
  source: { kind: 'hermes-memory', direct: true, ref: 'memory:legacy' },
});
assert.equal(legacyDecision.accepted, false);
assert.equal(legacyDecision.governor, HERMES_EVIDENCE_GOVERNOR);

const shim = await readFile(new URL('../lib/integrations/adaptive/evidence-guard.js', import.meta.url), 'utf8');
assert.match(shim, /hermes\/evidence-governor\.js/);
assert.doesNotMatch(shim, /DIRECT_EVIDENCE_KINDS/);
assert.doesNotMatch(shim, /source\.kind ===/);

const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const deps = Object.keys({ ...(pkg.dependencies ?? {}), ...(pkg.optionalDependencies ?? {}) })
  .map((name) => name.toLowerCase());
assert.equal(deps.some((name) => name.includes('hermes') || name.includes('nous') || name.includes('python')), false);

console.log('✓ Hermes Evidence Governor v2: replacement, local rules, transport containment and compatibility OK');
