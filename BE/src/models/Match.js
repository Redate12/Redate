const pool = require('../config/database');

class Match {
  static async findByUsers(user1Id, user2Id) {
    const result = await pool.query(
      `SELECT * FROM matches
       WHERE (user1_id = $1 AND user2_id = $2)
          OR (user1_id = $2 AND user2_id = $1)
       AND is_unmatched = false`,
      [user1Id, user2Id]
    );
    return result.rows[0];
  }

  static async create(user1Id, user2Id) {
    const result = await pool.query(
      `INSERT INTO matches (user1_id, user2_id)
       VALUES ($1, $2)
       ON CONFLICT (LEAST($1, $2), GREATEST($1, $2))
       DO NOTHING
       RETURNING *`,
      [user1Id, user2Id]
    );
    return result.rows[0];
  }

  static async findById(matchId) {
    const result = await pool.query(
      'SELECT * FROM matches WHERE id = $1 AND is_unmatched = false',
      [matchId]
    );
    return result.rows[0];
  }

  static async findByUserId(userId) {
    const result = await pool.query(
      `SELECT m.*, u.name as other_user_name, u.photos as other_user_photos
       FROM matches m
       JOIN users u ON (CASE WHEN m.user1_id = $1 THEN m.user2_id ELSE m.user1_id END) = u.id
       WHERE m.is_unmatched = false
         AND (m.user1_id = $1 OR m.user2_id = $1)
       ORDER BY m.created_at DESC`,
      [userId]
    );
    return result.rows;
  }

  static async unmatch(matchId) {
    const result = await pool.query(
      `UPDATE matches
       SET is_unmatched = true, unmatched_at = NOW()
       WHERE id = $1 RETURNING *`,
      [matchId]
    );
    return result.rows[0];
  }
}

module.exports = Match;