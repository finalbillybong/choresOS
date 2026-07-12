import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { api } from '../api/client';
import { useAuth } from './useAuth';
import {
  normalizePersonalTheme,
  normalizeSpecialTheme,
  resolveEffectiveTheme,
} from '../utils/themeResolver';


const ThemeContext = createContext(null);
const MQ = window.matchMedia('(prefers-color-scheme: light)');

function resolveMode(preference) {
  if (preference === 'system') return MQ.matches ? 'light' : 'dark';
  return preference;
}

export const COLOR_THEMES = [
  { id: 'default', label: 'Classic', group: 'boy', accent: '#14b8a6', secondary: '#2dd4bf', tertiary: '#f59e0b' },
  { id: 'dragon', label: 'Dragon Fire', group: 'boy', accent: '#ef4444', secondary: '#f87171', tertiary: '#f59e0b' },
  { id: 'forest', label: 'Enchanted Forest', group: 'boy', accent: '#10b981', secondary: '#34d399', tertiary: '#f59e0b' },
  { id: 'arctic', label: 'Arctic', group: 'boy', accent: '#06b6d4', secondary: '#22d3ee', tertiary: '#14b8a6' },
  { id: 'rose', label: 'Rose Gold', group: 'girl', accent: '#ec4899', secondary: '#f472b6', tertiary: '#a855f7' },
  { id: 'galaxy', label: 'Galaxy', group: 'girl', accent: '#a855f7', secondary: '#c084fc', tertiary: '#ec4899' },
  { id: 'sunshine', label: 'Sunshine', group: 'girl', accent: '#f59e0b', secondary: '#fbbf24', tertiary: '#f97316' },
  { id: 'fairy', label: 'Fairy Dust', group: 'girl', accent: '#c084fc', secondary: '#d8b4fe', tertiary: '#f0abfc' },
];

const ALL_THEME_CLASS_IDS = [
  ...COLOR_THEMES.map(({ id }) => id),
  'easter',
  'christmas',
].filter((id) => id !== 'default');

export function ThemeProvider({ children }) {
  const { user, updateUser } = useAuth();
  const userId = user?.id;

  const [preference, setPreference] = useState(() => (
    localStorage.getItem('chorequest-theme') || 'system'
  ));
  const [resolved, setResolved] = useState(() => resolveMode(
    localStorage.getItem('chorequest-theme') || 'system'
  ));
  const [personalTheme, setPersonalTheme] = useState(() => normalizePersonalTheme(
    localStorage.getItem('chorequest-color-theme') || 'default'
  ));
  const [specialTheme, setSpecialThemeState] = useState('none');
  const [personalThemeError, setPersonalThemeError] = useState('');
  const [specialThemeError, setSpecialThemeError] = useState('');
  const [specialThemeSaving, setSpecialThemeSaving] = useState(false);

  const effectiveTheme = resolveEffectiveTheme(personalTheme, specialTheme);

  useEffect(() => {
    localStorage.setItem('chorequest-theme', preference);
    setResolved(resolveMode(preference));
  }, [preference]);

  useEffect(() => {
    if (preference !== 'system') return undefined;
    const handler = () => setResolved(resolveMode('system'));
    MQ.addEventListener('change', handler);
    return () => MQ.removeEventListener('change', handler);
  }, [preference]);

  useEffect(() => {
    const serverTheme = user?.avatar_config?.color_theme;
    if (!serverTheme) return;
    const normalized = normalizePersonalTheme(serverTheme);
    setPersonalTheme(normalized);
    localStorage.setItem('chorequest-color-theme', normalized);
  }, [user?.avatar_config?.color_theme, userId]);

  useEffect(() => {
    localStorage.setItem('chorequest-color-theme', personalTheme);

    const root = document.documentElement;
    root.classList.toggle('light-mode', resolved === 'light');
    for (const id of ALL_THEME_CLASS_IDS) {
      root.classList.remove(`theme-${id}`);
    }
    if (effectiveTheme !== 'default') {
      root.classList.add(`theme-${effectiveTheme}`);
    }
  }, [effectiveTheme, personalTheme, resolved]);

  const fetchSpecialTheme = useCallback(async () => {
    if (!userId) {
      setSpecialThemeState('none');
      return;
    }
    try {
      const data = await api('/api/theme/special');
      setSpecialThemeState(normalizeSpecialTheme(data.special_theme));
      setSpecialThemeError('');
    } catch (error) {
      setSpecialThemeError(error.message || 'Failed to load holiday theme');
    }
  }, [userId]);

  useEffect(() => {
    fetchSpecialTheme();
  }, [fetchSpecialTheme]);

  useEffect(() => {
    const handler = (event) => {
      if (event.detail?.data?.entity === 'special_theme') {
        fetchSpecialTheme();
      }
    };
    window.addEventListener('ws:message', handler);
    return () => window.removeEventListener('ws:message', handler);
  }, [fetchSpecialTheme]);

  const setColorTheme = useCallback(async (themeId) => {
    const nextTheme = normalizePersonalTheme(themeId);
    const previousTheme = personalTheme;
    const previousConfig = user?.avatar_config || {};

    setPersonalTheme(nextTheme);
    setPersonalThemeError('');
    try {
      const saved = await api('/api/auth/me', {
        method: 'PUT',
        body: {
          avatar_config: {
            ...previousConfig,
            color_theme: nextTheme,
          },
        },
      });
      updateUser({ avatar_config: saved.avatar_config });
    } catch (error) {
      setPersonalTheme(previousTheme);
      setPersonalThemeError(error.message || 'Failed to save colour theme');
    }
  }, [personalTheme, updateUser, user?.avatar_config]);

  const setSpecialTheme = useCallback(async (themeId) => {
    const nextTheme = normalizeSpecialTheme(themeId);
    const previousTheme = specialTheme;

    setSpecialThemeState(nextTheme);
    setSpecialThemeError('');
    setSpecialThemeSaving(true);
    try {
      const saved = await api('/api/theme/special', {
        method: 'PUT',
        body: { special_theme: nextTheme },
      });
      setSpecialThemeState(normalizeSpecialTheme(saved.special_theme));
    } catch (error) {
      setSpecialThemeState(previousTheme);
      setSpecialThemeError(error.message || 'Failed to save holiday theme');
    } finally {
      setSpecialThemeSaving(false);
    }
  }, [specialTheme]);

  const toggleMode = useCallback(() => {
    setPreference((current) => (resolveMode(current) === 'dark' ? 'light' : 'dark'));
  }, []);

  const value = useMemo(() => ({
    theme: resolved,
    mode: preference,
    setMode: setPreference,
    toggle: toggleMode,
    colorTheme: personalTheme,
    personalTheme,
    personalThemeError,
    setColorTheme,
    specialTheme,
    setSpecialTheme,
    specialThemeSaving,
    specialThemeError,
    effectiveTheme,
  }), [
    effectiveTheme,
    personalTheme,
    personalThemeError,
    preference,
    resolved,
    setColorTheme,
    setSpecialTheme,
    specialTheme,
    specialThemeError,
    specialThemeSaving,
    toggleMode,
  ]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be within ThemeProvider');
  return ctx;
}
