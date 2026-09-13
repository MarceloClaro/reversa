# Paper — ReversaFeynman

Este diretório contém o manuscrito acadêmico reproduzível do ReversaFeynman, com foco na evolução **Software Engineering Intelligence v5**, sua integração com a base do Reversa original e o ReversaBench Experimental Harness.

## Título de trabalho

**ReversaFeynman: Evidence-Governed Software Engineering Agents for Reverse Documentation, Repair, and Adaptive Evaluation**

## Escopo científico

O manuscrito descreve:

- a origem no Reversa de Macedo e Costa;
- a extensão Feynman/FEG para governança epistemológica;
- Hermes Evidence Governor;
- MCI/ACME e avaliação offline;
- Software Engineering Intelligence v5;
- SDD/TDD usados na evolução do próprio framework;
- protocolo experimental para comparar Reversa original, baselines mínimos e ReversaFeynman;
- ReversaBench Experimental Harness para task×seed pairing, bootstrap, false-OBSERVED e result gating.

O artigo **não afirma superioridade empírica comprovada** nesta versão. O harness já é executável, mas o repositório contém somente um manifesto smoke sintético para validar a infraestrutura. Smoke não é resultado científico.

## Estrutura

```text
paper/
├── main.tex
├── references.bib
├── ARTIFACTS.md
├── README.md
├── generated/                 # artefatos gerados localmente/CI
└── sections/
    ├── 01-introduction.tex
    ├── 02-background.tex
    ├── 03-method.tex
    ├── 04-architecture.tex
    ├── 05-implementation.tex
    ├── 06-evaluation.tex
    ├── 06a-experimental-status.tex
    ├── 07-related-work.tex
    ├── 08-threats.tex
    └── 09-conclusion.tex
```

## Compilação

```bash
cd paper
pdflatex main.tex
bibtex main
pdflatex main.tex
pdflatex main.tex
```

Alternativamente:

```bash
latexmk -pdf main.tex
```

## Validar o harness experimental

Na raiz do repositório:

```bash
node scripts/test-reversabench-experimental-harness.mjs
npm run bench:smoke:paper
```

Isso produz:

```text
.reversa-bench/smoke-report.json
paper/generated/reversabench-smoke.tex
```

O smoke report contém `scientific_result=false`. Uma tentativa `confirmatory=true` é recusada enquanto houver apenas runs smoke.

## Resultado confirmatório

O manuscrito só inclui automaticamente uma tabela confirmatória quando existir:

```text
paper/generated/reversabench-confirmatory.tex
```

Esse arquivo deve ser gerado a partir de runs reais `smoke=false`. O harness exige pelo menos duas variantes e uma célula task×seed pareada antes de marcar o report como confirmatório. Mesmo então, `causal_claim=false` permanece por padrão.

## Reprodutibilidade

A implementação discutida pelo artigo está no mesmo repositório. A versão exata usada em experimentos deve ser identificada por commit/tag e acompanhada dos artefatos ReversaBench correspondentes: tasks, runs, seeds, configuração do modelo, adapters, traces e análise estatística.

## Proveniência

O ReversaFeynman é uma linha derivada do **Reversa** original de Sanderson Oliveira de Macedo e Ronaldo Martins da Costa. A contribuição derivada mantém atribuição explícita ao trabalho de origem e distingue as extensões posteriores implementadas nesta linha.
