'use strict';

/**
 * Advanced slug generator capable of transliterating unicode characters,
 * applying custom replacements and enforcing length limits. The implementation
 * is dependency free to keep it light but supports caching for repeated calls.
 */

// basic transliteration map for latin accented characters
const charMap = {
  á: 'a', à: 'a', ä: 'a', â: 'a', Á: 'A', À: 'A', Ä: 'A', Â: 'A',
  é: 'e', è: 'e', ë: 'e', ê: 'e', É: 'E', È: 'E', Ë: 'E', Ê: 'E',
  í: 'i', ì: 'i', ï: 'i', î: 'i', Í: 'I', Ì: 'I', Ï: 'I', Î: 'I',
  ó: 'o', ò: 'o', ö: 'o', ô: 'o', Ó: 'O', Ò: 'O', Ö: 'O', Ô: 'O',
  ú: 'u', ù: 'u', ü: 'u', û: 'u', Ú: 'U', Ù: 'U', Ü: 'U', Û: 'U',
  ñ: 'n', Ñ: 'N', ç: 'c', Ç: 'C', ß: 'ss',
};

const cache = new Map();

function transliterate(str) {
  return str.replace(/[\u00C0-\u02AB]/g, (c) => charMap[c] || c);
}

/**
 * Create a slug from an arbitrary string.
 * @param {string} str value to slugify
 * @param {object} [opts]
 * @param {string} [opts.delimiter='-'] delimiter for word breaks
 * @param {boolean} [opts.lower=true] force lowercase output
 * @param {number} [opts.limit=0] max length of slug, 0 for unlimited
 * @param {object} [opts.replacements] map of custom replacements
 * @param {boolean} [opts.cache=true] enable cache
 * @returns {string} slug
 */
function slugify(str, opts = {}) {
  const {
    delimiter = '-',
    lower = true,
    limit = 0,
    replacements = {},
    cache: useCache = true,
  } = opts;

  const cacheKey = useCache ? `${str}:${delimiter}:${lower}:${limit}` : null;
  if (useCache && cache.has(cacheKey)) return cache.get(cacheKey);

  let slug = transliterate(String(str))
    .replace(/[^A-Za-z0-9]+/g, delimiter)
    .replace(new RegExp(`${delimiter}{2,}`, 'g'), delimiter)
    .replace(new RegExp(`^${delimiter}|${delimiter}$`, 'g'), '');

  if (lower) slug = slug.toLowerCase();
  if (limit) slug = slug.slice(0, limit);

  for (const [k, v] of Object.entries(replacements)) {
    slug = slug.replace(new RegExp(k, 'g'), v);
  }

  if (useCache) cache.set(cacheKey, slug);
  return slug;
}

module.exports = slugify;
