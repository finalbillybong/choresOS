import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

import {
  getInterfaceMode,
  getKidDefaultBoardThemeId,
  getKidHomeHighlights,
  getKidLayoutClassName,
  KID_BOARD_THEMES,
  KID_STYLE_CUES,
} from './kidInterfaceTheme.js';

const protectedTerms = /\b(kuromi|hello kitty|blackpink|black pink|huntrix|huntr\/x|roblox|minecraft)\b/i;

test('kid interface mode only applies to kid users', () => {
  assert.equal(getInterfaceMode({ role: 'kid' }), 'kid');
  assert.equal(getInterfaceMode({ role: 'parent' }), 'guardian');
  assert.equal(getInterfaceMode({ role: 'admin' }), 'guardian');
  assert.equal(getInterfaceMode(null), 'guardian');
});

test('kid layout class keeps the base shell and scopes child-only styling', () => {
  const kidClassName = getKidLayoutClassName({ role: 'kid' });
  const parentClassName = getKidLayoutClassName({ role: 'parent' });

  assert.match(kidClassName, /\bmin-h-screen\b/);
  assert.match(kidClassName, /\bkid-interface\b/);
  assert.match(kidClassName, /\bkid-interface-audhd\b/);
  assert.doesNotMatch(parentClassName, /\bkid-interface\b/);
});

test('kid style cues are safe inspired labels without third-party IP names', () => {
  assert.equal(KID_STYLE_CUES.length, 4);
  assert.deepEqual(
    KID_STYLE_CUES.map((cue) => cue.label),
    ['Psotne kawaii', 'Łowy w cieniu', 'Budowanie z bloków', 'Arcade run'],
  );

  for (const cue of KID_STYLE_CUES) {
    assert.ok(cue.id);
    assert.ok(cue.label);
    assert.ok(cue.description);
    assert.doesNotMatch(`${cue.label} ${cue.description}`, protectedTerms);
  }
});

test('kid dashboard highlights provide predictable one-step entry points', () => {
  const highlights = getKidHomeHighlights();

  assert.deepEqual(
    highlights.map((item) => item.id),
    ['next-step', 'style', 'rewards'],
  );
  assert.deepEqual(
    highlights.map((item) => item.label),
    ['Następny krok', 'Laboratorium stylu', 'Sejf nagród'],
  );
  for (const item of highlights) {
    assert.ok(item.label);
    assert.ok(item.description);
    assert.ok(item.path.startsWith('/'));
    assert.doesNotMatch(`${item.label} ${item.description}`, protectedTerms);
  }
});

test('kid dashboard source renders the focus map copy in Polish directly', () => {
  const source = fs.readFileSync(
    new URL('../pages/KidDashboard.jsx', import.meta.url),
    'utf8',
  );

  assert.match(source, /Mapa skupienia/);
  assert.match(source, /Jeden jasny krok, potem nagroda\./);
  assert.doesNotMatch(source, /Focus map|One clear step, then a reward\.|Style themes/);
});

test('kid board themes add safe interest-inspired choices and a calm default', () => {
  assert.equal(getKidDefaultBoardThemeId(), 'mischief');
  assert.deepEqual(
    KID_BOARD_THEMES.map((theme) => theme.id),
    ['mischief', 'shadow_hunt', 'block_builder', 'arcade_run'],
  );

  for (const theme of KID_BOARD_THEMES) {
    assert.ok(theme.label);
    assert.ok(theme.description);
    assert.ok(theme.cardAccent);
    assert.doesNotMatch(`${theme.label} ${theme.description}`, protectedTerms);
  }
});
