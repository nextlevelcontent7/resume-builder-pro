const fs = require('fs');
const path = require('path');
const { Resume, User } = require('../models');
const { flags, update, toggle } = require('../config/featureFlags');

class AdminService {
  listUsers() {
    return User.find().lean();
  }

  updateUser(id, updates) {
    return User.findByIdAndUpdate(id, updates, { new: true }).lean();
  }

  listResumes(query = {}) {
    const limit = parseInt(query.limit, 10) || 20;
    const page = parseInt(query.page, 10) || 1;
    return Resume.find()
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
  }

  updateResume(id, updates) {
    return Resume.findByIdAndUpdate(id, updates, { new: true }).lean();
  }

  getLogs() {
    const logDir = path.join(__dirname, '..', 'logs');
    const files = fs.readdirSync(logDir).filter((f) => f.endsWith('.log'));
    const latest = files.sort().pop();
    if (!latest) return [];
    const content = fs.readFileSync(path.join(logDir, latest), 'utf8');
    return content.trim().split('\n').slice(-100);
  }

  getSettings() {
    return flags;
  }

  updateSettings(newSettings) {
    update(newSettings);
    return flags;
  }

  toggleFeature(key) {
    if (!(key in flags)) throw new Error('invalidFeature');
    toggle(key);
    return flags[key];
  }
}

module.exports = new AdminService();
