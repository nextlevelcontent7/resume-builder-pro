/**
 * Simple authentication middleware for demonstration.
 * Checks for Authorization header `Bearer demo-token`.
 */
module.exports = function auth(req, res, next) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const token = auth.slice(7);
  // In real app verify JWT or session token here
  if (token !== 'demo-token') {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  req.user = { id: 'demoUser' };
  next();
};
