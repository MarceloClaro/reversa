# Reversa — MarceloClaro Independent Edition

**Engenharia reversa, especificações executáveis e evolução orientada por evidências para agentes de IA.**

Este repositório é a linha independente mantida em **`MarceloClaro/reversa`**. Ele deriva historicamente do projeto Reversa original, preserva sua licença MIT e a atribuição correspondente, mas **não sincroniza automaticamente com `sandeco/reversa`**.

> Fonte de verdade desta edição: `https://github.com/MarceloClaro/reversa`
>
> Política completa: [`INDEPENDENCE.md`](INDEPENDENCE.md)

## O que muda nesta edição

A edição MarceloClaro mantém o núcleo de engenharia reversa do Reversa e adiciona uma linha própria de evolução, incluindo:

- correção do handoff seguro entre skills `user-invoked`;
- Feynman Evidence & Understanding Layer;
- gates `FEG-01..FEG-06` para entendimento, proveniência, falsificabilidade, anti-cargo-cult e incerteza;
- `FEG-07` Teach-back para validar conhecimento humano usado como fonte de especificações;
- separação entre `OBSERVED`, `INFERRED`, `UNVERIFIED`, `BLOCKED` e origem humana `HUMAN-VALIDATED`;
- auditor dedicado `/reversa-feynman`;
- validação humana dedicada `/reversa-teachback`;
- política explícita de não sincronização automática com upstream.

## Instalação

Não use `npx reversa install` para esta edição, pois esse nome pode resolver para a distribuição publicada no registro npm do projeto original.

Execute diretamente a versão hospedada neste repositório:

```bash
npm exec --yes --package=github:MarceloClaro/reversa -- reversa install
```

Requisitos:

- Node.js `>=18.20.2`;
- um agente compatível com Agent Skills, como Claude Code, Codex, Cursor, Gemini CLI, Windsurf, OpenCode ou equivalente.

## Atualização sem upstream

Para atualizar uma instalação com a versão atual da linha MarceloClaro:

```bash
npm exec --yes --package=github:MarceloClaro/reversa -- reversa update
```

O comando `update` desta edição:

1. usa a própria distribuição `MarceloClaro/reversa` que está executando a CLI;
2. reconcilia agentes e assets a partir desses arquivos locais;
3. preserva arquivos modificados pelo usuário com base no manifest SHA-256;
4. não consulta `registry.npmjs.org/reversa/latest`;
5. não executa `gh repo sync`;
6. não executa `git fetch upstream`, `git pull upstream` ou merge automático de `sandeco/reversa`.

O guard `scripts/verify-no-upstream-sync.py` verifica essas invariantes no CI.

## Uso

Após a instalação, abra o projeto no agente de IA e use o fluxo adequado:

| Objetivo | Comando |
|---|---|
| Engenharia reversa completa | `/reversa` |
| Execução autônoma do discovery | `/reversa-autonomous` |
| Brainstorm estruturado | `/reversa-brainstorm` |
| Projeto greenfield | `/reversa-new` |
| Evolução de feature | `/reversa-forward` |
| Migração de legado | `/reversa-migrate` |
| Documentação visual | `/reversa-docs` |
| Diagnóstico de bugs | `/reversa-debugger` |
| Refatoração preservando comportamento | `/reversa-refactor` |
| Auditoria epistemológica | `/reversa-feynman` |
| Validação de conhecimento humano | `/reversa-teachback` |
| Guia dos agentes | `/reversa-agents-help` |

## Pipeline principal

```text
Reconnaissance → Excavation → Interpretation → Generation → Review
     Scout       Archaeologist    Detective       Writer     Reviewer
                                    Architect
```

O framework transforma conhecimento encontrado no legado em especificações rastreáveis. O objetivo não é produzir documentação decorativa, mas contratos operacionais que agentes possam usar para evoluir o sistema com menor risco de apagar regras existentes.

## Feynman Evidence & Understanding Layer

A edição MarceloClaro inclui uma camada transversal de rigor.

