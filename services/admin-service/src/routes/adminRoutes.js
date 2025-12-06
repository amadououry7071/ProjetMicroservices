const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Route de santé
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'admin-service',
    timestamp: new Date().toISOString()
  });
});

// Statistiques
router.get('/stats', adminController.getStats);

// Gestion des utilisateurs
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/ban', adminController.banUser);
router.put('/users/:id/unban', adminController.unbanUser);
router.delete('/users/:id', adminController.deleteUser);

// Gestion des propriétés
router.get('/properties', adminController.getAllProperties);
router.delete('/properties/:id', adminController.deleteProperty);

// Gestion des avis
router.get('/reviews', adminController.getAllReviews);
router.delete('/reviews/:id', adminController.deleteReview);

// Gestion des réservations
router.get('/reservations', adminController.getAllReservations);
router.delete('/reservations/:id', adminController.deleteReservation);

// Logs des actions admin
router.get('/logs', adminController.getLogs);

module.exports = router;
