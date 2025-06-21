// Example route file demonstrating localized responses
const router = require('express').Router();
const { success } = require('../utils/formatResponse');
router.get('/', (req, res) => {
  res.json(success(req, 'welcome'));
});

// Admin routes are mounted in app.js to ensure proper middleware stack

module.exports = router;
