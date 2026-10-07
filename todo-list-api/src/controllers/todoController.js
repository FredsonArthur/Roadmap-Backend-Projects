const todoService = require('../services/todoService');

function createTodo(req, res) {
  try {
    const { title, description } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'O título da tarefa é obrigatório.' });
    }

    const newTodo = todoService.createNewTodo(req.user.id, title, description);
    return res.status(201).json(newTodo);
  } catch (error) {
    return res.status(500).json({ message: 'Erro interno no servidor.', error: error.message });
  }
}

function getTodos(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = todoService.getUserTodos(req.user.id, page, limit);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: 'Erro interno no servidor.', error: error.message });
  }
}

function updateTodo(req, res) {
  try {
    const todoId = parseInt(req.params.id);
    const { title, description } = req.body;

    const result = todoService.updateExistingTodo(todoId, req.user.id, title, description);

    if (result.error === 'NOT_FOUND') {
      return res.status(404).json({ message: 'Tarefa não encontrada.' });
    }
    if (result.error === 'FORBIDDEN') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: 'Erro interno no servidor.', error: error.message });
  }
}

function deleteTodo(req, res) {
  try {
    const todoId = parseInt(req.params.id);

    const result = todoService.deleteExistingTodo(todoId, req.user.id);

    if (result.error === 'NOT_FOUND') {
      return res.status(404).json({ message: 'Tarefa não encontrada.' });
    }
    if (result.error === 'FORBIDDEN') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: 'Erro interno no servidor.', error: error.message });
  }
}

module.exports = { createTodo, getTodos, updateTodo, deleteTodo };