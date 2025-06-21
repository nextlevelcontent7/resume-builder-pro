// Example route file demonstrating localized responses
const router = require('express').Router();
const { success } = require('../utils/formatResponse');
const adminRouter = require('../admin');

router.get('/', (req, res) => {
  res.json(success(req, 'welcome'));
});

// mount admin routes under /admin
router.use('/admin', adminRouter);

module.exports = router;
