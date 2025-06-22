const { validationUtils } = require('../utils');

// Validate slug parameters or body fields using a reusable util. Slugs must
// contain only lowercase letters, numbers and dashes.
module.exports = function slugValidator(req, res, next) {
  const slug = req.params.slug || req.body.slug;
  if (!slug || !validationUtils.isSlug(slug)) {
    return res.status(400).json({ success: false, message: 'Invalid slug' });
  }
  next();
};
