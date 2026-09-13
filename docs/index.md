# Reversa — MarceloClaro Edition

**Turn legacy systems into executable specifications for AI agents.**

This documentation belongs to the independent `MarceloClaro/reversa` line. It derives historically from the original Reversa project but does not automatically synchronize with `sandeco/reversa`.

---

## What is Reversa?

Reversa is a specification reverse-engineering framework. You install it inside a legacy project, activate an AI agent you already use, and it coordinates a team of specialists to analyze the code and generate complete, traceable, ready-to-use specifications for any coding agent.

The MarceloClaro edition also includes the Feynman Evidence & Understanding Layer and the Teach-back gate for validating human knowledge used as a specification source.

---

## Quick start

In the root of your project, install directly from this repository:

```bash
npm exec --yes --package=github:MarceloClaro/reversa -- reversa install
```

Then open the project in your favorite AI agent and choose the workflow:

```text
/reversa              # discover and specify an existing system
/reversa-autonomous   # same discovery, end to end, with no intermediate stops
/reversa-new          # turn a new product idea into PRD and SDD specs
/reversa-forward      # evolve the system from specs to code, one feature at a time
/reversa-debugger     # register and trace a defect back to the specs
/reversa-feynman      # audit evidence, understanding and falsifiability
/reversa-teachback    # validate material human knowledge without calling it OBSERVED
```

To update using the same independent distribution:

```bash
npm exec --yes --package=github:MarceloClaro/reversa -- reversa update
```

The updater does not query the npm `reversa` package and does not fetch or merge `sandeco/reversa`.

---

## What you'll find here

<div class="grid cards" markdown>

- **Why Reversa exists**

    The problem it solves and why it matters.

    [:octicons-arrow-right-24: Read more](por-que-reversa.md)

- **Installation**

    Install directly from `MarceloClaro/reversa`.

    [:octicons-arrow-right-24: Install](instalacao.md)

- **Analysis pipeline**

    The phases that turn code into specification.

    [:octicons-arrow-right-24: See pipeline](pipeline.md)

- **Agents**

    Specialized teams for discovery, forward development, migration, quality, documentation, pricing, bugs and translators.

    [:octicons-arrow-right-24: See agents](agentes/index.md)

- **Start a new project**

    Go from a one-line idea to personas, PRD and scored SDD specs.

    [:octicons-arrow-right-24: Use /reversa-new](newproject/index.md)

</div>

---

## Independent distribution policy

The source of truth for this edition is `MarceloClaro/reversa`. The repository contains an executable guard, `scripts/verify-no-upstream-sync.py`, which rejects automated upstream synchronization patterns in GitHub workflows.

See the normative policy in [`INDEPENDENCE.md`](../INDEPENDENCE.md).

---

## Safety guarantee

!!! danger "💾 Back up your project before starting"
    Although Reversa is designed to preserve your files, AI agents can make mistakes. **We strongly recommend:**

    1. **Version the project in Git** — make sure all files are committed before starting the analysis
    2. **Have the repository on GitHub** (or GitLab, Bitbucket) — so you have a safe remote copy
    3. **Make a local copy of the folder** — a simple `cp -r my-project my-project-backup` protects against any unexpected event

    If something unexpected happens, you can restore the original state with `git restore .` or from the backup copy.

!!! warning "Reversa protects the legacy by default"
    Discovery agents write to `.reversa/` and the configured output folders. Code-changing workflows remain governed by explicit approval/policy gates.

!!! info "No API keys"
    Reversa does not request, store, or transmit API keys from any service. The intelligence comes from the agent you already use in your environment, like Claude Code, Codex, Gemini CLI etc.
