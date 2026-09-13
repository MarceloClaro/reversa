# CLI

Reversa has a simple CLI to manage the installation and lifecycle of agents in your project. In the MarceloClaro independent edition, commands are executed directly from `github:MarceloClaro/reversa`.

Define mentally the prefix below for all examples:

```bash
npm exec --yes --package=github:MarceloClaro/reversa -- reversa
```

This edition does not automatically synchronize with `sandeco/reversa` and the `update` command does not query the npm `reversa` package.

---

## Initial behavior

When the CLI starts and before it shows the Reversa ASCII logo, it must clear the terminal screen. The logo should appear at the top of the terminal, with no previous content above it.

The signature of this distribution is `MarceloClaro edition` on the last line of the artwork.

Expected format:

```text
  ______
  | ___ \
  | |_/ /_____   _____ _ __ ___  __ _
  |    // _ \ \ / / _ \ '__/ __|/ _` |
  | |\ \  __/\ V /  __/ |  \__ \ (_| |
  \_| \_\___| \_/ \___|_|  |___/\__,_|  MarceloClaro edition

  AI-Powered Reverse Engineering Framework
```

Historical attribution and MIT provenance are preserved in the repository documentation and license.

---

## Available commands

### `install`

```bash
npm exec --yes --package=github:MarceloClaro/reversa -- reversa install
```

Installs Reversa in the current legacy project. Detects present engines, asks for your preferences, and creates the required structure.

Use once, in the root of the project you want to analyze.

#### Installation Menu Layout

The installer must treat the menu as the main interface, not as a text dump. Questions must be numbered, have a blank line before the question, and, when options are shown, a blank line between the question and the list.

After the user confirms a multi-select question, the CLI must not print every selected item in one continuous line. Use one of these alternatives:

- Do not render the full selection and continue to the next question.
- Render a short summary, one line per team.

The installer resolves the agents shipped with this distribution and their dependencies locally.

---

### `status`

```bash
npm exec --yes --package=github:MarceloClaro/reversa -- reversa status
```

Shows the current analysis state: which phase is in progress, which agents have already run, and what's left to complete.

---

### `update`

```bash
npm exec --yes --package=github:MarceloClaro/reversa -- reversa update
```

Refreshes the managed installation from the **currently executing MarceloClaro distribution**. All agents shipped with that distribution are reconciled, including agents that did not exist when the project was first installed.

The command checks the SHA-256 manifest of each managed file and preserves files customized by the user.

Important independence property: `update` does **not** query `registry.npmjs.org/reversa/latest`, does not run `gh repo sync`, and does not fetch or merge `sandeco/reversa`.

---

### `add-engine`

```bash
npm exec --yes --package=github:MarceloClaro/reversa -- reversa add-engine
```

Adds support for an AI engine that wasn't present when you installed.

---

### `uninstall`

```bash
npm exec --yes --package=github:MarceloClaro/reversa -- reversa uninstall
```

Removes Reversa from the project: deletes the files created by the installation (`.reversa/`, `.agents/skills/reversa-*/`, engine entry files).

!!! info "Your files stay intact"
    `uninstall` removes only what Reversa created. No original project file is touched. Specifications generated in `_reversa_sdd/` are preserved by default.

---

## Independence policy

The executable guard is `scripts/verify-no-upstream-sync.py`. The normative policy is documented in `INDEPENDENCE.md` at the repository root.
