const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
console.log("✅ Google Route Hit");
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'taskflow-dev-secret', {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });

const authResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  avatarUrl: user.avatarUrl || '',
  professionalTitle: user.professionalTitle || 'Deep Worker',
  token: generateToken(user._id),
});

const verifyGoogleToken = async (credential) => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    throw new Error('Google authentication is not configured');
  }

  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  if (!payload?.email) {
    throw new Error('Google email is not available');
  }

  return {
    googleId: payload.sub,
    name: payload.name || payload.given_name || 'Google User',
    email: payload.email,
    avatar: payload.picture || '',
  };
};

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
  const user = await User.create({
    name,
    email: normalizedEmail,
    password: hashed,
  });

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

  if (user && user.password && (await bcrypt.compare(password, user.password))) {
    await updateLoginActivity(user);
    res.json(authResponse(user));
    return;
  }

  res.status(401);
  throw new Error('Invalid email or password');
});

const googleLogin = asyncHandler(async (req, res) => {
  const { credential } = req.body;
console.log("✅ Google route reached");
  if (!credential) {
    res.status(400);
    throw new Error('Google credential is required');
  }

  const { googleId, name, email, avatar } = await verifyGoogleToken(credential);
  const normalizedEmail = email.trim().toLowerCase();

  let user = await User.findOne({ email: normalizedEmail });

  if (user) {
    const updates = {};

    if (!user.googleId) updates.googleId = googleId;
    if (!user.name && name) updates.name = name;
    if (!user.avatarUrl && avatar) updates.avatarUrl = avatar;
    if (avatar && user.avatarUrl !== avatar) updates.avatarUrl = avatar;

    if (Object.keys(updates).length > 0) {
      user = await User.findByIdAndUpdate(user._id, updates, { new: true, runValidators: true });
    }

    await updateLoginActivity(user);
    res.json(authResponse(user));
    return;
  }

  const createdUser = await User.create({
    name,
    email: normalizedEmail,
    googleId,
    avatarUrl: avatar,
    password: '',
  });

  await updateLoginActivity(createdUser);
  res.status(201).json(authResponse(createdUser));
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

  // Keep the minimum in sync with registration (6+ characters).
  if (newPassword.length < 6) {
    res.status(400);
    throw new Error('New password must be at least 6 characters');
  }

  const user = await User.findById(req.user._id);

  if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
    res.status(401);
    throw new Error('Current password is incorrect');
  }

  if (await bcrypt.compare(newPassword, user.password)) {
    res.status(400);
    throw new Error('New password must be different from your current password');
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();

  res.json({ message: 'Password updated successfully' });
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

module.exports = { register, login, googleLogin, getMe, updateMe, changePassword, forgotPassword };
