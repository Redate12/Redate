import {getMessaging, getToken, onMessage} from 'firebase/messaging';
import {Platform} from 'react-native';
import {messaging} from '../config/firebaseConfig';
import api from './api';

// Request FCM permission and get token
export const requestNotificationPermission = async () => {
  try {
    let fcmToken = null;

    // Web/Expo web
    if (Platform.OS === 'web') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        fcmToken = await getToken(messaging, {
          vapidKey: process.env.EXPO_PUBLIC_FCM_VAPID_KEY,
        });
        console.log('FCM Token (Web):', fcmToken);
      }
    }

    if (fcmToken) {
      // Send token to backend
      await api.post('/api/users/fcm-token', {fcm_token: fcmToken});
    }

    return {success: true, token: fcmToken};
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return {success: false, error: error.message};
  }
};

// Listen for foreground messages
export const listenToForegroundMessages = (callback) => {
  const unsubscribe = onMessage(messaging, (payload) => {
    callback({
      notification: payload.notification,
      data: payload.data,
    });
  });

  return unsubscribe;
};

// Send notification (via backend)
export const sendNotification = async (userId, title, body, data = {}) => {
  try {
    await api.post('/api/notifications/send', {
      to: userId,
      notification: {title, body},
      data,
    });

    return {success: true};
  } catch (error) {
    console.error('Error sending notification:', error);
    return {success: false, error: error.message};
  }
};

// Update notification preferences
export const updateNotificationPreferences = async (preferences) => {
  try {
    await api.put('/api/users/notifications', preferencias);

    return {success: true};
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return {success: false, error: error.message};
  }
};

export default {
  requestNotificationPermission,
  listenToForegroundMessages,
  sendNotification,
  updateNotificationPreferences,
};