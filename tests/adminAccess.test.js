const { describe, it, run, expect } = require('./helpers/testRunner');
const adminOnly = require('../middlewares/adminOnly');

function exec(user, headers = {}) {
  let status;
  const req = { user, headers };
  const res = { status(c){ status = c; return this; }, json(){ return { status }; } };
  let nextCalled = false;
  adminOnly(req,res,()=>{ nextCalled = true; });
  return { status, nextCalled };
}

describe('adminOnly middleware', () => {
  it('allows admin role', () => {
    process.env.ADMIN_OVERRIDE_TOKEN = 'tok';
    const { nextCalled } = exec({ id:'1', role:'admin' });
    expect.ok(nextCalled);
  });

  it('denies non-admin user', () => {
    process.env.ADMIN_OVERRIDE_TOKEN = 'tok';
    const res = exec({ id:'1', role:'user' });
    expect.strictEqual(res.status, 403);
  });

  it('allows override header', () => {
    process.env.ADMIN_OVERRIDE_HEADER = 'x-admin';
    process.env.ADMIN_OVERRIDE_TOKEN = 'secret';
    const res = exec({ id:'1', role:'user' }, { 'x-admin':'secret' });
    expect.ok(res.nextCalled);
  });
});

run();
