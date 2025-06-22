const Resume = require('../models/Resume');
const pdfService = require('./pdfService');
const { remoteSyncService } = require('./index');
const { validationUtils, slugify, slugifyUnique } = require('../utils');

/**
 * Service layer encapsulating resume CRUD operations and export logic.
 */
class ResumeService {
  /** Create a new resume document */
  async create(data) {
    if (!validationUtils.isNonEmptyString(data.title)) {
      throw new Error('invalidTitle');
    }
    const exists = async (slug) => {
      const found = await Resume.exists({ slug });
      return !!found;
    };
    data.slug = await slugifyUnique(data.title, exists);
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
    const safe = { ...updates };
    if (safe.title && !validationUtils.isNonEmptyString(safe.title)) {
      throw new Error('invalidTitle');
    }
    if (safe.title) {
      const exists = async (slug) => !!(await Resume.exists({ slug, _id: { $ne: id } }));
      safe.slug = await slugifyUnique(safe.title, exists);
    }
    return Resume.findByIdAndUpdate(id, safe, { new: true, runValidators: true });
  }

  /** Delete resume by ID */
  async remove(id) {
    const res = await Resume.findByIdAndDelete(id);
    return res;
  }

  /** Archive resume by ID without deleting */
  async archive(id) {
    return Resume.findByIdAndUpdate(id, { 'settings.archived': true }, { new: true });
  }

  /** Return counts by status for analytics */
  async analytics() {
    const pipeline = [
      { $group: { _id: '$settings.status', count: { $sum: 1 } } },
    ];
    const data = await Resume.aggregate(pipeline);
    return data.reduce((acc, cur) => {
      acc[cur._id || 'unknown'] = cur.count;
      return acc;
    }, {});
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

  /**
   * Create a version snapshot for a resume. Useful for audit history
   * or undo functionality. Only stores a limited set of fields by
   * default to avoid large document growth.
   */
  async createVersion(resumeId, comment = '') {
    const resume = await this.getById(resumeId);
    if (!resume) return null;
    const snapshot = {
      createdAt: new Date(),
      comment,
      data: resume.toObject(),
    };
    await Resume.findByIdAndUpdate(resumeId, {
      $push: { versions: snapshot },
    });
    return snapshot;
  }

  /**
   * Retrieve version history for a resume
   */
  async getVersions(resumeId) {
    const resume = await Resume.findById(resumeId, 'versions');
    return resume ? resume.versions : [];
  }

  /**
   * Rollback a resume to a given version snapshot
   */
  async rollback(resumeId, versionId) {
    const resume = await Resume.findById(resumeId);
    if (!resume) return null;
    const version = resume.versions.id(versionId);
    if (!version) return null;
    resume.overwrite(version.data);
    return resume.save();
  }

  /**
   * Synchronize the given resume with a remote endpoint. The resume
   * is first converted into a public representation and then pushed
   * using the remoteSyncService. If successful the remote ID is stored
   * in the resume metadata for easy lookup.
   */
  async syncRemote(resumeId) {
    const resume = await this.getById(resumeId);
    if (!resume) return null;
    const publicData = resume.toPublic();
    const remoteId = await remoteSyncService.pushResume(publicData);
    if (remoteId) {
      await Resume.findByIdAndUpdate(resumeId, {
        'settings.remoteId': remoteId,
        'settings.lastSynced': new Date(),
      });
    }
    return remoteId;
  }

  async restoreFromRemote(remoteId) {
    const data = await remoteSyncService.restoreResume(remoteId);
    if (!data) return null;
    data.remoteId = remoteId;
    const existing = await Resume.findOne({ 'settings.remoteId': remoteId });
    if (existing) {
      await Resume.updateOne({ _id: existing._id }, data);
      return existing._id;
    }
    const doc = await Resume.create(data);
    return doc._id;
  }

  /**
   * Return basic file metadata for a given resume
   * @param {string} id resume id
   */
  async getMetadata(id) {
    const res = await Resume.findById(id, 'resumeFile updatedAt createdAt');
    if (!res || !res.resumeFile) return null;
    const { filename, mimetype, size } = res.resumeFile;
    return { filename, mimetype, size, updatedAt: res.updatedAt, createdAt: res.createdAt };
  }

  async addTag(id, tag) {
    if (!validationUtils.isNonEmptyString(tag)) throw new Error('invalidTag');
    return Resume.findByIdAndUpdate(id, { $addToSet: { tags: tag } }, { new: true });
  }

  /**
   * Import multiple resumes from a JSON array
   * @param {Array<Object>} list
   * @returns {Promise<Array<Resume>>}
   */
  async importMany(list = []) {
    if (!Array.isArray(list)) throw new Error('invalidData');
    return Resume.insertMany(list);
  }

  /**
   * Export all resumes in the system to a zip archive
   * @returns {Promise<string>} path to zip file
   */
  async exportAll() {
    const all = await Resume.find();
    return pdfService.generateBulk(all.map(r => r.toObject()));
  }

  async listByTag(tag) {
    if (!validationUtils.isNonEmptyString(tag)) return [];
    return Resume.find({ tags: tag }).sort({ updatedAt: -1 });
  }
}

module.exports = new ResumeService();
