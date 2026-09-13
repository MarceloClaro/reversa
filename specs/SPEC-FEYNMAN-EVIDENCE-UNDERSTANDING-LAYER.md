# SPEC — Feynman Evidence & Understanding Layer

## Objetivo

Adicionar ao Reversa uma camada transversal de rigor inspirada em três projetos complementares:

- `MarceloClaro/feynman`: pesquisa orientada por evidência, preferência por fontes primárias, separação entre observação e inferência, proveniência de resultados, verificação e experimentos mínimos.
- `MarceloClaro/feynman-skill`: testes cognitivos de entendimento real, anti-autoengano, incerteza explícita, explicação concreta, limites de analogia e detecção de cargo cult.
- `MarceloClaro/feynman-tutor`: teach-back, inversão de papéis, detecção de fronteira de conhecimento, probes progressivos de mecanismo e transferência, e distinção entre resposta fluente e compreensão realmente demonstrada.

A integração NÃO deve transformar o Reversa em clone/persona de Feynman nem em plataforma educacional. O objetivo é incorporar mecanismos verificáveis de qualidade ao ciclo de engenharia reversa e evolução forward.

## Problema

O Reversa já possui selos de confiança, revisão, auditoria e premortem. Ainda assim, cinco classes de erro podem sobreviver:

1. **Nome sem mecanismo** — a spec usa termos corretos, mas não descreve o comportamento observável por trás deles.
2. **Confiança sem proveniência** — algo aparece como confirmado sem apontar para código, artefato, execução ou fonte concreta.
3. **Requisito não falsificável** — a frase parece boa, mas não existe observação que permitiria dizer que ela está errada.
4. **Cargo cult arquitetural** — padrão, framework, ritual ou processo aparece por imitação formal, sem necessidade funcional demonstrada.
5. **Fluência humana tratada como evidência** — uma regra de negócio é aceita porque alguém respondeu com segurança, sem testar mecanismo, exceções ou transferência para cenário variante.

## Solução

Manter o agente transversal `reversa-feynman`, adicionar o agente interativo `reversa-teachback` e incorporar sete gates, sendo seis de auditoria e um gate humano complementar.

### Gates Feynman

| ID | Gate | Pergunta operacional |
|---|---|---|
| FEG-01 | Nome ≠ entendimento | É possível explicar o comportamento sem depender do nome do padrão, framework ou conceito? |
| FEG-02 | Evidência e proveniência | Cada afirmação forte aponta para arquivo/linha, execução, artefato ou fonte concreta? |
| FEG-03 | Observação ≠ inferência | O texto separa claramente o que foi observado, inferido e ainda não verificado? |
| FEG-04 | Falsificabilidade | Existe teste, oracle, cenário ou observação capaz de refutar a afirmação? |
| FEG-05 | Anti-cargo-cult | A solução/processo existe por uma função necessária ou apenas porque “é o padrão”? |
| FEG-06 | Incerteza e experimento mínimo | O limite do conhecimento está explícito e há o menor teste capaz de reduzir a incerteza? |
| FEG-07 | Teach-back e fronteira de conhecimento | Quando a fonte é humana, ela consegue explicar mecanismo e responder a uma variação sem priming? |

## Escopo de integração

### `reversa-feynman`

Skill transversal, estritamente leitor sobre artefatos existentes. Pode analisar:

- uma sessão de ideação;
- uma feature forward;
- uma unit de `_reversa_sdd`;
- ou o conjunto de specs do projeto.

Saída única: `feynman-audit.md` no diretório de auditoria apropriado.

O agente aplica FEG-01..FEG-06 e identifica candidatos FEG-07. Ele NÃO conduz a entrevista Teach-back, preservando sua natureza leitora.

### `reversa-teachback`

Novo skill interativo para validar conhecimento humano que serve de fonte de especificação.

Fluxo mínimo:

1. explicação livre nas palavras do usuário, sem múltipla escolha;
2. um probe causal de mecanismo baseado na resposta real;
3. um cenário variante/edge case para testar transferência;
4. diagnóstico `TEACHBACK_GREEN | TEACHBACK_YELLOW | TEACHBACK_RED`;
5. classificação separada da evidência `OBSERVED | INFERRED | UNVERIFIED | BLOCKED`;
6. persistência opcional, com consentimento explícito, em `teachback.md`.

