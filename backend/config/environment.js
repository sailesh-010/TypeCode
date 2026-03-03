/**
 * Environment-specific flags.
 * All primary config lives in config/index.js — this file only adds
 * per-environment boolean flags that don't belong in .env.
 */

const flags = {
  development: { debug: true,  logging: true  },
  production:  { debug: false, logging: false },
  testing:     { debug: true,  logging: false }
};

const env = process.env.NODE_ENV || 'development';

module.exports = flags[env] || flags.development;
