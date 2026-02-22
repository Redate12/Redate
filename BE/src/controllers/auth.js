const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const pool = require('../config/database');
const admin = require('../config/firebase');

// Register user
exports.registerUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, phone } = req.body;

    // Check if user exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR phone = $2',
      [email, phone]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create user
    const result = await pool.query(
      'INSERT INTO users (email, phone, password_hash) VALUES ($1, $2, $3) RETURNING id, email',
      [email, phone, password_hash]
    );

    const user = result.rows[0];

    // Create JWT token
    const token = jwt.sign(
      { userId: user.id, tier: 'free' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      success: true,
      data: { user, token }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

// Login user
exports.loginUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, firebase_token } = req.body;

    let user;

    // Firebase auth (priority)
    if (firebase_token) {
      try {
        const decodedToken = await admin.auth().verifyIdToken(firebase_token);
        const email = decodedToken.email;

        const result = await pool.query(
          'SELECT * FROM users WHERE email = $1',
          [email]
        );

        if (result.rows.length === 0) {
          // Create user if doesn't exist
          const createResult = await pool.query(
            'INSERT INTO users (email, verified) VALUES ($1, $2) RETURNING *',
            [email, true]
          );
          user = createResult.rows[0];
        } else {
          user = result.rows[0];
        }
      } catch (firebaseError) {
        console.error('Firebase auth error:', firebaseError);
        return res.status(401).json({ error: 'Invalid Firebase token' });
      }
    } else {
      // Email/password auth
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
      }

      const result = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      user = result.rows[0];

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user.id, tier: user.tier || 'free' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      data: { user: { id: user.id, email: user.email, tier: user.tier }, token }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

// Refresh auth
exports.refreshAuth = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get fresh user data
    const result = await pool.query(
      'SELECT id, email, tier FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    // Create new token
    const newToken = jwt.sign(
      { userId: user.id, tier: user.tier || 'free' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      data: { user, token: newToken }
    });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Social login (Google, Apple)
exports.socialLogin = async (req, res) => {
  try {
    const { provider, id_token, email, name } = req.body;

    if (!provider || !email) {
      return res.status(400).json({ error: 'Provider and email required' });
    }

    // Check if user exists
    let result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    let user;

    if (result.rows.length === 0) {
      // Create new user
      user = (
        await pool.query(
          'INSERT INTO users (email, name, verified) VALUES ($1, $2, $3) RETURNING *',
          [email, name, true]
        )
      ).rows[0];
    } else {
      user = result.rows[0];
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user.id, tier: user.tier || 'free' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      data: { user: { id: user.id, email: user.email, tier: user.tier }, token }
    });
  } catch (error) {
    console.error('Social login error:', error);
    res.status(500).json({ error: 'Social login failed' });
  }
};