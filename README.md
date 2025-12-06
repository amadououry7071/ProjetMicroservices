# ProjetMicroservices

Architecture microservices pour une plateforme de réservation de propriétés.

## Services

| Service | Port | Description |
|---------|------|-------------|
| **api-gateway** | 3000 | Point d'entrée unique, routage des requêtes |
| **auth-service** | 3001 | Authentification et gestion des utilisateurs |
| **property-service** | 3002 | Gestion des propriétés |
| **reservation-service** | 3003 | Gestion des réservations |
| **review-service** | 3004 | Gestion des avis |
| **admin-service** | 3005 | Administration et logs |
| **notification-service** | 8000 | Envoi d'emails (Python/FastAPI) |
| **frontend** | 5173 | Interface utilisateur React |

## Technologies

- **Backend** : Node.js, Express, MongoDB
- **Frontend** : React, Vite, TailwindCSS
- **Notifications** : Python, FastAPI
- **Base de données** : MongoDB

## Installation

```bash
# Installer les dépendances de chaque service
cd api-gateway && npm install
cd ../services/auth-service && npm install
cd ../property-service && npm install
cd ../reservation-service && npm install
cd ../review-service && npm install
cd ../admin-service && npm install
cd ../../frontend && npm install

# Service de notification (Python)
cd ../services/notification-service
pip install -r requirements.txt
```

## Démarrage

Lancer chaque service dans un terminal séparé ou utiliser un outil comme `concurrently`.
