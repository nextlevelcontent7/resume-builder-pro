/**
 * Advanced authentication middleware supporting JWT verification and API-key
 * fallback for service-to-service communication. This module validates tokens,
 * attaches a user object to the request, and allows environment-driven config
 * for algorithm choice and expiration tolerances.
 */
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { logger } = require('./logger');

const TOKEN_HEADER = process.env.AUTH_HEADER || 'authorization';
const API_KEY_HEADER = process.env.API_KEY_HEADER || 'x-api-key';

let jwksCache = null;
let jwksTimestamp = 0;
const JWKS_URL = process.env.AUTH_JWKS_URL;
const JWKS_CACHE_MS = parseInt(process.env.JWKS_CACHE_MS || `${10 * 60 * 1000}`, 10);

async function fetchJwks() {
  if (!JWKS_URL) return null;
  if (jwksCache && Date.now() - jwksTimestamp < JWKS_CACHE_MS) return jwksCache;
  try {
    const res = await fetch(JWKS_URL);
    const data = await res.json();
    jwksCache = data.keys || [];
    jwksTimestamp = Date.now();
    return jwksCache;
  } catch (err) {
    logger.error('auth: failed to fetch JWKS', err);
    return null;
  }
}

async function getSigningKey(kid) {
  const keys = await fetchJwks();
  if (keys) {
    const key = keys.find((k) => k.kid === kid);
    if (key && key.x5c && key.x5c.length) {
      return `-----BEGIN CERTIFICATE-----\n${key.x5c[0]}\n-----END CERTIFICATE-----`;
    }
  }
  return process.env.JWT_SECRET;
}

// Extract token helper: Authorization header, cookies, or query parameter
function getToken(req) {
  const header = req.headers[TOKEN_HEADER] || '';
  if (header.startsWith('Bearer ')) return header.slice(7);
  if (req.cookies && req.cookies.token) return req.cookies.token;
  if (req.query && req.query.token) return req.query.token;
  return null;
}

module.exports = async function auth(req, res, next) {
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
    const decoded = jwt.decode(token, { complete: true });
    const kid = decoded && decoded.header && decoded.header.kid;
    const key = await getSigningKey(kid);
    const payload = jwt.verify(token, key, {
      algorithms: (process.env.JWT_ALGORITHMS || 'HS256').split(',').map((a) => a.trim()),
      audience: process.env.JWT_AUD,
      issuer: process.env.JWT_ISSUER,
    });

    req.user = {
      id: payload.sub || payload.id,
      role: payload.role || 'user',
      token,
      iss: payload.iss,
    };
    return next();
  } catch (err) {
    logger.warn('auth: invalid token', err.message);
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
};
