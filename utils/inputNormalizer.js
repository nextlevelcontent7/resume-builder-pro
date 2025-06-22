function sanitizeHtml(input) {
  return input.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
}

function normalizeString(str) {
  return sanitizeHtml(String(str || '').trim());
}

function normalizeEmail(email) {
  return normalizeString(email).toLowerCase();
}

function normalizePhone(phone) {
  return normalizeString(phone).replace(/[^+\d]/g, '');
}

function normalizeURL(url) {
  try { return new URL(normalizeString(url)).toString(); } catch { return ''; }
}

function normalizeResume(resume) {
  const out = {};
  for (const [key, val] of Object.entries(resume)) {
    if (typeof val === 'string') out[key] = normalizeString(val);
    else if (Array.isArray(val)) out[key] = val.map((v) => normalizeResume(v));
    else if (val && typeof val === 'object') out[key] = normalizeResume(val);
    else out[key] = val;
  }
  return out;
}

module.exports = {
  sanitizeHtml,
  normalizeString,
  normalizeEmail,
  normalizePhone,
  normalizeURL,
  normalizeResume,
};
