'use strict';

const units = [
  { code: 'c', name: 'Celsius' },
  { code: 'f', name: 'Fahrenheit' },
  { code: 'k', name: 'Kelvin' },
];

function toCelsius(value, from) {
  switch (from) {
    case 'c':
      return value;

    case 'f':
      return (value - 32) * (5 / 9);

    case 'k':
      return value - 273.15;

    default:
      return null;
  }
}

function fromCelsius(value, to) {
  switch (to) {
    case 'c':
      return value;

    case 'f':
      return value * (9 / 5) + 32;

    case 'k':
      return value + 273.15;

    default:
      return null;
  }
}

function convert(value, from, to) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return { error: 'Please enter a valid number.' };
  }

  if (!units.some((unit) => unit.code === from) ||
      !units.some((unit) => unit.code === to)) {
    return { error: 'Please select valid temperature units.' };
  }

  if (from === 'k' && number < 0) {
    return { error: 'Temperature in Kelvin cannot be below 0.' };
  }

  const celsius = toCelsius(number, from);
  const result = fromCelsius(celsius, to);

  if (result === null) {
    return { error: 'Unable to convert the temperature.' };
  }

  if (result < -273.15 && to !== 'k') {
    return { error: 'Temperature cannot be below absolute zero.' };
  }

  return {
    result: `${number} ${from} = ${result} ${to}`,
  };
}

module.exports = {
  slug: 'temperature',
  name: 'Temperature',
  units,
  convert,
};