O skill nunca altera artefatos canônicos. A única escrita permitida é `teachback.md`.

### `reversa-challenger`

Adicionar FEG-03, FEG-05 e FEG-06 ao premortem:

- separar fato, inferência e hipótese;
- identificar soluções escolhidas por imitação;
- propor experimento mínimo para a premissa central.

### `reversa-quality`

Adicionar FEG-01 e FEG-04 à auditoria textual:

- entendimento operacional sem jargão substitutivo;
- critérios de aceitação capazes de falhar de forma observável.

### `reversa-audit`

Adicionar FEG-02 e FEG-03 ao cross-check:

- rastrear a origem de afirmações fortes;
- impedir promoção silenciosa de inferência para fato.

### `reversa-reviewer`

Executar FEG-01..FEG-06 antes do `confidence-report.md` e identificar/aplicar FEG-07 quando uma lacuna material depender exclusivamente de conhecimento humano.

Findings FEG-02/03 que afetem item 🟢 devem rebaixar a confiança até existir evidência adequada. Respostas humanas coerentes sem evidência técnica devem ser registradas como `HUMAN-VALIDATED`, não `OBSERVED`.

### `reversa-clarify`

Manter perguntas dirigidas para dúvidas comuns, mas criar exceção FEG-07 para lacunas de alto impacto que dependam de conhecimento humano de domínio.

Nesses casos:

- a primeira pergunta deve ser explicação livre, não múltipla escolha;
- pode haver até dois probes adicionais, mecanismo e transferência;
- `TEACHBACK_GREEN` permite incorporar a resposta como `HUMAN-VALIDATED`;
- `TEACHBACK_YELLOW/RED` mantém `[DÚVIDA]` aberta.

## Modelo de estados

A integração separa dois eixos.

### Evidência do sistema

- `OBSERVED` — evidência direta disponível;
- `INFERRED` — dedução plausível;
- `UNVERIFIED` — alegação sem sustentação suficiente;
- `BLOCKED` — checagem necessária indisponível.

### Fonte humana / teach-back

- `TEACHBACK_GREEN` — mecanismo e transferência coerentes;
- `TEACHBACK_YELLOW` — compreensão parcial;
- `TEACHBACK_RED` — contradição, erro direcional ou conflito com evidência.

Marcadores de origem:

- `HUMAN-VALIDATED` — fonte humana passou no teach-back, mas não implica observação técnica;
- `HUMAN-PARTIAL` — fonte humana forneceu conhecimento incompleto;
- `HUMAN-CONFLICT` — fonte humana conflita com evidência ou outra fonte material.

## Invariantes

1. Não fabricar fontes, resultados, arquivos, métricas ou execuções.
2. Nunca usar “verificado”, “confirmado”, “reproduzido” ou equivalente sem evidência concreta.
3. Resultados quantitativos precisam apontar para artefato, comando, dataset ou fonte.
4. Ausência de evidência deve produzir `UNVERIFIED`, `BLOCKED`, 🟡 ou 🔴, nunca certeza implícita.
5. O Feynman Layer não altera artefatos canônicos durante auditoria; apenas gera relatório e recomenda reclassificações.
6. `reversa-feynman` e `reversa-teachback` são `user-invoked`: `disable-model-invocation: true` e `allow_implicit_invocation: false` permanecem em lockstep.
7. Orquestradores que receberem `CONTINUAR` devem usar a política de handoff seguro já adotada pelo Reversa; não remover guards de invocação.
8. A integração não faz roleplay de Richard Feynman. Ela incorpora métodos cognitivos, não identidade/persona.
9. Nenhum gate exige web/paper search quando a pergunta pode ser resolvida pelo código local. Fonte primária local tem precedência para comportamento do sistema legado.
10. Se uma afirmação depender de realidade externa atual, o agente deve exigir fonte recente ou marcar a validação como bloqueada.
11. `TEACHBACK_GREEN` ou `HUMAN-VALIDATED` nunca equivalem automaticamente a `OBSERVED`.
12. FEG-07 só é aplicado quando uma lacuna material realmente depende de fonte humana; não transformar todo fluxo em tutoria.
13. Não usar velocidade, hesitação, formalidade ou vocabulário como proxy de conhecimento.
14. No máximo duas tentativas no mesmo ponto antes de fornecer evidência disponível ou registrar `UNVERIFIED/BLOCKED`.
15. Persistência de `teachback.md` exige consentimento explícito do usuário.

