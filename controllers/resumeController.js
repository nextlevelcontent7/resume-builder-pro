const { success, error } = require('../utils/formatResponse');
const { resumeService } = require('../services');
const { validationResult } = require('express-validator');
const path = require('path');

/**
 * Create a new resume document and return created record.
 */
async function createResume(req, res) {
  try {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      const msg = result.array({ onlyFirstError: true })[0].msg;
      return res.status(422).json(error(req, 'validationFailed', msg));
    }
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

    const resume = await resumeService.create(data);
    return res.status(201).json(success(req, 'resumeCreated', resume));
  } catch (err) {
    err.messageKey = 'createFailed';
    return res.status(400).json(error(req, err.messageKey, err.message));
  }
}

/**
 * List resumes with pagination and optional status filter
 */
async function listResumes(req, res) {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const result = await resumeService.list({ page, limit, status });
    return res.json(success(req, 'ok', result));
  } catch (err) {
    err.messageKey = 'listFailed';
    return res.status(400).json(error(req, err.messageKey));
  }
}

/**
 * Search resumes by text query
 */
async function searchResumes(req, res) {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json(error(req, 'badRequest'));
    }
    const results = await resumeService.search(q);
    return res.json(success(req, 'ok', results));
  } catch (err) {
    err.messageKey = 'searchFailed';
    return res.status(400).json(error(req, err.messageKey));
  }
}

/**
 * Duplicate an existing resume as a draft
 */
async function duplicateResume(req, res) {
  try {
    const dup = await resumeService.duplicate(req.params.id);
    if (!dup) return res.status(404).json(error(req, 'resumeNotFound'));
    return res.status(201).json(success(req, 'resumeCreated', dup));
  } catch (err) {
    err.messageKey = 'duplicateFailed';
    return res.status(400).json(error(req, err.messageKey));
  }
}

/**
 * Retrieve a resume by its ID.
 */
async function getResumeById(req, res) {
  try {
    const resume = await resumeService.getById(req.params.id);
    if (!resume) {
      return res.status(404).json(error(req, 'resumeNotFound'));
    }
    return res.json(success(req, 'ok', resume));
  } catch (err) {
    err.messageKey = 'resumeNotFound';
    return res.status(404).json(error(req, err.messageKey));
  }
}

/**
 * Update an existing resume by ID.
 */
async function updateResume(req, res) {
  try {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      const msg = result.array({ onlyFirstError: true })[0].msg;
      return res.status(422).json(error(req, 'validationFailed', msg));
    }
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

    const resume = await resumeService.update(req.params.id, updates);
    if (!resume) {
      return res.status(404).json(error(req, 'resumeNotFound'));
    }
    return res.json(success(req, 'resumeUpdated', resume));
  } catch (err) {
    err.messageKey = 'updateFailed';
    return res.status(400).json(error(req, err.messageKey, err.message));
  }
}

/**
 * Delete a resume by its ID.
 */
async function deleteResume(req, res) {
  try {
    const resume = await resumeService.remove(req.params.id);
    if (!resume) {
      return res.status(404).json(error(req, 'resumeNotFound'));
    }
    return res.json(success(req, 'resumeDeleted'));
  } catch (err) {
    err.messageKey = 'deleteFailed';
    return res.status(400).json(error(req, err.messageKey));
  }
}

/**
 * Archive a resume instead of deleting
 */
async function archiveResume(req, res) {
  try {
    const resume = await resumeService.archive(req.params.id);
    if (!resume) {
      return res.status(404).json(error(req, 'resumeNotFound'));
    }
    return res.json(success(req, 'resumeArchived', resume));
  } catch (err) {
    err.messageKey = 'archiveFailed';
    return res.status(400).json(error(req, err.messageKey));
  }
}

/**
 * Get resume analytics summary
 */
async function getAnalytics(req, res) {
  try {
    const stats = await resumeService.analytics();
    return res.json(success(req, 'ok', stats));
  } catch (err) {
    err.messageKey = 'analyticsFailed';
    return res.status(500).json(error(req, err.messageKey));
  }
}

/**
 * Export resume as PDF/PNG and return download link.
 */
async function exportResume(req, res) {
  try {
    const resume = await resumeService.getById(req.params.id);
    if (!resume) {
      return res.status(404).json(error(req, 'resumeNotFound'));
    }

    const locale = req.lang || 'en';
    const format = req.query.format || 'pdf';
    const filePath = await resumeService.export(resume, locale, format);
    const fileName = path.basename(filePath);
    const url = `/exports/${fileName}`;
    return res.json(success(req, 'pdfGenerated', { url }));
  } catch (err) {
    err.messageKey = 'exportFailed';
    return res.status(500).json(error(req, err.messageKey, err.message));
  }
}

/**
 * Retrieve metadata about the uploaded resume file
 */
async function getMetadata(req, res) {
  try {
    const data = await resumeService.getMetadata(req.params.id);
    if (!data) return res.status(404).json(error(req, 'resumeNotFound'));
    return res.json(success(req, 'ok', data));
  } catch (err) {
    err.messageKey = 'metadataFailed';
    return res.status(400).json(error(req, err.messageKey));
  }
}

/**
 * Import resumes in bulk from JSON array
 */
async function importResumes(req, res) {
  try {
    if (!Array.isArray(req.body)) {
      return res.status(400).json(error(req, 'badRequest'));
    }
    const results = await resumeService.importMany(req.body);
    return res.status(201).json(success(req, 'resumeCreated', results));
  } catch (err) {
    err.messageKey = 'importFailed';
    return res.status(400).json(error(req, err.messageKey));
  }
}

/**
 * Export all resumes as a single ZIP archive
 */
async function exportBulk(req, res) {
  try {
    const locale = req.lang || 'en';
    const pathZip = await resumeService.exportAll(locale);
    const fileName = path.basename(pathZip);
    const url = `/exports/${fileName}`;
    return res.json(success(req, 'pdfGenerated', { url }));
  } catch (err) {
    err.messageKey = 'exportFailed';
    return res.status(500).json(error(req, err.messageKey));
  }
}

async function listVersions(req, res) {
  try {
    const list = await resumeService.getVersions(req.params.id);
    res.json(success(req, 'ok', list));
  } catch (err) {
    res.status(400).json(error(req, err.message));
  }
}

async function rollbackVersion(req, res) {
  try {
    const resume = await resumeService.rollback(req.params.id, req.params.versionId);
    if (!resume) return res.status(404).json(error(req, 'notFound'));
    res.json(success(req, 'updated', resume));
  } catch (err) {
    res.status(400).json(error(req, err.message));
  }
}

async function restoreRemote(req, res) {
  try {
    const data = await remoteSyncService.restoreResume(req.params.remoteId);
    if (!data) return res.status(404).json(error(req, 'notFound'));
    const resume = await resumeService.create(data);
    res.json(success(req, 'restored', resume));
  } catch (err) {
    res.status(400).json(error(req, err.message));
  }
}

module.exports = {
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
};
