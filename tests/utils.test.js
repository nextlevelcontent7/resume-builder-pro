const assert = require('assert');
const { stringUtils, dateUtils, printUtils, i18nUtils } = require('../utils');

function run() {
  assert.strictEqual(stringUtils.toSlug('Hello World'), 'hello-world');
  assert.strictEqual(stringUtils.truncate('abcd', 3), '...');

  const date = new Date('2020-01-01');
  assert.strictEqual(dateUtils.addDays(date, 1).getDate(), 2);

  const formatted = printUtils.paginate('a\nb\nc\nd', 2);
  assert.deepStrictEqual(formatted, ['a\nb', 'c\nd']);

  assert.strictEqual(i18nUtils.getFallbackLocale('ar-EG'), 'ar');
  assert.strictEqual(i18nUtils.getFallbackLocale('en-US'), 'en');
  const merged = i18nUtils.mergeLocales({ a: 1 }, { b: 2 });
  assert.deepStrictEqual(merged, { a: 1, b: 2 });

  console.log('utils tests passed');
}

module.exports = run;
