"use strict";

/**
 * Comprehensive User model for Resume Builder Pro.
 * This model demonstrates production-grade Mongoose patterns including
 * password hashing, token management, login tracking, preferences,
 * and security features such as account lockouts and two-factor auth.
 * Each block is documented for maintainability.
 */

const mongoose = require("../mongoose");
const crypto = require("crypto");
// simple UUID generator to avoid external deps
const uuidv4 = () => crypto.randomUUID ? crypto.randomUUID() : [8,4,4,4,12].map(l=>crypto.randomBytes(l/2).toString("hex")).join("-");

const { Schema } = mongoose;

// -----------------------------------------------------------------------------
// Sub-Schemas
// -----------------------------------------------------------------------------

/**
 * History of login attempts. Tracks timestamp, IP, user agent and whether the
 * attempt was successful. This is useful for analytics and fraud detection.
 */
const LoginAttemptSchema = new Schema(
  {
    at: { type: Date, default: Date.now },
    ip: String,
    ua: String,
    success: Boolean,
  },
  { _id: false }
);

/**
 * User preferences controlling localization, theme and notifications. These
 * values drive front-end defaults and can be extended easily.
 */
const PreferencesSchema = new Schema(
  {
    locale: { type: String, default: "en", trim: true },
    theme: { type: String, default: "default", trim: true },
    newsletter: { type: Boolean, default: false },
    darkMode: { type: Boolean, default: false },
  },
  { _id: false }
);

/**
 * Security subdocument tracking login attempts, account lockouts and 2FA.
 */
const SecuritySchema = new Schema(
  {
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String },
  },
  { _id: false }
);

// -----------------------------------------------------------------------------
// Main User Schema
// -----------------------------------------------------------------------------

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^@\s]+@[^@\s]+\.[^@\s]+$/, "Invalid email"],
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    verificationToken: String,
    resetPasswordToken: String,
    refreshTokens: { type: [String], default: [] },
    loginHistory: { type: [LoginAttemptSchema], default: [] },
    preferences: { type: PreferencesSchema, default: () => ({}) },
    security: { type: SecuritySchema, default: () => ({}) },
  },
  { timestamps: true }
);

// -----------------------------------------------------------------------------
// Indexes
// -----------------------------------------------------------------------------

UserSchema.index({ email: 1 });
UserSchema.index({ "loginHistory.at": -1 });

// -----------------------------------------------------------------------------
// Virtuals
// -----------------------------------------------------------------------------

UserSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`.trim();
});

UserSchema.virtual("isLocked").get(function () {
  return !!(this.security.lockUntil && this.security.lockUntil > Date.now());
});

// -----------------------------------------------------------------------------
// Hooks
// -----------------------------------------------------------------------------

/**
 * Before saving a user ensure password hashing and verification token creation
 * if the account is not verified. Password hashing uses SHA-256 for simplicity
 * though a real system would rely on bcrypt or Argon2.
 */
UserSchema.pre("save", async function (next) {
  try {
    if (this.isModified("password")) {
      this.password = crypto
        .createHash("sha256")
        .update(this.password)
        .digest("hex");
    }

    if (this.isNew && !this.isVerified && !this.verificationToken) {
      this.verificationToken = uuidv4();
    }

    next();
  } catch (err) {
    next(err);
  }
});

// -----------------------------------------------------------------------------
// Instance Methods
// -----------------------------------------------------------------------------

/**
 * Compare a cleartext password with the stored hash.
 */
UserSchema.methods.comparePassword = function (password) {
  const hashed = crypto.createHash("sha256").update(password).digest("hex");
  return Promise.resolve(hashed === this.password);
};

/**
 * Generate and store a password reset token. The token is SHA1 hashed to avoid
 * storing the plaintext value in the database.
 */
UserSchema.methods.generateResetToken = function () {
  const raw = uuidv4();
  this.resetPasswordToken = crypto
    .createHash("sha1")
    .update(raw)
    .digest("hex");
  return raw;
};

/**
 * Validate a provided reset token against the stored hashed token.
 */
UserSchema.methods.verifyResetToken = function (token) {
  if (!this.resetPasswordToken) return false;
  const hashed = crypto.createHash("sha1").update(token).digest("hex");
  return hashed === this.resetPasswordToken;
};

/**
 * Clear the reset token after successful password reset.
 */
UserSchema.methods.invalidateResetToken = function () {
  this.resetPasswordToken = undefined;
  return this.save();
};

/**
 * Add a JWT refresh token to the list of active tokens. The list is trimmed to
 * at most 10 entries to prevent unbounded growth.
 */
UserSchema.methods.addRefreshToken = function (token) {
  this.refreshTokens.push(token);
  if (this.refreshTokens.length > 10) {
    this.refreshTokens.shift();
  }
  return this.save();
};

/**
 * Remove a refresh token from the active list.
 */
UserSchema.methods.removeRefreshToken = function (token) {
  this.refreshTokens = this.refreshTokens.filter((t) => t !== token);
  return this.save();
};

/**
 * Record a login attempt in the history and update security counters. Failed
 * logins increment the attempt counter which may trigger a lockout when the
 * configured threshold is exceeded.
 */
UserSchema.methods.recordLoginAttempt = function ({ ip, ua, success }) {
  this.loginHistory.unshift({ ip, ua, success });
  this.loginHistory = this.loginHistory.slice(0, 20); // keep last 20 attempts

  if (success) {
    this.security.loginAttempts = 0;
    this.security.lockUntil = undefined;
  } else {
    this.security.loginAttempts += 1;
    if (this.security.loginAttempts >= 5) {
      this.security.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30min
    }
  }

  return this.save();
};

/**
 * Generate an email verification token. Once verified, the token is removed.
 */
UserSchema.methods.generateVerificationToken = function () {
  this.verificationToken = uuidv4();
  return this.verificationToken;
};

/**
 * Mark user as verified if the provided token matches.
 */
UserSchema.methods.verifyEmail = function (token) {
  if (this.verificationToken !== token) return false;
  this.isVerified = true;
  this.verificationToken = undefined;
  return this.save();
};

// -----------------------------------------------------------------------------
// Static Methods
// -----------------------------------------------------------------------------

/**
 * Find a user by email address.
 */
UserSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase().trim() });
};

/**
 * Verify email/password credentials and return the user if valid. Also records
 * the login attempt whether successful or not.
 */
UserSchema.statics.verifyCredentials = async function (email, password, info = {}) {
  const user = await this.findByEmail(email);
  const success = !!(user && (await user.comparePassword(password)) && !user.isLocked);

  if (user) {
    await user.recordLoginAttempt({ ...info, success });
  }

  if (success) return user;
  return null;
};

// -----------------------------------------------------------------------------
// Export
// -----------------------------------------------------------------------------

module.exports = mongoose.model("User", UserSchema);
