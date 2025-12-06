const mongoose = require('mongoose');
const config = require('./config');

// Configuration des logs Mongoose
mongoose.set('debug', config.nodeEnv === 'development');
mongoose.set('strictQuery', false);

const connectDB = async () => {
  try {
    console.log('🔍 Tentative de connexion à MongoDB...');
    console.log('📡 URL de connexion:', config.mongoURI);
    
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // 10 secondes
      socketTimeoutMS: 45000, // 45 secondes
      connectTimeoutMS: 10000, // 10 secondes
      family: 4, // Forcer IPv4
      retryWrites: true,
      w: 'majority'
    };

    console.log('⚙️  Options de connexion:', JSON.stringify(options, null, 2));
    
    const conn = await mongoose.connect(config.mongoURI, options);

    console.log(`✅ MongoDB connecté avec succès!`);
    console.log(`📡 Hôte: ${conn.connection.host}`);
    console.log(`📊 Base de données: ${conn.connection.name}`);
    console.log(`🔄 État de la connexion: ${mongoose.connection.readyState === 1 ? 'Connecté' : 'Non connecté'}`);
    
    return conn;
  } catch (error) {
    console.error('❌ ERREUR: Échec de la connexion à MongoDB');
    console.error('📌 Détails de l\'erreur:');
    console.error('- Message:', error.message);
    console.error('- Code:', error.code);
    console.error('- Code Name:', error.codeName);
    console.error('- Stack:', error.stack);
    
    // Vérification de la connectivité réseau
    console.log('\n🔍 Vérification de la connectivité réseau...');
    
    process.exit(1);
  }
};

// Gestion des événements de connexion
mongoose.connection.on('connected', () => {
  console.log('✅ Événement: Connecté à MongoDB');});

mongoose.connection.on('error', (err) => {
  console.error('❌ Erreur de connexion MongoDB:', err);});

mongoose.connection.on('disconnected', () => {
  console.log('ℹ️  Déconnecté de MongoDB');});

// Gestion de la fermeture du processus
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('\n👋 Connexion MongoDB fermée suite à la fin de l\'application');
  process.exit(0);
});

module.exports = connectDB;
