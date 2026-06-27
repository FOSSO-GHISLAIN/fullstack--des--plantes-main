const NotificationRepository = require('../repositories/notification.repository');
const AppError = require('../../../shared/utils/app-error');

const NOTIFICATION_TYPE_EMAIL = 'email';
const NOTIFICATION_TYPE_PUSH = 'push';

const SMTP_HOST = process.env.SMTP_HOST || 'localhost';
const SMTP_PORT = process.env.SMTP_PORT || 587;
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASSWORD = process.env.SMTP_PASSWORD || '';
const SMTP_FROM = process.env.SMTP_FROM || 'noreply@plantcare.app';

const FCM_API_KEY = process.env.FCM_API_KEY || '';
const FCM_ENABLED = !!FCM_API_KEY;

class NotificationService {
  constructor() {
    this.repository = new NotificationRepository();
    this.nodeMailer = null;
    this._initNodemailer();
  }

  _initNodemailer() {
    try {
      const nodemailer = require('nodemailer');
      this.nodeMailer = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_PORT === 465,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASSWORD,
        },
      });
    } catch (error) {
      console.warn('Nodemailer non disponible ou mal configuré:', error.message);
      this.nodeMailer = null;
    }
  }

  async sendEmail(userId, recipientEmail, title, body) {
    if (!userId || !recipientEmail) {
      throw new AppError('Données invalides pour envoyer un email', 400);
    }

    try {
      if (!this.nodeMailer) {
        console.warn('Email non envoyé (nodemailer non disponible). Mode simulation.');
        await this.repository.create({
          userId,
          type: NOTIFICATION_TYPE_EMAIL,
          title,
          message: body,
          status: 'sent',
        });
        return { success: true, message: 'Email logged (simulated)' };
      }

      await this.nodeMailer.sendMail({
        from: SMTP_FROM,
        to: recipientEmail,
        subject: title,
        html: this._buildHtmlEmail(title, body),
      });

      await this.repository.create({
        userId,
        type: NOTIFICATION_TYPE_EMAIL,
        title,
        message: body,
        status: 'sent',
      });

      return { success: true, message: 'Email envoyé avec succès' };
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error.message);

      await this.repository.create({
        userId,
        type: NOTIFICATION_TYPE_EMAIL,
        title,
        message: body,
        status: 'failed',
      });

      return { success: false, message: 'Erreur lors de l\'envoi de l\'email' };
    }
  }

  async sendPush(userId, userPushToken, title, body) {
    if (!userId || !userPushToken) {
      throw new AppError('Données invalides pour envoyer une notification push', 400);
    }

    try {
      if (!FCM_ENABLED) {
        console.warn('FCM non configuré. Mode simulation pour push notification.');
        await this.repository.create({
          userId,
          type: NOTIFICATION_TYPE_PUSH,
          title,
          message: body,
          status: 'sent',
        });
        return { success: true, message: 'Push logged (simulated)' };
      }

      await this._sendFcmNotification(userPushToken, title, body);

      await this.repository.create({
        userId,
        type: NOTIFICATION_TYPE_PUSH,
        title,
        message: body,
        status: 'sent',
      });

      return { success: true, message: 'Push envoyé avec succès' };
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la push notification:', error.message);

      await this.repository.create({
        userId,
        type: NOTIFICATION_TYPE_PUSH,
        title,
        message: body,
        status: 'failed',
      });

      return { success: false, message: 'Erreur lors de l\'envoi de la push' };
    }
  }

  async getNotificationHistory(userId, limit = 50) {
    if (!userId) {
      throw new AppError('Identifiant utilisateur manquant', 400);
    }

    const normalizedLimit = Math.min(limit || 50, 100);
    return this.repository.findByUserId(userId, normalizedLimit);
  }

  async _sendFcmNotification(pushToken, title, body) {
    const message = {
      notification: {
        title,
        body,
      },
      token: pushToken,
    };

    const response = await fetch('https://fcm.googleapis.com/v1/projects/{project-id}/messages:send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${FCM_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
      }),
    });

    if (!response.ok) {
      throw new Error(`FCM error: ${response.status}`);
    }

    return response.json();
  }

  _buildHtmlEmail(title, body) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2ecc71; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
          .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }
          .footer { margin-top: 20px; font-size: 12px; color: #999; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${title}</h1>
          </div>
          <div class="content">
            <p>${body}</p>
          </div>
          <div class="footer">
            <p>© 2026 PlantCare. Vous avez reçu cet email car vous êtes enregistré sur notre plateforme.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = NotificationService;
