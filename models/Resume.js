"use strict";

/**
 * Resume model definition for Resume Builder Pro.
 *
 * This schema is intentionally large and heavily documented. It demonstrates
 * a production-grade Mongoose setup suitable for commercial SaaS platforms.
 * The code includes nested sub-document schemas, extensive validation rules,
 * internationalization ready enums, static and instance helpers, rich
 * virtuals, hooks, and indexes for high performance. It is designed for
 * scalability and long-term maintenance.
 */

//----------------------------------------------------------------------------- 
// Dependencies
//-----------------------------------------------------------------------------

// use local mongoose stub for environments without MongoDB
const mongoose = require("../mongoose");
const { slugify } = require("../utils");

const { Schema } = mongoose;

//----------------------------------------------------------------------------- 
// Enumerations
//----------------------------------------------------------------------------- 

/**
 * Supported language proficiency levels following CEFR-like scale. These are
 * referenced in the language sub-schema and validated as enums to ensure
 * consistent storage and localization.
 */
const LANGUAGE_LEVELS = Object.freeze({
  BEGINNER: "beginner",
  INTERMEDIATE: "intermediate",
  ADVANCED: "advanced",
  FLUENT: "fluent",
  NATIVE: "native",
});

/**
 * Available theme names for PDF generation and front-end previews.
 * New themes should be added here to ensure validation and avoid runtime
 * errors when users select invalid themes via the API or UI.
 */
const THEMES = Object.freeze([
  "default",
  "modern",
  "classic",
  "executive",
  "creative",
]);

/**
 * Resume lifecycle statuses. "draft" is used while the user edits, "published"
 * means the resume can be publicly shared, and "archived" marks it as hidden.
 */
const STATUS_TAGS = Object.freeze(["draft", "published", "archived"]);

/**
 * Skill mastery levels used to grade proficiency in a particular skill.
 */
const SKILL_LEVELS = Object.freeze({
  NOVICE: 1,
  BEGINNER: 2,
  COMPETENT: 3,
  PROFICIENT: 4,
  EXPERT: 5,
});

/**
 * Supported link categories for the personal info section. These keys allow the
 * front-end to display appropriate icons for well-known networks.
 */
const LINK_TYPES = Object.freeze([
  'website',
  'github',
  'linkedin',
  'twitter',
  'facebook',
  'other',
]);

/**
 * Recognized employment types for experience entries.
 */
const JOB_TYPES = Object.freeze([
  'full-time',
  'part-time',
  'contract',
  'internship',
  'freelance',
  'temporary',
]);

//----------------------------------------------------------------------------- 
// Utility helpers
//----------------------------------------------------------------------------- 

/**
 * Normalize phone numbers by stripping non-digit characters. This helper is
 * intentionally simple; in a real-world scenario you might integrate with a
 * dedicated phone parsing library or service for international formatting.
 */
function normalizePhone(phone = "") {
  return phone.replace(/[^\d\+]/g, "");
}

/**
 * Ensure URLs include a protocol. Used for personal websites and references to
 * LinkedIn or other social links. If a user enters "example.com" the function
 * prepends "http://" so the stored value is usable as a valid hyperlink.
 */
function ensureProtocol(url) {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) return url;
  return `http://${url}`;
}
/**

 * Compute a completeness score based on filled sections. Returns a number from 0 to 100.
 */
function computeCompleteness(doc){
  let total = 5;
  let score = 0;
  if(doc.personalInfo && doc.personalInfo.firstName && doc.personalInfo.lastName){score++;}
  if(doc.education && doc.education.length){score++;}
  if(doc.experience && doc.experience.length){score++;}
  if(doc.skills && doc.skills.length){score++;}
  if(doc.certifications && doc.certifications.length){score++;}
  return Math.round((score/total)*100);
}

/**
 * Compute an experience score weighted by years and skill levels.
 */
