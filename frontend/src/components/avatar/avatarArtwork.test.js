import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';


const artworkFiles = [
  './heads.jsx',
  './eyes.jsx',
  './mouths.jsx',
  './faceExtras.jsx',
  './hair.jsx',
  './bodies.jsx',
  './hats.jsx',
  './accessories.jsx',
  './pets.jsx',
];

test('every avatar artwork family contains visible finish details', () => {
  for (const file of artworkFiles) {
    const source = readFileSync(new URL(file, import.meta.url), 'utf8');
    assert.match(
      source,
      /avatar-(highlight|outline|detail)/,
      `${file} needs illustration finish details`,
    );
  }
});

test('legacy avatar option identifiers remain available', () => {
  const editor = readFileSync(new URL('../AvatarEditor.jsx', import.meta.url), 'utf8');
  for (const id of [
    'round', 'oval', 'square', 'diamond', 'heart', 'long', 'triangle', 'pear', 'wide',
    'short', 'long', 'spiky', 'curly', 'mohawk', 'buzz', 'ponytail', 'bun',
    'normal', 'happy', 'wide', 'sleepy', 'wink', 'angry', 'dot', 'star',
    'smile', 'grin', 'neutral', 'open', 'tongue', 'frown', 'surprised', 'smirk',
    'crown', 'wizard', 'beanie', 'cap', 'pirate', 'headphones', 'tiara', 'horns',
    'cat', 'dog', 'dragon', 'owl', 'bunny', 'phoenix',
  ]) {
    assert.match(editor, new RegExp(`id: '${id}'`), `missing legacy avatar id ${id}`);
  }
});
