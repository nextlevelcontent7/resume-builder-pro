const router = require('express').Router();
const { body, param } = require('express-validator');
const upload = require('../middlewares/upload');
const { auth } = require('../middlewares');
const {
  createResume,
  getResumeById,
  updateResume,
  deleteResume,
  exportResume,
  listResumes,
  searchResumes,
  duplicateResume,
} = require('../controllers/resumeController');
const { validators } = require('../utils');

// Validators
const idValidator = [
  param('id').custom(validators.isObjectId).withMessage('Invalid ID'),
];

// Create a resume with optional file uploads
router.post('/', auth, upload, createResume);

// List resumes
router.get('/', auth, listResumes);

// Search resumes
router.get('/search', auth, searchResumes);

// Export resume
router.get('/:id/export', auth, idValidator, exportResume);

// Get a resume by id
router.get('/:id', auth, idValidator, getResumeById);

// Update a resume
router.put('/:id', auth, idValidator, upload, updateResume);

// Duplicate resume
router.post('/:id/duplicate', auth, idValidator, duplicateResume);

// Delete a resume
router.delete('/:id', auth, idValidator, deleteResume);

module.exports = router;
