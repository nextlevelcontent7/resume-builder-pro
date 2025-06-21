// Express application setup with common middleware
const express = require('express');
const cors = require('cors');
const {
  notFound,
  errorHandler,
  logger,
  requestId,
  userAuditLogger,
  errorParser,
  rateLimiter,
  swagger,
} = require('./middlewares');
const path = require('path');
const i18n = require('./utils/i18n');

const app = express();

// Parse incoming JSON requests
app.use(express.json());

// Enable CORS for all origins (configure as needed for production)
app.use(cors());

// Attach request ID for traceability
app.use(requestId);

// Basic in-memory rate limiter to prevent abuse
app.use(rateLimiter);

// Audit log each request after user is attached
app.use(userAuditLogger);

// Request logging
app.use(logger.morganMiddleware);

// Internationalization middleware (detects language from headers)
app.use(i18n());

// Serve generated PDF files
app.use('/exports', express.static(path.join(__dirname, 'exports')));

// Register application routes
const baseRoutes = require('./routes');
const resumeRoutes = require('./routes/resumeRoutes');
app.use('/api', baseRoutes);
app.use('/api/resumes', resumeRoutes);
app.get('/api-docs', swagger);

// Handle 404 errors

// Translate common validation errors
app.use(errorParser);

app.use(notFound);

// Generic error handler
app.use(errorHandler);

module.exports = app;
