const { success } = require('../utils/formatResponse');
const mongoose = require('../mongoose');

/**
 * Basic health check returning database status and uptime. Useful for
 * container orchestrators or load balancers to verify the service is
 * running correctly.
 */
function getHealth(req, res) {
  const dbState = mongoose.connection.readyState === 1 ? 'up' : 'down';
  const uptime = process.uptime();
  res.json(success(req, 'ok', { db: dbState, uptime }));
}

module.exports = { getHealth };
