# Feynman Gates — protocolo operacional

Este protocolo adapta mecanismos de rigor de `MarceloClaro/feynman` e `MarceloClaro/feynman-skill` ao Reversa. Não é roleplay nem reprodução de personalidade.

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

## Matriz de severidade

- `CRITICAL`: falsa confirmação pode causar perda de dados, quebra contratual, segurança, auth, compliance ou arquitetura irreversível.
- `HIGH`: requisito/decisão importante sem evidência, sem oracle ou sustentado por premissa central não testada.
- `MEDIUM`: explicação incompleta, inferência não rotulada, jargão que mascara mecanismo ou cargo-cult com impacto limitado.
- `LOW`: clareza, nomenclatura ou rastreabilidade melhorável sem mudar decisão.

## Anti-overclaim

Não usar `verified`, `confirmed`, `reproduced`, “comprovado” ou equivalentes quando só houve leitura superficial, inferência ou consistência textual.

Quando faltarem dados, prefira:
- `UNVERIFIED`;
- `BLOCKED: <motivo>`;
- `TODO: executar <teste>`;
- 🟡 INFERIDO;
- 🔴 LACUNA.
