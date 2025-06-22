const { authService } = require('../services');
const { success, error } = require('../utils/formatResponse');

async function register(req, res) {
  try {
    const user = await authService.register(req.body);
    res.status(201).json(success(req, 'registered', { id: user._id }));
  } catch (err) {
    res.status(400).json(error(req, err.message));
  }
}

async function login(req, res) {
  try {
    const { access, refresh } = await authService.login(req.body.email, req.body.password);
    res.json(success(req, 'loggedIn', { access, refresh }));
  } catch (err) {
    res.status(401).json(error(req, err.message));
  }
}

async function refresh(req, res) {
  try {
    const token = await authService.refresh(req.body.refresh);
    res.json(success(req, 'refreshed', { access: token }));
  } catch (err) {
    res.status(401).json(error(req, 'invalid'));
  }
}

async function verifyEmail(req, res) {
  try {
    await authService.verifyEmail(req.query.token);
    res.json(success(req, 'verified'));
  } catch (err) {
    res.status(400).json(error(req, err.message));
  }
}

async function forgot(req, res) {
  await authService.forgotPassword(req.body.email);
  res.json(success(req, 'resetSent'));
}

async function reset(req, res) {
  try {
    await authService.resetPassword(req.body.token, req.body.password);
    res.json(success(req, 'passwordReset'));
  } catch (err) {
    res.status(400).json(error(req, err.message));
  }
}

module.exports = {
  register,
  login,
  refresh,
  verifyEmail,
  forgot,
  reset,
};
