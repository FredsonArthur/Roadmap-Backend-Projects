const http = require('http');
const axios = require('axios');

// Armazenamento em memória para o cache: chave -> { status, headers, data }
const cache = new Map();

/**
 * Inicia o servidor Caching Proxy
 */
function startProxyServer(port, origin) {
  const server = http.createServer(async (req, res) => {
    const targetUrl = `${origin}${req.url}`;
    const cacheKey = `${req.method}:${req.url}`;

    // Verificar se a resposta já está em cache
    if (cache.has(cacheKey)) {
      console.log(`[CACHE HIT] ${req.method} ${req.url}`);
      const cached = cache.get(cacheKey);

      res.writeHead(cached.status, {
        ...cached.headers,
        'X-Cache': 'HIT'
      });
      res.end(cached.data);
      return;
    }

    console.log(`[CACHE MISS] Encaminhando: ${req.method} ${req.url} -> ${targetUrl}`);

    try {
      // Fazer o pedido ao servidor de origem usando axios
      const response = await axios({
        method: req.method,
        url: targetUrl,
        headers: {
          ...req.headers,
          host: new URL(origin).host
        },
        data: req.method !== 'GET' && req.method !== 'HEAD' ? req : undefined,
        validateStatus: () => true // Permitir capturar qualquer código de status (ex: 404, 500)
      });

      // Preparar os dados para cache (garantindo compatibilidade com buffers ou strings)
      const responseData = typeof response.data === 'object' 
        ? JSON.stringify(response.data) 
        : response.data;

      // Guardar no cache
      cache.set(cacheKey, {
        status: response.status,
        headers: response.headers,
        data: responseData
      });

      // Enviar resposta ao cliente com X-Cache: MISS
      res.writeHead(response.status, {
        ...response.headers,
        'X-Cache': 'MISS'
      });
      res.end(responseData);

    } catch (error) {
      console.error(`Erro ao comunicar com a origem (${origin}):`, error.message);
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Bad Gateway - Não foi possível contactar o servidor de origem.' }));
    }
  });

  server.listen(port, () => {
    console.log(`\n🚀 Caching Proxy a correr na porta ${port}`);
    console.log(`🌐 Servidor de origem configurado: ${origin}\n`);
  });
}

/**
 * Limpa o cache armazenado (caso guardado em ficheiro ou simulação)
 */
function clearCache() {
  cache.clear();
  console.log('🧹 Cache limpo com sucesso!');
}

module.exports = { startProxyServer, clearCache };