## Formato de finding

```markdown
### FEG-04-003 — Requisito não falsificável
- Severidade: HIGH
- Artefato: requirements.md
- Trecho: RF-12
- Observação: "o sistema deve ser rápido" não define condição observável.
- Evidência disponível: nenhuma métrica/limite associado.
- Teste mínimo: definir p95 ou tempo máximo para o fluxo crítico e medir.
- Status: UNVERIFIED
```

Exemplo FEG-07:

```markdown
### FEG-07-002 — Regra de exceção depende apenas de memória operacional
- Severidade: HIGH
- Afirmação: pedidos acima de X seguem fluxo manual
- Evidência local: nenhuma
- Fonte necessária: especialista humano
- Mecanismo a explicar: gatilho, responsável, estado resultante
- Cenário variante: pedido exatamente no limite X
- Próximo passo: /reversa-teachback
```

## Score

O score Feynman é diagnóstico, não certificação:

- 2 pontos por gate FEG-01..FEG-06 sem finding HIGH/CRITICAL;
- 1 ponto quando restam apenas MEDIUM/LOW;
- 0 ponto quando existe HIGH/CRITICAL naquele gate.

Faixa-base preservada: `0..12`.

FEG-07 NÃO altera o score-base. Ele aparece separadamente como:

`NOT_APPLICABLE | CANDIDATE | HUMAN-VALIDATED | HUMAN-PARTIAL | HUMAN-CONFLICT`.

Isso preserva compatibilidade histórica e impede que participação humana infle score de evidência.

Interpretação do score-base:

- `10–12`: forte compreensão/proveniência;
- `7–9`: aceitável com lacunas explícitas;
- `4–6`: risco relevante de ambiguidade ou falsa confiança;
- `0–3`: não usar como base de implementação sem revisão.

O score nunca deve ser chamado de “cientificamente validado”.

## TDD / critérios de aceitação

O script `scripts/verify-feynman-layer.py` é o gate estrutural mínimo.

- CA1: `reversa-feynman/SKILL.md` existe.
- CA2: contém FEG-01..FEG-07.
- CA3: `reversa-feynman` mantém o eixo user-invoked em lockstep.
- CA4: `reversa-reviewer` referencia FEG-01..FEG-07.
- CA5: `reversa-quality` contém FEG-01 e FEG-04.
- CA6: `reversa-audit` contém FEG-02 e FEG-03.
- CA7: `reversa-challenger` contém FEG-03, FEG-05 e FEG-06.
- CA8: `npm run verify` executa também o gate Feynman.
- CA9: o protocolo proíbe fabricar resultados e exige proveniência para números/benchmarks.
- CA10: `reversa-feynman` possui `agents/openai.yaml` com interface completa.
- CA11: `reversa-teachback/SKILL.md` existe e contém FEG-07, `TEACHBACK_GREEN/YELLOW/RED` e `HUMAN-VALIDATED`.
- CA12: `reversa-teachback` mantém `disable-model-invocation: true` e `allow_implicit_invocation: false` em lockstep.
- CA13: `reversa-clarify` contém a exceção FEG-07 e não resolve automaticamente uma lacuna com `TEACHBACK_YELLOW/RED`.
- CA14: o Reviewer diferencia `HUMAN-VALIDATED` de `OBSERVED`.
- CA15: o score-base permanece explicitamente `0..12` e FEG-07 fica fora do cálculo.

## Não objetivos

- substituir o Reviewer, Quality, Audit ou Challenger;
- adicionar dependência obrigatória ao runtime `feynman` ou `feynman-tutor`;
- exigir acesso à internet para análise de código local;
- transformar toda tarefa em pesquisa acadêmica ou sessão pedagógica;
- executar experimentos caros quando um oracle mínimo resolve a incerteza;
- avaliar inteligência, personalidade, capacidade cognitiva geral ou desempenho educacional do usuário.
