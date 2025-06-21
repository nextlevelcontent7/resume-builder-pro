const { v4: uuid } = require('uuid');

// Attach a request ID to each incoming request
module.exports = function requestId(req, res, next) {
  req.id = uuid();
  res.setHeader('X-Request-Id', req.id);
  next();
};
