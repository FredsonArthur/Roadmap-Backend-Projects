'use strict';

const units = [
  { code: 'mg', name: 'Milligram' },
  { code: 'g', name: 'Gram' },
  { code: 'kg', name: 'Kilogram' },
  { code: 't', name: 'Metric Ton' },
  { code: 'oz', name: 'Ounce' },
  { code: 'lb', name: 'Pound' },
];

const TO_GRAMS = {
  mg: 0.001,
  g: 1,
  kg: 1000,
  t: 1000000,
  oz: 28.349523125,
  lb: 453.59237,
};

function convert(value, from, to) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return { error: 'Please enter a valid number.' };
  }

  if (!Object.hasOwn(TO_GRAMS, from) || !Object.hasOwn(TO_GRAMS, to)) {
    return { error: 'Please select valid weight units.' };
  }

  const grams = number * TO_GRAMS[from];
  const result = grams / TO_GRAMS[to];

  return {
    result: `${number} ${from} = ${result} ${to}`,
  };
}

module.exports = {
  slug: 'weight',
  name: 'Weight',
  units,
  convert,
};