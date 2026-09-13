# Reversa original × ReversaFeynman — comparação técnica, arquitetural e operacional

## 1. Escopo e critério da comparação

Este documento compara explicitamente duas camadas históricas do projeto:

1. **Reversa original**, publicado em `sandeco/reversa` e associado ao trabalho de Sanderson Oliveira de Macedo e Ronaldo Martins da Costa (2026);
2. **ReversaFeynman**, linha derivada mantida por Marcelo Claro Laranjeira, que preserva a base de reverse documentation engineering e acrescenta validação epistemológica, governança adaptativa, integração MCI/ACME e integração Hermes.

A comparação usa quatro classificações:

- **PRESERVADO** — comportamento, pipeline ou artefato continua essencialmente com a mesma finalidade;
- **ESTENDIDO** — a capacidade original continua, mas recebeu gates, metadados, auditoria ou novas integrações;
- **NOVO** — capacidade não pertencente ao núcleo original comparado;
- **SUBSTITUÍDO** — um componente interno deixou de ser a implementação ativa e foi trocado por outro, mantendo ou migrando sua interface.

> Esta comparação não reatribui autoria. Tudo que já existia no Reversa original permanece atribuído a `sandeco/reversa` e a Macedo & Costa. As extensões Feynman, Adaptive e Hermes descritas aqui pertencem à linha ReversaFeynman.

---

## 2. Resumo executivo

O **Reversa original** foi concebido principalmente para converter conhecimento implícito de sistemas legados em **especificações operacionais rastreáveis para agentes de IA**. Seu centro arquitetural é o pipeline multiagente de Discovery, apoiado por equipes de ideação, greenfield, forward engineering, migração, documentação, bugs, pricing, tradução e refatoração.

O **ReversaFeynman** mantém esse mecanismo de extração e evolução, mas muda a pergunta central do sistema de:

```text
O que o legado faz e como transformá-lo em especificações utilizáveis por agentes?
```

para uma composição maior:

```text
O que o legado faz?
Como sabemos?
Qual parte foi observada, inferida ou ainda não verificada?
O que refutaria a conclusão?
Quem deve agir agora?
Como memória, confiança e aprendizagem podem ajudar sem virar evidência?
Como medir uma policy antes de permitir maior autonomia?
```

Em síntese:

```text
Reversa original
    = reverse documentation engineering
      + SDD
      + rastreabilidade
      + pipelines especializados
      + evolução/migração/refatoração

ReversaFeynman
    = Reversa original preservado
      + Feynman Evidence & Understanding
      + estados epistemológicos explícitos
      + Teach-back
      + Invocation Governance
      + MCI/ACME Adaptive Governance
      + Audit Ledger + drift
      + Offline Policy Evaluation
      + Hermes memory/skills/trajectories
      + Hermes Evidence Governor
```

---

## 3. Matriz geral — original × atual

