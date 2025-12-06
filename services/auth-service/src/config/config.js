require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3001,
  mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/realestate_auth',
  jwtSecret: process.env.JWT_SECRET || 'votre_clé_secrète_très_longue_et_sécurisée',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '30d',
  nodeEnv: process.env.NODE_ENV || 'development',
};
