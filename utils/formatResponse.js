// Helper functions to create consistent API responses with localization

module.exports.success = function success(req, key, data = null) {
  return { success: true, message: req.t(key), data };
};

module.exports.error = function error(req, key, data = null) {
  return { success: false, message: req.t(key), data };
};