| Dimensão | Reversa original (`sandeco/reversa`) | ReversaFeynman atual | Situação | Impacto técnico |
|---|---|---|---|---|
| Missão central | Converter legado em especificações operacionais para agentes | Preserva a missão e adiciona governança epistemológica/adaptativa | **ESTENDIDO** | A extração continua sendo a base, mas decisões passam a carregar controles de evidência |
| Unidade principal | Specs derivadas do código existente | Specs + estado epistemológico + auditoria Feynman + outcomes | **ESTENDIDO** | Uma especificação deixa de ser apenas conteúdo e passa a carregar força/proveniência epistemológica |
| Discovery | Scout → Archaeologist → Detective/Architect → Writer → Reviewer | Mesmo núcleo herdado | **PRESERVADO** | Não rompe o modelo de reverse documentation engineering |
| Reconnaissance | Mapeamento da superfície do projeto | Preservado | **PRESERVADO** | Continua identificando estrutura, stacks, entradas e dependências |
| Excavation | Análise profunda de módulos/fluxos/estruturas | Preservado | **PRESERVADO** | Continua fornecendo base observacional para specs |
| Interpretation | Detective extrai regras; Architect sintetiza arquitetura | Preservado + FEG pode auditar conclusões | **ESTENDIDO** | Inferências passam a poder ser auditadas explicitamente |
| Generation | Writer converte achados em contratos operacionais | Preservado | **PRESERVADO** | Mantém compatibilidade com specs do projeto-base |
| Review | Reviewer encontra inconsistências/gaps e valida com usuário | Reviewer continua e pode acionar Feynman/Teach-back | **ESTENDIDO** | Validação humana deixa de ser confundida com evidência direta |
| Confidence model | 🟢 CONFIRMED / 🟡 INFERRED / 🔴 GAP | `OBSERVED / INFERRED / UNVERIFIED / BLOCKED` + estados humanos separados | **ESTENDIDO** | Separa observação, inferência, ausência de evidência e impedimento |
| Evidência | Confirmação a partir do código e rastreabilidade | Evidência direta rastreável governada pelo Hermes Evidence Governor | **ESTENDIDO** | Formaliza autoridade, fonte e transições epistemológicas |
| Fonte humana | Perguntas e validação de gaps | Teach-back + HUMAN-VALIDATED/PARTIAL/CONFLICT, sem equivaler a OBSERVED | **NOVO** | Reduz risco de usar fluência/aceitação humana como prova técnica |
| Falsificabilidade | Implícita em revisão/testes | FEG-04 exige oracle/teste que possa refutar afirmações relevantes | **NOVO** | Aumenta auditabilidade científica/engenharia |
| Anti-cargo-cult | Não era camada transversal explícita | FEG-05 | **NOVO** | Exige necessidade demonstrada antes de importar padrão/solução |
| Experimento mínimo | Não era gate formal | FEG-06 | **NOVO** | Prioriza menor experimento que reduza incerteza |
| Teach-back | Não havia protocolo epistemológico dedicado | FEG-07 + `/reversa-teachback` | **NOVO** | Captura conhecimento humano sem promovê-lo automaticamente a observação |
| Forward | requirements → clarify → quality → plan → to-do → audit → coding → sync | Mesmo pipeline | **PRESERVADO** | Continuidade operacional para evolução de features |
| Stage detection | `/reversa-forward` detecta estágio físico pelos artefatos | Mantido; handoff protegido foi endurecido | **ESTENDIDO** | Evita depender apenas de metadata e respeita políticas de skill |
| Clarify | Resolve `[DOUBT]` em perguntas direcionadas | Preservado + pode usar candidatos FEG-07 | **ESTENDIDO** | Dúvida crítica pode ser tratada como fronteira de conhecimento |
| Coding | Executa `actions.md`, atualiza progress/impact/regression | Preservado, sujeito aos mesmos gates e às novas camadas de auditoria | **ESTENDIDO** | Mantém mutação explícita e rastreada |
| Add | Emenda curta após coding | Preservado | **PRESERVADO** | Mantém limite de escopo do original |
| Sync | Converte feature entregue em addendum sem editar extração original | Preservado | **PRESERVADO** | Continua evitando reescrever evidência histórica |
| Ideation | Framer → Explorer → Challenger → Arbiter → Pre-Spec | Preservado; Challenger pode interagir com rigor Feynman | **ESTENDIDO** | Premissas e riscos podem receber análise epistemológica adicional |
| Greenfield | Ideator → Researcher → Drafter → Spec SDD | Preservado | **PRESERVADO** | ReversaFeynman não virou ferramenta apenas de legado |
| Express mode | `/reversa-new expresso` leva ideia a código | Compatibilidade arquitetural preservada | **PRESERVADO** | Mantém automação end-to-end do projeto-base |
| Migration | Paradigm Advisor → Curator → Strategist → Designer → Screen Translator → Inspector | Preservado | **PRESERVADO** | Mantém reconstrução orientada pelas specs extraídas |
| Behavioral parity | Inspector/Gherkin e golden files quando há oracle | Preservado; evidência pode ser classificada pelo governor | **ESTENDIDO** | Paridade passa a ter semântica epistemológica explícita |
| Bug memory | `_reversa_bugs/<context>/`, causal traceability SPEC↔CODE↔TEST↔BUG | Preservado | **PRESERVADO** | Memória causal do repositório continua útil |
| Bug debate | Debate multiagente opt-in com judge isolado | Preservado | **PRESERVADO** | Não é substituído pela camada adaptive |
| Refactor | Safety net, characterization tests, reversible diff gate | Preservado | **PRESERVADO** | Continua exigindo preservação de comportamento |
| Documentation | `_reversa_docs/` mini-site HTML, D3/Three.js/Highcharts | Preservado como equipe herdada | **PRESERVADO** | Visualização continua desacoplada do núcleo epistemológico |
| Pricing | Perfil, tamanho e preço sobre as specs | Preservado | **PRESERVADO** | Estimativas continuam derivadas das specs |
| Translators | Adaptadores como N8N → SDD | Preservado | **PRESERVADO** | Continua aceitando legado não convencional |
| State/checkpoint | `.reversa/state.json` e checkpoints entre etapas | Preservado | **PRESERVADO** | Retomada de sessão continua possível |
| `CONTINUAR` | Pausa entre agentes | Mantido, com handoff metadata-aware para skills protegidas | **ESTENDIDO** | Resolve incompatibilidade de invocação sem ignorar policy |
| Invocation policy | Skills instaladas e chamadas pelo harness | Modelo-invoked × user-invoked em lockstep | **NOVO** | Reduz contexto e evita invocação proibida |
| Installer | Detecta engines, instala skills, cria `.reversa/`, manifesto SHA-256 | Compatibilidade preservada; distribuição independente | **ESTENDIDO** | Mantém transporte multi-engine, mas separa a linha de distribuição |
| Updater | Atualização da distribuição original/NPM com preservação de customizações | Atualizador da linha independente, sem sync automático com `sandeco/reversa` | **SUBSTITUÍDO** | Remove dependência operacional do upstream mantendo atribuição |
| Upstream sync | Evolução normal do projeto de origem | Proibido automaticamente por guard | **NOVO** | Mudanças externas precisam ser estudadas/incorporadas conscientemente |
| Engines | Claude, Codex, Cursor, Gemini, Windsurf, Antigravity, Kiro, Opencode, Hermes, Cline, Roo, Copilot, Aider, Amazon Q | Mantidos | **PRESERVADO** | Compatibilidade multi-harness continua sendo característica central |
| External LLM keys | Reversa não requisita/guarda chaves | Mantido para o core; integrações continuam opcionais | **PRESERVADO** | Core permanece desacoplado de provider específico |
| Memory longitudinal | Memória operacional principalmente em arquivos/artefatos do projeto | Hermes Memory Event + Memory Firewall | **NOVO** | Permite memória cross-session sem tratá-la como verdade |
| Skill evolution | Skills eram mantidas como artefatos definidos no repositório | Hermes Skill Proposal em shadow | **NOVO** | Sistema pode propor evolução a partir de experiência sem autoeditar skills |
| Trajectories | `progress.jsonl`, bug/refactor histories e outros logs | Hermes Trajectory Event padroniza steps/outcomes | **NOVO** | Melhora dataset para avaliação/aprendizagem |
| Evidence component | Sem componente Hermes; depois houve Evidence Guard na linha Feynman | Hermes Evidence Governor v2 | **SUBSTITUÍDO** | Hermes assume governança operacional, regras diretas permanecem locais |
| MCI | Não fazia parte do Reversa original | Bridge opcional para metacognição/routing/trust | **NOVO** | Separa “quem deve agir?” de “o que é evidência?” |
| ACME/RL | Não fazia parte do original | Sidecar opcional de aprendizagem de políticas | **NOVO** | Introduz adaptação sem tornar RL autoridade epistemológica |
| Reward | Não havia reward formal | `heuristic-v1` como baseline operacional | **NOVO** | Permite comparar outcomes, explicitamente sem equivaler reward a verdade |
| Audit Ledger | Artefatos e manifestos, mas não ledger adaptativo hash-chain | Hash-chain SHA-256 para eventos adaptativos | **NOVO** | A história de aprendizagem pode ser auditada quanto à integridade |
| Drift | Não havia detector adaptive formal | Reward/confidence/epistemic drift gates | **NOVO** | Pode bloquear ativação quando distribuição muda |
| Policy | Roteamento determinístico/orquestradores | Contextual shadow policy | **NOVO** | Policy aprende/recomenda sem controlar de imediato |
| Shadow mode | Não era conceito transversal | Default obrigatório para policy/skill proposals | **NOVO** | Separa aprender/recomendar de executar/mutar |
| Activation | Controle humano por checkpoints | Activation Request explícito + approval para ações mutantes | **ESTENDIDO** | Formaliza passagem de observação para controle |
| Offline evaluation | Não havia OPE formal | Holdout temporal, Brier, ECE, regret, bootstrap IC95% | **NOVO** | Mede policy antes de promoção |
| Causal claim | Não era foco do runtime | OPE declara estimativas observacionais como não causais | **NOVO** | Reduz interpretação indevida de métricas |
| SDD da própria ferramenta | Reversa produz SDD para projetos | ReversaFeynman usa SPEC/SDD para evoluir a si próprio | **NOVO/ESTENDIDO** | “Dogfooding” de specification-driven development |
| TDD da própria ferramenta | Havia gates/testes por pipeline | Novas integrações entram via RED→GREEN→REFACTOR/HARDENING | **ESTENDIDO** | Contratos passam a ter critérios executáveis explícitos |
| Proveniência acadêmica | Paper original e licença MIT | Paper original + CITATION.cff + delimitação original/derivado + Hermes/Nous | **ESTENDIDO** | Reduz ambiguidade acadêmica e de autoria |

