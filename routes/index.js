// Root API routes expose a welcome message, health check and a list of
// available resume templates for the frontend to display. The heavy
// administration routes are mounted separately in `app.js`.
const router = require('express').Router();
const { success } = require('../utils/formatResponse');
const { getHealth } = require('../controllers/healthController');
const fs = require('fs');
const path = require('path');

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.get('/', (req, res) => {
  res.json(success(req, 'welcome'));
});

// simple health check endpoint
router.get('/health', asyncHandler(getHealth));

// expose available Handlebars templates so the client knows which
// themes can be selected when exporting to PDF
router.get(
  '/templates',
  asyncHandler((req, res) => {
    const dir = path.join(__dirname, '..', 'templates');
    const list = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith('.hbs'))
      .map((f) => path.basename(f, '.hbs'));
    res.json(success(req, 'ok', list));
  })
);

module.exports = router;
