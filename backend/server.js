const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();
connectDB();

const app = express();

// Allow the deployed frontend, local Vite dev servers, and Railway-hosted origins to access the API
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
].filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin) return true;

  const normalizedOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin;
  const isLocalDev = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(normalizedOrigin);
  const isRailwayOrigin = /(^https:\/\/.*\.up\.railway\.app$)|(^https:\/\/.*\.railway\.app$)/i.test(normalizedOrigin);
  const isHostedFrontend = /\.(vercel\.app|netlify\.app|github\.io)$/i.test(normalizedOrigin);

  return allowedOrigins.includes(normalizedOrigin) || isLocalDev || isRailwayOrigin || isHostedFrontend;
};

app.use(cors({
  origin: function (origin, callback) {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.options('*', cors({ origin: true, credentials: true }));

app.use(express.json());

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/tasks', require('./routes/task.routes'));
app.use('/api/notes', require('./routes/note.routes'));
app.use('/api/pomodoro', require('./routes/pomodoro.routes'));
app.use('/api/gamification', require('./routes/gamification.routes'));
app.use('/api/reviews', require('./routes/review.routes'));
app.use('/api/chat', require('./routes/chat.routes'));

app.get('/', (req, res) => res.json({ message: 'TaskFlow API is running' }));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));