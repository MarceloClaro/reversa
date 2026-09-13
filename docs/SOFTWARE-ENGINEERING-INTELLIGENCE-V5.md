# ReversaFeynman Software Engineering Intelligence v5

## Objetivo

A v5 acrescenta uma camada de engenharia de software operacional ao ReversaFeynman. O núcleo anterior já cobria reverse documentation engineering, SDD, Feynman/FEG, Hermes Evidence Governance, MCI/ACME e Offline Policy Evaluation. A v5 acrescenta capacidades para **localizar, executar, reparar, validar, observar, comparar e otimizar** mudanças de código sem transformar métricas ou memória em autoridade epistemológica.

## Sequência implementada

| Fase | Componente interno | Inspiração/adapter externo opcional | Papel |
|---|---|---|---|
| v5.1 | Strict Contract Layer | JSON Schema 2020-12 / Ajv strict | contratos sem coerção silenciosa |
| v5.2 | Code Intelligence Graph | Aider repo-map, Tree-sitter, ast-grep, Semgrep | símbolos, relações e ranking de contexto |
| v5.3 | Execution Fabric | SWE-ReX, OpenHands, Docker/Podman | execução desacoplada e sandboxável |
| v5.4 | Repair Laboratory | Agentless, mini-SWE-agent | localização → candidatos → validação → ranking |
| v5.5 | Quality/Falsifiability Gates | Semgrep, ast-grep rules, StrykerJS | testes, análise estática e mutation score |
| v5.6 | Observability | OpenTelemetry / Arize Phoenix | traces de execução e experiments |
| v5.7 | ReversaBench | SWE-bench / SWE-smith | comparação empírica entre variantes |
| v5.8 | MCP-ready Gateway | MCP TypeScript SDK | tools allowlisted e dispatch padronizável |
| v5.9 | Durable Workflow | LangGraph.js, Temporal, DBOS | checkpoint/resume sem repetir etapa concluída |
| v5.10 | Offline Optimizer | DSPy/GEPA | propostas de prompt/skill em shadow |

## Arquitetura

```text
Legacy / feature / issue
        ↓
Reversa Discovery + SDD
        ↓
Feynman / Hermes Evidence Governance
        ↓
Code Intelligence Graph
        ↓
localization
        ↓
Repair Laboratory
   ├── patch A
   ├── patch B
   └── patch N
        ↓
Execution Fabric
        ↓
Quality Gates
   ├── tests
   ├── static analysis
   └── mutation testing
        ↓
Hermes Evidence Governor
        ↓
Trace + ReversaBench
        ↓
MCI / OPE / Adaptive Governance
        ↓
Offline Optimizer (shadow)
```

## Regra epistemológica

Nenhuma das novas métricas é evidência por si só:

```text
repo-map rank       ≠ OBSERVED
patch rank          ≠ OBSERVED
Semgrep finding     ≠ OBSERVED por si só
mutation score      ≠ OBSERVED
benchmark score     ≠ OBSERVED
trace               ≠ OBSERVED
optimizer score     ≠ OBSERVED
```

Resultados podem fornecer **candidatos de evidência direta** (por exemplo, um teste executado com referência rastreável), mas a transição epistemológica continua subordinada ao Hermes Evidence Governor.

## API

```js
import {
  createStrictContractRegistry,
  createCodeIntelligence,
  createExecutionFabric,
  createRepairLaboratory,
  createQualityGateRunner,
  createTraceCollector,
  createReversaBench,
  createMcpGateway,
  createDurableWorkflow,
  createOfflineOptimizer,
} from './lib/integrations/software-engineering/index.js';
```

### Code Intelligence

```js
const intelligence = createCodeIntelligence({
  provider: async (request) => externalTreeSitterOrAstGrepAdapter(request),
});

const graph = await intelligence.inspect({ root: '.' });
```

O core apenas normaliza o grafo. A extração pode vir de Tree-sitter/Aider-style repo-map, ast-grep, Semgrep ou outro provider.

### Execution Fabric

```js
const fabric = createExecutionFabric({
  providers: {
    sandbox: async (request) => sweRexAdapter(request),
  },
});

const result = await fabric.execute({
  provider: 'sandbox',
  command: 'npm test',
  task_id: 'feature-42',
});
```

O provider é injetado; SWE-ReX/OpenHands/Docker não são dependências obrigatórias.

### Repair Laboratory

```js
const lab = createRepairLaboratory();

const candidate = lab.createCandidate({
  localization: {
    file: 'src/payment.js',
    symbol: 'capture',
    region: '84:112',
  },
  patch: '...',
  validations: {
    tests: 1,
    static: 1,
    mutation: 0.92,
    regression: 0,
  },
});
```

A localização é obrigatória para preservar rastreabilidade e reduzir edição especulativa.

### FEG-04 executável

Quality Gates estende a pergunta “há teste que poderia refutar?” com mutation testing opcional:

```text
tests pass
    +
static gate pass
    +
mutation score >= threshold
    ↓
quality report
```

Um mutation score baixo indica que o oracle pode ser fraco; não prova que o código está errado.

### ReversaBench

```js
const bench = createReversaBench();
bench.record({ variant: 'original', success: true, latency_ms: 100, cost: 1, regressions: 0 });
bench.record({ variant: 'feynman-v5', success: true, latency_ms: 80, cost: 0.8, regressions: 0 });
console.log(bench.compare());
```

O relatório inclui `causal_claim=false`. Um benchmark observacional não é automaticamente um experimento causal.

### Durable Workflow

O adapter exige apenas `load` e `save`, permitindo stores locais ou providers externos. Etapas marcadas como concluídas não são executadas novamente no resume.

### Offline Optimizer

Toda proposta nasce com:

```text
mode = shadow
auto_apply = false
requires_offline_evaluation = true
requires_review = true
evidence_authority = false
```

DSPy/GEPA pode ser provider externo, mas nunca autoedita uma skill ativa.

## Dependências externas

A v5 deliberadamente não adiciona como dependência obrigatória:

- OpenHands;
- SWE-ReX / SWE-agent / mini-SWE-agent;
- ast-grep;
- Semgrep;
- StrykerJS;
- Phoenix;
- LangGraph;
- MCP SDK;
- DSPy;
- Pydantic AI.

Isso preserva um core pequeno e permite escolher providers conforme linguagem, infraestrutura e política de segurança.

## SDD/TDD

Especificação:

`specs/SPEC-SOFTWARE-ENGINEERING-INTELLIGENCE-V5.md`

Teste de aceitação:

`scripts/test-software-engineering-intelligence-v5.mjs`

O teste verifica contratos estritos, ranking estrutural, provider allowlist, repair multi-candidato, mutation gate, tracing, benchmark, tool allowlist, checkpoint/resume, shadow optimizer e opcionalidade das dependências externas.

## Proveniência técnica

As ideias de integração são atribuídas aos projetos externos que as popularizam/implementam; a implementação desta camada é um conjunto de contratos e adapters próprios do ReversaFeynman. Não há vendorização de código desses projetos nesta camada.
