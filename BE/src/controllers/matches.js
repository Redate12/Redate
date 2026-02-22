const pool = require('../config/database');

// Get all matches for current user
exports.getMatches = async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 20, recent_only = false } = req.query;

    const offset = (page - 1) * limit;

    let recentFilter = '';
    const params = [userId, userId];

    if (recent_only === 'true') {
      recentFilter = `AND m.created_at >= NOW() - INTERVAL '30 days'`;
    }

    const query = `
      SELECT m.id, m.created_at, m.is_unmatched,
             CASE
               WHEN m.user1_id = $1 THEN m.user2_id
               ELSE m.user1_id
             END as matched_user_id,
             u.name, u.photos, u.tier, u.birth_date,
             CASE
               WHEN u.birth_date IS NULL THEN NULL
               ELSE EXTRACT(YEAR FROM AGE(u.birth_date))
             END as age,
             (SELECT COUNT(*) FROM messages WHERE match_id = m.id) as message_count,
             (SELECT created_at FROM messages
              WHERE match_id = m.id AND sender_id != $1
              ORDER BY created_at DESC LIMIT 1) as last_message_time
      FROM matches m
      JOIN users u ON (CASE WHEN m.user1_id = $1 THEN m.user2_id ELSE m.user1_id END) = u.id
      WHERE m.is_unmatched = false
        AND (m.user1_id = $1 OR m.user2_id = $1)
        ${recentFilter}
      ORDER BY m.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(query, [userId, limit, offset]);

    res.json({
      success: true,
      data: { matches: result.rows, page: parseInt(page), limit: parseInt(limit) }
    });
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({ error: 'Failed to get matches' });
  }
};

// Get matches count
exports.getMatchesCount = async (req, res) => {
  try {
    const userId = req.userId;

    const result = await pool.query(
      `SELECT COUNT(*) as count, COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as recent_count
       FROM matches
       WHERE is_unmatched = false
         AND (user1_id = $1 OR user2_id = $1)`,
      [userId]
    );

    res.json({
      success: true,
      data: {
        total_matches: parseInt(result.rows[0].count),
        recent_matches: parseInt(result.rows[0].recent_count)
      }
    });
  } catch (error) {
    console.error('Get matches count error:', error);
    res.status(500).json({ error: 'Failed to get matches count' });
  }
};

// Unmatch user
exports.unmatchUser = async (req, res) => {
  try {
    const { matchId } = req.params;
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

    // Mark as unmatched
    await pool.query(
      `UPDATE matches
       SET is_unmatched = true, unmatched_at = NOW()
       WHERE id = $1`,
      [matchId]
    );

    res.json({
      success: true,
      data: { message: 'Match deleted' }
    });
  } catch (error) {
    console.error('Unmatch error:', error);
    res.status(500).json({ error: 'Unmatch failed' });
  }
};

// Report user
exports.reportUser = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { reason, description } = req.body;
    const userId = req.userId;

    if (!reason) {
      return res.status(400).json({ error: 'Reason required' });
    }

    // Get match details to find reported user
    const matchResult = await pool.query(
      `SELECT user1_id, user2_id FROM matches
       WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)`,
      [matchId, userId]
    );

    if (matchResult.rows.length === 0) {
      return res.status(404).json({ error: 'Match not found' });
    }

    const match = matchResult.rows[0];
    const reportedUserId = match.user1_id === userId ? match.user2_id : match.user1_id;

    // Create report
    await pool.query(
      `INSERT INTO reports (reporter_id, reported_user_id, match_id, reason, description)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, reportedUserId, matchId, reason, description]
    );

    res.json({
      success: true,
      data: { message: 'Report submitted' }
    });
  } catch (error) {
    console.error('Report error:', error);
    res.status(500).json({ error: 'Report failed' });
  }
};

// Get match details
exports.getMatchDetails = async (req, res) => {
  try {
    const { matchId } = req.params;
    const userId = req.userId;

    const result = await pool.query(
      `SELECT m.id, m.created_at,
         CASE
           WHEN m.user1_id = $1 THEN m.user2_id
           ELSE m.user1_id
         END as matched_user_id,
         u.name, u.photos, u.bio, u.tier, u.verified, u.birth_date,
         CASE
           WHEN u.birth_date IS NULL THEN NULL
           ELSE EXTRACT(YEAR FROM AGE(u.birth_date))
         END as age
       FROM matches m
       JOIN users u ON (CASE WHEN m.user1_id = $1 THEN m.user2_id ELSE m.user1_id END) = u.id
       WHERE m.id = $2
         AND m.is_unmatched = false
         AND (m.user1_id = $1 OR m.user2_id = $1)`,
      [userId, matchId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Match not found' });
    }

    res.json({
      success: true,
      data: { match: result.rows[0] }
    });
  } catch (error) {
    console.error('Get match details error:', error);
    res.status(500).json({ error: 'Failed to get match details' });
  }
};