const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../database.json');

function readDB() {
  if (!fs.existsSync(DB_PATH)) {
    const initialData = { users: [], expenses: [] };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2));
    return initialData;
  }
  const data = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(data);
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

module.exports = { readDB, writeDB };