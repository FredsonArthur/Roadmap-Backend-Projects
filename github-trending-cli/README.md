# GitHub Trending CLI

Uma aplicação de linha de comando (CLI) desenvolvida em Node.js que interage com a API REST do GitHub para listar os repositórios em alta, permitindo filtrar por períodos de tempo e limitar a quantidade de resultados exibidos.

Este projeto faz parte dos desafios do nível *Intermediate* do [roadmap.sh](https://roadmap.sh/projects/github-trending-cli).

---

## Funcionalidades

- **Filtro por Período (`--duration`)**: Suporta pesquisa por dia (`day`), semana (`week`), mês (`month`) e ano (`year`).
- **Limite de Resultados (`--limit`)**: Permite especificar quantos repositórios deseja exibir (padrão: 10).
- **Ordenação Automática**: Os repositórios são automaticamente ordenados pelo número de estrelas em ordem decrescente.
- **Tratamento de Erros Robusto**: Validação de parâmetros de entrada e gestão de erros de comunicação com a API do GitHub.

---

## Tecnologias Utilizadas

- **Node.js**: Ambiente de execução JavaScript.
- **Axios**: Cliente HTTP para requisições à API REST do GitHub.
- **Commander**: Framework para a criação de interfaces de linha de comando (CLI) em Node.js.

---

## Estrutura do Projeto

```text
github-trending-cli/
├── src/
│   ├── api/
│   │   └── githubService.js   # Comunicação e tratamento de erros com a API do GitHub
│   ├── utils/
│   │   └── dateHelper.js      # Cálculo dinâmico de datas com base na duração
│   ├── cli.js                 # Configuração de comandos e argumentos com o Commander
│   └── index.js               # Ponto de entrada executável da CLI
├── .gitignore
├── package.json
└── README.md
```
Como Instalar e Utilizar
1. Pré-requisitos

Certifique-se de que tem o Node.js instalado no seu sistema.
2. Instalação das Dependências

Na pasta do projeto (github-trending-cli), instale as dependências necessárias:
Bash

npm install

3. Exemplos de Uso

Pode executar a ferramenta localmente utilizando o npx:

    Listar repositórios populares da última semana (padrão, limite 10):
    Bash

    npx trending-repos

    Listar os 5 repositórios mais populares do último mês:
    Bash

    npx trending-repos --duration month --limit 5

    Listar repositórios populares do último ano com limite de 20:
    Bash

    npx trending-repos --duration year --limit 20

Licença

Este projeto está sob a licença MIT.