// use internal lightweight JWT utility to avoid external dependency during tests
const jwt = require('../utils/jwt');
const crypto = require('crypto');
// simple mailer for tests and offline use
const { mailer } = require('../utils');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'refresh-secret';

const transporter = mailer.createTransport();

class AuthService {
  generateAccessToken(user) {
    return jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: '15m',
    });
  }

  generateRefreshToken(user) {
    const token = jwt.sign({ id: user._id }, REFRESH_SECRET, { expiresIn: '7d' });
    user.refreshTokens.push(token);
    user.save();
    return token;
  }

  async login(email, password) {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      throw new Error('invalidCredentials');
    }
    if (!user.isVerified) throw new Error('notVerified');
    const access = this.generateAccessToken(user);
    const refresh = this.generateRefreshToken(user);
    return { access, refresh };
  }

  async refresh(token) {
    try {
      const payload = jwt.verify(token, REFRESH_SECRET);
      const user = await User.findById(payload.id);
      if (!user || !user.refreshTokens.includes(token)) throw new Error('invalid');
      return this.generateAccessToken(user);
    } catch (err) {
      throw new Error('invalid');
    }
  }

  async register(data) {
    const user = await User.create(data);
    await this.sendVerification(user);
    return user;
  }

  async sendVerification(user) {
    user.verificationToken = crypto.randomBytes(20).toString('hex');
    await user.save();
    await transporter.sendMail({
      to: user.email,
      subject: 'Verify your account',
      text: `Verify using this token: ${user.verificationToken}`,
    });
  }

  async verifyEmail(token) {
    const user = await User.findOne({ verificationToken: token });
    if (!user) throw new Error('invalid');
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();
  }

  async forgotPassword(email) {
    const user = await User.findOne({ email });
    if (!user) return;
    user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
    await user.save();
    await transporter.sendMail({
      to: user.email,
      subject: 'Password reset',
      text: `Reset token: ${user.resetPasswordToken}`,
    });
  }

  async resetPassword(token, newPassword) {
    const user = await User.findOne({ resetPasswordToken: token });
    if (!user) throw new Error('invalid');
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    await user.save();
  }
}

module.exports = new AuthService();
