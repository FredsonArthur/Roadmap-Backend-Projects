'use strict';

const net = require('net');

// ---------- Identificação do cliente ----------

// Expande um endereço IPv6 válido para os seus 8 grupos numéricos
function expandIPv6(address) {
  let text = address.toLowerCase();

  // IPv4 embutido no final (por exemplo, 64:ff9b::1.2.3.4) vira dois grupos hexadecimais
  const lastColon = text.lastIndexOf(':');
  const tail = text.slice(lastColon + 1);
  if (tail.includes('.')) {
    const [a, b, c, d] = tail.split('.').map(Number);
    text = `${text.slice(0, lastColon + 1)}${((a << 8) | b).toString(16)}:${((c << 8) | d).toString(16)}`;
  }

  const halves = text.split('::');
  const left = halves[0] === '' ? [] : halves[0].split(':');
  if (halves.length === 1) return left.map((group) => parseInt(group, 16));

  const right = halves[1] === '' ? [] : halves[1].split(':');
  const zeros = new Array(8 - left.length - right.length).fill('0');
  return [...left, ...zeros, ...right].map((group) => parseInt(group, 16));
}

// Devolve o endereço IP em formato padronizado, ou null se não for um IP válido
function normalizeIp(value) {
  if (typeof value !== 'string') return null;

  let ip = value.trim().split('%')[0]; // remove a zona de rede, como em fe80::1%eth0
  // IPv4 que chega como IPv6 (::ffff:1.2.3.4) é tratado como o IPv4 comum
  if (ip.toLowerCase().startsWith('::ffff:') && net.isIPv4(ip.slice(7))) ip = ip.slice(7);

  const version = net.isIP(ip);
  if (version === 4) return ip;
  if (version === 6) {
    // Quem tem IPv6 costuma controlar uma faixa inteira (/64) de endereços e poderia
    // trocar de endereço a cada requisição para escapar do limite, então a faixa é o "cliente"
    return `${expandIPv6(ip).slice(0, 4).map((group) => group.toString(16)).join(':')}::/64`;
  }
  return null;
}

// Descobre quem está fazendo a requisição. O cabeçalho X-Forwarded-For só é usado com
// trustProxy ligado (API atrás de um proxy), porque qualquer cliente pode inventá-lo.
// Atrás de um proxy confiável, vale o último endereço da lista: foi o proxy que o anotou.
function getClientIp(req, trustProxy = false) {
  if (trustProxy) {
    const forwarded = req.headers && req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      const ip = normalizeIp(forwarded.split(',').pop());
      if (ip) return ip;
    }
  }
  return normalizeIp(req.socket && req.socket.remoteAddress) || 'unknown';
}

// ---------- Limitador ----------

// Limite por cliente em janelas fixas: cada cliente pode fazer "max" requisições
// a cada "windowSeconds" segundos. A contagem fica em memória.
function createRateLimiter({ max, windowSeconds, trustProxy = false, maxClients = 10000 }) {
  if (!Number.isInteger(max) || max < 1) {
    throw new RangeError('max must be a positive integer');
  }
  if (typeof windowSeconds !== 'number' || !Number.isFinite(windowSeconds) || windowSeconds <= 0) {
    throw new RangeError('windowSeconds must be a positive number');
  }
  if (!Number.isInteger(maxClients) || maxClients < 1) {
    throw new RangeError('maxClients must be a positive integer');
  }

  const windowMs = windowSeconds * 1000;
  const clients = new Map(); // cliente -> { count, resetAt }

  // Remove os clientes cuja janela já terminou
  function sweep() {
    const now = Date.now();
    for (const [key, entry] of clients) {
      if (entry.resetAt <= now) clients.delete(key);
    }
  }

  const timer = setInterval(sweep, Math.min(Math.max(windowMs, 1000), 60 * 1000));
  timer.unref(); // não impede o programa de encerrar

  // Registra uma requisição e informa se ela pode passar
  function check(req) {
    const key = getClientIp(req, trustProxy);
    const now = Date.now();

    let entry = clients.get(key);
    if (!entry || entry.resetAt <= now) {
      // Limite de clientes guardados: descarta os expirados e, se ainda estiver cheio,
      // o mais antigo (que é também o que está mais perto de expirar)
      clients.delete(key);
      if (clients.size >= maxClients) sweep();
      while (clients.size >= maxClients) {
        clients.delete(clients.keys().next().value);
      }
      entry = { count: 0, resetAt: now + windowMs };
      clients.set(key, entry);
    }

    const allowed = entry.count < max;
    if (allowed) entry.count++;

    const resetSeconds = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
    return {
      allowed,
      limit: max,
      remaining: max - entry.count,
      resetSeconds, // em quantos segundos a contagem deste cliente volta a zero
      retryAfterSeconds: allowed ? 0 : resetSeconds,
    };
  }

  return {
    check,
    sweep,
    get size() {
      return clients.size;
    },
    close() {
      clearInterval(timer);
    },
  };
}

// Cabeçalhos HTTP que informam o estado do limite (nomes do padrão RateLimit do IETF)
function rateLimitHeaders(result) {
  const headers = {
    'RateLimit-Limit': String(result.limit),
    'RateLimit-Remaining': String(result.remaining),
    'RateLimit-Reset': String(result.resetSeconds),
  };
  if (!result.allowed) headers['Retry-After'] = String(result.retryAfterSeconds);
  return headers;
}

module.exports = { createRateLimiter, rateLimitHeaders, getClientIp };