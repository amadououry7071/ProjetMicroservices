# Notification Service (Python)

Service de notifications par email pour LocaHome.

## Installation

```bash
cd services/notification-service

# Créer un environnement virtuel
python -m venv venv

# Activer l'environnement virtuel
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Installer les dépendances
pip install -r requirements.txt
```

## Configuration

Copier `.env.example` vers `.env` et configurer :

```env
PORT=3004

# Gmail (activer "Mots de passe d'application" dans les paramètres Google)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASSWORD=votre-mot-de-passe-app

SMTP_FROM_NAME=LocaHome
SMTP_FROM_EMAIL=noreply@locahome.com

FRONTEND_URL=http://localhost:3005
```

### Configuration Gmail

1. Aller sur https://myaccount.google.com/security
2. Activer la validation en 2 étapes
3. Créer un "Mot de passe d'application" pour "Mail"
4. Utiliser ce mot de passe dans `SMTP_PASSWORD`

## Démarrage

```bash
python -m app.main
```

Ou avec uvicorn directement :

```bash
uvicorn app.main:app --reload --port 3004
```

## API Endpoints

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/health` | Vérifier l'état du service |
| POST | `/api/notifications/welcome` | Email de bienvenue |
| POST | `/api/notifications/new-reservation` | Nouvelle demande (au proprio) |
| POST | `/api/notifications/reservation-confirmed` | Confirmation (au locataire) |
| POST | `/api/notifications/reservation-rejected` | Refus avec raison (au locataire) |
| POST | `/api/notifications/reservation-cancelled` | Annulation |

## Documentation API

Une fois démarré, accéder à :
- Swagger UI : http://localhost:3004/docs
- ReDoc : http://localhost:3004/redoc
