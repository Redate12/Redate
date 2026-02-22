const pool = require('../config/database');
const { stripe } = require('../config/stripe');

// Create subscription (Stripe)
exports.createSubscription = async (req, res) => {
  try {
    const { tier, payment_method_id } = req.body;
    const userId = req.userId;

    const validTiers = ['plus', 'gold', 'platinum'];
    if (!validTiers.includes(tier)) {
      return res.status(400).json({ error: 'Invalid tier' });
    }

    // Get user
    const userResult = await pool.query(
      'SELECT email, stripe_customer_id FROM users WHERE id = $1',
      [userId]
    );

    const user = userResult.rows[0];

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let customerId = user.stripe_customer_id;

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
      });

      customerId = customer.id;

      await pool.query(
        'UPDATE users SET stripe_customer_id = $1 WHERE id = $2',
        [customerId, userId]
      );
    }

    // Attach payment method
    await stripe.paymentMethods.attach(payment_method_id, {
      customer: customerId,
    });

    // Set as default payment method
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: payment_method_id,
      },
    });

    // Create subscription
    const prices = {
      plus: process.env.STRIPE_PRICE_PLUS || 'price_test_plus',
      gold: process.env.STRIPE_PRICE_GOLD || 'price_test_gold',
      platinum: process.env.STRIPE_PRICE_PLATINUM || 'price_test_platinum',
    };

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: prices[tier] }],
      expand: ['latest_invoice.payment_intent'],
    });

    // Store subscription in database
    await pool.query(
      `INSERT INTO subscriptions (user_id, tier, stripe_subscription_id, status, current_period_end)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id) DO UPDATE
       SET tier = $2, stripe_subscription_id = $3, status = $4, current_period_end = $5,
           cancel_at_period_end = false, updated_at = NOW()
       RETURNING *`,
      [userId, tier, subscription.id, subscription.status, new Date(subscription.current_period_end * 1000)]
    );

    // Update user tier
    await pool.query(
      'UPDATE users SET tier = $1, updated_at = NOW() WHERE id = $2',
      [tier, userId]
    );

    res.json({
      success: true,
      data: { subscription }
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({ error: error.message || 'Subscription creation failed' });
  }
};

// Cancel subscription
exports.cancelSubscription = async (req, res) => {
  try {
    const userId = req.userId;

    const subscriptionResult = await pool.query(
      'SELECT * FROM subscriptions WHERE user_id = $1 AND status = $2',
      [userId, 'active']
    );

    if (subscriptionResult.rows.length === 0) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    const subscription = subscriptionResult.rows[0];

    // Cancel on Stripe (cancel at period end)
    await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      cancel_at_period_end: true,
    });

    // Update database
    await pool.query(
      `UPDATE subscriptions
       SET cancel_at_period_end = true, updated_at = NOW()
       WHERE id = $1`,
      [subscription.id]
    );

    res.json({
      success: true,
      data: { message: 'Subscription will cancel at period end' }
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ error: 'Cancel subscription failed' });
  }
};

// Upgrade subscription
exports.upgradeSubscription = async (req, res) => {
  try {
    const { tier } = req.body;
    const userId = req.userId;

    const validTiers = ['plus', 'gold', 'platinum'];
    if (!validTiers.includes(tier)) {
      return res.status(400).json({ error: 'Invalid tier' });
    }

    const subscriptionResult = await pool.query(
      'SELECT * FROM subscriptions WHERE user_id = $1 AND status = $2',
      [userId, 'active']
    );

    if (subscriptionResult.rows.length === 0) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    const subscription = subscriptionResult.rows[0];

    // Upgrade on Stripe
    const prices = {
      plus: process.env.STRIPE_PRICE_PLUS || 'price_test_plus',
      gold: process.env.STRIPE_PRICE_GOLD || 'price_test_gold',
      platinum: process.env.STRIPE_PRICE_PLATINUM || 'price_test_platinum',
    };

    const updatedSubscription = await stripe.subscriptions.update(
      subscription.stripe_subscription_id,
      {
        items: [{ price: prices[tier] }],
      }
    );

    // Update database
    await pool.query(
      `UPDATE subscriptions
       SET tier = $1, updated_at = NOW()
       WHERE id = $2`,
      [tier, subscription.id]
    );

    await pool.query(
      'UPDATE users SET tier = $1, updated_at = NOW() WHERE id = $2',
      [tier, userId]
    );

    res.json({
      success: true,
      data: { subscription: updatedSubscription }
    });
  } catch (error) {
    console.error('Upgrade subscription error:', error);
    res.status(500).json({ error: 'Upgrade subscription failed' });
  }
};

