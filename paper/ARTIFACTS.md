# Artifact map for the ReversaFeynman paper

This file links manuscript claims to concrete implementation artifacts.

| Paper topic | Primary artifact(s) |
|---|---|
| Original Reversa provenance | `docs/ACADEMIC-PROVENANCE.md`, `docs/REVERSA-ORIGINAL-VS-FEYNMAN.md`, `CITATION.cff` |
| Feynman Evidence & Understanding | `specs/SPEC-FEYNMAN-EVIDENCE-UNDERSTANDING-LAYER.md`, `agents/reversa-feynman/` |
| Teach-back / FEG-07 | `agents/reversa-teachback/`, Feynman references/specification |
| Invocation governance | `docs/invocation-policy.md`, `scripts/verify-invocation.py` |
| Adaptive MCI/ACME bridge | `specs/SPEC-ADAPTIVE-MCI-ACME-BRIDGE.md`, `lib/integrations/adaptive/` |
| Adaptive Governance v2 | `specs/SPEC-ADAPTIVE-GOVERNANCE-V2.md`, adaptive runtime/ledger/drift/policy modules |
| Offline Policy Evaluation v3 | `specs/SPEC-ADAPTIVE-OFFLINE-EVALUATION-V3.md`, `scripts/test-offline-policy-evaluation.mjs` |
| Hermes Bridge | `specs/SPEC-HERMES-BRIDGE-V1.md`, `lib/integrations/hermes/` |
| Hermes Evidence Governor | `specs/SPEC-HERMES-EVIDENCE-GOVERNOR-V2.md`, `lib/integrations/hermes/evidence-governor.js` |
| Software Engineering Intelligence v5 | `specs/SPEC-SOFTWARE-ENGINEERING-INTELLIGENCE-V5.md`, `lib/integrations/software-engineering/` |
| Strict v5 contracts | `schemas/software-engineering-v5.schema.json`, `lib/integrations/software-engineering/strict-contracts.js` |
| Code Intelligence | `lib/integrations/software-engineering/code-intelligence.js` |
| Execution Fabric | `lib/integrations/software-engineering/execution-fabric.js` |
| Repair Laboratory | `lib/integrations/software-engineering/repair-laboratory.js` |
| Quality / mutation gates | `lib/integrations/software-engineering/quality-gates.js` |
| Observability | `lib/integrations/software-engineering/observability.js` |
| ReversaBench basic aggregation | `lib/integrations/software-engineering/benchmark.js` |
| ReversaBench Experimental Harness | `specs/SPEC-REVERSABENCH-EXPERIMENTAL-HARNESS-V1.md`, `lib/integrations/software-engineering/experimental-harness.js` |
| ReversaBench TDD | `scripts/test-reversabench-experimental-harness.mjs` |
| Smoke pipeline | `benchmarks/reversabench/manifest.smoke.json`, `scripts/run-reversabench-smoke.mjs` |
| Paper table renderer | `scripts/render-reversabench-report.mjs`, `paper/sections/06a-experimental-status.tex` |
| IMO Scientific Orchestration | `specs/SPEC-IMO-SCIENTIFIC-ORCHESTRATION-V1.md`, `lib/integrations/math/imo-orchestrator.js` |
| IMO provider routing | `lib/integrations/math/provider-router.js`, `scripts/run-imo-superhuman.mjs` |
| IMO benchmark provenance | `benchmarks/imo-superhuman/source.json`, `benchmarks/imo-superhuman/README.md` |
| IMO task extraction | `scripts/extract-imobench-problem.py` |
| IMO orchestration TDD | `scripts/test-imo-scientific-orchestration.mjs` |
| IMO synthetic smoke | `scripts/run-imo-orchestration-smoke.mjs`, `.github/workflows/imo-orchestration.yml` |
| IMO paper protocol | `paper/sections/06b-imo-scientific-orchestration.tex` |
| MCP-ready gateway | `lib/integrations/software-engineering/mcp-gateway.js` |
| Durable workflow | `lib/integrations/software-engineering/durable-workflow.js` |
| Offline optimizer | `lib/integrations/software-engineering/offline-optimizer.js` |
| v5 TDD acceptance suite | `scripts/test-software-engineering-intelligence-v5.mjs` |
| Global verification suite | `npm run verify`, `.github/workflows/verify-invocation.yml` |
| ReversaBench CI | `.github/workflows/reversabench.yml` |

## Experimental artifact requirements

Every reported confirmatory run must archive:

1. immutable repository commit;
2. task identifier and benchmark version;
3. model/provider/version and decoding settings;
4. random seeds;
5. provider/adapter versions;
6. normalized execution results;
7. ReversaBench/IMO orchestration records;
8. traces required for error analysis;
9. statistical-analysis scripts;
10. exact ReversaFeynman commit/tag.

For IMO multi-model runs, also archive the role assignment (proposer/critic/verifier/reviser/judge), request/response hashes, judge disagreement, candidate lineage, and proof of benchmark-reference isolation from non-judge roles.

## Result gate

The paper distinguishes four operational states:

- **implemented capability** — code/SPEC/test exists;
- **engineering smoke validation** — synthetic fixtures verify the evaluation machinery;
- **pilot/replay** — real or historical model outputs without all confirmatory controls;
- **confirmatory empirical result** — real multi-model runs over immutable benchmark tasks with independent judges and reference isolation.

The ReversaBench and IMO orchestration harnesses enforce part of this distinction mechanically. Smoke output is therefore not a substitute for comparative evidence, and replayed public solutions are not mislabeled as new model inference.

The manuscript deliberately separates **implemented capability** from **empirically demonstrated benefit**. This artifact map supports independent verification of the former and controlled experiments for the latter.
