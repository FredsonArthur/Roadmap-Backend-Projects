'use strict';

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderAdminPage(articles) {
  const articleList = articles.length
    ? articles
        .map(
          (article) => `
            <tr>
              <td>${escapeHtml(article.title)}</td>
              <td>${escapeHtml(article.date)}</td>
              <td>
                <a href="/admin/edit/${encodeURIComponent(article.id)}">
                  Edit
                </a>

                <form
                  action="/admin/delete/${encodeURIComponent(article.id)}"
                  method="POST"
                  style="display: inline;"
                >
                  <button type="submit">
                    Delete
                  </button>
                </form>
              </td>
            </tr>
          `
        )
        .join('')
    : `
        <tr>
          <td colspan="3">
            No articles published yet.
          </td>
        </tr>
      `;

  return `
    <main class="admin-dashboard">
      <header class="admin-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Manage your published articles.</p>
        </div>

        <a href="/admin/new" class="button">
          Add Article
        </a>
      </header>

      <section class="admin-articles">
        <h2>Articles</h2>

        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Publication Date</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            ${articleList}
          </tbody>
        </table>
      </section>

      <nav class="admin-navigation">
        <a href="/">View Blog</a>
      </nav>
    </main>
  `;
}

module.exports = {
  renderAdminPage,
};