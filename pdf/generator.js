const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const puppeteer = require('puppeteer');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fileUtils = require('../utils/fileUtils');
const engine = require('../utils/pdfTemplateEngine');

/**
 * Generate PDFs with custom templates and branding. This module supports
 * multiple layouts, RTL rendering, watermark and logo injection. It relies on
 * Puppeteer for accurate HTML rendering and pdf-lib for post-processing such
 * as watermarking and metadata embedding.
 */
class PDFGenerator {
  constructor() {
    this.cache = new Map();
  }

  /**
   * Render resume HTML using the template engine with the given options.
   * @param {Object} resume structured resume data
   * @param {Object} opts rendering options
   * @returns {string} sanitized HTML
   */
  buildHtml(resume, opts) {
    return engine.render(resume, {
      locale: opts.locale,
      theme: opts.layout,
      brand: opts.brand,
      rtl: opts.rtl,
      watermark: opts.watermarkText,
      transform(data) {
        if (opts.logo) {
          data.logo = opts.logo;
        }
      }
    });
  }

  /**
   * Generate a PDF or PNG from resume data.
   * @param {Object} resume resume document
   * @param {Object} options generation options
   * @param {string} [options.locale] language code
   * @param {string} [options.layout] template layout
   * @param {string} [options.format] 'pdf' or 'png'
   * @param {boolean} [options.watermark] include watermark
   * @param {string} [options.watermarkText] watermark text
   * @param {string} [options.logo] path to logo image
   * @param {boolean} [options.rtl] enable rtl direction
   * @param {string} [options.brand] footer brand text
   * @param {string} [options.orientation] portrait or landscape
   * @returns {Promise<string>} path to generated file
   */
  async generate(resume, options = {}) {
    const opts = Object.assign({
      locale: 'en',
      layout: 'classic',
      format: 'pdf',
      watermark: false,
      watermarkText: 'Resume Builder Pro',
      orientation: 'portrait',
      rtl: false,
      brand: '',
      logo: null
    }, options);

    const html = this.buildHtml(resume, opts);

    const key = crypto.createHash('md5')
      .update(JSON.stringify({ resume: resume.updatedAt, opts }))
      .digest('hex');

    const exportsDir = path.join(__dirname, '..', 'exports');
    fileUtils.ensureDir(exportsDir);

    const fileName = `resume-${resume._id}-${Date.now()}.${opts.format}`;
    const filePath = path.join(exportsDir, fileName);

    if (this.cache.has(key)) return this.cache.get(key);

    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    let pdfBuffer;
    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        landscape: opts.orientation === 'landscape'
      });
    } finally {
      await browser.close();
    }

    const doc = await PDFDocument.load(pdfBuffer);
    doc.setCreator('Resume Builder Pro');
    doc.setTitle(`${resume.personalInfo.name} Resume`);
    doc.setSubject('Generated Resume');
    doc.setKeywords(['resume', 'builder', opts.layout]);
    const font = await doc.embedFont(StandardFonts.Helvetica);

    if (opts.watermark) {
      doc.getPages().forEach(page => {
        const { width } = page.getSize();
        page.drawText(opts.watermarkText, {
          x: width / 2 - 50,
          y: 30,
          size: 12,
          font,
          color: rgb(0.75, 0.75, 0.75),
          opacity: 0.5
        });
      });
    }

    if (opts.logo && fs.existsSync(opts.logo)) {
      const png = await fs.promises.readFile(opts.logo);
      const pngImage = await doc.embedPng(png);
      const pages = doc.getPages();
      pages.forEach(page => {
        const { width, height } = page.getSize();
        page.drawImage(pngImage, {
          x: width - 120,
          y: height - 80,
          width: 100,
          height: 50,
          opacity: 0.8
        });
      });
    }

    pdfBuffer = await doc.save();
    await fs.promises.writeFile(filePath, pdfBuffer);

    if (opts.format === 'png') {
      const tmpPdf = filePath.replace(/\.png$/, '.pdf');
      await fs.promises.writeFile(tmpPdf, pdfBuffer);
      const browser2 = await puppeteer.launch({ args: ['--no-sandbox'] });
      try {
        const page = await browser2.newPage();
        await page.goto(`file://${tmpPdf}`, { waitUntil: 'networkidle0' });
        await page.screenshot({ path: filePath, fullPage: true });
      } finally {
        await browser2.close();
        fs.unlinkSync(tmpPdf);
      }
    }

    this.cache.set(key, filePath);
    return filePath;
  }

  /**
   * Generate a ZIP archive of multiple resumes.
   * @param {Object[]} resumes resumes to export
   * @param {Object} options generation options
   * @returns {Promise<string>} path to zip archive
   */
  async generateBulk(resumes, options = {}) {
    const archiver = require('archiver');
    const opts = Object.assign({ layout: 'classic', locale: 'en' }, options);
    const exportsDir = path.join(__dirname, '..', 'exports');
    fileUtils.ensureDir(exportsDir);
    const zipPath = path.join(exportsDir, `resumes-${Date.now()}.zip`);
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(output);
    for (const res of resumes) {
      const pdfPath = await this.generate(res, opts);
      archive.file(pdfPath, { name: path.basename(pdfPath) });
    }
    await archive.finalize();
    return zipPath;
  }

  clearCache() {
    this.cache.clear();
  }
}

module.exports = new PDFGenerator();
