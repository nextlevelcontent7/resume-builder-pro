const { v4: uuid } = require('uuid');

// Attach a request ID header for traceability across distributed services. The
// header name and generation strategy can be customised via environment vars.
const HEADER = process.env.REQUEST_ID_HEADER || 'X-Request-Id';

module.exports = function requestId(req, res, next) {
  req.id = uuid();
  res.setHeader(HEADER, req.id);
  next();
};
