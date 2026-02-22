const pool = require('../config/database');

class User {
  static async findById(id) {
    const result = await pool.query(
      `SELECT id, email, name, birth_date, gender, looking_for, bio,
              location_lat, location_lng, photos, verified, tier, premium_until, created_at
       FROM users WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );
    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL',
      [email]
    );
    return result.rows[0];
  }

  static async findByPhone(phone) {
    const result = await pool.query(
      'SELECT * FROM users WHERE phone = $1 AND deleted_at IS NULL',
      [phone]
    );
    return result.rows[0];
  }

  static async create(userData) {
    const { email, phone, password_hash, name, verified = false } = userData;
    const result = await pool.query(
      `INSERT INTO users (email, phone, password_hash, name, verified)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [email, phone, password_hash, name, verified]
    );
    return result.rows[0];
  }

  static async update(id, userData) {
    const allowedFields = ['name', 'bio', 'photos', 'gender', 'looking_for', 'verified'];
    const updates = [];
    const values = [];
    let paramIndex = 1;

    for (const field of allowedFields) {
      if (userData[field] !== undefined) {
        updates.push(`${field} = $${paramIndex}`);
        values.push(field === 'photos' ? JSON.stringify(userData[field]) : userData[field]);
        paramIndex++;
      }
    }

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(id);
    updates.push('updated_at = NOW()');

    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async updateTier(id, tier, premiumUntil = null) {
    const result = await pool.query(
      `UPDATE users SET tier = $1, premium_until = $2, updated_at = NOW()
       WHERE id = $3 RETURNING *`,
      [tier, premiumUntil, id]
    );
    return result.rows[0];
  }

  static async updateLocation(id, lat, lng) {
    const result = await pool.query(
      `UPDATE users
       SET location_lat = $1, location_lng = $2, location_last_seen = NOW()
       WHERE id = $3 RETURNING *`,
      [lat, lng, id]
    );
    return result.rows[0];
  }

  static async softDelete(id) {
    const result = await pool.query(
      'UPDATE users SET deleted_at = NOW() WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }

  static async getPreferences(userId) {
    const result = await pool.query(
      'SELECT * FROM user_preferences WHERE user_id = $1',
      [userId]
    );
    return result.rows[0];
  }

  static async setPreferences(userId, preferences) {
    const { max_distance_km, min_age, max_age, looking_for_gender } = preferences;

    const result = await pool.query(
      `INSERT INTO user_preferences (user_id, max_distance_km, min_age, max_age, looking_for_gender)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id) DO UPDATE
       SET max_distance_km = $2, min_age = $3, max_age = $4, looking_for_gender = $5,
           updated_at = NOW()
       RETURNING *`,
      [userId, max_distance_km || 50, min_age || 18, max_age || 100, looking_for_gender]
    );
    return result.rows[0];
  }
}

module.exports = User;