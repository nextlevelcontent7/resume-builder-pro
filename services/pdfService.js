const path = require('path');
const generator = require('../pdf/generator');

module.exports = {
  generate: (resume, locale = 'en', theme = 'classic', format = 'pdf', options = {}) => {
    return generator.generate(resume, { locale, layout: theme, format, ...options });
  },
  generateBulk: (resumes, locale = 'en', theme = 'classic', options = {}) => {
    return generator.generateBulk(resumes, { locale, layout: theme, ...options });
  },
  clearCache: () => generator.clearCache(),
};
