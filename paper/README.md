# Paper — ReversaFeynman

Este diretório contém o manuscrito acadêmico reproduzível do ReversaFeynman, com foco na evolução **Software Engineering Intelligence v5** e sua integração com a base do Reversa original.

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
- protocolo experimental para comparar Reversa original, baselines mínimos e ReversaFeynman.

O artigo **não afirma superioridade empírica comprovada** nesta versão. ReversaBench e os demais mecanismos de avaliação são apresentados como infraestrutura implementada e protocolo de validação para estudos controlados.

## Estrutura

```text
paper/
├── main.tex
├── references.bib
├── README.md
└── sections/
    ├── 01-introduction.tex
    ├── 02-background.tex
    ├── 03-method.tex
    ├── 04-architecture.tex
    ├── 05-implementation.tex
    ├── 06-evaluation.tex
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

## Reprodutibilidade

A implementação discutida pelo artigo está no mesmo repositório. A versão exata usada em experimentos deve ser identificada por commit/tag e acompanhada dos artefatos ReversaBench correspondentes.

## Proveniência

O ReversaFeynman é uma linha derivada do **Reversa** original de Sanderson Oliveira de Macedo e Ronaldo Martins da Costa. A contribuição derivada mantém atribuição explícita ao trabalho de origem e distingue as extensões posteriores implementadas nesta linha.
