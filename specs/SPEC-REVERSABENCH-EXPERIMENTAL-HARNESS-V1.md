# SPEC — ReversaBench Experimental Harness v1

Status: implementing

## Objetivo

Transformar o protocolo experimental do paper ReversaFeynman em um harness reproduzível que registre tarefas, variantes, seeds, outcomes e métricas comparáveis sem converter resultados de benchmark em autoridade epistemológica.

## Escopo

O harness deve suportar quatro variantes mínimas:

1. `reversa-original`
2. `reversafeynman-core`
3. `minimal-repair`
4. `reversafeynman-v5`

O harness não executa automaticamente LLMs ou ferramentas externas. Ele normaliza entradas/saídas de adapters injetados e produz artefatos auditáveis.

## Invariantes

### RBX-01 — Benchmark não é evidência epistemológica
Todos os resultados carregam `evidence_authority=false`.

### RBX-02 — Comparação pareada
Cada task/seed deve poder ser executado nas mesmas variantes sob o mesmo orçamento/configuração experimental.

### RBX-03 — Sem resultado fabricado
Ausência de execução real deve ser representada como `missing`, `not-run` ou equivalente. Smoke fixtures não entram em tabelas confirmatórias.

### RBX-04 — Proveniência imutável
Cada task registra repository URL, commit SHA, task id e suite.

### RBX-05 — Seeds explícitos
Stochastic runs registram seed; agregação por variante não apaga task/seed.

### RBX-06 — Estatística conservadora
O harness calcula métricas descritivas e bootstrap determinístico. Não declara causalidade automaticamente.

### RBX-07 — False-OBSERVED explícito
Quando fornecido ground truth de evidência, o harness mede `false_observed_rate` separadamente de success rate.

### RBX-08 — Ablation-ready
Configurações devem suportar flags para Feynman, Hermes Governor, Code Intelligence, multi-candidate repair, mutation gate e optimizer.

## Contratos

- `reversa.bench.task/v1`
- `reversa.bench.run/v1`
- `reversa.bench.report/v1`
- `reversa.bench.ablation/v1`

## Critérios de aceitação

- task exige `task_id`, `suite`, `repository_url`, `commit_sha`;
- run exige variant, task, seed, success boolean e métricas não negativas;
- resultados smoke são marcados e excluídos de `confirmatory=true`;
- relatório produz success rate, regression rate, mean latency, mean cost, false-observed rate e IC95% bootstrap do success rate;
- comparação mantém `causal_claim=false`;
- ablations registram componentes ativos;
- nenhum resultado pode ter `evidence_authority=true`;
- paper recebe seção de status experimental com distinção pilot/confirmatory.