function computeExperienceScore(doc){
  let years=0;
  doc.experience.forEach(e=>{if(e.startDate){const end=e.endDate||new Date();years+= (end - e.startDate)/(1000*60*60*24*365);}});
  const avgSkill=doc.skills.reduce((acc,s)=>acc+s.level,0)/(doc.skills.length||1);
  return Math.round(Math.min(100, years*5 + avgSkill*10));
}
/**
 * Build a unique slug based on the user's full name. This function checks the
 * database for existing slugs and appends a numeric suffix if needed. Because
 * it uses async Mongoose queries, it returns a promise that resolves with the
 * final unique slug value.
 */
async function buildUniqueSlug(doc) {
  const base = slugify(`${doc.personalInfo.firstName} ${doc.personalInfo.lastName}`.trim(), {
    lower: true,
    strict: true,
  });

  let slug = base;
  let i = 1;
  // Loop until we find a slug that does not exist for the same user
  // This ensures each user can have multiple resumes without slug conflicts
  while (await mongoose.models.Resume.exists({ slug, createdBy: doc.createdBy })) {
    slug = `${base}-${i++}`;
  }
  return slug;
}

//----------------------------------------------------------------------------- 
// Sub-document Schemas
//----------------------------------------------------------------------------- 

/**
 * Reusable schema for storing uploaded files (profile image and resume
 * document). Stored paths should be relative to the application root so
 * migrations and backups are easier. This sub-schema is shared across multiple
 * fields within the main Resume schema.
 */
const FileInfoSchema = new Schema(
  {
    filename: { type: String, required: true },
    path: { type: String, required: true },
    mimetype: { type: String, required: true },
    size: { type: Number, required: true },
  },
  { _id: false }
);

/**
 * Education information capturing both degree and additional metadata. The
 * schema is flexible enough for multiple degrees or training courses. Dates are
 * stored as plain ISO values to simplify queries and allow partial ranges.
 */
const EducationEntrySchema = new Schema(
  {
    degree: { type: String, required: true, trim: true },
    fieldOfStudy: { type: String, trim: true },
    school: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    grade: { type: String, trim: true },
    description: { type: String, trim: true },
    location: { type: String, trim: true },
    highlights: [{ type: String, trim: true }],
  },
  { _id: false }
);

/**
 * Work experience with an open-ended array of responsibility bullet points.
 * This sub-schema includes validation to ensure start date precedes end date
 * and makes the location field optional to support remote positions.
 */
const ExperienceEntrySchema = new Schema(
  {
    jobTitle: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    location: { type: String, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    jobType: { type: String, enum: JOB_TYPES, default: 'full-time' },
    responsibilities: [{ type: String, trim: true }],
    achievements: [{ type: String, trim: true }],
    technologies: [{ type: String, trim: true }],
    description: { type: String, trim: true },
  },
  { _id: false }
);

// Validate date ranges for experience entries. Because this logic is critical
// to data integrity, it is implemented as a schema-level pre validation hook.
ExperienceEntrySchema.pre("validate", function (next) {
  if (this.endDate && this.endDate < this.startDate) {
    return next(new Error("Experience endDate cannot be before startDate"));
  }
  next();
});

/**
 * Professional certification or award. Allows expiration tracking. When a
 * certificate has no expiration it can be left null. URLs are normalized via
 * the ensureProtocol helper.
 */
const CertificationSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    issuer: { type: String, trim: true },
    issueDate: { type: Date },
    expireDate: { type: Date },
    credentialId: { type: String, trim: true },
    url: {
      type: String,
      trim: true,
      set: ensureProtocol,
    },
  },
  { _id: false }
);

/**
 * Reference contact for the resume. Each reference may include a short note.
 */
const ReferenceSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    company: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true, set: normalizePhone },
    relation: { type: String, trim: true },
    note: { type: String, trim: true },
  },
  { _id: false }
);

/**
 * Language proficiency with enumerated levels. Additional fields can be added
 * later such as certifications or scores.
 */
