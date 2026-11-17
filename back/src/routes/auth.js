const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const router = express.Router();

// Faux hash : on compare toujours quelque chose, pour que la réponse
// prenne le même temps que le login existe ou non (anti-énumération)
const FAUX_HASH = bcrypt.hashSync('mot-de-passe-factice', 10);

router.post('/login', async (req, res) => {
  const { login, motDePasse } = req.body || {};
  if (typeof login !== 'string' || typeof motDePasse !== 'string' || !login || !motDePasse) {
    return res.status(400).json({ erreur: 'Identifiant et mot de passe requis.' });
  }

  try {
    const result = await pool.query(
      'SELECT id, login, mot_de_passe_hash FROM utilisateurs WHERE login = $1',
      [login]
    );
    const user = result.rows[0];
    const valide = await bcrypt.compare(motDePasse, user ? user.mot_de_passe_hash : FAUX_HASH);

    // Message volontairement identique : on ne révèle pas si le login existe
    if (!user || !valide) {
      return res.status(401).json({ erreur: 'Identifiants incorrects.' });
    }

    const token = jwt.sign({ sub: user.id, login: user.login }, process.env.JWT_SECRET, {
      algorithm: 'HS256',
      expiresIn: '2h',
    });
    res.status(200).json({ token });
  } catch (err) {
    console.error('POST /api/auth/login :', err.message);
    res.status(500).json({ erreur: 'Erreur serveur.' });
  }
});

module.exports = router;