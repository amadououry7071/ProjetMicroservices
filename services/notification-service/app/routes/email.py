from fastapi import APIRouter, HTTPException
from app.schemas import (
    WelcomeEmailRequest,
    NewReservationEmailRequest,
    ReservationConfirmedEmailRequest,
    ReservationRejectedEmailRequest,
    ReservationCancelledEmailRequest,
    EmailResponse
)
from app.services.email_service import (
    send_welcome_email,
    send_new_reservation_email,
    send_reservation_confirmed_email,
    send_reservation_rejected_email,
    send_reservation_cancelled_email
)

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])


@router.post("/welcome", response_model=EmailResponse)
async def send_welcome(request: WelcomeEmailRequest):
    """Envoie un email de bienvenue après inscription"""
    success = await send_welcome_email(
        to_email=request.email,
        first_name=request.first_name,
        role=request.role
    )
    
    if not success:
        raise HTTPException(status_code=500, detail="Erreur lors de l'envoi de l'email")
    
    return EmailResponse(success=True, message="Email de bienvenue envoyé")


@router.post("/new-reservation", response_model=EmailResponse)
async def send_new_reservation(request: NewReservationEmailRequest):
    """Notifie le propriétaire d'une nouvelle demande de réservation"""
    success = await send_new_reservation_email(
        to_email=request.owner_email,
        owner_name=request.owner_name,
        tenant_name=request.tenant_name,
        property_title=request.property_title,
        start_date=request.start_date,
        end_date=request.end_date,
        total_price=request.total_price
    )
    
    if not success:
        raise HTTPException(status_code=500, detail="Erreur lors de l'envoi de l'email")
    
    return EmailResponse(success=True, message="Notification envoyée au propriétaire")


@router.post("/reservation-confirmed", response_model=EmailResponse)
async def send_reservation_confirmed(request: ReservationConfirmedEmailRequest):
    """Notifie le locataire que sa réservation est confirmée"""
    success = await send_reservation_confirmed_email(
        to_email=request.tenant_email,
        tenant_name=request.tenant_name,
        property_title=request.property_title,
        property_address=request.property_address,
        start_date=request.start_date,
        end_date=request.end_date,
        total_price=request.total_price
    )
    
    if not success:
        raise HTTPException(status_code=500, detail="Erreur lors de l'envoi de l'email")
    
    return EmailResponse(success=True, message="Email de confirmation envoyé au locataire")


@router.post("/reservation-rejected", response_model=EmailResponse)
async def send_reservation_rejected(request: ReservationRejectedEmailRequest):
    """Notifie le locataire que sa réservation est refusée (avec raison optionnelle)"""
    success = await send_reservation_rejected_email(
        to_email=request.tenant_email,
        tenant_name=request.tenant_name,
        property_title=request.property_title,
        start_date=request.start_date,
        end_date=request.end_date,
        rejection_reason=request.rejection_reason
    )
    
    if not success:
        raise HTTPException(status_code=500, detail="Erreur lors de l'envoi de l'email")
    
    return EmailResponse(success=True, message="Email de refus envoyé au locataire")


@router.post("/reservation-cancelled", response_model=EmailResponse)
async def send_reservation_cancelled(request: ReservationCancelledEmailRequest):
    """Notifie qu'une réservation a été annulée"""
    success = await send_reservation_cancelled_email(
        to_email=request.recipient_email,
        recipient_name=request.recipient_name,
        cancelled_by=request.cancelled_by,
        property_title=request.property_title,
        start_date=request.start_date,
        end_date=request.end_date
    )
    
    if not success:
        raise HTTPException(status_code=500, detail="Erreur lors de l'envoi de l'email")
    
    return EmailResponse(success=True, message="Email d'annulation envoyé")
