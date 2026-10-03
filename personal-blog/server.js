'use strict';

const http = require('http');
const fs = require('fs').promises;
const path = require('path');

const {
  getArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
} = require('./src/articles');

const { authenticate } = require('./src/auth');

const { renderLayout } = require('./src/views/layout');
const { renderHomePage } = require('./src/views/home');
const { renderArticlePage } = require('./src/views/article');
const { renderAdminPage } = require('./src/views/admin');
const { renderNewArticlePage } = require('./src/views/new-article');
const { renderEditArticlePage } = require('./src/views/edit-article');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.ico': 'image/x-icon',
};

function sendResponse(res, statusCode, contentType, body) {
  res.writeHead(statusCode, {
    'Content-Type': contentType,
    'Content-Length': Buffer.byteLength(body),
  });

  res.end(body);
}

function sendHtml(res, statusCode, html) {
  sendResponse(
    res,
    statusCode,
    'text/html; charset=utf-8',
    html
  );
}

function redirect(res, location) {
  res.writeHead(302, {
    Location: location,
  });

  res.end();
}

function sendNotFound(res) {
  const html = renderLayout(
    'Page Not Found',
    `
      <main class="empty-state">
        <h1>404 - Page Not Found</h1>
        <p>The page you are looking for does not exist.</p>
        <a href="/">Back to Home</a>
      </main>
    `
  );

  sendHtml(res, 404, html);
}

function sendServerError(res) {
  const html = renderLayout(
    'Internal Server Error',
    `
      <main class="empty-state">
        <h1>500 - Internal Server Error</h1>
        <p>Something went wrong while processing your request.</p>
        <a href="/">Back to Home</a>
      </main>
    `
  );

  sendHtml(res, 500, html);
}

async function serveStaticFile(res, pathname) {
  const requestedPath = decodeURIComponent(pathname);
  const relativePath = requestedPath.replace(/^\/+/, '');
  const filePath = path.resolve(PUBLIC_DIR, relativePath);

  if (
    filePath !== PUBLIC_DIR &&
    !filePath.startsWith(`${PUBLIC_DIR}${path.sep}`)
  ) {
    sendResponse(
      res,
      403,
      'text/plain; charset=utf-8',
      'Forbidden.'
    );

    return;
  }

  try {
    const stats = await fs.stat(filePath);

    if (!stats.isFile()) {
      sendNotFound(res);
      return;
    }

    const extension = path.extname(filePath).toLowerCase();
    const contentType =
      MIME_TYPES[extension] || 'application/octet-stream';

    const data = await fs.readFile(filePath);

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': data.length,
    });

    res.end(data);
  } catch {
    sendNotFound(res);
  }
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk;

      if (body.length > 1024 * 1024) {
        reject(new Error('Request body is too large.'));
        req.destroy();
      }
    });

    req.on('end', () => {
      resolve(body);
    });

    req.on('error', reject);
  });
}

function parseFormBody(body) {
  return Object.fromEntries(new URLSearchParams(body));
}

function validateArticleData(formData) {
  const title = formData.title?.trim();
  const content = formData.content?.trim();
  const date = formData.date?.trim();

  if (!title || !content || !date) {
    return {
      valid: false,
      error: 'Title, content, and publication date are required.',
    };
  }

  if (title.length > 200) {
    return {
      valid: false,
      error: 'Title cannot exceed 200 characters.',
    };
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return {
      valid: false,
      error: 'Please provide a valid publication date.',
    };
  }

  return {
    valid: true,
    data: {
      title,
      content,
      date,
    },
  };
}

