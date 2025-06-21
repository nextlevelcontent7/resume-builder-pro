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

  getLogs(level) {
    const logDir = path.join(__dirname, '..', 'logs');
    const files = fs.readdirSync(logDir).filter((f) => f.endsWith('.log'));
    const target = files.sort().pop();
    if (!target) return [];
    const content = fs.readFileSync(path.join(logDir, target), 'utf8');
    const lines = content.trim().split('\n');
    if (!level) return lines.slice(-100);
    return lines.filter((l) => l.includes(level.toUpperCase())).slice(-100);
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

  listFeatures() {
    return { ...flags };
  }

  async usageStats() {
    const resumeCount = await Resume.countDocuments();
    const userCount = await User.countDocuments();
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newResumes = await Resume.countDocuments({ createdAt: { $gte: lastWeek } });
    return { resumeCount, userCount, newResumes };
  }
}

module.exports = new AdminService();
