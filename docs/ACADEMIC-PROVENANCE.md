# Proveniência acadêmica — Reversa original e ReversaFeynman

## 1. Declaração de origem

**ReversaFeynman** é uma linha de desenvolvimento independente derivada historicamente do framework **Reversa** original, publicado no repositório `sandeco/reversa` e descrito academicamente por **Sanderson Oliveira de Macedo** e **Ronaldo Martins da Costa** em 2026.

A derivação preserva a atribuição histórica, a licença MIT do software de origem e a referência científica do framework original. A independência desta linha significa que não existe sincronização automática com o repositório de origem; não significa apagamento de autoria, proveniência ou prioridade intelectual.

Repositório original:

- `https://github.com/sandeco/reversa`

Paper original:

- `https://arxiv.org/abs/2605.18684`
- arXiv: `2605.18684`
- DOI persistente: `10.48550/arXiv.2605.18684`
- categoria principal: `cs.SE`
- submissão original: 18 de maio de 2026

## 2. Contribuição científica do Reversa original

O Reversa original propõe um framework de **reverse documentation engineering** para converter conhecimento implícito em sistemas legados em especificações operacionais rastreáveis para agentes de IA. Entre os elementos centrais descritos no trabalho original estão:

- pipeline multiagente para reconhecimento, escavação, interpretação, geração e revisão;
- rastreabilidade entre código e especificação;
- classificação explícita de confiança e preservação de lacunas para validação humana;
- geração de especificações operacionais para evolução, migração e reconstrução;
- distribuição como CLI Node.js multi-engine;
- uso de manifesto SHA-256 para preservar arquivos modificados durante atualização e desinstalação.

Esses elementos constituem a base histórica e arquitetural sobre a qual a linha ReversaFeynman evolui.

## 3. Delimitação de contribuições

### Herdado do Reversa original

- conceito de reverse documentation engineering;
- Discovery pipeline e agentes especializados;
- produção de especificações rastreáveis;
- estrutura `.reversa/` e pastas de saída;
- pipelines Forward, Migration, Documentation, Bugs, Refactor e demais equipes herdadas;
- compatibilidade multi-engine;
- manifesto SHA-256 e estratégia de atualização segura;
- binário `reversa` e família de comandos `/reversa-*`.

### Desenvolvido na linha ReversaFeynman

- Feynman Evidence & Understanding Layer;
- FEG-01..FEG-07;
- `/reversa-feynman` e `/reversa-teachback`;
- separação explícita `OBSERVED / INFERRED / UNVERIFIED / BLOCKED`;
- governança de invocação metadata-aware para skills protegidas;
- linha de distribuição independente sem sincronização automática com upstream;
- integração opcional MCI/ACME;
- Audit Ledger em hash-chain SHA-256;
- contextual shadow policy;
- drift detection;
- activation request explícito;
- separação `decide → observe`;
- Offline Policy Evaluation v3;
- holdout temporal, Brier Score, ECE, reward/regret e IC95% bootstrap;
- Adaptive Governance Report;
- Hermes Bridge v1: contratos, Memory Firewall, Skill Mutation Gate, trajetória e adaptador de evidência;
- Hermes Evidence Governor v2, que substitui operacionalmente o antigo Evidence Guard mantendo regras determinísticas locais e compatibilidade por shim.

A tabela acima é uma delimitação de proveniência de engenharia. Ela não pretende reescrever a história de commits do projeto original nem atribuir ao ReversaFeynman contribuições anteriores à sua linha independente.

## 4. Referência acadêmica recomendada — ABNT

MACEDO, Sanderson Oliveira de; COSTA, Ronaldo Martins da. **Reversa: A Reverse Documentation Engineering Framework for Converting Legacy Software into Operational Specifications for AI Agents**. arXiv, 2026. arXiv:2605.18684. DOI: 10.48550/arXiv.2605.18684. Disponível em: https://arxiv.org/abs/2605.18684. Acesso em: 13 set. 2026.

Para o software original:

SANDECO. **Reversa**: transform legacy systems into executable specifications for AI coding agents. GitHub, 2026. Disponível em: https://github.com/sandeco/reversa. Acesso em: 13 set. 2026.

## 5. Referência em BibTeX

