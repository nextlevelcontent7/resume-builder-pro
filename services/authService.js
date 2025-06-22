// Central token manager houses generation and verification logic so
// service methods remain concise and testable.
const tokenManager = require('../auth/tokenManager');
const crypto = require('crypto');
// simple mailer for tests and offline use
const { mailer } = require('../utils');
const User = require('../models/User');

const transporter = mailer.createTransport();

class AuthService {
  generateAccessToken(user) {
    return tokenManager.generateAccessToken(user);
  }

  verifyAccessToken(token) {
    return tokenManager.verifyAccessToken(token);
  }

  generateRefreshToken(user) {
    return tokenManager.generateRefreshToken(user);
  }

  // Revoke a refresh token by removing it from user document
  async revokeRefreshToken(user, token) {
    user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
    await user.save();
  }

  async login(email, password) {
    return tokenManager.loginWithPassword(email, password);
  }

  async refresh(token) {
    return tokenManager.refresh(token);
  }

  // Logout by revoking the provided refresh token
  async logout(token) {
    await tokenManager.logout(token);
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
    user.resetPasswordExpires = Date.now() + 3600_000; // 1 hour
    await user.save();
    await transporter.sendMail({
      to: user.email,
      subject: 'Password reset',
      text: `Reset token: ${user.resetPasswordToken}`,
    });
  }

  async resetPassword(token, newPassword) {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) throw new Error('invalid');
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
  }
}

module.exports = new AuthService();
