export const REWARD_EMOJI_GROUPS = [
  {
    id: 'matched',
    label: 'Dopasowane',
    options: [
      { id: 'phone-time', label: 'Telefon', icon: '\uD83D\uDCF1' },
      { id: 'aquapark', label: 'Aquapark', icon: '\uD83C\uDFCA' },
      { id: 'burger', label: 'Burger', icon: '\uD83C\uDF54' },
      { id: 'roller-skates', label: 'Rolki', icon: '\uD83D\uDEFC' },
      { id: 'chocolate', label: 'Czekolada', icon: '\uD83C\uDF6B' },
      { id: 'soda', label: 'Napoj', icon: '\uD83E\uDD64' },
      { id: 'candy', label: 'Slodycze', icon: '\uD83C\uDF6C' },
      { id: 'card-game', label: 'Gra karciana', icon: '\uD83C\uDCCF' },
      { id: 'board-game', label: 'Gra planszowa', icon: '\uD83C\uDFB2' },
      { id: 'dinner-choice', label: 'Obiad', icon: '\uD83C\uDF7D\uFE0F' },
      { id: 'fries', label: 'Frytki', icon: '\uD83C\uDF5F' },
      { id: 'lollipop', label: 'Lizak', icon: '\uD83C\uDF6D' },
    ],
  },
  {
    id: 'popular',
    label: 'Popularne',
    options: [
      { id: 'gift', label: 'Prezent', icon: '\uD83C\uDF81' },
      { id: 'trophy', label: 'Puchar', icon: '\uD83C\uDFC6' },
      { id: 'star', label: 'Gwiazdka', icon: '\u2B50' },
      { id: 'sparkles', label: 'Iskry', icon: '\u2728' },
      { id: 'game', label: 'Gra', icon: '\uD83C\uDFAE' },
      { id: 'movie', label: 'Film', icon: '\uD83C\uDFAC' },
      { id: 'pizza', label: 'Pizza', icon: '\uD83C\uDF55' },
      { id: 'ice-cream', label: 'Lody', icon: '\uD83C\uDF66' },
      { id: 'cookie', label: 'Ciastko', icon: '\uD83C\uDF6A' },
      { id: 'book', label: 'Ksiazka', icon: '\uD83D\uDCD6' },
      { id: 'bike', label: 'Rower', icon: '\uD83D\uDEB2' },
      { id: 'ticket', label: 'Bilet', icon: '\uD83C\uDF9F\uFE0F' },
      { id: 'music', label: 'Muzyka', icon: '\uD83C\uDFB5' },
      { id: 'art', label: 'Sztuka', icon: '\uD83C\uDFA8' },
      { id: 'crown', label: 'Korona', icon: '\uD83D\uDC51' },
      { id: 'puzzle', label: 'Puzzle', icon: '\uD83E\uDDE9' },
      { id: 'toy', label: 'Zabawka', icon: '\uD83E\uDDF8' },
      { id: 'soccer', label: 'Pilka', icon: '\u26BD' },
      { id: 'basketball', label: 'Koszykowka', icon: '\uD83C\uDFC0' },
      { id: 'playground', label: 'Plac zabaw', icon: '\uD83D\uDEDD' },
      { id: 'cake', label: 'Tort', icon: '\uD83C\uDF82' },
      { id: 'popcorn', label: 'Popcorn', icon: '\uD83C\uDF7F' },
      { id: 'juice', label: 'Sok', icon: '\uD83E\uDDC3' },
      { id: 'rocket', label: 'Rakieta', icon: '\uD83D\uDE80' },
    ],
  },
  {
    id: 'more',
    label: 'Dodatkowe',
    options: [
      { id: 'target', label: 'Cel', icon: '\uD83C\uDFAF' },
      { id: 'rainbow', label: 'Tecza', icon: '\uD83C\uDF08' },
      { id: 'camping', label: 'Biwak', icon: '\uD83C\uDFD5\uFE0F' },
      { id: 'ferris-wheel', label: 'Karuzela', icon: '\uD83C\uDFA1' },
      { id: 'roller-coaster', label: 'Kolejka', icon: '\uD83C\uDFA2' },
      { id: 'beach', label: 'Plaza', icon: '\uD83C\uDFD6\uFE0F' },
      { id: 'shopping', label: 'Zakupy', icon: '\uD83D\uDED2' },
      { id: 'bed', label: 'Sen', icon: '\uD83D\uDECF\uFE0F' },
      { id: 'cupcake', label: 'Babeczka', icon: '\uD83E\uDDC1' },
      { id: 'donut', label: 'Paczek', icon: '\uD83C\uDF69' },
      { id: 'watermelon', label: 'Arbuz', icon: '\uD83C\uDF49' },
      { id: 'pretzel', label: 'Precel', icon: '\uD83E\uDD68' },
    ],
  },
];

