const crypto = require('crypto');

/**
 * Simple AES-256-GCM encryption and decryption helpers used for encrypting
 * sensitive fields before storage or transmission. These functions are
 * intentionally lightweight to avoid external dependencies.
 */
const ALGO = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits for GCM

function encrypt(text, secret) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = crypto.createHash('sha256').update(secret).digest();
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  let enc = cipher.update(text, 'utf8', 'base64');
  enc += cipher.final('base64');
  const tag = cipher.getAuthTag();
  return `${iv.toString('base64')}:${tag.toString('base64')}:${enc}`;
}

function decrypt(payload, secret) {
  const [ivB64, tagB64, enc] = payload.split(':');
  const iv = Buffer.from(ivB64, 'base64');
  const tag = Buffer.from(tagB64, 'base64');
  const key = crypto.createHash('sha256').update(secret).digest();
  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  let dec = decipher.update(enc, 'base64', 'utf8');
  dec += decipher.final('utf8');
  return dec;
}

module.exports = { encrypt, decrypt };
