# SPEC — Software Engineering Intelligence v5

Status: implementing

## Objetivo

Evoluir ReversaFeynman de um sistema que extrai, compreende, especifica, governa evidência e aprende para um sistema que também localiza código estruturalmente, executa em fabrics isoláveis, produz múltiplos reparos candidatos, valida patches com gates independentes, observa trajetórias, mede desempenho em benchmark e expõe suas capacidades por interfaces padronizadas.

A implementação é inspirada por padrões públicos observados em Aider/Tree-sitter repo map, ast-grep, Agentless, mini-SWE-agent, SWE-ReX, SWE-smith, Semgrep, StrykerJS, Arize Phoenix/OpenTelemetry, MCP, LangGraph e DSPy. Nenhum desses projetos se torna dependência obrigatória do core; adapters/transports são opcionais.

## Sequência de evolução

1. v5.1 — Strict Contract Layer
2. v5.2 — Code Intelligence Graph
3. v5.3 — Execution Fabric
4. v5.4 — Repair Laboratory
5. v5.5 — Quality/Falsifiability Gates
6. v5.6 — Observability & Experiment Trace
7. v5.7 — ReversaBench
8. v5.8 — MCP-compatible Gateway
9. v5.9 — Durable Workflow Adapter
10. v5.10 — Offline Prompt/Skill Optimizer

## Invariantes

### SEI-01 — Integrações são opcionais
OpenHands, SWE-ReX, ast-grep, Semgrep, Stryker, Phoenix, LangGraph, MCP SDK e DSPy não entram como dependências obrigatórias do package core. A integração ocorre por adapters, transports ou executáveis detectados externamente.

### SEI-02 — Aprendizagem não cria evidência
Benchmark score, scanner score, policy confidence, optimizer score, mutation score, repair rank e observability trace têm `evidence_authority=false`.

### SEI-03 — OBSERVED continua governado
Somente Hermes Evidence Governor pode aceitar transição epistemológica, com evidência direta rastreável segundo seu ruleset local.

### SEI-04 — Localização precede edição
Repair Engine deve localizar repository → file → symbol → edit region antes de gerar patch candidato, salvo override explícito registrado.

### SEI-05 — Múltiplos candidatos
Repair Engine suporta N patches candidatos e ranking por validações independentes; não presume que a primeira solução do LLM é a correta.

### SEI-06 — Execução desacoplada
Agent/repair logic não depende de Docker, SWE-ReX, OpenHands ou shell específico. Execution Fabric recebe um transport/provider e retorna contrato normalizado.

### SEI-07 — Falsificabilidade executável
Quality Gates podem combinar tests, static analysis e mutation testing. Mutation score é diagnóstico de força do oracle, não verdade epistemológica.

### SEI-08 — Observabilidade não altera semântica
Tracing registra spans/atributos/outcomes, mas não muda decisão nem estado epistemológico.

### SEI-09 — Benchmark separa variantes
ReversaBench compara baseline e variantes em métricas explícitas e não transforma correlação em causalidade.

### SEI-10 — Otimização é shadow-first
Prompt/skill optimizer apenas propõe candidatos em `shadow`; promoção exige avaliação offline, gates existentes e aprovação aplicável.

### SEI-11 — Durable execution é adapter
Checkpoint/resume deve ser possível via store/transport injetável. LangGraph/Temporal/DBOS podem ser providers externos, não donos da política Reversa.

### SEI-12 — Schemas estritos
Novos contratos v5 seguem JSON Schema 2020-12. Runtime strict não deve coagir string numérica para number. Adapter Ajv pode ser usado quando instalado.

## Contratos v5

- `reversa.code-intelligence.graph/v1`
- `reversa.execution.result/v2`
- `reversa.repair.candidate/v1`
- `reversa.quality.report/v1`
- `reversa.trace/v1`
- `reversa.benchmark.result/v1`
- `reversa.optimizer.proposal/v1`

## Critérios de aceitação

- string `"0.9"` é rejeitada quando schema exige number;
- Code Intelligence normaliza símbolos/arestas e calcula ranking determinístico básico;
- Execution Fabric rejeita provider não registrado e normaliza exit code/stdout/stderr/artifacts;
- Repair Laboratory exige localização, suporta múltiplos patches e ranking por score composto;
- Quality Gates aceitam resultados de tests/static/mutation e nunca retornam `evidence_authority=true`;
- Trace registra spans ordenados sem modificar input;
- ReversaBench compara variantes e reporta taxa de sucesso, custo, latência e regressões;
- MCP Gateway lista tools e despacha apenas handlers allowlisted;
- Durable Workflow salva/restaura checkpoint sem executar etapa duas vezes quando já concluída;
- Offline Optimizer gera proposta `shadow`, nunca autoaplica;
- `package.json` não contém dependências obrigatórias dos frameworks externos enumerados em SEI-01;
- `npm run verify` inclui o teste v5.

## Referências arquiteturais externas

- Aider repo-map / Tree-sitter — seleção estrutural de contexto e graph ranking.
- ast-grep — structural search/rewrite por AST.
- Agentless — localization → repair → patch validation.
- mini-SWE-agent — baseline linear, simples e sandboxável.
- SWE-ReX — execution fabric desacoplada do agente.
- SWE-smith / SWE-bench — tasks, ambientes e avaliação reproduzível.
- Semgrep — análise estática semântica e policy rules.
- StrykerJS — mutation testing.
- Arize Phoenix/OpenTelemetry — tracing, datasets e experiments.
- MCP — contrato padronizado para tools/resources/prompts.
- LangGraph — durable execution/checkpoints/human-in-the-loop.
- DSPy — otimização offline de programas/prompt LM.

Essas referências orientam design; código externo não é vendorizado nesta SPEC.
