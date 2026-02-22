const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

// Stripe Product/Price IDs (from Stripe Dashboard)
const PRICES = {
  // Subscriptions (monthly) - USD
  plus: process.env.STRIPE_PRICE_PLUS,
  gold: process.env.STRIPE_PRICE_GOLD,
  platinum: process.env.STRIPE_PRICE_PLATINUM,

  // Boosts (one-time payments) - USD
  boost: {
    super_like: process.env.STRIPE_PRICE_BOOST_SUPER_LIKE,
    boost_30m: process.env.STRIPE_PRICE_BOOST_30M,
    boost_1h: process.env.STRIPE_PRICE_BOOST_1H,
  },
};

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

// Stripe product descriptions (for frontend display) - USD
const PRODUCT_INFO = {
  plus: {
    name: 'REDATE PLUS',
    price: 9.99,
    currency: 'USD',
    period: 'month',
    features: [
      'Swipes ilimitados',
      '5 Super Likes/día',
      'Undo ilimitado',
      'Ver quién te dio like',
      'Distancia hasta 150km',
      'Badge PLUS',
    ],
  },
  gold: {
    name: 'REDATE GOLD',
    price: 19.99,
    currency: 'USD',
    period: 'month',
    features: [
      'Todo de PLUS +',
      'Passport (otros países)',
      'Leer mensajes pre-match',
      'Distancia ilimitada',
      'Perfiles prioritarios',
      'Badge GOLD',
    ],
  },
  platinum: {
    name: 'REDATE PLATINUM',
    price: 29.99,
    currency: 'USD',
    period: 'month',
    features: [
      'Todo de GOLD +',
      '3 mensajes pre-match/sem',
      'Soporte prioritario 24/7',
      'Match garantizado/sem',
      'Badge PLATINUM',
      'Cero anuncios',
    ],
  },
};

// Boost prices - USD
const BOOST_PRICES = {
  super_like: {
    name: 'SuperLike',
    price: 0.49,
    currency: 'USD',
    description: '1 SuperLike extra',
  },
  boost_30m: {
    name: 'Boost 30 min',
    price: 1.49,
    currency: 'USD',
    description: 'Perfil destacado por 30 minutos',
  },
  boost_1h: {
    name: 'Boost 1 hora',
    price: 2.49,
    currency: 'USD',
    description: 'Perfil destacado por 1 hora',
  },
};

module.exports = {
  stripe,
  PRICES,
  WEBHOOK_SECRET,
  PRODUCT_INFO,
  BOOST_PRICES,
};