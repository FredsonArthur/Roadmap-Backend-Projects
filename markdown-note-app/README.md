# Markdown Note-taking App

Uma API RESTful em Node.js desenvolvida para gerir notas em formato Markdown, permitindo o armazenamento de ficheiros, verificação gramatical em tempo real via LanguageTool e renderização direta para HTML com a biblioteca `marked`.

Este projeto faz parte dos desafios do nível *Intermediário* do [roadmap.sh](https://roadmap.sh/projects/markdown-note-taking-app).

---

## Funcionalidades

- **Verificação Gramatical (`POST /api/grammar`)**: Analisa o texto enviado e identifica erros gramaticais, ortográficos e de concordância.
- **Salvar Notas (`POST /api/notes`)**: Permite guardar notas enviando o nome do ficheiro e o conteúdo em texto plano ou via upload de ficheiro (`multipart/form-data`).
- **Listar Notas (`GET /api/notes`)**: Retorna a lista de todas as notas salvas no servidor com respetivos tamanhos e datas de criação.
- **Renderização HTML (`GET /api/notes/:filename/html`)**: Converte o ficheiro Markdown selecionado e devolve a resposta formatada diretamente em HTML.

---

## Como Executar

### 1. Instalar as Dependências
Na pasta do projeto (`markdown-note-app`), executa:
```
npm install
```
### 2. Iniciar o Servidor

    npm start

O servidor será executado por defeito em http://localhost:3000.
Exemplos de Uso (Endpoints)
### 1. Verificar Gramática

    curl -X POST http://localhost:3000/api/grammar \
    -H "Content-Type: application/json" \
    -d '{"text": "This are a bad written sentence."}'

### 2. Salvar uma Nota

    curl -X POST http://localhost:3000/api/notes \
    -H "Content-Type: application/json" \
    -d '{"filename": "nota.md", "content": "# Título da Nota\n\nConteúdo em **Markdown**."}'

### 3. Listar Notas Salvas

    curl http://localhost:3000/api/notes

### 4. Obter Nota em HTML

    curl http://localhost:3000/api/notes/nota.md/html

### Licença

    Este projeto está sob a licença MIT.