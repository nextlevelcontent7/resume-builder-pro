const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const { slugify } = require('../../utils');

/**
 * TemplateBuilder dynamically assembles resume templates using reusable blocks
 * and theme-specific styling. It supports multiple languages, RTL layout and
 * can inject placeholders for missing data. The output is standards compliant
 * HTML ready for PDF conversion.
 */
class TemplateBuilder {
  constructor() {
    this.blockCache = new Map();
    this.themeCache = new Map();
  }

  /**
   * Compile a Handlebars template from disk. Results are cached to avoid
   * redundant disk reads on consecutive calls.
   * @param {string} file absolute file path
   * @returns {Function} compiled template function
   */
  loadTemplate(file) {
    if (this.blockCache.has(file)) return this.blockCache.get(file);
    const tpl = fs.readFileSync(file, 'utf8');
    const compiled = Handlebars.compile(tpl);
    this.blockCache.set(file, compiled);
    return compiled;
  }

  /**
   * Load a theme style file. Themes are simple CSS snippets that control
   * fonts, colors and spacing. They are inlined into the generated HTML.
   * @param {string} name theme file name
   */
  loadTheme(name) {
    const themePath = path.join(__dirname, '..', 'themes', `${name}.css`);
    if (!fs.existsSync(themePath)) return '';
    if (this.themeCache.has(themePath)) return this.themeCache.get(themePath);
    const css = fs.readFileSync(themePath, 'utf8');
    this.themeCache.set(themePath, css);
    return css;
  }

  /**
   * Build a resume HTML string given structured data.
   * @param {Object} data resume fields
   * @param {Object} opts builder options
   * @returns {string} complete HTML document
   */
  build(data = {}, opts = {}) {
    const { theme = 'modern', language = 'en', layout = 'single', icons = true } = opts;
    const css = this.loadTheme(theme);
    const head = `<style>${css}</style>`;
    const body = [
      this.renderBlock('header', data, { language, icons }),
      this.renderBlock('summary', data, { language }),
      this.renderBlock('experience', data, { language }),
      this.renderBlock('education', data, { language }),
      this.renderBlock('skills', data, { language }),
      this.renderBlock('languages', data, { language }),
      this.renderBlock('certifications', data, { language })
    ].join('\n');

    return `<!DOCTYPE html><html lang="${language}" dir="${language === 'ar' ? 'rtl' : 'ltr'}"><head>${head}</head><body class="${layout}">${body}</body></html>`;
  }

  /**
   * Render a single block by name. Block templates reside in the blocks
   * directory and may use Handlebars syntax to consume the resume data.
   */
  renderBlock(name, data, opts = {}) {
    const file = path.join(__dirname, '..', 'blocks', `${name}.hbs`);
    const tpl = this.loadTemplate(file);
    const context = Object.assign({ utils: { slugify } }, data, opts);
    return tpl(context);
  }
}

module.exports = new TemplateBuilder();
