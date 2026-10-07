const express = require('express');
const { createTodo, getTodos, updateTodo, deleteTodo } = require('../controllers/todoController');
const authenticateToken = require('../middlewares/authMiddleware');

const router = express.Router();

// Todas as rotas abaixo exigem autenticação via token
router.use(authenticateToken);

router.post('/todos', createTodo);
router.get('/todos', getTodos);
router.put('/todos/:id', updateTodo);
router.delete('/todos/:id', deleteTodo);

module.exports = router;