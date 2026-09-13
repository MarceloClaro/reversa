# CLI

ReversaFeynman has a simple CLI to manage the installation and lifecycle of agents in your project. Commands are executed directly from `github:MarceloClaro/reversaFeynman`.

Use this prefix for all examples:

```bash
npm exec --yes --package=github:MarceloClaro/reversaFeynman -- reversa
```

This edition does not automatically synchronize with `sandeco/reversa` and the `update` command does not query the npm `reversa` package.

---

## Initial behavior

When the CLI starts, it identifies itself as **ReversaFeynman — MarceloClaro independent edition** while keeping the `reversa` binary and `/reversa-*` skill commands for compatibility.

The visual signature remains `MarceloClaro edition`.

Historical attribution and MIT provenance are preserved in the repository documentation and license.

---

## Available commands

### `install`

```bash
npm exec --yes --package=github:MarceloClaro/reversaFeynman -- reversa install
```

Installs ReversaFeynman in the current legacy project. Detects present engines, asks for preferences, and creates the required structure.

---

### `status`

```bash
npm exec --yes --package=github:MarceloClaro/reversaFeynman -- reversa status
```

Shows the current analysis state: which phase is in progress, which agents have already run, and what's left to complete.

---

### `update`

```bash
npm exec --yes --package=github:MarceloClaro/reversaFeynman -- reversa update
```

Refreshes the managed installation from the **currently executing ReversaFeynman distribution**. All agents shipped with that distribution are reconciled, including agents that did not exist when the project was first installed.

The command checks the SHA-256 manifest of each managed file and preserves files customized by the user.

Important independence property: `update` does **not** query `registry.npmjs.org/reversa/latest`, does not run `gh repo sync`, and does not fetch or merge `sandeco/reversa`.

---

### `add-engine`

```bash
npm exec --yes --package=github:MarceloClaro/reversaFeynman -- reversa add-engine
```

Adds support for an AI engine that wasn't present when you installed.

---

### `uninstall`

```bash
npm exec --yes --package=github:MarceloClaro/reversaFeynman -- reversa uninstall
```

Removes the files created by the ReversaFeynman installation while preserving generated specifications according to the uninstall policy.

---

## Independence policy

The executable guard is `scripts/verify-no-upstream-sync.py`. The normative policy is documented in `INDEPENDENCE.md` at the repository root.

Canonical repository: `MarceloClaro/reversaFeynman`.
