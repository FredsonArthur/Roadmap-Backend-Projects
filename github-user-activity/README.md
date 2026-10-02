# GitHub User Activity

Projeto do [roadmap.sh](https://roadmap.sh/projects/github-user-activity): uma CLI que busca a atividade recente de um usuário do GitHub e mostra no terminal. Feito em Node.js, sem bibliotecas externas (usa o `fetch` nativo).

## Requisitos

- Node.js 18 ou superior

## Como usar

Dentro da pasta do projeto:

    node github-activity.js <username>

Exemplo:

    node github-activity.js kamranahmedse

Saída de exemplo:

    Recent activity of kamranahmedse:
    - Pushed 3 commits to kamranahmedse/developer-roadmap
    - Opened a new issue in kamranahmedse/developer-roadmap
    - Starred kamranahmedse/developer-roadmap

Opcional: para usar o comando github-activity diretamente, rode npm link nesta pasta.

## Como funciona

A CLI consulta o endpoint público `https://api.github.com/users/<username>/events` e converte cada evento em uma frase legível. Eventos que não têm um texto específico aparecem com o nome do tipo do evento e o repositório.

Eventos tratados: push, issues, comentários, pull requests, reviews, estrelas, forks, criação e remoção de branches/tags, releases e outros.

## Tratamento de erros

- Usuário não informado: mostra o modo de uso
- Usuário inexistente (404)
- Limite de requisições da API excedido (403/429)
- Falha de rede ou erro da API
- Usuário sem atividade pública recente