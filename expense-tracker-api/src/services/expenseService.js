const { readDB, writeDB } = require('../models/db');

const VALID_CATEGORIES = [
  'Groceries',
  'Leisure',
  'Electronics',
  'Utilities',
  'Clothing',
  'Health',
  'Others'
];

function createExpense(userId, title, amount, category, date) {
  if (!title || amount === undefined || !category) {
    return { error: 'MISSING_FIELDS' };
  }

  if (!VALID_CATEGORIES.includes(category)) {
    return { error: 'INVALID_CATEGORY', validCategories: VALID_CATEGORIES };
  }

  const db = readDB();
  const newExpense = {
    id: db.expenses.length > 0 ? db.expenses[db.expenses.length - 1].id + 1 : 1,
    userId,
    title,
    amount: parseFloat(amount),
    category,
    date: date ? new Date(date).toISOString() : new Date().toISOString()
  };

  db.expenses.push(newExpense);
  writeDB(db);

  return { expense: newExpense };
}

function getFilteredExpenses(userId, filter, startDate, endDate) {
  const db = readDB();
  let userExpenses = db.expenses.filter(e => e.userId === userId);

  if (filter) {
    const now = new Date();
    
    if (filter === 'past_week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      userExpenses = userExpenses.filter(e => new Date(e.date) >= oneWeekAgo);
    } else if (filter === 'past_month') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(now.getMonth() - 1);
      userExpenses = userExpenses.filter(e => new Date(e.date) >= oneMonthAgo);
    } else if (filter === 'last_3_months') {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(now.getMonth() - 3);
      userExpenses = userExpenses.filter(e => new Date(e.date) >= threeMonthsAgo);
    } else if (filter === 'custom') {
      if (!startDate || !endDate) {
        return { error: 'MISSING_CUSTOM_DATES' };
      }
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Inclui o dia final completo

      userExpenses = userExpenses.filter(e => {
        const expenseDate = new Date(e.date);
        return expenseDate >= start && expenseDate <= end;
      });
    }
  }

  return { expenses: userExpenses };
}

function updateExpense(expenseId, userId, title, amount, category, date) {
  const db = readDB();
  const index = db.expenses.findIndex(e => e.id === expenseId);

  if (index === -1) {
    return { error: 'NOT_FOUND' };
  }

  if (db.expenses[index].userId !== userId) {
    return { error: 'FORBIDDEN' };
  }

  if (category && !VALID_CATEGORIES.includes(category)) {
    return { error: 'INVALID_CATEGORY', validCategories: VALID_CATEGORIES };
  }

  const current = db.expenses[index];
  db.expenses[index] = {
    ...current,
    title: title !== undefined ? title : current.title,
    amount: amount !== undefined ? parseFloat(amount) : current.amount,
    category: category !== undefined ? category : current.category,
    date: date !== undefined ? new Date(date).toISOString() : current.date
  };

  writeDB(db);
  return { expense: db.expenses[index] };
}

function deleteExpense(expenseId, userId) {
  const db = readDB();
  const index = db.expenses.findIndex(e => e.id === expenseId);

  if (index === -1) {
    return { error: 'NOT_FOUND' };
  }

  if (db.expenses[index].userId !== userId) {
    return { error: 'FORBIDDEN' };
  }

  db.expenses.splice(index, 1);
  writeDB(db);

  return { success: true };
}

module.exports = {
  createExpense,
  getFilteredExpenses,
  updateExpense,
  deleteExpense,
  VALID_CATEGORIES
};