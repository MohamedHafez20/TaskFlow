const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();
connectDB();

const app = express();

// Support a comma-separated list of allowed client origins via CLIENT_URLS or CLIENT_URL
const rawClientUrls = process.env.CLIENT_URLS || process.env.CLIENT_URL || 'http://localhost:5173,http://localhost:5175';
const allowedOrigins = rawClientUrls.split(',').map((u) => u.trim()).filter(Boolean);

app.use(
	cors({
		origin: (origin, callback) => {
			// allow requests with no origin (e.g. curl, Postman, server-to-server)
			if (!origin) return callback(null, true);
			// exact-match check against allowed origins
			if (allowedOrigins.includes(origin)) return callback(null, true);
			return callback(new Error('CORS policy: origin not allowed'));
		},
		credentials: true,
	})
);
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
