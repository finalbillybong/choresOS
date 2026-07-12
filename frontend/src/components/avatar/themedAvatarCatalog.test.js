import test from 'node:test';
import assert from 'node:assert/strict';

import {
  SAFE_THEME_COLLECTIONS,
  THEMED_AVATAR_OPTIONS,
  THEMED_AVATAR_ITEM_IDS,
} from './themedAvatarCatalog.js';

const DISALLOWED_BRAND_TERMS = [
  'blackpink',
  'black pink',
  'hello kitty',
  'kuromi',
  'huntrix',
  'huntr/x',
];

test('safe avatar collections provide four themed packs without brand names', () => {
  assert.equal(SAFE_THEME_COLLECTIONS.length, 4);
  assert.deepEqual(
    SAFE_THEME_COLLECTIONS.map((collection) => collection.id),
    ['neon_pop_idol', 'shadow_hunter', 'sweet_kitty', 'midnight_mischief'],
  );

  const visibleText = SAFE_THEME_COLLECTIONS
    .flatMap((collection) => [
      collection.title,
      collection.description,
      ...collection.items.map((item) => item.label),
    ])
    .join(' ')
    .toLowerCase();

  for (const term of DISALLOWED_BRAND_TERMS) {
    assert.equal(visibleText.includes(term), false, `unexpected branded term: ${term}`);
  }
});

test('themed avatar item ids are available in editor option groups', () => {
  assert.ok(THEMED_AVATAR_ITEM_IDS.length >= 14);

  const optionIds = new Set(
    Object.values(THEMED_AVATAR_OPTIONS)
      .flat()
      .map((option) => option.id),
  );

  for (const itemId of THEMED_AVATAR_ITEM_IDS) {
    assert.equal(optionIds.has(itemId), true, `missing editor option for ${itemId}`);
  }
});
