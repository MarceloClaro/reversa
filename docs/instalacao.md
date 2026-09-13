# Installation

## Requirements

- **Node.js 18+** installed on your machine

If you don't have Node.js, install it at [nodejs.org](https://nodejs.org) and come back here.

---

## ReversaFeynman — MarceloClaro independent edition

This repository is maintained independently under the canonical identity `MarceloClaro/reversaFeynman` and does not automatically synchronize with `sandeco/reversa`.

In the root of the legacy project you want to analyze, install directly from this GitHub repository:

```bash
npm exec --yes --package=github:MarceloClaro/reversaFeynman -- reversa install
```

The installer does all of this for you:

1. Detects the AI engines present in the environment (Claude Code, Codex, Cursor, Gemini CLI, Windsurf)
2. Asks which agent **Teams** to install. `Reversa Agents Core` and `Bug Agents` are always included; optional teams are resolved with their dependencies
3. Collects project name, language, and preferences
4. Copies agents to `.agents/skills/` and `.claude/skills/` (for Claude Code)
5. Creates the engine entry file (`CLAUDE.md`, `AGENTS.md`, etc.)
6. Creates the `.reversa/` structure with state, configuration, and plan
7. Generates the SHA-256 manifest for safe future updates

---

## What gets created in the project

```text
legacy-project/
├── .reversa/               ← analysis state, config, and context
├── .agents/skills/         ← universal agents (all engines)
├── .claude/skills/         ← mirror for Claude Code
├── CLAUDE.md               ← entry point for Claude Code (if detected)
├── AGENTS.md               ← entry point for Codex (if detected)
└── _reversa_sdd/           ← where specs will be generated
```

!!! success "Your files stay intact"
    The installer preserves the legacy by default and uses the Reversa policy gates for controlled writes.

---

## Updating this edition

Run the update from the same ReversaFeynman distribution:

```bash
npm exec --yes --package=github:MarceloClaro/reversaFeynman -- reversa update
```

The updater uses the files bundled with the running `MarceloClaro/reversaFeynman` distribution. It does not query the npm `reversa` package and does not fetch or merge `sandeco/reversa`.

See [INDEPENDENCE.md](https://github.com/MarceloClaro/reversaFeynman/blob/main/INDEPENDENCE.md) for the complete policy.

---

## Backup before starting

!!! warning "Strong recommendation: make a backup"
    Before starting the analysis:

    1. Make sure all files are committed in Git
    2. Have the repository on GitHub, GitLab, or Bitbucket
    3. Make a local copy of the folder as extra safety

---

## Adding another engine later

```bash
npm exec --yes --package=github:MarceloClaro/reversaFeynman -- reversa add-engine
```

The installer detects what already exists and adds only what's missing.
