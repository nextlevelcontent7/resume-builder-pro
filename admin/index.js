const router = require('express').Router();
const adminRoutes = require('../routes/adminRoutes');

// This router simply delegates to api admin routes
router.use('/', adminRoutes);

module.exports = router;
