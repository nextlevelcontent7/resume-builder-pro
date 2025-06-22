const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

/**
 * Create a ZIP archive with optional branding and watermark text file.
 * @param {string[]} files absolute paths to include
 * @param {string} dest destination zip path
 * @param {{brand?:string, watermark?:string}} options
 */
async function createZip(files, dest, options = {}) {
  await fs.promises.mkdir(path.dirname(dest), { recursive: true });
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(dest);
    const archive = archiver('zip', { zlib: { level: 9 } });
    output.on('close', () => resolve(dest));
    output.on('error', reject);
    archive.pipe(output);
    for (const f of files) {
      const name = options.brand ? `${options.brand}-${path.basename(f)}` : path.basename(f);
      archive.file(f, { name });
    }
    if (options.watermark) {
      archive.append(options.watermark, { name: 'WATERMARK.txt' });
    }
    archive.finalize();
    output.end();
  });
}

module.exports = { createZip };
