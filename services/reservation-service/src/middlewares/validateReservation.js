const { body, param } = require('express-validator');

exports.createReservationValidation = [
  body('propertyId').notEmpty().withMessage('propertyId est requis'),
  body('startDate').isISO8601().toDate().withMessage('startDate doit être une date valide'),
  body('endDate').isISO8601().toDate().withMessage('endDate doit être une date valide'),
];

exports.updateStatusValidation = [
  param('id').isMongoId().withMessage('ID de réservation invalide'),
  body('status')
    .isIn(['pending', 'confirmed', 'cancelled', 'rejected'])
    .withMessage('Statut invalide'),
];
