function pad2(value) {
  return String(value).padStart(2, '0');
}

export function formatLocalISODate(date) {
  return [
    date.getFullYear(),
    pad2(date.getMonth() + 1),
    pad2(date.getDate()),
  ].join('-');
}

export function parseLocalISODate(dateStr) {
  const [year, month, day] = String(dateStr).split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function addCalendarDays(dateStr, days) {
  const date = parseLocalISODate(dateStr);
  date.setDate(date.getDate() + days);
  return formatLocalISODate(date);
}

export function getMondayForCalendarWeek(dateStr) {
  const date = parseLocalISODate(dateStr);
  const dayOfWeek = date.getDay(); // 0=Sun..6=Sat
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  return addCalendarDays(dateStr, mondayOffset);
}
