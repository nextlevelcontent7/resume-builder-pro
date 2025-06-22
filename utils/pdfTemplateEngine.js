const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const { sanitizeHtml } = require('./inputNormalizer');

/**
 * A small template engine used to compile Handlebars templates for PDF output.
 * It supports localization, theme switching, caching, RTL layout and brand
 * watermarking. Templates are loaded from the `templates` directory and can
 * include partials under `templates/partials`.
 */
class PDFTemplateEngine {
  constructor() {
    // cache compiled templates and partials for fast repeated access
    this.templateCache = new Map();
    this.partialsLoaded = false;
  }

  /**
   * Register all partials from the templates/partials directory. Partials are
   * cached globally to avoid redundant disk reads. If new partial files are
   * added at runtime this method can be called again with `force`.
   * @param {boolean} [force=false] whether to reload even if already loaded
   */
  registerPartials(force = false) {
    if (this.partialsLoaded && !force) return;
    const partialDir = path.join(__dirname, '..', 'templates', 'partials');
    if (!fs.existsSync(partialDir)) return;
    const files = fs.readdirSync(partialDir);
    for (const file of files) {
      if (file.endsWith('.hbs')) {
        const name = path.basename(file, '.hbs');
        const src = fs.readFileSync(path.join(partialDir, file), 'utf8');
        handlebars.registerPartial(name, src);
      }
    }
    this.partialsLoaded = true;
  }

  /**
   * Retrieve a compiled template from cache or compile it from disk.
   * Template file names follow the pattern `<name>_<locale>.hbs` allowing
   * per-locale overrides. The fallback locale is always `en`.
   *
   * @param {string} name template name without extension
   * @param {string} locale language code, e.g. `en` or `ar`
   * @param {string} theme theme folder name under templates/themes
   * @returns {Function} compiled handlebars function
   */
  getTemplate(name, locale = 'en', theme = 'default') {
    const key = `${theme}:${locale}:${name}`;
    if (this.templateCache.has(key)) return this.templateCache.get(key);
    const themeDir = path.join(__dirname, '..', 'templates', 'themes', theme);
    // attempt to load locale specific version first
    const fileName = `${name}_${locale}.hbs`;
    let filePath = path.join(themeDir, fileName);
    let source = null;
    if (fs.existsSync(filePath)) {
      source = fs.readFileSync(filePath, 'utf8');
    } else {
      // fall back to English template inside requested theme
      const fallback = path.join(themeDir, `${name}_en.hbs`);
      if (fs.existsSync(fallback)) {
        source = fs.readFileSync(fallback, 'utf8');
      } else {
        // final fallback to default theme
        const defDir = path.join(__dirname, '..', 'templates', 'themes', 'default');
        const defFile = path.join(defDir, `${name}_${locale}.hbs`);
        const defFallback = path.join(defDir, `${name}_en.hbs`);
        if (fs.existsSync(defFile)) {
          source = fs.readFileSync(defFile, 'utf8');
        } else if (fs.existsSync(defFallback)) {
          source = fs.readFileSync(defFallback, 'utf8');
        } else {
          // ultimate fallback to legacy template location
          const legacy = path.join(__dirname, '..', 'templates', `${name}_${locale}.hbs`);
          const legacyFallback = path.join(__dirname, '..', 'templates', `${name}_en.hbs`);
          if (fs.existsSync(legacy)) {
            source = fs.readFileSync(legacy, 'utf8');
          } else if (fs.existsSync(legacyFallback)) {
            source = fs.readFileSync(legacyFallback, 'utf8');
          } else {
            throw new Error(`Template ${name} not found for locale ${locale}`);
          }
        }
      }
    }
    const template = handlebars.compile(source);
    this.templateCache.set(key, template);
    return template;
  }

  /**
   * Clear the internal cache, forcing templates and partials to be reloaded on
   * the next request. Useful when templates are modified while the application
   * is running, or when unit tests need a clean state.
   */
  clearCache() {
    this.templateCache.clear();
    this.partialsLoaded = false;
  }

  /**
   * Render the HTML for a resume using the specified options. The returned
   * string is sanitized to prevent script injection. Callers are responsible for
   * converting this HTML to PDF or other formats.
   *
   * @param {Object} resume resume data
   * @param {Object} [options] rendering options
   * @param {string} [options.locale="en"] language code for translation files
   * @param {string} [options.theme="default"] theme folder name
   * @param {string} [options.brand] brand footer text
   * @param {boolean} [options.rtl] add rtl direction to the HTML element
   * @param {string} [options.watermark] optional watermark text
   * @param {Function} [options.transform] optional callback to mutate data before render
   * @returns {string} sanitized HTML string
   */
  render(resume, options = {}) {
    const opts = {
      locale: 'en',
      theme: 'default',
      brand: '',
      rtl: false,
      watermark: '',
      transform: null,
      ...options,
    };
    this.registerPartials();
    const template = this.getTemplate('default', opts.locale, opts.theme);
    const dictPath = path.join(__dirname, '..', 'locales', `${opts.locale}.json`);
    const dict = fs.existsSync(dictPath)
      ? JSON.parse(fs.readFileSync(dictPath, 'utf8'))
      : {};
    const fallback = path.join(__dirname, '..', 'locales', 'en.json');
    const fallbackDict = fs.existsSync(fallback)
      ? JSON.parse(fs.readFileSync(fallback, 'utf8'))
      : {};

    const data = { resume: { ...resume }, t: (k) => dict[k] || fallbackDict[k] || k };
    if (typeof opts.transform === 'function') {
      opts.transform(data.resume);
    }
    let html = template(data);
    html = sanitizeHtml(html);
    if (opts.brand) {
      html = html.replace('</body>', `<footer>${opts.brand}</footer></body>`);
    }
    if (opts.rtl) {
      html = html.replace('<html', '<html dir="rtl"');
    }
    if (opts.watermark) {
      html = html.replace(
        '</body>',
        `<div style="position:fixed;bottom:10px;opacity:0.5;font-size:10px">${opts.watermark}</div></body>`
      );
    }
    return html;
  }

  /**
   * List available themes by scanning the templates/themes directory.
   * @returns {string[]} array of theme names
   */
  listThemes() {
    const themesDir = path.join(__dirname, '..', 'templates', 'themes');
    if (!fs.existsSync(themesDir)) return [];
    return fs
      .readdirSync(themesDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
  }
}

// singleton export
const engine = new PDFTemplateEngine();
module.exports = engine;
