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
- Evidence Guard;
- Audit Ledger em hash-chain SHA-256;
- contextual shadow policy;
- drift detection;
- activation request explícito;
- separação `decide → observe`;
- Offline Policy Evaluation v3;
- holdout temporal, Brier Score, ECE, reward/regret e IC95% bootstrap;
- Adaptive Governance Report.

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
