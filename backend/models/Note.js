const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, default: 'Untitled', trim: true },
    content: { type: String, default: '' },
    tags: [{ type: String, trim: true }],
    // Optional reminder/schedule date the user attaches to a note (UI "noteDate")
    noteDate: { type: Date, default: null },
  },
  { timestamps: true }
);

noteSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Note', noteSchema);
