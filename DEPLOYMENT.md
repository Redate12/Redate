# REDATE 💕 - GUIA DE DESPLIEGUE COMPLETO

## 🚀 RESUMEN DEL PROYECTO

**Nombre:** REDATE
**Bundle IDs:** com.redate.app
**Tech Stack:**
- Backend: Node.js + Express + PostgreSQL + Redis + Firebase + Stripe
- Frontend: React Native + Expo + Firebase + React Navigation

**Estado del MVP:** ~70% completado y listo para testing

---

## 📋 PREREQUISITOS

### **Software:**
- Node.js >= 18.0.0
- PostgreSQL >= 14
- Redis >= 7.0
- npm o yarn
- Expo CLI (opcional)
- Expo Go app (para testing Android/iOS)

### **Cuentas Externas:**
1. **Firebase**: console.firebase.google.com
2. **Stripe**: dashboard.stripe.com
3. **Mapbox**: mapbox.com
4. **VPS/Hosting**: AWS, DigitalOcean, Railway, Render, etc.

---

## 🔧 SETUP LOCAL COMPLETO

### Paso 1: Instalar dependencias

```bash
cd redate-app/BE
npm install

cd ../FE
npm install @react-native-async-storage/async-storage react-native-deck-swiper
```

### Paso 2: Configurar Firebase

1. Create project en https://console.firebase.google.com
2. Enable Authentication:
   - Email/Password
   - Google
   - Apple (iOS)
   - Phone (SMS)
3. Create Firestore Database:
   - Mode: Start in Test Mode
   - Location: España/EU
4. Enable Cloud Messaging (FCM)
5. Download service account key:
   - Project Settings → Service Accounts → Generate New Private Key
   - Guardar como `firebase-service-key.json`

### Paso 3: Configurar Stripe

1. Create account en https://dashboard.stripe.com/register
2. Setup products:
   - REDATE Plus: €9.99/mes
   - REDATE Gold': €19.99/mes
   - REDATE Platinum: €29.99/mes
3. Setup prices:
   - price_plus_monthly: 999 cents EUR, recurring monthly
   - price_gold_monthly: 1999 cents EUR, recurring monthly
   - price_platinum_monthly: 2999 cents EUR, recurring monthly
4. Setup Stripe Connect:
   - Create connected account para payouts PayPal

### Paso 4: Configurar Mapbox

1. Create account en https://www.mapbox.com
2. Get public access token
3. Enable Mapbox Geocoding API

### Paso 5: Crear Base de Datos PostgreSQL

```bash
# Opción A: Local con Docker
docker run -d \
  --name redate-db \
  -e POSTGRES_PASSWORD=redate_password \
  -e POSTGRES_DB=redate_db \
  -p 5432:5432 \
  postgres:15

# Opción B: Cloud (Neon, Supabase, Railway)
# Crear database en el servicio cloud y obtener connection string

# Ejecutar schema
psql -h localhost -U postgres -d redate_db -f BE/src/database/schema.sql
```

### Paso 6: Iniciar Redis

```bash
# Opción A: Local con Docker
docker run -d --name redate-redis -p 6379:6379 redis:7-alpine

# Opción B: Cloud (Upstash, AWS Elasticache)
# Crear instancia y obtener connection URL
```

### Paso 7: Configurar Variables de Entorno

**Archivo:** `BE/.env`

```env
# Server
PORT=3000
NODE_ENV=development

# Database (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=redate_db
DB_USER=postgres
DB_PASSWORD=redate_password

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-length-min-32-chars
JWT_EXPIRES_IN=7d

# Firebase Admin
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"redate-app", ...FULL_CONTENT_OF_SERVICE_ACCOUNT_KEY}'

# Firebase Web API (Frontend)
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=redate-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=redate-app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=redate-app.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

# Stripe
STRIPE_SECRET_KEY=sk_test_your-stripe-test-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
STRIPE_CONNECT_SECRET_KEY=sk_live_your-connect-key

# Stripe Pricing (IDs from Stripe Dashboard)
STRIPE_PRICE_PLUS=price_plus_monthly
STRIPE_PRICE_GOLD=price_gold_monthly
STRIPE_PRICE_PLATINUM=price_platinum_monthly

# Mapbox
MAPBOX_ACCESS_TOKEN=pk.your-mapbox-token

# Email (SendGrid - opcional)
SENDGRID_API_KEY=SG.api-key
SENDGRID_FROM_EMAIL=noreply@redate.app

# PayPal (opcional, para payouts)
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret
PAYPAL_MODE=sandbox
```

