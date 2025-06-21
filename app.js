// Express application setup with common middleware
const express = require('express');
const cors = require('cors');
const { notFound, errorHandler, logger, requestId } = require('./middlewares');
const path = require('path');
const i18n = require('./utils/i18n');

const app = express();

// Parse incoming JSON requests
app.use(express.json());

// Enable CORS for all origins (configure as needed for production)
app.use(cors());

// Attach request ID for traceability
app.use(requestId);

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

// Handle 404 errors
app.use(notFound);

// Generic error handler
app.use(errorHandler);

module.exports = app;
