# ReversaBench Experimental Harness

This directory contains manifests and reproducibility metadata for the ReversaFeynman evaluation protocol.

## Status

The current repository includes an engineering **smoke** manifest only. Smoke fixtures validate task registration, pairing, aggregation, bootstrap output and paper rendering. They are synthetic and must never be cited as comparative performance evidence.

## Required task provenance

Every non-smoke task must record:

- `task_id`;
- suite name;
- immutable repository URL;
- immutable commit SHA;
- task kind;
- benchmark-specific metadata.

## Variants

The default paired comparison uses:

1. `reversa-original`;
2. `reversafeynman-core`;
3. `minimal-repair`;
4. `reversafeynman-v5`.

The same task/seed cell should use equivalent model, decoding, tool budget, timeout and retry policy whenever a scientifically controlled comparison is intended.

## Smoke validation

```bash
node scripts/run-reversabench-smoke.mjs \
  benchmarks/reversabench/manifest.smoke.json \
  .reversa-bench/smoke-report.json

node scripts/render-reversabench-report.mjs \
  .reversa-bench/smoke-report.json \
  paper/generated/reversabench-smoke.tex
```

The generated report remains non-confirmatory.

## Confirmatory experiments

Confirmatory manifests must set task `smoke=false` and should use real immutable repositories/tasks. The harness does not fabricate missing outcomes. External model/tool execution is supplied by adapters or experiment runners and each recorded run must preserve the seed and provenance.

`causal_claim=false` remains the default. A benchmark comparison becomes causal only under an experimental design that justifies causal identification; the harness does not infer that automatically.
