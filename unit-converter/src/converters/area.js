'use strict';

// Quantos metros quadrados vale cada unidade (definições exatas)
const SQUARE_METERS_PER_UNIT = {
  'mm²': 0.000001,
  'cm²': 0.0001,
  'm²': 1,
  ha: 10000,
  'km²': 1000000,
  'in²': 0.00064516,
  'ft²': 0.09290304,
  'yd²': 0.83612736,
  ac: 4046.8564224,
  'mi²': 2589988.110336,
};

const units = [
  { code: 'mm²', name: 'Square Millimeter' },
  { code: 'cm²', name: 'Square Centimeter' },
  { code: 'm²', name: 'Square Meter' },
  { code: 'ha', name: 'Hectare' },
  { code: 'km²', name: 'Square Kilometer' },
  { code: 'in²', name: 'Square Inch' },
  { code: 'ft²', name: 'Square Foot' },
  { code: 'yd²', name: 'Square Yard' },
  { code: 'ac', name: 'Acre' },
  { code: 'mi²', name: 'Square Mile' },
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
  if (!Object.hasOwn(SQUARE_METERS_PER_UNIT, from) || !Object.hasOwn(SQUARE_METERS_PER_UNIT, to)) {
    return { error: 'Please select valid units.' };
  }

  const number = parseNumber(value);
  if (number === null) {
    return { error: 'Please enter a valid number (for example 12 or 3.5).' };
  }

  const converted = (number * SQUARE_METERS_PER_UNIT[from]) / SQUARE_METERS_PER_UNIT[to];
  if (!Number.isFinite(converted)) {
    return { error: 'That number is too large to convert.' };
  }

  return { result: `${formatNumber(number)} ${from} = ${formatNumber(converted)} ${to}` };
}

module.exports = {
  slug: 'area',
  name: 'Area',
  units,
  convert,
};