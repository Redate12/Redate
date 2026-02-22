const express = require('express');
const router = express.Router();

const {
  createSubscription,
  cancelSubscription,
  upgradeSubscription,
  getSubscriptionStatus,
  processInAppPurchase,
  refundSubscription
} = require('../controllers/subscription');

const middleware = require('../middleware/auth');

// Crear subscripción (Stripe)
router.post('/create', middleware, createSubscription);

// Cancelar subscripción
router.post('/cancel', middleware, cancelSubscription);

// Upgrade subscripción
router.post('/upgrade', middleware, upgradeSubscription);

// Estado de subscripción
router.get('/status', middleware, getSubscriptionStatus);

// Procesar compra in-app (Apple/Google)
router.post('/iap', middleware, processInAppPurchase);

// Reembolso
router.post('/refund', middleware, refundSubscription);

module.exports = router;