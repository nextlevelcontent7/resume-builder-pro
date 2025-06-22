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

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function camelCase(str) {
  return str
    .toLowerCase()
    .split(/[^a-z0-9]/)
    .filter(Boolean)
    .map((word, i) => (i === 0 ? word : capitalize(word)))
    .join('');
}

module.exports = { toSlug, truncate, capitalize, camelCase };
