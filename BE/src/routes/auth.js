const express = require('express');
const router = express.Router();

const { registerUser, loginUser, refreshAuth } = require('../controllers/auth');

// Registro
router.post('/register', registerUser);

// Login
router.post('/login', loginUser);

// Refresh token
router.post('/refresh', refreshAuth);

module.exports = router;