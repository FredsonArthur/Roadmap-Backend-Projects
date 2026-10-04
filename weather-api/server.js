'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const { createClient } = require('redis');

const {
  loadConfig,
  describeConfig,
} = require('./src/config');

const { TtlCache } = require('./src/cache');

const {
  createRateLimiter,
  rateLimitHeaders,
} = require('./src/rate-limiter');

const {
  createWeatherService,
  WeatherServiceError,
} = require('./src/weather-service');

// ---------- Carregamento do .env ----------

function loadDotEnv() {
  const envPath = path.join(__dirname, '.env');

  if (!fs.existsSync(envPath)) {
    return;
  }

  const content = fs.readFileSync(envPath, 'utf8');

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      value.length >= 2 &&
      (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      )
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadDotEnv();

// ---------- Respostas HTTP ----------

function sendJson(res, statusCode, data, extraHeaders = {}) {
  const body = JSON.stringify(data);

  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    ...extraHeaders,
  });

  res.end(body);
}

function sendError(res, statusCode, code, message, extraHeaders = {}) {
  sendJson(
    res,
    statusCode,
    {
      error: {
        code,
        message,
      },
    },
    extraHeaders
  );
}

function sendNotFound(res) {
  sendError(
    res,
    404,
    'NOT_FOUND',
    'The requested resource was not found.'
  );
}

// ---------- Cache Redis ----------

function createRedisCache(client) {
  return {
    async get(key) {
      const value = await client.get(key);

      if (value === null) {
        return undefined;
      }

      return JSON.parse(value);
    },

    async set(key, value, ttlSeconds) {
      await client.set(
        key,
        JSON.stringify(value),
        {
          EX: Math.ceil(ttlSeconds),
        }
      );
    },

    clear() {
      // O Redis é responsável pelo armazenamento e expiração das chaves.
    },

    close() {
      // O cliente Redis é fechado pelo servidor.
    },
  };
}

// ---------- Servidor ----------

async function startServer() {
  const config = loadConfig();

  let redisClient = null;
  let cache;

  if (config.cache.redisUrl) {
    redisClient = createClient({
      url: config.cache.redisUrl,
    });

    redisClient.on('error', (error) => {
      console.error('Redis error:', error.message);
    });

    await redisClient.connect();

    cache = createRedisCache(redisClient);

    console.log('Cache: Redis');
  } else {
    cache = new TtlCache({
      maxEntries: config.cache.maxEntries,
      sweepIntervalMs: 60 * 1000,
    });

    console.log('Cache: in-memory');
  }

  const rateLimiter = createRateLimiter({
    max: config.rateLimit.max,
    windowSeconds: config.rateLimit.windowSeconds,
    trustProxy: config.trustProxy,
  });

  const weatherService = createWeatherService({
    config,
    cache,
  });

  const server = http.createServer(async (req, res) => {
    try {
      const requestUrl = new URL(
        req.url,
        `http://${req.headers.host || 'localhost'}`
      );

      const pathname = requestUrl.pathname;

      const rateLimitResult = rateLimiter.check(req);

      const rateHeaders = rateLimitHeaders(rateLimitResult);

      if (!rateLimitResult.allowed) {
        sendError(
          res,
          429,
          'RATE_LIMIT_EXCEEDED',
          'Too many requests. Please try again later.',
          rateHeaders
        );

        return;
      }

      if (
        req.method === 'GET' &&
        pathname.startsWith('/weather/')
      ) {
        const city = decodeURIComponent(
          pathname.slice('/weather/'.length)
        );

        const result = await weatherService.fetchWeather(city);

        sendJson(
          res,
          200,
          {
            ...result.data,
            cached: result.cached,
          },
          rateHeaders
        );

        return;
      }

      if (
        req.method === 'GET' &&
        pathname === '/health'
      ) {
        sendJson(
          res,
          200,
          {
            status: 'ok',
          },
          rateHeaders
        );

        return;
      }

      sendNotFound(res);
    } catch (error) {
      if (error instanceof WeatherServiceError) {
        sendError(
          res,
          error.statusCode,
          error.code,
          error.message
        );

        return;
      }

      console.error(error);

      sendError(
        res,
        500,
        'INTERNAL_SERVER_ERROR',
        'An unexpected error occurred.'
      );
    }
  });

  server.on('error', async (error) => {
    console.error('Server error:', error);

    if (redisClient) {
      await redisClient.quit().catch(() => {});
    }

    rateLimiter.close();
    cache.close?.();

    process.exit(1);
  });

  const shutdown = async (signal) => {
    console.log(`\nReceived ${signal}. Shutting down...`);

    server.close(async () => {
      rateLimiter.close();
      cache.close?.();

      if (redisClient) {
        await redisClient.quit().catch(() => {});
      }

      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  server.listen(config.port, config.host, () => {
    console.log('Weather API started.');
    console.log(describeConfig(config));
    console.log(
      `Weather endpoint: http://${config.host}:${config.port}/weather/:city`
    );
  });
}

startServer().catch((error) => {
  console.error('Failed to start Weather API.');

  if (error?.problems) {
    console.error(error.message);
  } else {
    console.error(error);
  }

  process.exit(1);
});