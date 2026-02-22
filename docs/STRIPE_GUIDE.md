# STRIPE INTEGRATION GUIDE FOR REDATE 💳

## Overview

REDATE usa **STRIPE STANDARD** (NO Stripe Connect) para:
- ✅ Suscripciones mensuales (PLUS/GOLD/PLATINUM) en **USD**
- ✅ Pagos one-time (SuperLike, Boost 30min, Boost 1h) en **USD**

**Stripe Connect NO es necesario** porque REDATE es B2C, no marketplace.

---

## Productos y Precios (USD)

### Suscripciones (Monthly Recurring)

| Tier | Price (USD) | Features | Product Name | Stripe Price Type |
|------|-------------|----------|--------------|-------------------|
| PLUS | $9.99/mes | Ilimitado +5 SuperLike + ver likes +150km | `REDATE PLUS Subscription` | price_plus_monthly |
| GOLD | $19.99/mes | PLUS + Passport + Leer pre-match + Distancia ilimitada | `REDATE GOLD Subscription` | price_gold_monthly |
| PLATINUM | $29.99/mes | GOLD +3 msgs pre-match + Support prioritario + Garantía | `REDATE PLATINUM Subscription` | price_platinum_monthly |

### Boosts (One-Time Payments)

| Type | Price (USD) | Description | Product Name |
|------|-------------|-------------|--------------|
| SuperLike | $0.49 | 1 SuperLike extra | `SuperLike Boost` |
| Boost 30m | $1.49 | Perfil destacado 30 min | `30-Minute Boost` |
| Boost 1h | $2.49 | Perfil destacado 1 hora | `1-Hour Boost` |

---

## Setup Stripe Paso a Paso

### 1. Create Stripe Account
```
https://dashboard.stripe.com/register
```
- **País:** Selecciona USA o usa cuenta con **USD enabled**
- Tipo: Empresa
- Verificar identidad

### 2. Enable USD Currency

Si tu cuenta es de otro país:
```
Dashboard → Settings → Payment Methods → Add currency: USD
```

### 3. Create Subscription Products (USD)

Para **cada** tier (PLUS, GOLD, PLATINUM):

```
Stripe Dashboard → Products → Add Product
```

**Configuración REDATE PLUS:**
- Name: `REDATE PLUS Subscription`
- Type: `Service`
- Description: `Acceso premium a REDATE - Tier: PLUS`

**Price Configuration:**
- Amount: `9.99` (USD)
- Currency: `USD` ⭐ **IMPORTANTE: USD, no EUR**
- Billing interval: `Monthly`

**Crear price ID:**
- Click en producto → Prices → Add Price
- Copiar el price ID (ej: `price_1PtXx...`)

**Repetir para GOLD ($19.99) y PLATINUM ($29.99)**

### 4. Create Boost Products (USD)

Para **cada** boost:

```
Stripe Dashboard → Products → Add Product
```

**SuperLike:**
- Name: `SuperLike Boost`
- Amount: `0.49` (USD)
- Currency: `USD` ⭐ USD!
- Type: `One-time`

**Boost 30min:**
- Name: `30-Minute Boost`
- Amount: `1.49` (USD)
- Currency: `USD`
- Type: `One-time`

**Boost 1h:**
- Name: `1-Hour Boost`
- Amount: `2.49` (USD)
- Currency: `USD`
- Type: `One-time`

### 5. Get Product/Price IDs

Stripe Dashboard → Products → Click **cada** producto → API ID:

```
price_plus_monthly       → price_1PtXxABC123...
price_gold_monthly       → price_1PtYxDEF456...
price_platinum_monthly   → price_1PtZxGHI789...

price_super_like         → price_1PuAxJKL012...
price_boost_30m          → price_1PuBzMNO345...
price_boost_1h           → price_1PuCxPQR678...
```

**⭐ CRUCIAL:** Verificar que los price IDs están en USD (no EUR)

### 6. Configure Webhooks

```
Stripe Dashboard → Developers → Webhooks → Add Endpoint
```

**Development (ngrok):**
```
URL: https://your-ngrok-url.com/api/subscription/webhook
```

**Production:**
```
URL: https://api.redate.app/api/subscription/webhook
```

