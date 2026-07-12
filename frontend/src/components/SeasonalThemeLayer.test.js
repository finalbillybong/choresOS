import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';


test('seasonal layer is decorative and supports both holidays', () => {
  const source = readFileSync(
    new URL('./SeasonalThemeLayer.jsx', import.meta.url),
    'utf8',
  );

  assert.match(source, /aria-hidden="true"/);
  assert.match(source, /pointer-events-none/);
  assert.match(source, /christmas/);
  assert.match(source, /easter/);
});
