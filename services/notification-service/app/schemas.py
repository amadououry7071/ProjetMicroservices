from pydantic import BaseModel, EmailStr
from typing import Optional


class WelcomeEmailRequest(BaseModel):
    email: EmailStr
    first_name: str
    role: str  # 'owner' or 'tenant'


class NewReservationEmailRequest(BaseModel):
    owner_email: EmailStr
    owner_name: str
    tenant_name: str
    property_title: str
    start_date: str
    end_date: str
    total_price: float


class ReservationConfirmedEmailRequest(BaseModel):
    tenant_email: EmailStr
    tenant_name: str
    property_title: str
    property_address: str
    start_date: str
    end_date: str
    total_price: float


class ReservationRejectedEmailRequest(BaseModel):
    tenant_email: EmailStr
    tenant_name: str
    property_title: str
    start_date: str
    end_date: str
    rejection_reason: Optional[str] = None


class ReservationCancelledEmailRequest(BaseModel):
    recipient_email: EmailStr
    recipient_name: str
    cancelled_by: str  # 'le locataire' or 'le propriétaire'
    property_title: str
    start_date: str
    end_date: str


class EmailResponse(BaseModel):
    success: bool
    message: str
