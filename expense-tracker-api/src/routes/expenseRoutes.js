const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authMiddleware');
const { add, list, update, remove } = require('../controllers/expenseController');

// Todas as rotas de despesas exigem autenticação via token JWT
router.post('/expenses', authenticateToken, add);
router.get('/expenses', authenticateToken, list);
router.put('/expenses/:id', authenticateToken, update);
router.delete('/expenses/:id', authenticateToken, remove);

module.exports = router;