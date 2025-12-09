import os
from dotenv import load_dotenv

load_dotenv()

PROPERTY_SERVICE_URL = os.getenv("PROPERTY_SERVICE_URL", "http://localhost:3002")
RESERVATION_SERVICE_URL = os.getenv("RESERVATION_SERVICE_URL", "http://localhost:3003")
AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://localhost:3001")
CHATBOT_PORT = int(os.getenv("CHATBOT_PORT", 8001))
