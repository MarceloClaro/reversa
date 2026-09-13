# SPEC — Hermes Bridge v1

Status: proposed → implementation target  
Method: Specification-Driven Development (SDD) + Test-Driven Development (TDD)  
Repository: ReversaFeynman  
Integration source: NousResearch/hermes-agent (via MarceloClaro/hermes-agent fork)

## 1. Problem

ReversaFeynman already provides reverse documentation engineering, epistemic control, governed adaptive routing, an audit ledger, drift detection and offline policy evaluation. It does not yet expose a stable boundary for longitudinal agent memory, self-improving skill proposals, execution trajectories and distributed execution outcomes.

Hermes Agent provides persistent memory, skill evolution, subagents, tools, scheduled execution and trajectory generation. Directly importing Hermes state into the Reversa evidence model would be unsafe because a remembered or learned statement is not equivalent to direct evidence.

## 2. Goal

Introduce an optional Hermes interoperability layer that can consume or emit four versioned contracts while preserving the ReversaFeynman epistemic invariants.

The integration MUST remain optional. ReversaFeynman MUST NOT require Hermes, Python, Nous Portal, a Hermes gateway, or any model provider at install time.

## 3. Non-goals

- Replacing the ReversaFeynman Evidence Guard.
- Replacing OpenCode MCI as the metacognitive/orchestration layer.
- Replacing ACME as the experimental policy-learning sidecar.
- Automatically mutating a Reversa skill from a Hermes proposal.
- Importing Hermes user modeling into scientific evidence or reward as ground truth.
- Treating confidence, memory frequency or skill success counts as `OBSERVED` evidence.
- Coupling the core installer to a Hermes runtime.

## 4. Provenance

Hermes Agent is attributed to Nous Research. `MarceloClaro/hermes-agent` is a GitHub fork of `NousResearch/hermes-agent`.

This bridge is a ReversaFeynman extension and does not claim authorship of Hermes concepts or implementation. The README and academic provenance documentation MUST state this distinction explicitly.

## 5. Contracts

### 5.1 Memory Event

Schema: `reversa.hermes.memory/v1`

Required fields:

- `schema`
- `memory_id`
- `timestamp`
- `scope`: `project | personalization | execution`
- `kind`: `fact | decision | preference | procedure | session-summary | observation`
- `content`
- `source_refs[]`
- `confidence`: `[0,1] | null`
- `epistemic_state`: `INFERRED | UNVERIFIED | BLOCKED`
- `evidence_authority: false`

Invariant HERMES-01: a Hermes memory event MUST NOT declare `OBSERVED`.

Invariant HERMES-02: `personalization` memory MUST remain isolated from evidence authority and MUST NOT be translated into a scientific/engineering observation automatically.

### 5.2 Skill Proposal

Schema: `reversa.hermes.skill.proposal/v1`

Required fields:

- `schema`
- `proposal_id`
- `timestamp`
- `skill_id`
- `change_summary`
- `proposal`
- `source_refs[]`
- `metrics.successes`
- `metrics.failures`
- `confidence`
- `mode: shadow`
- `requires_review: true`
- `requires_tests: true`
- `evidence_authority: false`

Invariant HERMES-03: a skill proposal MUST never mutate files by itself.

Invariant HERMES-04: a skill proposal MUST start in shadow mode and require review + tests before any normal repository workflow may apply it.

### 5.3 Trajectory Event

Schema: `reversa.hermes.trajectory/v1`

Required fields:

- `schema`
- `trajectory_id`
- `task_id`
- `started_at`
- `ended_at | null`
- `steps[]`
- `status`: `running | succeeded | failed | cancelled`
- `evidence_authority: false`

Each step MUST contain:

- `index`
- `action`
- `tool | null`
- `status`
- `duration_ms | null`

Invariant HERMES-05: trajectories are execution history and training/evaluation data; they are not evidence of the truth of arbitrary claims.

### 5.4 Execution Result

Schema: `reversa.hermes.execution.result/v1`

Required fields:

- `schema`
- `execution_id`
- `task_id`
- `timestamp`
- `status`: `succeeded | failed | cancelled`
- `action_id`
- `artifacts[]`
- `tests`
- `metrics`
- `direct_evidence[]`
- `evidence_authority: false`

Each direct evidence item MUST contain:

