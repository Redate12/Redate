# 🪟 REDATE - WINDOWS QUICK START (PASO A PASO)

## 📋 RESUMEN RÁPIDO

**Este documento te guía paso a paso desde cero hasta tener REDATE corriendo en Windows con Android smartphone.**

---

## 🚀 PASO 0: PREPARANDO (10 minutos)

### **0.1 Verifica que tienes instalado:**

Abre PowerShell y ejecuta:

```powershell
# Verificar Node.js
node --version
# Si dice "command not found", instalar:
# https://nodejs.org/download/release/v18.19.1/

# Verificar npm
npm --version

# Verificar Git
git --version
# Si dice "command not found", instalar:
# https://git-scm.com/download/win
```

### **0.2 Instalar Node.js si falta:**
```
1. Ir a: https://nodejs.org/download/release/v18.19.1/
2. Download: "node-v18.19.1-x64.msi"
3. Ejecutar installer
4. Click "Next" → "Next" → "Install"
5. Terminar → Restart terminal
```

### **0.3 Instalar Git si falta:**
```
1. Ir a: https://git-scm.com/download/win
2. Download: "Git-2.x.x-64-bit.exe"
3. Ejecutar installer
4. Click "Next" varias veces
5. Terminar → Restart terminal
```

### **0.4 Instalar Expo CLI:**
```powershell
npm install -g expo-cli
```

---

## 🗄️ PASO 1: INSTALAR POSTGRESQL (15 minutos)

### **Opción A: PostgreSQL Installer (Más fácil)** ⭐

```
1. Ir a: https://www.postgresql.org/download/windows/
2. Download: "PostgreSQL 15.x"
3. Ejecutar installer
4. Setup:
   - Password: redate_password (¡anotar esto!)
   - Port: 5432
   - Locale: Spanish_Europe.1252
5. Click "Next" → "Next" → "Finish"
```

### **Verificar PostgreSQL instaló:**

```powershell
# En PowerShell
psql --version
# Debería mostrar: psql (PostgreSQL) 15.x

# Probar conexión:
psql -U postgres -d postgres
# Te pedirá contraseña: redate_password

# Crear database:
CREATE DATABASE redate_db;
\q
```

### **Opción B: Usar Docker Desktop** (si ya lo tienes)

```powershell
# En PowerShell
docker run -d \
  --name redate-postgres \
  -e POSTGRES_PASSWORD=redate_password \
  -e POSTGRES_DB=redate_db \
  -p 5432:5432 \
  postgres:15-alpine

# Verificar:
docker ps
# Deberías ver "redate-postgres" corriendo
```

---

## 🔴 PASO 2: INSTALAR REDIS (5 minutos)

### **Opción A: Memurai (Redis en Windows)** ⭐

```
1. Ir a: https://www.memurai.com/get-memurai
2. Register (gratuito)
3. Download Memurai Enterprise
4. Ejecutar installer
5. Click "Next" → "Install"
```

### **Opción B: Docker Desktop** (si ya lo tienes)

```powershell
docker run -d \
  --name redate-redis \
  -p 6379:6379 \
  redis:7-alpine

# Verificar:
docker ps
# Deberías ver "redate-redis" corriendo
```

### **Opción C: Redis Cloud (más fácil)**

```
1. Ir a: https://redis.com/try-free/
2. Sign up gratuito
3. Crear database gratuito (30MB)
4. Copiar connection string (Redis URL)
```

### **Verificar Redis:**

```powershell
# Si usas Memurai o Redis Cloud con redis-cli:
redis-cli ping
# Debería decir: PONG

# Si usas Docker:
docker exec -it redate-redis redis-cli ping
# Debería decir: PONG
```

---

## 💼 PASO 3: CONFIGURAR VARIABLES DE ENTORNO (10 minutos)

### **3.1 Crear archivo .env**

En PowerShell:

```powershell
cd C:\Users\TuUsuario\.openclaw\workspace\redate-app\BE
```

Crear archivo `.env` (usar VS Code):

```powershell
code .
# VS Code se abre
# Crear archivo: .env
# Pegar lo siguiente:
```

### **3.2 Contenido de .env:**

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
JWT_SECRET=tu-muy-secreto-jwt-token-minimo-32-caracteres
JWT_EXPIRES_IN=7d

# Firebase (AÚN NO TIENES ESTO - usar placeholders)
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"redate-app-placeholder"}'

EXPO_PUBLIC_FIREBASE_API_KEY=placeholder-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=redate-app.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=redate-app
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=redate-app.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:placeholder

# Stripe (AÚN NO TIENES ESTO - usar placeholders)
STRIPE_SECRET_KEY=sk_test_placeholder
STRIPE_PUBLISHABLE_KEY=pk_test_placeholder
STRIPE_WEBHOOK_SECRET=whsec_placeholder
STRIPE_CURRENCY=usd

