import httpx
from app.config import PROPERTY_SERVICE_URL, RESERVATION_SERVICE_URL

async def get_all_properties():
    """Récupère toutes les propriétés disponibles"""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{PROPERTY_SERVICE_URL}/api/properties")
            if response.status_code == 200:
                result = response.json()
                # L'API retourne {success, count, data}
                return result.get("data", []) if isinstance(result, dict) else result
            return []
        except Exception as e:
            print(f"Erreur API propriétés: {e}")
            return []

async def get_property_by_id(property_id: str):
    """Récupère une propriété par son ID"""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{PROPERTY_SERVICE_URL}/api/properties/{property_id}")
            if response.status_code == 200:
                return response.json()
            return None
        except Exception as e:
            print(f"Erreur API propriété: {e}")
            return None

async def get_user_reservations(user_id: str, token: str):
    """Récupère les réservations d'un utilisateur"""
    async with httpx.AsyncClient() as client:
        try:
            headers = {"Authorization": f"Bearer {token}"}
            response = await client.get(
                f"{RESERVATION_SERVICE_URL}/api/reservations",
                headers=headers
            )
            if response.status_code == 200:
                result = response.json()
                return result.get("data", []) if isinstance(result, dict) else result
            return []
        except Exception as e:
            print(f"Erreur API réservations: {e}")
            return []

async def create_reservation(data: dict, token: str):
    """Crée une nouvelle réservation"""
    async with httpx.AsyncClient() as client:
        try:
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
            response = await client.post(
                f"{RESERVATION_SERVICE_URL}/api/reservations",
                json=data,
                headers=headers
            )
            return {
                "success": response.status_code == 201,
                "data": response.json() if response.status_code == 201 else None,
                "message": "Réservation créée avec succès!" if response.status_code == 201 else "Erreur lors de la réservation"
            }
        except Exception as e:
            print(f"Erreur création réservation: {e}")
            return {"success": False, "message": str(e)}

async def check_availability(property_id: str, check_in: str, check_out: str):
    """Vérifie la disponibilité d'une propriété"""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{RESERVATION_SERVICE_URL}/api/reservations/property/{property_id}"
            )
            if response.status_code == 200:
                reservations = response.json()
                # Vérifier s'il y a des conflits de dates
                for res in reservations:
                    if res.get("status") in ["confirmed", "pending"]:
                        res_start = res.get("checkIn", "")[:10]
                        res_end = res.get("checkOut", "")[:10]
                        if not (check_out <= res_start or check_in >= res_end):
                            return {"available": False, "message": "Cette propriété n'est pas disponible pour ces dates."}
                return {"available": True, "message": "La propriété est disponible!"}
            return {"available": True, "message": "Disponibilité non vérifiable, mais vous pouvez essayer."}
        except Exception as e:
            print(f"Erreur vérification disponibilité: {e}")
            return {"available": True, "message": "Impossible de vérifier la disponibilité."}

# ============ FONCTIONS ADMIN ============

async def delete_property(property_id: str, token: str):
    """Supprime une propriété (admin seulement)"""
    async with httpx.AsyncClient() as client:
        try:
            headers = {"Authorization": f"Bearer {token}"}
            response = await client.delete(
                f"{PROPERTY_SERVICE_URL}/api/properties/{property_id}",
                headers=headers
            )
            return {
                "success": response.status_code in [200, 204],
                "message": "Propriété supprimée avec succès!" if response.status_code in [200, 204] else "Erreur lors de la suppression"
            }
        except Exception as e:
            print(f"Erreur suppression propriété: {e}")
            return {"success": False, "message": str(e)}

async def get_all_reservations(token: str):
    """Récupère toutes les réservations (admin seulement)"""
    async with httpx.AsyncClient() as client:
        try:
            headers = {"Authorization": f"Bearer {token}"}
            response = await client.get(
                f"{RESERVATION_SERVICE_URL}/api/reservations/all",
                headers=headers
            )
            if response.status_code == 200:
                result = response.json()
                return result.get("data", []) if isinstance(result, dict) else result
            return []
        except Exception as e:
            print(f"Erreur API réservations: {e}")
            return []

async def delete_reservation(reservation_id: str, token: str):
    """Supprime une réservation (admin seulement)"""
    async with httpx.AsyncClient() as client:
        try:
            headers = {"Authorization": f"Bearer {token}"}
            response = await client.delete(
                f"{RESERVATION_SERVICE_URL}/api/reservations/{reservation_id}",
                headers=headers
            )
            return {
                "success": response.status_code in [200, 204],
                "message": "Réservation supprimée avec succès!" if response.status_code in [200, 204] else "Erreur lors de la suppression"
            }
        except Exception as e:
            print(f"Erreur suppression réservation: {e}")
            return {"success": False, "message": str(e)}
