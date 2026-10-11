# Broadcast Server

Uma aplicação baseada em CLI construída em Node.js que implementa um servidor WebSocket para comunicação em tempo real, permitindo que múltiplos clientes se conectem, enviem mensagens e recebam *broadcasts* instantâneos de forma síncrona.

Este projeto faz parte dos desafios do nível *Intermediário* do [roadmap.sh](https://roadmap.sh/projects/broadcast-server).

---

## Funcionalidades

- **Servidor WebSocket (`broadcast-server start`)**: Escuta conexões de clientes em tempo real, gere a lista de clientes conectados e reencaminha cada mensagem recebida para todos os outros participantes.
- **Cliente CLI (`broadcast-server connect`)**: Permite que utilizadores se conectem ao servidor por linha de comando, enviando e recebendo mensagens interativamente.
- **Gestão de Conexões**: Tratamento automático de entradas, desconexões e erros com registos claros no terminal.

---

## Como Executar

### 1. Instalar as Dependências
Na pasta do projeto (`broadcast-server/`), executa:
```
npm install
```
### 2. Iniciar o Servidor

Num terminal, executa o comando para iniciar o servidor (porta padrão 8080):

    node src/index.js start

(Opcional: podes especificar uma porta customizada, ex: node src/index.js start 3000)
### 3. Conectar Clientes

Em novos terminais separados, executa o cliente para te conectares:

    node src/index.js connect

### Licença

    Este projeto está sob a licença MIT.