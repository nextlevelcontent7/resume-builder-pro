/**
 * Advanced authentication middleware supporting JWT verification and API-key
 * fallback for service-to-service communication. This module validates tokens,
 * attaches a user object to the request, and allows environment-driven config
 * for algorithm choice and expiration tolerances.
 */
const jwt = require('../utils/jwt');
const crypto = require('crypto');
const { logger } = require('./logger');

const TOKEN_HEADER = process.env.AUTH_HEADER || 'authorization';
const API_KEY_HEADER = process.env.API_KEY_HEADER || 'x-api-key';

// Extract token helper: Authorization header, cookies, or query parameter
function getToken(req) {
  const header = req.headers[TOKEN_HEADER] || '';
  if (header.startsWith('Bearer ')) return header.slice(7);
  if (req.cookies && req.cookies.token) return req.cookies.token;
  if (req.query && req.query.token) return req.query.token;
  return null;
}

module.exports = function auth(req, res, next) {
  // API key short-circuit for internal service communication
  const apiKey = req.headers[API_KEY_HEADER] || req.query.apiKey;
  const expectedApiKey = process.env.API_KEY;
  const apiKeyRole = process.env.API_KEY_ROLE || 'admin';
  if (expectedApiKey && apiKey) {
    try {
      if (crypto.timingSafeEqual(Buffer.from(apiKey), Buffer.from(expectedApiKey))) {
        req.user = { id: 'service', role: apiKeyRole, apiKey: true };
        return next();
      }
    } catch (err) {
      // timingSafeEqual throws if length mismatch
    }
  }

  const token = getToken(req);
  if (!token) {
    logger.warn('auth: no token provided');
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    req.user = { id: payload.id, role: payload.role, token: token };
    return next();
  } catch (err) {
    logger.warn('auth: invalid token', err.message);
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
};
