import re
from typing import Optional, Tuple
from app.services import api_client

class ChatbotEngine:
    """Moteur de chatbot pour la plateforme de réservation"""
    
    def __init__(self):
        self.context = {}
    
    def parse_reservation_request(self, message: str) -> Tuple[Optional[str], Optional[str], Optional[str]]:
        """Extrait l'ID de propriété et les dates d'un message de réservation"""
        date_pattern = r'(\d{4}-\d{2}-\d{2})'
        dates = re.findall(date_pattern, message)
        
        id_pattern = r'([a-fA-F0-9]{24})'
        ids = re.findall(id_pattern, message)
        
        property_id = ids[0] if ids else None
        check_in = dates[0] if len(dates) >= 1 else None
        check_out = dates[1] if len(dates) >= 2 else None
        
        return property_id, check_in, check_out
    
    def extract_id(self, message: str) -> Optional[str]:
        """Extrait un ID MongoDB du message"""
        id_pattern = r'([a-fA-F0-9]{24})'
        ids = re.findall(id_pattern, message)
        return ids[0] if ids else None
        
    def detect_intent(self, message: str, user_role: Optional[str] = None) -> str:
        """Détecte l'intention de l'utilisateur - uniquement questions liées au site"""
        message_lower = message.lower()
        
        # ============ INTENTIONS COMMUNES ============
        
        # Salutations
        if any(word in message_lower for word in ["bonjour", "salut", "hello", "hi", "hey", "bonsoir"]):
            return "greeting"
        
        # Aide
        if any(word in message_lower for word in ["aide", "help", "aider", "quoi faire", "que peux-tu", "que peux tu", "commandes"]):
            return "help"
        
        # Fonctionnement du site
        if any(phrase in message_lower for phrase in ["comment fonctionne", "comment ça marche", "comment ca marche", "c'est quoi", "qu'est-ce que", "présentation", "presentation", "fonctionnement", "à quoi sert", "a quoi sert", "expliquer le site", "explique le site"]):
            return "site_info"
        
        # Remerciement
        if any(word in message_lower for word in ["merci", "thanks", "parfait", "super", "génial", "excellent"]):
            return "thanks"
        
        # Au revoir
        if any(word in message_lower for word in ["bye", "au revoir", "à bientôt", "ciao", "bonne journée", "bonne nuit"]):
            return "goodbye"
        
        # ============ PROPRIÉTÉS ============
        
        # Voir les propriétés
        if any(word in message_lower for word in ["propriété", "propriétés", "proprietes", "logement", "logements", "appartement", "maison", "liste", "voir les", "afficher"]):
            if "supprimer" in message_lower or "effacer" in message_lower or "delete" in message_lower:
                return "admin_delete_property"
            return "list_properties"
        
        # ============ RÉSERVATIONS ============
        
        # Mes réservations (locataire)
        if any(word in message_lower for word in ["mes réservation", "mes reservation", "mes reservations", "mes réservations", "mon historique", "mes locations"]):
            return "my_reservations"
        
        # Voir toutes les réservations (admin)
        if ("toutes" in message_lower or "all" in message_lower or "tout" in message_lower) and ("réservation" in message_lower or "reservation" in message_lower):
            return "admin_all_reservations"
        
        # Supprimer réservation (admin)
        if ("supprimer" in message_lower or "effacer" in message_lower or "delete" in message_lower or "annuler" in message_lower) and ("réservation" in message_lower or "reservation" in message_lower):
            return "admin_delete_reservation"
        
        # Réserver
        if any(word in message_lower for word in ["réserver", "reserver", "reservation", "réservation", "book", "louer"]):
            return "make_reservation"
        
        # ============ VÉRIFIER SI C'EST UNE RÉSERVATION DIRECTE ============
        
        property_id, check_in, check_out = self.parse_reservation_request(message)
        if property_id and check_in and check_out:
            return "create_reservation"
        
        # ============ SUPPRESSION AVEC ID ============
        
        if self.extract_id(message) and ("supprimer" in message_lower or "effacer" in message_lower or "delete" in message_lower):
            if "réservation" in message_lower or "reservation" in message_lower:
                return "admin_delete_reservation"
            else:
                return "admin_delete_property"
        
        # ============ INFORMATIONS SUR LE SITE ============
        
        # Prix
        if any(word in message_lower for word in ["prix", "coût", "cout", "tarif", "combien", "payer", "paiement"]):
            return "price_info"
        
        # Annulation
        if any(word in message_lower for word in ["annuler", "annulation", "cancel", "rembours"]):
            return "cancel_info"
        
        # Avis
        if any(word in message_lower for word in ["avis", "review", "commentaire", "note", "évaluation", "evaluation"]):
            return "reviews_info"
        
        # Compte
        if any(word in message_lower for word in ["compte", "profil", "inscription", "connexion", "mot de passe", "password", "login", "signup"]):
            return "account_info"
        
        # Contact
        if any(word in message_lower for word in ["contact", "contacter", "téléphone", "telephone", "email", "support", "joindre"]):
            return "contact"
        
        # ============ QUESTION HORS SUJET ============
        return "out_of_scope"
    
    async def process_message(self, message: str, user_id: Optional[str] = None, token: Optional[str] = None, user_role: Optional[str] = None) -> dict:
        """Traite un message et retourne une réponse"""
        intent = self.detect_intent(message, user_role)
        
        response = {
            "intent": intent,
            "message": "",
            "data": None,
            "actions": []
        }
        
        # ============ SALUTATIONS ============
        if intent == "greeting":
            if user_role == "admin":
                response["message"] = "👋 Bonjour Administrateur! Je peux vous aider à:\n\n• Voir toutes les propriétés\n• Supprimer une propriété\n• Voir toutes les réservations\n• Supprimer une réservation\n\nTapez 'aide' pour voir les commandes."
            else:
                response["message"] = "👋 Bonjour! Je suis l'assistant de réservation. Je peux vous aider à:\n\n• Voir les propriétés disponibles\n• Faire une réservation\n• Consulter vos réservations\n\nTapez 'aide' pour voir les commandes."
        
        # ============ AIDE ============
        elif intent == "help":
            if user_role == "admin":
                response["message"] = """🤖 **Commandes Admin:**

📋 **Propriétés**
• "Voir les propriétés" - Liste toutes les propriétés
• "Supprimer propriété [ID]" - Supprime une propriété

📅 **Réservations**
• "Toutes les réservations" - Liste toutes les réservations
• "Supprimer réservation [ID]" - Supprime une réservation

💡 Exemple: "Supprimer propriété 507f1f77bcf86cd799439011" """
            else:
                response["message"] = """🤖 **Commandes disponibles:**

📋 **Propriétés**
• "Voir les propriétés" - Liste les propriétés disponibles

📅 **Réservations**
• "Réserver [ID] [date-début] [date-fin]" - Faire une réservation
• "Mes réservations" - Voir vos réservations

💡 Exemple: "Réserver 507f1f77bcf86cd799439011 2024-01-15 2024-01-20" """
        
        # ============ INFO SUR LE SITE ============
        elif intent == "site_info":
            response["message"] = """🏠 **Bienvenue sur notre plateforme de réservation!**

**Comment ça marche:**

1️⃣ **Parcourez les propriétés**
   Tapez "voir les propriétés" pour découvrir les logements disponibles

2️⃣ **Réservez un logement**
   Choisissez vos dates et réservez en ligne instantanément

3️⃣ **Gérez vos réservations**
   Consultez et gérez vos réservations depuis votre compte

**Types d'utilisateurs:**
• 👤 **Locataire** - Réservez des propriétés
• 🏠 **Propriétaire** - Publiez vos logements

Tapez 'aide' pour voir les commandes disponibles!"""
        
        # ============ LISTER PROPRIÉTÉS ============
        elif intent == "list_properties":
            properties = await api_client.get_all_properties()
            if properties:
                prop_list = "\n".join([
                    f"🏠 **{p.get('title', 'Sans titre')}** - {p.get('price', 'N/A')}$/nuit\n   📍 {p.get('location', 'Non spécifié')}\n   🔑 ID: `{p.get('_id', 'N/A')}`"
                    for p in properties[:10]
                ])
                response["message"] = f"📋 **Propriétés disponibles:**\n\n{prop_list}"
                response["data"] = properties[:10]
            else:
                response["message"] = "😕 Aucune propriété disponible pour le moment."
        
        # ============ MES RÉSERVATIONS (LOCATAIRE) ============
        elif intent == "my_reservations":
            if not user_id or not token:
                response["message"] = "🔐 Vous devez être connecté pour voir vos réservations."
                response["actions"] = ["login_required"]
            else:
                reservations = await api_client.get_user_reservations(user_id, token)
                if reservations:
                    res_list = "\n".join([
                        f"📅 **Réservation** `{r.get('_id', 'N/A')[:8]}...`\n   Du {str(r.get('startDate', 'N/A'))[:10]} au {str(r.get('endDate', 'N/A'))[:10]}\n   Statut: {r.get('status', 'N/A')}"
                        for r in reservations[:10]
                    ])
                    response["message"] = f"📋 **Vos réservations:**\n\n{res_list}"
                    response["data"] = reservations
                else:
                    response["message"] = "📭 Vous n'avez aucune réservation pour le moment."
        
        # ============ FAIRE UNE RÉSERVATION ============
        elif intent == "make_reservation":
            response["message"] = """📅 **Pour réserver, envoyez:**

`[ID propriété] [date-arrivée] [date-départ]`

📝 Format des dates: AAAA-MM-JJ

💡 Exemple: `507f1f77bcf86cd799439011 2024-01-15 2024-01-20`

Tapez "voir les propriétés" pour obtenir les IDs."""
        
        # ============ CRÉER RÉSERVATION DIRECTE ============
        elif intent == "create_reservation":
            property_id, check_in, check_out = self.parse_reservation_request(message)
            
            if not user_id or not token:
                response["message"] = "🔐 Vous devez être connecté pour réserver.\n\nConnectez-vous puis réessayez!"
                response["actions"] = ["login_required"]
            else:
                availability = await api_client.check_availability(property_id, check_in, check_out)
                
                if not availability.get("available", True):
                    response["message"] = f"❌ {availability.get('message', 'Propriété non disponible pour ces dates.')}"
                else:
                    reservation_data = {
                        "propertyId": property_id,
                        "startDate": check_in,
                        "endDate": check_out
                    }
                    result = await api_client.create_reservation(reservation_data, token)
                    
                    if result.get("success"):
                        response["message"] = f"✅ **Réservation créée!**\n\n📅 Du {check_in} au {check_out}\n🏠 Propriété: `{property_id[:8]}...`\n\nTapez 'mes réservations' pour voir vos réservations."
                        response["data"] = result.get("data")
                    else:
                        response["message"] = f"❌ Erreur: {result.get('message', 'Erreur inconnue')}"
        
        # ============ ADMIN: TOUTES LES RÉSERVATIONS ============
        elif intent == "admin_all_reservations":
            if user_role != "admin":
                response["message"] = "🚫 Cette commande est réservée aux administrateurs."
            elif not token:
                response["message"] = "🔐 Vous devez être connecté."
            else:
                reservations = await api_client.get_all_reservations(token)
                if reservations:
                    res_list = "\n".join([
                        f"📅 `{r.get('_id', 'N/A')}`\n   Du {str(r.get('startDate', 'N/A'))[:10]} au {str(r.get('endDate', 'N/A'))[:10]} | Statut: {r.get('status', 'N/A')}"
                        for r in reservations[:15]
                    ])
                    response["message"] = f"📋 **Toutes les réservations:**\n\n{res_list}\n\n💡 Pour supprimer: `supprimer réservation [ID]`"
                    response["data"] = reservations
                else:
                    response["message"] = "📭 Aucune réservation dans le système."
        
        # ============ ADMIN: SUPPRIMER PROPRIÉTÉ ============
        elif intent == "admin_delete_property":
            if user_role != "admin":
                response["message"] = "🚫 Cette commande est réservée aux administrateurs."
            elif not token:
                response["message"] = "🔐 Vous devez être connecté."
            else:
                property_id = self.extract_id(message)
                if not property_id:
                    response["message"] = "❌ Veuillez spécifier l'ID de la propriété à supprimer.\n\n💡 Exemple: `supprimer propriété 507f1f77bcf86cd799439011`"
                else:
                    result = await api_client.delete_property(property_id, token)
                    if result.get("success"):
                        response["message"] = f"✅ Propriété `{property_id[:8]}...` supprimée avec succès!"
                    else:
                        response["message"] = f"❌ Erreur: {result.get('message', 'Impossible de supprimer')}"
        
        # ============ ADMIN: SUPPRIMER RÉSERVATION ============
        elif intent == "admin_delete_reservation":
            if user_role != "admin":
                response["message"] = "🚫 Cette commande est réservée aux administrateurs."
            elif not token:
                response["message"] = "🔐 Vous devez être connecté."
            else:
                reservation_id = self.extract_id(message)
                if not reservation_id:
                    response["message"] = "❌ Veuillez spécifier l'ID de la réservation à supprimer.\n\n💡 Exemple: `supprimer réservation 507f1f77bcf86cd799439011`"
                else:
                    result = await api_client.delete_reservation(reservation_id, token)
                    if result.get("success"):
                        response["message"] = f"✅ Réservation `{reservation_id[:8]}...` supprimée avec succès!"
                    else:
                        response["message"] = f"❌ Erreur: {result.get('message', 'Impossible de supprimer')}"
        
        # ============ INFORMATIONS ============
        elif intent == "price_info":
            response["message"] = """💰 **Informations sur les prix:**

• Les prix affichés sont **par nuit**
• Des frais de service de 10% s'appliquent
• Le paiement se fait à la réservation

Consultez une propriété pour voir le prix exact."""

        elif intent == "cancel_info":
            response["message"] = """❌ **Politique d'annulation:**

• Annulation **gratuite** jusqu'à 48h avant l'arrivée
• Annulation tardive: remboursement de 50%
• Non-présentation: aucun remboursement

Pour annuler, allez dans "Mes réservations"."""

        elif intent == "reviews_info":
            response["message"] = """⭐ **Avis et évaluations:**

• Vous pouvez laisser un avis après votre séjour
• Les notes vont de 1 à 5 étoiles
• Les avis aident les autres utilisateurs"""

        elif intent == "account_info":
            response["message"] = """👤 **Gestion du compte:**

• **Inscription**: Cliquez sur "S'inscrire"
• **Connexion**: Cliquez sur "Se connecter"
• **Profil**: Modifiez vos informations dans votre profil"""

        elif intent == "contact":
            response["message"] = """📞 **Contact:**

• Email: support@reservations.com
• Horaires: Lun-Ven, 9h-18h"""

        elif intent == "thanks":
            response["message"] = "😊 Avec plaisir! N'hésitez pas si vous avez d'autres questions sur le site!"
            
        elif intent == "goodbye":
            response["message"] = "👋 Au revoir! À bientôt sur notre plateforme!"
        
        # ============ QUESTION HORS SUJET ============
        else:
            response["message"] = "❌ **Désolé, je ne peux répondre qu'aux questions concernant le site.**\n\nTapez 'aide' pour voir ce que je peux faire."
        
        return response
