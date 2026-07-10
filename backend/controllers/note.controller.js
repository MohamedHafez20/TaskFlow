const Note = require('../models/Note');
const asyncHandler = require('../middleware/asyncHandler');

// Build a clean, whitelisted set of fields from the request body.
const normalizeNoteBody = (body) => {
  const updates = {};

  if (body.title !== undefined) updates.title = String(body.title).trim() || 'Untitled';
  if (body.content !== undefined) updates.content = String(body.content);
  if (body.tags !== undefined) {
    updates.tags = Array.isArray(body.tags)
      ? body.tags.map((t) => String(t).trim()).filter(Boolean)
      : [];
  }
  if ('noteDate' in body) {
    updates.noteDate = body.noteDate ? new Date(body.noteDate) : null;
  }

  return updates;
};

const getNotes = asyncHandler(async (req, res) => {
  const notes = await Note.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(notes);
});

const getNote = asyncHandler(async (req, res) => {
  const note = await Note.findById(req.params.id);

  if (!note) {
    res.status(404);
    throw new Error('Note not found');
  }

  if (note.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not allowed');
  }

  res.json(note);
});

const createNote = asyncHandler(async (req, res) => {
  const body = normalizeNoteBody(req.body);

  if (!body.title?.trim() && !body.content?.trim()) {
    res.status(400);
    throw new Error('A note needs a title or content');
  }

  const note = await Note.create({
    ...body,
    user: req.user._id,
  });

  res.status(201).json(note);
});

const updateNote = asyncHandler(async (req, res) => {
  const note = await Note.findById(req.params.id);

  if (!note) {
    res.status(404);
    throw new Error('Note not found');
  }

  if (note.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not allowed');
  }

  const updated = await Note.findByIdAndUpdate(
    req.params.id,
    normalizeNoteBody(req.body),
    { new: true, runValidators: true }
  );

  res.json(updated);
});

const deleteNote = asyncHandler(async (req, res) => {
  const note = await Note.findById(req.params.id);

  if (!note) {
    res.status(404);
    throw new Error('Note not found');
  }

  if (note.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not allowed');
  }

  await note.deleteOne();
  res.json({ message: 'Note deleted', id: req.params.id });
});

module.exports = { getNotes, getNote, createNote, updateNote, deleteNote };