---

## 4. O que o Reversa original fazia, em detalhe

### 4.1 Problema que resolvia

O Reversa original parte de um problema de engenharia de software: sistemas em produção acumulam regras de negócio, decisões arquiteturais, contratos e comportamentos que existem no código, mas não estão suficientemente especificados para que um agente de IA possa evoluir o sistema com segurança.

Seu papel é funcionar como a ponte:

```text
legacy code
    ↓
análise multiagente
    ↓
conhecimento implícito
    ↓
especificações operacionais rastreáveis
    ↓
agentes de coding / migração / documentação
```

A saída não era concebida apenas como documentação narrativa para humanos. O objetivo explícito era gerar **operational contracts** que um agente pudesse consumir.

### 4.2 Discovery como coração do framework

O pipeline original é:

```text
Reconnaissance
    Scout
      ↓
Excavation
    Archaeologist
      ↓
Interpretation
    Detective + Architect
      ↓
Generation
    Writer
      ↓
Review
    Reviewer
```

Responsabilidades centrais:

| Agente original | Função |
|---|---|
| Reversa | Orquestra, salva checkpoints e guia o usuário |
| Scout | Estrutura, linguagens, frameworks, dependências e entry points |
| Archaeologist | Algoritmos, control flow e data structures por módulo |
| Detective | Regras implícitas, ADRs retroativos, state machines e permissões |
| Architect | C4, ERD, integrações e dívida técnica |
| Writer | Specs como contratos operacionais rastreáveis ao código |
| Reviewer | Inconsistências, gaps e validação com usuário |

Agentes independentes complementavam a extração: Visor, Data Master, Design System, Soul Extractor, Reconstructor, Agents Help e Autonomous.

### 4.3 Escala de confiança original

O modelo visível no README original era:

```text
🟢 CONFIRMED = extraído diretamente do código, citável por arquivo/linha
🟡 INFERRED  = deduzido de padrões, pode estar errado
🔴 GAP       = não determinável do código, requer validação humana
```

Essa classificação já introduzia uma disciplina importante: o sistema não deveria apresentar toda conclusão como igualmente certa.

### 4.4 Forward engineering original

