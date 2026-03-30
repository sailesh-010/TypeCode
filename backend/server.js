const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const session = require('express-session');
const path = require('path');

const config = require('./config');
const logger = require('./utils/logger');

const app = express();

// Security headers
app.use(helmet({
  contentSecurityPolicy: false // Allow inline scripts for frontend
}));

// CORS
app.use(cors({
  origin: config.frontend.url,
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files from frontend
const frontendPath = path.join(__dirname, '../frontend/public');
app.use(express.static(frontendPath));

// Session configuration
app.use(session({
  secret: config.session.secret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: config.nodeEnv === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const leaderboardRoutes = require('./routes/leaderboard');
const aiRoutes = require('./src/routes/ai');

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    environment: config.nodeEnv
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/user-ranking', leaderboardRoutes); // Alias for user ranking endpoint
app.use('/api/ai', aiRoutes);

// Global error handler (must have 4 params)
app.use('/api', (err, req, res, _next) => {
  logger.error('Unhandled API error', err);
  res.status(err.status || 500).json({
    success: false,
    message: config.nodeEnv === 'production' ? 'Internal Server Error' : err.message
  });
});

// Frontend routes - serve correct HTML for each slug
const pageRoutes = {
  '/': 'index.html',
  '/login': 'login.html',
  '/signup': 'signup.html',
  '/about': 'about.html',
  '/account': 'account.html',
  '/settings': 'settings.html',
  '/practice': 'practice.html',
  '/leaderboard': 'leaderboard.html'
};

Object.entries(pageRoutes).forEach(([route, file]) => {
  app.get(route, (req, res) => {
    res.sendFile(path.join(frontendPath, file));
  });
});

// SPA catch-all
app.use((req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Start server
const server = app.listen(config.port, () => {
  logger.info(`Server running on port ${config.port}`);
  logger.info(`Environment: ${config.nodeEnv}`);
});

// Graceful shutdown
const shutdown = (signal) => {
  logger.info(`${signal} received — shutting down gracefully`);
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

