'use strict';

// Cotações ao vivo da API pública Frankfurter (https://frankfurter.dev), sem chave de acesso.
// Se a API estiver fora do ar ou sem internet, usa uma tabela offline aproximada.
const API_BASE = 'https://api.frankfurter.dev/v2';
const REQUEST_TIMEOUT_MS = 4000;
const CACHE_TTL_MS = 60 * 60 * 1000; // as cotações mudam uma vez por dia, então 1 hora de cache basta
const BACKOFF_MS = 5 * 60 * 1000; // após uma falha de rede, usa a tabela offline por 5 minutos

const units = [
  { code: 'BRL', name: 'Brazilian Real' },
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', name: 'Chinese Yuan' },
  { code: 'MXN', name: 'Mexican Peso' },
  { code: 'ARS', name: 'Argentine Peso' },
  { code: 'CLP', name: 'Chilean Peso' },
  { code: 'COP', name: 'Colombian Peso' },
  { code: 'PEN', name: 'Peruvian Sol' },
  { code: 'UYU', name: 'Uruguayan Peso' },
  { code: 'INR', name: 'Indian Rupee' },
  { code: 'KRW', name: 'South Korean Won' },
  { code: 'ZAR', name: 'South African Rand' },
  { code: 'TRY', name: 'Turkish Lira' },
  { code: 'SEK', name: 'Swedish Krona' },
  { code: 'NOK', name: 'Norwegian Krone' },
  { code: 'DKK', name: 'Danish Krone' },
  { code: 'NZD', name: 'New Zealand Dollar' },
  { code: 'SGD', name: 'Singapore Dollar' },
  { code: 'HKD', name: 'Hong Kong Dollar' },
  { code: 'PLN', name: 'Polish Zloty' },
];

// Tabela offline: quanto vale 1 euro em cada moeda (cotações de referência de 12/01/2026).
// É só uma estimativa para quando as cotações ao vivo não estiverem disponíveis.
const OFFLINE_DATE = '2026-01-12';
const OFFLINE_RATES_PER_EUR = {
  BRL: 6.27,
  USD: 1.1666,
  EUR: 1,
  GBP: 0.86779,
  JPY: 184.15,
  CAD: 1.6197,
  AUD: 1.7427,
  CHF: 0.93148,
  CNY: 8.1326,
  MXN: 20.932,
  ARS: 1709.95,
  CLP: 1041.05,
  COP: 4343.29,
  PEN: 3.9231,
  UYU: 45.338,
  INR: 105.08,
  KRW: 1708.39,
  ZAR: 19.1707,
  TRY: 50.317,
  SEK: 10.7176,
  NOK: 11.7508,
  DKK: 7.4713,
  NZD: 2.0286,
  SGD: 1.5004,
  HKD: 9.102,
  PLN: 4.2103,
};

// ---------- Cotações ----------

const cache = new Map(); // "BRL/USD" -> { rate, date, fetchedAt }
const inFlight = new Map(); // "BRL/USD" -> requisição em andamento
let liveBackoffUntil = 0;

