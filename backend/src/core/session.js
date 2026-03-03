/**
 * Session Management
 */

const logger = require('../../utils/logger');

class SessionManager {
  constructor() {
    this.sessions = new Map();
  }

  /**
   * Create a new session
   */
  createSession(user) {
    try {
      const sessionId = this.generateSessionId();
      const session = {
        id: sessionId,
        userId: user.id,
        email: user.email,
        username: user.username,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        lastActivity: new Date(),
        ipAddress: null,
        userAgent: null
      };

      this.sessions.set(sessionId, session);
      logger.info(`Session created for user ${user.email}`);

      return {
        success: true,
        sessionId,
        expiresAt: session.expiresAt
      };
    } catch (error) {
      logger.error('Session creation error:', error);
      return {
        success: false,
        error: 'Failed to create session'
      };
    }
  }

  /**
   * Validate session
   */
  validateSession(sessionId) {
    try {
      const session = this.sessions.get(sessionId);

      if (!session) {
        return {
          valid: false,
          error: 'Session not found'
        };
      }

      if (new Date() > session.expiresAt) {
        this.sessions.delete(sessionId);
        return {
          valid: false,
          error: 'Session expired'
        };
      }

      // Update last activity
      session.lastActivity = new Date();

      return {
        valid: true,
        session
      };
    } catch (error) {
      logger.error('Session validation error:', error);
      return {
        valid: false,
        error: 'Session validation failed'
      };
    }
  }

  /**
   * Extend session expiry
   */
  extendSession(sessionId) {
    try {
      const session = this.sessions.get(sessionId);

      if (!session) {
        return {
          success: false,
          error: 'Session not found'
        };
      }

      session.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      logger.info(`Session extended for user ${session.email}`);

      return {
        success: true,
        expiresAt: session.expiresAt
      };
    } catch (error) {
      logger.error('Session extension error:', error);
      return {
        success: false,
        error: 'Failed to extend session'
      };
    }
  }

  /**
   * Destroy session
   */
  destroySession(sessionId) {
    try {
      const session = this.sessions.get(sessionId);

      if (session) {
        this.sessions.delete(sessionId);
        logger.info(`Session destroyed for user ${session.email}`);
      }

      return {
        success: true,
        message: 'Session destroyed'
      };
    } catch (error) {
      logger.error('Session destruction error:', error);
      return {
        success: false,
        error: 'Failed to destroy session'
      };
    }
  }

  /**
   * Get user sessions
   */
  getUserSessions(userId) {
    try {
      const userSessions = Array.from(this.sessions.values())
        .filter(session => session.userId === userId);

      return {
        success: true,
        sessions: userSessions
      };
    } catch (error) {
      logger.error('User sessions fetch error:', error);
      return {
        success: false,
        error: 'Failed to fetch sessions'
      };
    }
  }

  /**
   * Cleanup expired sessions
   */
  cleanupExpiredSessions() {
    try {
      let cleanedCount = 0;
      const now = new Date();

      for (const [sessionId, session] of this.sessions.entries()) {
        if (now > session.expiresAt) {
          this.sessions.delete(sessionId);
          cleanedCount++;
        }
      }

      logger.info(`Cleaned up ${cleanedCount} expired sessions`);

      return {
        success: true,
        cleanedCount
      };
    } catch (error) {
      logger.error('Session cleanup error:', error);
      return {
        success: false,
        error: 'Failed to cleanup sessions'
      };
    }
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get total active sessions
   */
  getActiveSessionCount() {
    return this.sessions.size;
  }
}

module.exports = new SessionManager();