### Paso 8: Iniciar Servicios Development

```bash
# Terminal 1 - Backend
cd redate-app/BE
npm run dev

# Terminal 2 - Frontend
cd redate-app/FE
npm start

# Terminal 3 - Postgres (si Docker no se inicia en background)
docker start redate-db

# Terminal 4 - Redis (si Docker no se inicia en background)
docker start redate-redis
```

---

## 🧪 TESTING LOCAL

### Test Backend API (Postman/ThunderClient)

```bash
# Health check
GET http://localhost:3000/health

# Register
POST http://localhost:3000/api/auth/register
{
  "email": "test@redate.app",
  "password": "password123",
  "name": "Test User"
}

# Login
POST http://localhost:3000/api/auth/login
{
  "email": "test@redate.app",
  "password": "password123"
}

# Crear perfil (con token en Authorization header)
POST http://localhost:3000/api/users/profile
Headers: Authorization: Bearer <JWT_TOKEN>
Body: {
  "name": "Test User",
  "birth_date": "1990-01-01",
  "gender": "male",
  "looking_for": "female",
  "bio": "Hello REDATE!",
  "photos": ["http://example.com/photo1.jpg"]
}

# Obtener usuarios cercanos
GET http://localhost:3000/api/users/nearby
Headers: Authorization: Bearer <JWT_TOKEN>
Query: ?distance=50&minAge=18&maxAge=50

# Swipe
POST http://localhost:3000/api/swipes/<TARGET_USER_ID>/like
Headers: Authorization: Bearer <JWT_TOKEN>

# Obtener matches
GET http://localhost:3000/api/matches
Headers: Authorization: Bearer <JWT_TOKEN>

# Chat
GET http://localhost:3000/api/chat/conversations
 Headers: Authorization: Bearer <JWT_TOKEN>

POST http://localhost:3000/api/chat/<MATCH_ID>/send
Headers: Authorization: Bearer <JWT_TOKEN>
Body: {
  "content": "Hola!",
  "firebase_message_id": "firebase-msg-id"
}
```

### Test Frontend (Expo)

1. Install Expo Go app en el móvil (iOS/Android)
2. Run `npm start` en `FE/`
3. Scan QR code con Expo Go
4. Test onboarding, login, swipe, matches, chat

---

## 📦 BUILD PARA PRODUCCIÓN

### Backend Build & Deploy

**Opción A: Deploy en Railway/Render/Vercel (Easiest)**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Init project desde redate-app/BE
railway init

# Add PostgreSQL + Redis
railway add postgresql
railway add redis

# Deploy
railway up

# Get URLs del dashboard
# Update .env con DATABASE_URL and REDIS_URL del dashboard
```

**Opción B: Deploy en AWS (Recommended para production)**

1. Create EC2 instance (t3.medium recommended)
2. Install dependencies:
```bash
# SSH EC2
ssh -i redate.pem ec2-user@your-ec2-instance

# Install Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18

# Install Postgres
sudo yum install postgresql postgresql-server postgresql-contrib

