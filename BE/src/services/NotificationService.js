const admin = require('../config/firebase');

class NotificationService {
  static async sendToUser(userId, title, body, data = {}) {
    try {
      // Get user's FCM token from database
      const { pool } = require('../config/database');
      const result = await pool.query(
        'SELECT fcm_token FROM users WHERE id = $1',
        [userId]
      );

      if (result.rows.length === 0 || !result.rows[0].fcm_token) {
        console.log(`No FCM token for user ${userId}`);
        return { success: false, message: 'No FCM token found' };
      }

      const fcmToken = result.rows[0].fcm_token;

      // Send notification
      const message = {
        token: fcmToken,
        notification: {
          title,
          body,
        },
        data,
      };

      const response = await admin.messaging().send(message);
      console.log(`Successfully sent notification to user ${userId}:`, response);

      return { success: true, messageId: response };
    } catch (error) {
      console.error('Send notification error:', error);
      return { success: false, error: error.message };
    }
  }

  static async sendMulticast(tokens, title, body, data = {}) {
    try {
      const message = {
        tokens,
        notification: {
          title,
          body,
        },
        data,
      };

      const response = await admin.messaging().sendMulticast(message);
      console.log('Multicast notification response:', response);

      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
        responses: response.responses,
      };
    } catch (error) {
      console.error('Send multicast notification error:', error);
      return { success: false, error: error.message };
    }
  }

  static async sendToTopic(topic, title, body, data = {}) {
    try {
      const message = {
        topic,
        notification: {
          title,
          body,
        },
        data,
      };

      const response = await admin.messaging().send(message);
      console.log(`Successfully sent notification to topic ${topic}:`, response);

      return { success: true, messageId: response };
    } catch (error) {
      console.error('Send topic notification error:', error);
      return { success: false, error: error.message };
    }
  }

  static async saveUserFCMToken(userId, fcmToken) {
    try {
      const { pool } = require('../config/database');

      await pool.query(
        'UPDATE users SET fcm_token = $1, updated_at = NOW() WHERE id = $2',
        [fcmToken, userId]
      );

      return { success: true };
    } catch (error) {
      console.error('Save FCM token error:', error);
      return { success: false, error: error.message };
    }
  }

  static async unregisterUserFCMToken(userId) {
    try {
      const { pool } = require('../config/database');

      await pool.query(
        'UPDATE users SET fcm_token = NULL, updated_at = NOW() WHERE id = $1',
        [userId]
      );

      return { success: true };
    } catch (error) {
      console.error('Unregister FCM token error:', error);
      return { success: false, error: error.message };
    }
  }

  // Notification templates
  static async sendNewMatchNotification(userId, matchName) {
    return this.sendToUser(
      userId,
      '💕 New Match!',
      `You matched with ${matchName} on REDATE`,
      { type: 'new_match' }
    );
  }

  static async sendNewMessageNotification(userId, senderName, messagePreview) {
    return this.sendToUser(
      userId,
      '💬 New Message',
      `${senderName}: ${messagePreview.substring(0, 50)}...`,
      { type: 'new_message' }
    );
  }

  static async sendSuperLikeNotification(userId, likerName) {
    return this.sendToUser(
      userId,
      '⭐ Super Liked!',
      `${likerName} super liked you on REDATE`,
      { type: 'super_like' }
    );
  }

  static async sendSubscriptionExpiringSoonNotification(userId, daysLeft) {
    return this.sendToUser(
      userId,
      '📢 Subscription Expiring Soon',
      `Your REDATE Premium subscription expires in ${daysLeft} days`,
      { type: 'subscription_warning' }
    );
  }
}

module.exports = NotificationService;