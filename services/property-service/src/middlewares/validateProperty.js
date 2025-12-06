const { body, param, query } = require('express-validator');

// Validation pour la création d'une propriété
exports.createPropertyValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Le titre est obligatoire')
    .isLength({ max: 100 }).withMessage('Le titre ne peut pas dépasser 100 caractères'),
  
  body('description')
    .trim()
    .notEmpty().withMessage('La description est obligatoire'),
  
  body('surface')
    .isNumeric().withMessage('La surface doit être un nombre')
    .isFloat({ min: 1 }).withMessage('La surface doit être supérieure à 0'),
  
  body('rooms')
    .isInt({ min: 1 }).withMessage('Le nombre de pièces doit être un entier supérieur à 0'),
  
  body('price')
    .isNumeric().withMessage('Le prix doit être un nombre')
    .isFloat({ min: 0 }).withMessage('Le prix ne peut pas être négatif'),
  
  body('address.street')
    .trim()
    .notEmpty().withMessage('La rue est obligatoire'),
  
  body('address.city')
    .trim()
    .notEmpty().withMessage('La ville est obligatoire'),
  
  body('address.postalCode')
    .trim()
    .notEmpty().withMessage('Le code postal est obligatoire')
    .isLength({ min: 3, max: 10 }).withMessage('Code postal invalide'),
  
  body('address.country')
    .optional()
    .trim()
    .isString().withMessage('Le pays doit être une chaîne de caractères'),
  
  body('features')
    .optional()
    .isObject().withMessage('Les caractéristiques doivent être un objet'),
  
  body('features.*')
    .optional()
    .isBoolean().withMessage('Les caractéristiques doivent être des booléens'),
  
  body('status')
    .optional()
    .isIn(['available', 'rented', 'under_contract']).withMessage('Statut invalide'),
  
  body('images')
    .optional()
    .isArray().withMessage('Les images doivent être un tableau')
];

// Validation pour la mise à jour d'une propriété
exports.updatePropertyValidation = [
  param('id')
    .isMongoId().withMessage('ID de propriété invalide'),
  
  body('title')
    .optional()
    .trim()
    .notEmpty().withMessage('Le titre ne peut pas être vide')
    .isLength({ max: 100 }).withMessage('Le titre ne peut pas dépasser 100 caractères'),
  
  body('description')
    .optional()
    .trim()
    .notEmpty().withMessage('La description ne peut pas être vide'),
  
  body('surface')
    .optional()
    .isNumeric().withMessage('La surface doit être un nombre')
    .isFloat({ min: 1 }).withMessage('La surface doit être supérieure à 0'),
  
  body('rooms')
    .optional()
    .isInt({ min: 1 }).withMessage('Le nombre de pièces doit être un entier supérieur à 0'),
  
  body('price')
    .optional()
    .isNumeric().withMessage('Le prix doit être un nombre')
    .isFloat({ min: 0 }).withMessage('Le prix ne peut pas être négatif'),
  
  body('address')
    .optional()
    .isObject().withMessage('L\'adresse doit être un objet'),
  
  body('address.street')
    .optional()
    .trim()
    .notEmpty().withMessage('La rue ne peut pas être vide'),
  
  body('address.city')
    .optional()
    .trim()
    .notEmpty().withMessage('La ville ne peut pas être vide'),
  
  body('address.postalCode')
    .optional()
    .trim()
    .notEmpty().withMessage('Le code postal ne peut pas être vide')
    .isLength({ min: 3, max: 10 }).withMessage('Code postal invalide'),
  
  body('address.country')
    .optional()
    .trim()
    .isString().withMessage('Le pays doit être une chaîne de caractères'),
  
  body('features')
    .optional()
    .isObject().withMessage('Les caractéristiques doivent être un objet'),
  
  body('features.*')
    .optional()
    .isBoolean().withMessage('Les caractéristiques doivent être des booléens'),
  
  body('status')
    .optional()
    .isIn(['available', 'rented', 'under_contract']).withMessage('Statut invalide'),
  
  body('images')
    .optional()
    .isArray().withMessage('Les images doivent être un tableau')
];

// Validation pour les paramètres de requête
exports.queryValidation = [
  query('city')
    .optional()
    .trim()
    .isString().withMessage('La ville doit être une chaîne de caractères'),
  
  query('minPrice')
    .optional()
    .isNumeric().withMessage('Le prix minimum doit être un nombre')
    .toFloat(),
  
  query('maxPrice')
    .optional()
    .isNumeric().withMessage('Le prix maximum doit être un nombre')
    .toFloat(),
  
  query('minSurface')
    .optional()
    .isNumeric().withMessage('La surface minimale doit être un nombre')
    .toFloat(),
  
  query('maxSurface')
    .optional()
    .isNumeric().withMessage('La surface maximale doit être un nombre')
    .toFloat(),
  
  query('rooms')
    .optional()
    .isInt({ min: 1 }).withMessage('Le nombre de pièces doit être un entier positif')
    .toInt(),
  
  query('status')
    .optional()
    .isIn(['available', 'rented', 'under_contract']).withMessage('Statut invalide')
];

// Validation pour les paramètres d'URL
exports.paramValidation = [
  param('id')
    .isMongoId().withMessage('ID de propriété invalide')
];
