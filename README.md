# ReversaFeynman

**Engenharia reversa, especificações executáveis e evolução orientada por evidências para agentes de IA.**

**Repositório canônico:** `MarceloClaro/reversaFeynman`

ReversaFeynman é a linha independente mantida por **Marcelo Claro Laranjeira**, derivada historicamente do framework Reversa original e licenciada sob MIT. Esta edição não sincroniza automaticamente com `sandeco/reversa`.

> Política completa de independência: [`INDEPENDENCE.md`](INDEPENDENCE.md)

## Diferenciais da edição ReversaFeynman

Além do pipeline de engenharia reversa e evolução por especificações, esta edição incorpora:

- handoff seguro entre skills `user-invoked`;
- **Feynman Evidence & Understanding Layer**;
- `FEG-01..FEG-06` para entendimento, proveniência, observação versus inferência, falsificabilidade, anti-cargo-cult e experimento mínimo;
- `FEG-07` Teach-back para conhecimento humano usado como fonte de especificações;
- estados `OBSERVED`, `INFERRED`, `UNVERIFIED` e `BLOCKED`;
- proveniência humana `HUMAN-VALIDATED`, `HUMAN-PARTIAL` e `HUMAN-CONFLICT`;
- auditor `/reversa-feynman`;
- validador humano `/reversa-teachback`;
- guard estrutural contra sincronização automática com upstream.

## Instalação

A edição ReversaFeynman é executada diretamente do GitHub:

```bash
npm exec --yes --package=github:MarceloClaro/reversaFeynman -- reversa install
```

Requisitos:

- Node.js `>=18.20.2`;
- um agente compatível com Agent Skills, como Claude Code, Codex, Cursor, Gemini CLI, Windsurf, OpenCode ou equivalente.

## Atualização independente

```bash
npm exec --yes --package=github:MarceloClaro/reversaFeynman -- reversa update
```

O updater:

1. usa apenas os arquivos da distribuição ReversaFeynman em execução;
2. reconcilia agentes e assets locais;
3. preserva customizações rastreadas pelo manifest SHA-256;
4. não consulta `registry.npmjs.org/reversa/latest`;
5. não usa `gh repo sync`;
6. não faz `git fetch upstream`, `git pull upstream` ou merge automático de `sandeco/reversa`.

## Compatibilidade de comandos

A identidade do projeto é **ReversaFeynman**, mas os comandos `/reversa-*` e o binário `reversa` são preservados para compatibilidade com instalações, automações e skills existentes.

| Objetivo | Comando |
|---|---|
| Engenharia reversa completa | `/reversa` |
| Discovery autônomo | `/reversa-autonomous` |
| Brainstorm estruturado | `/reversa-brainstorm` |
| Projeto greenfield | `/reversa-new` |
| Evolução de feature | `/reversa-forward` |
| Migração de legado | `/reversa-migrate` |
| Documentação visual | `/reversa-docs` |
| Diagnóstico de bugs | `/reversa-debugger` |
| Refatoração com preservação de comportamento | `/reversa-refactor` |
| Auditoria epistemológica | `/reversa-feynman` |
| Validação de conhecimento humano | `/reversa-teachback` |
| Guia dos agentes | `/reversa-agents-help` |

## Pipeline principal

```text
Reconnaissance → Excavation → Interpretation → Generation → Review
     Scout       Archaeologist    Detective       Writer     Reviewer
                                    Architect
```

O framework transforma conhecimento encontrado no legado em especificações rastreáveis e operacionais para agentes de IA.

## Feynman Evidence & Understanding Layer

| Gate | Pergunta operacional |
|---|---|
| `FEG-01` | O mecanismo pode ser explicado sem depender do nome do padrão? |
| `FEG-02` | A afirmação possui evidência e proveniência rastreável? |
| `FEG-03` | Observação, inferência e incerteza estão separadas? |
| `FEG-04` | Existe teste, oracle ou cenário capaz de refutar a afirmação? |
| `FEG-05` | A solução resolve uma necessidade demonstrada ou é cargo cult? |
| `FEG-06` | Existe o menor experimento capaz de reduzir a incerteza? |
| `FEG-07` | A fonte humana consegue reconstruir o mecanismo e transferi-lo para cenário variante? |

### `/reversa-feynman`

Auditor somente-leitura que produz `feynman-audit.md`. O score-base permanece `0..12`, calculado sobre `FEG-01..FEG-06`.

### `/reversa-teachback`

Usado quando uma decisão material depende de conhecimento humano que não pode ser comprovado diretamente no repositório. O fluxo usa explicação livre, probe causal e cenário variante.

Um resultado `TEACHBACK_GREEN` pode produzir `HUMAN-VALIDATED`, mas **não transforma a afirmação automaticamente em `OBSERVED`**.

## Confiança e evidência

- `OBSERVED` — evidência direta em código, execução, teste, contrato ou artefato;
- `INFERRED` — dedução plausível ainda não observada diretamente;
- `UNVERIFIED` — afirmação sem sustentação suficiente;
- `BLOCKED` — validação necessária, porém recurso indisponível;
- `HUMAN-VALIDATED` — conhecimento humano validado por Teach-back, separado de evidência técnica direta.

## Independência de upstream

O repositório pode estudar ideias, papers e implementações externas, inclusive alterações do projeto Reversa original. Qualquer incorporação exige decisão explícita, revisão própria e commit específico nesta árvore.

O CI bloqueia padrões como:

```text
gh repo sync
git remote add upstream
git remote set-url upstream
git fetch upstream
git pull upstream
git merge upstream/...
```

O guard é `scripts/verify-no-upstream-sync.py`.

## Estrutura principal

```text
agents/                   Skills e agentes
bin/                      CLI
lib/                      Installer, comandos e runtime auxiliar
scripts/                  Verificações estruturais e smoke tests
specs/                    Especificações formais da evolução
docs/                     Documentação
INDEPENDENCE.md           Política normativa da linha ReversaFeynman
```

## Desenvolvimento

```bash
git clone https://github.com/MarceloClaro/reversaFeynman.git
cd reversaFeynman
npm install
npm run verify
```

`npm run verify` inclui:

- guard contra sincronização automática de upstream;
- verificação do eixo de invocação;
- verificação da Feynman Evidence & Understanding Layer;
- smoke test do transporte do installer.

## Proveniência

ReversaFeynman deriva do projeto **Reversa** original. A independência desta árvore não apaga essa origem.

Paper associado ao framework original:

> *Reversa: A Reverse Documentation Engineering Framework for Converting Legacy Software into Operational Specifications for AI Agents* — Macedo & da Costa, 2026.

As evoluções ReversaFeynman, incluindo os gates de evidência, Teach-back e política de distribuição independente, são mantidas na linha `MarceloClaro/reversaFeynman`.

## Licença

MIT — consulte [`LICENSE`](LICENSE).
