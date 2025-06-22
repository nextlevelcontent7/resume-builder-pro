const assert = require('assert');
const fs = require('fs');
const path = require('path');
const {
  stringUtils,
  dateUtils,
  printUtils,
  i18nUtils,
  validators,
  encryptionUtils,
  validationUtils,
  slugify,
  resumeCompleteness,
  inputNormalizer,
  zipExporter,
  pdfTemplateEngine,
} = require('../utils');

async function run() {
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
  assert(validationUtils.isSlug('test-slug'), 'Valid slug failed');
  assert(!validationUtils.isSlug('Bad Slug!'), 'Invalid slug passed');

  // slugify advanced options
  assert.strictEqual(slugify('Árbol Espécial', { limit: 10 }), 'arbol-espe');

  const resume = {
    personalInfo: { name: 'John' },
    summary: 'Test',
    experience: [{}],
    education: [],
  };
  const { score } = resumeCompleteness.calculate(resume);
  assert(score < 100 && score > 0, 'Score out of range');

  const normalized = inputNormalizer.normalizePhone(' (123) 555-0000 ');
  assert.strictEqual(normalized, '1235550000');

  const tmpZip = path.join(__dirname, 'tmp.zip');
  const file = path.join(__dirname, 'sample.txt');
  fs.writeFileSync(file, 'sample');
  await zipExporter.createZip([file], tmpZip, { brand: 'test' });
  assert(fs.existsSync(tmpZip), 'zip not created');
  fs.unlinkSync(file); fs.unlinkSync(tmpZip);

  const html = pdfTemplateEngine.render({ personalInfo: { name: 'A' } });
  assert(/<html/.test(html), 'html not generated');

  console.log('utils tests passed');
}

module.exports = run;
