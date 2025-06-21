const fs = require('fs');
const path = require('path');

// Load all locale JSON files from the locales folder
const localesDir = path.join(__dirname, '..', 'locales');
const availableLocales = {};
fs.readdirSync(localesDir).forEach((file) => {
  if (file.endsWith('.json')) {
    const lang = path.basename(file, '.json');
    availableLocales[lang] = JSON.parse(fs.readFileSync(path.join(localesDir, file)));
  }
});

// Fallback language
const FALLBACK = 'ar';

function detectLanguage(header) {
  if (!header) return 'en';
  const lang = header.split(',')[0].toLowerCase().split('-')[0];
  return availableLocales[lang] ? lang : FALLBACK;
}

// Express middleware to attach translation helper to request object
module.exports = function i18n() {
  return (req, res, next) => {
    const lang = detectLanguage(req.headers['accept-language']);
    req.lang = lang;
    const dictionary = availableLocales[lang] || {};
    const fallbackDict = availableLocales[FALLBACK] || {};
    req.t = (key) => dictionary[key] || fallbackDict[key] || key;
    next();
  };
};
