const logger = require('../utils/logger');

/**
 * Log login attempts
 */
const logLoginAttempt = (req, res, next) => {
  const { email, username } = req.body;
  logger.info(`Login attempt for: ${email || username}`);
  next();
};

/**
 * Validate login credentials format
 */
const validateLoginInput = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  next();
};

/**
 * Rate limiting for login attempts (simple implementation)
 */
const loginAttempts = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

// Periodically purge expired entries to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of loginAttempts) {
    if (now - record.resetTime > RATE_LIMIT_WINDOW) loginAttempts.delete(key);
  }
}, RATE_LIMIT_WINDOW).unref();

const rateLimit = (req, res, next) => {
  const identifier = req.body.email || req.ip;

  if (!loginAttempts.has(identifier)) {
    loginAttempts.set(identifier, { count: 0, resetTime: Date.now() });
  }

  const record = loginAttempts.get(identifier);

  if (Date.now() - record.resetTime > RATE_LIMIT_WINDOW) {
    record.count = 0;
    record.resetTime = Date.now();
  }

  if (record.count >= MAX_ATTEMPTS) {
    return res.status(429).json({
      success: false,
      message: 'Too many login attempts. Please try again later.'
    });
  }

  record.count++;
  next();
};

module.exports = {
  logLoginAttempt,
  validateLoginInput,
  rateLimit
};
