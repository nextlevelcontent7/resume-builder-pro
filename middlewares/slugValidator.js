const { validationUtils } = require('../utils');

const SLUG_REGEX = new RegExp(process.env.SLUG_PATTERN || '^[a-z0-9]+(?:-[a-z0-9]+)*$');

// Validate slug parameters or body fields using a reusable util. Slugs must
// contain only lowercase letters, numbers and dashes.
module.exports = function slugValidator(req, res, next) {
  const slug = req.params.slug || req.body.slug;
  if (!slug || !SLUG_REGEX.test(slug)) {
    return res.status(400).json({ success: false, message: 'Invalid slug' });
  }
  next();
};
