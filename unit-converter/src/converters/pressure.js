'use strict';

const units = [
  { code: 'pa', name: 'Pascal' },
  { code: 'kpa', name: 'Kilopascal' },
  { code: 'mpa', name: 'Megapascal' },
  { code: 'bar', name: 'Bar' },
  { code: 'psi', name: 'Pound per Square Inch' },
  { code: 'atm', name: 'Atmosphere' },
];

const TO_PASCALS = {
  pa: 1,
  kpa: 1000,
  mpa: 1000000,
  bar: 100000,
  psi: 6894.757293168,
  atm: 101325,
};

function convert(value, from, to) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return { error: 'Please enter a valid number.' };
  }

  if (!Object.hasOwn(TO_PASCALS, from) || !Object.hasOwn(TO_PASCALS, to)) {
    return { error: 'Please select valid pressure units.' };
  }

  const pascals = number * TO_PASCALS[from];
  const result = pascals / TO_PASCALS[to];

  return {
    result: `${number} ${from} = ${result} ${to}`,
  };
}

module.exports = {
  slug: 'pressure',
  name: 'Pressure',
  units,
  convert,
};