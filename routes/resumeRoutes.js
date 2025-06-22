/**
 * Resume routes power the core CRUD operations for user resumes. Extensive
 * validation is performed using express-validator and RBAC is applied via the
 * auth middleware. Routes also capture the user agent for analytics.
 */
const router = require('express').Router();
const { body, param, query } = require('express-validator');
const upload = require('../middlewares/upload');
const { auth, checkUser, userAgent } = require('../middlewares');
const ctrl = require('../controllers/resumeController');
const { validators } = require('../utils');

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Attach user agent info for analytics and device tracking
router.use(userAgent);

// Validators
const idValidator = [
  param('id').custom(validators.isObjectId).withMessage('Invalid ID'),
];

const listValidator = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('status').optional().isString(),
  query('theme').optional().isString(),
  query('from').optional().isISO8601(),
  query('to').optional().isISO8601(),
];

const searchValidator = [
  query('q').isString().notEmpty(),
];

// Create a resume with optional file uploads
router.post('/', auth, upload, asyncHandler(ctrl.createResume));

// List resumes with pagination and optional filters
router.get('/', auth, listValidator, asyncHandler(ctrl.listResumes));

// Search resumes
router.get('/search', auth, searchValidator, asyncHandler(ctrl.searchResumes));

// Bulk import resumes from JSON
router.post('/import', auth, asyncHandler(ctrl.importResumes));

// Export resume
router.get('/:id/export', auth, idValidator, asyncHandler(ctrl.exportResume));

// Bulk export all resumes
router.get('/export/bulk', auth, asyncHandler(ctrl.exportBulk));

// Get metadata for resume file
router.get('/:id/metadata', auth, idValidator, asyncHandler(ctrl.getMetadata));

// Get a resume by id
router.get('/:id', auth, idValidator, asyncHandler(ctrl.getResumeById));

// Update a resume
router.put(
  '/:id',
  auth,
  checkUser,
  idValidator,
  upload,
  asyncHandler(ctrl.updateResume)
);

// Duplicate resume
router.post(
  '/:id/duplicate',
  auth,
  checkUser,
  idValidator,
  asyncHandler(ctrl.duplicateResume)
);

// Archive resume
router.post(
  '/:id/archive',
  auth,
  checkUser,
  idValidator,
  asyncHandler(ctrl.archiveResume)
);

// Version history
router.get('/:id/versions', auth, idValidator, asyncHandler(ctrl.listVersions));
router.post(
  '/:id/rollback/:versionId',
  auth,
  checkUser,
  idValidator,
  asyncHandler(ctrl.rollbackVersion)
);

// Restore resume from remote backup
router.post('/restore/:remoteId', auth, asyncHandler(ctrl.restoreRemote));

// Analytics
router.get('/analytics/summary', auth, asyncHandler(ctrl.getAnalytics));

// Delete a resume
router.delete(
  '/:id',
  auth,
  checkUser,
  idValidator,
  asyncHandler(ctrl.deleteResume)
);

module.exports = router;
