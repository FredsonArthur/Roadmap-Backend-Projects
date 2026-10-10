const {
  createExpense,
  getFilteredExpenses,
  updateExpense,
  deleteExpense
} = require('../services/expenseService');

function add(req, res) {
  try {
    const userId = req.user.id;
    const { title, amount, category, date } = req.body;

    const result = createExpense(userId, title, amount, category, date);

    if (result.error === 'MISSING_FIELDS') {
      return res.status(400).json({ message: 'Campos obrigatórios em falta (title, amount, category).' });
    }

    if (result.error === 'INVALID_CATEGORY') {
      return res.status(400).json({ 
        message: 'Categoria inválida.', 
        validCategories: result.validCategories 
      });
    }

    return res.status(201).json({
      message: 'Despesa criada com sucesso.',
      expense: result.expense
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erro interno no servidor.', error: error.message });
  }
}

function list(req, res) {
  try {
    const userId = req.user.id;
    const { filter, startDate, endDate } = req.query;

    const result = getFilteredExpenses(userId, filter, startDate, endDate);

    if (result.error === 'MISSING_CUSTOM_DATES') {
      return res.status(400).json({ message: 'Para o filtro custom, é necessário fornecer startDate e endDate (YYYY-MM-DD).' });
    }

    return res.status(200).json({
      total: result.expenses.length,
      expenses: result.expenses
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erro interno no servidor.', error: error.message });
  }
}

function update(req, res) {
  try {
    const userId = req.user.id;
    const expenseId = parseInt(req.params.id);
    const { title, amount, category, date } = req.body;

    const result = updateExpense(expenseId, userId, title, amount, category, date);

    if (result.error === 'NOT_FOUND') {
      return res.status(404).json({ message: 'Despesa não encontrada.' });
    }

    if (result.error === 'FORBIDDEN') {
      return res.status(403).json({ message: 'Acesso negado. Esta despesa pertence a outro utilizador.' });
    }

    if (result.error === 'INVALID_CATEGORY') {
      return res.status(400).json({ 
        message: 'Categoria inválida.', 
        validCategories: result.validCategories 
      });
    }

    return res.status(200).json({
      message: 'Despesa atualizada com sucesso.',
      expense: result.expense
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erro interno no servidor.', error: error.message });
  }
}

function remove(req, res) {
  try {
    const userId = req.user.id;
    const expenseId = parseInt(req.params.id);

    const result = deleteExpense(expenseId, userId);

    if (result.error === 'NOT_FOUND') {
      return res.status(404).json({ message: 'Despesa não encontrada.' });
    }

    if (result.error === 'FORBIDDEN') {
      return res.status(403).json({ message: 'Acesso negado. Esta despesa pertence a outro utilizador.' });
    }

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: 'Erro interno no servidor.', error: error.message });
  }
}

module.exports = {
  add,
  list,
  update,
  remove
};