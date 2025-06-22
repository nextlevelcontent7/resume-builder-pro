const TemplateBuilder = require('../template-ai/engine/TemplateBuilder');
const TemplateExporter = require('../template-ai/export/TemplateExporter');

module.exports = async () => {
  const html = TemplateBuilder.build({ name: 'John Doe', summary: 'A tester' });
  if (!html.includes('John Doe')) throw new Error('name missing');
  const pdf = await TemplateExporter.htmlToPdf(html);
  if (!Buffer.isBuffer(pdf)) throw new Error('pdf not buffer');
  console.log('template ai test passed');
};
