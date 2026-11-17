const express = require('express');
const pool = require('../db');
const verifierToken = require('../middleware/auth');

const router = express.Router();

// Publique
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM personnages ORDER BY id');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('GET /api/pnj :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur : base de données indisponible.' });
  }
});

// Réservée aux porteurs d'un JWT valide
router.post('/', verifierToken, async (req, res) => {
  const { nom, classe, niveau } = req.body || {};
  const nomOk = typeof nom === 'string' && nom.trim() !== '';
  const classeOk = typeof classe === 'string' && classe.trim() !== '';
  const niveauOk = Number.isInteger(niveau) && niveau >= 1;
  if (!nomOk || !classeOk || !niveauOk) {
    return res.status(400).json({
      erreur: 'Requête incomplète ou invalide : nom (texte), classe (texte) et niveau (entier >= 1) sont obligatoires.',
    });
  }
  try {
    const result = await pool.query(
      'INSERT INTO personnages (nom, classe, niveau) VALUES ($1, $2, $3) RETURNING *',
      [nom.trim(), classe.trim(), niveau]
    );
    res.status(201).json({ message: 'PNJ enregistré avec succès.', pnj: result.rows[0] });
  } catch (err) {
    console.error('POST /api/pnj :', err.message);
    res.status(500).json({ erreur: "Erreur serveur : l'enregistrement a échoué." });
  }
});

module.exports = router;