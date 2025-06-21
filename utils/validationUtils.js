function isNonEmptyString(val) {
  return typeof val === 'string' && val.trim().length > 0;
}

function isPositiveInteger(val) {
  return Number.isInteger(val) && val > 0;
}

module.exports = { isNonEmptyString, isPositiveInteger };
