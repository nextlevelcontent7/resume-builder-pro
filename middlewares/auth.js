/**
 * Comprehensive authentication middleware. Supports JWT verification and
 * API-key authentication for service accounts. The middleware attaches a
 * `user` object on `req` when authentication succeeds.
 */
const jwt = require('../utils/jwt');
const crypto = require('crypto');

// Extract token helper supports Authorization header, cookies and query string
function getToken(req) {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7);
  if (req.cookies && req.cookies.token) return req.cookies.token;
  if (req.query && req.query.token) return req.query.token;
  return null;
}

module.exports = function auth(req, res, next) {
  // API key short‑circuit for internal service communication
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  const expectedApiKey = process.env.API_KEY;
  if (expectedApiKey && apiKey && crypto.timingSafeEqual(Buffer.from(apiKey), Buffer.from(expectedApiKey))) {
    req.user = { id: 'service', role: 'admin', apiKey: true };
    return next();
  }

  const token = getToken(req);
  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    req.user = { id: payload.id, role: payload.role };
    return next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
};
