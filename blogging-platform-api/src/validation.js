'use strict';

function validatePostInput(body) {
  const errors = [];

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return {
      valid: false,
      errors: ['Request body must be a JSON object.'],
    };
  }

  if (
    typeof body.title !== 'string' ||
    body.title.trim() === ''
  ) {
    errors.push('title is required and must be a non-empty string.');
  }

  if (
    typeof body.content !== 'string' ||
    body.content.trim() === ''
  ) {
    errors.push('content is required and must be a non-empty string.');
  }

  if (
    typeof body.category !== 'string' ||
    body.category.trim() === ''
  ) {
    errors.push(
      'category is required and must be a non-empty string.'
    );
  }

  if (
    !Array.isArray(body.tags) ||
    body.tags.some((tag) => typeof tag !== 'string')
  ) {
    errors.push('tags is required and must be an array of strings.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function normalizePostInput(body) {
  return {
    title: body.title.trim(),
    content: body.content.trim(),
    category: body.category.trim(),
    tags: body.tags.map((tag) => tag.trim()),
  };
}

module.exports = {
  validatePostInput,
  normalizePostInput,
};