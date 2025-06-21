function isNonEmptyString(val) {
  return typeof val === 'string' && val.trim().length > 0;
}

function isPositiveInteger(val) {
  return Number.isInteger(val) && val > 0;
}

function isBoolean(val) {
  return typeof val === 'boolean';
}

function isDate(val) {
  return !isNaN(Date.parse(val));
}

function isPostalCode(code, locale = 'US') {
  if (locale === 'US') {
    return /^\d{5}(?:-\d{4})?$/.test(code);
  }
  if (locale === 'CA') {
    return /^[A-Za-z]\d[A-Za-z] \d[A-Za-z]\d$/.test(code);
  }
  return typeof code === 'string' && code.length > 0;
}

function isStrongPassword(pwd, opts = { minLength: 8, hasNumber: true, hasSymbol: true }) {
  if (typeof pwd !== 'string' || pwd.length < opts.minLength) return false;
  if (opts.hasNumber && !/\d/.test(pwd)) return false;
  if (opts.hasSymbol && !/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) return false;
  return /[A-Z]/.test(pwd) && /[a-z]/.test(pwd);
}

module.exports = {
  isNonEmptyString,
  isPositiveInteger,
  isBoolean,
  isDate,
  isPostalCode,
  isStrongPassword,
};
