const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/database');
const config = require('./config/config');
const reservationRoutes = require('./routes/reservationRoutes');

const app = express();

// Connexion DB
connectDB();

// Middlewares
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// Routes
app.use('/api/reservations', reservationRoutes);

// 404
app.all('*', (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `Impossible de trouver ${req.originalUrl} sur ce serveur!`,
  });
});

const PORT = config.port;

app.listen(PORT, () => {
  console.log(
    `Service de réservation en cours d'exécution sur le port ${PORT} en mode ${config.nodeEnv}`
  );
});