- `kind`
- `ref`
- `direct: true`

Only direct evidence kinds already accepted by the ReversaFeynman Evidence Guard may support an `OBSERVED` promotion.

Invariant HERMES-06: successful execution alone is not enough for `OBSERVED`; a direct evidence reference is required.

## 6. Memory Firewall

Function: `classifyHermesMemory(memory)`.

Rules:

1. reject invalid contract;
2. preserve `personalization` as non-evidentiary;
3. return an epistemic candidate no stronger than `INFERRED` unless separately corroborated by direct evidence outside the memory contract;
4. never call `applyEvidenceProposal(... OBSERVED ...)` from memory confidence alone.

Expected output includes:

- `accepted`
- `epistemic_state`
- `evidence_authority: false`
- `reason`

## 7. Skill Mutation Gate

Function: `governHermesSkillProposal(proposal, options)`.

Default result MUST be non-executable.

Required gates for eligibility:

- valid schema;
- shadow proposal;
- explicit `reviewApproved === true`;
- explicit `testsPassing === true`;
- explicit `feynmanApproved === true`;
- no drift flag when supplied;
- requested skill id must be non-empty;
- no evidence-authority escalation.

The gate returns eligibility only. It MUST NOT write files.

## 8. Trajectory → Adaptive Evaluation

Function: `trajectoryToLearningSignals(trajectory)`.

It MUST derive only operational signals such as:

- number of steps;
- failed steps;
- tool calls;
- total known duration;
- completion state;
- retry-like repeated actions.

It MUST NOT infer business truth or promote epistemic states.

## 9. Execution Result → Evidence Candidate

Function: `executionResultToEvidenceProposals(result, claims)`.

Rules:

- no direct evidence → no `OBSERVED` proposal;
- direct recognized evidence → may create a proposal for an explicitly mapped claim;
- each proposal must preserve `source.kind`, `source.ref`, `source.direct=true`;
- application remains delegated to the existing Evidence Guard.

## 10. Optional Transport Bridge

`createHermesBridge({ transport })` MUST provide pure builders plus optional dispatch.

Required methods:

- `memory(input)`
- `skillProposal(input)`
- `trajectory(input)`
- `executionResult(input)`
- `dispatch(contract)`

If no transport is configured, dispatch MUST return `{ requested: false }` rather than perform network activity.

## 11. Security

- No network call in builders/validators.
- No command execution.
- No file mutation from a skill proposal.
- No automatic user-model → evidence conversion.
- No automatic policy activation.
- No secret fields are introduced by the contract.
- Unknown top-level metadata may be carried only inside a `metadata` object.

## 12. TDD acceptance criteria

The test suite MUST prove at least:

1. valid Memory Event passes validation;
2. Memory Event with `OBSERVED` fails validation;
3. personalization memory remains non-evidentiary;
4. valid Skill Proposal starts in `shadow` and is not executable;
5. Skill Proposal requires review + tests + Feynman gate;
6. drift blocks proposal eligibility;
7. trajectory validation rejects malformed step ordering;
8. trajectory signals count failed steps and repeated actions;
9. execution result without direct evidence cannot promote a claim;
10. execution result with direct `test` evidence can be accepted by existing Evidence Guard;
11. bridge dispatch is inert without a transport;
12. all contracts have `evidence_authority=false`;
13. Hermes remains optional and package dependencies are unchanged.

## 13. Integration

The implementation SHOULD live in:

```text
lib/integrations/hermes/
├── constants.js
├── schema.js
├── contracts.js
├── memory-firewall.js
├── skill-governance.js
├── trajectory.js
├── evidence-adapter.js
├── bridge.js
└── index.js
```

Test target:

```text
scripts/test-hermes-bridge.mjs
```

The root `npm run verify` and GitHub verification workflow MUST include the new test.

## 14. Documentation

README MUST document:

- Hermes role in the architecture;
- optional nature of the bridge;
- memory firewall;
- skill mutation gate;
- trajectory/evaluation flow;
- provenance of Nous Research / Hermes Agent;
- invariant: Hermes memory/skill confidence ≠ `OBSERVED`.

`docs/ACADEMIC-PROVENANCE.md` SHOULD acknowledge Nous Research/Hermes as the external origin of the integrated concepts, without confusing this with authorship of the ReversaFeynman bridge.
