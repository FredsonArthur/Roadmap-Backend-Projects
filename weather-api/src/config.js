'use strict';

// Endereço da API Visual Crossing (Timeline Weather API).
// O local da consulta é acrescentado no final: .../timeline/<cidade>
const DEFAULT_BASE_URL =
  'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline';

const UNIT_GROUPS = ['metric', 'us', 'uk', 'base'];

class ConfigError extends Error {
  constructor(problems) {
    super(
      `Invalid configuration:\n${problems
        .map((problem) => `  - ${problem}`)
        .join('\n')}`
    );

    this.name = 'ConfigError';
    this.problems = problems;
  }
}

// ---------- Leitura das variáveis ----------

// Texto da variável, ou o valor padrão se ela não existir ou estiver em branco
function readString(env, name, fallback) {
  const raw = env[name];

  if (raw === undefined || raw === null) return fallback;

  const value = String(raw).trim();

  return value === '' ? fallback : value;
}

function readInteger(
  env,
  name,
  { fallback, min, max },
  problems
) {
  const value = readString(env, name, undefined);

  if (value === undefined) return fallback;

  if (!/^\d+$/.test(value)) {
    problems.push(
      `${name} must be a whole number (got "${value}").`
    );

    return fallback;
  }

  const number = Number(value);

  if (number < min || number > max) {
    problems.push(
      `${name} must be between ${min} and ${max} (got ${number}).`
    );

    return fallback;
  }

  return number;
}

function readBoolean(env, name, fallback, problems) {
  const value = readString(env, name, undefined);

  if (value === undefined) return fallback;

  const text = value.toLowerCase();

  if (['true', '1', 'yes'].includes(text)) return true;

  if (['false', '0', 'no'].includes(text)) return false;

  problems.push(
    `${name} must be true or false (got "${value}").`
  );

  return fallback;
}

// Valida um endereço. Os erros não mostram o valor,
// porque ele pode conter senha.
function readUrl(env, name, protocols, problems) {
  const value = readString(env, name, undefined);

  if (value === undefined) return undefined;

  try {
    const url = new URL(value);

    if (
      !protocols.includes(url.protocol) ||
      url.hostname === ''
    ) {
      throw new Error('invalid');
    }

    return value.replace(/\/+$/, '');
  } catch {
    problems.push(
      `${name} must be a valid URL starting with ${protocols
        .map((p) => `${p}//`)
        .join(' or ')}.`
    );

    return undefined;
  }
}

// ---------- Configuração ----------

// Lê e valida as variáveis de ambiente.
function loadConfig(env = process.env) {
  const problems = [];

  const mock = readBoolean(
    env,
    'WEATHER_MOCK',
    false,
    problems
  );

  let apiKey = readString(
    env,
    'WEATHER_API_KEY',
    undefined
  );

  // A chave só é obrigatória quando não estamos
  // executando em modo mock.
  if (!mock) {
    if (apiKey === undefined) {
      problems.push(
        'WEATHER_API_KEY is required when WEATHER_MOCK is false. Create a free key at https://www.visualcrossing.com/weather-api and add it to the .env file.'
      );
    } else if (
      /^your[\-_]/i.test(apiKey) ||
      /\s/.test(apiKey)
    ) {
      problems.push(
        'WEATHER_API_KEY still has the example value or contains spaces. Use your real API key.'
      );

      apiKey = undefined;
    }
  }

  const port = readInteger(
    env,
    'PORT',
    {
      fallback: 3000,
      min: 0,
      max: 65535,
    },
    problems
  );

  const host = readString(
    env,
    'HOST',
    '127.0.0.1'
  );

  const baseUrl =
    readUrl(
      env,
      'WEATHER_API_BASE_URL',
      ['http:', 'https:'],
      problems
    ) || DEFAULT_BASE_URL;

  const unitGroup = readString(
    env,
    'WEATHER_UNIT_GROUP',
    'metric'
  ).toLowerCase();

  if (!UNIT_GROUPS.includes(unitGroup)) {
    problems.push(
      `WEATHER_UNIT_GROUP must be one of: ${UNIT_GROUPS.join(
        ', '
      )}.`
    );
  }

  const timeoutMs = readInteger(
    env,
    'REQUEST_TIMEOUT_MS',
    {
      fallback: 8000,
      min: 1000,
      max: 60000,
    },
    problems
  );

  const redisUrl =
    readUrl(
      env,
      'REDIS_URL',
      ['redis:', 'rediss:'],
      problems
    ) || null;

  const ttlSeconds = readInteger(
    env,
    'CACHE_TTL_SECONDS',
    {
      fallback: 12 * 60 * 60,
      min: 1,
      max: 7 * 24 * 60 * 60,
    },
    problems
  );

  const maxEntries = readInteger(
    env,
    'CACHE_MAX_ENTRIES',
    {
      fallback: 500,
      min: 1,
      max: 100000,
    },
    problems
  );

  const rateMax = readInteger(
    env,
    'RATE_LIMIT_MAX',
    {
      fallback: 30,
      min: 1,
      max: 100000,
    },
    problems
  );

  const rateWindow = readInteger(
    env,
    'RATE_LIMIT_WINDOW_SECONDS',
    {
      fallback: 60,
      min: 1,
      max: 86400,
    },
    problems
  );

  const trustProxy = readBoolean(
    env,
    'TRUST_PROXY',
    false,
    problems
  );

  if (problems.length > 0) {
    throw new ConfigError(problems);
  }

  // A chave da API e a URL do Redis ficam escondidas
  // (não enumeráveis).
  const weather = {
    baseUrl,
    unitGroup,
    timeoutMs,
    mock,
  };

  Object.defineProperty(weather, 'apiKey', {
    value: apiKey,
    enumerable: false,
  });

  const cache = {
    ttlSeconds,
    maxEntries,
  };

  Object.defineProperty(cache, 'redisUrl', {
    value: redisUrl,
    enumerable: false,
  });

  return Object.freeze({
    port,
    host,
    weather: Object.freeze(weather),
    cache: Object.freeze(cache),
    rateLimit: Object.freeze({
      max: rateMax,
      windowSeconds: rateWindow,
    }),
    trustProxy,
  });
}

// Resumo da configuração para mostrar no terminal,
// sem nenhum segredo
function describeConfig(config) {
  const cacheKind = config.cache.redisUrl
    ? 'Redis'
    : `in-memory (up to ${config.cache.maxEntries} entries)`;

  const weatherProvider = config.weather.mock
    ? 'mock/local'
    : config.weather.baseUrl;

  return [
    `Listening on ${config.host}:${config.port}`,
    `Weather API: ${weatherProvider} (units: ${config.weather.unitGroup}, timeout: ${config.weather.timeoutMs} ms, key: ${config.weather.mock ? 'not required' : 'configured'})`,
    `Cache: ${cacheKind}, expires after ${config.cache.ttlSeconds} s`,
    `Rate limit: ${config.rateLimit.max} requests per ${config.rateLimit.windowSeconds} s per client (trust proxy: ${config.trustProxy ? 'yes' : 'no'})`,
  ].join('\n');
}

module.exports = {
  loadConfig,
  describeConfig,
  ConfigError,
};