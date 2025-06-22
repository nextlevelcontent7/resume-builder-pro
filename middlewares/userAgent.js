// Simple middleware to store the raw User-Agent header and basic info.
// Avoids external dependencies for easier deploy.
module.exports = function userAgent(req, res, next) {
  const ua = req.headers['user-agent'] || '';
  const mobile = /mobile/i.test(ua);
  const os = /windows/i.test(ua)
    ? 'windows'
    : /mac/i.test(ua)
    ? 'mac'
    : /linux/i.test(ua)
    ? 'linux'
    : 'unknown';
  const browser = /chrome/i.test(ua)
    ? 'chrome'
    : /safari/i.test(ua)
    ? 'safari'
    : /firefox/i.test(ua)
    ? 'firefox'
    : 'unknown';

  req.userAgent = { source: ua, mobile, os, browser };
  next();
};
