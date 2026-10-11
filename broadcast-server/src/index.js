#!/usr/bin/env node

const { startServer } = require('./server');
const { connectClient } = require('./client');

const args = process.argv.slice(2);
const command = args[0];

if (command === 'start') {
  const port = args[1] ? parseInt(args[1], 10) : 8080;
  startServer(port);
} else if (command === 'connect') {
  const url = args[1] || 'ws://localhost:8080';
  connectClient(url);
} else {
  console.log('Uso incorreto!');
  console.log('Comandos disponíveis:');
  console.log('  node src/index.js start [porta]      - Inicia o Broadcast Server');
  console.log('  node src/index.js connect [ws://url] - Conecta ao Broadcast Server como cliente');
  process.exit(1);
}