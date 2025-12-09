const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { PORT } = require('./config');
const apiRoutes = require('./routes');

const app = express();

// CORS doit être avant tout
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3005', 'http://127.0.0.1:3005'],
  credentials: true,
}));
app.use(morgan('dev'));

// IMPORTANT: Ne PAS utiliser express.json() ici car le proxy doit recevoir le body brut
// Les microservices parseront le JSON eux-mêmes

// Santé de la gateway
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'api-gateway',
  });
});

// Routes principales
app.use('/api', apiRoutes);

// Gestion simple des 404
app.use((req, res) => {
  res.status(404).json({ message: 'Route non trouvée via API Gateway' });
});

const server = app.listen(PORT, () => {
  console.log(`API Gateway démarrée sur le port ${PORT}`);
});

module.exports = app;
