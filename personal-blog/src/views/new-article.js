'use strict';

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderNewArticlePage() {
  return `
    <main class="article-form-page">
      <header>
        <h1>Add New Article</h1>

        <p>
          Fill in the information below to publish a new article.
        </p>
      </header>

      <form action="/admin/new" method="POST">
        <div class="form-group">
          <label for="title">
            Title
          </label>

          <input
            type="text"
            id="title"
            name="title"
            required
            maxlength="200"
            autocomplete="off"
          >
        </div>

        <div class="form-group">
          <label for="content">
            Content
          </label>

          <textarea
            id="content"
            name="content"
            rows="15"
            required
          ></textarea>
        </div>

        <div class="form-group">
          <label for="date">
            Publication Date
          </label>

          <input
            type="date"
            id="date"
            name="date"
            required
          >
        </div>

        <div class="form-actions">
          <button type="submit">
            Publish Article
          </button>

          <a href="/admin">
            Cancel
          </a>
        </div>
      </form>
    </main>
  `;
}

module.exports = {
  renderNewArticlePage,
};