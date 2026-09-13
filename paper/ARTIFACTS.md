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
| ReversaBench | `lib/integrations/software-engineering/benchmark.js` |
| MCP-ready gateway | `lib/integrations/software-engineering/mcp-gateway.js` |
| Durable workflow | `lib/integrations/software-engineering/durable-workflow.js` |
| Offline optimizer | `lib/integrations/software-engineering/offline-optimizer.js` |
| v5 TDD acceptance suite | `scripts/test-software-engineering-intelligence-v5.mjs` |
| Global verification suite | `npm run verify`, `.github/workflows/verify-invocation.yml` |

## Experimental artifact requirements

Any future empirical paper revision should archive, for every reported run:

1. immutable repository commit;
2. task identifier and benchmark version;
3. model/provider/version and decoding settings;
4. random seeds;
5. provider/adapter versions;
6. normalized execution results;
7. ReversaBench records;
8. traces required for error analysis;
9. statistical-analysis scripts;
10. exact ReversaFeynman commit/tag.

The manuscript deliberately separates **implemented capability** from **empirically demonstrated benefit**. This artifact map supports independent verification of the former and preparation of experiments for the latter.