export const REWARD_EMOJI_OPTIONS = REWARD_EMOJI_GROUPS.flatMap((group) => group.options);

export const DEFAULT_REWARD_EMOJI = REWARD_EMOJI_OPTIONS[0].icon;

const REWARD_EMOJI_ALIASES = new Map([
  ['phone-time', '\uD83D\uDCF1'],
  ['telephone', '\uD83D\uDCF1'],
  ['telefon', '\uD83D\uDCF1'],
  ['aquapark', '\uD83C\uDFCA'],
  ['pool', '\uD83C\uDFCA'],
  ['basen', '\uD83C\uDFCA'],
  ['burger', '\uD83C\uDF54'],
  ['mcdonald', '\uD83C\uDF54'],
  ['mcdonalds', '\uD83C\uDF54'],
  ['roller-skates', '\uD83D\uDEFC'],
  ['rolki', '\uD83D\uDEFC'],
  ['skates', '\uD83D\uDEFC'],
  ['chocolate', '\uD83C\uDF6B'],
  ['czekolada', '\uD83C\uDF6B'],
  ['soda', '\uD83E\uDD64'],
  ['cola', '\uD83E\uDD64'],
  ['drink', '\uD83E\uDD64'],
  ['napoj', '\uD83E\uDD64'],
  ['napój', '\uD83E\uDD64'],
  ['candy', '\uD83C\uDF6C'],
  ['slodycze', '\uD83C\uDF6C'],
  ['słodycze', '\uD83C\uDF6C'],
  ['card-game', '\uD83C\uDCCF'],
  ['cards', '\uD83C\uDCCF'],
  ['karty', '\uD83C\uDCCF'],
  ['board-game', '\uD83C\uDFB2'],
  ['dice', '\uD83C\uDFB2'],
  ['planszowka', '\uD83C\uDFB2'],
  ['planszówka', '\uD83C\uDFB2'],
  ['dinner-choice', '\uD83C\uDF7D\uFE0F'],
  ['dinner', '\uD83C\uDF7D\uFE0F'],
  ['obiad', '\uD83C\uDF7D\uFE0F'],
  ['fries', '\uD83C\uDF5F'],
  ['frytki', '\uD83C\uDF5F'],
  ['lollipop', '\uD83C\uDF6D'],
  ['lizak', '\uD83C\uDF6D'],
  ['gift', '\uD83C\uDF81'],
  ['present', '\uD83C\uDF81'],
  ['reward', '\uD83C\uDF81'],
  ['trophy', '\uD83C\uDFC6'],
  ['cup', '\uD83C\uDFC6'],
  ['star', '\u2B50'],
  ['sparkle', '\u2728'],
  ['sparkles', '\u2728'],
  ['game', '\uD83C\uDFAE'],
  ['controller', '\uD83C\uDFAE'],
  ['screen', '\uD83D\uDCF1'],
  ['screen-time', '\uD83D\uDCF1'],
  ['screen time', '\uD83D\uDCF1'],
  ['phone', '\uD83D\uDCF1'],
  ['movie', '\uD83C\uDFAC'],
  ['film', '\uD83C\uDFAC'],
  ['pizza', '\uD83C\uDF55'],
  ['ice-cream', '\uD83C\uDF66'],
  ['ice cream', '\uD83C\uDF66'],
  ['cookie', '\uD83C\uDF6A'],
  ['book', '\uD83D\uDCD6'],
  ['bike', '\uD83D\uDEB2'],
  ['bicycle', '\uD83D\uDEB2'],
  ['ticket', '\uD83C\uDF9F\uFE0F'],
  ['music', '\uD83C\uDFB5'],
  ['art', '\uD83C\uDFA8'],
  ['crown', '\uD83D\uDC51'],
  ['puzzle', '\uD83E\uDDE9'],
  ['toy', '\uD83E\uDDF8'],
  ['soccer', '\u26BD'],
  ['football', '\u26BD'],
  ['basketball', '\uD83C\uDFC0'],
  ['playground', '\uD83D\uDEDD'],
  ['cake', '\uD83C\uDF82'],
  ['popcorn', '\uD83C\uDF7F'],
  ['juice', '\uD83E\uDDC3'],
  ['rocket', '\uD83D\uDE80'],
  ['target', '\uD83C\uDFAF'],
  ['rainbow', '\uD83C\uDF08'],
  ['camping', '\uD83C\uDFD5\uFE0F'],
  ['ferris-wheel', '\uD83C\uDFA1'],
  ['roller-coaster', '\uD83C\uDFA2'],
  ['beach', '\uD83C\uDFD6\uFE0F'],
  ['shopping', '\uD83D\uDED2'],
  ['bed', '\uD83D\uDECF\uFE0F'],
  ['cupcake', '\uD83E\uDDC1'],
  ['donut', '\uD83C\uDF69'],
  ['watermelon', '\uD83C\uDF49'],
  ['pretzel', '\uD83E\uDD68'],
]);

