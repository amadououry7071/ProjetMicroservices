const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Route de santé publique
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'auth-service',
    timestamp: new Date().toISOString()
  });
});

// Routes publiques
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Route utilisée par les autres microservices pour vérifier un token
router.get('/verify', authController.protect, (req, res) => {
  res.status(200).json({
    userId: req.user._id,
    role: req.user.role,
    email: req.user.email,
  });
});

// Route pour récupérer un utilisateur par ID (pour les autres services)
router.get('/user/:id', authController.getUserById);

// Routes protégées
router.use(authController.protect); // Protéger toutes les routes qui suivent

router.get('/me', authController.getMe);
router.post('/logout', authController.logout);
router.put('/update-profile', authController.updateProfile);
router.put('/update-password', authController.updatePassword);
router.delete('/delete-account', authController.deleteAccount);

// ==================== ROUTES ADMIN ====================
// Routes pour la gestion des utilisateurs par l'admin

// Liste tous les utilisateurs
router.get('/users', authController.restrictTo('admin'), authController.getAllUsers);

// Récupérer un utilisateur par ID
router.get('/users/:id', authController.restrictTo('admin'), authController.getUserById);

// Bannir un utilisateur
router.put('/users/:id/ban', authController.restrictTo('admin'), authController.banUser);

// Débannir un utilisateur
router.put('/users/:id/unban', authController.restrictTo('admin'), authController.unbanUser);

// Supprimer un utilisateur
router.delete('/users/:id', authController.restrictTo('admin'), authController.deleteUserByAdmin);

module.exports = router;
