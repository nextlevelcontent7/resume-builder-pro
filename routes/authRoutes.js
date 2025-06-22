/**
 * Authentication routes handle user registration, login and password resets.
 * Input is validated using express-validator and responses are wrapped in
 * consistent error handling via asyncHandler.
 */
const router = require('express').Router();
const { body } = require('express-validator');
const auth = require('../middlewares/auth');
const ctrl = require('../controllers/authController');

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.post(
  '/register',
  [body('email').isEmail(), body('password').isLength({ min: 6 })],
  asyncHandler(ctrl.register)
);
router.post('/login', asyncHandler(ctrl.login));
router.post('/refresh', asyncHandler(ctrl.refresh));
router.get('/verify', asyncHandler(ctrl.verifyEmail));
router.post('/forgot', asyncHandler(ctrl.forgot));
router.post('/reset', asyncHandler(ctrl.reset));

module.exports = router;
