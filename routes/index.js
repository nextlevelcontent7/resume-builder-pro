// Example route file demonstrating localized responses
const router = require('express').Router();
const { success } = require('../utils/formatResponse');
const { getHealth } = require('../controllers/healthController');

router.get('/', (req, res) => {
  res.json(success(req, 'welcome'));
});

// simple health check endpoint
router.get('/health', getHealth);

// Admin routes are mounted in app.js to ensure proper middleware stack

module.exports = router;
