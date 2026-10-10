# TMDB CLI Tool

Uma aplicação de linha de comando (CLI) desenvolvida em Node.js para listar filmes por categorias (em exibição, populares, mais votados e futuros), funcionando em modo simulado (*offline*).

Este projeto faz parte dos desafios do nível *Beginner* do [roadmap.sh](https://roadmap.sh/projects/tmdb-cli).

---

## Funcionalidades

- **Filtro por Tipo de Filme (`--type`)**: Suporta as categorias:
  - `playing` (Em exibição)
  - `popular` (Populares)
  - `top` (Mais votados)
  - `upcoming` (Próximas estreias)
- **Exibição Formatada**: Apresenta no terminal o título, ano de lançamento, classificação média, contagem de votos e sinopse resumida.

---

## Como Utilizar

Não é necessária qualquer chave de API ou configuração de ficheiro `.env`.

1. **Instalação das Dependências:**
   ```bash
   npm install
   ```
2. Exemplos de Execução:
    ```
    npx tmdb-app --type popular
    npx tmdb-app --type playing
    npx tmdb-app --type top
    npx tmdb-app --type upcoming
    ```
Licença

Este projeto está sob a licença MIT.