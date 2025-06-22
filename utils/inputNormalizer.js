'use strict';

/**
 * Input normalization helpers used to sanitize and standardize inbound data.
 * These functions intentionally avoid heavy third party dependencies so they can
 * run in constrained environments or within browser contexts.
 */

function sanitizeHtml(input = '') {
  return String(input)
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/g, '');
}

function normalizeString(str) {
  return sanitizeHtml(str).trim();
}

function normalizeEmail(email) {
  return normalizeString(email).toLowerCase();
}

function normalizePhone(phone) {
  return normalizeString(phone).replace(/[^+\d]/g, '');
}

function normalizeURL(url) {
  try {
    return new URL(normalizeString(url)).toString();
  } catch {
    return '';
  }
}

function deepNormalize(obj) {
  if (Array.isArray(obj)) return obj.map(deepNormalize);
  if (obj && typeof obj === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      out[k] = deepNormalize(v);
    }
    return out;
  }
  if (typeof obj === 'string') return normalizeString(obj);
  return obj;
}

module.exports = {
  sanitizeHtml,
  normalizeString,
  normalizeEmail,
  normalizePhone,
  normalizeURL,
  normalizeResume: deepNormalize,
  deepNormalize,
};
