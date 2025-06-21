const morgan = require('morgan');
const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');
const path = require('path');

// Setup winston logger with daily rotating log files
const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),
    new transports.DailyRotateFile({
      filename: path.join('logs', 'app-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
    }),
  ],
});

// Morgan middleware to stream logs through winston
const morganMiddleware = morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim()),
  },
});

module.exports = { logger, morganMiddleware };
