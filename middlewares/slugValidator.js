const { validationUtils } = require('../utils');

// Middleware validating :slug param using util validator
module.exports = function slugValidator(req, res, next) {
  const slug = req.params.slug || req.body.slug;
  if (!slug || !validationUtils.isSlug(slug)) {
    return res.status(400).json({ success: false, message: 'Invalid slug' });
  }
  next();
};
