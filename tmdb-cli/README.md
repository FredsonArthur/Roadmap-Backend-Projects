# TMDB CLI Tool

Uma aplicação de linha de comando (CLI) desenvolvida em Node.js que interage com a API do TMDB (The Movie Database) para listar filmes por categorias, permitindo visualizar filmes em exibição, populares, mais votados e futuros.

Este projeto faz parte dos desafios do nível *Beginner* do [roadmap.sh](https://roadmap.sh/projects/tmdb-cli).

---

## Funcionalidades

- **Filtro por Tipo de Filme (`--type`)**: Suporta as categorias:
  - `playing` (Em exibição / Now Playing)
  - `popular` (Populares / Popular)
  - `top` (Mais votados / Top Rated)
  - `upcoming` (Próximas estreias / Upcoming)
- **Exibição Formatada**: Apresenta no terminal o título, ano de lançamento, classificação média, contagem de votos e sinopse resumida.
- **Tratamento de Erros Robusto**: Validação de parâmetros de entrada e gestão de falhas de comunicação com a API ou ausência de chave de configuração.

---

## Tecnologias Utilizadas

- **Node.js**: Ambiente de execução JavaScript.
- **Axios**: Cliente HTTP para requisições à API do TMDB.
- **Commander**: Framework para a criação de interfaces de linha de comando (CLI).
- **Dotenv**: Gestão de variáveis de ambiente.

---

## Como Configurar e Utilizar

### 1. Obter uma Chave de API do TMDB
1. Crie uma conta gratuita em [The Movie Database (TMDB)](https://www.themoviedb.org/).
2. Vá às definições da sua conta na secção **API** para solicitar e obter a sua chave de API (v3 auth).

### 2. Configurar o Arquivo `.env`
Na pasta do projeto (`tmdb-cli`), crie um arquivo chamado `.env` baseado no `.env.example`:
```env
TMDB_API_KEY=a_sua_chave_de_api_aqui
```
3. Instalação das Dependências

Na pasta do projeto, instale as dependências necessárias:
Bash

npm install

4. Exemplos de Uso

Pode executar a ferramenta localmente utilizando o npx:

Listar filmes populares (padrão):
    Bash

    npx tmdb-app --type popular

Listar filmes em exibição atual:

    npx tmdb-app --type playing

Listar os filmes mais votados:

    npx tmdb-app --type top

Listar os próximos lançamentos:

    npx tmdb-app --type upcoming

Licença

Este projeto está sob a licença MIT.