import axios from 'axios';
import { API_BASE_URL, buildUrl, API_ENDPOINTS } from '../config/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, try to refresh
      try {
        const refreshToken = localStorage.getItem('token');

        if (refreshToken) {
          const response = await axios.post(
            buildUrl(API_ENDPOINTS.REFRESH),
            { token: refreshToken }
          );

          const { token } = response.data.data;

          localStorage.setItem('token', token);

          // Retry original request
          error.config.headers.Authorization = `Bearer ${token}`;
          return axios(error.config);
        }
      } catch (refreshError) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Navigate to login (this would need navigation prop)
        console.error('Token refresh failed:', refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth Service
export const authService = {
  async login(email, password) {
    const response = await api.post(buildUrl(API_ENDPOINTS.LOGIN), { email, password });
    return response.data;
  },

  async loginWithFirebase(firebaseToken) {
    const response = await api.post(buildUrl(API_ENDPOINTS.LOGIN), {
      firebase_token: firebaseToken,
    });
    return response.data;
  },

  async socialLogin(provider, idToken, email, name) {
    const response = await api.post(buildUrl(API_ENDPOINTS.SOCIAL_LOGIN), {
      provider,
      id_token: idToken,
      email,
      name,
    });
    return response.data;
  },

  async register(email, password, phone) {
    const response = await api.post(buildUrl(API_ENDPOINTS.REGISTER), {
      email,
      password,
      phone,
    });
    return response.data;
  },

  async logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

// User Service
export const userService = {
  async getProfile() {
    const response = await api.get(buildUrl(API_ENDPOINTS.ME));
    return response.data;
  },

  async createProfile(profileData) {
    const response = await api.post(buildUrl(API_ENDPOINTS.PROFILE), profileData);
    return response.data;
  },

  async updateProfile(profileData) {
    const response = await api.put(buildUrl(API_ENDPOINTS.UPDATE_PROFILE), profileData);
    return response.data;
  },

  async updateLocation(latitude, longitude) {
    const response = await api.post(buildUrl(API_ENDPOINTS.LOCATION), {
      latitude,
      longitude,
    });
    return response.data;
  },

  async getNearbyUsers(params) {
    const response = await api.get(buildUrl(API_ENDPOINTS.NEARBY), { params });
    return response.data;
  },

  async uploadPhoto(photoUrl, isPrimary) {
    const response = await api.post(buildUrl(API_ENDPOINTS.PHOTO), {
      photo_url: photoUrl,
      is_primary: isPrimary,
    });
    return response.data;
  },

  async setPreferences(preferences) {
    const response = await api.post(buildUrl(API_ENDPOINTS.PREFERENCES), preferences);
    return response.data;
  },
};

// Swipe Service
export const swipeService = {
  async like(targetId) {
    const response = await api.post(buildUrl(API_ENDPOINTS.LIKE, { targetId }));
    return response.data;
  },

  async dislike(targetId) {
    const response = await api.post(buildUrl(API_ENDPOINTS.DISLIKE, { targetId }));
    return response.data;
  },

  async superLike(targetId) {
    const response = await api.post(buildUrl(API_ENDPOINTS.SUPER_LIKE, { targetId }));
    return response.data;
  },
  async undo() {
    const response = await api.post(buildUrl(API_ENDPOINTS.UNDO));
    return response.data;
  },

  async getHistory(params) {
    const response = await api.get(buildUrl(API_ENDPOINTS.HISTORY), { params });
    return response.data;
  },
};

// Match Service
export const matchService = {
  async getMatches(params) {
    const response = await api.get(buildUrl(API_ENDPOINTS.MATCHES), { params });
    return response.data;
  },

  async getMatchDetails(matchId) {
    const response = await api.get(buildUrl(API_ENDPOINTS.MATCH_DETAILS, { matchId }));
    return response.data;
  },

  async getMatchesCount() {
    const response = await api.get(buildUrl(API_ENDPOINTS.MATCHES_COUNT));
    return response.data;
  },

  async unmatch(matchId) {
    const response = await api.delete(buildUrl(API_ENDPOINTS.UNMATCH, { matchId }));
    return response.data;
  },

  async report(matchId, reason, description) {
    const response = await api.post(
      buildUrl(API_ENDPOINTS.REPORT, { matchId }),
      { reason, description }
    );
    return response.data;
  },
};

// Chat Service
export const chatService = {
  async getConversations(params) {
    const response = await api.get(buildUrl(API_ENDPOINTS.CONVERSATIONS), { params });
    return response.data;
  },

  async getMessages(matchId, params) {
    const response = await api.get(buildUrl(API_ENDPOINTS.MESSAGES, { matchId }), { params });
    return response.data;
  },

  async sendMessage(matchId, content, messageType = 'text', firebaseMessageId) {
    const response = await api.post(
      buildUrl(API_ENDPOINTS.SEND_MESSAGE, { matchId }),
      { content, message_type: messageType, firebase_message_id: firebaseMessageId }
    );
    return response.data;
  },

  async markAsRead(matchId) {
    const response = await api.post(buildUrl(API_ENDPOINTS.MARK_READ, { matchId }));
    return response.data;
  },

  async deleteConversation(matchId) {
    const response = await api.delete(buildUrl(API_ENDPOINTS.DELETE_CONVERSATION, { matchId }));
    return response.data;
  },
};

// Subscription Service
export const subscriptionService = {
  async createSubscription(tier, paymentMethodId) {
    const response = await api.post(buildUrl(API_ENDPOINTS.CREATE_SUBSCRIPTION), {
      tier,
      payment_method_id: paymentMethodId,
    });
    return response.data;
  },

  async cancelSubscription() {
    const response = await api.post(buildUrl(API_ENDPOINTS.CANCEL_SUBSCRIPTION));
    return response.data;
  },

  async upgradeSubscription(tier) {
    const response = await api.post(buildUrl(API_ENDPOINTS.UPGRADE_SUBSCRIPTION), { tier });
    return response.data;
  },

  async getSubscriptionStatus() {
    const response = await api.get(buildUrl(API_ENDPOINTS.STATUS));
    return response.data;
  },

  async processIAP(transactionId, purchaseToken, originalTransactionId, tier, platform) {
    const response = await api.post(buildUrl(API_ENDPOINTS.IAP), {
      transaction_id: transactionId,
      purchase_token: purchaseToken,
      original_transaction_id: originalTransactionId,
      tier,
      platform,
    });
    return response.data;
  },

  async requestRefund() {
    const response = await api.post(buildUrl(API_ENDPOINTS.REFUND));
    return response.data;
  },

  async purchaseBoost(boostType, paymentMethodId) {
    const response = await api.post(buildUrl(API_ENDPOINTS.PURCHASE_BOOST), {
      boost_type: boostType,
      payment_method_id: paymentMethodId,
    });
    return response.data;
  },
};

export default api;