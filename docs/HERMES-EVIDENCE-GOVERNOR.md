# Hermes Evidence Governor v2

## Status

**Active evidence-governance component of ReversaFeynman.**

The former `Evidence Guard` implementation has been replaced by the **Hermes Evidence Governor**.

Legacy path:

```text
lib/integrations/adaptive/evidence-guard.js
```

is retained only as a compatibility shim. It delegates to:

```text
lib/integrations/hermes/evidence-governor.js
```

New code must use the Hermes API directly.

## Why replace the Evidence Guard

Hermes is now the operational boundary for memory, skill evolution, execution trajectories and evidence collection. Keeping evidence governance as a separate adaptive component would create two competing authorities.

The replacement consolidates the flow:

```text
ReversaFeynman
      ↓
Hermes Bridge
      ↓
Hermes Evidence Governor
      ↓
local deterministic evidence rules
      ↓
epistemic decision
```

The change does **not** mean that Hermes memory or model confidence becomes truth.

## Central invariant

```text
Hermes orchestrates evidence governance.
Direct traceable evidence establishes OBSERVED.
```

Therefore:

```text
Hermes memory         ≠ OBSERVED
Hermes confidence     ≠ OBSERVED
Hermes user model     ≠ OBSERVED
Hermes skill proposal ≠ OBSERVED
learned policy        ≠ OBSERVED
MCI trust             ≠ OBSERVED
human confidence      ≠ OBSERVED
```

## Public API

```js
import {
  applyHermesEvidenceProposal,
  createHermesEvidenceGovernor,
  evaluateHermesEvidence,
} from './lib/integrations/hermes/index.js';
```

### Evaluate

```js
const decision = evaluateHermesEvidence({
  current: 'INFERRED',
  proposed: 'OBSERVED',
  source: {
    kind: 'test',
    direct: true,
    ref: 'tests/payment.test.js:42',
  },
});
```

### Apply

```js
const claim = applyHermesEvidenceProposal(
  { id: 'claim-1', epistemic_state: 'INFERRED' },
  {
    proposed: 'OBSERVED',
    source: {
      kind: 'test',
      direct: true,
      ref: 'tests/payment.test.js:42',
    },
  },
);
```

### Governor runtime

```js
const governor = createHermesEvidenceGovernor();
```

Without a transport, evaluation is fully local and performs no network activity.

## Direct evidence kinds

The deterministic kernel recognizes the same traceable direct evidence classes used by ReversaFeynman:

```text
code
contract
test
execution
log
dataset
artifact
```

For `OBSERVED`, all of the following are required:

```text
source.direct === true
AND recognized kind
AND non-empty source.ref
AND source is not a forbidden semantic/model source
```

## Optional Hermes evidence collection

A Hermes runtime may be connected as an evidence collector:

```js
const governor = createHermesEvidenceGovernor({
  transport: async (request) => hermesEvidenceRequest(request),
});

const result = await governor.collectEvidence({
  claim_id: 'claim-42',
  current: 'UNVERIFIED',
});
```

The remote response is a **candidate** only.

It is always re-evaluated locally:

```text
Hermes transport response
        ↓
candidate evidence
        ↓
local Hermes Evidence Governor rules
        ↓
accepted / rejected
```

A remote runtime cannot override these rules by returning a high confidence or by labeling memory as direct.

## Native Hermes Bridge integration

`createHermesBridge()` now exposes:

```js
const bridge = createHermesBridge();
bridge.evidence.evaluate(...);
bridge.evidence.apply(...);
bridge.evidence.collectEvidence(...);
```

A distinct `evidenceTransport` can be configured independently from the general Hermes contract transport.

```js
const bridge = createHermesBridge({
  transport: contractTransport,
  evidenceTransport: evidenceCollector,
});
```

## Compatibility

Old code remains functional:

```js
import { applyEvidenceProposal } from './lib/integrations/adaptive/index.js';
```

but this symbol is now only an alias delegated through:

```text
adaptive/evidence-guard.js
        ↓
hermes/evidence-governor.js
```

The compatibility file contains no independent evidence rules.

Migration target:

```text
applyEvidenceProposal
        ↓
applyHermesEvidenceProposal
```

and:

```text
Evidence Guard
        ↓
Hermes Evidence Governor
```

## Decision record

A decision identifies the active governor:

```json
{
  "governor": "hermes-evidence-governor/v2",
  "accepted": true,
  "current": "INFERRED",
  "proposed": "OBSERVED",
  "effective": "OBSERVED",
  "reason": "direct evidence accepted by Hermes Evidence Governor",
  "evidence_authority": "direct-traceable-evidence"
}
```

`applyHermesEvidenceProposal()` stores this under:

```text
epistemic_governor
```

and temporarily duplicates the same decision under:

```text
epistemic_guard
```

for backward compatibility.

## SDD/TDD

Specification:

```text
specs/SPEC-HERMES-EVIDENCE-GOVERNOR-V2.md
```

Primary test:

```text
scripts/test-hermes-evidence-governor.mjs
```

The test verifies:

- direct evidence promotion;
- rejection of Hermes memory/confidence/user-model sources;
- rejection of learned-policy, MCI trust and human-confidence sources;
- non-OBSERVED transitions;
- invalid state rejection;
- operation without transport;
- containment of remote Hermes evidence candidates;
- native `Hermes Bridge → evidence governor` integration;
- backward-compatible aliases;
- absence of duplicated rule logic in the old shim;
- absence of Hermes/Nous/Python package dependencies.

## Provenance

Hermes Agent remains an external project of **Nous Research**. `MarceloClaro/hermes-agent` is a fork used for study and integration.

The **Hermes Evidence Governor v2** is a ReversaFeynman interoperability/governance implementation. It does not claim authorship of Hermes Agent or its original memory, skills, execution or trajectory capabilities.
