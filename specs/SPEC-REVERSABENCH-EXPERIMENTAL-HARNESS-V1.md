# SPEC — ReversaBench Experimental Harness v1

Status: implemented

## Objetivo

Transformar o protocolo experimental do paper ReversaFeynman em um harness reproduzível que registre tarefas, variantes, seeds, outcomes e métricas comparáveis sem converter resultados de benchmark em autoridade epistemológica.

## Escopo

O harness suporta quatro variantes mínimas:

1. `reversa-original`
2. `reversafeynman-core`
3. `minimal-repair`
4. `reversafeynman-v5`

O harness não executa automaticamente LLMs ou ferramentas externas. Ele normaliza entradas/saídas de adapters injetados e produz artefatos auditáveis.

## Invariantes

### RBX-01 — Benchmark não é evidência epistemológica
Todos os resultados carregam `evidence_authority=false`.

### RBX-02 — Comparação pareada
Cada task/seed pode ser executado nas mesmas variantes sob o mesmo orçamento/configuração experimental. Um report confirmatório requer pelo menos uma célula task×seed pareada entre as variantes presentes.

### RBX-03 — Sem resultado fabricado
Ausência de execução real não é preenchida pelo harness. Smoke fixtures não entram em relatórios confirmatórios.

### RBX-04 — Proveniência imutável
Cada task registra repository URL, commit SHA hexadecimal de 40 caracteres, task id e suite.

### RBX-05 — Seeds explícitos
Stochastic runs registram seed inteiro não negativo; agregação por variante não apaga task/seed.

### RBX-06 — Estatística conservadora
O harness calcula métricas descritivas e bootstrap percentil determinístico. Não declara causalidade automaticamente.

### RBX-07 — False-OBSERVED explícito
Quando fornecido ground truth de evidência, o harness mede `false_observed_rate` separadamente de success rate.

### RBX-08 — Ablation-ready
Configurações registram flags para Feynman, Hermes Governor, Code Intelligence, multi-candidate repair, mutation gate e optimizer.

### RBX-09 — Confirmatory gate
`confirmatory=true` somente é aceito quando existem runs não-smoke, pelo menos duas variantes e pelo menos uma célula task×seed pareada. Caso contrário, o report permanece não confirmatório e registra `confirmatory_blocked_reason`.

## Contratos

- `reversa.bench.task/v1`
- `reversa.bench.run/v1`
- `reversa.bench.report/v1`
- `reversa.bench.ablation/v1`
- `reversa.bench.dataset/v1`

## Critérios de aceitação

- task exige `task_id`, `suite`, `repository_url`, `commit_sha`;
- commit SHA inválido é rejeitado;
- run exige variant, task, seed não negativo, success boolean e métricas não negativas;
- resultados smoke são marcados e excluídos de `confirmatory=true`;
- report confirmatório exige ao menos duas variantes e pairing task×seed;
- relatório produz success rate, regression rate, mean latency, mean cost, false-observed rate e IC95% bootstrap do success rate;
- bootstrap é determinístico para a mesma seed/configuração;
- comparação mantém `causal_claim=false`;
- ablations registram componentes ativos;
- nenhum resultado pode ter `evidence_authority=true`;
- paper possui seção de status experimental com distinção smoke/confirmatory;
- smoke runner e renderer geram JSON/LaTeX sem promover smoke a evidência científica.

## Validação local

A suíte `scripts/test-reversabench-experimental-harness.mjs` foi executada localmente com sucesso. O pipeline `run-reversabench-smoke.mjs → render-reversabench-report.mjs` também foi executado localmente e confirmou que a tentativa confirmatória é bloqueada com `no non-smoke runs available`.
