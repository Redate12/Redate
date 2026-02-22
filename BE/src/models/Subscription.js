const pool = require('../config/database');

class Subscription {
  static async create(subscriptionData) {
    const { user_id, tier, stripe_subscription_id, status, current_period_end } = subscriptionData;

    const result = await pool.query(
      `INSERT INTO subscriptions (user_id, tier, stripe_subscription_id, status, current_period_end)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id) DO UPDATE
       SET tier = $2, stripe_subscription_id = $3, status = $4, current_period_end = $5,
           cancel_at_period_end = false, updated_at = NOW()
       RETURNING *`,
      [user_id, tier, stripe_subscription_id, status, current_period_end]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query(
      'SELECT * FROM subscriptions WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async findByUserId(userId) {
    const result = await pool.query(
      `SELECT * FROM subscriptions
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId]
    );
    return result.rows[0];
  }

  static async update(id, updates) {
    const allowedFields = ['tier', 'status', 'cancel_at_period_end', 'current_period_end'];
    const setClauses = [];
    const values = [];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        setClauses.push(`${field} = $${values.length + 2}`);
        values.push(updates[field]);
      }
    }

    if (setClauses.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.unshift(id);
    values.push(id);

    const query = `
      UPDATE subscriptions
      SET ${setClauses.join(', ')}, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async updateStatus(id, status) {
    const result = await pool.query(
      `UPDATE subscriptions
       SET status = $1, updated_at = NOW()
       WHERE id = $2 RETURNING *`,
      [status, id]
    );
    return result.rows[0];
  }

  static async findByStripeSubscriptionId(stripeSubscriptionId) {
    const result = await pool.query(
      'SELECT * FROM subscriptions WHERE stripe_subscription_id = $1',
      [stripeSubscriptionId]
    );
    return result.rows[0];
  }

  static async findByAppleTransactionId(transactionId) {
    const result = await pool.query(
      'SELECT * FROM subscriptions WHERE apple_transaction_id = $1',
      [transactionId]
    );
    return result.rows[0];
  }

  static async findByGooglePurchaseToken(purchaseToken) {
    const result = await pool.query(
      'SELECT * FROM subscriptions WHERE google_purchase_token = $1',
      [purchaseToken]
    );
    return result.rows[0];
  }

  static async getActiveByUserId(userId) {
    const result = await pool.query(
      `SELECT * FROM subscriptions
       WHERE user_id = $1 AND status = 'active'
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId]
    );
    return result.rows[0];
  }
}

module.exports = Subscription;