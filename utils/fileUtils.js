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

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function copy(src, dest) {
  fs.copyFileSync(src, dest);
}

module.exports = { ensureDir, removeFile, getExtension, readJson, writeJson, copy };
