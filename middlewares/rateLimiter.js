const RATE_LIMIT = parseInt(process.env.RATE_LIMIT || '100', 10);
const INTERVAL = parseInt(process.env.RATE_INTERVAL_MS || `${60 * 1000}`, 10);

// Buckets keyed by IP for naive rate limiting; memory resets each restart.
// In production this would be backed by Redis or similar.
const buckets = new Map();

module.exports = function rateLimiter(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  if (!buckets.has(ip)) buckets.set(ip, []);
  const timestamps = buckets.get(ip);

  // Remove timestamps older than the interval
  while (timestamps.length && timestamps[0] <= now - INTERVAL) {
    timestamps.shift();
  }

  if (timestamps.length >= RATE_LIMIT) {
    res.setHeader('Retry-After', Math.ceil(INTERVAL / 1000));
    return res.status(429).json({ success: false, message: 'Too many requests' });
  }

  timestamps.push(now);
  next();
};
