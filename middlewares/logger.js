const morgan = require('morgan');
const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');
const path = require('path');

const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const LOG_DIR = process.env.LOG_DIR || 'logs';

// Build log format including request ID and user agent when available
const logFormat = format.printf(({ timestamp, level, message, meta }) => {
  const parts = [timestamp, level.toUpperCase(), message];
  if (meta) parts.push(JSON.stringify(meta));
  return parts.join(' ');
});

// Setup winston logger with daily rotating log files
const logger = createLogger({
  level: LOG_LEVEL,
  format: format.combine(format.timestamp(), logFormat),
  transports: [
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),
    new transports.DailyRotateFile({
      filename: path.join(LOG_DIR, 'app-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
    }),
  ],
});

// Morgan token to include request ID
morgan.token('id', (req) => req.id || '-');
morgan.token('user', (req) => (req.user ? req.user.id : 'anon'));
morgan.token('agent', (req) => (req.userAgent ? req.userAgent.source : '-'));
morgan.token('body', (req) => {
  const safe = { ...req.body };
  if (safe.password) safe.password = '***';
  return JSON.stringify(safe);
});

// Morgan middleware to stream logs through winston
const morganMiddleware = morgan(
  ':id :user :agent :method :url :status :response-time ms :body',
  {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  }
);

module.exports = { logger, morganMiddleware };
