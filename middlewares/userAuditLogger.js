const { logger } = require('./logger');
const crypto = require('crypto');

// Lightweight user auditing for security and analytics. Stores hashed IP for
// privacy and correlates events via request ID.
module.exports = function userAuditLogger(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const user = req.user ? req.user.id : 'guest';
    const ipHash = crypto.createHash('sha256').update(req.ip || '').digest('hex');
    logger.info('AUDIT', {
      user,
      ip: ipHash,
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      ms: duration,
      id: req.id,
    });
  });
  next();
};
