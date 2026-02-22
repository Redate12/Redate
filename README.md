# 💕 REDATE - Dating App

![Static Badge](https://img.shields.io/badge/Status-Active-success)
![License](https://img.shields.io/badge/License-Private-yellow)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)

**iOS + Android dating app with real-time chat, swipe matching, geolocation, and Stripe payments (USD)**

---

## 🎯 Overview

REDATE is a modern dating app built with:
- **Backend:** Node.js + Express + PostgreSQL + Redis + Firebase + Stripe
- **Frontend:** React Native + Expo (iOS & Android)
- **Payments:** Stripe Integration (USD subscriptions + boosts)
- **Real-time:** Firebase Firestore + Cloud Messaging (FCM)
- **Geolocation:** PostGIS + Mapbox

**Bundle IDs:** `com.redate.app`

---

## ✨ Features

### Core Features
- ✅ **Swipe matching system** - Right to like, left to dislike, super likes
- ✅ **Real-time chat** - Firebase Firestore messaging
- ✅ **Geolocation** - Find nearby matches using PostGIS
- ✅ **Smart matching** - Mutual like creates instant match
- ✅ **Profile management** - Photos, bio, preferences
- ✅ **Push notifications** - New match, message, super like alerts

### Subscription Tiers (USD)
| Tier | Price | Features |
|------|-------|----------|
| **FREE** | €0 | 10 swipes/day, 1 super like, 50km radius |
| **PLUS** | $9.99/mes | Unlimited swipes, 5 super likes/day, verify likes, 150km radius |
| **GOLD** | $19.99/mes | PLUS + passport, pre-match read, unlimited distance, priority |
| **PLATINUM** | $29.99/mes | GOLD + 3 pre-match messages/week, priority support, match guarantee |

### One-time Boosts
- **SuperLike:** $0.49 - Stand out profile
- **Boost 30min:** $1.49 - Featured profile for 30m
- **Boost 1h:** $2.49 - Featured profile for 1 hour

---

## 🛠️ Tech Stack

### Backend
```
Node.js 18+          - JavaScript runtime
Express              - Web framework
PostgreSQL 15        - Relational database
Redis 7              - Cache & queues
PostGIS              - Geospatial extension
Firebase Admin       - Auth & Firestore
Stripe API           - Payments (USD)
Mapbox               - Maps & geocoding
```

### Frontend
```
React Native 0.81    - Mobile framework
Expo 54              - Development platform
Firebase SDK         - Client-side Firebase
React Navigation    - Navigation
React Native Safe   - iOS notches
```

### Infrastructure
```
Docker           - Containerization (optional)
PM2              - Process manager (production)
Nginx            - Reverse proxy (production)
EAS Build        - iOS/Android builds
```

---

## 📦 Project Structure

```
redate-app/
├── 📁 BE/                    # Backend (Node.js + Express)
│   ├── 📁 src/
│   │   ├── 📁 controllers/   # Auth, Users, Swipes, Matches, Chat, Subscription
│   │   ├── 📁 models/         # User, Match, Message, Swipe, Subscription
│   │   ├── 📁 routes/         # API endpoints
│   │   ├── 📁 services/       # Stripe, Mapbox, Notification, Firebase
│   │   ├── 📁 config/         # Database, Redis, Firebase, Stripe
│   │   ├── 📁 middleware/     # JWT Auth
│   │   └── 📁 database/       # PostgreSQL schema
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── package.json
│   └── .env.example
│
├── 📁 FE/                    # Frontend (React Native + Expo)
│   ├── 📁 src/
│   │   ├── 📁 screens/       # Onboarding, Login, Swipe, Matches, Chat, Profile
│   │   ├── 📁 services/       # API, Auth, Chat, Notification
│   │   ├── 📁 config/        # API base, Firebase
│   │   ├── 📁 constants/     # Colors, Tiers
│   │   └── 📁 components/    # UI components
│   ├── 📁 assets/            # Images, icons
│   ├── app.json              # Expo config
│   ├── eas.json              # EAS build config
│   └── package.json
│
├── 📁 docs/                  # Documentation
│   ├── API.md                # API endpoints
│   ├── STRIPE_GUIDE.md       # Stripe integration (USD)
│   ├── WINDOWS_SETUP.md      # Windows setup guide
│   ├── WINDOWS_QUICKSTART.md # Quickstart guide
│   └── IPHONE_WINDOWS_GUIDE.md # iPhone + Windows guide
│
├── 📁 .github/               # GitHub workflows
│   └── 📁 workflows/          # CI/CD pipelines
│       └── tests.yml
│
├── .gitignore
├── README.md
├── DEPLOYMENT.md             # Production deployment guide
├── setup-git.bat             # Windows git setup script
└── setup-git.sh              # Unix/Mac git setup script
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15
- Redis 7
- Firebase account
- Stripe account

### Setup (Windows)

```powershell
# 1. Clone repository
git clone https://github.com/username/redate-app.git
cd redate-app

# 2. Install dependencies
cd BE
npm install

cd ../FE
npm install react-native-deck-swiper

# 3. Configure environment variables
cd BE
cp .env.example .env
# Edit .env with Firebase, Stripe, Database credentials

# 4. Setup database
createdb redate_db
psql -d redate_db -f src/database/schema.sql

# 5. Start services
# Terminal 1: Backend
npm run dev

# Terminal 2: Frontend
cd ../FE
npm start
```

### Testing

**iOS (iPhone):**
```
Install Expo Go from App Store
Open app → Enter URL: exp://192.168.1.xxx:19000
```

**Android:**
```
Install Expo Go from Google Play
Scan QR code or enter URL
```

---

## 🔧 Configuration

### Environment Variables (.env)

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=redate_db
DB_USER=postgres
DB_PASSWORD=redate_password

# Redis
REDIS_URL=redis://localhost:6379

# Firebase
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_PROJECT_ID=redate-app

# Stripe (USD)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CURRENCY=usd
STRIPE_PRICE_PLUS=price_...
STRIPE_PRICE_GOLD=price_...
STRIPE_PRICE_PLATINUM=price_...

# Mapbox
MAPBOX_ACCESS_TOKEN=pk.your-token
```

---

## 📊 API Endpoints

### Authentication
```
POST /api/auth/register  - Register new user
POST /api/auth/login     - Login user
POST /api/auth/social    - Social login (Google)
```

### Users
```
GET  /api/users/profile   - Get user profile
PUT  /api/users/profile   - Update profile
GET  /api/users/nearby   - Get nearby users
```

### Swipes
```
POST /api/swipes/:id/like       - Like user
POST /api/swipes/:id/dislike    - Dislike user
POST /api/swipes/:id/superlike  - Super like
POST /api/swipes/:id/undo       - Undo last swipe
```

### Matches
```
GET  /api/matches        - Get all matches
GET  /api/matches/:id    - Get match details
DELETE /api/matches/:id  - Unmatch
```

### Chat
```
GET  /api/chat/conversations      - Get conversations
GET  /api/chat/:matchId/messages  - Get messages
POST /api/chat/:matchId/send      - Send message
PUT  /api/chat/:matchId/read      - Mark read
```

### Subscription
```
POST /api/subscription/create    - Create subscription
POST /api/subscription/boost     - Purchase boost
POST /api/subscription/cancel    - Cancel subscription

webhook: POST /api/subscription/webhook
```

See [`docs/API.md`](docs/API.md) for complete API documentation.

---

## 📱 Building for Production

### iOS (EAS Build)
```bash
cd FE
npx eas-cli build --platform ios --profile production
```

### Android (EAS Build)
```bash
cd FE
npx eas-cli build --platform android --profile production
```

See [`docs/DEPLOYMENT.md`](DEPLOYMENT.md) for complete deployment guide.

---

## 🔐 Security

- JWT tokens for authentication
- Bcrypt password hashing
- Stripe for secure payments (PCI DSS compliant)
- Firebase Admin for secure auth
- Firebase Firestore for secure real-time data
- Environment variables for secrets
- `.gitignore` configured to exclude sensitive files

---

## 📈 Monetization

| Revenue Stream | Price |
|----------------|-------|
| PLUS Subscription | $9.99/month |
| GOLD Subscription | $19.99/month |
| PLATINUM Subscription | $29.99/month |
| SuperLike | $0.49 one-time |
| Boost 30min | $1.49 one-time |
| Boost 1h | $2.49 one-time |

**Revenue Example (1,000 users @ $9.99/month):**
- Gross: ~$9,990/month
- Stripe fees (2.9% + $0.30): ~$437/month
- **Net: ~$9,550/month**

---

## 🚀 Deployment

### Production Stack
- **Backend:** AWS EC2 / Railway / Render
- **Database:** PostgreSQL / Neon / Supabase
- **Cache:** Redis / Upstash
- **Frontend:** EAS Build / React Native
- **CDN:** CloudFront / Custom CDN

### CI/CD
- GitHub Actions for testing
- EAS Build for iOS/Android
- Automatic deployment on main branch push

See [`docs/DEPLOYMENT.md`](DEPLOYMENT.md) for complete guide.

---

## 📝 Documentation

- [`docs/API.md`](docs/API.md) - Complete API documentation
- [`docs/STRIPE_GUIDE.md`](docs/STRIPE_GUIDE.md) - Stripe integration (USD)
- [`docs/WINDOWS_SETUP.md`](docs/WINDOWS_SETUP.md) - Windows setup
- [`docs/DEPLOYMENT.md`](DEPLOYMENT.md) - Production deployment
- [`GITHUB_SETUP_GUIDE.md`](GITHUB_SETUP_GUIDE.md) - GitHub setup

---

## ℹ️ Support

For questions or issues:
- Email: support@redate.app
- Documentation: `/docs`
- GitHub Issues: Create issue in repository

---

## 📄 License

**All Rights Reserved** REDATE © 2025

---

## 🎉 Contributing

This is a private project. External contributions not accepted.

---

## 🌟 Status

**Version:** 1.0.0
**Status:** Development
**Backend:** 100% complete
**Frontend:** 100% complete
**Documentation:** 100% complete
**Deployment:** 0% complete (pending production setup)

---

**Built with 💕 for modern dating** 💕