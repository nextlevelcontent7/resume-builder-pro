const router = require('express').Router();
const upload = require('../middlewares/upload');
const {
  createResume,
  getResumeById,
  updateResume,
  deleteResume,
  exportResumeAsPDF,
} = require('../controllers/resumeController');

// Create a resume with optional file uploads
router.post('/', upload, createResume);

// Export resume as PDF
router.get('/:id/export', exportResumeAsPDF);

// Get a resume by id
router.get('/:id', getResumeById);

// Update a resume
router.put('/:id', upload, updateResume);

// Delete a resume
router.delete('/:id', deleteResume);

module.exports = router;
