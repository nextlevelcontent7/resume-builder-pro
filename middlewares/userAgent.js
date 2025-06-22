// Middleware capturing basic user agent information for analytics and security.
// The parser avoids heavy dependencies and extracts common metadata.
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
