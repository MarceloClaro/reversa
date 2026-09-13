# ReversaFeynman — academic paper

The repository includes a reproducible academic manuscript describing the ReversaFeynman architecture, Software Engineering Intelligence v5, the executable ReversaBench harness, and a multi-model mathematical-reasoning protocol over Google DeepMind IMO-Bench.

## Manuscript

- LaTeX entry point: [`paper/main.tex`](paper/main.tex)
- Bibliography: [`paper/references.bib`](paper/references.bib)
- Section modules: [`paper/sections/`](paper/sections/)
- Reproducibility map: [`paper/ARTIFACTS.md`](paper/ARTIFACTS.md)
- Compilation instructions: [`paper/README.md`](paper/README.md)

## Experimental harness

- SPEC: [`specs/SPEC-REVERSABENCH-EXPERIMENTAL-HARNESS-V1.md`](specs/SPEC-REVERSABENCH-EXPERIMENTAL-HARNESS-V1.md)
- Runtime: [`lib/integrations/software-engineering/experimental-harness.js`](lib/integrations/software-engineering/experimental-harness.js)
- TDD: [`scripts/test-reversabench-experimental-harness.mjs`](scripts/test-reversabench-experimental-harness.mjs)
- Smoke manifest: [`benchmarks/reversabench/manifest.smoke.json`](benchmarks/reversabench/manifest.smoke.json)
- Benchmark documentation: [`benchmarks/reversabench/README.md`](benchmarks/reversabench/README.md)

The smoke dataset is synthetic and exists only to validate the benchmark machinery. It is machine-gated from confirmatory reporting. A confirmatory report requires non-smoke runs, at least two variants, and at least one paired task×seed cell.

## IMO Scientific Orchestration

- SPEC: [`specs/SPEC-IMO-SCIENTIFIC-ORCHESTRATION-V1.md`](specs/SPEC-IMO-SCIENTIFIC-ORCHESTRATION-V1.md)
- Runtime: [`lib/integrations/math/imo-orchestrator.js`](lib/integrations/math/imo-orchestrator.js)
- Provider router: [`lib/integrations/math/provider-router.js`](lib/integrations/math/provider-router.js)
- Benchmark provenance: [`benchmarks/imo-superhuman/source.json`](benchmarks/imo-superhuman/source.json)
- TDD: [`scripts/test-imo-scientific-orchestration.mjs`](scripts/test-imo-scientific-orchestration.mjs)
- Synthetic smoke: [`scripts/run-imo-orchestration-smoke.mjs`](scripts/run-imo-orchestration-smoke.mjs)
- Real-provider runner: [`scripts/run-imo-superhuman.mjs`](scripts/run-imo-superhuman.mjs)

The mathematical protocol uses independent proposers, cross-model critics, verifiers, revisers, blind judges, and explicit reference-answer isolation. Runs are classified as `smoke`, `replay`, `pilot`, or `multi-model-confirmatory`. Only the last class can set `scientific_result=true`, and benchmark results never receive epistemic authority over unrelated claims.

## Working title

**ReversaFeynman: Evidence-Governed Software Engineering Agents for Reverse Documentation, Repair, and Adaptive Evaluation**

## Scientific status

The current manuscript presents an **implemented research framework, executable evaluation/orchestration harnesses, and pre-specified experimental protocols**. It deliberately does not claim empirical superiority over the original Reversa, competing coding-agent systems, or individual mathematical reasoning models until controlled non-smoke/non-replay benchmark results are available.

The paper cites the original Reversa work by Sanderson Oliveira de Macedo and Ronaldo Martins da Costa as the foundational framework and cites Luong et al. for IMO-Bench. Inherited capabilities, external benchmarks, and ReversaFeynman extensions remain explicitly separated.