const LanguageSchema = new Schema(
  {
    language: { type: String, required: true, trim: true },
    level: {
      type: String,
      required: true,
      enum: Object.values(LANGUAGE_LEVELS),
      lowercase: true,
      trim: true,
    },
  },
  { _id: false }
);

/**
 * Section visibility settings allow the user to toggle entire groups on or off
 * without deleting the data. Each property corresponds to a main section of
 * the resume. These flags are stored within the settings sub-document and can
 * be extended as needed.
 */
const SectionVisibilitySchema = new Schema(
  {
    personalInfo: { type: Boolean, default: true },
    summary: { type: Boolean, default: true },
    education: { type: Boolean, default: true },
    experience: { type: Boolean, default: true },
    skills: { type: Boolean, default: true },
    certifications: { type: Boolean, default: true },
    languages: { type: Boolean, default: true },
    references: { type: Boolean, default: false },
    additional: { type: Boolean, default: false },
  },
  { _id: false }
);

/**
 * Resume settings controlling theme, localization, status, and visibility. The
 * `tags` array is indexed separately for quick filtering/searching via query
 * parameters or analytics. Additional per-resume configuration such as custom
 * CSS or watermark preferences can be added here as the platform evolves.
 */
const SettingsSchema = new Schema(
  {
    locale: { type: String, default: "en", trim: true },
    theme: { type: String, enum: THEMES, default: "default", lowercase: true },
    status: {
      type: String,
      enum: STATUS_TAGS,
      default: "draft",
      lowercase: true,
    },
    visibility: { type: SectionVisibilitySchema, default: () => ({}) },
    tags: { type: [String], default: [] },
    customCss: { type: String },
  },
  { _id: false }
);

/**
 * Main personal information sub-schema. Splitting name into first and last
 * supports sorting or formatting on exports. Additional social links or
 * personal statements can be stored in the `links` and `summary` fields.
 */
const PersonalInfoSchema = new Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim: true,
      match: [/^[^@\s]+@[^@\s]+\.[^@\s]+$/, "Invalid email"],
    },
    phone: { type: String, required: true, trim: true, set: normalizePhone },
    location: { type: String, required: true, trim: true },
    birthDate: { type: Date },
    nationality: { type: String, trim: true },
    website: { type: String, trim: true, set: ensureProtocol },
    summary: { type: String, trim: true },
    profileImage: FileInfoSchema,
    links: [
      new Schema(
        {
          label: { type: String, trim: true },
          type: { type: String, enum: LINK_TYPES, default: 'website' },
          url: { type: String, set: ensureProtocol },
        },
        { _id: false }
      ),
    ],
  },
  { _id: false }
);

//----------------------------------------------------------------------------- 
// Main Resume Schema
//----------------------------------------------------------------------------- 

/**
 * The central Resume schema ties together all sub-schemas. Each resume belongs
 * to a user via the `createdBy` reference. The version key is enabled to allow
 * optimistic concurrency control and track changes over time. Timestamps are
 * automatically recorded for auditing.
 */
