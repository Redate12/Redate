const pool = require('../config/database');
const redis = require('../config/redis');

// Swipe user (like, dislike, superlike)
exports.swipeUser = (action) => {
  return async (req, res) => {
    try {
      const { targetId } = req.params;
      const userId = req.userId;

      if (targetId === userId) {
        return res.status(400).json({ error: 'Cannot swipe yourself' });
      }

      // Check if already swiped
      const existingSwipe = await pool.query(
        'SELECT id FROM swipes WHERE swiper_id = $1 AND swiped_id = $2',
        [userId, targetId]
      );

      if (existingSwipe.rows.length > 0) {
        return res.status(400).json({ error: 'Already swiped' });
      }

      // Check user tier limits (if premium or not)
      const userResult = await pool.query(
        'SELECT tier FROM users WHERE id = $1',
        [userId]
      );

      const user = userResult.rows[0];

      // Check swipe limits for free users
      if (user.tier === 'free') {
        const today = new Date().toISOString().split('T')[0];
        const swipeCount = await pool.query(
          `SELECT COUNT(*) FROM swipes
           WHERE swiper_id = $1 AND DATE(created_at) = $2 AND action = 'like'`,
          [userId, today]
        );

        if (parseInt(swipeCount.rows[0].count) >= 10) {
          return res.status(429).json({ error: 'Daily swipe limit reached. Upgrade to premium.' });
        }
      }

      // Create swipe
      await pool.query(
        'INSERT INTO swipes (swiper_id, swiped_id, action) VALUES ($1, $2, $3)',
        [userId, targetId, action]
      );

      // If it's a like or superlike, check if there's a mutual like
      if (action === 'like' || action === 'superlike') {
        const mutualLike = await pool.query(
          `SELECT action FROM swipes
           WHERE swiper_id = $1 AND swiped_id = $2 AND action IN ('like', 'superlike')`,
          [targetId, userId]
        );

        if (mutualLike.rows.length > 0) {
          // Create match
          const matchResult = await pool.query(
            `INSERT INTO matches (user1_id, user2_id)
             VALUES ($1, $2)
             ON CONFLICT (LEAST($1, $2), GREATEST($1, $2))
             DO NOTHING
             RETURNING *`,
            [userId, targetId]
          );

          if (matchResult.rows.length > 0) {
            const match = matchResult.rows[0];

            // Remove user from each other's swipe feeds (using Redis)
            await redis.del(`user:${userId}:feed`);
            await redis.del(`user:${targetId}:feed`);

            // Send push notification for new match
            await sendPushNotification(targetId, '💕 New Match!', 'Someone likes you back on REDATE!');

            return res.json({
              success: true,
              data: { match, match_created: true }
            });
          }
        }
      }

      // Remove from feed cache
      await redis.del(`user:${userId}:feed`);

      res.json({
        success: true,
        data: { message: `Swipe ${action} successful`, match_created: false }
      });
    } catch (error) {
      console.error('Swipe error:', error);
      res.status(500).json({ error: 'Swipe failed' });
    }
  };
};

