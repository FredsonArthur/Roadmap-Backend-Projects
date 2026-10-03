'use strict';

const BASES = {
  bin: 2,
  oct: 8,
  dec: 10,
  hex: 16,
};

const units = [
  { code: 'bin', name: 'Binary' },
  { code: 'oct', name: 'Octal' },
  { code: 'dec', name: 'Decimal' },
  { code: 'hex', name: 'Hexadecimal' },
];

// Verifica se o texto representa um número inteiro válido na base escolhida.
function isValidDigits(digits, base) {
  if (digits === '') return false;

  switch (base) {
    case 2:
      return /^[01]+$/.test(digits);

    case 8:
      return /^[0-7]+$/.test(digits);

    case 10:
      return /^\d+$/.test(digits);

    case 16:
      return /^[0-9a-fA-F]+$/.test(digits);

    default:
      return false;
  }
}

// Converte o texto para BigInt respeitando a base escolhida.
function parseNumber(text, base) {
  const normalized = text.trim();

  if (normalized === '') return null;

  let sign = '';

  if (normalized.startsWith('+') || normalized.startsWith('-')) {
    sign = normalized[0];
  }

  const digits = sign ? normalized.slice(1) : normalized;

  if (!isValidDigits(digits, base)) return null;

  try {
    const number = BigInt(`${sign}${digits}`);
    return number;
  } catch {
    return null;
  }
}

// Converte um BigInt para a base desejada.
function formatNumber(number, base) {
  return number.toString(base);
}

function convert(value, from, to) {
  if (!Object.hasOwn(BASES, from) || !Object.hasOwn(BASES, to)) {
    return { error: 'Please select valid number systems.' };
  }

  const number = parseNumber(value, BASES[from]);

  if (number === null) {
    return {
      error: `Please enter a valid ${units.find((unit) => unit.code === from).name.toLowerCase()} number.`,
    };
  }

  const converted = formatNumber(number, BASES[to]);

  return {
    result: `${value.trim()} ${from} = ${converted} ${to}`,
  };
}

module.exports = {
  slug: 'number-system',
  name: 'Number System',
  units,
  convert,
};