const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const {
  AUTH_SERVICE_URL,
  PROPERTY_SERVICE_URL,
  RESERVATION_SERVICE_URL,
  REVIEW_SERVICE_URL,
  ADMIN_SERVICE_URL,
} = require('../config');

const router = express.Router();

// Santé de la gateway (préfixée par /api)
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', via: 'api-gateway' });
});

// Configuration commune pour les proxies
const proxyOptions = {
  changeOrigin: true,
  timeout: 30000,
  proxyTimeout: 30000,
  onProxyReq: (proxyReq, req) => {
    // Transmettre le header Authorization
    if (req.headers.authorization) {
      proxyReq.setHeader('Authorization', req.headers.authorization);
    }
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err.message);
    res.status(502).json({ message: 'Service temporairement indisponible' });
  },
};

// Proxy Auth Service
router.use(
  '/auth',
  createProxyMiddleware({
    ...proxyOptions,
    target: AUTH_SERVICE_URL,
    pathRewrite: { '^/api/auth': '/api/auth' },
  })
);

// Proxy Reservations Service
router.use(
  '/reservations',
  createProxyMiddleware({
    ...proxyOptions,
    target: RESERVATION_SERVICE_URL,
    pathRewrite: { '^/api/reservations': '/api/reservations' },
  })
);

// Proxy Properties Service
router.use(
  '/properties',
  createProxyMiddleware({
    ...proxyOptions,
    target: PROPERTY_SERVICE_URL,
    pathRewrite: { '^/api/properties': '/api/properties' },
  })
);

// Proxy Reviews Service
router.use(
  '/reviews',
  createProxyMiddleware({
    ...proxyOptions,
    target: REVIEW_SERVICE_URL,
    pathRewrite: { '^/api/reviews': '/api/reviews' },
  })
);

// Proxy Admin Service
router.use(
  '/admin',
  createProxyMiddleware({
    ...proxyOptions,
    target: ADMIN_SERVICE_URL,
    pathRewrite: { '^/api/admin': '/api/admin' },
  })
);

module.exports = router;
