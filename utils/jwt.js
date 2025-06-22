const crypto = require('crypto');

function base64url(input) {
  return Buffer.from(input).toString('base64url');
}

function sign(payload, secret, options = {}) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const exp = options.expiresIn
    ? Math.floor(Date.now() / 1000) + parseExp(options.expiresIn)
    : undefined;
  const body = exp ? { ...payload, exp } : payload;
  const token = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(body))}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(token)
    .digest('base64url');
  return `${token}.${signature}`;
}

function verify(token, secret) {
  const [headerB, payloadB, signature] = token.split('.');
  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${headerB}.${payloadB}`)
    .digest('base64url');
  if (expected !== signature) throw new Error('invalid signature');
  const payload = JSON.parse(Buffer.from(payloadB, 'base64url').toString());
  if (payload.exp && Date.now() / 1000 > payload.exp) throw new Error('token expired');
  return payload;
}

function parseExp(str) {
  if (typeof str === 'number') return str;
  const match = /^(\d+)([smhd])$/.exec(str);
  if (!match) throw new Error('invalid expiresIn');
  const num = parseInt(match[1], 10);
  const unit = match[2];
  return unit === 's' ? num : unit === 'm' ? num * 60 : unit === 'h' ? num * 3600 : num * 86400;
}

module.exports = { sign, verify };