const REWARD_TITLE_SUGGESTIONS = [
  { icon: '\uD83D\uDCF1', terms: ['telefon', 'phone', 'screen time'] },
  { icon: '\uD83C\uDFCA', terms: ['aquapark', 'basen', 'plywanie', 'wodny'] },
  { icon: '\uD83C\uDF54', terms: ['mcdonald', 'mc donald', 'burger'] },
  { icon: '\uD83D\uDEFC', terms: ['rolki', 'lyzworolki', 'skates'] },
  { icon: '\uD83C\uDF6B', terms: ['czekolad', 'chocolate'] },
  { icon: '\uD83E\uDD64', terms: ['coca', 'cola', 'napoj', 'soda'] },
  { icon: '\uD83C\uDF6C', terms: ['slodycz', 'slodycze', 'cukierek', 'cukierki', 'candy'] },
  { icon: '\uD83C\uDCCF', terms: ['karcian', 'karty', 'cards'] },
  { icon: '\uD83C\uDFB2', terms: ['planszow', 'plansza', 'board game'] },
  { icon: '\uD83C\uDF7D\uFE0F', terms: ['obiad', 'kolacja', 'sniadanie', 'dinner'] },
];

const EMOJI_PATTERN = /\p{Extended_Pictographic}/u;

function normalizeSearchText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/ł/g, 'l')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function normalizeRewardIcon(value) {
  const trimmed = String(value || '').trim();
  if (!trimmed) return '';

  const alias = REWARD_EMOJI_ALIASES.get(trimmed.toLowerCase());
  if (alias) return alias;

  return EMOJI_PATTERN.test(trimmed) ? trimmed : '';
}

export function rewardIconForDisplay(value) {
  return normalizeRewardIcon(value);
}

export function getRewardEmojiOption(value) {
  const normalized = normalizeRewardIcon(value);
  return REWARD_EMOJI_OPTIONS.find((option) => option.icon === normalized) || null;
}

export function suggestRewardEmoji(title) {
  const normalized = normalizeSearchText(title);
  if (!normalized) return '';

  const suggestion = REWARD_TITLE_SUGGESTIONS.find(({ terms }) =>
    terms.some((term) => normalized.includes(term)),
  );

  return suggestion?.icon || '';
}
