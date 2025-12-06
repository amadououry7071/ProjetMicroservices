const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const reviewController = require('../controllers/reviewController');

// Validation pour la création d'un avis
const createReviewValidation = [
  body('propertyId')
    .notEmpty().withMessage('L\'ID de la propriété est obligatoire')
    .isMongoId().withMessage('ID de propriété invalide'),
  body('rating')
    .notEmpty().withMessage('La note est obligatoire')
    .isInt({ min: 1, max: 5 }).withMessage('La note doit être entre 1 et 5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Le commentaire ne peut pas dépasser 1000 caractères')
];

// Validation pour la modification d'un avis
const updateReviewValidation = [
  param('id').isMongoId().withMessage('ID d\'avis invalide'),
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 }).withMessage('La note doit être entre 1 et 5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Le commentaire ne peut pas dépasser 1000 caractères')
];

// Validation des paramètres
const paramValidation = [
  param('id').isMongoId().withMessage('ID invalide')
];

const propertyParamValidation = [
  param('propertyId').isMongoId().withMessage('ID de propriété invalide')
];

const userParamValidation = [
  param('userId').isMongoId().withMessage('ID d\'utilisateur invalide')
];

// Route de santé
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'review-service',
    timestamp: new Date().toISOString()
  });
});

// Routes publiques
router.get('/', reviewController.getAllReviews);
router.get('/property/:propertyId', propertyParamValidation, reviewController.getPropertyReviews);
router.get('/property/:propertyId/average', propertyParamValidation, reviewController.getPropertyAverageRating);
router.get('/user/:userId', userParamValidation, reviewController.getUserReviews);
router.get('/:id', paramValidation, reviewController.getReview);

// Routes protégées (nécessitent une authentification)
router.post('/', createReviewValidation, reviewController.createReview);
router.put('/:id', updateReviewValidation, reviewController.updateReview);
router.delete('/:id', paramValidation, reviewController.deleteReview);

module.exports = router;
