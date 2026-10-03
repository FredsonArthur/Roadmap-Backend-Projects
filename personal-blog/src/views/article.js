'use strict';

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderArticlePage(article) {
  if (!article) {
    return `
      <main class="article-page">
        <h1>Article Not Found</h1>

        <p>
          The article you are looking for does not exist.
        </p>

        <a href="/">
          Back to Home
        </a>
      </main>
    `;
  }

  return `
    <main class="article-page">
      <article>
        <header class="article-header">
          <h1>${escapeHtml(article.title)}</h1>

          <p class="article-date">
            Published on ${escapeHtml(article.date)}
          </p>
        </header>

        <div class="article-content">
          ${escapeHtml(article.content).replace(/\n/g, '<br>')}
        </div>
      </article>

      <nav class="article-navigation">
        <a href="/">
          Back to Home
        </a>
      </nav>
    </main>
  `;
}

module.exports = {
  renderArticlePage,
};