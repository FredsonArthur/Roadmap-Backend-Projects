const WebSocket = require('ws');

function startServer(port = 8080) {
  const wss = new WebSocket.Server({ port });
  
  // Conjunto para armazenar todos os clientes conectados
  const clients = new Set();

  console.log(`[Servidor] Broadcast Server iniciado na porta ${port}...`);

  wss.on('connection', (ws) => {
    clients.add(ws);
    console.log(`[Servidor] Novo cliente conectado. Total de clientes: ${clients.size}`);

    // Enviar mensagem de boas-vindas ao cliente recém-conectado
    ws.send(JSON.stringify({ type: 'system', message: 'Conectado com sucesso ao Broadcast Server!' }));

    // Ouvi mensagens enviadas por este cliente
    ws.on('message', (message) => {
      const messageStr = message.toString();
      console.log(`[Servidor] Mensagem recebida: "${messageStr}". A fazer broadcast...`);

      // Broadcast para todos os clientes conectados
      for (const client of clients) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'broadcast', message: messageStr }));
        }
      }
    });

    // Tratar desconexão do cliente
    ws.on('close', () => {
      clients.delete(ws);
      console.log(`[Servidor] Cliente desconectado. Total de clientes: ${clients.size}`);
    });

    // Tratar erros na conexão do cliente
    ws.on('error', (error) => {
      console.error(`[Servidor] Erro na conexão do cliente:`, error.message);
    });
  });

  wss.on('error', (error) => {
    console.error(`[Servidor] Erro crítico no servidor WebSocket:`, error.message);
  });
}

module.exports = { startServer };