const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const puppeteer = require('puppeteer');

/**
 * TemplateExporter converts generated HTML templates into PDF files using
 * Puppeteer. It can also package multiple templates into a single ZIP archive
 * for download.
 */
class TemplateExporter {
  /**
   * Convert HTML string into a PDF buffer.
   * @param {string} html markup to convert
   */
  async htmlToPdf(html) {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const buffer = await page.pdf({ format: 'A4' });
    await browser.close();
    return buffer;
  }

  /**
   * Write multiple PDFs to a ZIP archive and return the path.
   * @param {Array<{name:string, buffer:Buffer}>} files list of PDF buffers
   * @param {string} outDir directory where the archive is stored
   */
  async exportZip(files, outDir) {
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    const zipPath = path.join(outDir, `templates-${Date.now()}.zip`);
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.pipe(output);
    for (const file of files) {
      archive.append(file.buffer, { name: `${file.name}.pdf` });
    }
    await archive.finalize();
    return zipPath;
  }
}

module.exports = new TemplateExporter();
