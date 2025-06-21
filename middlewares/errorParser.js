module.exports = function errorParser(err, req, res, next) {
  if (err.name === 'ValidationError') {
    err.status = 400;
    err.messageKey = 'validationFailed';
  }
  next(err);
};