const ResumeSchema = new Schema(
  {
    personalInfo: { type: PersonalInfoSchema, required: true },
    professionalSummary: { type: String, trim: true },
    education: { type: [EducationEntrySchema], default: [] },
    experience: { type: [ExperienceEntrySchema], default: [] },
    certifications: { type: [CertificationSchema], default: [] },
    skills: {
      type: [
        new Schema(
          {
            name: { type: String, required: true, trim: true },
            level: {
              type: Number,
              enum: Object.values(SKILL_LEVELS),
              default: SKILL_LEVELS.COMPETENT,
            },
          },
          { _id: false }
        ),
      ],
      default: [],
    },
    languages: { type: [LanguageSchema], default: [] },
    references: { type: [ReferenceSchema], default: [] },
    additionalSections: {
      type: [
        new Schema(
          {
            title: { type: String, required: true, trim: true },
            body: { type: String, required: true },
          },
          { _id: false }
        ),
      ],
      default: [],
    },
    settings: { type: SettingsSchema, default: () => ({}) },

    // Computed slug for clean URLs. Unique per user.
    slug: { type: String, unique: true, index: true },

    // Original uploaded resume file if the user imported one.
    resumeFile: FileInfoSchema,

    // Historical versions for audit and change tracking
    versions: {
      type: [
        new Schema(
          {
            createdAt: { type: Date, default: Date.now },
            comment: { type: String, trim: true },
            data: { type: Schema.Types.Mixed, required: true },
          },
          { _id: false }
        ),
      ],
      default: [],
    },
    templateSnapshots: {
      type: [
        new Schema({
          theme: { type: String, enum: THEMES, required: true },
          markup: String,
          createdAt: { type: Date, default: Date.now }
        }, { _id: false })
      ],
      default: []
    },
    completenessScore: { type: Number, default: 0, min: 0, max: 100 },
    experienceScore: { type: Number, default: 0, min: 0, max: 100 },

    // Reference to the owning user
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
      autopopulate: { select: "name email" },
    },
  },
  {
    timestamps: true,
    versionKey: "version",
  }
);

//----------------------------------------------------------------------------- 
// Indexes
//----------------------------------------------------------------------------- 

ResumeSchema.index({ createdBy: 1, slug: 1 }, { unique: true });
ResumeSchema.index({ "settings.tags": 1 });
ResumeSchema.index({ "personalInfo.lastName": 1, "personalInfo.firstName": 1 });
ResumeSchema.index(
  {
    professionalSummary: 'text',
    'education.degree': 'text',
    'education.school': 'text',
    'experience.jobTitle': 'text',
    'experience.company': 'text',
    'skills.name': 'text',
  },
  { name: 'ResumeTextIndex', default_language: 'english' }
);

//----------------------------------------------------------------------------- 
// Virtuals
//----------------------------------------------------------------------------- 

/**
 * Derive full name from first/last fields for convenience. This virtual is
 * non-persistent and always computed on the fly. It is included in JSON output
 * because toJSON and toObject transformations set virtuals: true.
 */
ResumeSchema.virtual("personalInfo.fullName").get(function () {
  const first = this.personalInfo.firstName || "";
  const last = this.personalInfo.lastName || "";
  return `${first} ${last}`.trim();
});

/**
 * Calculate current age based on the birth date if provided. Age is not stored
 * in the database so that it stays accurate over time.
 */
ResumeSchema.virtual("age").get(function () {
  if (!this.personalInfo.birthDate) return null;
  const diffMs = Date.now() - this.personalInfo.birthDate.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25));
});

/**
 * Determine whether the resume is currently published. Publishing rules can be
 * extended later (e.g., scheduled publication). For now, it simply checks the
 * status field under settings.
 */
ResumeSchema.virtual("isPublished").get(function () {
  return this.settings && this.settings.status === "published";
});

/**
 * Calculate total years of professional experience by summing distinct years
 * from each experience entry. Overlapping periods are handled so the same year
 * is not double-counted. This calculation is expensive so it may be cached or
 * precomputed in a real system; here it runs on demand.
 */
ResumeSchema.virtual("experienceYears").get(function () {
  const years = new Set();
  (this.experience || []).forEach((exp) => {
    if (!exp.startDate) return;
    const startYear = exp.startDate.getFullYear();
    const endYear = exp.endDate ? exp.endDate.getFullYear() : new Date().getFullYear();
    for (let y = startYear; y <= endYear; y++) {
      years.add(y);
    }
  });
  return years.size;
});

//----------------------------------------------------------------------------- 
// Pre-hooks
//----------------------------------------------------------------------------- 

/**
 * Pre-validation hook ensures that nested arrays are not null and normalizes
 * certain fields. The hook populates default objects for optional sub-schemas
 * when they are missing to prevent MongoDB from storing `null` or `undefined`.
 */
