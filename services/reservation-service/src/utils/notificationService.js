const axios = require('axios');

// Le notification-service n'est pas encore dans l'API Gateway, on l'appelle directement
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3004';

/**
 * Envoie une notification au propriétaire pour une nouvelle demande de réservation
 */
const notifyNewReservation = async (ownerEmail, ownerName, tenantName, propertyTitle, startDate, endDate, totalPrice) => {
  try {
    await axios.post(`${NOTIFICATION_SERVICE_URL}/api/notifications/new-reservation`, {
      owner_email: ownerEmail,
      owner_name: ownerName,
      tenant_name: tenantName,
      property_title: propertyTitle,
      start_date: startDate,
      end_date: endDate,
      total_price: totalPrice
    });
    console.log(`✅ Notification nouvelle réservation envoyée à ${ownerEmail}`);
  } catch (error) {
    console.error(`❌ Erreur notification nouvelle réservation: ${error.message}`);
  }
};

/**
 * Envoie une notification au locataire que sa réservation est confirmée
 */
const notifyReservationConfirmed = async (tenantEmail, tenantName, propertyTitle, propertyAddress, startDate, endDate, totalPrice) => {
  try {
    await axios.post(`${NOTIFICATION_SERVICE_URL}/api/notifications/reservation-confirmed`, {
      tenant_email: tenantEmail,
      tenant_name: tenantName,
      property_title: propertyTitle,
      property_address: propertyAddress,
      start_date: startDate,
      end_date: endDate,
      total_price: totalPrice
    });
    console.log(`✅ Notification confirmation envoyée à ${tenantEmail}`);
  } catch (error) {
    console.error(`❌ Erreur notification confirmation: ${error.message}`);
  }
};

/**
 * Envoie une notification au locataire que sa réservation est refusée
 */
const notifyReservationRejected = async (tenantEmail, tenantName, propertyTitle, startDate, endDate, rejectionReason) => {
  try {
    await axios.post(`${NOTIFICATION_SERVICE_URL}/api/notifications/reservation-rejected`, {
      tenant_email: tenantEmail,
      tenant_name: tenantName,
      property_title: propertyTitle,
      start_date: startDate,
      end_date: endDate,
      rejection_reason: rejectionReason
    });
    console.log(`✅ Notification refus envoyée à ${tenantEmail}`);
  } catch (error) {
    console.error(`❌ Erreur notification refus: ${error.message}`);
  }
};

/**
 * Envoie une notification d'annulation
 */
const notifyReservationCancelled = async (recipientEmail, recipientName, cancelledBy, propertyTitle, startDate, endDate) => {
  try {
    await axios.post(`${NOTIFICATION_SERVICE_URL}/api/notifications/reservation-cancelled`, {
      recipient_email: recipientEmail,
      recipient_name: recipientName,
      cancelled_by: cancelledBy,
      property_title: propertyTitle,
      start_date: startDate,
      end_date: endDate
    });
    console.log(`✅ Notification annulation envoyée à ${recipientEmail}`);
  } catch (error) {
    console.error(`❌ Erreur notification annulation: ${error.message}`);
  }
};

module.exports = {
  notifyNewReservation,
  notifyReservationConfirmed,
  notifyReservationRejected,
  notifyReservationCancelled
};
