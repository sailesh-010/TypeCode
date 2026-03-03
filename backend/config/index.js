require('dotenv').config();

const env = process.env;

module.exports = {
  port: parseInt(env.PORT, 10) || 3000,
  nodeEnv: env.NODE_ENV || 'development',
  mongodb: {
    uri: env.DB_CONNECTION_STRING || 'mongodb://localhost:27017/typecode'
  },
  jwt: {
    secret: env.JWT_SECRET || env.SESSION_SECRET || 'your-secret-key',
    expiresIn: env.JWT_EXPIRES_IN || '24h'
  },
  session: {
    secret: env.SESSION_SECRET || 'session-secret-key'
  },
  google: {
    apiKey: env.GOOGLE_API_KEY,
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    callbackUrl: env.GOOGLE_CALLBACK_URL || `http://localhost:${env.PORT || 3000}/api/auth/google/callback`
  },
  frontend: {
    url: env.CORS_ORIGIN || env.FRONTEND_URL || 'http://localhost:3000'
  },
  logging: {
    level: env.LOG_LEVEL || 'info'
  }
};
