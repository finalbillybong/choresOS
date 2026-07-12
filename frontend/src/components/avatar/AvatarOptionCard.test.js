import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';


test('option cards show a real avatar preview and accessible state', () => {
  const source = readFileSync(
    new URL('./AvatarOptionCard.jsx', import.meta.url),
    'utf8',
  );

  assert.match(source, /AvatarDisplay/);
  assert.match(source, /aria-pressed/);
  assert.match(source, /aria-disabled/);
  assert.match(source, /Lock/);
});
