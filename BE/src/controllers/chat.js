const pool = require('../config/database');
const admin = require('../config/firebase');

// Get conversations list
exports.getConversations = async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 20 } = req.query;

    const offset = (page - 1) * limit;

    const query = `
      SELECT m.id as match_id, m.created_at as match_created_at,
             CASE
               WHEN m.user1_id = $1 THEN m.user2_id
               ELSE m.user1_id
             END as other_user_id,
             u.name, u.photos, u.tier,
             (SELECT COUNT(*) FROM messages WHERE match_id = m.id) as message_count,
             (SELECT content FROM messages
              WHERE match_id = m.id AND sender_id != $1
              ORDER BY created_at DESC LIMIT 1) as last_message_content,
             (SELECT created_at FROM messages
              WHERE match_id = m.id AND sender_id != $1
              ORDER BY created_at DESC LIMIT 1) as last_message_time
      FROM matches m
      JOIN users u ON (CASE WHEN m.user1_id = $1 THEN m.user2_id ELSE m.user1_id END) = u.id
      WHERE m.is_unmatched = false
        AND (m.user1_id = $1 OR m.user2_id = $1)
        AND EXISTS (SELECT 1 FROM messages WHERE match_id = m.id)
      ORDER BY m.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(query, [userId, limit, offset]);

    res.json({
      success: true,
      data: { conversations: result.rows, page: parseInt(page), limit: parseInt(limit) }
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to get conversations' });
  }
};

// Get messages for a match
exports.getMessages = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { page = 1, limit = 50, before } = req.query;
    const userId = req.userId;

    // Verify user is part of this match
    const matchResult = await pool.query(
      `SELECT id FROM matches
       WHERE id = $1
         AND is_unmatched = false
         AND (user1_id = $2 OR user2_id = $2)`,
      [matchId, userId]
    );

    if (matchResult.rows.length === 0) {
      return res.status(404).json({ error: 'Match not found' });
    }

    const offset = (page - 1) * limit;

    let query = `
      SELECT id, sender_id, message_type, content, read_at, created_at
      FROM messages
      WHERE match_id = $1
    `;
    const params = [matchId];

    if (before) {
      query += ' AND created_at < $2';
      params.push(before);
    }

    query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit);
    params.push(offset);

    const result = await pool.query(query, params);

    // Reverse results to get chronological order
    result.rows.reverse();

    res.json({
      success: true,
      data: { messages: result.rows, page: parseInt(page), limit: parseInt(limit) }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
};

// Send message
exports.sendMessage = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { content, message_type = 'text', firebase_message_id } = req.body;
    const userId = req.userId;

    if (!content) {
      return res.status(400).json({ error: 'Content required' });
    }

    // Verify match exists
    const matchResult = await pool.query(
      `SELECT id FROM matches
       WHERE id = $1
         AND is_unmatched = false
         AND (user1_id = $2 OR user2_id = $2)`,
      [matchId, userId]
    );

    if (matchResult.rows.length === 0) {
      return res.status(404).json({ error: 'Match not found' });
    }

    // Store message in PostgreSQL (metadata)
    const result = await pool.query(
      `INSERT INTO messages (match_id, sender_id, content, message_type, firebase_message_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [matchId, userId, content, message_type, firebase_message_id]
    );

    // Also store in Firebase Firestore for real-time sync
    const firestore = admin.firestore();

    // Send message via Firebase Cloud Message (push notification) to recipient
    // First, get recipient's user ID
    const recipientQuery = await pool.query(
      `SELECT CASE WHEN user1_id = $1 THEN user2_id ELSE user1_id END as user_id
       FROM matches WHERE id = $2`,
      [userId, matchId]
    );

    const recipientId = recipientQuery.rows[0].user_id;

    // Send push notification (this would integrate with FCM)
    await sendPushNotification(recipientId, '💬 New Message', content);

    res.json({
      success: true,
      data: { message: result.rows[0] }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

// Mark messages as read
exports.markAsRead = async (req, res) => {
  try {
    const { matchId } = req.params;
    const userId = req.userId;

    // Mark all messages from other user in this match as read
    await pool.query(
      `UPDATE messages
       SET read_at = NOW()
       WHERE match_id = $1
         AND sender_id != $2
         AND read_at IS NULL`,
      [matchId, userId]
    );

    res.json({
      success: true,
      data: { message: 'Messages marked as read' }
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
};

// Delete conversation
exports.deleteConversation = async (req, res) => {
  try {
    const { matchId } = req.params;
    const userId = req.userId;

    // Verify match exists
    const matchResult = await pool.query(
      `SELECT id FROM matches
       WHERE id = $1
         AND is_unmatched = false
         AND (user1_id = $2 OR user2_id = $2)`,
      [matchId, userId]
    );

    if (matchResult.rows.length === 0) {
      return res.status(404).json({ error: 'Match not found' });
    }

    // Delete all messages (soft delete would be better but keeping it simple)
    await pool.query(
      `DELETE FROM messages WHERE match_id = $1`,
      [matchId]
    );

    res.json({
      success: true,
      data: { message: 'Conversation deleted' }
    });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
};

// Get unread message count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.userId;

    const result = await pool.query(
      `SELECT COUNT(*) as unread_count
      FROM messages m
      JOIN matches match ON m.match_id = match.id
      WHERE match.is_unmatched = false
        AND match.user1_id = $1 OR match.user2_id = $1
        AND m.sender_id != $1
        AND m.read_at IS NULL`,
      [userId]
    );

    const unreadCount = parseInt(result.rows[0].unread_count);

    res.json({
      success: true,
      data: { unread_count: unreadCount }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
};

// Helper function for push notifications
async function sendPushNotification(userId, title, body) {
  try {
    // This would integrate with Firebase Cloud Messaging
    // For now, it's a placeholder
    console.log(`Push notification to user ${userId}: ${title} - ${body}`);
  } catch (error) {
    console.error('Push notification error:', error);
  }
}