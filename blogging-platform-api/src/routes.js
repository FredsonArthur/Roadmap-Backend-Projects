'use strict';

const express = require('express');

const {
  validatePostInput,
  normalizePostInput,
} = require('./validation');

function createRoutes(postsService) {
  if (!postsService) {
    throw new TypeError('postsService is required.');
  }

  const router = express.Router();

  router.post('/posts', (req, res) => {
    const validation = validatePostInput(req.body);

    if (!validation.valid) {
      return res.status(400).json({
        errors: validation.errors,
      });
    }

    const post = postsService.createPost(
      normalizePostInput(req.body)
    );

    return res.status(201).json(post);
  });

  router.get('/posts', (req, res) => {
    const term =
      typeof req.query.term === 'string'
        ? req.query.term
        : '';

    const posts = postsService.getAllPosts(term);

    return res.status(200).json(posts);
  });

  router.get('/posts/:id', (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(404).json({
        error: {
          code: 'POST_NOT_FOUND',
          message: 'Blog post not found.',
        },
      });
    }

    const post = postsService.getPostById(id);

    if (!post) {
      return res.status(404).json({
        error: {
          code: 'POST_NOT_FOUND',
          message: 'Blog post not found.',
        },
      });
    }

    return res.status(200).json(post);
  });

  router.put('/posts/:id', (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(404).json({
        error: {
          code: 'POST_NOT_FOUND',
          message: 'Blog post not found.',
        },
      });
    }

    const validation = validatePostInput(req.body);

    if (!validation.valid) {
      return res.status(400).json({
        errors: validation.errors,
      });
    }

    const post = postsService.updatePostById(
      id,
      normalizePostInput(req.body)
    );

    if (!post) {
      return res.status(404).json({
        error: {
          code: 'POST_NOT_FOUND',
          message: 'Blog post not found.',
        },
      });
    }

    return res.status(200).json(post);
  });

  router.delete('/posts/:id', (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(404).json({
        error: {
          code: 'POST_NOT_FOUND',
          message: 'Blog post not found.',
        },
      });
    }

    const deleted = postsService.deletePostById(id);

    if (!deleted) {
      return res.status(404).json({
        error: {
          code: 'POST_NOT_FOUND',
          message: 'Blog post not found.',
        },
      });
    }

    return res.status(204).send();
  });

  return router;
}

module.exports = {
  createRoutes,
};