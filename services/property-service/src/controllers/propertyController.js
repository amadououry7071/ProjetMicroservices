const Property = require('../models/Property');
const { validationResult } = require('express-validator');
const axios = require('axios');
const config = require('../config/config');

// Vérifier si l'utilisateur est un propriétaire
const isOwner = async (req, res, next) => {
  try {
    // Vérifier le token avec le service d'authentification
    const authHeader = req.headers.authorization;
    
    console.log('🔐 Vérification auth - Header:', authHeader ? 'Présent' : 'Absent');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Non autorisé - Token manquant' });
    }

    const token = authHeader.split(' ')[1];
    
    console.log('🔐 Appel auth-service:', config.authServiceUrl);
    
    const response = await axios.get(config.authServiceUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('🔐 Réponse auth-service:', response.data);

    // Autoriser owner ET admin
    if (response.data.role !== 'owner' && response.data.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Accès refusé - Seuls les propriétaires peuvent effectuer cette action' 
      });
    }

    req.user = response.data;
    next();
  } catch (error) {
    console.error('❌ Erreur de vérification du token:', error.message);
    return res.status(401).json({ 
      message: 'Non autorisé - Token invalide ou expiré' 
    });
  }
};

// Créer une nouvelle propriété
exports.createProperty = [
  isOwner,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const propertyData = {
        ...req.body,
        owner: req.user.userId // L'ID de l'utilisateur est ajouté automatiquement
      };

      const property = new Property(propertyData);
      await property.save();
      
      res.status(201).json({
        success: true,
        data: property
      });
    } catch (error) {
      console.error('Erreur lors de la création de la propriété:', error);
      res.status(500).json({ 
        success: false,
        message: 'Erreur lors de la création de la propriété',
        error: error.message 
      });
    }
  }
];

// Récupérer toutes les propriétés (avec filtres)
exports.getProperties = async (req, res) => {
  try {
    const { city, minPrice, maxPrice, minSurface, maxSurface, rooms, status } = req.query;
    const query = {};

    // Filtres de recherche
    if (city) query['address.city'] = new RegExp(city, 'i');
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (minSurface || maxSurface) {
      query.surface = {};
      if (minSurface) query.surface.$gte = Number(minSurface);
      if (maxSurface) query.surface.$lte = Number(maxSurface);
    }
    if (rooms) query.rooms = Number(rooms);
    if (status) query.status = status;

    const properties = await Property.find(query).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des propriétés:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de la récupération des propriétés',
      error: error.message 
    });
  }
};

// Récupérer les propriétés du propriétaire connecté
exports.getMyProperties = async (req, res) => {
  try {
    // Vérifier le token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Non autorisé - Token manquant' });
    }

    const token = authHeader.split(' ')[1];
    const response = await axios.get(config.authServiceUrl, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const user = response.data;
    
    if (user.role !== 'owner' && user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Accès refusé - Réservé aux propriétaires' 
      });
    }

    // Récupérer uniquement les propriétés de ce propriétaire
    const properties = await Property.find({ owner: user.userId }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des propriétés:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de la récupération de vos propriétés',
      error: error.message 
    });
  }
};

// Récupérer une propriété par son ID
exports.getProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Propriété non trouvée'
      });
    }
    
    res.status(200).json({
      success: true,
      data: property
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la propriété:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de la récupération de la propriété',
      error: error.message 
    });
  }
};

// Mettre à jour une propriété
exports.updateProperty = [
  isOwner,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      let property = await Property.findById(req.params.id);
      
      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Propriété non trouvée'
        });
      }

      // Vérifier que l'utilisateur est bien le propriétaire
      if (property.owner.toString() !== req.user.userId) {
        return res.status(403).json({
          success: false,
          message: 'Non autorisé - Vous devez être le propriétaire pour modifier cette propriété'
        });
      }

      // Mise à jour des champs
      const updates = Object.keys(req.body);
      updates.forEach(update => {
        property[update] = req.body[update];
      });

      await property.save();
      
      res.status(200).json({
        success: true,
        data: property
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la propriété:', error);
      res.status(500).json({ 
        success: false,
        message: 'Erreur lors de la mise à jour de la propriété',
        error: error.message 
      });
    }
  }
];

// Supprimer une propriété
exports.deleteProperty = [
  isOwner,
  async (req, res) => {
    try {
      const property = await Property.findById(req.params.id);
      
      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Propriété non trouvée'
        });
      }

      // Vérifier que l'utilisateur est le propriétaire OU un admin
      if (property.owner.toString() !== req.user.userId && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Non autorisé - Vous devez être le propriétaire pour supprimer cette propriété'
        });
      }

      await Property.deleteOne({ _id: property._id });
      
      res.status(200).json({
        success: true,
        message: 'Propriété supprimée avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de la suppression de la propriété:', error);
      res.status(500).json({ 
        success: false,
        message: 'Erreur lors de la suppression de la propriété',
        error: error.message 
      });
    }
  }
];
