const assert = require('assert');
const { validators } = require('../utils');

function run() {
  assert(validators.isEmail('test@example.com'), 'Valid email failed');
  assert(!validators.isEmail('bad-email'), 'Invalid email passed');
  assert(validators.isPhone('+1234567890'), 'Valid phone failed');
  assert(!validators.isPhone('123'), 'Invalid phone passed');
  console.log('All tests passed');
}

run();
