# 🍎 iPhone + Windows - Guía Completa

## 🎯 Overview

**Buenas noticias: puedes hacer TODO con iPhone + Windows!**

- ✅ **Development & Testing:** iPhone + Expo Go (funciona desde Windows)
- ✅ **Build + App Store:** EAS Build (cloud Mac) desde Windows

**SÍ se puede:**
- Testing en iPhone real con Expo Go
- Build iOS app desde Windows
- Upload a App Store desde Windows

**NO necesitas Mac.**

---

## 📦 Fase 1: Testing con iPhone (Development)

### Paso 1: Instalar Expo Go en iPhone

```
iPhone → App Store → "Expo Go" → Install (gratis)
```

### Paso 2: Iniciar Expo en Windows

```powershell
# Terminal 2
cd C:\Users\TuUsuario\.openclaw\workspace\redate-app\FE
npm start
```

**Verás:**
```
Starting development server

› Scan the QR code with Expo Go (Android)
› Press a │ open Android
› Press s │ scan QR code
› Press w │ open web

› URL: exp://192.168.1.xxx:19000
```

### Paso 3: Connect iPhone (2 métodos)

#### Método A: Enter URL manually (Más fácil)

```
En iPhone (Expo Go app):
1. Click "Enter URL manually"
2. Enter: exp://192.168.1.xxx:19000
3. Click "Go"
4. App cargado! ✅
```

#### Método B: Scan QR Code

```
En PC:
1. Presiona "s" en terminal
2. Scan QR code con iPhone
3. App cargado! ✅
```

### Paso 4: Testing en iPhone

**Prueba flows:**
- Onboarding → Sign Up → Login
- Swipe cards
- Navigate tabs
- Chat interface
- Profile settings

**Verifica:**
- UI adapta a iPhone size
- Touch interactions
- Performance

---

## 📦 Fase 2: EAS Build (Production)

### Paso 1: Setup EAS Account

```powershell
# 1. Signup
https://expo.dev/signup

# 2. Login
cd C:\Users\TuUsuario\.openclaw\workspace\redate-app\FE
npx eas-cli login

# 3. Configure project
npx eas-cli build:configure

# Responde:
Project name: redate-app
Framework: expo
```

### Paso 2: Create eas.json file

```powershell
cd C:\Users\TuUsuario\.openclaw\workspace\redate-app\FE

# Crear eas.json
code .
```

**Contenido:**

```json
{
  "cli": {
    "version": ">= 7.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      }
    },
    "production": {
      "ios": {
        "autoIncrement": true
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "tu-apple-id-email@example.com",
        "ascAppId": "YOUR_APP_STORE_CONNECT_APP_ID",
        "appleTeamId": "YOUR_APPLE_TEAM_ID"
      }
    }
  }
}
```

### Paso 3: Apple Developer Account

**REQUIRED para App Store:**

```
1. Sign up: https://developer.apple.com/programs/enroll/
   Costo: $99 USD/año (≈€92 EUR/año)

2. Create App ID:
   - Bundle ID: com.redate.app
   - Description: REDATE Dating App
   - Capabilities:
     ✓ Push Notifications
     ✓ In-App Purchase
     ✓ Maps

3. Create Provisioning Profiles:
   - Development profile (para testing)
   - Distribution profile (para production)
```

### Paso 4: EAS Build iOS

```powershell
cd C:\Users\TuUsuario\.openclaw\workspace\redate-app\FE

# Build para production
npx eas-cli build --platform ios --profile production
```

**Proceso:**
1. EAS inicia build en cloud Mac
2. Espera 10-30 minutos
3. Descarga `.ipa` file
4 `.ipa` file listo para App Store

### Paso 5: Upload a App Store

#### Opción A: EAS Submit (Más fácil)

```powershell
npx eas-cli submit --platform ios
```

- EAS upload y submit
- Revisa app listing
- Submit for review

#### Opción B: Transporter App (Windows)

```
1. Install from Microsoft Store:
   Microsoft Store → "Transporter" → Install

2. Login con Apple Developer ID

3. Drag & drop .ipa to Transporter

4. Upload to App Store Connect
```

### Paso 6: App Store + Review

