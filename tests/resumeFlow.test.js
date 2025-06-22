const { describe, it, run, expect } = require('./helpers/testRunner');
const resumeService = require('../services/resumeService');
const sample = { title: 'My Resume', personalInfo: { name: 'John' }, updatedAt: new Date(), theme: 'classic' };

describe('Resume Service Flow', () => {
  let created;
  it('creates a resume with slug', async () => {
    created = await resumeService.create({ ...sample });
    expect.ok(created.slug);
  });

  it('lists resumes', async () => {
    const res = await resumeService.list({ page: 1, limit: 1 });
    expect.ok(Array.isArray(res.results));
  });

  it('updates a resume title', async () => {
    const upd = await resumeService.update(created._id || '1', { title: 'Updated Resume' });
    expect.ok(upd);
  });

  it('exports resume to PDF', async () => {
    const doc = { ...created, toObject: () => sample };
    const path = await resumeService.export(doc, 'en');
    expect.ok(path.includes('exports'));
  });
});

run();
