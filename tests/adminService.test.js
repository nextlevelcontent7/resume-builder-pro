const assert = require('assert');
const adminService = require('../services/adminService');

function run() {
  const features = adminService.listFeatures();
  assert(features && typeof features === 'object', 'features missing');
  console.log('adminService tests passed');
}

module.exports = run;
