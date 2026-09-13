# FEG-07 — Teach-back e fronteira de conhecimento

Este protocolo adapta ao Reversa o princípio central do `feynman-tutor`: quando o conhecimento humano é a fonte da spec, não basta perguntar “isso está certo?”. A própria fonte deve explicar o mecanismo, responder a uma pergunta causal e transferir a regra para um cenário variante.

## Objetivo

Detectar lacunas que respostas de confirmação, múltipla escolha ou linguagem fluente podem esconder.

O resultado NÃO mede inteligência, memória geral ou capacidade acadêmica. Mede apenas a suficiência de uma explicação humana para sustentar uma decisão de especificação.

## Sequência mínima

1. **Explicação livre** — sem alternativas prontas e sem revelar a resposta esperada.
2. **Probe de mecanismo** — uma pergunta causal baseada no que a pessoa acabou de dizer.
3. **Probe de transferência** — um edge case ou variação material.
4. **Diagnóstico separado** — qualidade da explicação humana versus estado da evidência do sistema.

## Classificação de compreensão

- `TEACHBACK_GREEN`: mecanismo central claro + resposta coerente à variação.
- `TEACHBACK_YELLOW`: entendimento parcial; falta elo causal, condição, exceção ou fronteira.
- `TEACHBACK_RED`: contradição, erro direcional ou conflito com evidência direta.

## Classificação de evidência

- `OBSERVED`: comprovado diretamente em código, contrato, teste, execução ou log.
- `INFERRED`: dedução consistente, mas ainda não observada diretamente.
- `UNVERIFIED`: informação sem sustentação suficiente.
- `BLOCKED`: a checagem necessária não pode ser realizada com os recursos atuais.

`TEACHBACK_GREEN` nunca converte sozinho uma afirmação em `OBSERVED`.

## Fonte humana

Use um estado adicional quando necessário:

- `HUMAN-VALIDATED`: explicação coerente e transferível, ainda que não exista evidência técnica direta.
- `HUMAN-PARTIAL`: explicação útil, mas incompleta.
- `HUMAN-CONFLICT`: explicação contradiz evidência técnica ou outra fonte humana material.

## Fluency cliff

A fronteira de conhecimento aparece no primeiro ponto em que a explicação deixa de especificar mecanismo e passa a usar:

- rótulo no lugar de causa;
- circularidade;
- “sempre foi assim”;
- conjectura não marcada;
- generalização que não sobrevive ao cenário variante.

Não use velocidade, hesitação, formalidade ou vocabulário como critério. Uma pessoa pode saber e falar devagar; pode também falar com enorme fluência e não explicar o mecanismo.

## Quando NÃO aplicar

- o repositório já contém evidência direta suficiente;
- a pergunta é um lookup simples;
- a resposta não muda requisito, risco, decisão ou interpretação relevante;
- o usuário pediu explicitamente uma explicação direta e não está atuando como fonte da spec.

## Critério de resolução de lacuna

Uma lacuna humana pode ser considerada resolvida para fins de decisão somente quando:

1. a explicação recebe `TEACHBACK_GREEN`; e
2. não existe conflito com evidência local conhecida; e
3. o artefato que incorporar a resposta registra a origem como `HUMAN-VALIDATED` quando não houver observação técnica direta.

Se qualquer item falhar, a lacuna permanece explícita.

## Regra de parada

No máximo duas tentativas no mesmo ponto. Se ainda houver bloqueio:

- forneça o fato técnico disponível, se existir;
- registre `UNVERIFIED` ou `BLOCKED` quando não existir;
- não prolongue a sessão artificialmente.
