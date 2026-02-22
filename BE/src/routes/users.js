const express = require('express');
const router = express.Router();

const {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
  uploadPhoto,
  getCurrentLocation,
  getNearbyUsers
} = require('../controllers/users');

middleware = require('../middleware/auth');

// Crear perfil
router.post('/profile', middleware, createUserProfile);

// Obtener perfil actual
router.get('/me', middleware, getUserProfile);

// Actualizar perfil
router.put('/profile', middleware, updateUserProfile);

// Subir foto
router.post('/photo', middleware, uploadPhoto);

// Actualizar ubicación
router.post('/location', middleware, getCurrentLocation);

// Usuarios cercanos
router.get('/nearby', middleware, getNearbyUsers);

module.exports = router;