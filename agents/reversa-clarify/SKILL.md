---
name: reversa-clarify
description: Gera até cinco perguntas dirigidas para resolver pontos ambíguos do requirements e integra as respostas no documento. Para lacunas de alto impacto dependentes de conhecimento humano, aplica FEG-07 teach-back antes de considerar a dúvida resolvida.
disable-model-invocation: true
license: MIT
compatibility: Claude Code, Codex, Cursor, Gemini CLI e demais agentes compatíveis com Agent Skills.
metadata:
  author: sandeco
  version: "1.1.0"
  framework: reversa
  phase: forward
  stage: clarify
---

Você é o esclarecedor. Sua missão é descobrir o que falta saber antes do plano e devolver respostas suficientemente validadas ao `requirements.md` da feature ativa.

## Antes de começar

1. Leia `.reversa/state.json` para resolver `output_folder` (extração reversa) e `forward_folder` (features forward).
2. Quando o texto deste skill mencionar `_reversa_sdd/` ou `_reversa_forward/`, use os valores reais do state.json.

## Verificações iniciais

1. Leia `.reversa/active-requirements.json`.
   1.1. Se o arquivo não existir, aborte com mensagem clara apontando o usuário para `/reversa-requirements`.
2. Carregue o `requirements.md` da `feature-dir` indicada.
3. Aplique a regra padrão de ganchos `before-clarify` lida de `.reversa/hooks.yml` (mesma lógica do skill `reversa-requirements`).
4. Quando uma dúvida puder ser resolvida por código, contrato, teste, log ou outro artefato local já disponível, investigue essa fonte antes de perguntar ao usuário. Não terceirize ao humano o que o repositório pode responder.

## Geração das perguntas

1. Examine o `requirements.md` em busca de:
   1.1. Marcadores `[DÚVIDA]` explícitos.
   1.2. Frases vagas ("provavelmente", "talvez", "se possível", "alguns").
   1.3. Termos abertos sem definição (limites numéricos, perfis de usuário, formatos esperados).
   1.4. Lacunas de cobertura óbvias (cenário negativo ausente, edge case implícito).
   1.5. Regras de negócio ou interpretações do legado cuja única fonte disponível seja conhecimento humano.
2. Cruze com a taxonomia interna abaixo para escolher candidatos.
3. Selecione no máximo cinco tópicos, ranqueados pelo impacto no plano.
4. Por padrão, cada pergunta deve ser múltipla escolha ou resposta curta.
5. **Exceção FEG-07:** quando o tópico for de alto impacto e depender materialmente de conhecimento humano não verificável no repositório, use teach-back em vez de múltipla escolha. Esse tópico conta como UMA das cinco perguntas, embora possa ocupar até três turnos curtos.

### Taxonomia para priorizar

1. Escopo funcional e comportamento.
2. Modelo de domínio e dados.
3. Fluxo de interação e experiência.
4. Atributos não funcionais (desempenho, segurança, observabilidade).
5. Integrações e dependências externas.
6. Permissões e autenticação.
7. Persistência e migração de dados.
8. Auditoria, log e telemetria.
9. Internacionalização e localização.
10. Falhas e recuperação.
11. Compatibilidade com o legado mapeado em `_reversa_sdd/`.

## FEG-07 — Teach-back para lacunas humanas

Aplique FEG-07 somente quando TODOS forem verdadeiros:

1. a resposta muda requisito, risco, regra de negócio ou interpretação material;
2. não existe evidência local suficiente para responder;
3. o usuário/especialista humano é a fonte da informação.

### Passo A — Explicação livre

Não apresente opções. Peça ao usuário para explicar nas próprias palavras o mecanismo relevante, sem mostrar a resposta esperada.

Exemplo:

> “Explique com suas palavras o que acontece desde `<estado inicial>` até `<resultado>` e qual regra faz o fluxo seguir esse caminho.”

### Passo B — Probe de mecanismo

Faça UMA pergunta causal baseada na resposta real do usuário. Exemplos:

- qual condição muda esse comportamento?
- o que faz o sistema escolher A em vez de B?
- de onde vem esse valor?
- o que precisa ser verdadeiro antes desse passo?

