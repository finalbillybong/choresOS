import assert from 'node:assert/strict';
import test from 'node:test';

import { isQuestCalendarEntry } from './calendarEntries.js';

test('isQuestCalendarEntry keeps legacy and assignment calendar items as quests', () => {
  assert.equal(isQuestCalendarEntry({ id: 1 }), true);
  assert.equal(isQuestCalendarEntry({ entry_type: 'assignment', id: 2 }), true);
});

test('isQuestCalendarEntry excludes bad behavior calendar items from quest lists', () => {
  assert.equal(
    isQuestCalendarEntry({ entry_type: 'bad_behavior', id: 'bad_behavior-3' }),
    false
  );
});
