/**
 * Middleware enforcing admin access. Accepts multiple roles via the
 * ADMIN_ROLES environment variable. Works with both user tokens and
 * API-key based service accounts.
 */
module.exports = function adminOnly(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  const allowed = (process.env.ADMIN_ROLES || 'admin').split(',');
  const roles = Array.isArray(req.user.roles) ? req.user.roles : [req.user.role];
  const hasRole = roles.some((r) => allowed.includes(r));
  if (hasRole) return next();
  return res.status(403).json({ success: false, message: 'Admin access required' });
};
