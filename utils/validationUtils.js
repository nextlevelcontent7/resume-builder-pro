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

module.exports = { isNonEmptyString, isPositiveInteger, isBoolean, isDate };
