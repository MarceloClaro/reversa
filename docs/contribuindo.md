# Contributing

Contributions are welcome. This documentation refers to the independent `MarceloClaro/reversa` line.

---

## Before submitting a PR

Open an issue first to discuss what you want to change. This avoids wasted work on both sides, especially for larger changes.

Changes from external projects, including the original Reversa upstream, must be reviewed and committed explicitly. This repository does not perform automatic upstream synchronization.

---

## Local setup

```bash
git clone https://github.com/MarceloClaro/reversa.git
cd reversa
npm install
npm run verify
```

---

## Project structure

```
reversa/
├── agents/             ← each agent has its folder with SKILL.md
├── bin/                ← CLI entry point (reversa.js)
├── lib/
│   ├── commands/       ← CLI command implementations
│   └── installer/      ← installation and engine detection logic
├── scripts/            ← structural guards and smoke tests
├── specs/              ← formal evolution specifications
├── templates/          ← config templates and engine entry files
└── docs/               ← documentation (you are here)
```

---

## Adding a new agent

1. Create the folder `agents/reversa-[name]/`
2. Create `SKILL.md` following the format of existing agents
3. Add a `references/` folder if the agent needs schema or reference templates
4. Verify installer discovery/transport
5. Add structural checks when the new agent introduces an invariant
6. Run `npm run verify`

---

## Upstream policy

Do not add automated `gh repo sync`, `git fetch upstream`, `git pull upstream`, or merge jobs from `sandeco/reversa`.

See [`INDEPENDENCE.md`](../INDEPENDENCE.md).

---

## License and provenance

MIT. See [`LICENSE`](../LICENSE).

This line derives historically from the original Reversa project; attribution is preserved while development and release policy are maintained independently under `MarceloClaro/reversa`.
