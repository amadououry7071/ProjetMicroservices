from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app.config import settings
from app.routes.email import router as email_router

app = FastAPI(
    title="Notification Service",
    description="Service de notifications par email pour LocaHome",
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

# Routes
app.include_router(email_router)


@app.get("/")
async def root():
    return {
        "service": "notification-service",
        "status": "running",
        "version": "1.0.0"
    }


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "notification-service"
    }


if __name__ == "__main__":
    print(f"🚀 Notification Service démarré sur le port {settings.PORT}")
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.PORT, reload=True)