O pipeline de evolução era:

```text
requirements
→ clarify
→ quality
→ plan
→ to-do
→ audit
→ coding
→ sync
```

Ele tinha duas características relevantes que o ReversaFeynman preserva:

1. o estágio era detectado fisicamente pelos artefatos, não apenas por metadata;
2. planejar e executar eram atos separados, com auditorias intermediárias.

Artefatos típicos:

```text
_reversa_forward/<feature>/
├── requirements.md
├── roadmap.md
├── investigation.md
├── data-delta.md
├── onboarding.md
├── interfaces/
├── actions.md
├── progress.jsonl
├── legacy-impact.md
├── regression-watch.md
└── audit/
    ├── requirements-audit.md
    └── cross-check.md
```

### 4.5 Ideation e greenfield

O original também não era limitado a engenharia reversa. Para ideias novas:

```text
/reversa-brainstorm
Framer → Explorer → Challenger → Arbiter → Pre-Spec
```

seguido, quando apropriado, por:

```text
/reversa-new
Ideator → Researcher → Drafter → Spec SDD
```

O modo `expresso` podia continuar da ideia até o forward/coding.

### 4.6 Migration

O pipeline original de modernização:

```text
Paradigm Advisor
→ Curator
→ Strategist
→ Designer
→ Screen Translator
→ Inspector
```

Esse desenho força decisões explícitas sobre paradigma, regras a migrar/descartar, estratégia de transição, arquitetura-alvo, telas e equivalência comportamental.

### 4.7 Bugs

O Reversa original já possuía uma forte noção de memória causal de defeitos:

```text
SPEC ↔ CODE ↔ TEST ↔ BUG
```

Com separação entre intake e fix, reprodução, root cause baseado em evidência, gates de aprovação e fechamento com registros persistentes.

### 4.8 Refactoring e manutenção preventiva

A família Refactor já exigia:

```text
comportamento atual
      ↓
safety net / characterization tests
      ↓
transformação proposta
      ↓
diff aprovado e reversível
      ↓
prova de preservação de comportamento
```

Isso continua sendo uma salvaguarda importante e não foi substituído pela governança adaptativa.

### 4.9 Documentação visual

O Documentation Team transformava conhecimento extraído em mini-site HTML autocontido, incluindo mapas, métricas, timeline, glossário, deck e páginas por feature usando D3, Three.js e Highcharts.

### 4.10 Artefatos de Discovery

O original documentava explicitamente um conjunto rico de artefatos:

```text
_reversa_sdd/
├── inventory.md
├── dependencies.md
├── code-analysis.md
├── data-dictionary.md
├── domain.md
├── state-machines.md
├── permissions.md
├── architecture.md
├── c4-context.md
├── c4-containers.md
├── c4-components.md
├── erd-complete.md
├── confidence-report.md
├── gaps.md
├── questions.md
├── sdd/
├── openapi/
├── user-stories/
├── adrs/
├── flowcharts/
├── sequences/
├── ui/
├── database/
├── design-system/
├── addenda/
└── traceability/
```

O ReversaFeynman continua herdando essa taxonomia mesmo quando o README resumido mostra apenas parte da árvore.

### 4.11 Segurança operacional do original

O original enfatizava:

- instalador não apagar/modificar arbitrariamente arquivos existentes;
- análise escrever em `.reversa/` e diretórios de saída;
- recomendações explícitas de Git/backup;
- nenhuma coleta de API keys pelo Reversa;
- `update` usando SHA-256 para não sobrescrever customizações;
- `uninstall` removendo apenas arquivos criados pelo Reversa;
- comandos destrutivos/outward-facing não executados autonomamente em unattended runs.

Essa disciplina operacional é parte da base herdada e deve ser distinguida dos pipelines que **deliberadamente** modificam código após gates, como Coding, Bug Fix ou Refactor.

---

## 5. O que o ReversaFeynman acrescenta ou modifica, em detalhe

### 5.1 De confidence labels para um modelo epistemológico explícito

O original tinha:

```text
CONFIRMED / INFERRED / GAP
```

O ReversaFeynman usa:

```text
OBSERVED
INFERRED
UNVERIFIED
BLOCKED
```

A mudança é semântica e operacional:

| Estado atual | Significado |
|---|---|
| `OBSERVED` | Existe evidência direta rastreável aceita pelo governor |
| `INFERRED` | Há inferência sustentada, mas não observação direta suficiente |
| `UNVERIFIED` | Afirmação/candidato ainda sem validação suficiente |
| `BLOCKED` | A validação depende de informação, acesso ou condição indisponível |

A fonte humana recebe um eixo separado:

```text
HUMAN-VALIDATED
HUMAN-PARTIAL
HUMAN-CONFLICT
```

Isso evita a equivalência:

```text
usuário confirmou
    ≠
foi diretamente observado no sistema
```

### 5.2 Feynman Evidence & Understanding Layer

A camada Feynman acrescenta gates transversais:

| Gate | Controle introduzido |
|---|---|
| FEG-01 | Nome/termo não conta como compreensão do mecanismo |
| FEG-02 | Afirmações fortes exigem evidência/proveniência |
| FEG-03 | Observação e inferência precisam estar separadas |
| FEG-04 | Deve existir condição/oracle capaz de refutar quando aplicável |
| FEG-05 | Evita solução cargo-cult sem necessidade demonstrada |
| FEG-06 | Procura o menor experimento capaz de reduzir incerteza |
| FEG-07 | Teach-back para fronteira de conhecimento humano relevante |

