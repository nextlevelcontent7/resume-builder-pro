const Resume = require('../models/Resume');
const { success, error } = require('../utils/formatResponse');
const pdfService = require('../services/pdfService');
const path = require('path');

// Create a new resume document
async function createResume(req, res) {
  try {
    const data = req.body;

    if (req.files && req.files.profileImage) {
      const file = req.files.profileImage[0];
      data.personalInfo = data.personalInfo || {};
      data.personalInfo.profileImage = {
        filename: file.filename,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size,
      };
    }

    if (req.files && req.files.resumeFile) {
      const file = req.files.resumeFile[0];
      data.resumeFile = {
        filename: file.filename,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size,
      };
    }

    const resume = await Resume.create(data);
    return res.status(201).json(success(req, 'resumeCreated', resume));
  } catch (err) {
    err.messageKey = 'createFailed';
    return res.status(400).json(error(req, err.messageKey, err.message));
  }
}

// Retrieve a resume by ID
async function getResumeById(req, res) {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) {
      return res.status(404).json(error(req, 'resumeNotFound'));
    }
    return res.json(success(req, 'ok', resume));
  } catch (err) {
    err.messageKey = 'resumeNotFound';
    return res.status(404).json(error(req, err.messageKey));
  }
}

// Update an existing resume
async function updateResume(req, res) {
  try {
    const updates = req.body;

    if (req.files && req.files.profileImage) {
      const file = req.files.profileImage[0];
      updates['personalInfo.profileImage'] = {
        filename: file.filename,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size,
      };
    }

    if (req.files && req.files.resumeFile) {
      const file = req.files.resumeFile[0];
      updates.resumeFile = {
        filename: file.filename,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size,
      };
    }

    const resume = await Resume.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!resume) {
      return res.status(404).json(error(req, 'resumeNotFound'));
    }
    return res.json(success(req, 'resumeUpdated', resume));
  } catch (err) {
    err.messageKey = 'updateFailed';
    return res.status(400).json(error(req, err.messageKey, err.message));
  }
}

// Delete a resume by ID
async function deleteResume(req, res) {
  try {
    const resume = await Resume.findByIdAndDelete(req.params.id);
    if (!resume) {
      return res.status(404).json(error(req, 'resumeNotFound'));
    }
    return res.json(success(req, 'resumeDeleted'));
  } catch (err) {
    err.messageKey = 'deleteFailed';
    return res.status(400).json(error(req, err.messageKey));
  }
}

// Export resume as PDF and return download link
async function exportResumeAsPDF(req, res) {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) {
      return res.status(404).json(error(req, 'resumeNotFound'));
    }

    const locale = req.lang || 'en';
    const filePath = await pdfService.generate(resume.toObject(), locale, resume.theme);
    const fileName = path.basename(filePath);
    const url = `/exports/${fileName}`;
    return res.json(success(req, 'pdfGenerated', { url }));
  } catch (err) {
    err.messageKey = 'exportFailed';
    return res.status(500).json(error(req, err.messageKey, err.message));
  }
}

module.exports = {
  createResume,
  getResumeById,
  updateResume,
  deleteResume,
  exportResumeAsPDF,
};
