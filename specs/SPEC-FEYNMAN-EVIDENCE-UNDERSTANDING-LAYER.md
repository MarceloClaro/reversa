# SPEC — Feynman Evidence & Understanding Layer

## Objetivo

Adicionar ao Reversa uma camada transversal de rigor inspirada em dois projetos complementares:

- `MarceloClaro/feynman`: pesquisa orientada por evidência, preferência por fontes primárias, separação entre observação e inferência, proveniência de resultados, verificação e experimentos mínimos.
- `MarceloClaro/feynman-skill`: testes cognitivos de entendimento real, anti-autoengano, incerteza explícita, explicação concreta, limites de analogia e detecção de cargo cult.

A integração NÃO deve transformar o Reversa em um clone do Feynman, nem copiar sua persona. O objetivo é incorporar mecanismos verificáveis de qualidade ao ciclo de engenharia reversa e evolução forward.

## Problema

O Reversa já possui selos de confiança, revisão, auditoria e premortem. Ainda assim, quatro classes de erro podem sobreviver:

1. **Nome sem mecanismo** — a spec usa termos corretos, mas não descreve o comportamento observável por trás deles.
2. **Confiança sem proveniência** — algo aparece como confirmado sem apontar para código, artefato, execução ou fonte concreta.
3. **Requisito não falsificável** — a frase parece boa, mas não existe observação que permitiria dizer que ela está errada.
4. **Cargo cult arquitetural** — padrão, framework, ritual ou processo aparece por imitação formal, sem necessidade funcional demonstrada.

## Solução

Criar o agente transversal `reversa-feynman` e incorporar seis gates mínimos nos agentes críticos do pipeline.

### Gates Feynman

| ID | Gate | Pergunta operacional |
|---|---|---|
| FEG-01 | Nome ≠ entendimento | É possível explicar o comportamento sem depender do nome do padrão, framework ou conceito? |
| FEG-02 | Evidência e proveniência | Cada afirmação forte aponta para arquivo/linha, execução, artefato ou fonte concreta? |
| FEG-03 | Observação ≠ inferência | O texto separa claramente o que foi observado, inferido e ainda não verificado? |
| FEG-04 | Falsificabilidade | Existe teste, oracle, cenário ou observação capaz de refutar a afirmação? |
| FEG-05 | Anti-cargo-cult | A solução/processo existe por uma função necessária ou apenas porque “é o padrão”? |
| FEG-06 | Incerteza e experimento mínimo | O limite do conhecimento está explícito e há o menor teste capaz de reduzir a incerteza? |

## Escopo de integração

### `reversa-feynman`

Novo skill transversal, estritamente leitor sobre artefatos existentes. Pode analisar:

- uma sessão de ideação;
- uma feature forward;
- uma unit de `_reversa_sdd`;
- ou o conjunto de specs do projeto.

Saída única: `feynman-audit.md` no diretório de auditoria apropriado.

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

Executar os seis gates antes do `confidence-report.md`. Findings FEG-02/03 que afetem item 🟢 devem rebaixar a confiança até existir evidência adequada.

## Invariantes

1. Não fabricar fontes, resultados, arquivos, métricas ou execuções.
2. Nunca usar “verificado”, “confirmado”, “reproduzido” ou equivalente sem evidência concreta.
3. Resultados quantitativos precisam apontar para artefato, comando, dataset ou fonte.
4. Ausência de evidência deve produzir `UNVERIFIED`, `BLOCKED`, 🟡 ou 🔴, nunca certeza implícita.
5. O Feynman Layer não altera artefatos canônicos durante auditoria; apenas gera relatório e recomenda reclassificações.
6. O agente `reversa-feynman` é `user-invoked`: `disable-model-invocation: true` e `allow_implicit_invocation: false` permanecem em lockstep.
7. Orquestradores que receberem `CONTINUAR` devem usar a política de handoff seguro já adotada pelo Reversa; não remover guards de invocação.
8. A integração não faz roleplay de Richard Feynman. Ela incorpora métodos cognitivos, não identidade/persona.
9. Nenhum gate exige web/paper search quando a pergunta pode ser resolvida pelo código local. Fonte primária local tem precedência para comportamento do sistema legado.
10. Se uma afirmação depender de realidade externa atual, o agente deve exigir fonte recente ou marcar a validação como bloqueada.

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

## Score

O score Feynman é diagnóstico, não certificação:

- 2 pontos por gate sem finding HIGH/CRITICAL;
- 1 ponto quando restam apenas MEDIUM/LOW;
- 0 ponto quando existe HIGH/CRITICAL naquele gate.

Faixa: `0..12`.

Interpretação:

- `10–12`: forte compreensão/proveniência;
- `7–9`: aceitável com lacunas explícitas;
- `4–6`: risco relevante de ambiguidade ou falsa confiança;
- `0–3`: não usar como base de implementação sem revisão.

O score nunca deve ser chamado de “cientificamente validado”.

## TDD / critérios de aceitação

O script `scripts/verify-feynman-layer.py` é o gate estrutural mínimo.

- CA1: `reversa-feynman/SKILL.md` existe.
- CA2: contém os seis IDs FEG-01..FEG-06.
- CA3: skill e `openai.yaml` mantêm o eixo user-invoked em lockstep.
- CA4: `reversa-reviewer` referencia os seis gates.
- CA5: `reversa-quality` contém FEG-01 e FEG-04.
- CA6: `reversa-audit` contém FEG-02 e FEG-03.
- CA7: `reversa-challenger` contém FEG-03, FEG-05 e FEG-06.
- CA8: `npm run verify` executa também o gate Feynman.
- CA9: o protocolo proíbe fabricar resultados e exige proveniência para números/benchmarks.
- CA10: o novo skill possui `agents/openai.yaml` com `interface.display_name` e `interface.short_description`.

## Não objetivos

- substituir o Reviewer, Quality, Audit ou Challenger;
- adicionar dependência obrigatória ao runtime `feynman`;
- exigir acesso à internet para análise de código local;
- transformar toda tarefa em pesquisa acadêmica;
- executar experimentos caros quando um oracle mínimo resolve a incerteza.