O score-base permanece associado a FEG-01..06; Teach-back não é convertido silenciosamente em score de “verdade”.

### 5.3 Teach-back

O Teach-back atual serve para situações em que:

- uma dúvida impacta requisito, risco, regra de negócio ou interpretação do legado;
- o repositório local não contém evidência direta suficiente;
- a pessoa especialista é necessária como fonte.

Ele separa:

```text
compreensão humana
        ↓
HUMAN-VALIDATED / PARTIAL / CONFLICT

estado do claim no sistema
        ↓
OBSERVED / INFERRED / UNVERIFIED / BLOCKED
```

### 5.4 Invocation Governance

O Reversa original usa múltiplos skills/agentes. A evolução introduziu uma distinção explícita entre pontos que podem ser invocados implicitamente pelo modelo e skills protegidas.

Lockstep usado:

```text
SKILL.md: disable-model-invocation: true
openai.yaml: policy.allow_implicit_invocation: false
```

Quando a próxima fase é protegida, o orquestrador não ignora a policy. Ele lê a skill e executa suas instruções no contexto permitido.

Isso resolve a classe de erro em que uma skill user-invoked seria chamada por um mecanismo model-invoked incompatível.

### 5.5 Independência operacional

O projeto derivado passou a impedir sync automático com `sandeco/reversa`.

São guardados padrões como:

```text
gh repo sync
git remote add upstream
git remote set-url upstream
git fetch upstream
git pull upstream
git merge upstream/...
```

Isso **não** remove a proveniência. A independência é de distribuição/evolução, não de autoria histórica.

### 5.6 MCI / OpenCode Ecosystem Core

A bridge MCI introduz a camada metacognitiva:

```text
claim/spec/evidence
      ↓
MCI
      ↓
routing / trust / confidence / abstention
```

Mas continua valendo:

```text
MCI trust ≠ OBSERVED
```

MCI responde principalmente “quem deve agir, em qual ordem e quando deve abster?”, não “o que é verdade?”.

### 5.7 ACME e aprendizagem de política

ACME entra como sidecar opcional para aprendizagem por experiência.

O core ReversaFeynman não exige JAX, TensorFlow nem `dm-acme` no `package.json`.

A primeira política adaptativa foi desenhada como contextual/shadow, não como deep RL controlador de todo o pipeline.

A regra é:

```text
learned policy ≠ direct evidence
reward         ≠ truth
```

### 5.8 Learning events e reward

A camada adaptativa introduz contratos versionados para experiência e um reward baseline limitado.

O reward considera sinais como:

- critérios de aceitação;
- testes;
- ganho de evidência;
- redução de incerteza;
- regressões;
- findings HIGH/CRITICAL;
- custo, latência e retries.

Ele é explicitamente uma função operacional de utilidade, não uma medida de verdade epistemológica.

### 5.9 Audit Ledger

A história adaptativa passa a poder ser registrada em hash-chain SHA-256:

```text
genesis
   ↓
entry1 = H(seq + previous_hash + payload_hash)
   ↓
entry2 = H(seq + previous_hash + payload_hash)
   ↓
...
```

Isso não prova que o conteúdo é verdadeiro; prova integridade/encadeamento do histórico registrado.

### 5.10 Drift Detection

A evolução introduz detecção de mudança em sinais como reward, confidence e composição epistemológica. Drift pode bloquear promoção de policy/skill.

Isso acrescenta um princípio que o original não tinha formalmente:

```text
uma policy que funcionava antes
    não deve ser promovida automaticamente
quando a distribuição recente mudou
```

### 5.11 Shadow mode e Activation Request

No ReversaFeynman, aprender/recomendar e controlar são atos distintos.

```text
shadow proposal
      ↓
histórico/outcomes
      ↓
evaluation
      ↓
activation request
      ↓
approval / governance
      ↓
active
```

Ações mutantes continuam exigindo aprovação explícita.

### 5.12 Offline Policy Evaluation v3

A v3 corrige o risco de usar o próprio outcome atual para produzir a decisão do mesmo evento.

Fluxo correto:

```text
decide(contexto + histórico anterior)
      ↓
executar baseline
      ↓
observe(outcome)
      ↓
aprender/avaliar
```

A avaliação inclui:

- split temporal treino/holdout;
- Brier Score;
- Expected Calibration Error;
- reward baseline × shadow;
- regret estimado;
- bootstrap IC95% determinístico;
- promotion readiness;
- drift + ledger gates.

As estimativas para ações não executadas são tratadas como observacionais/model-based, não como contrafactuais causais provados.

### 5.13 Hermes Bridge

Hermes adiciona quatro contratos principais ao ecossistema:

```text
reversa.hermes.memory/v1
reversa.hermes.skill.proposal/v1
reversa.hermes.trajectory/v1
reversa.hermes.execution.result/v1
```

Funções principais:

- memória longitudinal;
- propostas de evolução de skills;
- trajetórias de execução;
- resultados/artifacts/testes de execução;
- transport opcional para runtime Hermes.

Nenhuma dessas capacidades é automaticamente autoridade epistemológica.

### 5.14 Memory Firewall

