// API Configuration
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  SOCIAL_LOGIN: '/auth/social',
  REFRESH: '/auth/refresh',

  // Users
  PROFILE: '/users/profile',
  UPDATE_PROFILE: '/users/profile',
  ME: '/users/me',
  LOCATION: '/users/location',
  NEARBY: '/users/nearby',
  PHOTO: '/users/photo',
  PREFERENCES: '/users/preferences',

  // Swipes
  LIKE: '/swipes/:targetId/like',
  DISLIKE: '/swipes/:targetId/dislike',
  SUPER_LIKE: '/swipes/:targetId/superlike',
  UNDO: '/swipes/undo',
  HISTORY: '/swipes/history',

  // Matches
  MATCHES: '/matches',
  MATCH_DETAILS: '/matches/:matchId',
  MATCHES_COUNT: '/matches/count',
  UNMATCH: '/matches/:matchId',
  REPORT: '/matches/:matchId/report',

  // Chat
  CONVERSATIONS: '/chat/conversations',
  MESSAGES: '/chat/:matchId/messages',
  SEND_MESSAGE: '/chat/:matchId/send',
  MARK_READ: '/chat/:matchId/read',
  DELETE_CONVERSATION: '/chat/:matchId',
  UNREAD_COUNT: '/chat/unread',

  // Subscription
  CREATE_SUBSCRIPTION: '/subscription/create',
  CANCEL_SUBSCRIPTION: '/subscription/cancel',
  UPGRADE_SUBSCRIPTION: '/subscription/upgrade',
  STATUS: '/subscription/status',
  IAP: '/subscription/iap',
  REFUND: '/subscription/refund',
  PURCHASE_BOOST: '/subscription/boost',
};

// Helper function to build URL with params
export function buildUrl(endpoint, params = {}) {
  let url = `${API_BASE_URL}${endpoint}`;

  // Replace :param with actual values
  Object.keys(params).forEach((key) => {
    url = url.replace(`:${key}`, params[key]);
  });

  return url;
}