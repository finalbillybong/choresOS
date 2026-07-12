export const PERSONAL_THEME_IDS = [
  'default',
  'dragon',
  'forest',
  'arctic',
  'rose',
  'galaxy',
  'sunshine',
  'fairy',
];

export const SPECIAL_THEMES = [
  {
    id: 'none',
    label: 'None',
    icon: '✨',
    description: 'Use everyone\'s personal colour theme',
    colors: ['#14b8a6', '#2dd4bf', '#f59e0b'],
  },
  {
    id: 'easter',
    label: 'Easter',
    icon: '🐣',
    description: 'Spring petals, painted eggs and bunny decorations',
    colors: ['#7dd3a8', '#f9a8d4', '#c4b5fd'],
  },
  {
    id: 'christmas',
    label: 'Christmas',
    icon: '🎄',
    description: 'Falling snow, warm lights and festive greenery',
    colors: ['#15803d', '#dc2626', '#fbbf24'],
  },
];

const PERSONAL_THEME_SET = new Set(PERSONAL_THEME_IDS);
const SPECIAL_THEME_SET = new Set(SPECIAL_THEMES.map(({ id }) => id));

export function normalizePersonalTheme(theme) {
  return PERSONAL_THEME_SET.has(theme) ? theme : 'default';
}

export function normalizeSpecialTheme(theme) {
  return SPECIAL_THEME_SET.has(theme) ? theme : 'none';
}

export function resolveEffectiveTheme(personalTheme, specialTheme) {
  const personal = normalizePersonalTheme(personalTheme);
  const special = normalizeSpecialTheme(specialTheme);
  return special === 'none' ? personal : special;
}

export function canManageSpecialTheme(role) {
  return role === 'parent' || role === 'admin';
}
