const fs = require('fs');
const path = require('path');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function removeFile(file) {
  if (fs.existsSync(file)) {
    fs.unlinkSync(file);
  }
}

function getExtension(file) {
  return path.extname(file).replace('.', '').toLowerCase();
}

module.exports = { ensureDir, removeFile, getExtension };