**Select Eventos:**
- `checkout.session.completed`
- `payment_intent.succeeded`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

**Get Webhook Secret:**
```
Desde webhook endpoint → "Signing secret"
whsec_... (32+ chars)
```

### 7. Get API Keys

```
Stripe Dashboard → Developers → API Keys
```

Test Keys (Development):
```
Publishable Key: pk_test_abcdef123...
Secret Key: sk_test_abcdef123...
```

Production Keys:
```
Publishable Key: pk_live_abcdef123...
Secret Key: sk_live_abcdef123...
```

---

## Update Backend Configuration

### Edit `BE/.env`

```bash
# Stripe (USD)
STRIPE_SECRET_KEY=sk_test_abcdef123...
STRIPE_PUBLISHABLE_KEY=pk_test_abcdef123...
STRIPE_WEBHOOK_SECRET=whsec_abcdef123...
STRIPE_CURRENCY=usd

# Stripe Subscription Prices (USD)
STRIPE_PRICE_PLUS=price_1PtXxABC123...
STRIPE_PRICE_GOLD=price_1PtYxDEF456...
STRIPE_PRICE_PLATINUM=price_1PtZxGHI789...

# Stripe Boost Prices (one-time - USD)
STRIPE_PRICE_BOOST_SUPER_LIKE=price_1PuAxJKL012...
STRIPE_PRICE_BOOST_30M=price_1PuBzMNO345...
STRIPE_PRICE_BOOST_1H=price_1PuCxPQR678...
```

### Update `BE/src/config/stripe.js`

Ya actualizado con USD!

```javascript
const PRODUCT_INFO = {
  plus: {
    name: 'REDATE PLUS',
    price: 9.99,
    currency: 'USD',  // ⭐ USD, no EUR
    ...
  },
  gold: {
    name: 'REDATE GOLD',
    price: 19.99,
    currency: 'USD',  // ⭐ USD
    ...
  },
  platinum: {
    name: 'REDATE PLATINUM',
    price: 29.99,
    currency: 'USD',  // ⭐ USD
    ...
  },
};
```

---

## Backend Integration

### StripeService.js

El archivo `BE/src/services/StripeService.js` ya está implementado con:

- `createSubscription(tier)` - Crea suscripción en USD
- `purchaseBoost(boostType)` - Compra boost en USD
- `cancelSubscription(subscriptionId)` - Cancela suscripción
- `pauseSubscription(subscriptionId)` - Pausa suscripción
- `resumeSubscription(subscriptionId)` - Reanuda suscripción
- `createPaymentIntent(params)` - Crea PaymentIntent en USD
- `handleWebhook(event)` - Procesa eventos webhook (USD)

### API Endpoints

```
POST /api/subscription/create
Body: { tier: 'plus' }
Returns: { clientSecret, subscriptionId }

POST /api/subscription/cancel
Body: { subscriptionId }

POST /api/subscription/boost
Body: { boostType: 'super_like', paymentMethodId: 'pm_test_...' }

POST /api/subscription/webhook (Stripe webhook endpoint)
Body: { webhook event }
```

---

## Frontend Integration

### Payment Flow

1. **User taps "Upgrade to PLUS"**
2. Frontend calls `/api/subscription/create`
3. Backend crea Stripe Checkout Session (USD)
4. Frontend launches `StripeSheet` / Checkout
5. User completa payment (en USD)
6. Stripe envía webhook al backend
7. Backend updates `subscriptions` table en PostgreSQL

---

## Webhook Events

### `checkout.session.completed`
- User completó compra de suscripción (USD)
- Backend actualiza user tier + records subscription

### `payment_intent.succeeded`
- Payment exitoso (USD)
- Backend actualiza subscription payment status

### `customer.subscription.updated`
- Subscription cambiada (tier, pause/resume)
- Backend actualiza DB

### `customer.subscription.deleted`
- Subscription cancelada
- Backend degrada a FREE tier

### `invoice.payment_failed`
- Payment falló
- Backend envía notification a user + potentially suspend premium features

---

## Testing Stripe Locally (USD)

### Use ngrok para webhooks

```bash
# Install ngrok
brew install ngrok

# Start ngrok (expose port 3000)
ngrok http 3000

# Copy HTTPS URL
# https://abc123.ngrok-free.app
```

