function mergeLocales(base, overrides) {
  return { ...base, ...overrides };
}

function getFallbackLocale(lang) {
  return lang && lang.startsWith('ar') ? 'ar' : 'en';
}

module.exports = { mergeLocales, getFallbackLocale };
