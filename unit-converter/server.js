'use strict';

const http = require('http');
const fs = require('fs/promises');
const path = require('path');

const { categories, findCategory } = require('./src/converters');
const { renderLayout } = require('./src/views/layout');
const { renderConverterPage } = require('./src/views/converter-page');

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '127.0.0.1';
const PUBLIC_DIR = path.join(__dirname, 'public');
const MAX_BODY_BYTES = 10 * 1024;
const MAX_VALUE_LENGTH = 100;

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

// Cabeçalhos de segurança enviados em todas as respostas
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'Content-Security-Policy':
    "default-src 'self'; style-src 'self'; form-action 'self'; frame-ancestors 'none'",
};

// ---------- Respostas ----------

function send(req, res, status, body, headers = {}) {
  res.writeHead(status, {
    ...SECURITY_HEADERS,
    'Content-Length': Buffer.byteLength(body),
    ...headers,
  });
  res.end(req.method === 'HEAD' ? undefined : body);
}

function sendHtml(req, res, status, html) {
  send(req, res, status, html, { 'Content-Type': 'text/html; charset=utf-8' });
}

function redirect(res, location) {
  res.writeHead(302, { ...SECURITY_HEADERS, Location: location });
  res.end();
}

function sendErrorPage(req, res, status, title, message) {
  const content = `<section class="message">
  <h2>${title}</h2>
  <p>${message}</p>
  <a class="button" href="/">Back to the converter</a>
</section>`;
  sendHtml(req, res, status, renderLayout({ title, categories, activeSlug: null, content }));
}

function sendMethodNotAllowed(req, res, allowed) {
  res.setHeader('Allow', allowed);
  sendErrorPage(req, res, 405, 'Method not allowed', 'This page does not accept that request method.');
}

// ---------- Leitura do formulário ----------

function readFormBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    let tooLarge = false;

    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        tooLarge = true;
        chunks.length = 0;
      } else if (!tooLarge) {
        chunks.push(chunk);
      }
    });
    req.on('end', () => {
      if (tooLarge) {
        reject(Object.assign(new Error('Request body too large'), { statusCode: 413 }));
      } else {
        resolve(new URLSearchParams(Buffer.concat(chunks).toString('utf8')));
      }
    });
    req.on('error', reject);
  });
}

// ---------- Páginas de conversão ----------

async function handleConverter(req, res, category) {
  if (req.method !== 'POST') {
    const form = { value: '', from: '', to: '' };
    return sendHtml(req, res, 200, renderConverterPage({ categories, category, form, result: null, error: null }));
  }

  const contentType = req.headers['content-type'] || '';
  if (!contentType.startsWith('application/x-www-form-urlencoded')) {
    return sendErrorPage(req, res, 415, 'Unsupported content type', 'Please submit the form from the page.');
  }

  const body = await readFormBody(req);
  const form = {
    value: (body.get('value') || '').trim(),
    from: body.get('from') || '',
    to: body.get('to') || '',
  };
  const isKnownUnit = (code) => category.units.some((unit) => unit.code === code);

  let outcome;
  if (form.value === '') {
    outcome = { error: 'Please enter a value to convert.' };
  } else if (form.value.length > MAX_VALUE_LENGTH) {
    outcome = { error: `The value can have at most ${MAX_VALUE_LENGTH} characters.` };
  } else if (!isKnownUnit(form.from) || !isKnownUnit(form.to)) {
    outcome = { error: 'Please select valid units.' };
  } else {
    outcome = await category.convert(form.value, form.from, form.to);
  }

  const status = outcome.error ? 400 : 200;
  const html = renderConverterPage({
    categories,
    category,
    form,
    result: outcome.result || null,
    error: outcome.error || null,
  });
  sendHtml(req, res, status, html);
}

// ---------- Arquivos estáticos ----------

// Retorna true se o arquivo foi enviado, false se não existe ou não é permitido
async function serveStatic(req, res, pathname) {
  let relativePath;
  try {
    relativePath = decodeURIComponent(pathname);
  } catch (err) {
    return false;
  }

  const filePath = path.join(PUBLIC_DIR, relativePath);
  const contentType = MIME_TYPES[path.extname(filePath).toLowerCase()];
  // Impede o acesso a arquivos fora da pasta public (path traversal)
  if (!contentType || !filePath.startsWith(PUBLIC_DIR + path.sep)) return false;

  try {
    const file = await fs.readFile(filePath);
    send(req, res, 200, file, { 'Content-Type': contentType, 'Cache-Control': 'no-cache' });
    return true;
  } catch (err) {
    return false;
  }
}

// ---------- Roteamento ----------

async function handleRequest(req, res) {
  let pathname;
  try {
    pathname = new URL(req.url, 'http://localhost').pathname;
  } catch (err) {
    return sendErrorPage(req, res, 400, 'Bad request', 'The request address is not valid.');
  }
  // Ignora a barra final, exceto na raiz
  const route = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  const isRead = req.method === 'GET' || req.method === 'HEAD';

  if (route === '/') {
    if (!isRead) return sendMethodNotAllowed(req, res, 'GET, HEAD');
    return redirect(res, `/${categories[0].slug}`);
  }

  const category = findCategory(route.slice(1));
  if (category) {
    if (!isRead && req.method !== 'POST') return sendMethodNotAllowed(req, res, 'GET, HEAD, POST');
    return handleConverter(req, res, category);
  }

  if (isRead && (await serveStatic(req, res, route))) return;

  sendErrorPage(req, res, 404, 'Page not found', 'The page you are looking for does not exist.');
}

function handleError(req, res, err) {
  if (res.headersSent) {
    res.end();
    return;
  }
  if (err.statusCode === 413) {
    return sendErrorPage(req, res, 413, 'Request too large', 'The submitted data is too large.');
  }
  console.error(err);
  sendErrorPage(req, res, 500, 'Something went wrong', 'An unexpected error occurred. Please try again.');
}

// ---------- Inicialização ----------

const server = http.createServer((req, res) => {
  handleRequest(req, res).catch((err) => handleError(req, res, err));
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Error: port ${PORT} is already in use. Set another one with PORT=3001 npm start.`);
  } else {
    console.error(`Error: could not start the server (${err.message}).`);
  }
  process.exit(1);
});

server.listen(PORT, HOST, () => {
  const displayHost = HOST === '127.0.0.1' ? 'localhost' : HOST;
  console.log(`Unit Converter running at http://${displayHost}:${PORT}`);
});