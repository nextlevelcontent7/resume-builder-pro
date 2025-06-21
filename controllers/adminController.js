const { success, error } = require('../utils/formatResponse');
const adminService = require('../services/adminService');

async function listUsers(req, res) {
  try {
    const users = await adminService.listUsers();
    res.json(success(req, 'ok', users));
  } catch (err) {
    res.status(500).json(error(req, 'fetchFailed', err.message));
  }
}

async function updateUser(req, res) {
  try {
    const user = await adminService.updateUser(req.params.id, req.body);
    if (!user) return res.status(404).json(error(req, 'notFound'));
    res.json(success(req, 'updated', user));
  } catch (err) {
    res.status(400).json(error(req, 'updateFailed', err.message));
  }
}

async function listResumes(req, res) {
  try {
    const results = await adminService.listResumes(req.query);
    res.json(success(req, 'ok', results));
  } catch (err) {
    res.status(500).json(error(req, 'fetchFailed', err.message));
  }
}

async function updateResume(req, res) {
  try {
    const resume = await adminService.updateResume(req.params.id, req.body);
    if (!resume) return res.status(404).json(error(req, 'notFound'));
    res.json(success(req, 'updated', resume));
  } catch (err) {
    res.status(400).json(error(req, 'updateFailed', err.message));
  }
}

async function viewLogs(req, res) {
  try {
    const logs = await adminService.getLogs();
    res.json(success(req, 'ok', logs));
  } catch (err) {
    res.status(500).json(error(req, 'fetchFailed', err.message));
  }
}

async function getSettings(req, res) {
  const settings = adminService.getSettings();
  res.json(success(req, 'ok', settings));
}

async function updateSettings(req, res) {
  const settings = adminService.updateSettings(req.body);
  res.json(success(req, 'updated', settings));
}

async function toggleFeature(req, res) {
  try {
    const state = adminService.toggleFeature(req.params.key);
    res.json(success(req, 'ok', { [req.params.key]: state }));
  } catch (err) {
    res.status(400).json(error(req, 'updateFailed', err.message));
  }
}

module.exports = {
  listUsers,
  updateUser,
  listResumes,
  updateResume,
  viewLogs,
  getSettings,
  updateSettings,
  toggleFeature,
};