**En App Store Connect (https://appstoreconnect.apple.com):**

1. **Create New App**
   - Name: REDATE
   - Bundle ID: com.redate.app
   - SKU: REDATE-001
   - Platform: iOS

2. **Setup App Information**
   - Category: Lifestyle or Social Networking
   - Age Rating: 17+ (dating apps)
   - Description (Spanish + English)

3. **Screenshots**
   - 6.5" iPhone (iPhone 12/13/14 Pro Max): 1242 x 2688
   - 5.5" iPhone (iPhone 8 Plus): 1242 x 2208
   - Mínimo 6.5" screenshots (Spanish + English)

4. **App Privacy**
   - Complete privacy practices
   - Data types collected

5. **Submit for Review**
   - Review time: 1-3 business days
   - May request changes

---

## 🛠 Setup app.json (iOS Config)

Update `FE/app.json`:

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
      "buildNumber": "1",
      "supportsTablet": true,
      "infoPlist": {
        "NSCameraUsageDescription": "REDATE necesita acceso a cámara para fotos de perfil",
        "NSPhotoLibraryUsageDescription": "REDATE necesita acceso a galería para fotos de perfil",
        "NSLocationWhenInUseUsageDescription": "REDATE necesita tu ubicación para encontrar matches cercanos"
      }
    },
    "plugins": [
      "expo-secure-store",
      [
        "@sentry/react-native/expo",
        {
          "organization": "tu-organization",
          "project": "tu-project"
        }
      ]
    ]
  }
}
```

---

## 📱 Testing en Device Real (No Simulator)

Porque usas iPhone real, hay ventajas:

**Ventajas de iPhone real vs Simulator:**
- ✅ Native performance verification
- ✅ Real camera access (pa testing foto)
- ✅ Real location services (GPS)
- ✅ Real push notifications (con production APNs)
- ✅ Real biometrics (Face ID/Touch ID)
- ✅ Better device size verification

---

## 🔧 Troubleshooting (iPhone Windows)

### iPhone no puede conectar

**Solución 1: Misma WiFi**
- PC y iPhone en MISMA red WiFi
- Apagar datos móviles en iPhone

**Solución 2: HTTP URL**
```
Intenta: http://192.168.1.xxx:19000 (en vez de exp://)

En Expo Go → Enter URL → http://192.168.1.xxx:19000
```

**Solución 3: Restart Expo**
```powershell
# Restart development server
Ctrl + C
npm start
```

### EAS Build falla

**Solución 1: Actualizar CLI**
```powershell
npm install -g eas-cli@latest
```

**Solución 2: Limpiar cache**
```powershell
npx expo start --clear
```

**Solución 3: Verificar app.json**
- Bundle ID correcto: com.redate.app
- iOS config completo

### App Store rejected

**Reasons comunes:**
- ⚠️ Missing permissions info: Update infoPlist
- ⚠️ No screenshots: Upload mínimo 6.5" screenshots
- ⚠️ Missing review info: Complete app listing
- ⚠️ Violation of terms: Read App Store Guidelines

---

## 💰 Costes Totales (iPhone Windows)

| Item | Costo |
|------|-------|
| Node.js, Git, PostgreSQL, Redis | €0 |
| Expo CLI + EAS Build (Development) | €0 |
| iPhone + Expo Go (testing) | €0 |
| **TOTAL development** | **€0** ✅ |

| Item | Costo |
|------|-------|
| Apple Developer Account | $99 USD/año |
| EAS Build (production) | Free tier 100 builds/mes |
| App Store listing | €0 |
| **TOTAL production** | **~€92/año** |

---

## 🎯 Checklist Final - iPhone Windows

### Development (Ahora mismo)
- [ ] Expo Go instalado en iPhone
- [ ] Expo iniciado en Windows
- [ ] iPhone conectado (exp://192.168.1.xxx:19000)
- [ ] Onboarding flow testing
- [ ] Navigation testing
- [ ] UI adapted to iPhone

### Production (Más adelante)
- [ ] Apple Developer account ($99)
- [ ] EAS account created
- [ ] eas.json configured
- [ ] App ID created (com.redate.app)
- [ ] Provisioning profiles
- [ ] EAS build iOS completed
- [ ] .ipa uploaded
- [ ] App Store listing complete
- [ ] Screenshots uploaded
- [ ] App submitted for review

---

## 📚 Recursos Útiles

**Expo + iOS:**
- https://docs.expo.dev/build/introduction/
- https://docs.expo.dev/submit/introduction/

**App Store Connect:**
- https://appstoreconnect.apple.com

**Apple Guidelines:**
- https://developer.apple.com/app-store/review/guidelines/

---

## 🎉 CONCLUSIÓN

**iPhone + Windows = TOTALMENTE POSIBLE!**

**Testing ahora:** Usa iPhone + Expo Go (Windows puede host dev server)

**Build más adelante:** Usa EAS Build (cloud Mac) → Upload a App Store

**NO necesitas Mac.**

---

**¿Listo para testing en iPhone ahora mismo?** 🍎