ResumeSchema.pre("validate", function (next) {
  if (!this.settings) this.settings = {};
  if (!this.settings.visibility) this.settings.visibility = {};

  // Normalize phone numbers to keep them consistent across the database
  if (this.personalInfo && this.personalInfo.phone) {
    this.personalInfo.phone = normalizePhone(this.personalInfo.phone);
  }

  // Ensure slug is generated before validation so unique index checks work
  if (!this.slug && this.personalInfo) {
    buildUniqueSlug(this)
      .then((slug) => {
        this.slug = slug;
        next();
      })
      .catch(next);
  } else {
    next();
  }
});

/**
 * Pre-save hook records a lastModified timestamp in the settings object. While
 * MongoDB automatically tracks `updatedAt`, storing an additional timestamp in
 * the nested settings allows the front-end to display edit histories without
 * exposing database internals. The hook also sanitizes any custom CSS to avoid
 * malicious injections.
 */
ResumeSchema.pre("save", function (next) {
  this.settings.lastModifiedAt = new Date();

  if (this.settings.customCss) {
    this.settings.customCss = this.settings.customCss.replace(/<script.*?>.*?<\/script>/gi, "");
  }

  this.completenessScore = computeCompleteness(this);
  this.experienceScore = computeExperienceScore(this);

  next();
});

/**
 * After saving, log a message with the resume ID and user ID. In a production
 * environment this might push to a message queue or analytics service.
 */
ResumeSchema.post("save", function (doc) {
  // `this` is the model instance, but we use doc to ensure lean objects
  // eslint-disable-next-line no-console
  console.info(`Resume ${doc._id} saved for user ${doc.createdBy}`);
});

/**
 * After an update operation, output the changed fields. This simplistic
 * implementation logs to the console; a real-world system could send these
 * events to an audit service or message broker.
 */
ResumeSchema.post('findOneAndUpdate', async function (doc) {
  if (!doc) return;
  // eslint-disable-next-line no-console
  console.info(`Resume ${doc._id} updated for user ${doc.createdBy}`);
});

/**
 * After a document is removed, log the operation. This is particularly useful
 * when soft deletes are enabled to differentiate between hard deletions and
 * archival actions.
 */
ResumeSchema.post('remove', function (doc) {
  // eslint-disable-next-line no-console
  console.info(`Resume ${doc._id} removed for user ${doc.createdBy}`);
});

//----------------------------------------------------------------------------- 
// Instance Methods
//----------------------------------------------------------------------------- 

/**
 * Add an education entry. Validation is performed by pushing into the array and
 * then invoking `validateSync()` on the sub-document. Any validation errors are
 * surfaced as exceptions, which calling services should handle.
 */
ResumeSchema.methods.addEducation = function (entry) {
  const sub = new EducationEntrySchema(entry);
  const err = sub.validateSync();
  if (err) throw err;
  this.education.push(sub);
  return this;
};

/**
 * Add a work experience entry. The same validation pattern as above applies.
 */
ResumeSchema.methods.addExperience = function (entry) {
  const sub = new ExperienceEntrySchema(entry);
  const err = sub.validateSync();
  if (err) throw err;
  this.experience.push(sub);
  return this;
};

/**
 * Change resume status. Only allowed values are enforced via the STATUS_TAGS
 * array. Attempting to set an invalid status results in an error, preventing
 * inconsistent data from being stored.
 */
ResumeSchema.methods.setStatus = function (status) {
  if (!STATUS_TAGS.includes(status)) {
    throw new Error("Invalid status");
  }
  this.settings.status = status;
  return this;
};

/**
 * Prepare a lean JSON representation safe for public APIs. Removes internal
 * metadata such as MongoDB version and hides the createdBy user reference.
 */
ResumeSchema.methods.toPublic = function () {
  const obj = this.toObject({ virtuals: true });
  delete obj.createdBy;
  delete obj.version;
  return obj;
};

/**
 * Convert resume into a compact string for search indexing. The resulting
 * string concatenates key textual fields and can be fed into an external
 * full-text search engine.
 */