// Super like
exports.superLikeUser = async (req, res) => {
  try {
    const { targetId } = req.params;
    const userId = req.userId;

    const userResult = await pool.query(
      'SELECT tier FROM users WHERE id = $1',
      [userId]
    );

    const user = userResult.rows[0];

    // Check super like limits
    if (user.tier === 'free') {
      const today = new Date().toISOString().split('T')[0];
      const superLikeCount = await pool.query(
        `SELECT COUNT(*) FROM swipes
         WHERE swiper_id = $1 AND DATE(created_at) = $2 AND action = 'superlike'`,
        [userId, today]
      );

      if (parseInt(superLikeCount.rows[0].count) >= 1) {
        return res.status(429).json({ error: 'Daily Super Like limit reached. Upgrade to premium.' });
      }
    } else if (user.tier === 'plus') {
      const today = new Date().toISOString().split('T')[0];
      const superLikeCount = await pool.query(
        `SELECT COUNT(*) FROM swipes
         WHERE swiper_id = $1 AND DATE(created_at) = $2 AND action = 'superlike'`,
        [userId, today]
      );

      if (parseInt(superLikeCount.rows[0].count) >= 5) {
        return res.status(429).json({ error: 'Daily Super Like limit reached.' });
      }
    }

    // Process as super like
    const swipeResult = await pool.query(
      'INSERT INTO swipes (swiper_id, swiped_id, action) VALUES ($1, $2, $3) RETURNING *',
      [userId, targetId, 'superlike']
    );

    // Check for mutual like
    const mutualLike = await pool.query(
      `SELECT id FROM swipes
       WHERE swiper_id = $1 AND swiped_id = $2 AND action IN ('like', 'superlike')`,
      [targetId, userId]
    );

    if (mutualLike.rows.length > 0) {
      const matchResult = await pool.query(
        `INSERT INTO matches (user1_id, user2_id)
         VALUES ($1, $2)
         ON CONFLICT (LEAST($1, $2), GREATEST($1, $2))
         DO NOTHING
         RETURNING *`,
        [userId, targetId]
      );

      if (matchResult.rows.length > 0) {
        await sendPushNotification(targetId, '⭐ Super Liked!', 'Someone Super Liked you on REDATE!');

        return res.json({
          success: true,
          data: { match: matchResult.rows[0], match_created: true }
        });
      }
    }

    await redis.del(`user:${userId}:feed`);

    res.json({
      success: true,
      data: { message: 'Super Like sent', match_created: false }
    });
  } catch (error) {
    console.error('Super like error:', error);
    res.status(500).json({ error: 'Super like failed' });
  }
};

// Undo last swipe
exports.undoSwipe = async (req, res) => {
  try {
    const userId = req.userId;

    const userResult = await pool.query(
      'SELECT tier FROM users WHERE id = $1',
      [userId]
    );

    const user = userResult.rows[0];

    // Check if user can undo (premium feature or free users get 1/day)
    if (user.tier === 'free') {
      const today = new Date().toISOString().split('T')[0];
      const undoCount = await pool.query(
        `SELECT COUNT(*) FROM undo_swipe_cache
         WHERE user_id = $1 AND DATE(undo_date) = $2`,
        [userId, today]
      );

      if (parseInt(undoCount.rows[0].count) >= 1) {
        return res.status(429).json({ error: 'Daily undo limit reached.' });
      }
    }

    // Get last swipe
    const lastSwipe = await pool.query(
      `SELECT id, swiped_id, action FROM swipes
       WHERE swiper_id = $1
       ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );

    if (lastSwipe.rows.length === 0) {
      return res.status(404).json({ error: 'No swipes to undo' });
    }

    // Check if match was created
    const matchResult = await pool.query(
      `SELECT id FROM matches
       WHERE (user1_id = $1 AND user2_id = $2)
          OR (user1_id = $2 AND user2_id = $1)
       AND is_unmatched = false`,
      [userId, lastSwipe.rows[0].swiped_id]
    );

    // Delete match if exists
    if (matchResult.rows.length > 0) {
      await pool.query(
        'UPDATE matches SET is_unmatched = true, unmatched_at = NOW() WHERE id = $1',
        [matchResult.rows[0].id]
      );
    }

    // Delete swipe
    await pool.query('DELETE FROM swipes WHERE id = $1', [lastSwipe.rows[0].id]);

    // Clear feed cache
    await redis.del(`user:${userId}:feed`);

    res.json({
      success: true,
      data: { message: 'Swipe undone', match_removed: matchResult.rows.length > 0 }
    });
  } catch (error) {
    console.error('Undo swipe error:', error);
    res.status(500).json({ error: 'Undo failed' });
  }
};

// Get swipe history
exports.getSwipesHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 20, action } = req.query;

    let query = `
      SELECT s.*, u.name, u.photos, u.birth_date,
             CASE WHEN u.birth_date IS NULL THEN NULL
                  ELSE EXTRACT(YEAR FROM AGE(u.birth_date))
             END as age
      FROM swipes s
      JOIN users u ON s.swiped_id = u.id
      WHERE s.swiper_id = $1
      `;

    const params = [userId];

    if (action) {
      query += ' AND s.action = $2';
      params.push(action);
    }

    query += ' ORDER BY s.created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit);
    params.push((page - 1) * limit);

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: { swipes: result.rows, page: parseInt(page), limit: parseInt(limit) }
    });
  } catch (error) {
    console.error('Get swipes history error:', error);
    res.status(500).json({ error: 'Failed to get swipe history' });
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