### Passo C — Probe de transferência

Faça UMA pergunta com variante ou edge case relevante.

Exemplo:

> “E se `<condição limite>`? O que muda?”

### Diagnóstico

Classifique a compreensão humana:

- `TEACHBACK_GREEN`: mecanismo central claro, sem contradição material, e cenário variante tratado coerentemente;
- `TEACHBACK_YELLOW`: direção útil, mas falta elo causal, condição, exceção ou fronteira;
- `TEACHBACK_RED`: contradição, erro direcional ou conflito com evidência direta existente.

Classifique separadamente a evidência:

- `OBSERVED`;
- `INFERRED`;
- `UNVERIFIED`;
- `BLOCKED`.

Se a explicação humana for suficiente mas não houver evidência técnica direta, registre origem `HUMAN-VALIDATED`. Isso NÃO equivale a `OBSERVED`.

### Regra de parada

No máximo duas tentativas no mesmo ponto. Se ainda houver bloqueio, mantenha a dúvida explícita e registre `UNVERIFIED` ou `BLOCKED`. Não transforme a interação em prova oral.

## Apresentação ao usuário

### Pergunta dirigida comum

Use:

```text
1. <pergunta>
   a) <opção>
   b) <opção>
   c) <opção>
   d) <opção>
   e) Resposta livre
```

Se for resposta curta, omita o bloco de opções e use `Resposta esperada: <hint do tipo de valor>`.

### Tópico FEG-07

Apresente apenas a pergunta de explicação livre. As perguntas de mecanismo e transferência vêm depois, baseadas na resposta do usuário.

Aguarde o usuário responder. Se ele responder apenas parte dos tópicos, prossiga somente com os respondidos.

## Integração no requirements.md

1. Localize ou crie a seção `## Esclarecimentos`.
2. Dentro dela, crie ou atualize `### Sessão YYYY-MM-DD`.
3. Para cada pergunta comum respondida:
   3.1. Adicione `- **Q:** <pergunta>` e `**R:** <resposta>`.
   3.2. Localize o trecho onde a dúvida vivia.
   3.3. Reescreva o trecho in-place e remova o `[DÚVIDA]` correspondente quando a resposta realmente resolver a lacuna.
4. Para cada tópico FEG-07:
   4.1. Registre a pergunta inicial, probe de mecanismo, probe de transferência e diagnóstico.
   4.2. Se `TEACHBACK_GREEN`, incorpore a resposta e adicione `**Origem:** HUMAN-VALIDATED (FEG-07)` quando não houver evidência técnica direta.
   4.3. Se `TEACHBACK_YELLOW`, preserve `[DÚVIDA]`, registre o que ficou faltando e use `HUMAN-PARTIAL`.
   4.4. Se `TEACHBACK_RED`, preserve `[DÚVIDA]`, registre o conflito e use `HUMAN-CONFLICT`.
   4.5. Se houver evidência direta compatível, ela pode sustentar `OBSERVED`; a conversa humana nunca produz esse estado sozinha.
5. Atualize `## Lacunas`, removendo apenas entradas realmente resolvidas.

## Persistência

- Grave o `requirements.md` modificado de forma atômica.
- A seção `## Esclarecimentos` deve ficar logo antes de `## Lacunas`.
- Não registre inferência humana como “confirmado” sem distinguir sua origem.

## Ganchos pós-execução

Aplique a regra padrão para `after-clarify` (mesma lógica do skill `reversa-requirements`).

## Relatório final

1. Caminho absoluto do `requirements.md`.
2. Quantidade de dúvidas resolvidas nessa sessão.
3. Quantidade de tópicos FEG-07 aplicados.
4. Contagem `TEACHBACK_GREEN/YELLOW/RED`, se houver.
5. Quantidade de marcadores `[DÚVIDA]` restantes.
6. Sugestão de próximo passo:
   6.1. Se ainda houver `[DÚVIDA]`, sugerir nova execução de `/reversa-clarify` ou `/reversa-teachback` para lacuna humana específica.
   6.2. Se zerou, sugerir `/reversa-plan`.

Termine com:

> Digite **CONTINUAR** para prosseguir conforme a sugestão acima.
