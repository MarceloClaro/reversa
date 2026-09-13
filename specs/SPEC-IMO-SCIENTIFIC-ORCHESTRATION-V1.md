# SPEC — IMO Scientific Orchestration v1

Status: implementing

## Objetivo

Adicionar ao ReversaFeynman um protocolo reprodutível de orquestração matemática multi-modelo para avaliar raciocínio olímpico sobre o Google DeepMind `superhuman/imobench`, preservando isolamento de respostas de referência, independência entre papéis e separação explícita entre smoke, replay, pilot e resultado confirmatório.

## Benchmark de referência

Fonte primária:

- repositório: `google-deepmind/superhuman`;
- diretório: `imobench/`;
- AnswerBench atual: `answerbench_v2.csv`;
- ProofBench atual: `proofbench_v2.csv`;
- GradingBench: `gradingbench.csv`;
- LeanProofBench atual: `lean_proof_bench_v2.csv`.

O benchmark original é atribuído a Luong et al. (EMNLP 2025), *Towards Robust Mathematical Reasoning*. O ReversaFeynman não redistribui o dataset completo nesta SPEC; registra apenas proveniência e adapters para ingestão externa, preservando a licença upstream.

## Pipeline científico

```text
problem
  ↓
independent proposers (>=2 model IDs)
  ↓
cross-model critics
  ↓
verifiers
  ↓
revisers
  ↓
blind candidate anonymization
  ↓
independent judges (>=2 model IDs)
  ↓
score aggregation + disagreement
  ↓
final candidate
  ↓
metrics / ReversaBench
```

## Invariantes

### IMO-01 — Sem leakage de gabarito
Solver, critic, verifier e reviser recebem apenas o problema público e artefatos produzidos pelos modelos. `reference_answer`, `reference_solution` e `grading_rubric` só podem chegar ao papel `judge` ou a um avaliador determinístico explicitamente separado do solver.

### IMO-02 — Propostas independentes
Antes da crítica cruzada, cada proposer resolve o problema sem acesso às soluções de outros modelos.

### IMO-03 — Crítica cruzada
Quando há mais de um modelo disponível, um candidato não deve ser criticado exclusivamente pelo mesmo `model_id` que o produziu. A execução registra quando a independência não é possível.

### IMO-04 — Julgamento cego
O judge recebe candidatos anonimizados (`candidate-001`, etc.) sem `model_id`, provider ou custo, reduzindo viés de identidade.

### IMO-05 — Juízes independentes
Resultado `multi-model-confirmatory` exige pelo menos dois `judge model_id` distintos e, no modo estrito, nenhum judge pode ser o mesmo modelo que produziu o candidato final.

### IMO-06 — Execução real ≠ mock/replay
Mocks e replays validam orquestração, mas não contam como resultado científico novo. `scientific_result=true` exige invocações reais registradas para os papéis relevantes.

### IMO-07 — Benchmark não vira verdade epistemológica
Scores, consenso, majority vote, judge confidence e ensemble gain carregam `evidence_authority=false` e não promovem claims para `OBSERVED`.

### IMO-08 — Classificação do run
Cada execução recebe exatamente uma classe:

- `smoke` — providers mock/sintéticos;
- `replay` — outputs previamente gerados;
- `pilot` — execução real, mas sem todos os gates confirmatórios;
- `multi-model-confirmatory` — execução real com diversidade de solvers, juízes independentes, benchmark pinado e isolamento de referência.

### IMO-09 — Métricas de orquestração
Além do score final, registrar:

- melhor candidato inicial;
- melhor candidato revisado;
- ganho da orquestração sobre melhor solução inicial;
- taxa de correção após crítica/revisão;
- taxa de degradação após revisão;
- disagreement entre judges;
- diversidade de modelos por papel;
- custo, latência e tool calls quando disponíveis.

### IMO-10 — AnswerBench e ProofBench separados
AnswerBench usa acurácia de resposta curta e, quando necessário, avaliador matemático externo/CAS. ProofBench usa escala 0–7 conforme rubric do benchmark. Métricas das duas suites não devem ser combinadas como se fossem a mesma variável.

### IMO-11 — Proveniência versionada
Cada problema registra `benchmark_repo`, `benchmark_ref`, `benchmark_path`, `problem_id` e hash/commit conhecido do arquivo ou repositório quando disponível.

### IMO-12 — Raciocínio científico
A orquestração deve exigir, nos prompts/contratos, hipótese/estratégia explícita, tentativa de refutação, verificação de casos-limite e declaração de lacunas. Fluência ou confiança não substituem prova.

## Contratos

- `reversa.imo.problem/v1`
- `reversa.imo.model/v1`
- `reversa.imo.candidate/v1`
- `reversa.imo.judgment/v1`
- `reversa.imo.run/v1`
- `reversa.imo.report/v1`

## Critérios de aceitação TDD

1. solver payload não contém reference answer/solution/rubric;
2. judge payload recebe referência, mas candidato anonimizado;
3. dois proposers diferentes produzem candidatos independentes;
4. crítica cruza model IDs quando possível;
5. revisão preserva lineage do candidato;
6. score de ProofBench é limitado a 0..7;
7. run com mock é `smoke` e `scientific_result=false`;
8. run real com um único solver é no máximo `pilot`;
9. run real com >=2 solvers e >=2 judges independentes pode ser `multi-model-confirmatory`;
10. `ensemble_gain` é calculado contra o melhor candidato inicial, não contra média dos modelos;
11. judge disagreement é preservado e não escondido pela média;
12. todos os contratos têm `evidence_authority=false`;
13. adapter não depende obrigatoriamente de OpenAI, Gemini, Anthropic, OpenRouter, vLLM, Ollama ou outro provider específico;
14. teste unitário usa providers mock e nunca é apresentado como desempenho no IMO-Bench.

## Providers

A implementação usa `invoke(model, request)` injetável. Adapters concretos podem posteriormente conectar:

- OpenAI/Codex;
- Gemini/Google AI;
- Anthropic/Claude;
- OpenRouter;
- Hugging Face/vLLM;
- Ollama/local models;
- outros runtimes compatíveis.

Nenhum provider externo é dependência obrigatória do core.