// Busca a cotação de 1 unidade de "from" em "to". Em caso de erro, lança uma exceção
// com backoff = true quando vale a pena parar de tentar por alguns minutos.
async function fetchLiveRate(from, to) {
  const url = `${API_BASE}/rate/${from.toLowerCase()}/${to.toLowerCase()}`;

  let response;
  try {
    response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (err) {
    throw Object.assign(new Error('network error'), { backoff: true });
  }

  if (response.status === 429 || response.status >= 500) {
    throw Object.assign(new Error('service unavailable'), { backoff: true });
  }
  if (!response.ok) throw new Error('pair not available');

  let data;
  try {
    data = await response.json();
  } catch (err) {
    throw Object.assign(new Error('invalid response'), { backoff: true });
  }

  const rate = data && data.rate;
  if (typeof rate !== 'number' || !Number.isFinite(rate) || rate <= 0) {
    throw Object.assign(new Error('invalid rate'), { backoff: true });
  }
  const date = typeof data.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(data.date) ? data.date : null;
  return { rate, date };
}

// Evita várias requisições iguais ao mesmo tempo
function requestLiveRate(key, from, to) {
  if (!inFlight.has(key)) {
    const request = fetchLiveRate(from, to)
      .then((live) => {
        cache.set(key, { ...live, fetchedAt: Date.now() });
        return live;
      })
      .finally(() => inFlight.delete(key));
    inFlight.set(key, request);
  }
  return inFlight.get(key);
}

function offlineRate(from, to) {
  return {
    rate: OFFLINE_RATES_PER_EUR[to] / OFFLINE_RATES_PER_EUR[from],
    date: OFFLINE_DATE,
    source: 'offline',
  };
}

async function getRate(from, to) {
  if (from === to) return { rate: 1, date: null, source: 'live' };

  const key = `${from}/${to}`;
  const cached = cache.get(key);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return { rate: cached.rate, date: cached.date, source: 'live' };
  }

  if (Date.now() >= liveBackoffUntil) {
    try {
      const live = await requestLiveRate(key, from, to);
      return { ...live, source: 'live' };
    } catch (err) {
      if (err.backoff) liveBackoffUntil = Date.now() + BACKOFF_MS;
    }
  }

  // Sem cotação nova: uma cotação antiga (porém real) é melhor que a tabela offline
  if (cached) return { rate: cached.rate, date: cached.date, source: 'live' };
  return offlineRate(from, to);
}

// ---------- Números ----------

// Converte o texto digitado em número. Aceita vírgula ou ponto como separador decimal.
// Retorna null se o texto não for um número válido.
function parseNumber(text) {
  const normalized = text.trim().replace(',', '.');
  if (!/^[+-]?(\d+\.?\d*|\.\d+)$/.test(normalized)) return null;
  const number = Number(normalized);
  return Number.isFinite(number) ? number : null;
}

// Formata o número para exibição, sem os ruídos de ponto flutuante
function formatNumber(number) {
  if (number === 0) return '0';
  const abs = Math.abs(number);
  const digits = Math.min(15, Math.max(10, Math.floor(Math.log10(abs)) + 1));
  const rounded = Number(number.toPrecision(digits));

  if (abs >= 1e21 || abs < 1e-6) return rounded.toExponential();
  return rounded.toLocaleString('en-US', { useGrouping: false, maximumFractionDigits: 20 });
}

// Valores em dinheiro: 2 casas decimais; valores abaixo de 1 mostram 4 dígitos significativos
function formatMoney(number) {
  const abs = Math.abs(number);
  if (number === 0) return '0.00';
  if (abs >= 1e15 || abs < 1e-6) return formatNumber(number);
  if (abs >= 1) {
    return number.toLocaleString('en-US', {
      useGrouping: false,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  return number.toLocaleString('en-US', { useGrouping: false, maximumSignificantDigits: 4 });
}

function describeRate(rateInfo) {
  if (rateInfo.source === 'offline') return ` (offline estimate, rate of ${rateInfo.date})`;
  if (rateInfo.date) return ` (rate of ${rateInfo.date})`;
  return '';
}

async function convert(value, from, to) {
  if (!Object.hasOwn(OFFLINE_RATES_PER_EUR, from) || !Object.hasOwn(OFFLINE_RATES_PER_EUR, to)) {
    return { error: 'Please select valid currencies.' };
  }

  const amount = parseNumber(value);
  if (amount === null) {
    return { error: 'Please enter a valid amount (for example 100 or 49.90).' };
  }
  if (amount < 0) {
    return { error: 'The amount cannot be negative.' };
  }

  const rateInfo = await getRate(from, to);
  const converted = amount * rateInfo.rate;
  if (!Number.isFinite(converted)) {
    return { error: 'That amount is too large to convert.' };
  }

  return {
    result: `${formatNumber(amount)} ${from} = ${formatMoney(converted)} ${to}${describeRate(rateInfo)}`,
  };
}

module.exports = {
  slug: 'currency',
  name: 'Currency',
  inputLabel: 'Enter the amount to convert',
  units,
  convert,
};