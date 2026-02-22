const { validationResult } = require('express-validator');
const pool = require('../config/database');

// Create user profile
exports.createUserProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, birth_date, gender, looking_for, bio, photos } = req.body;
    const userId = req.userId;

    // Calculate age
    const age = new Date().getFullYear() - new Date(birth_date).getFullYear();

    if (age < 18) {
      return res.status(400).json({ error: 'Must be 18 or older' });
    }

    const result = await pool.query(
      `UPDATE users SET name = $1, birth_date = $2, gender = $3, looking_for = $4,
       bio = $5, photos = $6, updated_at = NOW()
       WHERE id = $7 RETURNING *`,
      [name, birth_date, gender, looking_for, bio, JSON.stringify(photos), userId]
    );

    res.json({
      success: true,
      data: { user: result.rows[0] }
    });
  } catch (error) {
    console.error('Create profile error:', error);
    res.status(500).json({ error: 'Profile creation failed' });
  }
};

// Get current user profile
exports.getUserProfile = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, name, birth_date, gender, looking_for, bio,
       photos, verified, tier, premium_until, created_at
       FROM users WHERE id = $1`,
      [req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    user.age = new Date().getFullYear() - new Date(user.birth_date).getFullYear();

    // Get user preferences
    const prefResult = await pool.query(
      'SELECT * FROM user_preferences WHERE user_id = $1',
      [req.userId]
    );

    user.preferences = prefResult.rows[0] || null;

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const { name, bio, photos, looking_for, gender } = req.body;
    const userId = req.userId;

    const result = await pool.query(
      `UPDATE users SET name = COALESCE($1, name),
       bio = COALESCE($2, bio),
       photos = COALESCE($3, photos),
       looking_for = COALESCE($4, looking_for),
       gender = COALESCE($5, gender),
       updated_at = NOW()
       WHERE id = $6 RETURNING *`,
      [name, bio, photos ? JSON.stringify(photos) : null, looking_for, gender, userId]
    );

    res.json({
      success: true,
      data: { user: result.rows[0] }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Profile update failed' });
  }
};

// Upload photo (metadata only, actual file goes to Firebase Storage)
exports.uploadPhoto = async (req, res) => {
  try {
    const { photo_url, is_primary } = req.body;
    const userId = req.userId;

    const result = await pool.query(
      'SELECT photos FROM users WHERE id = $1',
      [userId]
    );

    const currentPhotos = result.rows[0].photos || [];

    if (is_primary) {
      // Make this photo primary, move others down
      currentPhotos.unshift(photo_url);
    } else {
      currentPhotos.push(photo_url);
    }

    await pool.query(
      'UPDATE users SET photos = $1, updated_at = NOW() WHERE id = $2',
      [JSON.stringify(currentPhotos), userId]
    );

    res.json({
      success: true,
      data: { photos: currentPhotos }
    });
  } catch (error) {
    console.error('Upload photo error:', error);
    res.status(500).json({ error: 'Photo upload failed' });
  }
};

// Update current location
exports.getCurrentLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const userId = req.userId;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude required' });
    }

    await pool.query(
      'UPDATE users SET location_lat = $1, location_lng = $2, location_last_seen = NOW() WHERE id = $3',
      [latitude, longitude, userId]
    );

    res.json({
      success: true,
      data: { message: 'Location updated' }
    });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ error: 'Location update failed' });
  }
};

// Get nearby users (for swipe feed)
exports.getNearbyUsers = async (req, res) => {
  try {
    const userId = req.userId;
    const { distance = 50, min_age = 18, max_age = 100, page = 1, limit = 20 } = req.query;

    // Get user's preferences
    const prefResult = await pool.query(
      'SELECT * FROM user_preferences WHERE user_id = $1',
      [userId]
    );

    const preferences = prefResult.rows[0];

    const maxDistance = preferences?.max_distance_km || distance;
    const minAge = preferences?.min_age || min_age;
    const maxAge = preferences?.max_age || max_age;

    // Get user's location
    const userResult = await pool.query(
      'SELECT location_lat, location_lng FROM users WHERE id = $1',
      [userId]
    );

    const userLocation = userResult.rows[0];

    if (!userLocation.location_lat || !userLocation.location_lng) {
      return res.status(400).json({ error: 'Location not set' });
    }

    // Calculate bounding box roughly
    const latOffset = maxDistance / 111; // 1 degree ~ 111 km
    const lngOffset = maxDistance / (111 * Math.cos(userLocation.location_lat * Math.PI / 180));
    const minLat = userLocation.location_lat - latOffset;
    const maxLat = userLocation.location_lat + latOffset;
    const minLng = userLocation.location_lng - lngOffset;
    const maxLng = userLocation.location_lng + lngOffset;

    // Get users nearby
    const result = await pool.query(
      `SELECT id, name, birth_date, gender, looking_for, bio, photos, tier,
        location_lat, location_lng,
        CASE
          WHEN birth_date IS NULL THEN NULL
          ELSE EXTRACT(YEAR FROM AGE(birth_date))
        END as age
       FROM users
       WHERE deleted_at IS NULL
         AND id != $1
         AND location_lat BETWEEN $2 AND $3
         AND location_lng BETWEEN $4 AND $5
         AND verified = true
         AND birth_date BETWEEN
           (CURRENT_DATE - INTERVAL '1 year' * $6) AND
           (CURRENT_DATE - INTERVAL '1 year' * $7)
         AND id NOT IN (SELECT swiped_id FROM swipes WHERE swiper_id = $1)
       ORDER BY RANDOM()
       LIMIT $8 OFFSET $9`,
      [userId, minLat, maxLat, minLng, maxLng, maxAge, minAge, limit, (page - 1) * limit]
    );

    // Calculate actual distance for each user
    const usersWithDistance = result.rows.map(user => {
      const distance = calculateDistance(
        userLocation.location_lat,
        userLocation.location_lng,
        user.location_lat,
        user.location_lng
      );
      return { ...user, distance: Math.round(distance) };
    }).filter(user => user.distance <= maxDistance);

    res.json({
      success: true,
      data: { users: usersWithDistance, page: parseInt(page), limit: parseInt(limit) }
    });
  } catch (error) {
    console.error('Get nearby users error:', error);
    res.status(500).json({ error: 'Failed to get nearby users' });
  }
};

// Calculate distance between two points (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Set user preferences
exports.setUserPreferences = async (req, res) => {
  try {
    const { max_distance_km, min_age, max_age, looking_for_gender } = req.body;
    const userId = req.userId;

    const result = await pool.query(
      `INSERT INTO user_preferences (user_id, max_distance_km, min_age, max_age, looking_for_gender)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id) DO UPDATE
       SET max_distance_km = $2, min_age = $3, max_age = $4, looking_for_gender = $5,
           updated_at = NOW()
       RETURNING *`,
      [userId, max_distance_km || 50, min_age || 18, max_age || 100, looking_for_gender]
    );

    res.json({
      success: true,
      data: { preferences: result.rows[0] }
    });
  } catch (error) {
    console.error('Set preferences error:', error);
    res.status(500).json({ error: 'Failed to set preferences' });
  }
};