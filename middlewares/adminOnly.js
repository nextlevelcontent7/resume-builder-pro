/**
 * Middleware ensuring the authenticated user is an admin.
 */
module.exports = function adminOnly(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Admin access required' });
};