Memória Hermes pode contextualizar e reduzir retrabalho, mas não estabelecer diretamente `OBSERVED`.

```text
Hermes memory
      ↓
INFERRED / UNVERIFIED / BLOCKED
      ↓
corroboração por evidência direta
      ↓
possível OBSERVED
```

Memória de personalização fica ainda mais isolada da camada de evidência de engenharia/científica.

### 5.15 Skill Mutation Gate

Uma proposta aprendida de skill nasce:

```text
mode = shadow
requires_review = true
requires_tests = true
evidence_authority = false
```

Para tornar-se elegível:

```text
reviewApproved
AND testsPassing
AND feynmanApproved
AND no drift
```

Mesmo assim:

```text
eligible = true
executable = false
file_mutation_performed = false
```

A bridge não se autoedita.

### 5.16 Hermes Evidence Governor v2

O componente ativo de governança de evidência agora vive em:

```text
lib/integrations/hermes/evidence-governor.js
```

O antigo:

```text
lib/integrations/adaptive/evidence-guard.js
```

é apenas shim de compatibilidade.

O governor rejeita promoção a `OBSERVED` quando a fonte independente é:

```text
hermes-memory
hermes-confidence
hermes-user-model
hermes-skill-proposal
learned-policy
mci-trust
human
```

E reconhece como baseline de evidência direta:

```text
code
contract
test
execution
log
dataset
artifact
```

Requisitos:

```text
source.direct === true
AND kind reconhecido
AND source.ref não vazio/rastreável
AND origem não proibida
AND regra local aceita
```

O transport Hermes remoto atua como coletor/advisor. Toda resposta remota volta a passar pelas regras determinísticas locais.

---

## 6. Comparação dos modelos de evidência

### Original

```text
Código/artefato
    ↓
interpretação do agente
    ↓
🟢 CONFIRMED / 🟡 INFERRED / 🔴 GAP
    ↓
spec / validação humana
```

### Atual

```text
Código/test/log/dataset/artefato
          ↓
Feynman gates / provenance
          ↓
Hermes Evidence Governor
          ↓
OBSERVED / INFERRED / UNVERIFIED / BLOCKED
          ↓
MCI / Adaptive / Hermes memory podem usar o estado
          ↓
mas não podem reclassificar por confiança sozinha
```

### Diferença fundamental

No original, o foco do confidence seal era **comunicar a confiabilidade da afirmação extraída**.

No atual, o estado epistemológico também atua como **regra de governança**: ele pode bloquear decisões, exigir evidência adicional, direcionar Clarify/Teach-back e impedir que policies adaptativas transformem correlação/confiança em observação.

---

## 7. Comparação dos fluxos principais

### 7.1 Discovery

**Original**

```text
Scout
→ Archaeologist
→ Detective + Architect
→ Writer
→ Reviewer
→ _reversa_sdd
```

**Atual**

```text
Scout
→ Archaeologist
→ Detective + Architect
→ Writer
→ Reviewer
→ _reversa_sdd
→ Feynman audit quando aplicável
→ estado epistemológico explícito
→ Hermes Evidence Governor para transições de evidência
```

O pipeline original não é removido; ganha camadas transversais.

### 7.2 Forward

**Original**

```text
requirements
→ clarify
→ quality
→ plan
→ to-do
→ audit
→ coding
→ sync
```

**Atual**

```text
requirements
→ clarify (+ FEG-07 candidate quando necessário)
→ quality
→ plan
→ to-do
→ audit (+ evidence/Feynman checks)
→ coding
→ sync
→ outcome/trajectory
→ offline/adaptive evaluation opcional
```

### 7.3 Evolução adaptativa

**Original**

```text
orquestrador determinístico
→ checkpoints
→ próxima skill
```

**Atual**

```text
orquestrador determinístico permanece baseline
        ↓
shadow policy recomenda
        ↓
baseline executa
        ↓
outcome observado
        ↓
OPE / drift / calibration
        ↓
activation request somente se elegível
```

Assim, o adaptive layer não elimina o baseline herdado: ele o usa como referência e fallback.

---

## 8. Comparação de agentes e equipes

O ReversaFeynman preserva as famílias funcionais herdadas do original e acrescenta camadas transversais.

| Família | Original | Atual |
|---|---|---|
| Discovery Core | Sim | Preservado |
| Ideation | Sim | Preservado |
| New Project | Sim | Preservado |
| Forward | Sim | Preservado + Feynman/epistemic hooks |
| Migration | Sim | Preservado |
| Pricing | Sim | Preservado |
| Documentation | Sim | Preservado |
| Bugs | Sim | Preservado |
| Refactor | Sim | Preservado |
| Translator/N8N | Sim | Preservado |
| Feynman auditor | Não | Novo |
| Teach-back | Não | Novo |
| Adaptive MCI/ACME | Não | Novo |
| Hermes Bridge | Não | Novo |
| Hermes Evidence Governor | Não | Novo/substitui o Evidence Guard interno da linha derivada |

A camada Hermes não deve ser contada como substituta das skills herdadas; ela é integração transversal de runtime/contratos.

---

## 9. Comparação de artefatos

### 9.1 Artefatos preservados

