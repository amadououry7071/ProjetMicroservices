import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from jinja2 import Environment, FileSystemLoader
import os

from app.config import settings

# Configuration Jinja2 pour les templates
template_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "templates")
env = Environment(loader=FileSystemLoader(template_dir))


async def send_email(to_email: str, subject: str, html_content: str) -> bool:
    """Envoie un email via SMTP"""
    try:
        message = MIMEMultipart("alternative")
        message["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
        message["To"] = to_email
        message["Subject"] = subject
        
        html_part = MIMEText(html_content, "html")
        message.attach(html_part)
        
        await aiosmtplib.send(
            message,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USER,
            password=settings.SMTP_PASSWORD,
            start_tls=True,
        )
        
        print(f"✅ Email envoyé à {to_email}: {subject}")
        return True
        
    except Exception as e:
        print(f"❌ Erreur envoi email à {to_email}: {str(e)}")
        return False


async def send_welcome_email(to_email: str, first_name: str, role: str) -> bool:
    """Email de bienvenue après inscription"""
    template = env.get_template("welcome.html")
    html_content = template.render(
        first_name=first_name,
        role="propriétaire" if role == "owner" else "locataire",
        frontend_url=settings.FRONTEND_URL
    )
    return await send_email(to_email, "Bienvenue sur LocaHome ! 🏠", html_content)


async def send_new_reservation_email(
    to_email: str,
    owner_name: str,
    tenant_name: str,
    property_title: str,
    start_date: str,
    end_date: str,
    total_price: float
) -> bool:
    """Email au propriétaire quand un locataire fait une demande"""
    template = env.get_template("new_reservation.html")
    html_content = template.render(
        owner_name=owner_name,
        tenant_name=tenant_name,
        property_title=property_title,
        start_date=start_date,
        end_date=end_date,
        total_price=total_price,
        frontend_url=settings.FRONTEND_URL
    )
    return await send_email(to_email, f"Nouvelle demande de réservation - {property_title}", html_content)


async def send_reservation_confirmed_email(
    to_email: str,
    tenant_name: str,
    property_title: str,
    property_address: str,
    start_date: str,
    end_date: str,
    total_price: float
) -> bool:
    """Email au locataire quand sa réservation est confirmée"""
    template = env.get_template("reservation_confirmed.html")
    html_content = template.render(
        tenant_name=tenant_name,
        property_title=property_title,
        property_address=property_address,
        start_date=start_date,
        end_date=end_date,
        total_price=total_price,
        frontend_url=settings.FRONTEND_URL
    )
    return await send_email(to_email, f"Réservation confirmée - {property_title} ✅", html_content)


async def send_reservation_rejected_email(
    to_email: str,
    tenant_name: str,
    property_title: str,
    start_date: str,
    end_date: str,
    rejection_reason: str = None
) -> bool:
    """Email au locataire quand sa réservation est refusée"""
    template = env.get_template("reservation_rejected.html")
    html_content = template.render(
        tenant_name=tenant_name,
        property_title=property_title,
        start_date=start_date,
        end_date=end_date,
        rejection_reason=rejection_reason,
        frontend_url=settings.FRONTEND_URL
    )
    return await send_email(to_email, f"Réservation refusée - {property_title}", html_content)


async def send_reservation_cancelled_email(
    to_email: str,
    recipient_name: str,
    cancelled_by: str,
    property_title: str,
    start_date: str,
    end_date: str
) -> bool:
    """Email quand une réservation est annulée (au locataire et/ou propriétaire)"""
    template = env.get_template("reservation_cancelled.html")
    html_content = template.render(
        recipient_name=recipient_name,
        cancelled_by=cancelled_by,
        property_title=property_title,
        start_date=start_date,
        end_date=end_date,
        frontend_url=settings.FRONTEND_URL
    )
    return await send_email(to_email, f"Réservation annulée - {property_title}", html_content)
