# ReversaFeynman — academic paper

The repository includes a reproducible academic manuscript describing the ReversaFeynman architecture, Software Engineering Intelligence v5, and an executable ReversaBench evaluation harness.

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

## Working title

**ReversaFeynman: Evidence-Governed Software Engineering Agents for Reverse Documentation, Repair, and Adaptive Evaluation**

## Scientific status

The current manuscript presents an **implemented research framework, an executable experimental harness, and a pre-specified evaluation protocol**. It deliberately does not claim empirical superiority over the original Reversa or competing coding-agent systems until controlled non-smoke benchmark results are available.

The paper cites the original Reversa work by Sanderson Oliveira de Macedo and Ronaldo Martins da Costa as the foundational framework and distinguishes inherited capabilities from ReversaFeynman extensions.