O conjunto original de Discovery continua conceitualmente válido, incluindo inventário, dependências, análise de código, domínio, state machines, permissões, arquitetura, C4, ERD, gaps, perguntas, SDDs, OpenAPI, user stories, ADRs, flowcharts, sequences, UI, database, design system, addenda e matrizes de rastreabilidade.

### 9.2 Artefatos acrescidos na linha Feynman

Exemplos:

```text
_reversa_forward/<feature>/audit/feynman-audit.md
_reversa_forward/<feature>/audit/teachback.md
_reversa_sdd/adaptive/governance-report.md
```

Além disso, learning events, decision records, trajectories e ledger podem existir como estruturas internas/artefatos de governança conforme o workflow.

### 9.3 Significado da diferença

O original gera principalmente **artefatos de conhecimento e execução do software**.

A evolução também gera **artefatos sobre a qualidade da decisão do próprio agente**.

```text
Original:
"o sistema funciona assim"

Atual:
"o sistema funciona assim"
+ "esta parte foi observada/inferida"
+ "esta foi a evidência"
+ "isto poderia refutar a conclusão"
+ "esta policy recomendou X"
+ "este foi o outcome"
+ "há ou não evidência para promover o estado"
```

---

## 10. Instalação, atualização e independência

### Original

O README original usa:

```bash
npx reversa install
npx reversa status
npx reversa update
npx reversa add-engine
npx reversa uninstall
```

E descreve manifesto SHA-256 para atualização segura.

### Atual

Enquanto o slug físico desta linha permanecer `MarceloClaro/reversa`:

```bash
npm exec --yes --package=github:MarceloClaro/reversa -- reversa install
```

A identidade canônica preparada é `MarceloClaro/reversaFeynman`.

A principal diferença não é o instalador multi-engine, que continua herdado, mas a **fonte de distribuição**:

```text
Original: distribuição do projeto sandeco/reversa
Atual:    linha privada/independente MarceloClaro
```

Sem sync automático do upstream.

---

## 11. Comparação de segurança e autonomia

| Questão | Original | ReversaFeynman |
|---|---|---|
| Análise pode sair escrevendo no legado? | Regra original restringe análise aos diretórios controlados | Preservado |
| Coding pode alterar projeto? | Sim, no pipeline deliberado após plano/audit | Preservado |
| Refactor pode alterar projeto? | Sim, somente após safety net + diff gate | Preservado |
| Agente pode executar destructive/outward action sozinho em unattended? | Original proíbe | Preservado como princípio |
| Policy aprendida pode chamar ação mutante sem gate? | Não existia | Não; aprovação requerida |
| Memória pode virar fato? | Não havia Hermes memory formal | Não; Memory Firewall |
| Confidence pode virar OBSERVED? | Confidence era classificação, não motor adaptive | Não |
| Runtime Hermes remoto pode promover claim sozinho? | Não existia | Não; governor revalida localmente |
| Drift pode bloquear promoção? | Não formalizado | Sim |
| OPE pode autoativar policy? | Não existia | Não |
| Skill aprendida pode se autoeditar? | Não havia proposta adaptativa formal | Não; permanece shadow/non-executable |

---

## 12. O que não foi substituído

É importante não interpretar ReversaFeynman como uma reescrita completa do Reversa original.

Continuam estruturalmente centrais:

- Discovery;
- Scout / Archaeologist / Detective / Architect / Writer / Reviewer;
- artefatos `_reversa_sdd/`;
- pipelines Forward, Migration, Docs, Bugs e Refactor;
- `.reversa/state.json` e retomada;
- multi-engine installer;
- rastreabilidade code ↔ spec;
- addenda pós-entrega;
- regras de safety para mutation workflows;
- SDD como meio de comunicação entre agentes.

As novas camadas funcionam principalmente **ao redor e acima** dessa base.

---

## 13. O que foi efetivamente substituído

Há duas substituições arquiteturais relevantes nesta linha:

### 13.1 Distribuição/updater do upstream

A linha independente não consulta/sincroniza automaticamente o projeto original. A manutenção passa a seguir sua própria distribuição e política de independência.

### 13.2 Evidence Guard interno da linha derivada

Após a introdução da Hermes Bridge, o componente ativo foi substituído por:

```text
Hermes Evidence Governor v2
```

O arquivo antigo:

```text
lib/integrations/adaptive/evidence-guard.js
```

é mantido apenas para compatibilidade de API.

Isso não significa que “Hermes memória agora decide a verdade”. Significa que **Hermes passa a ser a fronteira operacional de coleta/governança**, enquanto as regras determinísticas de evidência continuam locais e auditáveis.

---

## 14. Impactos positivos esperados

### 14.1 Menor ambiguidade epistemológica

Originalmente, CONFIRMED/INFERRED/GAP já melhorava bastante a transparência. O modelo atual aprofunda isso distinguindo observação, inferência, não verificado, bloqueado e validação humana.

### 14.2 Melhor separação entre decisão e evidência

MCI, ACME, reward, trust e Hermes podem influenciar o **processo de decisão**, mas não são convertidos automaticamente em autoridade de evidência.

### 14.3 Melhor memória sem confundir memória com verdade

Hermes permite reaproveitar experiência longitudinal sem transformar resumo de sessão, preferência ou skill success em fato técnico.

### 14.4 Evolução de skills governada

O sistema passa a poder aprender padrões de melhoria de skill sem permitir self-modification silenciosa.

