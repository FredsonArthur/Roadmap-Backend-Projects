const express = require('express');
const cors = require('cors');
const { PORT } = require('./config/env');
const authRoutes = require('./routes/authRoutes');
const todoRoutes = require('./routes/todoRoutes');

const app = express();

// Middlewares globais
app.use(cors());
app.use(express.json());

// Rotas
app.use('/', authRoutes);
app.use('/', todoRoutes);

// Rota de teste
app.get('/health', (req, res) => {
  return res.status(200).json({ status: 'OK', message: 'Todo List API está online!' });
});

// Inicialização do servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT} 🚀`);
});