```bibtex
@misc{demacedo2026reversa,
  title        = {Reversa: A Reverse Documentation Engineering Framework for Converting Legacy Software into Operational Specifications for AI Agents},
  author       = {Sanderson Oliveira de Macedo and Ronaldo Martins da Costa},
  year         = {2026},
  eprint       = {2605.18684},
  archivePrefix= {arXiv},
  primaryClass = {cs.SE},
  doi          = {10.48550/arXiv.2605.18684},
  url          = {https://arxiv.org/abs/2605.18684}
}
```

Referência de software:

```bibtex
@software{sandeco_reversa_2026,
  author = {{sandeco}},
  title  = {Reversa},
  year   = {2026},
  url    = {https://github.com/sandeco/reversa},
  note   = {Original Reversa repository; MIT License}
}
```

## 6. Como citar esta linha derivada

Ao publicar resultados obtidos com ReversaFeynman, recomenda-se citar **duas camadas de proveniência**:

1. o paper do Reversa original, para reconhecer a contribuição científica e arquitetural de origem;
2. a versão específica do ReversaFeynman utilizada no experimento, preferencialmente com commit, tag ou release reproduzível.

Exemplo textual:

> Este trabalho utilizou o ReversaFeynman, uma linha independente derivada do framework Reversa de Macedo e Costa (2026), preservando a arquitetura-base de reverse documentation engineering e acrescentando camadas de validação epistemológica, governança adaptativa e avaliação offline de políticas.

## 7. Princípio de atribuição

Nenhuma extensão desta linha deve ser descrita de forma que obscureça a origem do framework Reversa ou atribua ao ReversaFeynman a autoria de conceitos, agentes, pipelines ou mecanismos já presentes no projeto original. Sempre que a distinção for material, a documentação deve usar explicitamente as expressões **“Reversa original”**, **“derivado de sandeco/reversa”** e **“extensão ReversaFeynman”**.

## 8. Integração externa — Hermes Agent / Nous Research

A **Hermes Bridge v1** e o **Hermes Evidence Governor v2** do ReversaFeynman foram inspirados pelas capacidades publicamente documentadas do **Hermes Agent**, projeto externo da **Nous Research**, incluindo memória persistente, sistema de skills/procedural memory, melhoria de skills a partir de experiência, subagentes, ferramentas e geração de trajetórias.

Projeto original Hermes Agent:

- `https://github.com/NousResearch/hermes-agent`
- mantenedor/origem: **Nous Research**
- licença indicada no repositório: MIT

Fork utilizado para estudo no ecossistema MarceloClaro:

- `https://github.com/MarceloClaro/hermes-agent`

O repositório `MarceloClaro/hermes-agent` é um fork do projeto `NousResearch/hermes-agent`. A existência desse fork não transfere autoria do Hermes Agent para o mantenedor do ReversaFeynman.

### Delimitação específica

Pertencem ao projeto Hermes/Nous Research, enquanto conceitos e capacidades externas estudadas:

- Hermes Agent como agente autoaperfeiçoável;
- memória persistente/cross-session;
- procedural memory e sistema de skills;
- criação/melhoria de skills baseada em experiência;
- ferramentas, subagentes e backends de execução;
- geração e compressão de trajetórias.

Pertencem à linha ReversaFeynman, como implementação de interoperabilidade e governança:

- `reversa.hermes.memory/v1`;
- `reversa.hermes.skill.proposal/v1`;
- `reversa.hermes.trajectory/v1`;
- `reversa.hermes.execution.result/v1`;
- Memory Firewall que impede memória de produzir `OBSERVED`;
- Skill Mutation Gate que mantém propostas em shadow e exige review/testes/Feynman;
- extração conservadora de sinais de trajetória;
- adaptador que encaminha evidência direta, rastreável e explicitamente mapeada ao Hermes Evidence Governor;
- `hermes-evidence-governor/v2`, que aplica regras determinísticas locais e não permite que memória, confidence, user model ou policy se autodeclarem evidência direta;
- `adaptive/evidence-guard.js` mantido somente como shim de compatibilidade, sem ruleset independente;
- transport bridge opcional e sem dependência de runtime do Hermes.

Portanto, a formulação correta é **“Hermes Bridge e Hermes Evidence Governor do ReversaFeynman, interoperando com conceitos/capacidades do Hermes Agent da Nous Research”**, e não “Hermes Agent desenvolvido pelo ReversaFeynman”.
