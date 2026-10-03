'use strict';

const { renderLayout, escapeHtml } = require('./layout');

// Deve ser igual ao limite de caracteres validado no server.js
const MAX_VALUE_LENGTH = 100;

function renderOptions(units, selectedCode) {
  return units
    .map((unit) => {
      const selected = unit.code === selectedCode ? ' selected' : '';
      return `<option value="${escapeHtml(unit.code)}"${selected}>${escapeHtml(unit.name)} (${escapeHtml(unit.code)})</option>`;
    })
    .join('\n          ');
}

function renderForm({ category, form, error }) {
  const { slug, units } = category;
  const label = category.inputLabel || `Enter the ${category.name.toLowerCase()} to convert`;

  // Sem escolha válida, usa a primeira unidade como origem e a segunda como destino
  const isKnown = (code) => units.some((unit) => unit.code === code);
  const from = isKnown(form.from) ? form.from : units[0].code;
  const to = isKnown(form.to) ? form.to : (units[1] || units[0]).code;

  const errorHtml = error ? `<p class="error" role="alert">${escapeHtml(error)}</p>\n      ` : '';

  return `<form class="converter-form" method="post" action="/${escapeHtml(slug)}" aria-label="${escapeHtml(category.name)} converter">
      ${errorHtml}<div class="field">
        <label for="value">${escapeHtml(label)}</label>
        <input id="value" name="value" type="text" value="${escapeHtml(form.value)}" maxlength="${MAX_VALUE_LENGTH}" autocomplete="off" spellcheck="false" required>
      </div>
      <div class="field">
        <label for="from">Unit to Convert from</label>
        <select id="from" name="from">
          ${renderOptions(units, from)}
        </select>
      </div>
      <div class="field">
        <label for="to">Unit to Convert to</label>
        <select id="to" name="to">
          ${renderOptions(units, to)}
        </select>
      </div>
      <button class="button" type="submit">Convert</button>
    </form>`;
}

function renderResult({ category, result }) {
  return `<section class="result-section">
      <h2 class="result-title">Result of your calculation</h2>
      <p class="result">${escapeHtml(result)}</p>
      <a class="button" href="/${escapeHtml(category.slug)}">Reset</a>
    </section>`;
}

// Mostra o resultado quando a conversão deu certo; senão, mostra o formulário
// (vazio, ou com os valores digitados e a mensagem de erro)
function renderConverterPage({ categories, category, form, result, error }) {
  const content = result && !error ? renderResult({ category, result }) : renderForm({ category, form, error });
  return renderLayout({ title: category.name, categories, activeSlug: category.slug, content });
}

module.exports = { renderConverterPage };