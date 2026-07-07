const express = require('express');
const protect = require('../middleware/auth');
const { createReview, getReviews } = require('../controllers/review.controller');

const router = express.Router();

// Public: anyone (incl. logged-out landing visitors) can read reviews.
router.get('/', getReviews);

// Authenticated: users create reviews as themselves (user id from the token).
router.post('/', protect, createReview);

module.exports = router;
