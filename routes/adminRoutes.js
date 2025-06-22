/**
 * Admin routes provide privileged management capabilities for user accounts,
 * resumes, application settings and logs. Each endpoint is protected by
 * authentication and the `adminOnly` middleware to enforce RBAC.
 */
const router = require('express').Router();
const { body, param, query } = require('express-validator');
const { auth, adminOnly } = require('../middlewares');
const ctrl = require('../controllers/adminController');

// Wrap async route handlers and forward errors to the error middleware
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Apply authentication and role check to all admin endpoints
router.use(auth, adminOnly);

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: List users with optional search and pagination
 */
router.get(
  '/users',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('q').optional().isString(),
  ],
  asyncHandler(ctrl.listUsers)
);

router.put(
  '/users/:id',
  [param('id').isMongoId(), body('name').optional().isString()],
  asyncHandler(ctrl.updateUser)
);

router.get(
  '/resumes',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('status').optional().isString(),
  ],
  asyncHandler(ctrl.listResumes)
);

router.put(
  '/resumes/:id',
  param('id').isMongoId(),
  asyncHandler(ctrl.updateResume)
);

router.get(
  '/logs',
  [query('level').optional().isIn(['info', 'error', 'warn'])],
  asyncHandler(ctrl.viewLogs)
);

router.get('/features', asyncHandler(ctrl.listFeatures));

router.get('/settings', asyncHandler(ctrl.getSettings));
router.post('/settings', asyncHandler(ctrl.updateSettings));
router.post('/features/:key/toggle', asyncHandler(ctrl.toggleFeature));

router.get('/analytics', asyncHandler(ctrl.analytics));

module.exports = router;
