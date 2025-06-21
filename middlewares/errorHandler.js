// Centralized error handling middleware for production use
const { logger } = require('./logger');
const { error } = require('../utils/formatResponse');

module.exports = (err, req, res, next) => {
  logger.error(err.stack || err.message);

  const status = err.status || 500;
  const messageKey = err.messageKey || 'serverError';

  res.status(status).json(error(req, messageKey));
};
