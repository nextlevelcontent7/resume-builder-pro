const RATE_LIMIT = parseInt(process.env.RATE_LIMIT || '100', 10);
const INTERVAL = parseInt(process.env.RATE_INTERVAL_MS || `${60 * 1000}`, 10);
const EXCLUDE_PATHS = (process.env.RATE_EXCLUDE_PATHS || '').split(',').filter(Boolean);
const WHITELIST_IPS = (process.env.RATE_WHITELIST_IPS || '').split(',').filter(Boolean);

// Buckets keyed by IP for naive rate limiting; memory resets each restart.
// In production this would be backed by Redis or similar.
const buckets = new Map();

module.exports = function rateLimiter(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  if (WHITELIST_IPS.includes(ip) || EXCLUDE_PATHS.some((p) => req.path.startsWith(p))) {
    return next();
  }
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

  res.setHeader('X-RateLimit-Limit', RATE_LIMIT);
  res.setHeader('X-RateLimit-Remaining', RATE_LIMIT - timestamps.length - 1);

  timestamps.push(now);
  next();
};
