import test from 'node:test';
import assert from 'node:assert/strict';

import { buildAvatarPalette, mixHex } from './avatarPaint.js';


test('mixHex creates stable lighter and darker colours', () => {
  assert.equal(mixHex('#000000', '#ffffff', 0.5), '#808080');
  assert.equal(mixHex('#ffffff', '#000000', 0.25), '#bfbfbf');
});

test('mixHex supports shorthand colours and clamps the mix amount', () => {
  assert.equal(mixHex('#000', '#fff', 2), '#ffffff');
  assert.equal(mixHex('#fff', '#000', -1), '#ffffff');
});

test('avatar palette preserves base user colours', () => {
  const palette = buildAvatarPalette({
    head_color: '#c68642',
    hair_color: '#4a3728',
  });

  assert.equal(palette.skin.base, '#c68642');
  assert.equal(palette.hair.base, '#4a3728');
  assert.notEqual(palette.skin.light, palette.skin.base);
  assert.notEqual(palette.skin.shadow, palette.skin.base);
});
