const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const { sanitizeHtml } = require('./inputNormalizer');

// cache compiled templates to avoid recompilation
const templateCache = new Map();

/**
 * Load and compile a Handlebars template.
 * @param {string} name template name without extension
 * @param {string} locale locale code e.g. 'en'
 * @param {string} theme theme folder name
 * @returns {Function} compiled template
 */
function getTemplate(name, locale = 'en', theme = 'default') {
  const key = `${theme}:${locale}:${name}`;
  if (templateCache.has(key)) return templateCache.get(key);
  const fileName = `${name}_${locale}.hbs`;
  const filePath = path.join(__dirname, '..', 'templates', fileName);
  let source;
  if (fs.existsSync(filePath)) {
    source = fs.readFileSync(filePath, 'utf8');
  } else {
    // fallback to English template
    const fallback = path.join(__dirname, '..', 'templates', `${name}_en.hbs`);
    if (!fs.existsSync(fallback)) throw new Error('Template not found');
    source = fs.readFileSync(fallback, 'utf8');
  }
  const template = handlebars.compile(source);
  templateCache.set(key, template);
  return template;
}

/**
 * Render resume HTML using the desired locale and theme.
 * Options allow customizing brand name, watermark text and RTL layout.
 */
function render(resume, locale = 'en', theme = 'default', options = {}) {
  const template = getTemplate('default', locale, theme);
  const dictPath = path.join(__dirname, '..', 'locales', `${locale}.json`);
  const dict = fs.existsSync(dictPath)
    ? JSON.parse(fs.readFileSync(dictPath))
    : {};
  const html = template({
    resume,
    t: (k) => dict[k] || k,
  });
  let result = sanitizeHtml(html);
  if (options.brand) {
    result = result.replace('</body>', `<footer>${options.brand}</footer></body>`);
  }
  if (options.rtl) {
    result = result.replace('<html', '<html dir="rtl"');
  }
  if (options.watermark) {
    result = result.replace('</body>', `<div style="position:fixed;bottom:10px;opacity:0.5;font-size:10px">${options.watermark}</div></body>`);
  }
  return result;
}

module.exports = { getTemplate, render };
