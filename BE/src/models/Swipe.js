const pool = require('../config/database');

class Swipe {
  static async create(swipeData) {
    const { swiper_id, swiped_id, action } = swipeData;

    const result = await pool.query(
      `INSERT INTO swipes (swiper_id, swiped_id, action)
       VALUES ($1, $2, $3)
       ON CONFLICT (swiper_id, swiped_id)
       DO UPDATE SET action = $3, created_at = NOW()
       RETURNING *`,
      [swiper_id, swiped_id, action]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query(
      'SELECT * FROM swipes WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async findByUsers(swiperId, swipedId) {
    const result = await pool.query(
      'SELECT * FROM swipes WHERE swiper_id = $1 AND swiped_id = $2',
      [swiperId, swipedId]
    );
    return result.rows[0];
  }

  static async findBySwiperId(userId, params = {}) {
    const { page = 1, limit = 20, action } = params;
    const offset = (page - 1) * limit;

    let query = `
      SELECT s.*, u.name, u.photos, u.birth_date,
             CASE WHEN u.birth_date IS NULL THEN NULL
                  ELSE EXTRACT(YEAR FROM AGE(u.birth_date))
             END as age
      FROM swipes s
      JOIN users u ON s.swiped_id = u.id
      WHERE s.swiper_id = $1
    `;
    const values = [userId];

    if (action) {
      query += ' AND s.action = $' + (values.length + 1);
      values.push(action);
    }

    query += ' ORDER BY s.created_at DESC LIMIT $' + (values.length + 1) + ' OFFSET $' + (values.length + 2);
    values.push(limit);
    values.push(offset);

    const result = await pool.query(query, values);
    return result.rows;
  }

  static async delete(id) {
    const result = await pool.query(
      'DELETE FROM swipes WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }

  static async getTodayLikeCount(userId) {
    const today = new Date().toISOString().split('T')[0];
    const result = await pool.query(
      `SELECT COUNT(*) as count
       FROM swipes
       WHERE swiper_id = $1
         AND action IN ('like', 'superlike')
         AND DATE(created_at) = $2`,
      [userId, today]
    );
    return parseInt(result.rows[0].count);
  }

  static async getTodaySuperLikeCount(userId) {
    const today = new Date().toISOString().split('T')[0];
    const result = await pool.query(
      `SELECT COUNT(*) as count
       FROM swipes
       WHERE swiper_id = $1
         AND action = 'superlike'
         AND DATE(created_at) = $2`,
      [userId, today]
    );
    return parseInt(result.rows[0].count);
  }

  static async getLatestSwipe(userId) {
    const result = await pool.query(
      `SELECT * FROM swipes
       WHERE swiper_id = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId]
    );
    return result.rows[0];
  }

  static async getSwipedUserIds(userId) {
    const result = await pool.query(
      'SELECT swiped_id FROM swipes WHERE swiper_id = $1',
      [userId]
    );
    return result.rows.map(row => row.swiped_id);
  }
}

module.exports = Swipe;