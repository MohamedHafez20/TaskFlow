const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
const { MAX_FILE_SIZE } = require('../middleware/upload');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Shape returned to the client for every profile-related response.
const profileResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  avatarUrl: user.avatarUrl || '',
});

const getProfile = asyncHandler(async (req, res) => {
  res.json(profileResponse(req.user));
});

const updateName = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name || !name.trim()) {
    res.status(400);
    throw new Error('Name is required');
  }

  const trimmed = name.trim();
  if (trimmed.length < 3) {
    res.status(400);
    throw new Error('Name must be at least 3 characters long');
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.name = trimmed;
  await user.save();

  res.json(profileResponse(user));
});

const updateEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email || !email.trim()) {
    res.status(400);
    throw new Error('Email is required');
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!EMAIL_REGEX.test(normalizedEmail)) {
    res.status(400);
    throw new Error('Please provide a valid email address');
  }

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing && existing._id.toString() !== req.user._id.toString()) {
    res.status(409);
    throw new Error('Email already in use');
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.email = normalizedEmail;
  await user.save();

  res.json(profileResponse(user));
});

const updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No image file provided');
  }

  if (req.file.size > MAX_FILE_SIZE) {
    res.status(400);
    throw new Error('Image must be 2MB or smaller');
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Store the image as a base64 data URI so it survives redeploys (no disk needed).
  const base64 = req.file.buffer.toString('base64');
  user.avatarUrl = `data:${req.file.mimetype};base64,${base64}`;
  await user.save();

  res.json(profileResponse(user));
});

module.exports = { getProfile, updateName, updateEmail, updateAvatar };
