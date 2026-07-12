import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { SPECIAL_THEMES } from '../utils/themeResolver';
import {
  Settings as CogIcon,
  Save,
  Shield,
  Loader2,
  Award,
  ArrowLeft,
} from 'lucide-react';
import VacationSettings from '../components/VacationSettings';

export default function Settings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    specialTheme,
    setSpecialTheme,
    specialThemeSaving,
    specialThemeError,
  } = useTheme();

  const isParentOrAdmin = user?.role === 'parent' || user?.role === 'admin';

  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  // Achievements
  const [achievements, setAchievements] = useState([]);
  const [achievementsLoading, setAchievementsLoading] = useState(false);
  const [achievementsSaving, setAchievementsSaving] = useState({});

  // Settings are stored as strings in the DB — parse on load, stringify on save
  const parseSettings = (raw) => {
    const parsed = {};
    for (const [k, v] of Object.entries(raw)) {
      if (v === 'true') parsed[k] = true;
      else if (v === 'false') parsed[k] = false;
      else if (/^\d+$/.test(v)) parsed[k] = parseInt(v, 10);
      else parsed[k] = v;
    }
    return parsed;
  };

  const stringifySettings = (obj) => {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      out[k] = String(v);
    }
    return out;
  };

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api('/api/admin/settings');
      setSettings(parseSettings(data));
    } catch (err) {
      if (err.message?.includes('403') || err.message?.includes('Forbidden') || err.message?.includes('permission')) {
        setError('Access denied. Only parents and admins can access settings.');
      } else {
        setError(err.message || 'Failed to load settings');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAchievements = useCallback(async () => {
    setAchievementsLoading(true);
    try {
      const data = await api('/api/stats/achievements/all');
      setAchievements(data.achievements || data || []);
    } catch {
      // Achievements endpoint may not exist
      setAchievements([]);
    } finally {
      setAchievementsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isParentOrAdmin) {
      fetchSettings();
      fetchAchievements();
    } else {
      setLoading(false);
      setError('Access denied. Only parents and admins can access settings.');
    }
  }, [isParentOrAdmin, fetchSettings, fetchAchievements]);

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const saveSettings = async () => {
    setSaving(true);
    setSaveMsg('');
    try {
      await api('/api/admin/settings', { method: 'PUT', body: { settings: stringifySettings(settings) } });
      setSaveMsg('Settings saved!');
      window.dispatchEvent(new CustomEvent('settings:updated'));
    } catch (err) {
      setSaveMsg(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(''), 3000);
    }
  };

  const updateAchievementPoints = async (achievement) => {
    setAchievementsSaving((prev) => ({ ...prev, [achievement.id]: true }));
    try {
      await api(`/api/stats/achievements/${achievement.id}`, {
        method: 'PUT',
        body: { points_reward: achievement.points_reward },
      });
    } catch {
      // Revert will be handled by re-fetch if needed
    } finally {
      setAchievementsSaving((prev) => ({ ...prev, [achievement.id]: false }));
    }
  };

  const ToggleSwitch = ({ enabled, onChange, label }) => (
    <div className="flex items-center justify-between py-3">
      <span className="text-cream text-sm">{label}</span>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full border transition-colors flex-shrink-0 ${
          enabled
            ? 'bg-accent/30 border-accent/40'
            : 'bg-navy border-border'
        }`}
        aria-label={`Toggle ${label}`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full transition-transform ${
            enabled
              ? 'translate-x-6 bg-accent'
              : 'translate-x-1 bg-muted/60'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="w-full max-w-2xl mx-auto overflow-hidden">
      {/* Back + Header */}
      <button
        onClick={() => navigate('/profile')}
        className="flex items-center gap-1.5 text-muted hover:text-cream transition-colors mb-4 text-sm"
      >
        <ArrowLeft size={16} />
        Profile
      </button>
      <div className="flex items-center gap-3 mb-6">
        <CogIcon size={24} className="text-cream" />
        <h1 className="text-cream text-lg font-semibold">
          Family Settings
        </h1>
      </div>

      {/* Error / Access denied */}
      {error && (
        <div className="game-panel p-8 text-center">
          <Shield size={48} className="text-crimson/30 mx-auto mb-4" />
          <p className="text-crimson text-sm">{error}</p>
          <p className="text-muted text-xs mt-2">
            Only parents and admins can change settings.
          </p>
        </div>
      )}

      {/* Loading */}
      {loading && !error && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="text-accent animate-spin" />
        </div>
      )}

      {/* Settings form */}
      {!loading && !error && settings && (
        <div className="space-y-6">
          {/* Toggle settings */}
          <div className="game-panel p-4">
            <h2 className="text-cream text-sm font-semibold mb-3">
              Feature Toggles
            </h2>

            <div className="divide-y divide-border">
              <ToggleSwitch
                enabled={settings.leaderboard_enabled ?? true}
                onChange={(v) => updateSetting('leaderboard_enabled', v)}
                label="Leaderboard"
              />
              <ToggleSwitch
                enabled={settings.spin_wheel_enabled ?? true}
                onChange={(v) => updateSetting('spin_wheel_enabled', v)}
                label="Spin Wheel"
              />
              <ToggleSwitch
                enabled={settings.chore_trading_enabled ?? true}
                onChange={(v) => updateSetting('chore_trading_enabled', v)}
                label="Chore Trading"
              />
            </div>
          </div>

          {/* Family holiday theme */}
          <div className="game-panel overflow-hidden">
            <div className="border-b border-border bg-gradient-to-r from-accent/10 via-transparent to-gold/10 p-4">
              <h2 className="text-cream text-sm font-semibold mb-1">Holiday Theme</h2>
              <p className="text-muted text-xs leading-relaxed">
                This family-wide theme temporarily overrides everyone&apos;s personal colours.
              </p>
            </div>
            <div className="grid gap-2 p-4 sm:grid-cols-3">
              {SPECIAL_THEMES.map((holidayTheme) => {
                const isActive = specialTheme === holidayTheme.id;
                return (
                  <button
                    key={holidayTheme.id}
                    type="button"
                    onClick={() => setSpecialTheme(holidayTheme.id)}
                    disabled={specialThemeSaving}
                    aria-pressed={isActive}
                    className={`group relative overflow-hidden rounded-xl border p-3 text-left transition-all ${
                      isActive
                        ? 'border-accent bg-accent/10 ring-1 ring-accent/30'
                        : 'border-border bg-surface-raised/30 hover:-translate-y-0.5 hover:border-border-light hover:bg-surface-raised/60'
                    }`}
                  >
                    <div
                      className="absolute inset-x-0 top-0 h-1"
                      style={{
                        background: `linear-gradient(90deg, ${holidayTheme.colors.join(', ')})`,
                      }}
                    />
                    <div className="mb-2 flex items-center justify-between gap-2 pt-1">
                      <span className="text-2xl" aria-hidden="true">{holidayTheme.icon}</span>
                      <div className="flex gap-1">
                        {holidayTheme.colors.map((color) => (
                          <span
                            key={color}
                            className="h-2.5 w-2.5 rounded-full border border-white/20"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-cream text-xs font-semibold">{holidayTheme.label}</p>
                    <p className="mt-1 text-[10px] leading-relaxed text-muted">
                      {holidayTheme.description}
                    </p>
                    {isActive ? (
                      <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-accent">
                        <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Active
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
            {specialThemeSaving ? (
              <p className="px-4 pb-4 text-xs text-muted">Saving holiday theme...</p>
            ) : null}
            {specialThemeError ? (
              <p className="px-4 pb-4 text-xs text-crimson">{specialThemeError}</p>
            ) : null}
          </div>

          {/* Daily reset hour */}
          <div className="game-panel p-4">
            <h2 className="text-cream text-sm font-semibold mb-3">
              Daily Reset Hour
            </h2>
            <p className="text-muted text-xs mb-3">
              Hour of day (0-23) when daily quests reset.
            </p>
            <input
              type="number"
              min={0}
              max={23}
              value={settings.daily_reset_hour ?? 0}
              onChange={(e) => {
                const val = Math.min(23, Math.max(0, parseInt(e.target.value, 10) || 0));
                updateSetting('daily_reset_hour', val);
              }}
              className="field-input max-w-[120px]"
            />
          </div>

          {/* Save button */}
          <button
            onClick={saveSettings}
            disabled={saving}
            className="game-btn game-btn-blue flex items-center gap-2"
          >
            {saving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
          {saveMsg && (
            <p className={`text-sm ${saveMsg.includes('!') ? 'text-emerald' : 'text-crimson'}`}>
              {saveMsg}
            </p>
          )}

          {/* Achievement point values */}
          <div className="game-panel p-4">
            <h2 className="text-cream text-sm font-semibold mb-3 flex items-center gap-2">
              <Award size={16} className="text-muted" />
              Achievement Point Values
            </h2>

            {achievementsLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 size={20} className="text-accent animate-spin" />
              </div>
            ) : achievements.length === 0 ? (
              <p className="text-muted text-xs">
                No achievements configured yet.
              </p>
            ) : (
              <div className="space-y-3">
                {achievements.map((ach) => {
                  const tierColors = { bronze: 'text-amber-500 bg-amber-600/10 border-amber-600/30', silver: 'text-slate-300 bg-slate-300/10 border-slate-300/30', gold: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30' };
                  const tierStyle = tierColors[ach.tier] || '';
                  return (
                  <div
                    key={ach.id}
                    className="p-3 rounded-md bg-surface-raised/30 border border-border space-y-2"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-cream text-sm truncate">
                          {ach.title || ach.name}
                        </p>
                        {ach.tier && (
                          <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-md border ${tierStyle}`}>
                            {ach.tier}
                          </span>
                        )}
                      </div>
                      {ach.description && (
                        <p className="text-muted text-xs">
                          {ach.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        value={ach.points_reward ?? 0}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10) || 0;
                          setAchievements((prev) =>
                            prev.map((a) =>
                              a.id === ach.id
                                ? { ...a, points_reward: val }
                                : a
                            )
                          );
                        }}
                        className="field-input !w-20 !p-2 text-center"
                      />
                      <span className="text-muted text-xs">pts</span>
                      <button
                        onClick={() => updateAchievementPoints(ach)}
                        disabled={achievementsSaving[ach.id]}
                        className="game-btn game-btn-blue !py-2 !px-3 ml-auto"
                        title="Save"
                      >
                        {achievementsSaving[ach.id] ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Save size={12} />
                        )}
                      </button>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Vacation Mode */}
          <VacationSettings />

          {/* Admin link */}
          {user?.role === 'admin' && (
            <div className="game-panel p-4 text-center">
              <p className="text-muted text-xs mb-3">
                Need advanced controls?
              </p>
              <button
                onClick={() => navigate('/admin')}
                className="game-btn game-btn-purple"
              >
                <Shield size={14} className="inline mr-2" />
                Admin Dashboard
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
