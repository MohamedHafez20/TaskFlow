const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();
connectDB();

const app = express();

// Allow the deployed frontend, common local dev servers, and hosted frontend origins to access the API
const rawAllowedOrigins = [
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
  process.env.VITE_APP_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:8080',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5175',
  'http://127.0.0.1:5176',
  'http://127.0.0.1:3000',
].filter(Boolean);

const allowedOrigins = [...new Set(rawAllowedOrigins.flatMap((value) =>
  value.split(',').map((item) => item.trim()).filter(Boolean)
))];

const isAllowedOrigin = (origin) => {
  if (!origin) return true;

  const normalizedOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin;
  const isLocalDev = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(normalizedOrigin);
  const isRailwayOrigin = /(^https:\/\/.*\.up\.railway\.app$)|(^https:\/\/.*\.railway\.app$)/i.test(normalizedOrigin);
  const isHostedFrontend = /(^https:\/\/.+\.(vercel\.app|netlify\.app|github\.io)$)/i.test(normalizedOrigin);

  return allowedOrigins.includes(normalizedOrigin) || isLocalDev || isRailwayOrigin || isHostedFrontend;
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) return callback(null, true);
    return callback(new Error('CORS policy: origin not allowed'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});

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