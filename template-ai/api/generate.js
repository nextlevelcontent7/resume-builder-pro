const router = require('express').Router();
const TemplateBuilder = require('../engine/TemplateBuilder');
const TemplateExporter = require('../export/TemplateExporter');
const { success } = require('../../utils/formatResponse');
const fs = require('fs');
const path = require('path');

const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// POST /api/templates/generate
router.post('/generate', asyncHandler(async (req, res) => {
  const data = req.body || {};
  const { style = 'modern', language = 'en' } = req.query;
  const html = TemplateBuilder.build(data, { theme: style, language });
  const buffer = await TemplateExporter.htmlToPdf(html);
  const outDir = path.join(__dirname, '..', '..', 'exports');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const filename = `template-${Date.now()}.pdf`;
  fs.writeFileSync(path.join(outDir, filename), buffer);
  res.json(success(req, 'generated', { file: `/exports/${filename}` }));
}));

module.exports = router;
