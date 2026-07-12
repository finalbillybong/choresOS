import assert from 'node:assert/strict';
import test from 'node:test';

import {
  calculateBadBehaviorPreview,
  normalizeBehaviorTitle,
} from './badBehaviorPenalty.js';

test('normalizeBehaviorTitle collapses whitespace and casing', () => {
  assert.equal(
    normalizeBehaviorTitle('  Krzyk   przy STOLE  '),
    'krzyk przy stole'
  );
});

test('calculateBadBehaviorPreview shows the next fifth-repeat bonus', () => {
  const preview = calculateBadBehaviorPreview({
    previousCount: 4,
    basePenalty: 20,
  });

  assert.equal(preview.nextOccurrenceCount, 5);
  assert.equal(preview.bonusWillTrigger, true);
  assert.equal(preview.repetitionsUntilBonus, 1);
  assert.equal(preview.bonusMinPenalty, 10);
  assert.equal(preview.bonusMaxPenalty, 40);
});

test('calculateBadBehaviorPreview counts from an already-triggered repeat', () => {
  const preview = calculateBadBehaviorPreview({
    previousCount: 5,
    basePenalty: 15,
  });

  assert.equal(preview.nextOccurrenceCount, 6);
  assert.equal(preview.bonusWillTrigger, false);
  assert.equal(preview.repetitionsUntilBonus, 5);
  assert.equal(preview.nextBonusAt, 10);
});
