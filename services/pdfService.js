const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const pdf = require('html-pdf');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const puppeteer = require('puppeteer');

/**
 * Very small sanitizer to strip <script> tags. In production
 * a more robust library like DOMPurify should be used.
 */
function sanitizeHtml(input) {
  return input.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
}

/**
 * Format a date range using the provided locale.
 */
function formatDateRange(start, end, locale) {
  const opts = { year: 'numeric', month: 'short' };
  const startStr = new Date(start).toLocaleDateString(locale, opts);
  const endStr = end
    ? new Date(end).toLocaleDateString(locale, opts)
    : locale.startsWith('ar')
      ? 'الآن'
      : 'Present';
  return `${startStr} - ${endStr}`;
}

/**
 * Internal helper to compile a template and return HTML.
 */
function renderHtml(resume, locale, theme) {
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

  return template({
    resume,
    t: (key) => dict[key] || key,
    formatDateRange: (s, e) => formatDateRange(s, e, locale),
  });
}

/**
 * Generate resume export in desired format.
 * Supported formats: pdf (default) and png.
 */
async function generate(resume, locale = 'en', theme = 'default', format = 'pdf', options = {}) {
  const html = sanitizeHtml(renderHtml(resume, locale, theme));

  const { watermark = true } = options;

  const exportsDir = path.join(__dirname, '..', 'exports');
  if (!fs.existsSync(exportsDir)) {
    fs.mkdirSync(exportsDir);
  }

  const filename = `resume-${resume._id}-${Date.now()}.${format}`;
  const filePath = path.join(exportsDir, filename);

  // generate base PDF using html-pdf for reliable layout
  const basePdf = await new Promise((resolve, reject) => {
    pdf.create(html, { format: 'A4', border: '10mm' }).toBuffer((err, buffer) => {
      if (err) return reject(err);
      resolve(buffer);
    });
  });

  // Use pdf-lib for post processing such as watermarking and metadata
  const doc = await PDFDocument.load(basePdf);
  doc.setTitle('Resume');
  doc.setCreator('Resume Builder Pro');
  doc.setSubject('Generated Resume');
  doc.setKeywords(['resume', 'builder', 'pdf']);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  if (watermark) {
    doc.getPages().forEach((page) => {
      const { width } = page.getSize();
      page.drawText('Resume Builder Pro', {
        x: width / 2 - 60,
        y: 20,
        font,
        size: 10,
        color: rgb(0.75, 0.75, 0.75),
        opacity: 0.5,
      });
    });
  }
  const pdfBuffer = await doc.save();

  if (format === 'pdf') {
    await fs.promises.writeFile(filePath, pdfBuffer);
    return filePath;
  }

  // convert to PNG using puppeteer for high quality rendering
  const tmpPath = filePath.replace(/\.png$/, '.pdf');
  await fs.promises.writeFile(tmpPath, pdfBuffer);

  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.goto(`file://${tmpPath}`, { waitUntil: 'networkidle0' });
    await page.screenshot({ path: filePath, fullPage: true });
  } finally {
    await browser.close();
    fs.unlinkSync(tmpPath);
  }

  return filePath;
}

const archiver = require('archiver');

/**
 * Generate a ZIP archive containing multiple resumes
 * @param {Array<Object>} resumes array of resume data
 * @returns {Promise<string>} path to created zip
 */
async function generateBulk(resumes, locale = 'en', theme = 'default') {
  const exportsDir = path.join(__dirname, '..', 'exports');
  if (!fs.existsSync(exportsDir)) {
    fs.mkdirSync(exportsDir);
  }
  const zipName = `resumes-${Date.now()}.zip`;
  const zipPath = path.join(exportsDir, zipName);
  const output = fs.createWriteStream(zipPath);
  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.pipe(output);

  for (const data of resumes) {
    const pdfPath = await generate(data, locale, theme, 'pdf');
    const base = path.basename(pdfPath);
    archive.file(pdfPath, { name: base });
  }

  await archive.finalize();
  return zipPath;
}

module.exports = { generate, generateBulk };
