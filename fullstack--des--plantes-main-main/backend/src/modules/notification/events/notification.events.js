const eventBus = require('../../../shared/events/event-bus');
const { AUTH_EVENTS } = require('../../auth/events/auth.events.constants');
const { AI_EVENTS } = require('../../ai-analysis/events/ai.events');

const registerNotificationEvents = () => {
  const NotificationService = require('../services/notification.service');
  const notificationService = new NotificationService();

  eventBus.on(AUTH_EVENTS.USER_REGISTERED, async (payload) => {
    if (!payload || !payload.userId) {
      return;
    }

    try {
      await notificationService.sendEmail(
        payload.userId,
        payload.email,
        'Bienvenue sur PlantCare !',
        'Merci de vous être enregistré. Commencez à ajouter vos plantes et utilisez nos outils de suivi intelligent.'
      );
    } catch (error) {
      console.error(
        'Erreur lors de l\'envoi du mail de bienvenue:',
        error.message
      );
    }
  });

  eventBus.on(AI_EVENTS.DISEASE_DETECTED, async (payload) => {
    if (!payload || !payload.plantId) {
      return;
    }

    try {
      const alertTitle = '🚨 Alerte : Maladie détectée';
      const alertBody = `Une maladie potentielle a été détectée sur votre plante: ${payload.diseaseName || 'Inconnue'} (confiance: ${payload.confidence}%). Consultez l'analyse détaillée pour plus d'informations.`;

      console.log(`Notification d'alerte pour la plante ${payload.plantId}: ${alertBody}`);
    } catch (error) {
      console.error(
        'Erreur lors de l\'envoi de l\'alerte de maladie:',
        error.message
      );
    }
  });
};

module.exports = {
  registerNotificationEvents,
};
