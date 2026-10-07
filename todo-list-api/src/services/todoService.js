const { readDB, writeDB } = require('../models/db');

function createNewTodo(userId, title, description) {
  const db = readDB();
  const newTodo = {
    id: db.todos.length > 0 ? db.todos[db.todos.length - 1].id + 1 : 1,
    userId,
    title,
    description: description || ''
  };

  db.todos.push(newTodo);
  writeDB(db);

  return {
    id: newTodo.id,
    title: newTodo.title,
    description: newTodo.description
  };
}

function getUserTodos(userId, page, limit) {
  const db = readDB();
  const userTodos = db.todos.filter(t => t.userId === userId);

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const paginatedTodos = userTodos.slice(startIndex, endIndex).map(t => ({
    id: t.id,
    title: t.title,
    description: t.description
  }));

  return {
    data: paginatedTodos,
    page,
    limit,
    total: userTodos.length
  };
}

function updateExistingTodo(todoId, userId, title, description) {
  const db = readDB();
  const todoIndex = db.todos.findIndex(t => t.id === todoId);

  if (todoIndex === -1) {
    return { error: 'NOT_FOUND' };
  }

  if (db.todos[todoIndex].userId !== userId) {
    return { error: 'FORBIDDEN' };
  }

  db.todos[todoIndex] = {
    ...db.todos[todoIndex],
    title: title !== undefined ? title : db.todos[todoIndex].title,
    description: description !== undefined ? description : db.todos[todoIndex].description
  };

  writeDB(db);

  const updated = db.todos[todoIndex];
  return {
    id: updated.id,
    title: updated.title,
    description: updated.description
  };
}

function deleteExistingTodo(todoId, userId) {
  const db = readDB();
  const todoIndex = db.todos.findIndex(t => t.id === todoId);

  if (todoIndex === -1) {
    return { error: 'NOT_FOUND' };
  }

  if (db.todos[todoIndex].userId !== userId) {
    return { error: 'FORBIDDEN' };
  }

  db.todos.splice(todoIndex, 1);
  writeDB(db);

  return { success: true };
}

module.exports = {
  createNewTodo,
  getUserTodos,
  updateExistingTodo,
  deleteExistingTodo
};