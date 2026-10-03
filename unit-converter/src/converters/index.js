'use strict';

// Ordem das abas. A primeira categoria também é a página inicial (/).
const candidates = [
  { file: 'currency.js', category: require('./currency') },
  { file: 'length.js', category: require('./length') },
  { file: 'area.js', category: require('./area') },
  { file: 'volume.js', category: require('./volume') },
  { file: 'weight.js', category: require('./weight') },
  { file: 'temperature.js', category: require('./temperature') },
  { file: 'speed.js', category: require('./speed') },
  { file: 'pressure.js', category: require('./pressure') },
  { file: 'power.js', category: require('./power') },
  { file: 'number-system.js', category: require('./number-system') },
];

// Retorna a lista de problemas encontrados no formato da categoria
function findProblems(category) {
  const problems = [];

  if (typeof category.slug !== 'string' || !/^[a-z0-9-]+$/.test(category.slug)) problems.push('slug');
  if (typeof category.name !== 'string' || category.name.trim() === '') problems.push('name');

  const units = category.units;
  const unitsAreValid =
    Array.isArray(units) &&
    units.length >= 2 &&
    units.every((u) => u && typeof u.code === 'string' && u.code !== '' && typeof u.name === 'string') &&
    new Set(units.map((u) => u.code)).size === units.length;
  if (!unitsAreValid) problems.push('units');

  if (typeof category.convert !== 'function') problems.push('convert');
  return problems;
}

// Só entram na lista as categorias prontas: arquivos vazios ou incompletos são
// ignorados com um aviso, o que permite construir os conversores um por vez
const categories = [];

candidates.forEach(({ file, category }) => {
  if (!category || Object.keys(category).length === 0) {
    console.warn(`Warning: src/converters/${file} is still empty, so it was skipped.`);
    return;
  }

  const problems = findProblems(category);
  if (problems.length > 0) {
    console.warn(`Warning: src/converters/${file} was skipped (missing or invalid: ${problems.join(', ')}).`);
    return;
  }
  if (categories.some((c) => c.slug === category.slug)) {
    console.warn(`Warning: src/converters/${file} was skipped (slug "${category.slug}" is already in use).`);
    return;
  }
  categories.push(category);
});

if (categories.length === 0) {
  throw new Error('No converter is ready yet. Finish at least one file in src/converters/.');
}

function findCategory(slug) {
  return categories.find((category) => category.slug === slug);
}

module.exports = { categories, findCategory };