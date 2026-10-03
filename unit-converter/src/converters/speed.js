'use strict';

const units = [
  { code: 'mps', name: 'Meter per Second' },
  { code: 'kph', name: 'Kilometer per Hour' },
  { code: 'mph', name: 'Mile per Hour' },
  { code: 'fps', name: 'Foot per Second' },
  { code: 'knot', name: 'Knot' },
];

const TO_METERS_PER_SECOND = {
  mps: 1,
  kph: 1000 / 3600,
  mph: 1609.344 / 3600,
  fps: 0.3048,
  knot: 1852 / 3600,
};

function convert(value, from, to) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return { error: 'Please enter a valid number.' };
  }

  if (
    !Object.hasOwn(TO_METERS_PER_SECOND, from) ||
    !Object.hasOwn(TO_METERS_PER_SECOND, to)
  ) {
    return { error: 'Please select valid speed units.' };
  }

  const metersPerSecond = number * TO_METERS_PER_SECOND[from];
  const result = metersPerSecond / TO_METERS_PER_SECOND[to];

  return {
    result: `${number} ${from} = ${result} ${to}`,
  };
}

module.exports = {
  slug: 'speed',
  name: 'Speed',
  units,
  convert,
};