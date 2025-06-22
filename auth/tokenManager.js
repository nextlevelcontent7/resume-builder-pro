const crypto = require('crypto');
const jwt = require('../utils/jwt');
const User = require('../models/User');

const ACCESS_EXPIRES_IN = process.env.ACCESS_EXPIRES_IN || '15m';
const REFRESH_EXPIRES_IN = process.env.REFRESH_EXPIRES_IN || '7d';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'refresh-secret';

function generateAccessToken(user) {
  return jwt.sign({ id: user._id.toString(), role: user.role }, JWT_SECRET, {
    expiresIn: ACCESS_EXPIRES_IN,
  });
}

function verifyAccessToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

function generateRefreshToken(user) {
  const token = jwt.sign({ id: user._id.toString() }, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRES_IN,
  });
  user.refreshTokens.push(token);
  user.save();
  return token;
}

async function verifyRefreshToken(token) {
  try {
    const payload = jwt.verify(token, REFRESH_SECRET);
    const user = await User.findById(payload.id);
    if (!user || !user.refreshTokens.includes(token)) return null;
    return user;
  } catch {
    return null;
  }
}

async function refresh(token) {
  const user = await verifyRefreshToken(token);
  if (!user) throw new Error('invalid');
  return generateAccessToken(user);
}

async function logout(token) {
  const user = await verifyRefreshToken(token);
  if (user) {
    user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
    await user.save();
  }
}

async function loginWithPassword(email, password) {
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    throw new Error('invalidCredentials');
  }
  if (!user.isVerified) throw new Error('notVerified');
  const access = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  return { access, refresh: refreshToken };
}

// stub email login for 2FA or passwordless
async function sendLoginEmail(email) {
  const user = await User.findOne({ email });
  if (!user) return;
  user.loginToken = crypto.randomBytes(20).toString('hex');
  user.loginTokenExp = Date.now() + 10 * 60 * 1000; // 10 min
  await user.save();
  // mailer would send token here
}

async function loginWithEmailToken(token) {
  const user = await User.findOne({ loginToken: token, loginTokenExp: { $gt: Date.now() } });
  if (!user) throw new Error('invalid');
  user.loginToken = undefined;
  user.loginTokenExp = undefined;
  await user.save();
  const access = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  return { access, refresh: refreshToken };
}

module.exports = {
  generateAccessToken,
  verifyAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  refresh,
  logout,
  loginWithPassword,
  sendLoginEmail,
  loginWithEmailToken,
};
