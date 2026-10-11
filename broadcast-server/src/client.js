const WebSocket = require('ws');
const readline = require('readline');

function connectClient(serverUrl = 'ws://localhost:8080') {
  const ws = new WebSocket(serverUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  ws.on('open', () => {
    console.log(`[Cliente] Conectado com sucesso a ${serverUrl}`);
    console.log('[Cliente] Escreve a tua mensagem e pressiona Enter para fazer broadcast (Ctrl+C para sair):\n');
    rl.prompt();
  });

  ws.on('message', (data) => {
    try {
      const parsed = JSON.parse(data.toString());
      if (parsed.type === 'system') {
        console.log(`\n📢 [Sistema]: ${parsed.message}`);
      } else {
        console.log(`\n💬 [Broadcast]: ${parsed.message}`);
      }
    } catch (e) {
      console.log(`\n💬 [Mensagem]: ${data.toString()}`);
    }
    rl.prompt();
  });

  rl.on('line', (line) => {
    const trimmed = line.trim();
    if (trimmed) {
      ws.send(trimmed);
    }
    rl.prompt();
  });

  ws.on('close', () => {
    console.log('\n[Cliente] Desconectado do servidor.');
    rl.close();
    process.exit(0);
  });

  ws.on('error', (error) => {
    console.error('\n[Cliente] Erro de conexão:', error.message);
    rl.close();
    process.exit(1);
  });
}

module.exports = { connectClient };