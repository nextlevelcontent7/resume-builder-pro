const { logger } = require('./logger');

module.exports = function userAuditLogger(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const user = req.user ? req.user.id : 'guest';
    logger.info('AUDIT', { user, method: req.method, url: req.originalUrl, status: res.statusCode, ms: duration });
  });
  next();
};