| Gate | Pergunta central |
|---|---|
| `FEG-01` | O mecanismo pode ser explicado sem depender do nome do padrão? |
| `FEG-02` | A afirmação forte possui evidência e proveniência? |
| `FEG-03` | Observação e inferência estão explicitamente separadas? |
| `FEG-04` | Existe teste ou cenário capaz de refutar a afirmação? |
| `FEG-05` | A arquitetura resolve uma necessidade demonstrada ou é cargo cult? |
| `FEG-06` | A incerteza está explícita e existe experimento mínimo para reduzi-la? |
| `FEG-07` | Quando a fonte é humana, ela consegue reconstruir mecanismo e transferi-lo para um cenário variante? |

### `/reversa-feynman`

Auditor somente-leitura sobre specs e artefatos. Produz `feynman-audit.md` e não altera requirements, roadmap, código ou configuração.

O score-base continua `0..12`, calculado apenas sobre `FEG-01..FEG-06` para manter comparabilidade histórica.

### `/reversa-teachback`

Usado quando uma decisão material depende de conhecimento humano que não pode ser comprovado diretamente no repositório.

O fluxo usa:

1. explicação livre sem priming;
2. probe causal de mecanismo;
3. cenário variante para testar transferência;
4. classificação `TEACHBACK_GREEN`, `TEACHBACK_YELLOW` ou `TEACHBACK_RED`;
5. proveniência humana `HUMAN-VALIDATED`, `HUMAN-PARTIAL` ou `HUMAN-CONFLICT`.

`TEACHBACK_GREEN` **não** transforma automaticamente uma afirmação em `OBSERVED`.

## Confiança e evidência

Além da escala visual do Reversa, esta edição separa explicitamente o estado epistemológico:

- `OBSERVED` — sustentado diretamente por código, execução, teste, contrato ou artefato;
- `INFERRED` — dedução plausível ainda não observada diretamente;
- `UNVERIFIED` — afirmação sem sustentação suficiente;
- `BLOCKED` — precisa ser validada, mas o recurso necessário não está disponível;
- `HUMAN-VALIDATED` — conhecimento humano passou pelo teach-back, sem ser confundido com evidência técnica direta.

## Princípio de atualização independente

O repositório pode estudar ideias, papers e implementações externas, inclusive alterações futuras do projeto original. Porém qualquer incorporação externa exige decisão explícita, revisão própria e commit específico nesta árvore.

Não existe mecanismo automático de upstream.

O CI bloqueia padrões como:

```text
gh repo sync
git remote add upstream
git remote set-url upstream
git fetch upstream
git pull upstream
git merge upstream/...
```

## Estrutura principal

```text
agents/                   Skills e agentes do framework
bin/                      CLI
lib/                      Installer, comandos e runtime auxiliar
scripts/                  Verificações estruturais e smoke tests
specs/                    Especificações formais da evolução do framework
docs/                     Documentação extensa
INDEPENDENCE.md           Política normativa da linha MarceloClaro
```

## Desenvolvimento

Clone diretamente esta edição:

```bash
git clone https://github.com/MarceloClaro/reversa.git
cd reversa
npm install
npm run verify
```

O comando `npm run verify` inclui:

- guard contra sincronização de upstream;
- verificação do eixo de invocação;
- verificação da Feynman Evidence & Understanding Layer;
- smoke test do transporte do installer.

## Proveniência

Este trabalho deriva do projeto **Reversa** original. A independência desta árvore não pretende apagar sua origem.

Paper associado ao framework original:

> *Reversa: A Reverse Documentation Engineering Framework for Converting Legacy Software into Operational Specifications for AI Agents* — Macedo & da Costa, 2026.

As alterações posteriores, agentes adicionais, Feynman Evidence & Understanding Layer, Teach-back e política de distribuição independente são mantidos nesta linha `MarceloClaro/reversa`.

## Licença

MIT — consulte [`LICENSE`](LICENSE).
