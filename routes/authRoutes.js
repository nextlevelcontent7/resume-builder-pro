const router = require('express').Router();
const { body } = require('express-validator');
const auth = require('../middlewares/auth');
const ctrl = require('../controllers/authController');

router.post('/register', body('email').isEmail(), body('password').isLength({ min: 6 }), ctrl.register);
router.post('/login', ctrl.login);
router.post('/refresh', ctrl.refresh);
router.get('/verify', ctrl.verifyEmail);
router.post('/forgot', ctrl.forgot);
router.post('/reset', ctrl.reset);

module.exports = router;
