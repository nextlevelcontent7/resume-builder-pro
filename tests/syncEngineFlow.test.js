const { describe, it, run, expect } = require('./helpers/testRunner');
const SyncEngine = require('../sync/syncEngine');

const engine = new SyncEngine({ jwtSecret: 'secret', retryAttempts: 1 });
engine._request = async (method, path, body) => ({ ok: true, method, path, body });

describe('Sync Engine', () => {
  it('backs up a resume', async () => {
    const res = await engine.backupResume({ _id: '1', name: 'Test' });
    expect.strictEqual(res.ok, true);
  });

  it('restores a resume', async () => {
    const res = await engine.restore('1');
    expect.strictEqual(res.ok, true);
  });

  it('exports zip', async () => {
    const zip = await engine.exportZip([], '/tmp/out.zip');
    expect.ok(zip.includes('out.zip'));
  });
});

run();
