const Task = require('../models/Task');
const asyncHandler = require('../middleware/asyncHandler');

const normalizeTaskBody = (body) => {
  const updates = {};
  const editableFields = ['title', 'description', 'status', 'priority'];

  editableFields.forEach((field) => {
    if (body[field] !== undefined) updates[field] = body[field];
  });

  if ('dueDate' in body || 'deadline' in body) {
    const taskDate = body.dueDate !== undefined ? body.dueDate : body.deadline;
    const normalizedDate = taskDate ? new Date(taskDate) : null;
    updates.dueDate = normalizedDate;
    updates.deadline = normalizedDate;
  }

  return updates;
};

const getTasks = asyncHandler(async (req, res) => {
  const query = { user: req.user._id };

  if (req.query.status) query.status = req.query.status;
  if (req.query.priority) query.priority = req.query.priority;

  const tasks = await Task.find(query).sort({ createdAt: -1 });
  res.json(tasks);
});

const createTask = asyncHandler(async (req, res) => {
  const { title } = req.body;

  if (!title) {
    res.status(400);
    throw new Error('Title is required');
  }

  const task = await Task.create({
    ...normalizeTaskBody(req.body),
    user: req.user._id,
  });

  res.status(201).json(task);
});

const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  if (task.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not allowed');
  }

  const updated = await Task.findByIdAndUpdate(req.params.id, normalizeTaskBody(req.body), {
    new: true,
    runValidators: true,
  });

  res.json(updated);
});

const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  if (task.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not allowed');
  }

  await task.deleteOne();
  res.json({ message: 'Task deleted', id: req.params.id });
});

const getStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const [total, todo, inProgress, done] = await Promise.all([
    Task.countDocuments({ user: userId }),
    Task.countDocuments({ user: userId, status: 'todo' }),
    Task.countDocuments({ user: userId, status: 'in-progress' }),
    Task.countDocuments({ user: userId, status: 'done' }),
  ]);

  res.json({ total, todo, inProgress, done });
});

module.exports = { getTasks, createTask, updateTask, deleteTask, getStats };
