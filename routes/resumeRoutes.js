const router = require('express').Router();
const { body, param, query } = require('express-validator');
const upload = require('../middlewares/upload');
const { auth, checkUser } = require('../middlewares');
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
} = require('../controllers/resumeController');
const { validators } = require('../utils');

// Validators
const idValidator = [
  param('id').custom(validators.isObjectId).withMessage('Invalid ID'),
];

const listValidator = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('status').optional().isString(),
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

// Export resume
router.get('/:id/export', auth, idValidator, exportResume);

// Get a resume by id
router.get('/:id', auth, idValidator, getResumeById);

// Update a resume
router.put('/:id', auth, checkUser, idValidator, upload, updateResume);

// Duplicate resume
router.post('/:id/duplicate', auth, checkUser, idValidator, duplicateResume);

// Archive resume
router.post('/:id/archive', auth, checkUser, idValidator, archiveResume);

// Analytics
router.get('/analytics/summary', auth, getAnalytics);

// Delete a resume
router.delete('/:id', auth, checkUser, idValidator, deleteResume);

module.exports = router;
