/**
 * Validate that a string is a valid MongoDB ObjectId.
 */
function isObjectId(id) {
  return /^[a-f\d]{24}$/i.test(id);
}

/**
 * Simple email validation using RFC compliant regex
 */
function isEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * E.164 phone validation
 */
function isPhone(phone) {
  return /^\+?[1-9]\d{9,14}$/.test(phone);
}

module.exports = { isObjectId, isEmail, isPhone };
