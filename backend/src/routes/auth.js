const express = require('express');
const router = express.Router();
const OAuthProvider = require('../auth/oauth');
const sessionManager = require('../core/session');
const userModel = require('../../models/userModel');
const jwt = require('jsonwebtoken');
const config = require('../../config');
const logger = require('../../utils/logger');

/**
 * GET /api/auth/oauth/authorize/:provider
 * Initiate OAuth flow
 */
router.get('/oauth/authorize/:provider', (req, res) => {
  try {
    const { provider } = req.params;
    const authUrl = OAuthProvider.getAuthorizationUrl(provider);

    res.json({
      success: true,
      authUrl
    });
  } catch (error) {
    logger.error('OAuth authorization error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/auth/oauth/callback/:provider
 * Handle OAuth callback
 */
router.get('/oauth/callback/:provider', async (req, res) => {
  try {
    const { provider } = req.params;
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'No authorization code provided'
      });
    }

    // Exchange code for token
    const tokenResult = await OAuthProvider.exchangeCodeForToken(provider, code);
    
    if (!tokenResult.success) {
      return res.status(400).json(tokenResult);
    }

    // Get user profile
    const profileResult = await OAuthProvider.getUserProfile(provider, tokenResult.accessToken);
    
    if (!profileResult.success) {
      return res.status(400).json(profileResult);
    }

    const profile = profileResult.profile;

    // Find or create user
    let user = userModel.findByEmail(profile.email);
    
    if (!user) {
      user = userModel.create({
        email: profile.email,
        username: profile.name.replace(/\s+/g, '_').toLowerCase(),
        fullName: profile.name,
        password: '', // OAuth users don't have passwords
        role: 'user',
        oauthProvider: provider,
        oauthId: profile.id,
        profilePicture: profile.picture
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    logger.info(`User logged in via ${provider}: ${profile.email}`);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    logger.error('OAuth callback error:', error);
    res.status(500).json({
      success: false,
      message: 'OAuth callback failed'
    });
  }
});

/**
 * GET /api/auth/oauth/verify/:provider
 * Verify OAuth token
 */
router.get('/oauth/verify/:provider', async (req, res) => {
  try {
    const { provider } = req.params;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'No token provided'
      });
    }

    const result = await OAuthProvider.verifyToken(provider, token);

    res.json(result);
  } catch (error) {
    logger.error('OAuth verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Token verification failed'
    });
  }
});

module.exports = router;
