const mongoose = require('mongoose');
const config = require('./config');

const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB réservation connecté: ${mongoose.connection.host}`);
  } catch (error) {
    console.error('Erreur de connexion MongoDB (reservation-service):', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
