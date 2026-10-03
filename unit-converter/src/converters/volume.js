'use strict';

const units = [
  { code: 'ml', name: 'Milliliter' },
  { code: 'l', name: 'Liter' },
  { code: 'm3', name: 'Cubic Meter' },
  { code: 'cm3', name: 'Cubic Centimeter' },
  { code: 'in3', name: 'Cubic Inch' },
  { code: 'ft3', name: 'Cubic Foot' },
  { code: 'gal', name: 'US Gallon' },
  { code: 'qt', name: 'US Quart' },
  { code: 'pt', name: 'US Pint' },
  { code: 'cup', name: 'US Cup' },
];

const TO_LITERS = {
  ml: 0.001,
  l: 1,
  m3: 1000,
  cm3: 0.001,
  in3: 0.016387064,
  ft3: 28.316846592,
  gal: 3.785411784,
  qt: 0.946352946,
  pt: 0.473176473,
  cup: 0.2365882365,
};

function convert(value, from, to) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return { error: 'Please enter a valid number.' };
  }

  if (!Object.hasOwn(TO_LITERS, from) || !Object.hasOwn(TO_LITERS, to)) {
    return { error: 'Please select valid volume units.' };
  }

  const liters = number * TO_LITERS[from];
  const result = liters / TO_LITERS[to];

  return {
    result: `${number} ${from} = ${result} ${to}`,
  };
}

module.exports = {
  slug: 'volume',
  name: 'Volume',
  units,
  convert,
};