// Middleware ensuring the authenticated user matches the resource owner. It
// expects the request to include `:id` or `userId` parameter and compares it to
// `req.user.id`. Admins bypass the check.
module.exports = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  if (req.user.role === 'admin') return next();
  const targetId = req.params.id || req.params.userId || req.body.userId;
  if (targetId && targetId.toString() === req.user.id.toString()) {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Forbidden' });
};
