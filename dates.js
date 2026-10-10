// dateRequired is stored as a calendar day in the form "YYYY-MM-DDT00:00:00.000Z".
// Use the local calendar day, so "today" doesn't lag behind during UK summer time.
const toDay = (date) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T00:00:00.000Z`;
};

const today = () => toDay(new Date());
const tomorrow = () => toDay(new Date(Date.now() + 864e5));
const daysFromNow = (n) => toDay(new Date(Date.now() + n * 864e5));

// "2026-10-09T00:00:00.000Z" -> "9 Oct 2026"
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const formatDay = (day) => {
  const [y, m, d] = day.slice(0, 10).split('-');
  return `${Number(d)} ${MONTHS[Number(m) - 1]} ${y}`;
};

// For real timestamps like dateCreated: the local calendar day it happened on
const formatTimestamp = (iso) => formatDay(toDay(new Date(iso)));

module.exports = { toDay, today, tomorrow, daysFromNow, formatDay, formatTimestamp };