STRIPE_PRICE_PLUS=price_placeholder
STRIPE_PRICE_GOLD=price_placeholder
STRIPE_PRICE_PLATINUM=price_placeholder
STRIPE_PRICE_BOOST_SUPER_LIKE=price_placeholder
STRIPE_PRICE_BOOST_30M=price_placeholder
STRIPE_PRICE_BOOST_1H=price_placeholder

# Mapbox (placeholder por ahora)
MAPBOX_ACCESS_TOKEN=pk.placeholder

# Email (opcional)
SENDGRID_API_KEY=SG.placeholder
SENDGRID_FROM_EMAIL=noreply@redate.app
```

---

## 🗂️ PASO 4: EJECUTAR SCHEMA DE BASE DE DATOS (5 minutos)

### **4.1 Si usas PostgreSQL local:**

```powershell
cd C:\Users\TuUsuario\.openclaw\workspace\redate-app\BE

# Ejecutar schema:
psql -U postgres -d redate_db -f src\database\schema.sql
# Password: redate_password
```

### **4.2 Verificar database creada:**

```powershell
psql -U postgres -d redate_db
\dt
# Deberías ver list of tables:
# users user_preferences swipes matches messages subscriptions reports boosts
\q
```

---

## 📦 PASO 5: INSTALAR DEPENDENCIAS DEL BACKEND (10 minutos)

```powershell
cd C:\Users\TuUsuario\.openclaw\workspace\redate-app\BE

npm install
# Esto tomará 2-5 minutos
# Instala: express, pg, redis, firebase-admin, stripe, etc.
```

### **Verificar:**

```powershell
npm list
# Deberías ver ~100+ packages
```

---

## 🌐 PASO 6: INICIAR BACKEND (1 minuto)

### **6.1 Iniciar backend:**

```powershell
# En PowerShell
cd C:\Users\TuUsuario\.openclaw\workspace\redate-app\BE

npm run dev
# Verás:
# ✅ REDATE API Server running on http://localhost:3000
# ✅ Database connected
# ✅ Redis connected
```

### **6.2 Test health endpoint:**


# Use PowerShell to send request
$test_response = Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing
Write-Host $test_response.Content

# Expected output confirms backend functionality
```

---

## 📱 PASO 7: INSTALAR DEPENDENCIAS DEL FRONTEND (10 minutos)

### **ABRIR NUEVA POWER SHELL (Terminal 2):**

```powershell
# Terminal 2
cd C:\Users\TuUsuario\.openclaw\workspace\redate-app\FE

npm install react-native-deck-swiper
# Esto tomará 2-5 minutos
```

---

## 🎪 PASO 8: INICIAR EXPO (FRONTEND) (1 minuto)

### **8.1 Iniciar Expo en Terminal 2:**

```powershell
cd C:\Users\TuUsuario\.openclaw\workspace\redate-app\FE

npm start
# Verás:
# Expo DevTools is running at http://localhost:19002
#
# › Android → Scan the QR code with Expo Go
# › Scan the QR code above with the Expo app (Android)
# › URL: exp://192.168.1.xxx:19000
```

---

## 🤖 PASO 9: CONFIGURAR ANDROID SMARTPHONE (5 minutos)

### **9.1 En tu Android smartphone:**

```
1. Abre Google Play Store
2. Buscar: "Expo Go"
3. Install (gratis)
4. Open app
```

### **9.2 Conectar a misma WiFi:**

```
Asegúrate que:
- PC está conectado a WiFi
- Android smartphone conectado a MISMA WiFi
- NO usar datos móviles
```

### **9.3 Scan QR code:**

```
En Android smartphone (Expo Go app):
1. Click "Scan QR code"
2. Usar cámara para escanear QR code en tu Terminal 2
3. App se carga automáticamente
```

---

## ✅ PASO 10: TESTING (5 minutos)

### **10.1 En Android smartphone:**

```
Deberías ver REDATE app con:
- Onboarding screen (registro)
- Login screen (login)
- O navigation a Home/Swipe/etc.

Prueba:
1. Click "Sign Up"
2. Enter email, password, name
3. Click "Register"
4. Navega por screens
```

### **10.2 En Terminal 2 (Expo):**

```
Verás logs de Expo:
› Opening exp://192.168.1.xxx:19000
› Metro waiting on exp://192.168.1.xxx:19000
› Bundling complete

Y logs de app:
App is running
```

### **10.3 En Terminal 1 (Backend):**

```
Verás logs de server:
[INFO] Server running on port 3000
[INFO] Database connected
[INFO] Redis connected
[INFO] POST /api/auth/register
[INFO] User created: test@redate.app
```

---

## 🔧 PUESTO A PUNTO (TODO CORRIENDO)

### **ESTADO FINAL:**

