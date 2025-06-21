const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares');

// Example admin-only endpoint
router.get('/stats', auth, (req, res) => {
  res.json({ uptime: process.uptime() });
});

module.exports = router;