### 14.5 Avaliação antes de autonomia

Shadow mode + holdout + calibration + regret + drift criam uma fase intermediária entre “parece funcionar” e “pode controlar roteamento”.

### 14.6 Maior auditabilidade

FEG, ledger, OPE, decision records e evidence decisions produzem uma trilha melhor para revisão posterior.

---

## 15. Novos custos e trade-offs

A evolução também aumenta complexidade.

| Custo | Consequência |
|---|---|
| Mais estados epistemológicos | Exige disciplina de classificação |
| Mais artefatos | Maior volume de auditoria/manutenção |
| Memory Firewall | Algumas respostas lembradas precisam ser corroboradas novamente |
| Shadow mode | Aprendizagem demora mais para assumir controle |
| OPE/holdout | Divide dados disponíveis e pode ter baixa cobertura |
| Calibration matched-only | Pode haver poucas amostras quando policy diverge do baseline |
| Reward design | Reward ruim pode otimizar comportamento errado |
| Hermes runtime externo | Introduz outro sistema a integrar quando ativado |
| MCI/ACME opcionais | Maior superfície arquitetural |
| Independência de upstream | Melhor controle local, mas exige incorporação manual de melhorias externas |

Esses trade-offs são deliberados: a evolução prioriza controle, auditabilidade e separação entre evidência e aprendizagem.

---

## 16. Comparação por pergunta operacional

| Pergunta | Reversa original | ReversaFeynman |
|---|---|---|
| O que existe no projeto? | Scout/Archaeologist | Igual |
| Quais regras estão escondidas? | Detective | Igual + estado epistemológico |
| Qual é a arquitetura? | Architect | Igual + auditabilidade Feynman |
| Como transformar em specs? | Writer | Igual |
| Onde estão os gaps? | Reviewer + GAP | Reviewer + UNVERIFIED/BLOCKED + FEG |
| Quem sabe a regra que não está no repo? | Validação humana | Teach-back formal |
| A pessoa explicou corretamente? | Julgamento do fluxo | TEACHBACK_GREEN/YELLOW/RED |
| A explicação humana vira fato? | Podia resolver gap no workflow | Explicitamente não vira OBSERVED sozinha |
| Como evoluir uma feature? | Forward | Forward preservado |
| Como medir a qualidade de uma decisão adaptive? | Não existia | OPE v3 |
| Como reutilizar experiência entre sessões? | Arquivos do projeto | Hermes Memory + artifacts |
| Como melhorar uma skill com experiência? | Manutenção manual | Skill Proposal em shadow |
| Quem escolhe o próximo agente? | Orquestrador determinístico | Orquestrador + MCI/shadow policy opcional |
| Como detectar que uma policy envelheceu? | Não formalizado | Drift detector |
| Quem pode declarar OBSERVED? | Confidence/evidência do pipeline | Hermes Evidence Governor sob regras locais de evidência direta |
| Um runtime remoto pode impor verdade? | Não aplicável | Não |

---

## 17. Linha evolutiva resumida

```text
Reversa original
│
├── reverse documentation engineering
├── Discovery
├── operacional specs
├── traceability
├── confidence seals
├── Forward / Migration / Docs
├── Bugs / Refactor / Pricing
├── multi-engine installer
└── safe update via SHA-256
        │
        ▼
ReversaFeynman
│
├── tudo acima preservado como base
├── FEG-01..07
├── Teach-back
├── explicit epistemic states
├── invocation governance
├── independent distribution
├── MCI bridge
├── ACME experience / reward
├── Audit Ledger
├── drift detection
├── contextual shadow policy
├── activation request
├── Offline Policy Evaluation v3
├── Hermes memory
├── Hermes skill proposals
├── Hermes trajectories
└── Hermes Evidence Governor v2
```

---

## 18. Conclusão arquitetural

O Reversa original responde principalmente ao problema de **recuperar conhecimento técnico e de domínio preso em sistemas legados e convertê-lo em especificações executáveis por agentes**.

O ReversaFeynman mantém essa função e adiciona uma segunda classe de problema: **como permitir que agentes raciocinem, lembrem, aprendam e se adaptem sem confundir confiança, memória ou desempenho histórico com evidência direta**.

Portanto, a relação correta não é:

```text
ReversaFeynman substitui Reversa
```

mas:

```text
ReversaFeynman
    = Reversa original como fundação
      + epistemologia operacional
      + metacognição
      + aprendizagem governada
      + memória/skills Hermes
      + avaliação offline
      + governança de evidência
```

Em termos práticos, o original fornece a **engenharia reversa operacional**; a linha atual acrescenta uma **camada de confiabilidade e aprendizagem governada sobre essa engenharia reversa**.

---

## 19. Referências

MACEDO, Sanderson Oliveira de; COSTA, Ronaldo Martins da. **Reversa: A Reverse Documentation Engineering Framework for Converting Legacy Software into Operational Specifications for AI Agents**. arXiv, 2026. arXiv:2605.18684. DOI: 10.48550/arXiv.2605.18684.

SANDECO. **Reversa**. GitHub, 2026. Repositório original: `https://github.com/sandeco/reversa`.

NOUS RESEARCH. **Hermes Agent**. Projeto externo utilizado como referência/runtime opcional para memória, skills, tools, subagentes e trajetórias: `https://github.com/NousResearch/hermes-agent`.
