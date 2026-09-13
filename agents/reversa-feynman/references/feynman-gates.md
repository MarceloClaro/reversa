# Feynman Gates — protocolo operacional

Este protocolo adapta mecanismos de rigor de `MarceloClaro/feynman`, `MarceloClaro/feynman-skill` e `MarceloClaro/feynman-tutor` ao Reversa. Não é roleplay nem reprodução de personalidade.

## FEG-01 — Nome ≠ entendimento

Um rótulo não substitui mecanismo.

PASS quando o artefato consegue responder, sem depender do nome técnico:
- o que entra;
- o que acontece;
- o que sai;
- qual condição muda o comportamento;
- onde isso aparece no sistema.

FAIL típico: “usa event sourcing”, “é hexagonal”, “aplica clean architecture” sem explicar comportamento ou fronteiras concretas.

## FEG-02 — Evidência e proveniência

Prioridade de evidência para comportamento de software:

1. execução/teste reproduzível;
2. código/contrato/configuração diretamente inspecionado;
3. log/trace/artefato gerado;
4. documentação oficial/primária;
5. inferência consistente;
6. memória/assunção.

Somente 1–4 sustentam uma afirmação forte como `OBSERVED`/🟢. Inferência deve permanecer marcada.

Resultados quantitativos exigem origem rastreável: URL, arquivo bruto, script, comando ou saída.

## FEG-03 — Observação ≠ inferência

Use os estados:

- `OBSERVED`: evidência direta disponível;
- `INFERRED`: dedução a partir de evidências, ainda não observada diretamente;
- `UNVERIFIED`: alegação sem sustentação suficiente;
- `BLOCKED`: validação necessária, mas recurso/fonte indisponível.

Nunca promova silenciosamente `INFERRED` para `OBSERVED`.

## FEG-04 — Falsificabilidade

Toda afirmação operacional importante precisa de um possível contraexemplo.

Perguntas:
- que teste falharia se isto estivesse errado?
- qual cenário Gherkin demonstra a fronteira?
- qual input produziria comportamento diferente?
- qual limite mensurável separa PASS de FAIL?

Se nenhuma resposta existir, o requisito ainda é vago.

## FEG-05 — Anti-cargo-cult

Remova o nome do padrão/processo/framework. Se a justificativa desaparecer junto, há risco de cargo cult.

Perguntas:
- qual dor concreta existe hoje?
- onde está a evidência dessa dor?
- qual propriedade da solução resolve essa dor?
- qual custo/complexidade entra junto?
- existe alternativa menor?

“Best practice” sem mecanismo não é justificativa.

## FEG-06 — Incerteza e experimento mínimo

Para cada dúvida relevante, encontre a intervenção de menor custo que muda a decisão:

- ler 1 arquivo em vez de mapear o repo inteiro;
- executar 1 teste em vez de montar benchmark;
- consultar 1 contrato oficial em vez de buscar opiniões;
- reproduzir 1 caso limite em vez de inferir comportamento;
- perguntar 1 decisão de negócio ao usuário quando o código não pode respondê-la.

O objetivo é reduzir incerteza, não maximizar atividade.

## FEG-07 — Teach-back e fronteira de conhecimento

Quando uma afirmação relevante depende de conhecimento humano não registrado no sistema, confirmação simples não basta. Use teach-back para testar se a fonte humana consegue explicar o mecanismo sem priming e transferi-lo para uma variação.

Sequência mínima:

1. **Explicação livre:** a pessoa explica com suas palavras, sem múltipla escolha.
2. **Probe de mecanismo:** uma pergunta causal derivada da própria resposta.
3. **Probe de transferência:** um edge case ou cenário variante material.
4. **Diagnóstico separado:** qualidade da compreensão humana e estado da evidência técnica.

Classificação humana:

- `TEACHBACK_GREEN`: mecanismo central claro + transferência coerente;
- `TEACHBACK_YELLOW`: direção plausível, mas elo causal/condição/exceção incompleto;
- `TEACHBACK_RED`: contradição, erro direcional ou conflito com evidência direta.

Fonte humana:

- `HUMAN-VALIDATED`: explicação coerente e transferível;
- `HUMAN-PARTIAL`: explicação útil, mas incompleta;
- `HUMAN-CONFLICT`: explicação contradiz evidência técnica ou outra fonte material.

Regra crucial: `TEACHBACK_GREEN`/`HUMAN-VALIDATED` NÃO equivalem a `OBSERVED`. Se não houver código, contrato, teste, execução, log ou outra evidência direta, a origem deve continuar explicitamente humana.

### Fluency cliff

Registre o primeiro ponto em que a explicação deixa de descrever mecanismo e passa a usar rótulo, circularidade, “sempre foi assim” ou conjectura. Esse é o limite útil de conhecimento para a spec.

Não use velocidade, hesitação, vocabulário ou eloquência como critério.

### Quando aplicar

FEG-07 é aplicável apenas quando:

- a lacuna muda requisito, risco, decisão ou interpretação relevante; e
- o repositório não contém evidência direta suficiente; e
- um humano está atuando como fonte de conhecimento de domínio.

Quando aplicável, use `/reversa-teachback` ou o mini-protocolo equivalente dentro de `/reversa-clarify` ou `/reversa-reviewer`.

Quando não aplicável, registre `NOT_APPLICABLE`; não force uma conversa pedagógica em todo fluxo.

FEG-07 é complementar e NÃO entra no score-base Feynman `0..12`, que continua calculado sobre FEG-01..FEG-06. O relatório deve mostrar o status de FEG-07 separadamente.

## Matriz de severidade

- `CRITICAL`: falsa confirmação pode causar perda de dados, quebra contratual, segurança, auth, compliance ou arquitetura irreversível.
- `HIGH`: requisito/decisão importante sem evidência, sem oracle ou sustentado por premissa central não testada.
- `MEDIUM`: explicação incompleta, inferência não rotulada, jargão que mascara mecanismo ou cargo-cult com impacto limitado.
- `LOW`: clareza, nomenclatura ou rastreabilidade melhorável sem mudar decisão.

## Anti-overclaim

Não usar `verified`, `confirmed`, `reproduced`, “comprovado” ou equivalentes quando só houve leitura superficial, inferência, consistência textual ou teach-back humano sem evidência técnica.

Quando faltarem dados, prefira:
- `UNVERIFIED`;
- `BLOCKED: <motivo>`;
- `TODO: executar <teste>`;
- `HUMAN-VALIDATED` quando a origem for humana;
- 🟡 INFERIDO;
- 🔴 LACUNA.