ResumeSchema.methods.toSearchDocument = function () {
  const parts = [
    this.personalInfo.firstName,
    this.personalInfo.lastName,
    this.professionalSummary,
    (this.skills || []).map((s) => s.name).join(' '),
    (this.experience || [])
      .map((e) => `${e.jobTitle} ${e.company} ${e.responsibilities.join(' ')}`)
      .join(' '),
  ];
  return parts.filter(Boolean).join(' ');
};

//----------------------------------------------------------------------------- 
// Static Methods
//----------------------------------------------------------------------------- 

/**
 * Find all resumes for a given user. Optionally filter by status or tag. This
 * helper is used by the service layer and controllers to encapsulate query
 * logic in one place.
 */
ResumeSchema.statics.findForUser = function (userId, { status, tag } = {}) {
  const q = { createdBy: userId };
  if (status) q["settings.status"] = status;
  if (tag) q["settings.tags"] = tag;
  return this.find(q).sort({ updatedAt: -1 });
};

/**
 * Find resumes by tag for a specific user. This is a convenience wrapper around
 * findForUser for common filtering patterns.
 */
ResumeSchema.statics.findByTag = function (userId, tag) {
  return this.findForUser(userId, { tag });
};

/**
 * Search resumes by keyword across various text fields. In MongoDB 4.x and
 * newer we could use text indexes for better performance. This method performs
 * a simple regex search as a cross-database fallback.
 */
ResumeSchema.statics.search = function (userId, keyword) {
  const regex = new RegExp(keyword, "i");
  return this.find({
    createdBy: userId,
    $or: [
      { professionalSummary: regex },
      { "education.school": regex },
      { "experience.company": regex },
      { skills: regex },
    ],
  });
};

/**
 * Retrieve a resume by slug for a specific user. Slugs are unique per user so
 * the combination of userId and slug will return a single document.
 */
ResumeSchema.statics.findBySlug = function (userId, slug) {
  return this.findOne({ createdBy: userId, slug });
};

/**
 * Return a list of all distinct tags used across a user's resumes. Useful for
 * building tag clouds or filter lists in the UI.
 */
