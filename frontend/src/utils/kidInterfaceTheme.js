export const KID_INTERFACE_BASE_CLASS =
  'min-h-screen bg-navy flex overflow-x-clip max-w-[100vw]';

export const KID_STYLE_CUES = [
  {
    id: 'mischief-kawaii',
    label: 'Psotne kawaii',
    description: 'Miękki psotny styl z kokardkami, gwiazdkami i spokojnym kontrastem.',
    accent: '#f472b6',
  },
  {
    id: 'shadow-hunter',
    label: 'Łowy w cieniu',
    description: 'Księżycowy klimat łowczyni z prostymi, czytelnymi panelami.',
    accent: '#a78bfa',
  },
  {
    id: 'block-builder',
    label: 'Budowanie z bloków',
    description: 'Kanciaste kształty i detale budowania bez wizualnego hałasu.',
    accent: '#84cc16',
  },
  {
    id: 'arcade-run',
    label: 'Arcade run',
    description: 'Energia gry platformowej z jasnym celem i mocnym fokusem.',
    accent: '#22d3ee',
  },
];

export const KID_BOARD_THEMES = [
  {
    id: 'mischief',
    label: 'Psotne kawaii',
    icon: '\u2726',
    description: 'Miękka psotna tablica skupienia',
    headerGradient:
      'linear-gradient(135deg, rgba(244,114,182,0.22) 0%, rgba(30,24,42,0.42) 52%, rgba(45,212,191,0.14) 100%)',
    pageGradient:
      'linear-gradient(180deg, rgba(244,114,182,0.10) 0%, rgba(34,211,238,0.05) 38%, transparent 72%)',
    cardAccent: '#f472b6',
    particleEmojis: ['\u2726', '\u2665', '\u273F', '\u25C6', '\u2605'],
  },
  {
    id: 'shadow_hunt',
    label: 'Łowy w cieniu',
    icon: '\u263E',
    description: 'Księżycowe misje łowczyni',
    headerGradient:
      'linear-gradient(135deg, rgba(167,139,250,0.24) 0%, rgba(15,23,42,0.38) 50%, rgba(56,189,248,0.13) 100%)',
    pageGradient:
      'linear-gradient(180deg, rgba(167,139,250,0.10) 0%, rgba(56,189,248,0.04) 42%, transparent 76%)',
    cardAccent: '#a78bfa',
    particleEmojis: ['\u263E', '\u2727', '\u2020', '\u25C7', '\u2726'],
  },
  {
    id: 'block_builder',
    label: 'Budowanie z bloków',
    icon: '\u25A3',
    description: 'Kanciaste misje budowania',
    headerGradient:
      'linear-gradient(135deg, rgba(132,204,22,0.18) 0%, rgba(20,83,45,0.22) 48%, rgba(250,204,21,0.12) 100%)',
    pageGradient:
      'linear-gradient(180deg, rgba(132,204,22,0.08) 0%, rgba(250,204,21,0.04) 44%, transparent 78%)',
    cardAccent: '#84cc16',
    particleEmojis: ['\u25A3', '\u25A0', '\u25A6', '\u25A1', '\u2726'],
  },
  {
    id: 'arcade_run',
    label: 'Arcade run',
    icon: '\u25B6',
    description: 'Energia platformowego biegu',
    headerGradient:
      'linear-gradient(135deg, rgba(34,211,238,0.20) 0%, rgba(49,46,129,0.22) 50%, rgba(251,113,133,0.12) 100%)',
    pageGradient:
      'linear-gradient(180deg, rgba(34,211,238,0.08) 0%, rgba(251,113,133,0.04) 42%, transparent 76%)',
    cardAccent: '#22d3ee',
    particleEmojis: ['\u25B6', '\u25C7', '\u2605', '\u25A0', '\u25CF'],
  },
];

export function getInterfaceMode(user) {
  return user?.role === 'kid' ? 'kid' : 'guardian';
}

export function getKidLayoutClassName(user) {
  if (getInterfaceMode(user) !== 'kid') return KID_INTERFACE_BASE_CLASS;
  return `${KID_INTERFACE_BASE_CLASS} kid-interface kid-interface-audhd`;
}

export function getKidDefaultBoardThemeId() {
  return 'mischief';
}

export function getKidHomeHighlights() {
  return [
    {
      id: 'next-step',
      label: 'Następny krok',
      description: 'Zobacz dzisiejsze misje bez nadmiaru bodźców.',
      path: '/chores',
    },
    {
      id: 'style',
      label: 'Laboratorium stylu',
      description: 'Otwórz stylizacje awatara w bezpiecznych klimatach.',
      path: '/rewards?tab=avatar',
    },
    {
      id: 'rewards',
      label: 'Sejf nagród',
      description: 'Sprawdź, co możesz odblokować za XP.',
      path: '/rewards',
    },
  ];
}