const server = http.createServer(async (req, res) => {
  try {
    const requestUrl = new URL(
      req.url,
      `http://${req.headers.host || 'localhost'}`
    );

    const pathname = requestUrl.pathname;

    /*
     * Static files
     */
    if (pathname.startsWith('/style.css')) {
      await serveStaticFile(res, pathname);
      return;
    }

    if (pathname === '/favicon.ico') {
      res.writeHead(204);
      res.end();
      return;
    }

    /*
     * Public Home Page
     */
    if (req.method === 'GET' && pathname === '/') {
      const articles = await getArticles();

      const content = renderHomePage(articles);
      const html = renderLayout('Home', content);

      sendHtml(res, 200, html);
      return;
    }

    /*
     * Public Article Page
     */
    if (
      req.method === 'GET' &&
      pathname.startsWith('/article/')
    ) {
      const id = decodeURIComponent(
        pathname.slice('/article/'.length)
      );

      const article = await getArticleById(id);

      const content = renderArticlePage(article);
      const statusCode = article ? 200 : 404;
      const title = article ? article.title : 'Article Not Found';

      const html = renderLayout(title, content);

      sendHtml(res, statusCode, html);
      return;
    }

    /*
     * Admin Dashboard
     */
    if (req.method === 'GET' && pathname === '/admin') {
      if (!authenticate(req, res)) {
        return;
      }

      const articles = await getArticles();

      const content = renderAdminPage(articles);
      const html = renderLayout('Admin Dashboard', content);

      sendHtml(res, 200, html);
      return;
    }

    /*
     * Add Article Page
     */
    if (
      req.method === 'GET' &&
      pathname === '/admin/new'
    ) {
      if (!authenticate(req, res)) {
        return;
      }

      const content = renderNewArticlePage();
      const html = renderLayout('Add Article', content);

      sendHtml(res, 200, html);
      return;
    }

    /*
     * Create Article
     */
    if (
      req.method === 'POST' &&
      pathname === '/admin/new'
    ) {
      if (!authenticate(req, res)) {
        return;
      }

      const body = await readRequestBody(req);
      const formData = parseFormBody(body);

      const validation = validateArticleData(formData);

      if (!validation.valid) {
        const content = `
          <main class="article-form-page">
            <h1>Add New Article</h1>
            <p>${validation.error}</p>
            <a href="/admin/new">Back to form</a>
          </main>
        `;

        sendHtml(
          res,
          400,
          renderLayout('Add Article', content)
        );

        return;
      }

      await createArticle(validation.data);

      redirect(res, '/admin');
      return;
    }

    /*
     * Edit Article Page
     */
    if (
      req.method === 'GET' &&
      pathname.startsWith('/admin/edit/')
    ) {
      if (!authenticate(req, res)) {
        return;
      }

      const id = decodeURIComponent(
        pathname.slice('/admin/edit/'.length)
      );

      const article = await getArticleById(id);

      const content = renderEditArticlePage(article);
      const statusCode = article ? 200 : 404;
      const title = article ? 'Edit Article' : 'Article Not Found';

      const html = renderLayout(title, content);

      sendHtml(res, statusCode, html);
      return;
    }

    /*
     * Update Article
     */
    if (
      req.method === 'POST' &&
      pathname.startsWith('/admin/edit/')
    ) {
      if (!authenticate(req, res)) {
        return;
      }

      const id = decodeURIComponent(
        pathname.slice('/admin/edit/'.length)
      );

      const body = await readRequestBody(req);
      const formData = parseFormBody(body);

      const validation = validateArticleData(formData);

      if (!validation.valid) {
        const content = `
          <main class="article-form-page">
            <h1>Edit Article</h1>
            <p>${validation.error}</p>
            <a href="/admin/edit/${encodeURIComponent(id)}">
              Back to form
            </a>
          </main>
        `;

        sendHtml(
          res,
          400,
          renderLayout('Edit Article', content)
        );

        return;
      }

      const article = await updateArticle(
        id,
        validation.data
      );

      if (!article) {
        sendNotFound(res);
        return;
      }

      redirect(res, '/admin');
      return;
    }

    /*
     * Delete Article
     */
    if (
      req.method === 'POST' &&
      pathname.startsWith('/admin/delete/')
    ) {
      if (!authenticate(req, res)) {
        return;
      }

      const id = decodeURIComponent(
        pathname.slice('/admin/delete/'.length)
      );

      const deleted = await deleteArticle(id);

      if (!deleted) {
        sendNotFound(res);
        return;
      }

      redirect(res, '/admin');
      return;
    }

    sendNotFound(res);
  } catch (error) {
    console.error(error);
    sendServerError(res);
  }
});

server.listen(PORT, () => {
  console.log(
    `Personal Blog running at http://localhost:${PORT}`
  );
});