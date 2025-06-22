/**
 * Middleware ensuring the authenticated user is an admin.
 */
// Middleware enforcing admin access. Works with both token‑based roles and
// API-key based service accounts.
module.exports = function adminOnly(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  if (req.user.role === 'admin') return next();
  if (req.user.apiKey && process.env.API_KEY_ROLE === 'admin') return next();
  return res.status(403).json({ success: false, message: 'Admin access required' });
};
