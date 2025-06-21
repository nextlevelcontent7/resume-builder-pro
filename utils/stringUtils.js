function toSlug(str) {
  return str
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function truncate(str, len) {
  if (str.length <= len) return str;
  return str.slice(0, len - 3) + '...';
}

module.exports = { toSlug, truncate };
