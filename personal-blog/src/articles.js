'use strict';

const fs = require('fs').promises;
const path = require('path');

const ARTICLES_DIR = path.join(__dirname, '..', 'data', 'articles');

async function ensureArticlesDirectory() {
  await fs.mkdir(ARTICLES_DIR, {
    recursive: true,
  });
}

function getArticlePath(id) {
  return path.join(ARTICLES_DIR, `${id}.json`);
}

function validateArticle(article) {
  return (
    article &&
    typeof article.id === 'string' &&
    typeof article.title === 'string' &&
    typeof article.content === 'string' &&
    typeof article.date === 'string'
  );
}

async function getArticles() {
  await ensureArticlesDirectory();

  const files = await fs.readdir(ARTICLES_DIR);

  const articleFiles = files.filter((file) => file.endsWith('.json'));

  const articles = [];

  for (const file of articleFiles) {
    const filePath = path.join(ARTICLES_DIR, file);

    try {
      const content = await fs.readFile(filePath, 'utf8');
      const article = JSON.parse(content);

      if (validateArticle(article)) {
        articles.push(article);
      }
    } catch {
      // Ignora arquivos inválidos para não interromper a leitura dos demais artigos.
    }
  }

  return articles.sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });
}

async function getArticleById(id) {
  if (!id || typeof id !== 'string') {
    return null;
  }

  await ensureArticlesDirectory();

  const filePath = getArticlePath(id);

  try {
    const content = await fs.readFile(filePath, 'utf8');
    const article = JSON.parse(content);

    if (!validateArticle(article)) {
      return null;
    }

    return article;
  } catch {
    return null;
  }
}

async function createArticle({ title, content, date }) {
  await ensureArticlesDirectory();

  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const article = {
    id,
    title,
    content,
    date,
  };

  const filePath = getArticlePath(id);

  await fs.writeFile(
    filePath,
    JSON.stringify(article, null, 2),
    'utf8'
  );

  return article;
}

async function updateArticle(id, { title, content, date }) {
  const article = await getArticleById(id);

  if (!article) {
    return null;
  }

  const updatedArticle = {
    ...article,
    title,
    content,
    date,
  };

  const filePath = getArticlePath(id);

  await fs.writeFile(
    filePath,
    JSON.stringify(updatedArticle, null, 2),
    'utf8'
  );

  return updatedArticle;
}

async function deleteArticle(id) {
  const article = await getArticleById(id);

  if (!article) {
    return false;
  }

  const filePath = getArticlePath(id);

  await fs.unlink(filePath);

  return true;
}

module.exports = {
  getArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
};