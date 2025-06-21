// Middleware for handling 404 errors in production
const { error } = require('../utils/formatResponse');

module.exports = (req, res, next) => {
  res.status(404).json(error(req, 'notFound'));
};
