const express = require('express');
const router = express.Router();

const {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  deleteConversation
} = require('../controllers/chat');

const middleware = require('../middleware/auth');

// Obtener conversaciones
router.get('/conversations', middleware, getConversations);

// Obtener mensajes de un chat
router.get('/:matchId/messages', middleware, getMessages);

// Enviar mensaje
router.post('/:matchId/send', middleware, sendMessage);

// Marcar como leído
router.post('/:matchId/read', middleware, markAsRead);

// Eliminar conversación
router.delete('/:matchId', middleware, deleteConversation);

module.exports = router;