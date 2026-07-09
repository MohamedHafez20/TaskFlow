const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    avatarUrl: { type: String, default: '' },
    professionalTitle: { type: String, default: 'Deep Worker', trim: true },
    points: { type: Number, default: 0 },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    levelName: { type: String, default: 'Beginner' },
    totalTasksDone: { type: Number, default: 0 },
    totalFocusSessions: { type: Number, default: 0 },
    totalFocusMinutes: { type: Number, default: 0 },
    totalDeepSessions: { type: Number, default: 0 },
    loginStreak: { type: Number, default: 0 },
    longestLoginStreak: { type: Number, default: 0 },
    lastLoginAt: { type: Date },
    badges: [{ type: String }],
    preferences: {
      autoStartBreaks: { type: Boolean, default: true },
      soundNotifications: { type: Boolean, default: true },
      deepFocusMood: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

userSchema.index({ points: -1 });

module.exports = mongoose.model('User', userSchema);
