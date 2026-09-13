# Installation

## Requirements

- **Node.js 18+** installed on your machine

If you don't have Node.js, install it at [nodejs.org](https://nodejs.org) and come back here.

---

## MarceloClaro independent edition

This repository is maintained independently at `MarceloClaro/reversa` and does not automatically synchronize with `sandeco/reversa`.

In the root of the legacy project you want to analyze, install directly from this GitHub repository:

```bash
npm exec --yes --package=github:MarceloClaro/reversa -- reversa install
```

The installer does all of this for you:

1. Detects the AI engines present in the environment (Claude Code, Codex, Cursor, Gemini CLI, Windsurf)
2. Asks which agent **Teams** to install. `Reversa Agents Core` and `Bug Agents` are always included; optional teams are resolved with their dependencies
3. Collects project name, language, and preferences
4. Copies agents to `.agents/skills/` and `.claude/skills/` (for Claude Code)
5. Creates the engine entry file (`CLAUDE.md`, `AGENTS.md`, etc.)
6. Creates the `.reversa/` structure with state, configuration, and plan
7. Generates the SHA-256 manifest for safe future updates

It's like `npm install`, but for your reverse engineering agent team.

---

## What gets created in the project

```
legacy-project/
├── .reversa/               ← analysis state, config, and context
├── .agents/skills/         ← universal agents (all engines)
├── .claude/skills/         ← mirror for Claude Code
├── CLAUDE.md               ← entry point for Claude Code (if detected)
├── AGENTS.md               ← entry point for Codex (if detected)
└── _reversa_sdd/           ← where specs will be generated (empty initially)
```

!!! success "Your files stay intact"
    The installer **only creates new files**. It never modifies or deletes any existing file in your project.

---

## Updating this edition

Run the update from the same MarceloClaro distribution:

```bash
npm exec --yes --package=github:MarceloClaro/reversa -- reversa update
```

The updater uses the files bundled with the running `MarceloClaro/reversa` distribution. It does not query the npm `reversa` package and does not fetch or merge `sandeco/reversa`.

See [INDEPENDENCE.md](https://github.com/MarceloClaro/reversa/blob/main/INDEPENDENCE.md) in the repository for the complete policy.

---

## Backup before starting

!!! warning "Strong recommendation: make a backup"
    Although Reversa is designed to preserve your files, AI agents can make mistakes. Before starting the analysis:

    1. Make sure all files are committed in Git
    2. Have the repository on GitHub, GitLab, or Bitbucket
    3. Make a local copy of the folder as extra safety: `cp -r my-project my-project-backup`

    If something unexpected happens, `git restore .` fixes it.

---

## Adding another engine later

If you want to add support for another engine later:

```bash
npm exec --yes --package=github:MarceloClaro/reversa -- reversa add-engine
```

The installer detects what already exists and adds only what's missing.
