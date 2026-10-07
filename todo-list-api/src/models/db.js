const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '../../database.json');

// Garante que o arquivo de banco de dados existe
function initDB() {
  if (!fs.existsSync(DB_FILE)) {
    const initialData = { users: [], todos: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
  }
}

function readDB() {
  initDB();
  const data = fs.readFileSync(DB_FILE, 'utf-8');
  return JSON.parse(data);
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

module.exports = { readDB, writeDB };