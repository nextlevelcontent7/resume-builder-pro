const assert = require('assert');
const { stringUtils, dateUtils, printUtils, i18nUtils, validators, encryptionUtils } = require('../utils');

function run() {
  assert.strictEqual(stringUtils.toSlug('Hello World'), 'hello-world');
  assert.strictEqual(stringUtils.truncate('abcd', 3), '...');
  assert.strictEqual(stringUtils.camelCase('hello world'), 'helloWorld');

  const date = new Date('2020-01-01');
  assert.strictEqual(dateUtils.addDays(date, 1).getDate(), 2);
  assert.strictEqual(dateUtils.diffInDays('2020-01-01', '2020-01-05'), 4);

  const formatted = printUtils.paginate('a\nb\nc\nd', 2);
  assert.deepStrictEqual(formatted, ['a\nb', 'c\nd']);

  assert.strictEqual(i18nUtils.getFallbackLocale('ar-EG'), 'ar');
  assert.strictEqual(i18nUtils.getFallbackLocale('en-US'), 'en');
  const merged = i18nUtils.mergeLocales({ a: 1 }, { b: 2 });
  assert.deepStrictEqual(merged, { a: 1, b: 2 });

  const secret = 'test';
  const encrypted = encryptionUtils.encrypt('hello', secret);
  const decrypted = encryptionUtils.decrypt(encrypted, secret);
  assert.strictEqual(decrypted, 'hello');

  assert(validators.isURL('http://example.com'), 'Valid URL failed');
  assert(!validators.isURL('bad_url'), 'Invalid URL passed');
  assert(validators.isPostalCode('12345'), 'Valid US postal code failed');
  assert(validators.isPostalCode('A1A 1A1', 'CA'), 'Valid CA postal code failed');
  assert(!validators.isPostalCode('zzz'), 'Invalid postal code passed');
  assert(validators.isStrongPassword('Aa1!aaaa'), 'Strong password check failed');
  assert(!validators.isStrongPassword('weak'), 'Weak password passed');
  console.log('utils tests passed');
}

module.exports = run;
