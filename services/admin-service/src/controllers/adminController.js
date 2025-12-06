const axios = require('axios');
const jwt = require('jsonwebtoken');
const AdminLog = require('../models/AdminLog');
const config = require('../config/config');

// Vérifier si l'utilisateur est admin
const verifyAdmin = async (req) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  try {
    // Utiliser la route /verify qui retourne les infos de l'utilisateur
    const response = await axios.get(`${config.authServiceUrl}/api/auth/verify`, {
      headers: { Authorization: authHeader }
    });
    
    const userData = response.data;
    
    // Vérifier le rôle admin
    if (userData.role !== 'admin') {
      return null;
    }
    
    // Retourner un objet utilisateur avec les infos disponibles
    return {
      _id: userData.userId,
      email: userData.email,
      role: userData.role,
      firstName: 'Admin',
      lastName: ''
    };
  } catch (error) {
    console.error('Erreur de vérification admin:', error.message);
    return null;
  }
};

// Créer un log d'action admin
const createLog = async (admin, action, targetType, targetId, targetName = '', reason = '') => {
  try {
    await AdminLog.create({
      adminId: admin._id,
      adminName: `${admin.firstName} ${admin.lastName}`,
      action,
      targetType,
      targetId,
      targetName,
      reason
    });
  } catch (error) {
    console.error('Erreur création log:', error.message);
  }
};

// ==================== STATISTIQUES ====================

exports.getStats = async (req, res) => {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return res.status(403).json({ success: false, message: 'Accès refusé - Admin uniquement' });
    }

    const authHeader = { headers: { Authorization: req.headers.authorization } };

    // Récupérer les stats depuis chaque service
    const [usersRes, propertiesRes, reservationsRes, reviewsRes] = await Promise.allSettled([
      axios.get(`${config.authServiceUrl}/api/auth/users`, authHeader),
      axios.get(`${config.propertyServiceUrl}/api/properties`),
      axios.get(`${config.reservationServiceUrl}/api/reservations/all`),
      axios.get(`${config.reviewServiceUrl}/api/reviews`)
    ]);

    // Debug logs pour identifier les problèmes
    if (usersRes.status === 'rejected') console.log('Users error:', usersRes.reason?.message);
    if (propertiesRes.status === 'rejected') console.log('Properties error:', propertiesRes.reason?.message);
    if (reservationsRes.status === 'rejected') console.log('Reservations error:', reservationsRes.reason?.message);
    if (reviewsRes.status === 'rejected') console.log('Reviews error:', reviewsRes.reason?.message);

    const stats = {
      totalUsers: usersRes.status === 'fulfilled' ? (usersRes.value.data.data?.users?.length || 0) : 0,
      totalProperties: propertiesRes.status === 'fulfilled' ? (propertiesRes.value.data.count || 0) : 0,
      totalReservations: reservationsRes.status === 'fulfilled' ? (reservationsRes.value.data.count || 0) : 0,
      totalReviews: reviewsRes.status === 'fulfilled' ? (reviewsRes.value.data.count || 0) : 0
    };

    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    console.error('Erreur stats:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des statistiques' });
  }
};

// ==================== GESTION DES UTILISATEURS ====================

exports.getAllUsers = async (req, res) => {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return res.status(403).json({ success: false, message: 'Accès refusé - Admin uniquement' });
    }

    const response = await axios.get(`${config.authServiceUrl}/api/auth/users`, {
      headers: { Authorization: req.headers.authorization }
    });
    
    res.status(200).json({
      success: true,
      count: response.data.data.users.length,
      data: response.data.data.users
    });
  } catch (error) {
    console.error('Erreur getAllUsers:', error.message);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des utilisateurs' });
  }
};

exports.banUser = async (req, res) => {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return res.status(403).json({ success: false, message: 'Accès refusé - Admin uniquement' });
    }

    const { id } = req.params;
    const { reason } = req.body;

    // Empêcher l'admin de se bannir lui-même
    if (id === admin._id.toString()) {
      return res.status(400).json({ success: false, message: 'Vous ne pouvez pas vous bannir vous-même' });
    }

    const response = await axios.put(
      `${config.authServiceUrl}/api/auth/users/${id}/ban`,
      { reason },
      { headers: { Authorization: req.headers.authorization } }
    );

    await createLog(admin, 'BAN_USER', 'user', id, response.data.data?.user?.email || '', reason);

    res.status(200).json({ success: true, message: 'Utilisateur banni avec succès', data: response.data.data });
  } catch (error) {
    console.error('Erreur banUser:', error.message);
    res.status(500).json({ success: false, message: error.response?.data?.message || 'Erreur lors du bannissement' });
  }
};

