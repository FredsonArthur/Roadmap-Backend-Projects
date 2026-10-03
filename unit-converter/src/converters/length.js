'use strict';

// Quantos metros vale cada unidade (definições exatas)
const METERS_PER_UNIT = {
  mm: 0.001,
  cm: 0.01,
  m: 1,
  km: 1000,
  in: 0.0254,
  ft: 0.3048,
  yd: 0.9144,
  mi: 1609.344,
};

const units = [
  { code: 'mm', name: 'Millimeter' },
  { code: 'cm', name: 'Centimeter' },
  { code: 'm', name: 'Meter' },
  { code: 'km', name: 'Kilometer' },
  { code: 'in', name: 'Inch' },
  { code: 'ft', name: 'Foot' },
  { code: 'yd', name: 'Yard' },
  { code: 'mi', name: 'Mile' },
];

// Converte o texto digitado em número. Aceita vírgula ou ponto como separador decimal.
// Retorna null se o texto não for um número válido.
function parseNumber(text) {
  const normalized = text.trim().replace(',', '.');
  if (!/^[+-]?(\d+\.?\d*|\.\d+)$/.test(normalized)) return null;
  const number = Number(normalized);
  return Number.isFinite(number) ? number : null;
}

// Formata o número para exibição, sem os ruídos de ponto flutuante
// (por exemplo, 609.6000000000001 vira 609.6)
function formatNumber(number) {
  if (number === 0) return '0';
  const abs = Math.abs(number);
  const digits = Math.min(15, Math.max(10, Math.floor(Math.log10(abs)) + 1));
  const rounded = Number(number.toPrecision(digits));

  if (abs >= 1e21 || abs < 1e-6) return rounded.toExponential();
  return rounded.toLocaleString('en-US', { useGrouping: false, maximumFractionDigits: 20 });
}

function convert(value, from, to) {
  if (!Object.hasOwn(METERS_PER_UNIT, from) || !Object.hasOwn(METERS_PER_UNIT, to)) {
    return { error: 'Please select valid units.' };
  }

  const number = parseNumber(value);
  if (number === null) {
    return { error: 'Please enter a valid number (for example 12 or 3.5).' };
  }

  const converted = (number * METERS_PER_UNIT[from]) / METERS_PER_UNIT[to];
  if (!Number.isFinite(converted)) {
    return { error: 'That number is too large to convert.' };
  }

  return { result: `${formatNumber(number)} ${from} = ${formatNumber(converted)} ${to}` };
}

module.exports = {
  slug: 'length',
  name: 'Length',
  units,
  convert,
};