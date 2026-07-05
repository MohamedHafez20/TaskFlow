const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    mode: {
      type: String,
      enum: ['focus', 'work', 'short-break', 'shortBreak', 'long-break', 'longBreak'],
      default: 'focus',
    },
    duration: { type: Number, required: true },
    isDeepSession: { type: Boolean, default: false },
    completed: { type: Boolean, default: false },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

sessionSchema.index({ user: 1, completed: 1, completedAt: -1 });

module.exports = mongoose.model('PomodoroSession', sessionSchema);
