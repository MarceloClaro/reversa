# Validação local do ReversaFeynman

O projeto não usa GitHub Actions para validação, benchmark ou compilação do paper.

## Verificação principal

```bash
npm install
npm run verify
```

## ReversaBench smoke

```bash
npm run bench:smoke
npm run bench:smoke:paper
```

## IMO Scientific Orchestration smoke

```bash
node scripts/test-imo-scientific-orchestration.mjs
node scripts/run-imo-orchestration-smoke.mjs
```

## Paper

```bash
cd paper
latexmk -pdf main.tex
```

ou:

```bash
cd paper
pdflatex main.tex
bibtex main
pdflatex main.tex
pdflatex main.tex
```

## Princípio de validação

- smoke valida infraestrutura, não desempenho científico;
- resultados confirmatórios exigem execuções reais e artefatos versionados;
- mocks, replays e resultados sintéticos não são tratados como evidência de superioridade;
- todo resultado experimental deve registrar commit, dataset, modelos, providers, versões, seeds e configuração.
