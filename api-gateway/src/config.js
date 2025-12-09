require('dotenv').config();

// Configuration minimale de l'API Gateway
const PORT = process.env.PORT || 3000;

// URLs des microservices
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
const PROPERTY_SERVICE_URL = process.env.PROPERTY_SERVICE_URL || 'http://localhost:3002';
const RESERVATION_SERVICE_URL = process.env.RESERVATION_SERVICE_URL || 'http://localhost:3003';
const REVIEW_SERVICE_URL = process.env.REVIEW_SERVICE_URL || 'http://localhost:3005';
const ADMIN_SERVICE_URL = process.env.ADMIN_SERVICE_URL || 'http://localhost:3006';
const CHATBOT_SERVICE_URL = process.env.CHATBOT_SERVICE_URL || 'http://localhost:8001';

module.exports = {
  PORT,
  AUTH_SERVICE_URL,
  PROPERTY_SERVICE_URL,
  RESERVATION_SERVICE_URL,
  REVIEW_SERVICE_URL,
  ADMIN_SERVICE_URL,
  CHATBOT_SERVICE_URL,
};
