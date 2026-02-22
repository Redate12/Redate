const pool = require('../config/database');

class Message {
  static async create(messageData) {
    const { match_id, sender_id, content, message_type, firebase_message_id } = messageData;

    const result = await pool.query(
      `INSERT INTO messages (match_id, sender_id, content, message_type, firebase_message_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [match_id, sender_id, content, message_type || 'text', firebase_message_id]
    );
    return result.rows[0];
  }

  static async findByMatch(matchId, params = {}) {
    const { page = 1, limit = 50, before, sender_id } = params;
    const offset = (page - 1) * limit;

    let query = `
      SELECT * FROM messages
      WHERE match_id = $1
    `;
    const values = [matchId];

    if (before) {
      query += ' AND created_at < $' + (values.length + 1);
      values.push(before);
    }

    if (sender_id) {
      query += ' AND sender_id = $' + (values.length + 1);
      values.push(sender_id);
    }

    query += ' ORDER BY created_at DESC LIMIT $' + (values.length + 1) + ' OFFSET $' + (values.length + 2);
    values.push(limit);
    values.push(offset);

    const result = await pool.query(query, values);
    result.rows.reverse(); // Return in chronological order
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query(
      'SELECT * FROM messages WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async markAsRead(matchId, userId) {
    const result = await pool.query(
      `UPDATE messages
       SET read_at = NOW()
       WHERE match_id = $1
         AND sender_id != $2
         AND read_at IS NULL
       RETURNING *`,
      [matchId, userId]
    );
    return result.rows;
  }

  static async deleteByMatch(matchId) {
    const result = await pool.query(
      'DELETE FROM messages WHERE match_id = $1 RETURNING *',
      [matchId]
    );
    return result.rows;
  }

  static async getUnreadCount(userId) {
    const result = await pool.query(
      `SELECT COUNT(*) as count
       FROM messages m
       JOIN matches match ON m.match_id = match.id
       WHERE m.sender_id != $1
         AND match.user1_id = $1 OR match.user2_id = $1
         AND m.read_at IS NULL`,
      [userId]
    );
    return parseInt(result.rows[0].count);
  }
}

module.exports = Message;