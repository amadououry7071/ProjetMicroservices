from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Any
from app.services.chatbot_engine import ChatbotEngine
from app.config import CHATBOT_PORT

app = FastAPI(
    title="Chatbot Service",
    description="Service de chatbot pour la plateforme de réservation",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Instance du chatbot
chatbot = ChatbotEngine()

class ChatRequest(BaseModel):
    message: str
    user_id: Optional[str] = None
    token: Optional[str] = None
    user_role: Optional[str] = None

class ChatResponse(BaseModel):
    intent: str
    message: str
    data: Optional[Any] = None
    actions: list = []

@app.get("/")
async def root():
    return {"status": "online", "service": "chatbot-service"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Endpoint principal pour discuter avec le chatbot"""
    try:
        response = await chatbot.process_message(
            message=request.message,
            user_id=request.user_id,
            token=request.token,
            user_role=request.user_role
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/chat/intents")
async def get_intents():
    """Liste les intentions supportées par le chatbot"""
    return {
        "intents": [
            {"name": "greeting", "examples": ["Bonjour", "Salut", "Hello"]},
            {"name": "help", "examples": ["Aide", "Help", "Comment faire"]},
            {"name": "list_properties", "examples": ["Voir les propriétés", "Liste des logements"]},
            {"name": "make_reservation", "examples": ["Je veux réserver", "Réserver"]},
            {"name": "my_reservations", "examples": ["Mes réservations", "Mon historique"]},
            {"name": "check_availability", "examples": ["Vérifier disponibilité", "Est-ce libre"]},
            {"name": "cancel_info", "examples": ["Comment annuler", "Annulation"]},
            {"name": "price_info", "examples": ["Prix", "Combien ça coûte"]},
            {"name": "reviews_info", "examples": ["Avis", "Commentaires"]},
            {"name": "account_info", "examples": ["Mon compte", "Inscription"]},
            {"name": "contact", "examples": ["Contact", "Support"]},
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=CHATBOT_PORT)
