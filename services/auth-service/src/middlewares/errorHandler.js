const { logError, isOperationalError } = require('../utils/errorUtils');

const errorHandler = (err, req, res, next) => {
  logError(err);

  if (res.headersSent) {
    return next(err);
  }

  // Gestion des erreurs opérationnelles
  if (isOperationalError(err)) {
    return res.status(err.statusCode || 500).json({
      status: 'error',
      message: err.message,
    });
  }

  // Gestion des erreurs non opérationnelles
  console.error('Une erreur critique est survenue:', err);
  return res.status(500).json({
    status: 'error',
    message: 'Une erreur interne est survenue. Veuillez réessayer plus tard.',
  });
};

module.exports = errorHandler;