// Get subscription status
exports.getSubscriptionStatus = async (req, res) => {
  try {
    const userId = req.userId;

    const subscriptionResult = await pool.query(
      `SELECT * FROM subscriptions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );

    if (subscriptionResult.rows.length === 0) {
      return res.json({
        success: true,
        data: { subscription: null, tier: 'free' }
      });
    }

    const subscription = subscriptionResult.rows[0];

    res.json({
      success: true,
      data: { subscription, tier: subscription.tier }
    });
  } catch (error) {
    console.error('Get subscription status error:', error);
    res.status(500).json({ error: 'Failed to get subscription status' });
  }
};

// Process in-app purchase (Apple/Google)
exports.processInAppPurchase = async (req, res) => {
  try {
    const { transaction_id, purchase_token, original_transaction_id, tier, platform } = req.body;
    const userId = req.userId;

    if (!transaction_id || !tier) {
      return res.status(400).json({ error: 'Transaction ID and tier required' });
    }

    // Check if transaction already processed
    const existingResult = await pool.query(
      'SELECT id FROM subscriptions WHERE apple_transaction_id = $1 OR google_purchase_token = $1',
      [transaction_id]
    );

    if (existingResult.rows.length > 0) {
      return res.status(400).json({ error: 'Transaction already processed' });
    }

    // Store subscription
    const subscriptionResult = await pool.query(
      `INSERT INTO subscriptions (user_id, tier, status, current_period_end,
       ${platform === 'apple' ? 'apple_transaction_id' : 'google_purchase_token'})
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, tier, 'active', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), transaction_id] // 30 days
    );

    // Update user tier
    await pool.query(
      'UPDATE users SET tier = $1, updated_at = NOW() WHERE id = $2',
      [tier, userId]
    );

    res.json({
      success: true,
      data: { subscription: subscriptionResult.rows[0] }
    });
  } catch (error) {
    console.error('Process IAP error:', error);
    res.status(500).json({ error: 'IAP processing failed' });
  }
};

// Request refund
exports.refundSubscription = async (req, res) => {
  try {
    const userId = req.userId;

    const subscriptionResult = await pool.query(
      'SELECT * FROM subscriptions WHERE user_id = $1 AND status = $2',
      [userId, 'active']
    );

    if (subscriptionResult.rows.length === 0) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    const subscription = subscriptionResult.rows[0];

    // Request refund on Stripe
    if (subscription.stripe_subscription_id) {
      // Get latest invoice
      const stripeSubscription = await stripe.subscriptions.retrieve(
        subscription.stripe_subscription_id
      );

      const invoice = await stripe.invoices.retrieve(stripeSubscription.latest_invoice);

      if (invoice.payment_intent) {
        const paymentIntent = await stripe.paymentIntents.retrieve(invoice.payment_intent);

        if (paymentIntent.charges.data.length > 0) {
          await stripe.refunds.create({
            payment_intent: paymentIntent.id,
            reason: 'requested_by_customer',
          });
        }
      }
    }

    // Update subscription status
    await pool.query(
      `UPDATE subscriptions
       SET status = 'canceled', updated_at = NOW()
       WHERE id = $1`,
      [subscription.id]
    );

    res.json({
      success: true,
      data: { message: 'Refund requested' }
    });
  } catch (error) {
    console.error('Refund subscription error:', error);
    res.status(500).json({ error: 'Refund request failed' });
  }
};

// Purchase one-time item (Super Like, Boost, etc)
exports.purchaseBoost = async (req, res) => {
  try {
    const { boost_type, payment_method_id } = req.body;
    const userId = req.userId;

    const validBoosts = ['super_like', 'boost_30m', 'boost_1h', 'undo_swipe'];
    if (!validBoosts.includes(boost_type)) {
      return res.status(400).json({ error: 'Invalid boost type' });
    }

    const boostPrices = {
      super_like: 0.49,
      boost_30m: 1.49,
      boost_1h: 2.49,
      undo_swipe: 0.29,
    };

    const amount = boostPrices[boost_type];

    // Get user
    const userResult = await pool.query(
      'SELECT email, stripe_customer_id FROM users WHERE id = $1',
      [userId]
    );

    const user = userResult.rows[0];

    let customerId = user.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
      });

      customerId = customer.id;

      await pool.query(
        'UPDATE users SET stripe_customer_id = $1 WHERE id = $2',
        [customerId, userId]
      );
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'eur',
      customer: customerId,
      payment_method: payment_method_id,
      confirm: true,
      description: `${boost_type} - REDATE App`,
    });

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ error: 'Payment failed' });
    }

    // Calculate expiry
    let expiresAt;
    if (boost_type === 'boost_30m') {
      expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    } else if (boost_type === 'boost_1h') {
      expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    }

    // Store boost
    await pool.query(
      `INSERT INTO boosts (user_id, boost_type, stripe_payment_intent_id, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [userId, boost_type, paymentIntent.id, expiresAt]
    );

    res.json({
      success: true,
      data: { message: 'Boost purchased', expires_at: expiresAt }
    });
  } catch (error) {
    console.error('Purchase boost error:', error);
    res.status(500).json({ error: 'Boost purchase failed' });
  }
};