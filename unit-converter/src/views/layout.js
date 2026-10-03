'use strict';

// Escapa caracteres especiais para inserir texto com segurança dentro do HTML
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderTabs(categories, activeSlug) {
  return categories
    .map((category) => {
      const isActive = category.slug === activeSlug;
      const classes = isActive ? 'tab active' : 'tab';
      const current = isActive ? ' aria-current="page"' : '';
      return `<a class="${classes}" href="/${escapeHtml(category.slug)}"${current}>${escapeHtml(category.name)}</a>`;
    })
    .join('\n        ');
}

// Monta a página completa. O "content" já deve chegar como HTML seguro (escapado)
function renderLayout({ title, categories, activeSlug, content }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)} | Unit Converter</title>
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <div class="container">
    <header class="site-header">
      <h1 class="site-title">Unit Converter</h1>
      <nav class="tabs" aria-label="Unit categories">
        ${renderTabs(categories, activeSlug)}
      </nav>
    </header>
    <main class="content">
      ${content}
    </main>
  </div>
</body>
</html>
`;
}

module.exports = { renderLayout, escapeHtml };