# URL Shortening Service

Uma API RESTful em Node.js desenvolvida para encurtar URLs longas, permitindo operações CRUD completas, redirecionamento HTTP 301, rastreamento de estatísticas de acesso e persistência local em ficheiro JSON.

Este projeto faz parte dos desafios do nível *Intermediário* do [roadmap.sh](https://roadmap.sh/projects/url-shortening-service).

---

## Funcionalidades

- **Encurtar URL (`POST /shorten`)**: Valida e cria uma nova URL encurtada com um código aleatório exclusivo (`shortCode`).
- **Recuperar URL (`GET /shorten/:shortCode`)**: Retorna os detalhes da URL original correspondente ao código.
- **Redirecionamento (`GET /:shortCode`)**: Redireciona o utilizador diretamente para a URL longa original através de um redirecionamento HTTP `301 Moved Permanently`, incrementando o contador de acessos.
- **Atualizar URL (`PUT /shorten/:shortCode`)**: Atualiza a URL longa associada a um código existente.
- **Estatísticas (`GET /shorten/:shortCode/stats`)**: Consulta as estatísticas de acesso de uma URL encurtada (incluindo o `accessCount`).
- **Deletar URL (`DELETE /shorten/:shortCode`)**: Remove uma URL encurtada do sistema.

---

## Como Executar

### 1. Instalar as Dependências
Na pasta do projeto (`url-shortening-service`), executa:
```
npm install
```
### 2. Iniciar o Servidor

    npm start

O servidor será executado por defeito em http://localhost:3000.
Exemplos de Uso (Endpoints via cURL)
### 1. Encurtar uma URL

    curl -X POST http://localhost:3000/shorten \
    -H "Content-Type: application/json" \
    -d '{"url": "[https://www.example.com/some/long/url](https://www.example.com/some/long/url)"}'

### 2. Obter Detalhes da URL Encurtada

    curl http://localhost:3000/shorten/<shortCode>

### 3. Consultar Estatísticas

    curl http://localhost:3000/shorten/<shortCode>/stats

### 4. Atualizar a URL

    curl -X PUT http://localhost:3000/shorten/<shortCode> \
    -H "Content-Type: application/json" \
    -d '{"url": "[https://www.example.com/some/updated/url](https://www.example.com/some/updated/url)"}'

### 5. Testar o Redirecionamento

    curl -I http://localhost:3000/<shortCode>

### 6. Deletar a URL

    curl -X DELETE -i http://localhost:3000/shorten/<shortCode>

### Licença

    Este projeto está sob a licença MIT.