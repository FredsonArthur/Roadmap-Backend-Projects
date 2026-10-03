'use strict';

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderLayout(title, content) {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        >

        <meta
          name="description"
          content="Personal Blog"
        >

        <title>${escapeHtml(title)} | Personal Blog</title>

        <link rel="stylesheet" href="/style.css">
      </head>

      <body>
        <header class="site-header">
          <nav class="site-navigation">
            <a href="/" class="site-logo">
              Personal Blog
            </a>

            <a href="/admin" class="admin-link">
              Admin
            </a>
          </nav>
        </header>

        ${content}

        <footer class="site-footer">
          <p>
            &copy; ${new Date().getFullYear()} Personal Blog
          </p>
        </footer>
      </body>
    </html>
  `;
}

module.exports = {
  escapeHtml,
  renderLayout,
};