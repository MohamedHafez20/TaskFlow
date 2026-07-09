const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();
connectDB();

const app = express();

// Allow both the deployed frontend (Vercel) and local dev to hit this API
const allowedOrigins = [
  process.env.CLIENT_URL,      // e.g. https://task-flow-ten-snowy-81.vercel.app
  'http://localhost:5173',     // local Vite dev server
].filter(Boolean); // removes CLIENT_URL if it's undefined

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (e.g. curl, Postman, mobile apps)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
}));

app.use(express.json());

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/tasks', require('./routes/task.routes'));
app.use('/api/pomodoro', require('./routes/pomodoro.routes'));
app.use('/api/gamification', require('./routes/gamification.routes'));
app.use('/api/reviews', require('./routes/review.routes'));
app.use('/api/chat', require('./routes/chat.routes'));

app.get('/', (req, res) => res.json({ message: 'TaskFlow API is running' }));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));