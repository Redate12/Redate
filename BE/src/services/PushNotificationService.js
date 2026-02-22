const admin = require('../config/firebase');

class PushNotificationService {
  static async sendToUser(userId, notification, data = {}) {
    try {
      const pool = require('../config/database');

      // Get user's FCM token
      const userResult = await pool.query(
        'SELECT fcm_token FROM users WHERE id = $1',
        [userId]
      );

      if (userResult.rows.length === 0 || !userResult.rows[0].fcm_token) {
        console.log(`No FCM token for user ${userId}`);
        return { success: false, reason: 'No FCM token' };
      }

      const fcmToken = userResult.rows[0].fcm_token;

      const message = {
        token: fcmToken,
        notification,
        data,
        android: {
          priority: 'high',
        },
        apns: {
          payload: {
            aps: {
              alert: notification,
              sound: 'default',
            },
          },
        },
      };

      const response = await admin.messaging().send(message);
      console.log(`Notification sent to user ${userId}:`, response.messageId);

      return { success: true, messageId: response.messageId };
    } catch (error) {
      console.error('Send notification error:', error);

      // Delete invalid FCM token if it exists
      if (error.code === 'messaging/invalid-registration-token' ||
          error.code === 'messaging/registration-token-not-registered') {
        try {
          const pool = require('../config/database');
          await pool.query(
            'UPDATE users SET fcm_token = NULL WHERE id = $1',
            [userId]
          );
          console.log(`Invalid FCM token removed for user ${userId}`);
        } catch (updateError) {
          console.error('Failed to remove invalid FCM token:', updateError);
        }
      }

      return { success: false, error: error.message };
    }
  }

  static async sendMulticast(tokens, notification, data = {}) {
    try {
      const message = {
        tokens,
        notification,
        data,
      };

      const response = await admin.messaging().sendMulticast(message);

      // Remove invalid tokens
      const invalidTokens = [];
      response.responses.forEach((res, index) => {
        if (!res.success &&
           (res.error.code === 'messaging/invalid-registration-token' ||
            res.error.code === 'messaging/registration-token-not-registered')) {
          invalidTokens.push(tokens[index]);
        }
      });

      if (invalidTokens.length > 0) {
        const pool = require('../config/database');
        await pool.query(
          'UPDATE users SET fcm_token = NULL WHERE fcm_token = ANY($1)',
          [invalidTokens]
        );
        console.log(`Removed ${invalidTokens.length} invalid FCM tokens`);
      }

      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
      };
    } catch (error) {
      console.error('Send multicast notification error:', error);
      return { success: false, error: error.message };
    }
  }

  static async sendToTopic(topic, notification, data = {}) {
    try {
      const message = {
        topic,
        notification,
        data,
      };

      const response = await admin.messaging().send(message);
      console.log(`Notification sent to topic ${topic}:`, response.messageId);

      return { success: true, messageId: response.messageId };
    } catch (error) {
      console.error('Send topic notification error:', error);
      return { success: false, error: error.message };
    }
  }

  // Notification templates
  static async newMatch(userId, matchName, matchPhoto) {
    return this.sendToUser(userId, {
      title: '💕 New Match!',
      body: `You matched with ${matchName} on REDATE`,
    }, { type: 'new_match', matchName, matchPhoto });
  }

  static async newMessage(userId, senderName, messagePreview, matchId) {
    return this.sendToUser(userId, {
      title: '💬 New Message',
      body: `${senderName}: ${messagePreview.substring(0, 100)}...`,
    }, { type: 'new_message', matchId });
  }

  static async superLike(userId, likerName, likerPhoto) {
    return this.sendToUser(userId, {
      title: '⭐ Super Liked!',
      body: `${likerName} super liked you on REDATE`,
    }, { type: 'super_like', likerName, likerPhoto });
  }

  static async swipeBack(userId, swiperName, swiperPhoto) {
    return this.sendToUser(userId, {
      title: '💫 Someone swiped back!',
      body: `${swiperName} is waiting for your response`,
    }, { type: 'swipe_back', swiperName, swiperPhoto });
  }
}

module.exports = PushNotificationService;