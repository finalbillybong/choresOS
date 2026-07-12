import assert from 'node:assert/strict';
import test from 'node:test';

import {
  addCalendarDays,
  formatLocalISODate,
  getMondayForCalendarWeek,
} from './calendarDates.js';

test('calendar helpers keep local dates stable in Europe/Warsaw', () => {
  process.env.TZ = 'Europe/Warsaw';

  assert.equal(formatLocalISODate(new Date(2026, 6, 5)), '2026-07-05');
  assert.equal(addCalendarDays('2026-07-05', -6), '2026-06-29');
  assert.equal(getMondayForCalendarWeek('2026-07-05'), '2026-06-29');
});

test('calendar helpers return the same date when the window starts on Monday', () => {
  process.env.TZ = 'Europe/Warsaw';

  assert.equal(getMondayForCalendarWeek('2026-06-29'), '2026-06-29');
  assert.equal(addCalendarDays('2026-06-29', 6), '2026-07-05');
});