```
Terminal 1: Backend API (http://localhost:3000) ✅
Terminal 2: Expo dev server (http://localhost:19006) ✅
PostgreSQL: Database redate_db corriendo ✅
Redis: Cache corriendo ✅
Android smartphone: REDATE app corriendo con Expo Go ✅
```

### **TESTING NOW:**

```
Frontend (Android):
- Onboarding ✅
- Login ✅
- Swipe feed ✅ (sin backend real todavía)
- Navigation ✅

Backend (lo mismo):
- API server listening ✅
- Database ready ✅
- Redis ready ✅
```

---

## 🎯 PASO 11: FIREBASE + STRIPE CONFIG (AÚN NECESARIO)

**Luego de tener todo arriba, necesitas:**

### **11.1 Firebase:**
```
1. Crear proyecto Firebase
2. Enable Auth
3. Create Firestore database
4. Enable FCM
5. Descargar service account key
6. Actualizar .env con Firebase credentials
```

### **11.2 Stripe:**
```
1. Crear productos en USD ($9.99, $19.99, $29.99)
2. Crear boost products ($0.49, $1.49, $2.49)
3. Copiar price IDs
4. Configurar webhooks
5. Copiar API keys
6. Actualizar .env con Stripe credentials
```

---

## 📊 DIAGRAMA DEL PASEO A PASEO

```
┌─────────────────────────────────────────────────────────────┐
│ Windows Setup (Tú)                                          │
├─────────────────────────────────────────────────────────────┤
│ 1. Instalar Node.js         ✅ (10 min)                     │
│ 2. Instalar Git            ✅ (5 min)                       │
│ 3. Instalar Expo CLI       ✅ (2 min)                       │
│ 4. Instalar PostgreSQL     ✅ (15 min)                      │
│ 5. Instalar Redis          ✅ (5 min)                       │
├─────────────────────────────────────────────────────────────┤
│ Project Setup (Tú)                                          │
├─────────────────────────────────────────────────────────────┤
│ 6. Crear .env              ✅ (5 min)                       │
│ 7. Ejecutar schema SQL     ✅ (3 min)                       │
│ 8. Instalar backend deps   ✅ (5 min)                       │
│ 9. Instalar frontend deps  ✅ (5 min)                       │
├─────────────────────────────────────────────────────────────┤
│ Running (Tú)                                                │
├─────────────────────────────────────────────────────────────┤
│ 10. npm run dev (backend)    🟢 Port 3000                  │
│ 11. npm start (frontend)    🟢 Port 19000                 │
│ 12. Android smartphone      🟢 Expo Go app                 │
├─────────────────────────────────────────────────────────────┤
│ External Services (Tú + Dashboard Web)                     │
├─────────────────────────────────────────────────────────────┤
│ 13. Firebase              ⏳ (20 min)                       │
│ 14. Stripe                ⏳ (15 min)                       │
└─────────────────────────────────────────────────────────────┘

TIEMPO TOTAL: ~90 minutos
```

---

## 🆘 SOLUCIÓN DE PROBLEMAS (WINDOWS)

### **Problema: "node: command not found"**
**Solución:**
```powershell
# Reinstalar Node.js
# Ensure "Add to PATH" checkbox seleccionado
# Restart PowerShell
```

### **Problema: "psql: command not found"**
**Solución:**
```powershell
# Reinstalar PostgreSQL
# Ensure binaries added to PATH
# O usa Docker Desktop
```

### **Problema: "redis-cli: command not found"**
**Solución:**
```powershell
# Usar Redis Cloud (más fácil)
# O usa Docker Desktop
# O instalar Memurai
```

### **Problema: Port 3000 ocupado**
**Solución:**
```powershell
# Matar proceso:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### **Problema: Android smartphone no se conecta**
**Solución:**
- Asegúrate ambas devices en misma WiFi
- Apaga datos móviles en smartphone
- Restart network (apagar/encender WiFi)
- Usar URL exp://192.168.1.xxx:19000 en Expo Go (scan QR code)

### **Problema: Expo dev tools no abre**
**Solución:**
```powershell
# Abrir en navegador:
http://localhost:19006

# O abrir Expo DevTools:
http://localhost:19002
```

---

## ✨ LISTO PARA PROXIMO PASO

**AHORA TIENES:**
- ✅ Backend API corriendo
- ✅ Frontend corriendo con Expo
- ✅ Android smartphone conectado
- ✅ Database lista
- ✅ Redis listo

**NEXTO PASO:**
1. Configurar Firebase (ahora mismo en Firebase Dashboard)
2. Configurar Stripe (en Stripe Dashboard)
3. Actualizar .env con credentials reales
4. Testing completó con backend + frontend + Firebase + Stripe

---

**¿Ya instalaste PostgreSQL y Redis?** Dime y seguimos con Firebase + Stripe. 💕🪟