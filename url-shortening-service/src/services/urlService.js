const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_PATH = path.join(__dirname, '../../data/urls.json');

// Auxiliar para ler os dados do arquivo JSON
function readData() {
  if (!fs.existsSync(DATA_PATH)) {
    fs.writeFileSync(DATA_PATH, JSON.stringify([]), 'utf8');
    return [];
  }
  const content = fs.readFileSync(DATA_PATH, 'utf8');
  try {
    return JSON.parse(content || '[]');
  } catch (err) {
    return [];
  }
}

// Auxiliar para salvar os dados no arquivo JSON
function saveData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
}

// Gerar um código curto aleatório de 6 caracteres alfanuméricos
function generateShortCode() {
  return crypto.randomBytes(4).toString('hex').slice(0, 6);
}

// Validador simples de formato de URL
function isValidUrl(urlString) {
  try {
    const parsedUrl = new URL(urlString);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch (err) {
    return false;
  }
}

function createShortUrl(originalUrl) {
  if (!isValidUrl(originalUrl)) {
    throw new Error('Invalid URL format');
  }

  const urls = readData();
  let shortCode = generateShortCode();

  // Garantir que o shortCode seja único
  while (urls.some(u => u.shortCode === shortCode)) {
    shortCode = generateShortCode();
  }

  const now = new Date().toISOString();
  const newUrlObj = {
    id: (urls.length + 1).toString(),
    url: originalUrl,
    shortCode: shortCode,
    createdAt: now,
    updatedAt: now,
    accessCount: 0
  };

  urls.push(newUrlObj);
  saveData(urls);

  return newUrlObj;
}

function getUrlByShortCode(shortCode, incrementAccess = false) {
  const urls = readData();
  const urlObj = urls.find(u => u.shortCode === shortCode);

  if (!urlObj) {
    return null;
  }

  if (incrementAccess) {
    urlObj.accessCount += 1;
    saveData(urls);
  }

  return urlObj;
}

function updateShortUrl(shortCode, newUrl) {
  if (!isValidUrl(newUrl)) {
    throw new Error('Invalid URL format');
  }

  const urls = readData();
  const index = urls.findIndex(u => u.shortCode === shortCode);

  if (index === -1) {
    return null;
  }

  urls[index].url = newUrl;
  urls[index].updatedAt = new Date().toISOString();

  saveData(urls);
  return urls[index];
}

function deleteShortUrl(shortCode) {
  const urls = readData();
  const index = urls.findIndex(u => u.shortCode === shortCode);

  if (index === -1) {
    return false;
  }

  urls.splice(index, 1);
  saveData(urls);
  return true;
}

module.exports = {
  createShortUrl,
  getUrlByShortCode,
  updateShortUrl,
  deleteShortUrl
};