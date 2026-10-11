const express = require('express');
const urlRoutes = require('./routes/urlRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Usar rotas
app.use('/', urlRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Bem-vindo ao URL Shortening Service API!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor de URLs a correr em http://localhost:${PORT}`);
});