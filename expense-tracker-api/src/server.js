const express = require('express');
const cors = require('cors');
const { PORT } = require('./config/env');
const authRoutes = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');

const app = express();

// Middlewares globais
app.use(cors());
app.use(express.json());

// Rotas
app.use('/', authRoutes);
app.use('/', expenseRoutes);

// Rota de teste (Health Check)
app.get('/health', (req, res) => {
  return res.status(200).json({ status: 'OK', message: 'Expense Tracker API está online!' });
});

// Inicialização do servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT} 🚀`);
});