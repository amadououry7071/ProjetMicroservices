const axios = require('axios');

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
const PROPERTY_SERVICE_URL = process.env.PROPERTY_SERVICE_URL || 'http://localhost:3002';

/**
 * Récupère les infos d'un utilisateur par son ID
 */
const getUserById = async (userId, token) => {
  try {
    const response = await axios.get(`${AUTH_SERVICE_URL}/api/auth/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data?.user || null;
  } catch (error) {
    console.error(`Erreur récupération utilisateur ${userId}: ${error.message}`);
    return null;
  }
};

/**
 * Récupère les infos d'une propriété par son ID
 */
const getPropertyById = async (propertyId) => {
  try {
    const response = await axios.get(`${PROPERTY_SERVICE_URL}/api/properties/${propertyId}`);
    return response.data.data || null;
  } catch (error) {
    console.error(`Erreur récupération propriété ${propertyId}: ${error.message}`);
    return null;
  }
};

module.exports = {
  getUserById,
  getPropertyById
};
