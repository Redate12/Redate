# 🚀 REDATE - COMIENZO RÁPIDO

## 📍 UBICACIÓN

```
/Users/agentebond/.openclaw/workspace/redate-app/
```

## ▶️ PASO 1: Setup Git + Push a GitHub

### Windows:
```powershell
cd C:\Users\TuUsuario\.openclaw\workspace\redate-app
.\setup-git.bat
```

### Mac/Linux:
```bash
cd ~/.openclaw/workspace/redate-app
chmod +x setup-git.sh
./setup-git.sh
```

El script hace:
1. ✅ Initialize Git
2. ✅ Add files
3. ✅ Create commit
4. ✅ Create GitHub repo
5. ✅ Push to GitHub

---

## 📱 PASO 2: Testing en iPhone

### En iPhone:
1. App Store → "Expo Go" → Install
2. Abrir Expo Go
3. "Enter URL manually"
4. Entra: `exp://192.168.1.xxx:19000`
5. ¡REDATE app cargada!

### En Windows (Terminal 2):
```powershell
cd C:\Users\TuUsuario\.openclaw\workspace\redate-app\FE
npm install react-native-deck-swiper
npm start
```

---

## 🔧 PASO 3: Configurar Firebase

1. https://console.firebase.google.com → Create project: `redate-app`
2. Auth: Email/Password + Google
3. Firestore Database: Create (España/EU)
4. Messaging: Enable
5. Download service account key
6. Update `BE/.env` with credentials

---

## 💳 PASO 4: Configurar Stripe (USD)

En Stripe Dashboard:
1. Products → Add Product

**Subscriptions:**
- PLUS: $9.99/month, Recurring
- GOLD: $19.99/month, Recurring
- PLATINUM: $29.99/month, Recurring

**Boosts:**
- SuperLike: $0.49, One-time
- Boost 30m: $1.49, One-time
- Boost 1h: $2.49, One-time

2. Copy Price IDs
3. Create Webhook
4. Copy API keys
5. Update `BE/.env`

---

## ✅ ESTADO ACTUAL

| Componente | Estado |
|------------|--------|
| Backend API | ✅ 100% |
| Frontend | ✅ 100% |
| Database schema | ✅ 100% |
| Stripe config | ⏳ 0% (aún a configurar) |
| Firebase config | ⏳ 0% (aún a configurar) |
| GitHub repo | 0%(no creado aún) |
| Testing en iPhone | ⏳ 0% (app no iniciado) |
| Production deployment | 0%, (pending project setup) |

---

## 📚 Documentación

- [`QUE_HACER_AHORA.txt`](QUE_HACER_AHORA.txt) - Guía paso a paso completa
- [`docs/API.md`](docs/API.md) - API endpoints
- [`docs/STRIPE_GUIDE.md`](docs/STRIPE_GUIDE.md) - Stripe USD
- [`docs/DEPLOYMENT.md`](DEPLOYMENT.md) - Production

---

## 🎯 Preguntas?

Ver [`QUE_HACER_AHORA.txt`](QUE_HACER_AHORA.txt) para guía completa.

---

**💕 REDATE Dating App - iOS + Android - Built with Love 💕**