'use strict';

require('dotenv').config();

const express = require('express');

const { createDatabase } = require('./src/database');
const { createPostsService } = require('./src/posts-service');
const { createRoutes } = require('./src/routes');

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '127.0.0.1';
const DATABASE_PATH =
  process.env.DATABASE_PATH || './data/blog.db';

if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
  throw new Error('PORT must be a valid port number.');
}

const app = express();

const db = createDatabase(DATABASE_PATH);
const postsService = createPostsService(db);
const routes = createRoutes(postsService);

app.use(express.json());

app.use(routes);

app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found.',
    },
  });
});

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400) {
    return res.status(400).json({
      error: {
        code: 'INVALID_JSON',
        message: 'Request body contains invalid JSON.',
      },
    });
  }

  console.error(error);

  return res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Internal server error.',
    },
  });
});

const server = app.listen(PORT, HOST, () => {
  console.log('Blogging Platform API started.');
  console.log(`Listening on http://${HOST}:${PORT}`);
  console.log(`Database: ${DATABASE_PATH}`);
});

function shutdown(signal) {
  console.log(`${signal} received. Shutting down...`);

  server.close(() => {
    db.close();
    console.log('Server stopped.');
  });
}

process.on('SIGINT', () => {
  shutdown('SIGINT');
});

process.on('SIGTERM', () => {
  shutdown('SIGTERM');
});