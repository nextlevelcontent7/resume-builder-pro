const assert = require('assert');
const syncEngine = require('../sync');

async function run() {
  syncEngine.jwtSecret = 'test';
  syncEngine.retryAttempts = 1;
  syncEngine._request = async (m, p, b) => ({ ok: true, method: m, path: p });

  const res = await syncEngine.backupResume({ _id: '1' });
  assert.strictEqual(res.ok, true);

  const zipPath = await syncEngine.exportZip([], '/tmp/test.zip');
  assert(zipPath.includes('/tmp/test.zip'));

  console.log('sync engine tests passed');
}

module.exports = run;