exports.unbanUser = async (req, res) => {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return res.status(403).json({ success: false, message: 'Accès refusé - Admin uniquement' });
    }

    const { id } = req.params;

    const response = await axios.put(
      `${config.authServiceUrl}/api/auth/users/${id}/unban`,
      {},
      { headers: { Authorization: req.headers.authorization } }
    );

    await createLog(admin, 'UNBAN_USER', 'user', id, response.data.data?.user?.email || '');

    res.status(200).json({ success: true, message: 'Utilisateur débanni avec succès', data: response.data.data });
  } catch (error) {
    console.error('Erreur unbanUser:', error.message);
    res.status(500).json({ success: false, message: error.response?.data?.message || 'Erreur lors du débannissement' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return res.status(403).json({ success: false, message: 'Accès refusé - Admin uniquement' });
    }

    const { id } = req.params;
    const { reason } = req.body;

    // Empêcher l'admin de se supprimer lui-même
    if (id === admin._id.toString()) {
      return res.status(400).json({ success: false, message: 'Vous ne pouvez pas supprimer votre propre compte' });
    }

    // Récupérer les infos de l'utilisateur avant suppression
    const userRes = await axios.get(`${config.authServiceUrl}/api/auth/users/${id}`, {
      headers: { Authorization: req.headers.authorization }
    });
    const userName = userRes.data.data?.user?.email || '';

    await axios.delete(
      `${config.authServiceUrl}/api/auth/users/${id}`,
      { headers: { Authorization: req.headers.authorization } }
    );

    await createLog(admin, 'DELETE_USER', 'user', id, userName, reason);

    res.status(200).json({ success: true, message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error('Erreur deleteUser:', error.message);
    res.status(500).json({ success: false, message: error.response?.data?.message || 'Erreur lors de la suppression' });
  }
};

// ==================== GESTION DES PROPRIÉTÉS ====================

exports.getAllProperties = async (req, res) => {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return res.status(403).json({ success: false, message: 'Accès refusé - Admin uniquement' });
    }

    const response = await axios.get(`${config.propertyServiceUrl}/api/properties`);
    
    res.status(200).json({
      success: true,
      count: response.data.count,
      data: response.data.data
    });
  } catch (error) {
    console.error('Erreur getAllProperties:', error.message);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des propriétés' });
  }
};

exports.deleteProperty = async (req, res) => {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return res.status(403).json({ success: false, message: 'Accès refusé - Admin uniquement' });
    }

    const { id } = req.params;
    const { reason } = req.body;

    // Récupérer les infos de la propriété avant suppression
    const propRes = await axios.get(`${config.propertyServiceUrl}/api/properties/${id}`);
    const propTitle = propRes.data.data?.title || '';

    await axios.delete(
      `${config.propertyServiceUrl}/api/properties/${id}`,
      { headers: { Authorization: req.headers.authorization } }
    );

    await createLog(admin, 'DELETE_PROPERTY', 'property', id, propTitle, reason);

    res.status(200).json({ success: true, message: 'Propriété supprimée avec succès' });
  } catch (error) {
    console.error('Erreur deleteProperty:', error.message);
    res.status(500).json({ success: false, message: error.response?.data?.message || 'Erreur lors de la suppression' });
  }
};

// ==================== GESTION DES AVIS ====================

exports.getAllReviews = async (req, res) => {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return res.status(403).json({ success: false, message: 'Accès refusé - Admin uniquement' });
    }

    const response = await axios.get(`${config.reviewServiceUrl}/api/reviews`);
    
    res.status(200).json({
      success: true,
      count: response.data.count,
      data: response.data.data
    });
  } catch (error) {
    console.error('Erreur getAllReviews:', error.message);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des avis' });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return res.status(403).json({ success: false, message: 'Accès refusé - Admin uniquement' });
    }

    const { id } = req.params;
    const { reason } = req.body;

    await axios.delete(
      `${config.reviewServiceUrl}/api/reviews/${id}`,
      { headers: { Authorization: req.headers.authorization } }
    );

    await createLog(admin, 'DELETE_REVIEW', 'review', id, '', reason);

    res.status(200).json({ success: true, message: 'Avis supprimé avec succès' });
  } catch (error) {
    console.error('Erreur deleteReview:', error.message);
    res.status(500).json({ success: false, message: error.response?.data?.message || 'Erreur lors de la suppression' });
  }
};

// ==================== GESTION DES RÉSERVATIONS ====================

exports.getAllReservations = async (req, res) => {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return res.status(403).json({ success: false, message: 'Accès refusé - Admin uniquement' });
    }

    const response = await axios.get(`${config.reservationServiceUrl}/api/reservations/all`);
    
    res.status(200).json({
      success: true,
      count: response.data.count,
      data: response.data.data
    });
  } catch (error) {
    console.error('Erreur getAllReservations:', error.message);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des réservations' });
  }
};

exports.deleteReservation = async (req, res) => {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return res.status(403).json({ success: false, message: 'Accès refusé - Admin uniquement' });
    }

    const { id } = req.params;
    const reason = req.body?.reason || '';

    const url = `${config.reservationServiceUrl}/api/reservations/${id}`;

    await axios.delete(url, { 
      headers: { Authorization: req.headers.authorization } 
    });

    await createLog(admin, 'DELETE_RESERVATION', 'reservation', id, '', reason);

    res.status(200).json({ success: true, message: 'Réservation supprimée avec succès' });
  } catch (error) {
    console.error('Erreur deleteReservation:', error.response?.status, error.response?.data || error.message);
    res.status(500).json({ success: false, message: error.response?.data?.message || 'Erreur lors de la suppression' });
  }
};

// ==================== LOGS ====================

exports.getLogs = async (req, res) => {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return res.status(403).json({ success: false, message: 'Accès refusé - Admin uniquement' });
    }

    const logs = await AdminLog.find().sort({ createdAt: -1 }).limit(100);

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    console.error('Erreur getLogs:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des logs' });
  }
};
