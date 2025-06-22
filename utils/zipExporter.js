'use strict';

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

/**
 * ZIP exporter capable of branding file names and injecting watermark files.
 * Returns the destination path once the archive is fully written.
 *
 * @param {string[]} files absolute file paths to include
 * @param {string} dest destination archive path
 * @param {object} [options]
 * @param {string} [options.brand] prefix to add to file names inside archive
 * @param {string} [options.watermark] watermark text file content
 * @param {string} [options.root] folder name inside archive
 * @returns {Promise<string>} archive file path
 */
async function createZip(files, dest, options = {}) {
  await fs.promises.mkdir(path.dirname(dest), { recursive: true });
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(dest);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => resolve(dest));
    if (typeof archive.on === 'function') archive.on('error', reject);
    archive.pipe(output);

    const root = options.root ? `${options.root.replace(/\/+$/, '')}/` : '';

    for (const file of files) {
      const name = path.basename(file);
      const branded = options.brand ? `${options.brand}-${name}` : name;
      archive.file(file, { name: `${root}${branded}` });
    }

    if (options.watermark) {
      archive.append(options.watermark, { name: `${root}WATERMARK.txt` });
    }

    const finalize = archive.finalize();
    if (finalize && typeof finalize.then === 'function') {
      finalize.then(() => output.end()).catch(reject);
    } else {
      output.end();
    }
  });
}

module.exports = { createZip };
