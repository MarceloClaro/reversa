# IMO Superhuman benchmark integration

Esta integração usa o **IMO-Bench** publicado em `google-deepmind/superhuman/imobench` como benchmark externo de raciocínio matemático olímpico.

Fonte pinada: `benchmarks/imo-superhuman/source.json`.

## Suites

- **IMO-AnswerBench v2** — 400 problemas de resposta curta;
- **IMO-ProofBench v2** — 60 problemas de prova com solução de referência e grading guidelines;
- **IMO-GradingBench** — 1000 exemplos de avaliação humana;
- **IMO-LeanProofBench v2** — formalizações Lean atualizadas.

O dataset completo **não é vendorizado** neste repositório. O runner deve carregar os arquivos upstream a partir da versão pinada ou de um cache local cuja hash/proveniência seja verificada.

## Protocolo ReversaFeynman

A orquestração matemática segue:

```text
independent proposers
  → cross-model critics
  → verifiers
  → revisers
  → blind judges
  → aggregate + disagreement
  → ReversaBench
```

Os papéis não têm o mesmo acesso:

```text
proposer / critic / verifier / reviser
    recebem apenas o problema público

judge
    recebe candidato anonimizado
    + resposta/solução/rubric de referência
```

Assim, o gabarito não entra no contexto dos solvers.

## Classes de execução

- `smoke`: providers mock/sintéticos;
- `replay`: soluções já publicadas/reproduzidas;
- `pilot`: chamadas reais, mas sem todos os controles confirmatórios;
- `multi-model-confirmatory`: pelo menos 2 solvers reais + 2 judges reais independentes + benchmark pinado + referência isolada.

Somente a última classe recebe `scientific_result=true`, mas mesmo ela mantém `evidence_authority=false`: benchmark não altera automaticamente estados epistemológicos do Hermes Evidence Governor.

## Métricas

Além do score final:

- best initial score;
- best revised score;
- orchestration gain;
- correction/degradation rate;
- judge disagreement;
- diversidade de modelos por papel;
- critic/verifier independence rate;
- custo;
- latência;
- tool calls.

## Providers

A lógica de orquestração é provider-agnostic. `createIMOProviderRouter()` pode combinar adapters para providers distintos, por exemplo:

- OpenAI/Codex;
- Gemini;
- Anthropic/Claude;
- OpenRouter;
- Hugging Face/vLLM;
- Ollama/local models.

Nenhum SDK externo é obrigatório para o core.

## Integridade científica

Não chamar resultados `mock`, `replay` ou `pilot` de desempenho confirmatório. Para trabalhos acadêmicos, arquivar modelo/provider/versão, parâmetros de inferência, seed, problema/commit upstream, prompts, hashes de requests/responses e todos os judgments.
