const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const {
  createReservationValidation,
  updateStatusValidation,
} = require('../middlewares/validateReservation');

// Route de santé
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'reservation-service',
    timestamp: new Date().toISOString(),
  });
});

// Créer une réservation (tenant)
router.post('/', createReservationValidation, reservationController.createReservation);

// Lister toutes les réservations (pour admin)
router.get('/all', reservationController.getAllReservations);

// Lister les réservations de l'utilisateur connecté (tenant ou owner)
router.get('/', reservationController.getMyReservations);

// Détail d'une réservation
router.get('/:id', reservationController.getReservation);

// Mettre à jour le statut d'une réservation (owner/admin)
router.patch('/:id/status', updateStatusValidation, reservationController.updateStatus);

// Annuler une réservation (owner ou tenant concerné)
router.patch('/:id/cancel', reservationController.cancelReservation);

// Supprimer une réservation (owner uniquement)
router.delete('/:id', reservationController.deleteReservation);

module.exports = router;
