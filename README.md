# Roadmap Backend Projects

Repositório onde reúno os projetos práticos de backend do [roadmap.sh](https://roadmap.sh/backend/projects), feitos para treinar programação e consolidar o que venho estudando.

O [roadmap.sh](https://roadmap.sh) é uma plataforma gratuita com trilhas de estudo para diversas áreas da tecnologia. Na seção de projetos de backend, cada desafio traz um enunciado com requisitos, restrições e exemplos de uso, e a implementação fica por conta de quem estuda.

## Como o repositório está organizado

Cada projeto fica em uma pasta própria, com o nome do projeto em kebab-case, e pode usar uma linguagem diferente. Dentro de cada pasta há um README com o enunciado, as instruções para rodar e as decisões tomadas.

    Roadmap-Backend-Projects/
    ├── README.md
    ├── task-tracker-cli/
    ├── github-user-activity/
    ├── expense-tracker/
    ├── number-guessing-game/
    ├── unit-converter/
    ├── personal-blog/
    ├── weather-api/
    ├── blogging-platform-api/
    ├── todo-list-api/
    ├── expense-tracker-api/
    ├── github-trending-cli/
    └── ...

## Projetos

| Projeto | Nível | Linguagem | Descrição |
|---|---|---|---|
| [Task Tracker](./task-tracker-cli) | Iniciante | Node.js | CLI para adicionar, atualizar, remover e listar tarefas, salvas em um arquivo JSON |
| [GitHub User Activity](./github-user-activity) | Iniciante | Node.js | CLI que busca e mostra a atividade recente de um usuário do GitHub usando a API pública |
| [Expense Tracker](./expense-tracker) | Iniciante | Node.js | CLI para controlar despesas, com resumo mensal, categorias, orçamento e exportação para CSV |
| [Number Guessing Game](./number-guessing-game) | Iniciante | Node.js | Jogo de adivinhar o número no terminal, com níveis de dificuldade, dicas, cronômetro e recordes |
| [Unit Converter](./unit-converter) | Iniciante | Node.js | Conversor de unidades web com renderização no servidor, múltiplas categorias e formulários HTML |
| [Personal Blog](./personal-blog) | Iniciante | Node.js | Blog pessoal com área pública, dashboard administrativo, autenticação HTTP Basic e armazenamento dos artigos em arquivos JSON |
| [Weather API](./weather-api) | Iniciante | Node.js | API de clima com integração preparada para a Visual Crossing, cache com Redis/Valkey, variáveis de ambiente e rate limiting |
| [Expense Tracker API](./expense-tracker-api) | Iniciante | Node.js | API RESTful de gestão de despesas com arquitetura modular, autenticação JWT, bcrypt, isolamento de dados por usuário, categorias e filtros temporais |
| [Blogging Platform API](./blogging-platform-api) | Intermediário | Node.js | API RESTful completa para plataforma de blogs com gerenciamento de posts, comentários e sistema de rotas |
| [Todo List API](./todo-list-api) | Intermediário | Node.js | API RESTful segura de gerenciamento de tarefas com autenticação JWT, bcrypt, paginação, isolamento de dados por usuário e persistência JSON |
| [GitHub Trending CLI](./github-trending-cli) | Intermediário | Node.js | Ferramenta de linha de comando (CLI) que consome a API REST do GitHub para listar repositórios em alta, com filtros de período, limite de resultados e ordenação por estrelas |

Enunciados originais:

- [Task Tracker no roadmap.sh](https://roadmap.sh/projects/task-tracker)
- [GitHub User Activity no roadmap.sh](https://roadmap.sh/projects/github-user-activity)
- [Expense Tracker no roadmap.sh](https://roadmap.sh/projects/expense-tracker)
- [Number Guessing Game no roadmap.sh](https://roadmap.sh/projects/number-guessing-game)
- [Unit Converter no roadmap.sh](https://roadmap.sh/projects/unit-converter)
- [Personal Blog no roadmap.sh](https://roadmap.sh/projects/personal-blog)
- [Weather API no roadmap.sh](https://roadmap.sh/projects/weather-api-wrapper-service)
- [Expense Tracker API no roadmap.sh](https://roadmap.sh/projects/expense-tracker-api)
- [Blogging Platform API no roadmap.sh](https://roadmap.sh/projects/blogging-platform-api)
- [Todo List API no roadmap.sh](https://roadmap.sh/projects/todo-list-api)
- [GitHub Trending CLI no roadmap.sh](https://roadmap.sh/projects/github-trending-cli)

## Objetivo

- Praticar lógica de programação e organização de código
- Trabalhar com sistema de arquivos, APIs e bancos de dados, de acordo com cada projeto
- Praticar desenvolvimento backend com Node.js
- Praticar conceitos como autenticação JWT, arquitetura em camadas (MVC + Services) e segurança
- Manter um portfólio versionado e atualizado com o meu progresso