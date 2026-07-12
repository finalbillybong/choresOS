import test from 'node:test';
import assert from 'node:assert/strict';

import {
  SPECIAL_THEMES,
  canManageSpecialTheme,
  resolveEffectiveTheme,
} from './themeResolver.js';


test('special theme overrides a personal theme', () => {
  assert.equal(resolveEffectiveTheme('forest', 'christmas'), 'christmas');
  assert.equal(resolveEffectiveTheme('rose', 'easter'), 'easter');
});

test('none restores the personal theme', () => {
  assert.equal(resolveEffectiveTheme('galaxy', 'none'), 'galaxy');
});

test('invalid values fall back safely', () => {
  assert.equal(resolveEffectiveTheme('unknown', 'none'), 'default');
  assert.equal(resolveEffectiveTheme('forest', 'unknown'), 'forest');
});

test('only parents and admins manage special themes', () => {
  assert.equal(canManageSpecialTheme('kid'), false);
  assert.equal(canManageSpecialTheme('parent'), true);
  assert.equal(canManageSpecialTheme('admin'), true);
  assert.deepEqual(SPECIAL_THEMES.map(({ id }) => id), ['none', 'easter', 'christmas']);
});
