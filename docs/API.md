# REDATE API Documentation

## Base URL
```
https://api.redate.app/v1
```

## Authentication
```
Authorization: Bearer <jwt_token>
```

---

## Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/refresh` - Refresh JWT token

### Users
- `GET /api/users/me` - Get current user profile
- `POST /api/users/profile` - Create user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/photo` - Upload photo
- `POST /api/users/location` - Update geolocation
- `GET /api/users/nearby?distance=50&minAge=18&maxAge=100` - Get nearby users

### Swipes
- `POST /api/swipes/:targetId/like` - Like user
- `POST /api/swipes/:targetId/dislike` - Dislike user
- `POST /api/swipes/:targetId/superlike` - Super like
- `POST /api/swipes/undo` - Undo last swipe
- `GET /api/swipes/history` - Swipe history

### Matches
- `GET /api/matches` - Get all matches
- `GET /api/matches/count` - Get matches count
- `DELETE /api/matches/:matchId` - Unmatch
- `POST /api/matches/:matchId/report` - Report user

### Chat
- `GET /api/chat/conversations` - Get conversations list
- `GET /api/chat/:matchId/messages` - Get messages
- `POST /api/chat/:matchId/send` - Send message
- `POST /api/chat/:matchId/read` - Mark as read
- `DELETE /api/chat/:matchId` - Delete conversation

### Subscription
- `POST /api/subscription/create` - Create subscription (Stripe)
- `POST /api/subscription/cancel` - Cancel subscription
- `POST /api/subscription/upgrade` - Upgrade tier
- `GET /api/subscription/status` - Get subscription status
- `POST /api/subscription/iap` - Process in-app purchase (Apple/Google)
- `POST /api/subscription/refund` - Request refund

---

## Response Format

### Success
```json
{
  "success": true,
  "data": { ... }
}
```

### Error
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

---

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error