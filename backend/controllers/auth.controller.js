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
  avatarUrl: user.avatarUrl || '',
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
  const { name, preferences } = req.body;
  const updates = {};

  if (name !== undefined) {
    if (!name || !name.trim()) {
      res.status(400);
      throw new Error('Name is required');
    }
    updates.name = name.trim();
  }

  if (preferences !== undefined) {
    updates.preferences = {
      ...req.user.preferences,
      ...preferences,
    };
  }

  if (Object.keys(updates).length === 0) {
    res.status(400);
    throw new Error('No fields to update');
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updates,
    { new: true, runValidators: true }
  ).select('-password');
  res.json(user);
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('Please fill all password fields');
  }

  const user = await User.findById(req.user._id);

  if (user && (await bcrypt.compare(currentPassword, user.password))) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    res.json({ message: 'Password updated successfully' });
    return;
  }

  res.status(401);
  throw new Error('Invalid current password');
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error('Please provide email address');
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() });

  if (!user) {
    res.status(404);
    throw new Error('User with this email does not exist');
  }

  res.json({
    message: 'Reset instructions have been sent successfully (simulated).',
  });
});

module.exports = { register, login, getMe, updateMe, changePassword, forgotPassword };
