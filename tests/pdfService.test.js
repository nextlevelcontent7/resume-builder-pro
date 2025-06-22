const { describe, it, run, expect } = require('./helpers/testRunner');
const pdfService = require('../services/pdfService');
const fs = require('fs');

describe('PDF Generation', () => {
  it('generates a PDF file', async () => {
    const resume = { _id: '1', personalInfo: { name: 'John' }, updatedAt: new Date(), theme: 'classic' };
    const file = await pdfService.generate(resume, 'en');
    expect.ok(fs.existsSync(file));
  });

  it('generates a bulk zip', async () => {
    const resumes = [
      { _id: '1', personalInfo: { name: 'John' }, updatedAt: new Date(), theme: 'classic' },
      { _id: '2', personalInfo: { name: 'Jane' }, updatedAt: new Date(), theme: 'modern' }
    ];
    const zip = await pdfService.generateBulk(resumes);
    expect.ok(zip.includes('.zip'));
  });
});

run();
