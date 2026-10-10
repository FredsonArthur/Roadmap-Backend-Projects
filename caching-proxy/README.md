# Caching Proxy

Uma ferramenta de linha de comando (CLI) em Node.js que atua como um servidor proxy reverso com suporte a cache em memória. O servidor reencaminha requisições HTTP para um servidor de origem, armazena as respostas e serve requisições idênticas diretamente a partir do cache para otimizar o desempenho.

Este projeto faz parte dos desafios do nível *Intermediário* do [roadmap.sh](https://roadmap.sh/projects/caching-server).

---

## Funcionalidades

- **Servidor Proxy Configurável (`--port` e `--origin`)**: Inicia um servidor HTTP que reencaminha os pedidos para qualquer URL de origem especificada.
- **Sistema de Cache Inteligente**: 
  - Adiciona o cabeçalho `X-Cache: MISS` quando a resposta é obtida do servidor de origem.
  - Adiciona o cabeçalho `X-Cache: HIT` quando a resposta é servida a partir do cache local.
- **Limpeza de Cache (`--clear-cache`)**: Permite limpar o armazenamento em cache de forma simples através da linha de comando.

---

## Como Utilizar

### 1. Instalação das Dependências
Na pasta do projeto, executa:
```bash
npm install
```
### 2. Iniciar o Servidor Caching Proxy

    npx caching-proxy --port <numero-da-porta> --origin <url-de-origem>

Exemplo:

npx caching-proxy --port 3000 --origin [http://dummyjson.com](http://dummyjson.com)

### 3. Testar as Requisições

Com o servidor a correr, podes fazer pedidos através de ferramentas como curl ou o teu browser:

Primeiro pedido (Vai buscar ao servidor de origem):
    
    curl -i http://localhost:3000/products

(Verás o cabeçalho X-Cache: MISS)

Segundo pedido repetido (Serve do cache):

    curl -i http://localhost:3000/products

(Verás o cabeçalho X-Cache: HIT)

### 4. Limpar o Cache

Para limpar o cache armazenado:

    npx caching-proxy --clear-cache

### Licença

Este projeto está sob a licença MIT.