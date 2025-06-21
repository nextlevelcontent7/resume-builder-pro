const mongoose = require('mongoose');
const { Schema } = mongoose;

// Resume schema capturing all necessary details for building a CV
const ResumeSchema = new Schema({
  personalInfo: {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^[^@\s]+@[^@\s]+\.[^@\s]+$/, 'Invalid email'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    birthDate: Date,
    nationality: {
      type: String,
      trim: true,
    },
    profileImage: {
      filename: String,
      path: String,
      mimetype: String,
      size: Number,
    },
  },
  education: [
    {
      degree: { type: String, required: true },
      school: { type: String, required: true },
      startDate: { type: Date, required: true },
      endDate: { type: Date },
    },
  ],
  experience: [
    {
      jobTitle: { type: String, required: true },
      company: { type: String, required: true },
      startDate: { type: Date, required: true },
      endDate: { type: Date },
      description: { type: String },
    },
  ],
  skills: [{ type: String }],
  languages: [
    {
      language: { type: String, required: true },
      level: { type: String, required: true },
    },
  ],
  theme: { type: String, default: 'default' },
  resumeFile: {
    filename: String,
    path: String,
    mimetype: String,
    size: Number,
  },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Resume', ResumeSchema);
