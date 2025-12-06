const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/database');
const config = require('./config/config');
const errorHandler = require('./middlewares/errorHandler');
const User = require('./models/user.model');

// Fonction pour créer le compte admin par défaut
const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (!adminExists) {
      await User.create({
        email: 'admin@realestate.com',
        password: 'Aliou123!',
        firstName: 'Aliou',
        lastName: 'Admin',
        role: 'admin',
        phone: '',
        isActive: true
      });
      console.log('✅ Compte admin créé avec succès (Aliou / Aliou123!)');
    } else {
      console.log('ℹ️  Compte admin existant');
    }
  } catch (error) {
    console.error('❌ Erreur lors de la création du compte admin:', error.message);
  }
};

// Initialisation de l'application Express
const app = express();

// Connexion à la base de données puis création admin
connectDB().then(() => {
  seedAdmin();
});

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: config.nodeEnv === 'development' ? 'http://localhost:3000' : config.frontendUrl,
  credentials: true,
}));
app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));

// Route de test
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenue sur le service d\'authentification' });
});

// Gestion des erreurs
app.use(errorHandler);

// Gestion des 404
app.all('*', (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `Impossible de trouver ${req.originalUrl} sur ce serveur!`
  });
});

// Démarrage du serveur
const PORT = config.port;
const server = app.listen(PORT, () => {
  console.log(`Service d'authentification en cours d'exécution sur le port ${PORT} en mode ${config.nodeEnv}`);
  console.log(`URL: http://localhost:${PORT}`);
});

// Gestion des erreurs non gérées
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('Process terminated!');
  });
});

module.exports = app;
