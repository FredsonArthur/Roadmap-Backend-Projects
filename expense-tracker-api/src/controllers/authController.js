const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { readDB, writeDB } = require('../models/db');
const { JWT_SECRET } = require('../config/env');

async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nome, email e senha são obrigatórios.' });
    }

    const db = readDB();
    const existingUser = db.users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'Este email já está cadastrado.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: db.users.length > 0 ? db.users[db.users.length - 1].id + 1 : 1,
      name,
      email,
      password: hashedPassword
    };

    db.users.push(newUser);
    writeDB(db);

    const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '1h' });

    return res.status(201).json({ message: 'Utilizador registado com sucesso.', token });
  } catch (error) {
    return res.status(500).json({ message: 'Erro interno no servidor.', error: error.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
    }

    const db = readDB();
    const user = db.users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

    return res.status(200).json({ message: 'Login efetuado com sucesso.', token });
  } catch (error) {
    return res.status(500).json({ message: 'Erro interno no servidor.', error: error.message });
  }
}

module.exports = { register, login };