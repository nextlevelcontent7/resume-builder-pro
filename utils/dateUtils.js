function toISO(date = new Date()) {
  return date.toISOString();
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

module.exports = { toISO, addDays };
