'use strict';

const units = [
  { code: 'w', name: 'Watt' },
  { code: 'kw', name: 'Kilowatt' },
  { code: 'mw', name: 'Megawatt' },
  { code: 'hp', name: 'Horsepower' },
];

const TO_WATTS = {
  w: 1,
  kw: 1000,
  mw: 1000000,
  hp: 745.699872,
};

function convert(value, from, to) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return { error: 'Please enter a valid number.' };
  }

  if (!Object.hasOwn(TO_WATTS, from) || !Object.hasOwn(TO_WATTS, to)) {
    return { error: 'Please select valid power units.' };
  }

  const watts = number * TO_WATTS[from];
  const result = watts / TO_WATTS[to];

  return {
    result: `${number} ${from} = ${result} ${to}`,
  };
}

module.exports = {
  slug: 'power',
  name: 'Power',
  units,
  convert,
};