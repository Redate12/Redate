const express = require('express');
const router = express.Router();

const {
  swipeUser,
  undoSwipe,
  superLikeUser,
  getSwipesHistory
} = require('../controllers/swipes');

const middleware = require('../middleware/auth');

// Dar like
router.post('/:targetId/like', middleware, swipeUser('like'));

// Dar dislike
router.post('/:targetId/dislike', middleware, swipeUser('dislike'));

// Super like
router.post('/:targetId/superlike', middleware, superLikeUser);

// Deshacer último swipe
router.post('/undo', middleware, undoSwipe);

// Historial de swipes
router.get('/history', middleware, getSwipesHistory);

module.exports = router;