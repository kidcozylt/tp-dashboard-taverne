require('dotenv').config();
const express = require('express');
const cors = require('cors');
require('./db');
const authRoutes = require('./routes/auth');
const pnjRoutes = require('./routes/pnj');

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('JWT_SECRET manquant ou trop court (32 caractères minimum) : voir .env.example');
  process.exit(1);
}

const app = express();

app.use(cors({
  origin: process.env.FRONT_URL || 'http://localhost:3001',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/pnj', pnjRoutes);

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ erreur: 'Corps de requête JSON invalide.' });
  }
  console.error(err.message);
  res.status(500).json({ erreur: 'Erreur serveur.' });
});

app.use((req, res) => res.status(404).json({ erreur: 'Route introuvable.' }));

process.on('unhandledRejection', (e) => console.error('Rejet non géré :', e));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API de la Taverne sur http://localhost:${PORT}`));