ResumeSchema.statics.listTags = async function (userId) {
  const results = await this.aggregate([
    { $match: { createdBy: new mongoose.Types.ObjectId(userId) } },
    { $unwind: "$settings.tags" },
    { $group: { _id: "$settings.tags", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  return results.map((r) => ({ tag: r._id, count: r.count }));
};

//----------------------------------------------------------------------------- 
// Schema Options and Plugins
//----------------------------------------------------------------------------- 

ResumeSchema.set("toJSON", { virtuals: true });
ResumeSchema.set("toObject", { virtuals: true });

/**
 * Plugin to automatically add createdAt and updatedAt timestamps to sub
 * documents within arrays. This makes it easier to audit when specific entries
 * were added or modified without flattening the data model.
 */
function timestampsForSubDocs(schema) {
  schema.eachPath((pathname, schematype) => {
    if (schematype instanceof mongoose.Schema.Types.DocumentArray) {
      schematype.schema.add({
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
      });

      schematype.pre('save', function (next) {
        if (this.isNew) {
          this.createdAt = this.updatedAt = new Date();
        } else if (this.isModified()) {
          this.updatedAt = new Date();
        }
        next();
      });
    }
  });
}

ResumeSchema.plugin(timestampsForSubDocs);

/**
 * Validation error formatter plugin. Converts raw Mongo validation errors into
 * a simplified structure that can be safely returned from API endpoints.
 */
function validationErrorFormatter(schema) {
  schema.post('validate', function (doc, next) {
    next();
  });

  schema.post('save', function (error, doc, next) {
    if (error.name === 'ValidationError') {
      const formatted = Object.keys(error.errors).map((key) => ({
        field: key,
        message: error.errors[key].message,
      }));
      return next(new Error(JSON.stringify(formatted)));
    }
    next(error);
  });
}

ResumeSchema.plugin(validationErrorFormatter);

/**
 * Simple autopopulate plugin focusing on the `createdBy` reference. Instead of
 * relying on a third-party package, this local plugin keeps dependencies light
 * and demonstrates how hooks can be composed.
 */
function autopopulateCreatedBy(schema) {
  function auto(next) {
    this.populate("createdBy", "name email");
    next();
  }
  schema.pre("find", auto);
  schema.pre("findOne", auto);
  schema.pre("findOneAndUpdate", auto);
  schema.pre("findById", auto);
}

ResumeSchema.plugin(autopopulateCreatedBy);

//-----------------------------------------------------------------------------
// Soft Delete Plugin
//-----------------------------------------------------------------------------

/**
 * Soft deletion plugin. Adds a boolean `deleted` flag and modifies query
 * middleware to exclude deleted documents by default. Queries can opt into
 * including deleted documents by calling `.withDeleted()`.
 */
function softDeletePlugin(schema) {
  schema.add({ deleted: { type: Boolean, default: false, index: true } });

  schema.query.withDeleted = function () {
    this._withDeleted = true;
    return this;
  };

  function excludeDeleted(next) {
    if (!this._withDeleted) {
      this.where({ deleted: false });
    }
    next();
  }

  schema.pre('find', excludeDeleted);
  schema.pre('findOne', excludeDeleted);
  schema.pre('countDocuments', excludeDeleted);
  schema.pre('findOneAndUpdate', excludeDeleted);
}

ResumeSchema.plugin(softDeletePlugin);

//-----------------------------------------------------------------------------
// History Plugin
//-----------------------------------------------------------------------------

/**
 * History tracking plugin. Every time a resume document is saved, a snapshot of
 * the previous version is stored in a separate collection. This is useful for
 * audit trails or undo functionality. The plugin adds minimal overhead and can
 * be toggled per-model if necessary.
 */
function historyPlugin(schema) {
  const HistoryModel = mongoose.model(
    'ResumeHistory',
    new Schema(
      {
        resume: { type: Schema.Types.ObjectId, ref: 'Resume', index: true },
        createdAt: { type: Date, default: Date.now, index: true },
        snapshot: { type: Schema.Types.Mixed },
      },
      { collection: 'resume_histories' }
    )
  );

  schema.pre('save', async function (next) {
    if (!this.isNew) {
      const prev = await this.constructor.findById(this._id).lean();
      if (prev) {
        await HistoryModel.create({ resume: this._id, snapshot: prev });
      }
    }
    next();
  });

  schema.statics.history = function (id) {
    return HistoryModel.find({ resume: id }).sort({ createdAt: -1 });
  };
}

ResumeSchema.plugin(historyPlugin);

//-----------------------------------------------------------------------------
// Additional Instance Methods
//-----------------------------------------------------------------------------

/**
 * Remove an education entry by its index. Throws an error if the index is out
 * of bounds to prevent accidental data loss from malformed requests.
 */
ResumeSchema.methods.removeEducation = function (index) {
  if (index < 0 || index >= this.education.length) {
    throw new Error('Education index out of range');
  }
  this.education.splice(index, 1);
  return this;
};

/**
 * Update an existing experience entry. Fields not supplied in `updates` remain
 * unchanged. Validation is performed on the updated sub-document.
 */
ResumeSchema.methods.updateExperience = function (index, updates) {
  if (index < 0 || index >= this.experience.length) {
    throw new Error('Experience index out of range');
  }
  const exp = this.experience[index];
  Object.assign(exp, updates);
  const err = exp.validateSync();
  if (err) throw err;
  return this;
};

/**
 * Set the level for a particular skill. If the skill does not exist it will be
 * appended. Level must be within the SKILL_LEVELS range.
 */
ResumeSchema.methods.setSkillLevel = function (name, level) {
  if (!Object.values(SKILL_LEVELS).includes(level)) {
    throw new Error('Invalid skill level');
  }
  const existing = this.skills.find((s) => s.name === name);
  if (existing) {
    existing.level = level;
  } else {
    this.skills.push({ name, level });
  }
  return this;
};

/**
 * Generate a map of skills to occurrence counts. Useful for analytics or
 * building weighted tag clouds on the front-end.
 */
ResumeSchema.methods.skillFrequency = function () {
  return this.skills.reduce((acc, skill) => {
    acc[skill.name] = (acc[skill.name] || 0) + 1;
    return acc;
  }, {});
};

/**
 * Return an array of section names that are currently visible according to the resume's settings.
 */
ResumeSchema.methods.listVisibleSections = function () {
  const vis = this.settings.visibility || {};
  return Object.keys(vis).filter((k) => vis[k]);
};

/**
 * Store a snapshot of the rendered template markup for later retrieval.
 */
ResumeSchema.methods.addTemplateSnapshot = function (theme, markup) {
  this.templateSnapshots.push({ theme, markup });
  if (this.templateSnapshots.length > 20) {
    this.templateSnapshots.shift();
  }
  return this;
};

/**
 * Record the current state of the resume as a version entry.
 */
ResumeSchema.methods.addVersion = function (comment) {
  const data = this.toObject();
  delete data._id;
  delete data.versions;
  this.versions.push({ createdAt: new Date(), comment, data });
  if (this.versions.length > 50) {
    this.versions.shift();
  }
  return this;
};

//-----------------------------------------------------------------------------
// Additional Static Methods
//-----------------------------------------------------------------------------

/**
 * Count resumes by status for a particular user. Returns an object where keys
 * are status strings and values are counts. This can power dashboards showing
 * how many resumes are in draft versus published state.
 */
ResumeSchema.statics.countByStatus = async function (userId) {
  const counts = await this.aggregate([
    { $match: { createdBy: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: '$settings.status', count: { $sum: 1 } } },
  ]);
  const result = {};
  counts.forEach((c) => {
    result[c._id] = c.count;
  });
  STATUS_TAGS.forEach((tag) => {
    if (!result[tag]) result[tag] = 0;
  });
  return result;
};

/**
 * Remove draft resumes that have not been modified in a specified number of
 * days. This can be scheduled to run periodically to keep the database small.
 */
ResumeSchema.statics.cleanupOldDrafts = function (days = 30) {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return this.deleteMany({
    'settings.status': 'draft',
    updatedAt: { $lt: cutoff },
  });
};

/**
 * Aggregate the most common technologies across all experiences for a given
 * user. Returns an array of objects sorted by frequency, limited to the top
 * 20 entries. This can drive analytics dashboards.
 */
ResumeSchema.statics.topTechnologies = async function (userId, limit = 20) {
  const result = await this.aggregate([
    { $match: { createdBy: new mongoose.Types.ObjectId(userId) } },
    { $unwind: '$experience' },
    { $unwind: '$experience.technologies' },
    { $group: { _id: '$experience.technologies', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit },
  ]);
  return result.map((r) => ({ technology: r._id, count: r.count }));
};

/**
 * Duplicate an existing resume for easy re-use. Creates a deep clone with a
 * new slug and optionally a new status. Does not copy over uploaded files.
 */
ResumeSchema.statics.duplicateResume = async function (resumeId, status = 'draft') {
  const original = await this.findById(resumeId);
  if (!original) throw new Error('Resume not found');
  const obj = original.toObject();
  delete obj._id;
  obj.slug = await buildUniqueSlug(original);
  obj.settings.status = status;
  delete obj.resumeFile; // do not duplicate large file data
  delete obj.versions; // new resume should start without version history
  return this.create(obj);
};

//-----------------------------------------------------------------------------

//----------------------------------------------------------------------------- 
// Model Export
//----------------------------------------------------------------------------- 

/**
 * The exported Resume model. Other modules should require this file and access
 * the model via `mongoose.model('Resume')` or this export. Centralizing all
 * logic in this file keeps the data layer consistent and easy to maintain.
 */
module.exports = mongoose.model("Resume", ResumeSchema);

// End of Resume model definition

