import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../hooks/useAuth';
import { useSettings } from '../hooks/useSettings';
import { useTheme } from '../hooks/useTheme';
import { useNotifications } from '../hooks/useNotifications';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import { getNotificationTarget } from '../utils/notificationTargets';
import { getInterfaceMode, getKidLayoutClassName } from '../utils/kidInterfaceTheme';
import {
  Bell,
  Swords,
  Gift,
  CalendarDays,
  Home,
  CheckCheck,
  X,
  Sparkles,
  ArrowLeft,
  Loader2,
  Users,
  Trophy,
  MoreHorizontal,
} from 'lucide-react';
import AvatarDisplay from './AvatarDisplay';
import SeasonalThemeLayer from './SeasonalThemeLayer';

const ALL_NAV_ITEMS = [
  { label: 'Home', icon: Home, path: '/' },
  { label: 'Quests', icon: Swords, path: '/chores' },
  { label: 'Party', icon: Users, path: '/party', mobileMore: true },
  { label: 'Leaderboard', icon: Trophy, path: '/leaderboard', settingKey: 'leaderboard_enabled', mobileMore: true },
  { label: 'Rewards', icon: Gift, path: '/rewards' },
  { label: 'Calendar', icon: CalendarDays, path: '/calendar', mobileMore: true },
  { label: 'Events', icon: Sparkles, path: '/events', parentOnly: true, mobileMore: true },
];

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const settings = useSettings();
  const { chore_trading_enabled } = settings;
  const { specialTheme } = useTheme();
  const { notifications, unreadCount, markRead, markAllRead, refresh } = useNotifications();

  const handlePullRefresh = useCallback(async () => {
    window.dispatchEvent(new CustomEvent('ws:message', { detail: { type: 'pull_refresh' } }));
    await new Promise((r) => setTimeout(r, 600));
  }, []);
  const { pulling, pullDistance, refreshing } = usePullToRefresh(handlePullRefresh);

  const [showNotifs, setShowNotifs] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const panelRef = useRef(null);
  const moreRef = useRef(null);

  useEffect(() => {
    if (!showNotifs) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showNotifs]);

  useEffect(() => {
    if (!showMore) return;
    const handler = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setShowMore(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showMore]);

  useEffect(() => {
    setShowNotifs(false);
    setShowMore(false);
  }, [location.pathname]);

  const isParent = user?.role === 'parent' || user?.role === 'admin';
  const interfaceMode = getInterfaceMode(user);
  const navItems = ALL_NAV_ITEMS.filter((item) => {
    if (item.parentOnly && !isParent) return false;
    if (item.settingKey && settings[item.settingKey] === false) return false;
    return true;
  });
  const primaryNavItems = navItems.filter((item) => !item.mobileMore);
  const moreNavItems = navItems.filter((item) => item.mobileMore);
  const isHome = location.pathname === '/';

  const isActive = (path) => path === '/' ? location.pathname === '/' : (location.pathname === path || location.pathname.startsWith(path + '/'));

  const handleNotificationClick = useCallback(async (notification) => {
    const target = getNotificationTarget(notification);
    const keepTradeUnread =
      chore_trading_enabled &&
      notification.type === 'trade_proposed' &&
      !notification.is_read;

    if (!notification.is_read && !keepTradeUnread) {
      try {
        await markRead(notification.id);
      } catch {
        // Navigation is still useful if marking read fails.
      }
    }

    setShowNotifs(false);
    navigate(target.path);
  }, [chore_trading_enabled, markRead, navigate]);

  return (
    <div className={getKidLayoutClassName(user)} data-interface-mode={interfaceMode}>
      <SeasonalThemeLayer theme={specialTheme} />
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-[248px] bg-surface border-r border-border min-h-screen fixed left-0 top-0 z-30">
        <div
          className="flex items-center gap-2.5 px-4 py-4 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center">
            <Swords size={14} className="text-navy" />
          </div>
          <span className="text-cream text-[15px] font-semibold">ChoreQuest</span>
        </div>

        <nav className="flex flex-col gap-0.5 px-3 mt-1 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors text-left text-sm ${
                  active
                    ? 'bg-surface-raised text-cream'
                    : 'text-muted hover:text-cream hover:bg-surface-raised'
                }`}
              >
                <Icon size={16} className={active ? 'text-accent' : ''} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {user && (
          <div
            className="flex items-center gap-2.5 px-4 py-3 border-t border-border cursor-pointer hover:bg-surface-raised transition-colors"
            onClick={() => navigate('/profile')}
          >
            <AvatarDisplay
              config={user.avatar_config}
              size="sm"
              name={user.display_name || user.username}
              animate
            />
            <div className="min-w-0">
              <p className="text-cream text-sm font-medium truncate">
                {user.display_name || user.username}
              </p>
              <p className="text-muted text-xs capitalize">{user.role}</p>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-[248px] min-h-screen min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 bg-surface border-b border-border px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {!isHome && (
              <button
                onClick={() => navigate(-1)}
                className="p-1.5 rounded-md hover:bg-surface-raised transition-colors text-muted hover:text-cream"
                aria-label="Go back"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div
              className="flex items-center gap-2 cursor-pointer md:hidden"
              onClick={() => navigate('/')}
            >
              <div className="w-6 h-6 rounded bg-accent flex items-center justify-center">
                <Swords size={12} className="text-navy" />
              </div>
              <span className="text-cream text-sm font-semibold">ChoreQuest</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Notification Bell */}
            <div className="relative" ref={panelRef}>
              <button
                onClick={() => {
                  setShowNotifs((v) => !v);
                }}
                className="relative p-2 rounded-md hover:bg-surface-raised transition-colors"
                aria-label="Notifications"
              >
                <Bell size={18} className="text-muted hover:text-cream transition-colors" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-crimson text-white text-[10px] font-bold min-w-[16px] h-[16px] flex items-center justify-center rounded-full px-1 leading-none">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Panel */}
              {showNotifs && (
                <div className="fixed right-2 left-2 sm:left-auto sm:absolute sm:right-0 top-12 sm:top-full sm:mt-1 sm:w-80 max-h-96 bg-surface border border-border rounded-md overflow-hidden z-50">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
                    <span className="text-cream text-sm font-semibold">Notifications</span>
                    <div className="flex items-center gap-1">
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          className="text-muted hover:text-cream text-xs flex items-center justify-center gap-1 transition-colors min-w-[44px] min-h-[44px]"
                          title="Mark all read"
                        >
                          <CheckCheck size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => setShowNotifs(false)}
                        className="text-muted hover:text-cream transition-colors flex items-center justify-center min-w-[44px] min-h-[44px]"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="overflow-y-auto max-h-80">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-muted text-sm">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map((n) => {
                        const isTrade = chore_trading_enabled && n.type === 'trade_proposed' && !n.is_read;
                        const target = getNotificationTarget(n);
                        return (
                          <div
                            key={n.id}
                            role="button"
                            tabIndex={0}
                            aria-label={`${target.label}: ${n.title}`}
                            onClick={() => handleNotificationClick(n)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleNotificationClick(n);
                              }
                            }}
                            className={`w-full text-left px-4 py-3 border-b border-border/50 hover:bg-surface-raised transition-colors cursor-pointer ${
                              !n.is_read ? 'bg-accent/5' : ''
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              {!n.is_read && (
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="text-cream text-sm font-medium truncate">
                                  {n.title}
                                </p>
                                <p className="text-muted text-xs mt-0.5 line-clamp-2">
                                  {n.message}
                                </p>
                                {isTrade && (
                                  <div className="flex items-center gap-2 mt-2">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        api(`/api/calendar/trade/${n.id}/accept`, { method: 'POST' })
                                          .then(() => refresh())
                                          .catch(() => {});
                                      }}
                                      className="game-btn game-btn-blue !py-1.5 !px-3 !text-[10px]"
                                    >
                                      Accept
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        api(`/api/calendar/trade/${n.id}/deny`, { method: 'POST' })
                                          .then(() => refresh())
                                          .catch(() => {});
                                      }}
                                      className="game-btn game-btn-red !py-1.5 !px-3 !text-[10px]"
                                    >
                                      Deny
                                    </button>
                                  </div>
                                )}
                                <p className="text-muted/60 text-xs mt-1">
                                  {timeAgo(n.created_at)}
                                </p>
                                <p className="text-accent/80 text-[11px] mt-1">
                                  {target.label}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Avatar (mobile) */}
            {user && (
              <button
                onClick={() => navigate('/profile')}
                className="md:hidden"
                aria-label="Profile"
              >
                <AvatarDisplay
                  config={user.avatar_config}
                  size="sm"
                  name={user.display_name || user.username}
                  animate
                />
              </button>
            )}
          </div>
        </header>

        {/* Pull-to-refresh indicator */}
        {(pulling || refreshing) && (
          <div
            className="flex items-center justify-center overflow-hidden transition-all duration-200"
            style={{ height: refreshing ? 48 : pullDistance }}
          >
            <Loader2
              size={20}
              className={`text-accent ${refreshing ? 'animate-spin' : ''}`}
              style={{
                opacity: refreshing ? 1 : Math.min(pullDistance / 40, 1),
                transform: refreshing ? 'none' : `rotate(${pullDistance * 3}deg)`,
              }}
            />
          </div>
        )}

        <main className="flex-1 p-4 pb-24 md:pb-6 overflow-x-clip">{children}</main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-surface border-t border-border" ref={moreRef}>
        {showMore && moreNavItems.length > 0 && (
          <div className="absolute bottom-full left-0 right-0 bg-surface border-t border-border">
            {moreNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => { navigate(item.path); setShowMore(false); }}
                  className={`flex items-center gap-3 w-full px-5 py-3 transition-colors text-left text-sm ${
                    active
                      ? 'bg-surface-raised text-cream'
                      : 'text-muted hover:text-cream hover:bg-surface-raised'
                  }`}
                >
                  <Icon size={16} className={active ? 'text-accent' : ''} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-around h-14 px-1">
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-md transition-colors min-w-0 ${
                  active ? 'text-accent' : 'text-muted'
                }`}
              >
                <Icon size={18} />
                <span className="text-[10px] font-medium leading-none truncate">
                  {item.label}
                </span>
              </button>
            );
          })}

          {moreNavItems.length > 0 && (
            <button
              onClick={() => setShowMore((v) => !v)}
              className={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-md transition-colors min-w-0 ${
                showMore || moreNavItems.some((item) => isActive(item.path))
                  ? 'text-accent'
                  : 'text-muted'
              }`}
            >
              <MoreHorizontal size={18} />
              <span className="text-[10px] font-medium leading-none truncate">
                More
              </span>
            </button>
          )}
        </div>
      </nav>
    </div>
  );
}
