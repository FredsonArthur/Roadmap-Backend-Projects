'use strict';

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

function createDatabase(databasePath) {
  if (!databasePath || typeof databasePath !== 'string') {
    throw new TypeError('databasePath must be a non-empty string');
  }

  const resolvedPath = path.resolve(databasePath);
  const directory = path.dirname(resolvedPath);

  fs.mkdirSync(directory, { recursive: true });

  const db = new Database(resolvedPath);

  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT NOT NULL,
      tags TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  return db;
}

module.exports = {
  createDatabase,
};