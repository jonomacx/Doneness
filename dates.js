// dateRequired is stored as a calendar day in the form "YYYY-MM-DDT00:00:00.000Z".
// Use the local calendar day, so "today" doesn't lag behind during UK summer time.
const toDay = (date) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T00:00:00.000Z`;
};

const today = () => toDay(new Date());
const tomorrow = () => toDay(new Date(Date.now() + 864e5));

module.exports = { toDay, today, tomorrow };