**Configure webhook en Stripe:**
```
URL: https://abc123.ngrok-free.app/api/subscription/webhook
Events: Selected above
```

**Backend:**
```bash
npm run dev
```

**Frontend:**
```bash
npm start
```

### Test Payment Flow (USD)

1. Open Expo Go app
2. Login → Profile → "Upgrade to PLUS"
3. Completa payment en Stripe sheet (verás USD $9.99)
4. Mira backend logs para webhook events
5. Verifica subscription creada en PostgreSQL

### Test en Stripe Dashboard

```
Dashboard → Payments → Filter by "test"
Dashboard → Customers → Test customer
Dashboard → Subscriptions → Active test subscriptions (verás USD)
```

---

## Revenue & Payouts (USD)

### Stripe Fees (International)
- **Payment processing:** +2.9% + $0.30 per transaction (USD)
- **Subscription billing:** Same fee
- **No monthly fee**

### Payout Schedule

Configura payouts:
```
Dashboard → Settings → Payouts → Schedule
```

Opciones:
- Daily (automatic)
- Weekly (select day)
- Manual (trigger payouts)

**Ejemplo (USD):**
- 1,000 users @ $9.99/mes = ~$6,800 revenue/mes
- Stripe fees: ~$197/mes (2.9% + $0.30 × 1,000)
- **Net: ~$6,600/mes**

### Currency Conversion

Si tu banco está en EUR/otra moneda:
- Stripe convierte automáticamente USD → tu moneda en payout
- Tasa de cambio del mercado (sin fees adicionales)

---

## Security

### Verify Webhooks

El código backend ya verifica webhooks:

```javascript
const sig = req.headers['stripe-signature'];
const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
```

### PCI DSS Compliance

Usando Stripe React Native / Checkout:
- **REDATE es PCI SAQ A compliant**
- Stripe maneja PCI DSS
- Datos de tarjeta nunca entran a tu server

### 3D Secure (SCA)

Stripe maneja automáticamente 3DS (SCA)
- Required en EU para >€30 (o $30 USD)
- Stripe prompts user en app

---

## Troubleshooting

### Webhooks no recibidos
- Verifica que endpoint es reachable
- Check ngrok/port forwards
- Verifica webhook secret matches

### Payment falla
- Check PaymentIntent status en Stripe Dashboard
- Verifica que la tarjeta es válida (usa test card numbers)
- Check 3D Secure

### Subscription no actualiza
- Check PostgreSQL logs
- Verifica que webhook events fired
- Check Stripe Dashboard → Subscriptions

### Currency mismatch (EUR instead of USD)
- **IMPORTANTE:** Verifica que todos los productos están en **USD**
- Dashboard → Products → Cada producto → Ver currency: `USD`
- Si ves EUR, recrear products con USD

---

## Stripe Test Card Numbers (USD)

For testing payments (USD):

```
Visa Success: 4242424242424242
Visa Decline: 4000000000000002
Visa 3DS: 4000002500003155
```

Expiry: 12/34 | CVC: 123 | ZIP: 12345

---

## Checklist Final (USD)

Antes de production, verifica:

- [ ] Todos los productos están en **USD** (no EUR)
- [ ] Todos los price IDs copiados a `.env`
- [ ] Webhook configurado en production URL
- [ ] Webhook secret en `.env`
- [ ] Test payment flow completo USD
- [ ] Verifica que Stripe fees son 2.9% + $0.30
- [ ] Configura payout schedule (daily/weekly/manual)

---

**Última actualización:** 2025-02-22
**Estado:** Stripe config completa con **USD** ready to implement 💵

---

## Quick Reference - Stripe en Redate

| Componente | Configuración | Moneda |
|-----------|---------------|--------|
| Suscripción PLUS | $9.99/mes | USD ✅ |
| Suscripción GOLD | $19.99/mes | USD ✅ |
| Suscripción PLATINUM | $29.99/mes | USD ✅ |
| SuperLike | $0.49 one-time | USD ✅ |
| Boost 30min | $1.49 one-time | USD ✅ |
| Boost 1h | $2.49 one-time | USD ✅ |

**Todo en USD. Todo correcto.** 💕