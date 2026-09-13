# ReversaFeynman — MarceloClaro Edition

**Turn legacy systems into executable specifications for AI agents, with evidence and Feynman-style understanding gates.**

This documentation belongs to the independent `MarceloClaro/reversaFeynman` line. It derives historically from the original Reversa project but does not automatically synchronize with `sandeco/reversa`.

---

## What is ReversaFeynman?

ReversaFeynman is an independent evolution of the Reversa specification reverse-engineering framework. It coordinates specialized AI agents to analyze legacy code, generate traceable specifications and evolve systems while explicitly tracking evidence, inference, uncertainty and human knowledge.

The MarceloClaro edition includes the **Feynman Evidence & Understanding Layer** and **Teach-back** validation for knowledge used as a specification source.

---

## Quick start

Install directly from the canonical repository:

```bash
npm exec --yes --package=github:MarceloClaro/reversaFeynman -- reversa install
```

Then use the compatible workflow commands:

```text
/reversa              # discover and specify an existing system
/reversa-autonomous   # discovery end to end
/reversa-new          # new project to PRD and SDD specs
/reversa-forward      # evolve the system from specs to code
/reversa-debugger     # trace defects back to specs
/reversa-feynman      # audit evidence, understanding and falsifiability
/reversa-teachback    # validate material human knowledge
```

Update using the same independent distribution:

```bash
npm exec --yes --package=github:MarceloClaro/reversaFeynman -- reversa update
```

The updater does not query the npm `reversa` package and does not fetch or merge `sandeco/reversa`.

---

## What you'll find here

<div class="grid cards" markdown>

- **Why ReversaFeynman exists**

    Reverse engineering plus explicit evidence and understanding controls.

    [:octicons-arrow-right-24: Read more](por-que-reversa.md)

- **Installation**

    Install directly from `MarceloClaro/reversaFeynman`.

    [:octicons-arrow-right-24: Install](instalacao.md)

- **Analysis pipeline**

    The phases that turn code into specification.

    [:octicons-arrow-right-24: See pipeline](pipeline.md)

- **Agents**

    Specialized teams for discovery, forward development, migration, quality, documentation, pricing, bugs and translators.

    [:octicons-arrow-right-24: See agents](agentes/index.md)

- **Feynman layer**

    Evidence, falsifiability, anti-cargo-cult, uncertainty and teach-back gates.

    [:octicons-arrow-right-24: See agents](agentes/index.md)

</div>

---

## Independent distribution policy

The source of truth for this edition is `MarceloClaro/reversaFeynman`. The repository contains `scripts/verify-no-upstream-sync.py`, which rejects automated upstream synchronization patterns in GitHub workflows.

See [INDEPENDENCE.md](https://github.com/MarceloClaro/reversaFeynman/blob/main/INDEPENDENCE.md).

---

## Safety guarantee

!!! danger "Back up your project before starting"
    Keep the legacy versioned in Git and maintain a recoverable copy before automated analysis or code-changing workflows.

!!! warning "Controlled legacy writes"
    Discovery agents write to `.reversa/` and configured output folders. Code-changing workflows remain governed by explicit approval and policy gates.

!!! info "No API keys"
    ReversaFeynman does not request, store, or transmit LLM API keys. Intelligence comes from the agent already running in your environment.
