const router = require('express').Router();
const { body, param, query } = require('express-validator');
const upload = require('../middlewares/upload');
const { auth, checkUser, userAgent } = require('../middlewares');
const {
  createResume,
  getResumeById,
  updateResume,
  deleteResume,
  exportResume,
  listResumes,
  searchResumes,
  duplicateResume,
  archiveResume,
  getAnalytics,
  getMetadata,
  importResumes,
  exportBulk,
  listVersions,
  rollbackVersion,
  restoreRemote,
} = require('../controllers/resumeController');
const { validators } = require('../utils');

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
router.post('/', auth, upload, createResume);

// List resumes
router.get('/', auth, listValidator, listResumes);

// Search resumes
router.get('/search', auth, searchValidator, searchResumes);

// Bulk import resumes from JSON
router.post('/import', auth, importResumes);

// Export resume
router.get('/:id/export', auth, idValidator, exportResume);

// Bulk export all resumes
router.get('/export/bulk', auth, exportBulk);

// Get metadata for resume file
router.get('/:id/metadata', auth, idValidator, getMetadata);

// Get a resume by id
router.get('/:id', auth, idValidator, getResumeById);

// Update a resume
router.put('/:id', auth, checkUser, idValidator, upload, updateResume);

// Duplicate resume
router.post('/:id/duplicate', auth, checkUser, idValidator, duplicateResume);

// Archive resume
router.post('/:id/archive', auth, checkUser, idValidator, archiveResume);

// Version history
router.get('/:id/versions', auth, idValidator, listVersions);
router.post('/:id/rollback/:versionId', auth, checkUser, idValidator, rollbackVersion);

// Restore resume from remote backup
router.post('/restore/:remoteId', auth, restoreRemote);

// Analytics
router.get('/analytics/summary', auth, getAnalytics);

// Delete a resume
router.delete('/:id', auth, checkUser, idValidator, deleteResume);

module.exports = router;
