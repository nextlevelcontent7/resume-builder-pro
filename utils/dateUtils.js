function toISO(date = new Date()) {
  return date.toISOString();
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function diffInDays(a, b) {
  const diff = Math.abs(new Date(a) - new Date(b));
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function format(date, locale = 'en') {
  return new Date(date).toLocaleDateString(locale);
}

module.exports = { toISO, addDays, diffInDays, format };
