// local stub for mongoose to run in minimal environments
const mongoose = require('../mongoose');
const crypto = require('crypto');

// Basic user schema supporting admin roles and authentication
const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    resetPasswordToken: String,
    refreshTokens: [String],
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    this.password = crypto.createHash('sha256').update(this.password).digest('hex');
    next();
  } catch (err) {
    next(err);
  }
});

UserSchema.methods.comparePassword = function (password) {
  const hashed = crypto.createHash('sha256').update(password).digest('hex');
  return Promise.resolve(this.password === hashed);
};

module.exports = mongoose.model('User', UserSchema);
