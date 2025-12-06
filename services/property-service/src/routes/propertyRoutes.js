const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const { 
  createPropertyValidation, 
  updatePropertyValidation, 
  queryValidation, 
  paramValidation 
} = require('../middlewares/validateProperty');

// Route de santé
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'property-service',
    timestamp: new Date().toISOString()
  });
});

// Routes publiques
router.get('/', queryValidation, propertyController.getProperties);

// Route protégée - Mes propriétés (owner uniquement)
router.get('/my', propertyController.getMyProperties);

router.get('/:id', paramValidation, propertyController.getProperty);

// Routes protégées (nécessitent une authentification et le rôle propriétaire)
router.post('/', createPropertyValidation, propertyController.createProperty);
router.put('/:id', updatePropertyValidation, propertyController.updateProperty);
router.delete('/:id', paramValidation, propertyController.deleteProperty);

module.exports = router;
