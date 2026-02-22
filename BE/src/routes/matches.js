const express = require('express');
const router = express.Router();

const {
  getMatches,
  getMatchesCount,
  unmatchUser,
  reportUser
} = require('../controllers/matches');

const middleware = require('../middleware/auth');

// Obtener matches
router.get('/', middleware, getMatches);

// Contador de matches
router.get('/count', middleware, getMatchesCount);

// Hacer unmatch
router.delete('/:matchId', middleware, unmatchUser);

// Reportar usuario
router.post('/:matchId/report', middleware, reportUser);

module.exports = router;