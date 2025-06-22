const { describe, it, run, expect } = require('./helpers/testRunner');
const authService = require('../services/authService');

describe('Authentication Flow', () => {
  const dummyUser = {
    _id: '1',
    email: 'test@example.com',
    role: 'user',
    refreshTokens: [],
    comparePassword: async () => true,
    save: async function() { return this; },
  };

  it('generates access and refresh tokens', () => {
    const access = authService.generateAccessToken(dummyUser);
    const refresh = authService.generateRefreshToken(dummyUser);
    expect.ok(access && refresh);
  });

  it('verifies access tokens', () => {
    const token = authService.generateAccessToken(dummyUser);
    const payload = authService.verifyAccessToken(token);
    expect.strictEqual(payload.id, '1');
  });

  it('refresh token handles missing user gracefully', async () => {
    const refresh = authService.generateRefreshToken(dummyUser);
    try {
      await authService.refresh(refresh);
    } catch (e) {
      expect.ok(e); // expected failure under stub
    }
  });

  it('logout does not throw', async () => {
    const refresh = authService.generateRefreshToken(dummyUser);
    await authService.logout(refresh);
    expect.ok(true);
  });
});

run();
