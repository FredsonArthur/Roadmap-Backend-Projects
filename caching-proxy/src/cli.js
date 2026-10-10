const { program } = require('commander');
const { startProxyServer, clearCache } = require('./proxy');

function runCli() {
  program
    .version('1.0.0')
    .description('Servidor Caching Proxy em Node.js')
    .option('-p, --port <number>', 'Porta em que o servidor proxy vai correr', parseInt)
    .option('-o, --origin <url>', 'URL do servidor de origem para reencaminhar as requisições')
    .option('-c, --clear-cache', 'Limpa o cache armazenado');

  program.parse(process.argv);
  const options = program.opts();

  // Se a opção --clear-cache for passada
  if (options.clearCache) {
    clearCache();
    return;
  }

  // Validar parâmetros obrigatórios para iniciar o servidor
  if (!options.port || !options.origin) {
    console.error('❌ Erro: Deves fornecer a porta (--port) e a URL de origem (--origin).');
    console.log('Exemplo de uso: caching-proxy --port 3000 --origin http://dummyjson.com');
    console.log('Ou para limpar o cache: caching-proxy --clear-cache');
    process.exit(1);
  }

  startProxyServer(options.port, options.origin);
}

module.exports = { runCli };