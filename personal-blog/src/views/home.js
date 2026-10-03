'use strict';

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderArticlePreview(article) {
  return `
    <article class="article-preview">
      <h2>
        <a href="/article/${encodeURIComponent(article.id)}">
          ${escapeHtml(article.title)}
        </a>
      </h2>

      <p class="article-date">
        Published on ${escapeHtml(article.date)}
      </p>

      <p class="article-preview-content">
        ${escapeHtml(article.content)}
      </p>

      <a
        href="/article/${encodeURIComponent(article.id)}"
        class="read-more"
      >
        Read Article
      </a>
    </article>
  `;
}

function renderHomePage(articles) {
  const articleList = articles.length
    ? articles.map(renderArticlePreview).join('')
    : `
        <section class="empty-state">
          <h2>No articles published yet.</h2>

          <p>
            Check back later for new articles.
          </p>
        </section>
      `;

  return `
    <main class="home-page">
      <header class="blog-header">
        <h1>Personal Blog</h1>

        <p>
          Thoughts, ideas, and articles.
        </p>
      </header>

      <section class="articles">
        ${articleList}
      </section>
    </main>
  `;
}

module.exports = {
  renderHomePage,
};