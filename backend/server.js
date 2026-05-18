const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth',  require('./routes/auth.routes'));
app.use('/api/tasks', require('./routes/task.routes'));
app.use('/api/pomodoro', require('./routes/pomodoro.routes'));
app.use('/api/gamification', require('./routes/gamification.routes'));

// Health check
app.get('/', (req, res) => res.json({ message: 'TaskFlow API is running 🚀' }));

// Connect to MongoDB & start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(process.env.PORT, () =>
      console.log(`🚀 Server running on http://localhost:${process.env.PORT}`)
    );
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
