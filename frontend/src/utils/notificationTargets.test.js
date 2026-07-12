import assert from 'node:assert/strict';
import test from 'node:test';

import { getNotificationTarget } from './notificationTargets.js';

test('notification targets route chore references to the chore detail page', () => {
  assert.deepEqual(
    getNotificationTarget({
      type: 'chore_assigned',
      reference_type: 'chore',
      reference_id: 42,
    }),
    { path: '/chores/42', label: 'Open quest' },
  );
});

test('notification targets route assignment and trade references to focused calendar entries', () => {
  assert.deepEqual(
    getNotificationTarget({
      type: 'chore_completed',
      reference_type: 'chore_assignment',
      reference_id: 17,
    }),
    { path: '/calendar?assignment=17', label: 'Open assignment' },
  );

  assert.deepEqual(
    getNotificationTarget({
      type: 'trade_accepted',
      reference_type: 'trade',
      reference_id: 18,
    }),
    { path: '/calendar?assignment=18', label: 'Open assignment' },
  );
});

test('notification targets route reward and social notifications to existing detail areas', () => {
  assert.deepEqual(
    getNotificationTarget({
      type: 'reward_approved',
      reference_type: 'redemption',
      reference_id: 5,
    }),
    { path: '/rewards?tab=inventory&redemption=5', label: 'Open reward' },
  );

  assert.deepEqual(
    getNotificationTarget({
      type: 'announcement',
      reference_type: 'announcement',
    }),
    { path: '/party', label: 'Open party' },
  );
});

test('notification targets provide useful fallbacks when references are missing', () => {
  assert.deepEqual(
    getNotificationTarget({ type: 'avatar_item_drop' }),
    { path: '/rewards?tab=avatar', label: 'Open avatar shop' },
  );

  assert.deepEqual(
    getNotificationTarget({ type: 'achievement_unlocked' }),
    { path: '/profile?section=achievements', label: 'Open profile' },
  );
});
