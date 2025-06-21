const Resume = require('../models/Resume');
const pdfService = require('./pdfService');

/**
 * Service layer encapsulating resume CRUD operations and export logic.
 */
class ResumeService {
  /** Create a new resume document */
  async create(data) {
    return Resume.create(data);
  }

  /**
   * List resumes with optional pagination and status filtering
   * @param {Object} opts options for pagination and filter
   * @returns {Promise<{results: Array, total: number}>}
   */
  async list(opts = {}) {
    const page = parseInt(opts.page, 10) || 1;
    const limit = parseInt(opts.limit, 10) || 10;
    const status = opts.status;

    const query = {};
    if (status) query['settings.status'] = status;

    const [results, total] = await Promise.all([
      Resume.find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ updatedAt: -1 }),
      Resume.countDocuments(query),
    ]);

    return { results, total };
  }

  /** Retrieve a resume by ID */
  async getById(id) {
    return Resume.findById(id);
  }

  /** Update resume by ID */
  async update(id, updates) {
    return Resume.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  }

  /** Delete resume by ID */
  async remove(id) {
    return Resume.findByIdAndDelete(id);
  }

  /**
   * Search resumes by text in name or summary fields
   * @param {string} query
   * @param {number} limit
   */
  async search(query, limit = 20) {
    return Resume.find({ $text: { $search: query } })
      .limit(limit)
      .sort({ score: { $meta: 'textScore' } });
  }

  /**
   * Export resume as PDF or PNG. Defaults to PDF.
   * Returns path to generated file.
   */
  async export(resume, locale = 'en', format = 'pdf') {
    const filePath = await pdfService.generate(resume.toObject(), locale, resume.theme, format);
    return filePath;
  }

  /**
   * Duplicate an existing resume as a new draft
   * @param {string} id original resume ID
   * @returns {Promise<Resume>}
   */
  async duplicate(id) {
    const resume = await this.getById(id);
    if (!resume) return null;
    return Resume.duplicate(resume.toObject(), 'draft');
  }
}

module.exports = new ResumeService();
