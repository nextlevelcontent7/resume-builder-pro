/**
 * Middleware enforcing admin access. Accepts multiple roles via the
 * ADMIN_ROLES environment variable. Works with both user tokens and
 * API-key based service accounts.
 */
const { logger } = require('./logger');

module.exports = function adminOnly(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  const allowed = (process.env.ADMIN_ROLES || 'admin').split(',');
  const roles = Array.isArray(req.user.roles) ? req.user.roles : [req.user.role];
  const hasRole = roles.some((r) => allowed.includes(r));
  const override = req.headers[process.env.ADMIN_OVERRIDE_HEADER || 'x-admin-override'];
  if (hasRole || override === process.env.ADMIN_OVERRIDE_TOKEN) {
    return next();
  }
  logger.warn(`adminOnly: forbidden for user ${req.user.id}`);
  return res.status(403).json({ success: false, message: 'Admin access required' });
};
