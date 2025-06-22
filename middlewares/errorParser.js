// Map common error types to HTTP status codes and localisation keys
module.exports = function errorParser(err, req, res, next) {
  if (err.name === 'ValidationError') {
    err.status = 400;
    err.messageKey = 'validationFailed';
  } else if (err.code && err.code === 11000) {
    // Mongo duplicate key
    err.status = 409;
    err.messageKey = 'duplicate';
  } else if (err.name === 'CastError') {
    err.status = 400;
    err.messageKey = 'invalidId';
  } else if (err.name === 'JsonWebTokenError') {
    err.status = 401;
    err.messageKey = 'invalidToken';
  } else if (err.name === 'TokenExpiredError') {
    err.status = 401;
    err.messageKey = 'tokenExpired';
  }
  next(err);
};
