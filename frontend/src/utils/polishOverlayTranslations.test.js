import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const overlayFiles = [
  new URL('../../../polish_translation/pl-runtime.js', import.meta.url),
  new URL('../../public/local-overrides/pl-runtime.js', import.meta.url),
];

const requiredChoreDetailTranslations = [
  ['Trivial', 'Trywialna'],
  ['Unknown', 'Nieznana'],
  ['Recurrence', 'Powtarzanie'],
  ['fortnightly', 'co dwa tygodnie'],
  ['monthly', 'co miesiąc'],
];

const requiredRewardTranslations = [
  ['Selected icon', 'Wybrana ikona'],
];

const requiredAvatarThemeTranslations = [
  ['Featured style packs', 'Polecane zestawy stylu'],
  ['Edit avatar', 'Edytuj awatar'],
  ['Neon Pop Idol', 'Neonowa gwiazda pop'],
  ['Shadow Hunter', 'Łowca cieni'],
  ['Sweet Kitty', 'Słodki kotek'],
  ['Midnight Mischief', 'Nocny psotnik'],
  ['Idol Waves', 'Fale idolki'],
  ['Spirit Blade', 'Duchowe ostrze'],
  ['Kitty Bow Ears', 'Kocie uszy z kokardką'],
  ['Mischief Hood', 'Psotny kaptur'],
];

const requiredKidInterfaceTranslations = [
  ['Focus map', 'Mapa skupienia'],
  ['One clear step, then a reward.', 'Jeden jasny krok, potem nagroda.'],
  ['Next step', 'Następny krok'],
  ['See the quests for today without the extra noise.', 'Zobacz dzisiejsze misje bez nadmiaru bodźców.'],
  ['Style lab', 'Laboratorium stylu'],
  ['Open avatar looks with playful safe themes.', 'Otwórz stylizacje awatara w bezpiecznych klimatach.'],
  ['Reward vault', 'Sejf nagród'],
  ['Check what your XP can unlock next.', 'Sprawdź, co możesz odblokować za XP.'],
  ['Mischief Kawaii', 'Psotne kawaii'],
  ['Shadow Hunt', 'Łowy w cieniu'],
  ['Block Builder', 'Budowanie z bloków'],
  ['Arcade Run', 'Arcade run'],
  ['Workshop Tasks', 'Warsztatowe zadania'],
  ['Winter Workshop', 'Zimowy warsztat'],
];

test('polish overlay translates chore detail metadata', () => {
  for (const fileUrl of overlayFiles) {
    const source = fs.readFileSync(fileUrl, 'utf8');
    const translations = new Map(
      [...source.matchAll(/^\s*'([^']+)': '([^']*)',/gm)].map((match) => [
        match[1],
        match[2],
      ]),
    );

    for (const [english, polish] of requiredChoreDetailTranslations) {
      assert.equal(
        translations.get(english),
        polish,
        `${fileUrl.pathname} maps ${english} incorrectly`,
      );
    }
  }
});

test('polish overlay translates reward emoji picker text', () => {
  for (const fileUrl of overlayFiles) {
    const source = fs.readFileSync(fileUrl, 'utf8');
    const translations = new Map(
      [...source.matchAll(/^\s*'([^']+)': '([^']*)',/gm)].map((match) => [
        match[1],
        match[2],
      ]),
    );

    for (const [english, polish] of requiredRewardTranslations) {
      assert.equal(
        translations.get(english),
        polish,
        `${fileUrl.pathname} maps ${english} incorrectly`,
      );
    }
  }
});

test('polish overlay keeps textarea placeholders translatable', () => {
  for (const fileUrl of overlayFiles) {
    const source = fs.readFileSync(fileUrl, 'utf8');

    assert.match(
      source,
      /SKIP_TEXT_TAGS[\s\S]*TEXTAREA/,
      `${fileUrl.pathname} should only skip textarea text content`,
    );
    assert.doesNotMatch(
      source,
      /SKIP_TAGS\.has\(element\.tagName\)/,
      `${fileUrl.pathname} should not skip textarea attributes`,
    );
  }
});

test('polish overlay translates themed avatar collections', () => {
  for (const fileUrl of overlayFiles) {
    const source = fs.readFileSync(fileUrl, 'utf8');
    const translations = new Map(
      [...source.matchAll(/^\s*'([^']+)': '([^']*)',/gm)].map((match) => [
        match[1],
        match[2],
      ]),
    );

    for (const [english, polish] of requiredAvatarThemeTranslations) {
      assert.equal(
        translations.get(english),
        polish,
        `${fileUrl.pathname} maps ${english} incorrectly`,
      );
    }
  }
});

test('avatar shop dynamic unlock copy is Polish at the source', () => {
  const source = fs.readFileSync(
    new URL('../pages/AvatarShop.jsx', import.meta.url),
    'utf8',
  );

  assert.match(source, /Zdobądź \$\{item\.unlock_value\} XP/);
  assert.match(source, /Znajdź w misjach/);
  assert.doesNotMatch(source, /Earn \$\{item\.unlock_value\}( total)? XP|Find in quests/);
});

test('polish overlay translates kid interface theme text', () => {
  for (const fileUrl of overlayFiles) {
    const source = fs.readFileSync(fileUrl, 'utf8');
    const translations = new Map(
      [...source.matchAll(/^\s*'([^']+)': '([^']*)',/gm)].map((match) => [
        match[1],
        match[2],
      ]),
    );

    for (const [english, polish] of requiredKidInterfaceTranslations) {
      assert.equal(
        translations.get(english),
        polish,
        `${fileUrl.pathname} maps ${english} incorrectly`,
      );
    }
  }
});
