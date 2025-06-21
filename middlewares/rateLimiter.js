const RATE_LIMIT = 100; // requests per IP per minute
const INTERVAL = 60 * 1000; // 1 minute in ms

// Simple in-memory rate limiting bucket per IP
const buckets = new Map();

module.exports = function rateLimiter(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  if (!buckets.has(ip)) buckets.set(ip, []);
  const timestamps = buckets.get(ip);

  // Drop outdated timestamps
  while (timestamps.length && timestamps[0] <= now - INTERVAL) {
    timestamps.shift();
  }

  if (timestamps.length >= RATE_LIMIT) {
    return res.status(429).json({ success: false, message: 'Too many requests' });
  }

  timestamps.push(now);
  next();
};
