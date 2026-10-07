'use strict';

function createPostsService(db) {
  if (!db || typeof db.prepare !== 'function') {
    throw new TypeError('A valid database connection is required.');
  }

  const insertPost = db.prepare(`
    INSERT INTO posts (
      title,
      content,
      category,
      tags,
      created_at,
      updated_at
    )
    VALUES (
      @title,
      @content,
      @category,
      @tags,
      @createdAt,
      @updatedAt
    )
  `);

  const findPostById = db.prepare(`
    SELECT
      id,
      title,
      content,
      category,
      tags,
      created_at AS createdAt,
      updated_at AS updatedAt
    FROM posts
    WHERE id = ?
  `);

  const findAllPosts = db.prepare(`
    SELECT
      id,
      title,
      content,
      category,
      tags,
      created_at AS createdAt,
      updated_at AS updatedAt
    FROM posts
    ORDER BY id DESC
  `);

  const searchPosts = db.prepare(`
    SELECT
      id,
      title,
      content,
      category,
      tags,
      created_at AS createdAt,
      updated_at AS updatedAt
    FROM posts
    WHERE
      title LIKE ?
      OR content LIKE ?
      OR category LIKE ?
    ORDER BY id DESC
  `);

  const updatePost = db.prepare(`
    UPDATE posts
    SET
      title = @title,
      content = @content,
      category = @category,
      tags = @tags,
      updated_at = @updatedAt
    WHERE id = @id
  `);

  const deletePost = db.prepare(`
    DELETE FROM posts
    WHERE id = ?
  `);

  function parsePost(row) {
    if (!row) {
      return null;
    }

    return {
      id: row.id,
      title: row.title,
      content: row.content,
      category: row.category,
      tags: JSON.parse(row.tags),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  function createPost(post) {
    const now = new Date().toISOString();

    const result = insertPost.run({
      title: post.title,
      content: post.content,
      category: post.category,
      tags: JSON.stringify(post.tags),
      createdAt: now,
      updatedAt: now,
    });

    return parsePost(findPostById.get(result.lastInsertRowid));
  }

  function getPostById(id) {
    return parsePost(findPostById.get(id));
  }

  function getAllPosts(term) {
    if (term && term.trim() !== '') {
      const searchTerm = `%${term.trim()}%`;

      return searchPosts
        .all(searchTerm, searchTerm, searchTerm)
        .map(parsePost);
    }

    return findAllPosts.all().map(parsePost);
  }

  function updatePostById(id, post) {
    const now = new Date().toISOString();

    const result = updatePost.run({
      id,
      title: post.title,
      content: post.content,
      category: post.category,
      tags: JSON.stringify(post.tags),
      updatedAt: now,
    });

    if (result.changes === 0) {
      return null;
    }

    return parsePost(findPostById.get(id));
  }

  function deletePostById(id) {
    const result = deletePost.run(id);

    return result.changes > 0;
  }

  return {
    createPost,
    getPostById,
    getAllPosts,
    updatePostById,
    deletePostById,
  };
}

module.exports = {
  createPostsService,
};