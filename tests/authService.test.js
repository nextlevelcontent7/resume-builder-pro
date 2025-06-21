const assert = require('assert');
const authService = require('../services/authService');

function run() {
  const dummyUser = { _id: '123', role: 'user', refreshTokens: [] , save(){} };
  const access = authService.generateAccessToken(dummyUser);
  const refresh = authService.generateRefreshToken(dummyUser);
  assert(access && refresh, 'tokens missing');
  const access2 = authService.refresh(refresh);
  if (access2 instanceof Promise) {
    access2.then(token => {
      assert(token, 'refresh failed');
      console.log('authService tests passed');
    });
  }
}

module.exports = run;
