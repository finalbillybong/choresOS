import assert from 'node:assert/strict';
import test from 'node:test';

import {
  REWARD_EMOJI_GROUPS,
  REWARD_EMOJI_OPTIONS,
  getRewardEmojiOption,
  normalizeRewardIcon,
  rewardIconForDisplay,
  suggestRewardEmoji,
} from './rewardEmoji.js';

test('reward icons convert legacy text aliases to emoji', () => {
  assert.equal(normalizeRewardIcon('trophy'), '\uD83C\uDFC6');
  assert.equal(normalizeRewardIcon(' gift '), '\uD83C\uDF81');
  assert.equal(rewardIconForDisplay('star'), '\u2B50');
});

test('reward icons preserve real emoji and hide unknown plain text', () => {
  assert.equal(normalizeRewardIcon('\uD83C\uDFAC'), '\uD83C\uDFAC');
  assert.equal(normalizeRewardIcon('screen time'), '\uD83D\uDCF1');
  assert.equal(rewardIconForDisplay('unknown reward icon'), '');
  assert.equal(rewardIconForDisplay(''), '');
});

test('reward emoji picker can resolve the selected option', () => {
  const option = getRewardEmojiOption('\uD83C\uDFC6');

  assert.equal(option.id, 'trophy');
  assert.equal(option.icon, '\uD83C\uDFC6');
});

test('reward emoji picker offers matched and broad emoji sets', () => {
  assert.equal(REWARD_EMOJI_OPTIONS.length, 48);
  assert.deepEqual(
    REWARD_EMOJI_GROUPS.map((group) => [group.id, group.options.length]),
    [
      ['matched', 12],
      ['popular', 24],
      ['more', 12],
    ],
  );

  const icons = new Set(REWARD_EMOJI_OPTIONS.map((option) => option.icon));
  assert.equal(icons.size, REWARD_EMOJI_OPTIONS.length);
});

test('reward titles suggest emoji for the listed reward ideas', () => {
  assert.equal(suggestRewardEmoji('+15min telefonu'), '\uD83D\uDCF1');
  assert.equal(suggestRewardEmoji('+60min telefonu'), '\uD83D\uDCF1');
  assert.equal(suggestRewardEmoji('wyjście do aquaparku'), '\uD83C\uDFCA');
  assert.equal(suggestRewardEmoji('zamówienie mcDonalda'), '\uD83C\uDF54');
  assert.equal(suggestRewardEmoji('wyjście na rolki'), '\uD83D\uDEFC');
  assert.equal(suggestRewardEmoji('słodycze (np. czekolada) za około 10zł'), '\uD83C\uDF6B');
  assert.equal(suggestRewardEmoji('Coca-cola 500ml'), '\uD83E\uDD64');
  assert.equal(suggestRewardEmoji('słodycze za około 20zł'), '\uD83C\uDF6C');
  assert.equal(suggestRewardEmoji('gra karciana inna niż makao'), '\uD83C\uDCCF');
  assert.equal(suggestRewardEmoji('gra planszowa inna niż makao'), '\uD83C\uDFB2');
  assert.equal(suggestRewardEmoji('decyzja co jutro na obiad (nie-fast food)'), '\uD83C\uDF7D\uFE0F');
});
