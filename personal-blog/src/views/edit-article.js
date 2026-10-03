'use strict';

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderEditArticlePage(article) {
  if (!article) {
    return `
      <main class="article-form-page">
        <h1>Article Not Found</h1>

        <p>
          The article you are trying to edit does not exist.
        </p>

        <a href="/admin">
          Back to Dashboard
        </a>
      </main>
    `;
  }

  return `
    <main class="article-form-page">
      <header>
        <h1>Edit Article</h1>

        <p>
          Update the information below and save your changes.
        </p>
      </header>

      <form
        action="/admin/edit/${encodeURIComponent(article.id)}"
        method="POST"
      >
        <div class="form-group">
          <label for="title">
            Title
          </label>

          <input
            type="text"
            id="title"
            name="title"
            value="${escapeHtml(article.title)}"
            required
            maxlength="200"
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
          >${escapeHtml(article.content)}</textarea>
        </div>

        <div class="form-group">
          <label for="date">
            Publication Date
          </label>

          <input
            type="date"
            id="date"
            name="date"
            value="${escapeHtml(article.date)}"
            required
          >
        </div>

        <div class="form-actions">
          <button type="submit">
            Save Changes
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
  renderEditArticlePage,
};