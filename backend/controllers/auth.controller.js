const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });

const authResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  token: generateToken(user._id),
});

const updateLoginActivity = async (user) => {
  const now = new Date();
  const lastLoginAt = user.lastLoginAt ? new Date(user.lastLoginAt) : null;

  if (!lastLoginAt) {
    user.loginStreak = 1;
  } else {
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const startOfLastLogin = new Date(lastLoginAt);
    startOfLastLogin.setHours(0, 0, 0, 0);
    const diffDays = Math.round((startOfToday - startOfLastLogin) / 86400000);

    if (diffDays === 0) {
      user.loginStreak = user.loginStreak || 1;
    } else if (diffDays === 1) {
      user.loginStreak = (user.loginStreak || 0) + 1;
    } else {
      user.loginStreak = 1;
    }
  }

  user.longestLoginStreak = Math.max(user.longestLoginStreak || 0, user.loginStreak || 1);
  user.lastLoginAt = now;
  await user.save();
  return user;
};

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please fill all fields');
  }

  const normalizedEmail = email.trim().toLowerCase();
  const exists = await User.findOne({ email: normalizedEmail });
  if (exists) {
    res.status(400);
    throw new Error('Email already registered');
  }

  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(password, salt);
  const user = await User.create({ name, email: normalizedEmail, password: hashed });
  await updateLoginActivity(user);

  res.status(201).json(authResponse(user));
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  if (user && (await bcrypt.compare(password, user.password))) {
    await updateLoginActivity(user);
    res.json(authResponse(user));
    return;
  }

  res.status(401);
  throw new Error('Invalid email or password');
});

const getMe = asyncHandler(async (req, res) => {
  res.json(req.user);
});

const updateMe = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    res.status(400);
    throw new Error('Name is required');
  }
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name: name.trim() },
    { new: true, runValidators: true }
  ).select('-password');
  res.json(user);
});

module.exports = { register, login, getMe, updateMe };