# Install Redis
sudo yum install redis
sudo systemctl start redis
sudo systemctl enable redis
```

3. Setup database + schema (usar schema.sql)
4. Upload code (rsync or SCP):
```bash
rsync -avz redate-app/BE/ ec2-user@your-ec2:/var/www/redate-app/
```

5. Setup PM2 para proceso en background:
```bash
cd /var/www/redate-app
npm install
npm install -g pm2
pm2 start src/index.js --name redate-backend
pm2 save
pm2 startup
```

6. Setup Nginx reverse proxy:
```nginx
server {
    listen 80;
    server_name api.redate.app;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

7. Setup HTTPS cert con Let's Encrypt (Certbot)
8. Restart Nginx: `sudo systemctl restart nginx`

**Opción C: Docker Deployment**

```bash
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "run", "start"]

# Build image
docker build -t redate-backend:latest .

# Run container
docker run -d \
  --name redate-backend \
  --env-file .env \
  -p 3000:3000 \
  --network redate-network \
  redate-backend:latest

# Or use Docker Compose
docker-compose up -d
```

### Frontend Build & Deplo

**Para Expo Managed Apps:**

1. Configure app.json con Expo config correcto:
```json
{
  "expo": {
    "name": "REDATE",
    "slug": "redate-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#0f172a"
    },
    "ios": {
      "bundleIdentifier": "com.redate.app",
      "supportsTablet": true,
      "config": {
        "googleSignIn": {
          "reservedClientId": "com.googleusercontent.apps.123456789"
        },
        "usesNonExemptEncryption": false
      }
    },
    "android": {
      "package": "com.redate.app",
      "permissions": [
        "INTERNET",
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
    },
    "plugins": [
      "expo-secure-store"
    ],
    "extra": {
      "eas": {
        "projectId": "redate-app-id-from-eas"
      }
    }
  }
}
```

2. Create EAS (Expo Application Services) build:
```bash
cd FE
npx eas-cli build --platform ios
npx eas-cli build --platform android
```

3. Submit stores (EAS handles):
```bash
# iOS
npx eas-cli submit --platform ios

# Android
npx eas-cli submit --platform android
```

4. Monitor build status en https://expo.dev

**Para Standalone Apps (React Native CLI):**

```bash
# iOS
cd ios && pod install
cd ..
npx react-native run-ios

# Build IPA para TestFlight/App Store
cd ios && xcodebuild archive
# Use Xcode para submit

# Android
npx react-native run-android
# Build AAB para Play Store
cd android && ./gradlew bundleRelease
# Use Google Play Console para submit
```

---

## 🔒 SETUP DE SEGURIDAD PRODUCCIÓN

### 1. Firewall Rules (AWS Security Groups):
- Inbound Traffic:
  - 80 (HTTP) desde anywhere
  - 443 (HTTPS) desde anywhere
  - 22 (SSH) desde tu IP solamente
  - 3000 (local testing, no en production)

### 2. SSL Certificates:
```bash
# Ubuntu/Debian
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.redate.app

# Auto renew
sudo certbot renew --dry-run
```

### 3. Database Security:
```sql
-- Create dedicated database user
CREATE USER redate_app_user WITH PASSWORD 'strong-random-password';
GRANT ALL PRIVILEGES ON DATABASE redate_db TO redate_app_user;

-- Restrict connections (pg_hba.conf)
# host    redate_db    redate_app_user    10.0.0.0/8    md5
```

### 4. Redis Security:
```bash
# Require password
REDIS_PASSWORD=strong-password-redis

# Disable dangerous commands
CONFIG SET rename-command FLUSH ""
CONFIG SET rename-command CONFIG ""
```

### 5. Environment Variables:
- Never commit `.env` file
- Use environment-specific config files (`.env.production`, `.env.staging`)
- Rotate secrets periodically

---

## 📊 MONITORING EN PRODUCTION

### 1. PM2 Monitoring:
```bash
pm2 monit
pm2 logs redate-backend
pm2 save
pm2 startup
```

### 2. Application Logs:
```bash
# Configure winston logger en producción
# Logs stored en /var/log/redate-app/ (rotating logs)
```

### 3. Database Monitoring:
- PostgreSQL logs: `/var/log/postgresql/`
- Use pgAdmin or DataGrip

### 4. Redis Monitoring:
```bash
redis-cli info
redis-cli monitor
redis-cli --stat
```

### 5. APM (Application Performance Monitoring):
- **Sentry**: Error tracking
- **Datadog**: Metrics & traces
- **New Relic**: Monitoring + analytics

---

## 🔄 CI/CD PIPELINE

### GitHub Actions (.github/workflows/deploy.yml):

```yaml
name: Deploy REDATE Backend

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Run tests
        run: npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy via SSH
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          script: |
            cd /var/www/redate-app
            git pull origin main
            npm install
            pm2 restart redate-backend
```

---

## 💰 COSTOS PRODUCCIÓN (PRIMER AÑO)

### Backend Hosting (AWS):
- EC2 (t3.medium): ~€25-40/mes
- PostgreSQL on RDS (db.t3.micro): ~€15-25/mes
- ElastiCache Redis (cache.t3.small): ~€10-18/mes
- **Total:** ~€50-83/mes

### Firebase (Spark Plan): €0 - €100 (según límites: 10GB firestore, 20GB storage, 10MB/sec bandwidth)

### Hosting Frontend:
- **Expo EAS:** €30-80/mes (según build frequency)
- **CDN/Assets:** ~€5-15/mes

### Domain + SSL:
- Domain (redate.app): ~€10-15/año
- Let's Encrypt SSL: GRATIS

**TOTAL APROX:** €600-1,000/mes para 10k-50k usuarios

---

## 📝 CHECKLIST PRE-LAUNCH

### **Backend:**
- [ ] Database schema deployed
- [ ] SSL certificates configured
- [ ] Firewall rules set
- [ ] Health check endpoint working
- [ ] Error monitoring setup (Sentry)
- [ ] Database backups automated (daily)

### **Frontend:**
- [ ] Build iOS (TestFlight tested)
- [ ] Build Android (Internal track tested)
- [ ] Firebase configured production
- [ ] Deep links configured (one-time setup)
- [ ] Push notifications tested (sandbox, luego production)

### **External Services:**
- [ ] Stripe prices verified test → production
- [ ] Mapbox tokens production
- [ ] Firebase Firestore rules security implemented
- [ ] Email sending (SendGrid/Mailgun) configured

### **Legal:**
- [ ] Privacy Policy published
- [ ] Terms of Service published
- [ ] GDPR compliance (Europe)
- [ ] App Store description written (ES + EN)
- [ ] App Store screenshots (various devices)

---

## 🚀 LAUNCH DAY

1. **Soft Launch:**
   - Invite 100-200 friends/family
   - Test core flows: register → swipe → match → chat
   - Collect feedback
   - Fix critical bugs

2. **Beta Launch:**
   - Submit to TestFlight (iOS)
   - Submit to Internal Testing (Google Play)
   - Onboard 1,000-5,000 users
   - Monitor metrics: DAU, retention, matches/sent/swipes/sent
   - Iterate on feedback

3. **Public Launch:**
   - Submit to App Store & Google Play (review takes 1-3 days)
   - Launch marketing campaign
   - Monitor server capacity (autoscale si necesario)
   - 24h on-call support

---

## 🆘 TROUBLESHOOTING

### Issue: Database Connection Errors
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connection string
psql postgresql://user:pass@localhost/dbname

# Enable PostGIS (si geolocalización no funciona)
CREATE EXTENSION IF NOT EXISTS postgis;
```

### Issue: Redis Connection Failures
```bash
# Check Redis status
sudo systemctl status redis

# Test connection
redis-cli ping

# Restart Redis
sudo systemctl restart redis
```

### Issue: Push Notifications Not Working
```bash
# Check Firebase project config
# Check FCM server key
# Test with Firebase Console → Cloud Messaging → Test

# iOS device tokens expire faster than expected
# Ensure FCM tokens refreshed regularly
```

### Issue: Stripe Webhooks
```bash
# Use ngrok en development
ngrok http 3000

# Update webhook endpoint en Stripe Dashboard
# ngrok URL /api/subscription/webhook
```

---

## 📚 REFERENCIAS ÚTILES

- **Expo Docs:** https://docs.expo.dev
- **Firebase Docs:** https://firebase.google.com/docs
- **Stripe Docs:** https://stripe.com/docs
- **PostgreSQL Docs:** https://www.postgresql.org/docs
- **React Navigation:** https://reactnavigation.org

---

**Última actualización:** 2025-02-22
**Estado:** MVP completo, listo para deployment y testing 💕