const express = require('express');
const noteRoutes = require('./routes/noteRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Usar rotas de notas
app.use('/api', noteRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Bem-vindo à API do Markdown Note-taking App!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor a correr em http://localhost:${PORT}`);
});