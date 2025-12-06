require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3003,
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/realestate_reservations',
  jwtSecret: process.env.JWT_SECRET,
  nodeEnv: process.env.NODE_ENV || 'development',
  authServiceUrl: process.env.AUTH_SERVICE_URL || 'http://localhost:3001/api/auth/verify',
  propertyServiceUrl: process.env.PROPERTY_SERVICE_URL || 'http://localhost:3002/api/properties'
};
