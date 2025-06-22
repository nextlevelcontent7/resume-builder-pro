const fs = require('fs');
const path = require('path');
const { Resume, User } = require('../models');
const { flags, update, toggle } = require('../config/featureFlags');
const { validationUtils } = require('../utils');

class AdminService {
  // Fetch users with optional text search
  listUsers(query = {}) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 20;
    const search = query.search ? query.search.trim() : '';
    const filter = search
      ? { $or: [{ email: new RegExp(search, 'i') }, { name: new RegExp(search, 'i') }] }
      : {};
    return User.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
  }

  // Update user with validation and logging
  updateUser(id, updates) {
    const allowed = ['name', 'role', 'preferences'];
    const safe = {};
    for (const k of allowed) if (k in updates) safe[k] = updates[k];
    if (safe.name && !validationUtils.isNonEmptyString(safe.name)) {
      throw new Error('invalidName');
    }
    console.log(`admin updating user ${id}`);
    return User.findByIdAndUpdate(id, safe, { new: true }).lean();
  }

  listResumes(query = {}) {
    const limit = parseInt(query.limit, 10) || 20;
    const page = parseInt(query.page, 10) || 1;
    return Resume.find()
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
  }

  // Update resume with sanitisation
  updateResume(id, updates) {
    const safe = { ...updates };
    if (safe.title && !validationUtils.isNonEmptyString(safe.title)) {
      throw new Error('invalidTitle');
    }
    console.log(`admin updating resume ${id}`);
    return Resume.findByIdAndUpdate(id, safe, { new: true }).lean();
  }

  // Delete resume and log action
  async deleteResume(id) {
    const removed = await Resume.findByIdAndDelete(id);
    if (removed) console.log(`resume ${id} deleted by admin`);
    return removed;
  }

  getLogs(level) {
    const logDir = path.join(__dirname, '..', 'logs');
    if (!fs.existsSync(logDir)) return [];
    const files = fs.readdirSync(logDir).filter((f) => f.endsWith('.log'));
    const target = files.sort().pop();
    if (!target) return [];
    const content = fs.readFileSync(path.join(logDir, target), 'utf8');
    const lines = content.trim().split('\n');
    if (!level) return lines.slice(-100);
    const up = level.toUpperCase();
    return lines.filter((l) => l.includes(up)).slice(-100);
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

  // Create a new user with minimal defaults
  async createUser(data) {
    if (!validationUtils.isNonEmptyString(data.email)) throw new Error('invalidEmail');
    const user = await User.create(data);
    console.log(`admin created user ${user.id}`);
    return user.toObject();
  }

  // Remove user and log
  async removeUser(id) {
    const res = await User.findByIdAndDelete(id);
    if (res) console.log(`user ${id} removed by admin`);
    return res;
  }

  // Set a session flag to impersonate a user
  impersonate(req, userId) {
    req.session = req.session || {};
    req.session.impersonate = userId;
    console.log(`admin impersonating ${userId}`);
  }
}

module.exports = new AdminService();
