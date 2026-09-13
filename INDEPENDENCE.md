# Política de Independência — MarceloClaro/reversaFeynman

Este repositório é mantido como uma linha de desenvolvimento independente por **Marcelo Claro Laranjeira**, sob a identidade **ReversaFeynman**.

## Fonte de verdade

A fonte operacional pretendida de código, agentes, documentação e atualizações desta edição é:

- `https://github.com/MarceloClaro/reversaFeynman`

O branch `main` deste repositório é a referência para evolução da edição ReversaFeynman.

> Enquanto o rename administrativo do GitHub não for concluído, a árvore pode continuar fisicamente acessível pelo slug anterior `MarceloClaro/reversa`. O código e a documentação já adotam `MarceloClaro/reversaFeynman` como identidade canônica.

## Sem sincronização automática com upstream

Esta edição **não sincroniza automaticamente** com `sandeco/reversa`.

São proibidos nos workflows deste repositório:

- `gh repo sync`;
- `git fetch upstream` ou `git pull upstream`;
- configuração automática de remote `upstream`;
- merge automático de branches de `sandeco/reversa`;
- jobs que substituam o `main` por conteúdo do upstream.

O script `scripts/verify-no-upstream-sync.py` atua como guard estrutural e deve fazer o CI falhar se um desses mecanismos for introduzido.

## Atualização da CLI

O comando `reversa update` usa exclusivamente os arquivos presentes na distribuição ReversaFeynman que está executando a CLI. Ele não consulta o pacote `reversa` no npm para decidir versão e não busca código de `sandeco/reversa`.

A forma canônica de executar esta edição diretamente do GitHub é:

```bash
npm exec --yes --package=github:MarceloClaro/reversaFeynman -- reversa install
```

Para atualizar uma instalação usando esta mesma distribuição:

```bash
npm exec --yes --package=github:MarceloClaro/reversaFeynman -- reversa update
```

## Publicação npm

O `package.json` usa `"private": true`. Isso evita publicação acidental desta árvore sob o nome npm `reversa`, que não é tratado como canal de atualização desta edição.

## Proveniência e licença

A independência de desenvolvimento não apaga a proveniência histórica. Este trabalho deriva do projeto Reversa original e mantém a licença MIT e a atribuição correspondente. Referências históricas ao projeto original, ao paper e aos autores podem permanecer na documentação; elas não constituem mecanismo de sincronização.

## Regra para incorporar ideias externas

Mudanças externas, inclusive alterações futuras de `sandeco/reversa`, só podem entrar nesta edição por decisão explícita, revisão própria e commit específico no repositório `MarceloClaro/reversaFeynman`. Não existe atualização automática de upstream.
