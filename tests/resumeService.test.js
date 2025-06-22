const assert = require('assert');
const resumeService = require('../services/resumeService');

function run() {
  const list = resumeService.list({ page: 1, limit: 1 });
  assert(list instanceof Promise, 'list should return promise');
  console.log('resumeService tests passed');
}

module.exports = run;
