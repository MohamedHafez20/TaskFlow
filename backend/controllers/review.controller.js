const Review = require('../models/Review');
const asyncHandler = require('../middleware/asyncHandler');

const MIN_LEN = 3;
const MAX_LEN = 500;

const serialize = (r) => ({
  id: r._id,
  rating: r.rating,
  review: r.review,
  name: r.user?.name || 'TaskFlow User',
  avatarUrl: r.user?.avatarUrl || '',
  createdAt: r.createdAt,
});

const createReview = asyncHandler(async (req, res) => {
  const rating = Number(req.body.rating);
  const review = req.body.review;

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    res.status(400);
    throw new Error('Rating must be a whole number between 1 and 5.');
  }

  if (typeof review !== 'string' || !review.trim()) {
    res.status(400);
    throw new Error('Review text is required.');
  }

  const text = review.trim();
  if (text.length < MIN_LEN || text.length > MAX_LEN) {
    res.status(400);
    throw new Error(`Review must be between ${MIN_LEN} and ${MAX_LEN} characters.`);
  }

  const created = await Review.create({ user: req.user._id, rating, review: text });
  await created.populate('user', 'name avatarUrl');

  res.status(201).json(serialize(created));
});

const getReviews = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Review.find()
      .populate('user', 'name avatarUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Review.countDocuments(),
  ]);

  res.json({
    reviews: items.map(serialize),
    total,
    page,
    pages: Math.ceil(total / limit) || 1,
  });
});

module.exports = { createReview, getReviews };
