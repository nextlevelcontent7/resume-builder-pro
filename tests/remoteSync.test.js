const assert = require('assert');
const remoteSyncService = require('../services/remoteSyncService');

function run() {
  // simple unit test mocking request method
  remoteSyncService.endpoint = 'http://localhost';
  let called = false;
  remoteSyncService.request = async (method, path, body) => {
    called = true;
    return { id: '123' };
  };

  remoteSyncService.pushResume({ name: 'test' }).then((id) => {
    assert.strictEqual(id, '123');
    assert(called, 'request not called');
    console.log('remote sync tests passed');
  });
}

module.exports = run;
