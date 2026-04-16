const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const saasRoutes = require('./routes/saasRoutes');
const platformRoutes = require('./routes/platformRoutes');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

const app = express();

const defaultClient = 'http://localhost:5173';
const allowedOrigins = process.env.CLIENT_URL ? [process.env.CLIENT_URL] : [defaultClient, 'http://127.0.0.1:5173'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (process.env.NODE_ENV !== 'production') return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());
app.use(morgan('dev'));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 500 }));

app.get('/', (_, res) => {
  res.json({
    ok: true,
    service: 'InnoPulse 360 API',
    docs: '/api/health'
  });
});

app.get('/api', (_, res) => {
  res.json({
    ok: true,
    service: 'InnoPulse 360 API',
    health: '/api/health'
  });
});

app.get('/api/routes', (_, res) => {
  res.json({
    message: 'Use correct HTTP method + path',
    routes: [
      'GET /',
      'GET /api',
      'GET /api/health',
      'GET /api/routes',
      'POST /api/auth/register',
      'POST /api/auth/verify-otp',
      'POST /api/auth/login',
      'POST /api/auth/forgot-password',
      'POST /api/auth/reset-password/:token',
      'GET /api/dashboard/participant/overview',
      'GET /api/dashboard/mentor/overview',
      'GET /api/dashboard/jury/overview',
      'GET /api/dashboard/admin/overview'
    ]
  });
});

app.get('/api/health', (_, res) => res.json({ ok: true, service: 'InnoPulse 360 API' }));
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api', saasRoutes);
app.use('/api/platform', platformRoutes);

app.use((_, res) => res.status(404).json({ message: 'Route not found' }));
app.use(errorHandler);

module.exports = app;
