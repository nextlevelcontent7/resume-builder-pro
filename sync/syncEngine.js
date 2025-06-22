const fs = require('fs');
const path = require('path');
const { createZip } = require('../utils/zipExporter');
const { sign } = require('../utils/jwt');
const remoteSyncService = require('../services/remoteSyncService');
let logger;
try {
  logger = require('../middlewares/logger').logger;
} catch (e) {
  logger = console;
}

class SyncEngine {
  constructor(options = {}) {
    this.endpoint = options.endpoint || process.env.SYNC_ENDPOINT || '';
    this.jwtSecret = options.jwtSecret || process.env.JWT_SECRET || 'secret';
    this.retryAttempts = options.retryAttempts || 3;
    this.retryDelay = options.retryDelay || 1000; // in ms
  }

  token() {
    return sign({ iss: 'sync-engine' }, this.jwtSecret, { expiresIn: '10m' });
  }

  async _request(method, path, body, attempt = 1) {
    const headers = { Authorization: `Bearer ${this.token()}` };
    try {
      return await remoteSyncService.request(method, path, body, headers);
    } catch (err) {
      if (attempt < this.retryAttempts) {
        await new Promise(r => setTimeout(r, this.retryDelay * attempt));
        return this._request(method, path, body, attempt + 1);
      }
      logger.error('sync request failed', { method, path, error: err.message });
      throw err;
    }
  }

  async backupResume(resume) {
    logger.info('sync backup resume', { id: resume._id });
    return this._request('POST', '/resumes', resume);
  }

  async backupAll(resumes = []) {
    for (const r of resumes) {
      await this.backupResume(r);
    }
    return true;
  }

  async restore(id) {
    logger.info('sync restore', { id });
    return this._request('GET', `/resumes/${id}`);
  }

  async list(query = {}) {
    logger.info('sync list', { query });
    const qs = Object.keys(query).length
      ? '?' + new URLSearchParams(query).toString()
      : '';
    return this._request('GET', `/resumes${qs}`);
  }

  async exportZip(resumeFiles, dest, options = {}) {
    logger.info('sync export zip', { count: resumeFiles.length });
    return createZip(resumeFiles, dest, options);
  }
}

module.exports = SyncEngine;
