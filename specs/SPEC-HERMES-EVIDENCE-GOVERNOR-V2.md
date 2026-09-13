# SPEC — Hermes Evidence Governor v2

Status: implementation target  
Method: Specification-Driven Development (SDD) + Test-Driven Development (TDD)  
Repository: ReversaFeynman  
External inspiration/runtime: NousResearch/hermes-agent (via MarceloClaro/hermes-agent fork)

## 1. Decision

The operational component previously documented as **Evidence Guard** is replaced by **Hermes Evidence Governor**.

The replacement changes the ownership and orchestration boundary, not the epistemic standard. Hermes becomes the evidence-governance runtime boundary, while deterministic evidence rules remain explicit, inspectable and testable inside ReversaFeynman.

The legacy module `lib/integrations/adaptive/evidence-guard.js` MAY remain only as a compatibility shim. New code MUST use the Hermes governor API directly.

## 2. Goal

Provide a Hermes-centered evidence-governance component that:

- receives claims and evidence proposals;
- may request external evidence collection through an optional Hermes transport;
- applies deterministic evidence rules locally;
- records provenance of the decision;
- never treats memory, confidence, user modeling, learned policy or skill success as direct evidence;
- preserves backward compatibility for existing callers.

## 3. Non-goals

- Allowing Hermes memory to self-certify a claim.
- Allowing model confidence to produce `OBSERVED`.
- Allowing a remote Hermes runtime to override local epistemic rules.
- Requiring Hermes/Python as a package dependency.
- Removing traceability or FEG requirements.

## 4. Public API

Primary API MUST live under `lib/integrations/hermes/`.

Required exports:

- `evaluateHermesEvidence({ current, proposed, source })`
- `applyHermesEvidenceProposal(claim, proposal)`
- `createHermesEvidenceGovernor({ transport })`

Compatibility aliases MAY exist:

- `evaluateEvidenceProposal`
- `applyEvidenceProposal`

but MUST delegate to the Hermes implementation.

## 5. Epistemic rules

States remain:

- `OBSERVED`
- `INFERRED`
- `UNVERIFIED`
- `BLOCKED`

A proposal to `OBSERVED` MUST require all of:

1. `source.direct === true`;
2. recognized evidence kind;
3. non-empty traceable `source.ref`;
4. source kind is not memory/model/policy/human-confidence;
5. local rule evaluation accepts the transition.

Recognized direct evidence kinds remain:

- `code`
- `contract`
- `test`
- `execution`
- `log`
- `dataset`
- `artifact`

## 6. Hermes-specific prohibitions

The governor MUST reject `OBSERVED` when the source kind is any of:

- `hermes-memory`
- `hermes-confidence`
- `hermes-user-model`
- `hermes-skill-proposal`
- `learned-policy`
- `mci-trust`
- `human`

These sources may inform context or produce a weaker epistemic state, but cannot independently establish direct observation.

## 7. Optional Hermes transport

`createHermesEvidenceGovernor({ transport })` MUST work without a transport.

Without transport:

- local deterministic evaluation remains fully functional;
- no network activity occurs.

With transport:

- `collectEvidence(request)` MAY call the transport;
- the returned payload MUST NOT automatically become `OBSERVED`;
- any returned evidence still passes local normalization and deterministic evaluation.

The remote runtime is an evidence collector/advisor, not a root of epistemic authority.

## 8. Decision record

Every evaluation SHOULD return a decision object including:

- `governor: "hermes-evidence-governor/v2"`
- `accepted`
- `current`
- `proposed`
- `effective`
- `reason`
- `evidence_authority`
- `source`

For accepted direct evidence, `evidence_authority` MUST be `"direct-traceable-evidence"`.

For rejected or non-OBSERVED transitions it MUST NOT claim direct evidence authority.

## 9. Compatibility migration

`lib/integrations/adaptive/evidence-guard.js` MUST become a thin compatibility layer only.

It MUST NOT contain an independent ruleset after migration.

All old tests using `applyEvidenceProposal()` MUST continue to pass through delegation.

New tests and documentation MUST use `applyHermesEvidenceProposal()`.

## 10. TDD acceptance criteria

The test suite MUST prove:

1. direct `test` evidence can promote `INFERRED -> OBSERVED`;
2. Hermes memory cannot promote to `OBSERVED` even at confidence 1.0;
3. Hermes user model cannot promote to `OBSERVED`;
4. learned policy cannot promote to `OBSERVED`;
5. non-OBSERVED transitions continue to work;
6. invalid epistemic state fails;
7. governor works without transport;
8. optional transport can collect a candidate but cannot bypass local rules;
9. legacy `applyEvidenceProposal()` delegates and yields the same result;
10. the compatibility shim contains no duplicated decision rules;
11. no Hermes/Python runtime dependency is added.

## 11. Documentation

README and Hermes documentation MUST replace architectural references to **Evidence Guard** with **Hermes Evidence Governor**, while noting the legacy compatibility shim where relevant.

Academic provenance MUST continue to attribute Hermes Agent to Nous Research and distinguish Hermes Agent from the ReversaFeynman governor implementation.
