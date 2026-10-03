'use strict';

const crypto = require('crypto');

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

function unauthorized(res) {
  res.writeHead(401, {
    'Content-Type': 'text/plain; charset=utf-8',
    'WWW-Authenticate': 'Basic realm="Personal Blog Admin"',
  });

  res.end('Authentication required.');
}

function parseBasicAuth(header) {
  if (!header || !header.startsWith('Basic ')) {
    return null;
  }

  try {
    const encodedCredentials = header.slice(6);
    const decodedCredentials = Buffer.from(
      encodedCredentials,
      'base64'
    ).toString('utf8');

    const separatorIndex = decodedCredentials.indexOf(':');

    if (separatorIndex === -1) {
      return null;
    }

    return {
      username: decodedCredentials.slice(0, separatorIndex),
      password: decodedCredentials.slice(separatorIndex + 1),
    };
  } catch {
    return null;
  }
}

function safeCompare(value, expected) {
  const valueBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expected);

  if (valueBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(valueBuffer, expectedBuffer);
}

function authenticate(req, res) {
  const credentials = parseBasicAuth(req.headers.authorization);

  if (!credentials) {
    unauthorized(res);
    return false;
  }

  const validUsername = safeCompare(
    credentials.username,
    ADMIN_USERNAME
  );

  const validPassword = safeCompare(
    credentials.password,
    ADMIN_PASSWORD
  );

  if (!validUsername || !validPassword) {
    unauthorized(res);
    return false;
  }

  return true;
}

module.exports = {
  authenticate,
};