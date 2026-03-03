/**
 * Logger Utility — respects LOG_LEVEL from .env
 * Levels (high → low): error, warn, info, debug, trace
 */

const LEVELS = { error: 0, warn: 1, info: 2, debug: 3, trace: 4 };
const configuredLevel = (process.env.LOG_LEVEL || 'info').toLowerCase();
const threshold = LEVELS[configuredLevel] ?? LEVELS.info;

const timestamp = () => new Date().toISOString();

const fmt = (level, message, data) =>
  `[${timestamp()}] [${level.toUpperCase()}] ${message}${data ? ' — ' + JSON.stringify(data) : ''}`;

const shouldLog = (level) => LEVELS[level] <= threshold;

const logger = {
  error(message, data) {
    if (shouldLog('error')) console.error(fmt('error', message, data?.message || data));
  },
  warn(message, data) {
    if (shouldLog('warn')) console.warn(fmt('warn', message, data));
  },
  info(message, data) {
    if (shouldLog('info')) console.log(fmt('info', message, data));
  },
  debug(message, data) {
    if (shouldLog('debug')) console.log(fmt('debug', message, data));
  },
  trace(message, data) {
    if (shouldLog('trace')) {
      console.log(fmt('trace', message, data));
      console.trace();
    }
  }
};

module.exports = logger;
