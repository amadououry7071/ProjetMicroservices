const Review = require('../models/Review');
const { validationResult } = require('express-validator');
const axios = require('axios');
const config = require('../config/config');

// Vérifier l'authentification de l'utilisateur
const verifyAuth = async (req) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const response = await axios.get(config.authServiceUrl, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Erreur de vérification du token:', error.message);
    return null;
  }
};

// Créer un avis
exports.createReview = async (req, res) => {
  try {
    // Vérifier l'authentification
    const user = await verifyAuth(req);
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Non autorisé - Veuillez vous connecter' 
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { propertyId, rating, comment } = req.body;

    // Vérifier si l'utilisateur a déjà laissé un avis sur cette propriété
    const existingReview = await Review.findOne({ 
      propertyId, 
      userId: user.userId 
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Vous avez déjà laissé un avis sur cette propriété'
      });
    }

    const review = new Review({
      propertyId,
      userId: user.userId,
      userName: user.name || user.email,
      rating,
      comment
    });

    await review.save();

    res.status(201).json({
      success: true,
      message: 'Avis créé avec succès',
      data: review
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'avis:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'avis',
      error: error.message
    });
  }
};

// Récupérer tous les avis d'une propriété
exports.getPropertyReviews = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const reviews = await Review.find({ propertyId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des avis:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des avis',
      error: error.message
    });
  }
};

// Récupérer tous les avis d'un utilisateur
exports.getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;

    const reviews = await Review.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des avis:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des avis',
      error: error.message
    });
  }
};

// Récupérer un avis par son ID
exports.getReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Avis non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'avis:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'avis',
      error: error.message
    });
  }
};

// Modifier un avis
exports.updateReview = async (req, res) => {
  try {
    // Vérifier l'authentification
    const user = await verifyAuth(req);
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Non autorisé - Veuillez vous connecter' 
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Avis non trouvé'
      });
    }

    // Vérifier que l'utilisateur est l'auteur de l'avis
    if (review.userId.toString() !== user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé - Vous ne pouvez modifier que vos propres avis'
      });
    }

    const { rating, comment } = req.body;

    if (rating) review.rating = rating;
    if (comment !== undefined) review.comment = comment;

    await review.save();

    res.status(200).json({
      success: true,
      message: 'Avis modifié avec succès',
      data: review
    });
  } catch (error) {
    console.error('Erreur lors de la modification de l\'avis:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification de l\'avis',
      error: error.message
    });
  }
};

// Supprimer un avis
exports.deleteReview = async (req, res) => {
  try {
    // Vérifier l'authentification
    const user = await verifyAuth(req);
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Non autorisé - Veuillez vous connecter' 
      });
    }

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Avis non trouvé'
      });
    }

    // Vérifier que l'utilisateur est l'auteur de l'avis OU un admin
    if (review.userId.toString() !== user.userId && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé - Vous ne pouvez supprimer que vos propres avis'
      });
    }

    await Review.deleteOne({ _id: review._id });

    res.status(200).json({
      success: true,
      message: 'Avis supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'avis:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'avis',
      error: error.message
    });
  }
};

// Récupérer la note moyenne d'une propriété
exports.getPropertyAverageRating = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const result = await Review.aggregate([
      { $match: { propertyId: new (require('mongoose').Types.ObjectId)(propertyId) } },
      { 
        $group: { 
          _id: '$propertyId', 
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        } 
      }
    ]);

    if (result.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          propertyId,
          averageRating: 0,
          totalReviews: 0
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        propertyId,
        averageRating: Math.round(result[0].averageRating * 10) / 10,
        totalReviews: result[0].totalReviews
      }
    });
  } catch (error) {
    console.error('Erreur lors du calcul de la note moyenne:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du calcul de la note moyenne',
      error: error.message
    });
  }
};

// Récupérer tous les avis (pour admin)
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des avis:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des avis',
      error: error.message
    });
  }
};
