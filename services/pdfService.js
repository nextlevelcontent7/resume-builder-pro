const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const pdf = require('html-pdf');

// Format date ranges in a locale-aware manner
function formatDateRange(start, end, locale) {
  const opts = { year: 'numeric', month: 'short' };
  const startStr = new Date(start).toLocaleDateString(locale, opts);
  const endStr = end ? new Date(end).toLocaleDateString(locale, opts) :
    (locale.startsWith('ar') ? 'الآن' : 'Present');
  return `${startStr} - ${endStr}`;
}

// Generate a PDF from resume data and chosen template
async function generate(resume, locale = 'en', theme = 'default') {
  const templateName = `${theme}_${locale}.hbs`;
  const templatePath = path.join(__dirname, '..', 'templates', templateName);
  if (!fs.existsSync(templatePath)) {
    // fallback to English template if not found
    const fallback = `${theme}_en.hbs`;
    if (!fs.existsSync(path.join(__dirname, '..', 'templates', fallback))) {
      throw new Error('Template not found');
    }
    locale = 'en';
  }

  const dict = require(path.join('..', 'locales', `${locale}.json`));
  const source = fs.readFileSync(templatePath, 'utf8');
  const template = handlebars.compile(source);

  const html = template({
    resume,
    t: (key) => dict[key] || key,
    formatDateRange: (s, e) => formatDateRange(s, e, locale),
  });

  const exportsDir = path.join(__dirname, '..', 'exports');
  if (!fs.existsSync(exportsDir)) {
    fs.mkdirSync(exportsDir);
  }

  const filename = `resume-${resume._id}-${Date.now()}.pdf`;
  const filePath = path.join(exportsDir, filename);

  return new Promise((resolve, reject) => {
    pdf.create(html).toFile(filePath, (err) => {
      if (err) return reject(err);
      resolve(filePath);
    });
  });
}

module.exports = { generate };
