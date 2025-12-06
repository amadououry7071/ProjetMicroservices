const { validationResult } = require('express-validator');
const axios = require('axios');
const Reservation = require('../models/Reservation');
const config = require('../config/config');
const { 
  notifyNewReservation, 
  notifyReservationConfirmed, 
  notifyReservationRejected,
  notifyReservationCancelled 
} = require('../utils/notificationService');

// URL de base via API Gateway
const API_GATEWAY_URL = 'http://localhost:3000';

// Helper pour récupérer les infos d'un utilisateur
const getUserInfo = async (userId) => {
  try {
    const response = await axios.get(`${API_GATEWAY_URL}/api/auth/user/${userId}`);
    return response.data.data?.user || null;
  } catch (error) {
    console.error(`Erreur récupération user ${userId}: ${error.message}`);
    return null;
  }
};

// Helper pour formater une date
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('fr-CA', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
};

// Vérifier le token et récupérer l'utilisateur
const verifyToken = async (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const error = new Error('Non autorisé - Token manquant');
    error.statusCode = 401;
    throw error;
  }

  const token = authHeader.split(' ')[1];

  const response = await axios.get(config.authServiceUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data; // { userId, role, email }
};

// Créer une réservation (tenant uniquement)
exports.createReservation = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await verifyToken(req);
    if (user.role !== 'tenant') {
      return res.status(403).json({
        message: 'Accès refusé - Seuls les locataires peuvent créer une réservation',
      });
    }

    const { propertyId, startDate, endDate } = req.body;

    // 1) Récupérer les infos du bien depuis le property-service
    const propertyResponse = await axios.get(`${config.propertyServiceUrl}/${propertyId}`);
    const property = propertyResponse.data?.data || propertyResponse.data;

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Propriété associée introuvable',
      });
    }

    const ownerId = property.owner?.toString?.() || property.owner;
    const price = property.price;

    if (!price) {
      return res.status(400).json({
        success: false,
        message: 'La propriété ne possède pas de prix défini',
      });
    }

    // 2) Vérifier la cohérence des dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (!(start instanceof Date && !isNaN(start)) || !(end instanceof Date && !isNaN(end))) {
      return res.status(400).json({
        success: false,
        message: 'Dates de réservation invalides',
      });
    }

    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: 'La date de fin doit être postérieure à la date de début',
      });
    }

    // 3) Vérifier les conflits de dates pour cette propriété
    const overlappingReservation = await Reservation.findOne({
      propertyId,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        { startDate: { $lt: end }, endDate: { $gt: start } }, // chevauchement classique
      ],
    });

    if (overlappingReservation) {
      return res.status(400).json({
        success: false,
        message: 'Cette propriété est déjà réservée sur cette période',
      });
    }

    // 4) Calculer le prix total (par nuit)
    const oneDayMs = 1000 * 60 * 60 * 24;
    const nights = Math.round((end - start) / oneDayMs);

    if (nights <= 0) {
      return res.status(400).json({
        success: false,
        message: 'La durée de la réservation doit être au moins d\'une nuit',
      });
    }

    const totalPrice = nights * price;

    const reservation = await Reservation.create({
      propertyId,
      startDate: start,
      endDate: end,
      tenantId: user.userId,
      ownerId,
      totalPrice,
    });

    // Envoyer notification au propriétaire (non-bloquant)
    const ownerInfo = await getUserInfo(ownerId);
    const tenantInfo = await getUserInfo(user.userId);
    if (ownerInfo && tenantInfo) {
      notifyNewReservation(
        ownerInfo.email,
        ownerInfo.firstName,
        `${tenantInfo.firstName} ${tenantInfo.lastName}`,
        property.title,
        formatDate(start),
        formatDate(end),
        totalPrice
      );
    }

    return res.status(201).json({ success: true, data: reservation });
  } catch (error) {
    console.error('Erreur lors de la création de la réservation:', error);
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: 'Erreur lors de la création de la réservation',
      error: error.message,
    });
  }
};

// Récupérer les réservations de l'utilisateur connecté
exports.getMyReservations = async (req, res) => {
  try {
    const user = await verifyToken(req);

    let filter = {};
    if (user.role === 'tenant') {
      filter.tenantId = user.userId;
    } else if (user.role === 'owner') {
      filter.ownerId = user.userId;
    }

    const reservations = await Reservation.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des réservations:', error);
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: 'Erreur lors de la récupération des réservations',
      error: error.message,
    });
  }
};

// Récupérer une réservation par ID (tenant ou owner concerné)
exports.getReservation = async (req, res) => {
  try {
    const user = await verifyToken(req);
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Réservation non trouvée' });
    }

    if (
      user.role !== 'admin' &&
      reservation.tenantId !== user.userId &&
      reservation.ownerId !== user.userId
    ) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé pour voir cette réservation',
      });
    }

    return res.status(200).json({ success: true, data: reservation });
  } catch (error) {
    console.error('Erreur lors de la récupération de la réservation:', error);
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: 'Erreur lors de la récupération de la réservation',
      error: error.message,
    });
  }
};

