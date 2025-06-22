const morgan = require('morgan');
const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');
const path = require('path');

const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const LOG_DIR = process.env.LOG_DIR || 'logs';
const LOG_REMOTE_URL = process.env.LOG_REMOTE_URL;

async function sendRemoteLog(payload) {
  if (!LOG_REMOTE_URL) return;
  try {
    await fetch(LOG_REMOTE_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    // ignore remote log failures
  }
}

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

['info', 'warn', 'error'].forEach((level) => {
  const orig = logger[level].bind(logger);
  logger[level] = (msg, meta) => {
    const payload = { level, msg, meta, timestamp: new Date().toISOString() };
    sendRemoteLog(payload);
    orig(msg, meta);
  };
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
      write: (message) => {
        const msg = message.trim();
        logger.info(msg);
        sendRemoteLog({ level: 'info', msg });
      },
    },
  }
);

module.exports = { logger, morganMiddleware };
