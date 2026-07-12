import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../hooks/useAuth';
import { useTheme, COLOR_THEMES } from '../hooks/useTheme';
import AvatarDisplay from '../components/AvatarDisplay';
import { useNavigate } from 'react-router-dom';
import ChoreIcon from '../components/ChoreIcon';
import RankBadge from '../components/RankBadge';
import PetLevelBadge from '../components/PetLevelBadge';
import ProgressCharts from '../components/ProgressCharts';
import {
  UserCircle,
  Save,
  LogOut,
  KeyRound,
  Lock,
  Sun,
  Moon,
  Monitor,
  Flame,
  Award,
  Star,
  Loader2,
  Pencil,
  ShieldCheck,
  Settings,
  Trophy,
  ChevronRight,
  Bell,
  BellOff,
  BarChart3,
  Download,
  Shield,
} from 'lucide-react';
import { usePushNotifications } from '../hooks/usePushNotifications';

function PushNotificationToggle() {
  const { supported, supportLevel, permission, subscribed, loading, toggle } = usePushNotifications();
  const [toggling, setToggling] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState('');

  const handleToggle = async () => {
    setToggling(true);
    await toggle();
    setToggling(false);
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult('');
    try {
      const data = await api('/api/push/test', { method: 'POST' });
      setTestResult(data.detail);
    } catch (err) {
      setTestResult(err.message || 'Test failed');
    } finally {
      setTesting(false);
    }
  };

  const denied = permission === 'denied';
  const needsInstall = supportLevel === 'needs-install';
  const needsHttps = supportLevel === 'needs-https';
  const unsupported = supportLevel === 'unsupported';

  return (
    <div className="game-panel p-4">
      <h2 className="text-cream text-sm font-semibold mb-3 flex items-center gap-2">
        {subscribed ? <Bell size={14} className="text-accent" /> : <BellOff size={14} className="text-muted" />}
        Push Notifications
      </h2>
      {needsHttps ? (
        <div>
          <p className="text-cream/80 text-sm">Get notified about quests, rewards & achievements</p>
          <p className="text-amber/80 text-xs mt-2">Push notifications require HTTPS.</p>
        </div>
      ) : needsInstall ? (
        <div>
          <p className="text-cream/80 text-sm">Get notified about quests, rewards & achievements</p>
          <p className="text-amber/80 text-xs mt-2">Add ChoreQuest to your Home Screen to enable notifications.</p>
        </div>
      ) : unsupported ? (
        <div>
          <p className="text-cream/80 text-sm">Get notified about quests, rewards & achievements</p>
          <p className="text-muted text-xs mt-2">Your browser does not support push notifications.</p>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1 mr-3">
            <p className="text-cream/80 text-sm">
              {denied
                ? 'Notifications blocked by browser'
                : subscribed
                  ? 'Alerts enabled'
                  : 'Get notified about quests & rewards'}
            </p>
            {denied && (
              <p className="text-muted text-xs mt-1">Check browser settings to allow notifications.</p>
            )}
          </div>
          <button
            onClick={handleToggle}
            disabled={loading || toggling || denied}
            className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${
              subscribed
                ? 'bg-accent/30 border border-accent/40'
                : 'bg-navy border border-border'
            } ${denied ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            <div
              className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${
                subscribed
                  ? 'left-5 bg-accent'
                  : 'left-0.5 bg-muted/60'
              }`}
            />
          </button>
        </div>
      )}
      {subscribed && (
        <div className="mt-2 flex items-center gap-2">
          <button
            onClick={handleTest}
            disabled={testing}
            className="text-xs text-accent/70 hover:text-accent underline"
          >
            {testing ? 'Sending...' : 'Send test notification'}
          </button>
          {testResult && (
            <span className="text-xs text-muted">{testResult}</span>
          )}
        </div>
      )}
    </div>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const {
    mode,
    setMode,
    colorTheme,
    setColorTheme,
    specialTheme,
    personalThemeError,
  } = useTheme();

  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [nameSaving, setNameSaving] = useState(false);
  const [nameMsg, setNameMsg] = useState('');

  const isKid = user?.role === 'kid';
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(isKid);

  const [achievements, setAchievements] = useState([]);
  const [achievementsLoading, setAchievementsLoading] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showProgress, setShowProgress] = useState(false);

  const [pin, setPin] = useState('');
  const [pinSaving, setPinSaving] = useState(false);
  const [pinMsg, setPinMsg] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState('');

  useEffect(() => {
    setDisplayName(user?.display_name || '');
  }, [user?.display_name]);

  useEffect(() => {
    if (!isKid) return;
    (async () => {
      setStatsLoading(true);
      try {
        const data = await api('/api/stats/me');
        setStats(data);
      } catch {
        setStats(null);
      } finally {
        setStatsLoading(false);
      }
    })();
  }, [isKid]);

  useEffect(() => {
    if (!showAchievements || achievements.length > 0) return;
    (async () => {
      setAchievementsLoading(true);
      try {
        const data = await api('/api/stats/achievements/all');
        setAchievements(Array.isArray(data) ? data : []);
      } catch {
        setAchievements([]);
      } finally {
        setAchievementsLoading(false);
      }
    })();
  }, [showAchievements, achievements.length]);

  const saveDisplayName = async () => {
    if (!displayName.trim()) return;
    setNameSaving(true);
    setNameMsg('');
    try {
      const data = await api('/api/auth/me', {
        method: 'PUT',
        body: { display_name: displayName.trim() },
      });
      updateUser({ display_name: data.display_name || displayName.trim() });
      setNameMsg('Name updated!');
    } catch (err) {
      setNameMsg(err.message || 'Failed to update name');
    } finally {
      setNameSaving(false);
      setTimeout(() => setNameMsg(''), 3000);
    }
  };

  const savePin = async () => {
    if (pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      setPinMsg('PIN must be exactly 6 digits');
      return;
    }
    setPinSaving(true);
    setPinMsg('');
    try {
      await api('/api/auth/set-pin', { method: 'POST', body: { pin } });
      setPinMsg('PIN set successfully!');
      setPin('');
    } catch (err) {
      setPinMsg(err.message || 'Failed to set PIN');
    } finally {
      setPinSaving(false);
      setTimeout(() => setPinMsg(''), 3000);
    }
  };

  const changePassword = async () => {
    if (!currentPassword || !newPassword) {
      setPwMsg('Fill in all password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwMsg('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setPwMsg('New password must be at least 6 characters');
      return;
    }
    setPwSaving(true);
    setPwMsg('');
    try {
      await api('/api/auth/change-password', {
        method: 'POST',
        body: {
          current_password: currentPassword,
          new_password: newPassword,
        },
      });
      setPwMsg('Password changed!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPwMsg(err.message || 'Failed to change password');
    } finally {
      setPwSaving(false);
      setTimeout(() => setPwMsg(''), 3000);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <h1 className="text-cream text-lg font-semibold mb-1">
        Profile
      </h1>

      {/* Avatar + Name */}
      <div className="game-panel p-5 flex flex-col items-center gap-3">
        <button
          onClick={() => navigate('/avatar')}
          className="relative"
          aria-label="Customise avatar"
        >
          <AvatarDisplay
            config={user?.avatar_config}
            size="lg"
            name={user?.display_name || user?.username}
            animate
          />
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-accent flex items-center justify-center border-2 border-surface">
            <Pencil size={12} className="text-navy" />
          </div>
        </button>

        {/* Role + Rank */}
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <span className="inline-block px-2 py-0.5 rounded-md border text-[10px] font-medium capitalize border-border text-muted">
            {user?.role}
          </span>
          {stats?.rank && <RankBadge rank={stats.rank} size="sm" />}
        </div>
        {stats?.pet && (
          <div className="mt-0.5">
            <PetLevelBadge pet={stats.pet} />
          </div>
        )}

        {/* Editable display name */}
        <div className="w-full max-w-xs">
          <label className="block text-cream text-sm font-medium mb-1 text-center">
            Display Name
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={10}
              placeholder="Your display name"
              className="field-input"
            />
            <button
              onClick={saveDisplayName}
              disabled={nameSaving}
              className="game-btn game-btn-blue flex-shrink-0"
            >
              {nameSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            </button>
          </div>
          {nameMsg && (
            <p className={`text-xs mt-1 text-center ${nameMsg.includes('!') ? 'text-emerald' : 'text-crimson'}`}>
              {nameMsg}
            </p>
          )}
        </div>
      </div>

      {/* Stats (kids only) */}
      {isKid && (
        <div className="game-panel p-4">
          <h2 className="text-cream text-sm font-semibold mb-3">Stats</h2>
          {statsLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 size={18} className="text-accent animate-spin" />
            </div>
          ) : stats ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="text-center">
                  <Star size={16} className="text-gold mx-auto mb-1" />
                  <p className="text-gold text-sm font-medium">
                    {stats.points_balance ?? stats.xp_balance ?? 0}
                  </p>
                  <p className="text-muted text-xs">XP Balance</p>
                </div>
                <div className="text-center">
                  <Award size={16} className="text-emerald mx-auto mb-1" />
                  <p className="text-emerald text-sm font-medium">
                    {stats.total_points_earned ?? stats.total_xp_earned ?? 0}
                  </p>
                  <p className="text-muted text-xs">Total Earned</p>
                </div>
                <div className="text-center">
                  <Flame size={16} className="text-orange-400 mx-auto mb-1" />
                  <p className="text-orange-400 text-sm font-medium">
                    {stats.current_streak ?? stats.streak ?? 0}
                  </p>
                  <p className="text-muted text-xs">Streak</p>
                </div>
                <button
                  className="text-center hover:bg-surface-raised/50 rounded-md py-1 transition-colors"
                  onClick={() => setShowAchievements((v) => !v)}
                >
                  <Trophy size={16} className="text-purple mx-auto mb-1" />
                  <p className="text-purple text-sm font-medium">
                    {stats.achievements_count ?? 0}
                  </p>
                  <p className="text-muted text-xs flex items-center justify-center gap-0.5">
                    Achievements <ChevronRight size={10} />
                  </p>
                </button>
              </div>

              {stats.rank && stats.rank.next_threshold && (
                <div className="mt-3 pt-3 border-t border-border/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-muted text-xs">Next rank: {stats.rank.next_title}</span>
                    <span className="text-cream text-xs font-medium">
                      {stats.total_points_earned}/{stats.rank.next_threshold} XP
                    </span>
                  </div>
                  <div className="xp-bar">
                    <div
                      className="xp-bar-fill"
                      style={{ width: `${Math.round(stats.rank.progress * 100)}%` }}
                    />
                  </div>
                </div>
              )}

              <button
                onClick={() => setShowProgress((v) => !v)}
                className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-md bg-surface-raised/30 hover:bg-surface-raised/60 border border-border/50 text-muted hover:text-cream transition-colors text-xs font-medium"
              >
                <BarChart3 size={13} />
                {showProgress ? 'Hide Charts' : 'View Progress Charts'}
              </button>
            </>
          ) : (
            <p className="text-muted text-center text-sm">
              Stats not available yet.
            </p>
          )}
        </div>
      )}

      {/* Achievements (kids only) */}
      {isKid && showAchievements && (
        <div className="game-panel p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-cream text-sm font-semibold flex items-center gap-2">
              <Trophy size={14} className="text-purple" />
              Achievements
            </h2>
            <button
              onClick={() => setShowAchievements(false)}
              className="text-muted text-xs hover:text-cream transition-colors"
            >
              Hide
            </button>
          </div>
          {achievementsLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 size={18} className="text-accent animate-spin" />
            </div>
          ) : achievements.length === 0 ? (
            <p className="text-muted text-center text-sm">No achievements available yet.</p>
          ) : (
            <div className="space-y-1.5">
              {(() => {
                const tierColors = {
                  bronze: { border: 'border-amber-600/40', bg: 'bg-amber-600/10', text: 'text-amber-500', icon: 'text-amber-500', label: 'Bronze' },
                  silver: { border: 'border-slate-300/40', bg: 'bg-slate-300/10', text: 'text-slate-300', icon: 'text-slate-300', label: 'Silver' },
                  gold: { border: 'border-yellow-400/40', bg: 'bg-yellow-400/10', text: 'text-yellow-400', icon: 'text-yellow-400', label: 'Gold' },
                };
                const grouped = [];
                const seen = new Set();
                const sorted = [...achievements].sort((a, b) => (a.sort_order ?? 99) - (b.sort_order ?? 99));
                for (const a of sorted) {
                  if (a.group_key && !seen.has(a.group_key)) {
                    seen.add(a.group_key);
                    grouped.push({ group: a.group_key, items: sorted.filter(x => x.group_key === a.group_key) });
                  } else if (!a.group_key && !seen.has(a.id)) {
                    seen.add(a.id);
                    grouped.push({ group: null, items: [a] });
                  }
                }
                return grouped.map(({ group, items }) => (
                  <div key={group || items[0].id}>
                    {group && items.length > 1 && (
                      <p className="text-muted text-xs font-medium mt-2 mb-1 px-1 capitalize">
                        {group.replace(/_/g, ' ')}
                      </p>
                    )}
                    {items.map((a) => {
                      const tier = tierColors[a.tier] || null;
                      return (
                        <div
                          key={a.id}
                          className={`flex items-center gap-2.5 p-2.5 rounded-md border transition-opacity mb-1 ${
                            a.unlocked
                              ? tier ? `${tier.border} ${tier.bg}` : 'border-purple/30 bg-purple/5'
                              : 'border-border bg-surface-raised/30 opacity-60'
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 ${
                              a.unlocked
                                ? tier ? `${tier.bg} border ${tier.border}` : 'bg-purple/20 border border-purple/40'
                                : 'bg-surface-raised border border-border'
                            }`}
                          >
                            {a.unlocked ? (
                              <ChoreIcon name={a.icon} size={16} className={tier ? tier.icon : 'text-purple'} />
                            ) : (
                              <Lock size={14} className="text-muted" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className={`text-sm font-medium ${a.unlocked ? 'text-cream' : 'text-muted'}`}>
                                {a.title}
                              </p>
                              {tier && (
                                <span className={`text-[9px] font-medium px-1 py-0.5 rounded-md border ${tier.border} ${tier.bg} ${tier.text}`}>
                                  {tier.label}
                                </span>
                              )}
                            </div>
                            <p className="text-muted text-xs mt-0.5">{a.description}</p>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {a.points_reward > 0 && (
                              <div className="flex items-center gap-0.5">
                                <Star size={11} className="text-gold fill-gold" />
                                <span className="text-gold text-xs font-medium">{a.points_reward}</span>
                              </div>
                            )}
                            {a.unlocked && (
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  try {
                                    const res = await fetch(`/api/stats/achievements/${a.id}/badge`, {
                                      credentials: 'include',
                                    });
                                    const blob = await res.blob();
                                    const url = URL.createObjectURL(blob);
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.download = `${a.title.replace(/\s+/g, '_')}_badge.svg`;
                                    link.click();
                                    URL.revokeObjectURL(url);
                                  } catch { /* ignore */ }
                                }}
                                className="p-1 rounded-md hover:bg-surface-raised/60 transition-colors"
                                title="Download badge"
                              >
                                <Download size={11} className="text-muted hover:text-cream" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ));
              })()}
            </div>
          )}
        </div>
      )}

      {/* Progress Charts */}
      {showProgress && (
        <div className="game-panel p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-cream text-sm font-semibold flex items-center gap-2">
              <BarChart3 size={14} className="text-accent" />
              Progress Charts
            </h2>
            <button
              onClick={() => setShowProgress(false)}
              className="text-muted text-xs hover:text-cream transition-colors"
            >
              Hide
            </button>
          </div>
          <ProgressCharts />
        </div>
      )}

      {/* Progress Charts for parents */}
      {!isKid && (
        <div className="game-panel p-4">
          <button
            onClick={() => setShowProgress((v) => !v)}
            className="w-full flex items-center justify-center gap-2 py-2 text-muted hover:text-cream transition-colors text-xs font-medium"
          >
            <BarChart3 size={13} />
            {showProgress ? 'Hide Family Progress Charts' : 'View Family Progress Charts'}
          </button>
          {showProgress && (
            <div className="mt-3">
              <ProgressCharts />
            </div>
          )}
        </div>
      )}

      {/* PIN Setup */}
      <div className="game-panel p-4">
        <h2 className="text-cream text-sm font-semibold mb-3 flex items-center gap-2">
          <KeyRound size={14} className="text-muted" />
          Quick PIN Login
        </h2>
        <div className="flex gap-2">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="6-digit PIN"
            className="field-input"
          />
          <button
            onClick={savePin}
            disabled={pinSaving}
            className="game-btn game-btn-blue flex-shrink-0"
          >
            {pinSaving ? 'Setting...' : 'Set PIN'}
          </button>
        </div>
        {pinMsg && (
          <p className={`text-xs mt-2 ${pinMsg.includes('!') ? 'text-emerald' : 'text-crimson'}`}>
            {pinMsg}
          </p>
        )}
      </div>

      {/* Password Change */}
      <div className="game-panel p-4">
        <h2 className="text-cream text-sm font-semibold mb-3 flex items-center gap-2">
          <Lock size={14} className="text-muted" />
          Change Password
        </h2>
        <div className="space-y-2">
          <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Current password" autoComplete="current-password" className="field-input" />
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" autoComplete="new-password" className="field-input" />
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" autoComplete="new-password" className="field-input" />
          <button onClick={changePassword} disabled={pwSaving} className="game-btn game-btn-blue">
            {pwSaving ? 'Changing...' : 'Change Password'}
          </button>
        </div>
        {pwMsg && (
          <p className={`text-xs mt-2 ${pwMsg.includes('!') ? 'text-emerald' : 'text-crimson'}`}>
            {pwMsg}
          </p>
        )}
      </div>

      {/* Push Notifications */}
      <PushNotificationToggle />

      {/* Theme Toggle */}
      <div className="game-panel p-4">
        <h2 className="text-cream text-sm font-semibold mb-3">Appearance</h2>
        <div className="flex items-center gap-0.5 mb-4 bg-navy/60 rounded-md p-0.5">
          {[
            { id: 'light', icon: Sun, label: 'Light' },
            { id: 'dark', icon: Moon, label: 'Dark' },
            { id: 'system', icon: Monitor, label: 'Auto' },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setMode(id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                mode === id
                  ? 'bg-surface-raised text-cream'
                  : 'text-muted hover:text-cream'
              }`}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>

        {/* Color Theme */}
        <p className="text-muted text-xs font-medium mb-2">Color Theme</p>
        {specialTheme !== 'none' ? (
          <div className="mb-3 rounded-xl border border-accent/30 bg-accent/10 p-3 text-xs text-cream/80">
            Rodzinny motyw świąteczny jest aktywny. Twój zwykły motyw pozostaje
            zapisany i wróci po wyłączeniu motywu świątecznego.
          </div>
        ) : null}
        {personalThemeError ? (
          <p className="mb-3 text-xs text-crimson">{personalThemeError}</p>
        ) : null}
        {['boy', 'girl'].map((group) => (
          <div key={group} className="mb-3">
            <p className="text-muted text-[11px] font-medium mb-1.5">
              {group === 'boy' ? 'Knight Themes' : 'Princess Themes'}
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
              {COLOR_THEMES.filter((t) => t.group === group).map((t) => {
                const isActive = colorTheme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setColorTheme(t.id)}
                    className={`relative flex flex-col items-center gap-1 p-2 rounded-md border transition-colors ${
                      isActive
                        ? 'border-accent bg-accent/10'
                        : 'border-border hover:border-border-light bg-surface-raised/30'
                    }`}
                  >
                    <div className="flex gap-0.5">
                      <div
                        className="w-4 h-4 rounded-full border border-white/10"
                        style={{ backgroundColor: t.accent }}
                      />
                      <div
                        className="w-4 h-4 rounded-full border border-white/10"
                        style={{ backgroundColor: t.secondary }}
                      />
                      <div
                        className="w-4 h-4 rounded-full border border-white/10"
                        style={{ backgroundColor: t.tertiary }}
                      />
                    </div>
                    <span className="text-[10px] font-medium text-cream/80 leading-tight text-center">
                      {t.label}
                    </span>
                    {isActive && (
                      <div
                        className="absolute top-1 right-1 w-2 h-2 rounded-full"
                        style={{ backgroundColor: t.accent }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Management */}
      {(user?.role === 'admin' || user?.role === 'parent') && (
        <div className="game-panel p-4 space-y-1.5">
          <h2 className="text-cream text-sm font-semibold mb-2 flex items-center gap-2">
            <Settings size={14} className="text-muted" />
            Management
          </h2>
          <button
            onClick={() => navigate('/settings')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md bg-surface-raised/50 hover:bg-surface-raised border border-border/50 hover:border-border transition-colors text-left"
          >
            <Settings size={16} className="text-accent flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-cream text-sm font-medium">Family Settings</p>
              <p className="text-muted text-xs">Features, resets & rewards</p>
            </div>
            <ChevronRight size={14} className="text-muted flex-shrink-0" />
          </button>
          {user?.role === 'admin' && (
            <button
              onClick={() => navigate('/admin')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md bg-surface-raised/50 hover:bg-surface-raised border border-border/50 hover:border-border transition-colors text-left"
            >
              <ShieldCheck size={16} className="text-crimson flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-cream text-sm font-medium">Admin Dashboard</p>
                <p className="text-muted text-xs">Users, keys & audit log</p>
              </div>
              <ChevronRight size={14} className="text-muted flex-shrink-0" />
            </button>
          )}
        </div>
      )}

      {/* Logout */}
      <div className="pb-6">
        <button
          onClick={logout}
          className="game-btn game-btn-red w-full flex items-center justify-center gap-2"
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </div>
  );
}
