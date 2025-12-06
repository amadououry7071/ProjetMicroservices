require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3006,
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/realestate_admin',
  jwtSecret: process.env.JWT_SECRET,
  nodeEnv: process.env.NODE_ENV || 'development',
  authServiceUrl: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  propertyServiceUrl: process.env.PROPERTY_SERVICE_URL || 'http://localhost:3002',
  reservationServiceUrl: process.env.RESERVATION_SERVICE_URL || 'http://localhost:3003',
  reviewServiceUrl: process.env.REVIEW_SERVICE_URL || 'http://localhost:3005'
};