// Mettre à jour le statut d'une réservation (owner uniquement)
exports.updateStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await verifyToken(req);
    if (user.role !== 'owner' && user.role !== 'admin') {
      return res.status(403).json({
        message: 'Accès refusé - Seuls les propriétaires ou admin peuvent modifier le statut',
      });
    }

    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Réservation non trouvée' });
    }

    // Si on renseigne ownerId dans le futur, on pourra vérifier ici que reservation.ownerId === user.userId

    const previousStatus = reservation.status;
    reservation.status = req.body.status;
    
    // Ajouter la raison si c'est un refus
    if (req.body.status === 'rejected' && req.body.reason) {
      reservation.rejectionReason = req.body.reason;
    }
    
    await reservation.save();

    // Envoyer les notifications appropriées
    const tenantInfo = await getUserInfo(reservation.tenantId);
    
    if (tenantInfo && previousStatus === 'pending') {
      // Récupérer les infos de la propriété
      try {
        const propertyResponse = await axios.get(`${config.propertyServiceUrl}/${reservation.propertyId}`);
        const property = propertyResponse.data?.data || propertyResponse.data;
        
        if (req.body.status === 'confirmed') {
          // Notification de confirmation
          const address = property.address 
            ? `${property.address.street}, ${property.address.city}` 
            : 'Adresse non disponible';
          notifyReservationConfirmed(
            tenantInfo.email,
            tenantInfo.firstName,
            property.title,
            address,
            formatDate(reservation.startDate),
            formatDate(reservation.endDate),
            reservation.totalPrice
          );
        } else if (req.body.status === 'rejected') {
          // Notification de refus avec raison
          notifyReservationRejected(
            tenantInfo.email,
            tenantInfo.firstName,
            property.title,
            formatDate(reservation.startDate),
            formatDate(reservation.endDate),
            req.body.reason || null
          );
        }
      } catch (err) {
        console.error('Erreur récupération propriété pour notification:', err.message);
      }
    }

    return res.status(200).json({ success: true, data: reservation });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut de la réservation:", error);
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: 'Erreur lors de la mise à jour du statut de la réservation',
      error: error.message,
    });
  }
};

// Annuler une réservation (owner ou tenant concerné)
exports.cancelReservation = async (req, res) => {
  try {
    const user = await verifyToken(req);
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Réservation non trouvée' });
    }

    // Vérifier que l'utilisateur est le propriétaire ou le locataire de cette réservation
    const isOwner = reservation.ownerId === user.userId;
    const isTenant = reservation.tenantId === user.userId;
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isTenant && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à annuler cette réservation',
      });
    }

    // On ne peut pas annuler une réservation déjà terminée
    if (reservation.status === 'cancelled' || reservation.status === 'rejected') {
      return res.status(400).json({
        success: false,
        message: 'Cette réservation est déjà annulée ou rejetée',
      });
    }

    reservation.status = 'cancelled';
    await reservation.save();

    // Envoyer notifications d'annulation aux deux parties
    try {
      const propertyResponse = await axios.get(`${config.propertyServiceUrl}/${reservation.propertyId}`);
      const property = propertyResponse.data?.data || propertyResponse.data;
      
      const cancelledBy = isTenant ? 'le locataire' : 'le propriétaire';
      
      // Notifier le locataire (si annulé par le proprio)
      if (isOwner && reservation.tenantId) {
        const tenantInfo = await getUserInfo(reservation.tenantId);
        if (tenantInfo) {
          notifyReservationCancelled(
            tenantInfo.email,
            tenantInfo.firstName,
            cancelledBy,
            property.title,
            formatDate(reservation.startDate),
            formatDate(reservation.endDate)
          );
        }
      }
      
      // Notifier le propriétaire (si annulé par le locataire)
      if (isTenant && reservation.ownerId) {
        const ownerInfo = await getUserInfo(reservation.ownerId);
        if (ownerInfo) {
          notifyReservationCancelled(
            ownerInfo.email,
            ownerInfo.firstName,
            cancelledBy,
            property.title,
            formatDate(reservation.startDate),
            formatDate(reservation.endDate)
          );
        }
      }
    } catch (err) {
      console.error('Erreur envoi notifications annulation:', err.message);
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Réservation annulée avec succès',
      data: reservation 
    });
  } catch (error) {
    console.error('Erreur lors de l\'annulation de la réservation:', error);
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: 'Erreur lors de l\'annulation de la réservation',
      error: error.message,
    });
  }
};

// Supprimer une réservation (owner ou admin uniquement)
exports.deleteReservation = async (req, res) => {
  try {
    const user = await verifyToken(req);
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Réservation non trouvée' });
    }

    // Seul le propriétaire ou l'admin peut supprimer
    const isOwner = reservation.ownerId === user.userId;
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Seul le propriétaire peut supprimer cette réservation',
      });
    }

    await Reservation.findByIdAndDelete(req.params.id);

    return res.status(200).json({ 
      success: true, 
      message: 'Réservation supprimée avec succès' 
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la réservation:', error);
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: 'Erreur lors de la suppression de la réservation',
      error: error.message,
    });
  }
};

// Récupérer toutes les réservations (pour admin)
exports.getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des réservations:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des réservations',
      error: error.message
    });
  }
};
