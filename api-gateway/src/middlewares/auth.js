const jwt = require('jsonwebtoken');

/**
 * Middleware pour vérifier le token JWT
 */
const authenticateToken = (req, res, next) => {
  // Récupérer le token du header Authorization
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Accès non autorisé - Token manquant' });
  }

  try {
    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'votre_clé_secrète_par_défaut');
    req.user = decoded; // Ajouter les informations de l'utilisateur à la requête
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token invalide ou expiré' });
  }
};

/**
 * Middleware pour vérifier le rôle de l'utilisateur
 */
const checkRole = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès refusé - Droits insuffisants' });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  checkRole,
};
