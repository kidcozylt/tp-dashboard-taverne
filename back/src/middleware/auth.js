const jwt = require('jsonwebtoken');

// Exige l'en-tête "Authorization: Bearer <token>" et vérifie la signature du JWT
function verifierToken(req, res, next) {
  const [type, token] = (req.headers.authorization || '').split(' ');
  if (type !== 'Bearer' || !token) {
    return res.status(401).json({ erreur: 'Authentification requise.' });
  }
  try {
    req.utilisateur = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    next();
  } catch (err) {
    res.status(401).json({ erreur: 'Token invalide ou expiré.' });
  }
}

module.exports = verifierToken;