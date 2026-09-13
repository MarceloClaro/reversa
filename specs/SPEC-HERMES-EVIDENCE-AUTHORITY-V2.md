# SPEC — Hermes Evidence Authority v2

Status: proposed → implementation target  
Method: Specification-Driven Development (SDD) + Test-Driven Development (TDD)  
Repository: ReversaFeynman  
Supersedes implementation role: `lib/integrations/adaptive/evidence-guard.js`

## 1. Decision

The ReversaFeynman epistemic promotion gate SHALL be implemented by the Hermes integration layer.

`lib/integrations/hermes/evidence-authority.js` becomes the canonical implementation responsible for deciding whether an epistemic proposal may become `OBSERVED`.

The historical module `lib/integrations/adaptive/evidence-guard.js` SHALL remain only as a backwards-compatible facade that delegates to Hermes Evidence Authority. It MUST NOT contain an independent decision algorithm.

## 2. Goal

Replace the standalone Evidence Guard implementation with a Hermes-centered evidence authority while preserving the core epistemic invariant:

```text
memory/confidence/policy/trust/human fluency != direct evidence
```

Hermes becomes the component that performs evidence classification and promotion decisions, but Hermes memory or learned state MUST NOT automatically become `OBSERVED`.

## 3. Canonical API

The Hermes layer MUST export:

- `assertHermesEpistemicState(value)`
- `isHermesDirectEvidence(source)`
- `evaluateHermesEvidenceProposal(input)`
- `applyHermesEvidenceProposal(claim, proposal, context?)`
- `createHermesEvidenceAuthority(options?)`

The authority factory MUST expose:

- `evaluate(input)`
- `apply(claim, proposal, context?)`
- `isDirectEvidence(source)`
- `classifyMemory(memory)`

## 4. Decision contract

Every evaluation result MUST contain:

- `schema: reversa.hermes.evidence.decision/v1`
- `authority: hermes`
- `engine: hermes-evidence-authority-v2`
- `accepted`
- `current`
- `proposed`
- `effective`
- `reason`
- `direct_evidence`
- `memory_context_count`
- `evidence_authority: true`

`evidence_authority: true` applies to the **decision engine**, not to Hermes memories, trajectories, skill proposals or execution-result envelopes, which remain `evidence_authority: false`.

## 5. OBSERVED promotion rules

### 5.1 Allowed

A transition to `OBSERVED` MAY be accepted only when:

1. `source.direct === true`;
2. `source.kind` belongs to the shared ReversaFeynman direct evidence allowlist;
3. `source.ref` is a non-empty traceable reference.

Baseline direct evidence kinds remain:

- `code`
- `contract`
- `test`
- `execution`
- `log`
- `dataset`
- `artifact`

### 5.2 Forbidden as sole authority

The following source kinds MUST NOT produce `OBSERVED` by themselves:

- `hermes-memory`
- `hermes-skill`
- `hermes-confidence`
- `learned-policy`
- `mci-trust`
- `human`

A memory may be considered as context/provenance, but never as the direct evidence source that authorizes `OBSERVED`.

## 6. Memory context

`evaluateHermesEvidenceProposal()` MAY receive `memoryContext` containing zero or more valid Hermes Memory Events.

Rules:

- invalid memory items are ignored for decision authority and reported in context summary;
- valid memory items may be counted and referenced diagnostically;
- memory confidence MUST NOT alter `accepted=true` for an `OBSERVED` proposal;
- `personalization` memory MUST NOT affect epistemic promotion;
- the same direct-evidence proposal MUST produce the same accept/reject outcome with or without memory context.

## 7. Apply semantics

`applyHermesEvidenceProposal(claim, proposal, context)` MUST:

- preserve all original claim fields;
- set `epistemic_state` to the decision's `effective` state;
- attach canonical decision under `hermes_evidence_authority`;
- MAY attach `epistemic_guard` as a backwards-compatible alias to the same decision object;
- never mutate the input claim.

## 8. Compatibility facade

`lib/integrations/adaptive/evidence-guard.js` SHALL:

- import the canonical Hermes implementation;
- export legacy names:
  - `assertEpistemicState`
  - `isDirectEvidence`
  - `evaluateEvidenceProposal`
  - `applyEvidenceProposal`
- delegate each legacy function directly to its Hermes equivalent;
- contain no independent allowlist or promotion logic.

This facade exists to avoid breaking current Adaptive Governance and external consumers while changing the implementation authority.

## 9. Hermes execution adapter

`lib/integrations/hermes/evidence-adapter.js` MUST use Hermes Evidence Authority for direct-evidence classification rather than importing `DIRECT_EVIDENCE_KINDS` directly.

The adapter continues to require explicit `claim_id` mapping.

## 10. Security invariants

- Hermes memory MUST NOT become direct evidence merely because it is persistent or high-confidence.
- Skill success metrics MUST NOT become evidence authority.
- Policy confidence, Brier/ECE, reward, regret and trust MUST NOT authorize `OBSERVED`.
- Human validation remains distinct from direct machine-verifiable evidence.
- No file mutation or command execution occurs inside evidence evaluation.
- No network access is required by the evidence authority.

## 11. TDD acceptance criteria

The suite MUST prove:

1. canonical authority accepts direct `test` evidence;
2. canonical authority rejects `hermes-memory` as sole source for `OBSERVED` even at confidence `1.0`;
3. canonical authority rejects `learned-policy`, `mci-trust` and `human` for direct promotion;
4. valid non-`OBSERVED` transitions continue to work;
5. memory context does not change an otherwise rejected indirect proposal into an accepted one;
6. direct evidence decision is stable with and without memory context;
7. applied claims expose `hermes_evidence_authority`;
8. compatibility alias `epistemic_guard` points to the same decision;
9. legacy `applyEvidenceProposal` delegates to Hermes and produces authority=`hermes`;
10. legacy `evaluateEvidenceProposal` produces engine=`hermes-evidence-authority-v2`;
11. Hermes execution adapter uses canonical direct-evidence classification;
12. the old adaptive evidence-guard contains no independent `DIRECT_EVIDENCE_KINDS` decision implementation;
13. no package dependency is added.

## 12. Architecture

```text
claim proposal
     ↓
Hermes Evidence Authority
     ├── memory context (non-authoritative)
     ├── direct evidence classifier
     └── epistemic decision
              ↓
       OBSERVED / current state
```

Adaptive Governance consumes the result but no longer owns the evidence gate implementation.

## 13. Documentation

README and Hermes documentation MUST state:

- Evidence Guard was replaced as the canonical implementation by Hermes Evidence Authority v2;
- `adaptive/evidence-guard.js` is a compatibility facade only;
- Hermes is now the evidence decision authority;
- Hermes memory itself is still non-authoritative;
- provenance of Hermes Agent remains attributed to Nous Research.
