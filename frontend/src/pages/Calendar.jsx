import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../hooks/useAuth';
import { useSettings } from '../hooks/useSettings';
import { useTheme } from '../hooks/useTheme';
import {
  addCalendarDays,
  formatLocalISODate,
  getMondayForCalendarWeek,
  parseLocalISODate,
} from '../utils/calendarDates';
import { themedTitle } from '../utils/questThemeText';
import Modal from '../components/Modal';
import {
  ChevronLeft,
  ChevronRight,
  CheckCheck,
  Clock,
  Slash,
  ArrowRightLeft,
  CalendarDays,
  Loader2,
  X,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { isBadBehaviorCalendarEntry } from '../utils/calendarEntries';

const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function statusStyle(assignment, dayStr) {
  const today = formatLocalISODate(new Date());

  if (assignment.status === 'verified') {
    return {
      border: 'border-emerald',
      bg: 'bg-emerald/10',
      icon: <CheckCheck size={16} className="text-emerald" />,
    };
  }
  if (assignment.status === 'completed') {
    return {
      border: 'border-emerald',
      bg: 'bg-emerald/5',
      icon: <CheckCheck size={16} className="text-emerald/60" />,
    };
  }
  if (assignment.status === 'skipped') {
    return {
      border: 'border-border',
      bg: 'bg-navy-light/50',
      icon: <Slash size={16} className="text-muted" />,
      textClass: 'line-through text-muted',
    };
  }
  // pending
  if (dayStr < today) {
    // overdue
    return {
      border: 'border-crimson',
      bg: 'bg-crimson/5',
      icon: <Clock size={16} className="text-crimson" />,
    };
  }
  return {
    border: 'border-border',
    bg: '',
    icon: <Clock size={16} className="text-muted" />,
  };
}

export default function Calendar() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { chore_trading_enabled } = useSettings();
  const { colorTheme } = useTheme();
  const isKid = user?.role === 'kid';
  const assignmentParam = searchParams.get('assignment');
  const focusedAssignmentId = assignmentParam ? Number(assignmentParam) : null;

  const [startDate, setStartDate] = useState(() => formatLocalISODate(new Date()));
  const [assignments, setAssignments] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Trade modal
  const [tradeModal, setTradeModal] = useState(false);
  const [tradeAssignment, setTradeAssignment] = useState(null);
  const [familyKids, setFamilyKids] = useState([]);
  const [selectedKid, setSelectedKid] = useState('');
  const [tradeSubmitting, setTradeSubmitting] = useState(false);
  const [tradeError, setTradeError] = useState('');
  const [removingId, setRemovingId] = useState(null);
  const [removeTarget, setRemoveTarget] = useState(null);
  const [cleaning, setCleaning] = useState(false);
  const [cleanMsg, setCleanMsg] = useState('');

  const fetchCalendar = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // The backend requires week_start to be a Monday. Our 7-day window
      // may span two Mon-Sun weeks, so fetch both if needed.
      const monday1 = getMondayForCalendarWeek(startDate);

      const data = await api(`/api/calendar?week_start=${monday1}`);
      const byDay = {};
      for (let i = 0; i < 7; i++) {
        const dayKey = addCalendarDays(startDate, i);
        byDay[dayKey] = data.days?.[dayKey] || [];
      }

      // If our window extends past Sunday of that week, fetch next week too
      const monday2 = addCalendarDays(monday1, 7);
      const lastDay = addCalendarDays(startDate, 6);
      const sunday1 = addCalendarDays(monday1, 6);
      if (lastDay > sunday1) {
        try {
          const data2 = await api(`/api/calendar?week_start=${monday2}`);
          for (let i = 0; i < 7; i++) {
            const dayKey = addCalendarDays(startDate, i);
            if (!byDay[dayKey]?.length && data2.days?.[dayKey]) {
              byDay[dayKey] = data2.days[dayKey];
            }
          }
        } catch { /* second fetch is best-effort */ }
      }
      setAssignments(byDay);
    } catch (err) {
      setError(err.message || 'Failed to load calendar');
    } finally {
      setLoading(false);
    }
  }, [startDate]);

  useEffect(() => {
    fetchCalendar();
  }, [fetchCalendar]);

  useEffect(() => {
    if (!Number.isFinite(focusedAssignmentId)) return;

    let ignore = false;
    api(`/api/calendar/assignments/${focusedAssignmentId}`)
      .then((assignment) => {
        if (!ignore && assignment?.date) {
          setStartDate(assignment.date);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.message || 'Could not load notification target');
        }
      });

    return () => {
      ignore = true;
    };
  }, [focusedAssignmentId]);

  // Live updates via WebSocket
  useEffect(() => {
    const handler = () => { fetchCalendar(); };
    window.addEventListener('ws:message', handler);
    return () => window.removeEventListener('ws:message', handler);
  }, [fetchCalendar]);

  useEffect(() => {
    if (loading || !Number.isFinite(focusedAssignmentId)) return;

    const timeout = window.setTimeout(() => {
      document
        .getElementById(`calendar-assignment-${focusedAssignmentId}`)
        ?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [assignments, focusedAssignmentId, loading]);

  const prevWeek = () => setStartDate(addCalendarDays(startDate, -7));
  const nextWeek = () => setStartDate(addCalendarDays(startDate, 7));
  const goToday = () => setStartDate(formatLocalISODate(new Date()));

  const openTrade = async (assignment) => {
    setTradeAssignment(assignment);
    setTradeError('');
    setSelectedKid('');
    setTradeModal(true);
    try {
      const data = await api('/api/stats/kids');
      const kids = (data || []).filter((k) => k.id !== user.id);
      setFamilyKids(kids);
    } catch {
      setFamilyKids([]);
    }
  };

  const submitTrade = async () => {
    if (!selectedKid) {
      setTradeError('Select a hero to trade with');
      return;
    }
    setTradeSubmitting(true);
    setTradeError('');
    try {
      await api('/api/calendar/trade', {
        method: 'POST',
        body: {
          assignment_id: tradeAssignment.id,
          target_user_id: selectedKid,
        },
      });
      setTradeModal(false);
      fetchCalendar();
    } catch (err) {
      setTradeError(err.message || 'Trade failed');
    } finally {
      setTradeSubmitting(false);
    }
  };

  const removeAssignment = async (assignmentId, allFuture = false) => {
    setRemovingId(assignmentId);
    setRemoveTarget(null);
    try {
      const qs = allFuture ? '?all_future=true' : '';
      await api(`/api/calendar/assignments/${assignmentId}${qs}`, { method: 'DELETE' });
      fetchCalendar();
    } catch (err) {
      setError(err.message || 'Failed to remove quest');
    } finally {
      setRemovingId(null);
    }
  };

  const cleanupStale = async () => {
    setCleaning(true);
    setCleanMsg('');
    try {
      const data = await api('/api/chores/cleanup-all-stale', { method: 'POST' });
      setCleanMsg(data.message || 'Cleanup complete');
      fetchCalendar();
    } catch (err) {
      setError(err.message || 'Cleanup failed');
    } finally {
      setCleaning(false);
    }
  };

  const endDate = addCalendarDays(startDate, 6);
  const today = formatLocalISODate(new Date());
  const isAtToday = startDate === today;
  const formatShortDate = (str) => {
    const d = parseLocalISODate(str);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-cream text-lg font-semibold">
          Calendar
        </h1>

        {/* Week navigation */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1">
            <button
              onClick={prevWeek}
              className="p-2 rounded hover:bg-surface-raised transition-colors text-muted hover:text-cream"
              aria-label="Previous week"
            >
              <ChevronLeft size={20} />
            </button>

            <span className="text-cream text-sm min-w-[140px] sm:min-w-[180px] text-center">
              {formatShortDate(startDate)} &ndash; {formatShortDate(endDate)}
            </span>

            <button
              onClick={nextWeek}
              className="p-2 rounded hover:bg-surface-raised transition-colors text-muted hover:text-cream"
              aria-label="Next 7 days"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {!isAtToday && (
            <button onClick={goToday} className="game-btn game-btn-blue">
              Today
            </button>
          )}

          {!isKid && (
            <button
              onClick={cleanupStale}
              disabled={cleaning}
              className="game-btn game-btn-red flex items-center gap-1"
              title="Remove all overdue pending quests and reset exclusions"
            >
              {cleaning ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Trash2 size={14} />
              )}
              Clean Up
            </button>
          )}
        </div>
      </div>

      {/* Cleanup success message */}
      {cleanMsg && (
        <div className="mb-4 p-3 rounded-md border border-emerald/30 bg-emerald/10 text-emerald text-sm text-center">
          {cleanMsg}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 rounded-md border border-crimson/30 bg-crimson/10 text-crimson text-sm text-center">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="text-accent animate-spin" />
        </div>
      )}

      {/* Calendar Grid — 7 days starting from startDate */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {Array.from({ length: 7 }, (_, i) => {
            const dayStr = addCalendarDays(startDate, i);
            const d = parseLocalISODate(dayStr);
            const label = SHORT_DAYS[d.getDay()];
            const isToday = dayStr === today;
            const allDayAssignments = assignments[dayStr] || [];
            const dayAssignments = isKid
              ? allDayAssignments.filter((a) => a.user_id === user?.id)
              : allDayAssignments;

            return (
              <div key={dayStr} className="min-w-0">
                {/* Day header */}
                <div
                  className={`text-center py-2 px-1 rounded-t-md border-b ${
                    isToday
                      ? 'bg-accent/10 border-accent text-accent'
                      : 'bg-surface-raised/30 border-border text-muted'
                  }`}
                >
                  <div className="text-xs font-medium">
                    {label}
                  </div>
                  <div className="text-sm mt-1">
                    {parseLocalISODate(dayStr).getDate()}
                  </div>
                </div>

                {/* Assignments */}
                <div className="space-y-2 mt-2 min-h-[80px]">
                  {dayAssignments.length === 0 && (
                    <p className="text-muted text-xs text-center py-4">
                      No quests
                    </p>
                  )}
                  {dayAssignments.map((a) => {
                    if (isBadBehaviorCalendarEntry(a)) {
                      return (
                        <div
                          key={a.id}
                          className="game-panel !border border-crimson/50 bg-crimson/10 p-2"
                        >
                          <div className="flex items-start gap-1.5">
                            <AlertTriangle size={16} className="text-crimson flex-shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm leading-tight text-cream font-medium break-words">
                                {a.title || 'Z\u0142e zachowanie'}
                              </p>
                              <span className="inline-flex mt-1 text-crimson text-xs font-semibold">
                                -{a.total_penalty} XP
                              </span>
                              {!isKid && a.user?.display_name && (
                                <p className="text-xs text-purple font-medium mt-0.5 truncate">
                                  {a.user.display_name}
                                </p>
                              )}
                              <p className="text-muted text-xs mt-1 leading-relaxed">
                                Wpis nr {a.occurrence_count}
                                {a.bonus_penalty > 0
                                  ? `, losowanie ${a.bonus_multiplier_percent}% (+${a.bonus_penalty} XP kary)`
                                  : ''}
                              </p>
                              {a.note && (
                                <p className="text-muted text-xs mt-1 leading-relaxed">
                                  {a.note}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    }

                    const style = statusStyle(a, dayStr);
                    const isFocusedAssignment = focusedAssignmentId === Number(a.id);
                    return (
                      <div
                        key={a.id}
                        id={`calendar-assignment-${a.id}`}
                        data-notification-target={isFocusedAssignment ? 'true' : undefined}
                        className={`game-panel !border ${style.border} ${style.bg} p-2 cursor-pointer hover:border-accent/40 transition-colors ${
                          isFocusedAssignment ? 'ring-2 ring-accent border-accent/70' : ''
                        }`}
                        onClick={() =>
                          navigate(`/chores/${a.chore_id || a.id}`)
                        }
                      >
                        <div className="flex items-start gap-1.5">
                          {style.icon}
                          <div className="min-w-0 flex-1">
                            <p
                              className={`text-sm leading-tight truncate ${
                                style.textClass || 'text-cream'
                              }`}
                            >
                              {themedTitle(a.chore?.title || a.chore_title || 'Quest', colorTheme)}
                            </p>
                            {/* Show assigned kid for parents */}
                            {!isKid && (a.user?.display_name || a.assigned_to_name) && (
                              <p className="text-xs text-purple font-medium mt-0.5 truncate">
                                {a.user?.display_name || a.assigned_to_name}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Trade button for kids */}
                        {isKid && chore_trading_enabled && a.status === 'pending' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openTrade(a);
                            }}
                            className="mt-1.5 flex items-center gap-1 text-xs font-medium text-accent hover:text-accent/80 transition-colors"
                          >
                            <ArrowRightLeft size={12} />
                            Trade
                          </button>
                        )}

                        {/* Remove button for parents on pending assignments */}
                        {!isKid && a.status === 'pending' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const isRecurring = a.chore?.recurrence && a.chore.recurrence !== 'once';
                              if (isRecurring) {
                                setRemoveTarget(a);
                              } else {
                                removeAssignment(a.id);
                              }
                            }}
                            disabled={removingId === a.id}
                            className="mt-1.5 flex items-center gap-1 text-xs font-medium text-crimson hover:text-crimson/80 transition-colors"
                          >
                            {removingId === a.id ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <X size={12} />
                            )}
                            Remove
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {!loading &&
        !error &&
        Object.values(assignments).every((arr) => arr.length === 0) && (
          <div className="text-center py-16">
            <p className="text-muted text-sm">
              No tasks scheduled this week.
            </p>
          </div>
        )}

      {/* Trade Modal */}
      <Modal
        isOpen={tradeModal}
        onClose={() => setTradeModal(false)}
        title="Propose a Trade"
        actions={[
          {
            label: 'Cancel',
            onClick: () => setTradeModal(false),
            className: 'game-btn game-btn-red',
          },
          {
            label: tradeSubmitting ? 'Sending...' : 'Send Trade',
            onClick: submitTrade,
            className: 'game-btn game-btn-blue',
            disabled: tradeSubmitting || !selectedKid,
          },
        ]}
      >
        <div className="space-y-4">
          <p className="text-muted text-sm">
            Trade{' '}
            <span className="text-cream font-medium">
              {themedTitle(tradeAssignment?.chore?.title || tradeAssignment?.chore_title || 'Quest', colorTheme)}
            </span>{' '}
            with another member:
          </p>

          {tradeError && (
            <div className="p-2 rounded border border-crimson/40 bg-crimson/10 text-crimson text-sm">
              {tradeError}
            </div>
          )}

          {familyKids.length === 0 ? (
            <p className="text-muted text-sm">
              No other members found in your family.
            </p>
          ) : (
            <div className="space-y-2">
              {familyKids.map((kid) => (
                <button
                  key={kid.id}
                  onClick={() => setSelectedKid(kid.id)}
                  className={`w-full text-left p-3 rounded-md border transition-colors ${
                    selectedKid === kid.id
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-border text-muted hover:border-cream/30'
                  }`}
                >
                  <span className="text-sm">
                    {kid.display_name || kid.username}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Remove Recurring Quest Modal */}
      <Modal
        isOpen={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        title="Remove Recurring Quest"
        actions={[
          {
            label: 'Cancel',
            onClick: () => setRemoveTarget(null),
            className: 'game-btn game-btn-blue',
          },
          {
            label: 'Just This One',
            onClick: () => removeAssignment(removeTarget?.id, false),
            className: 'game-btn game-btn-red',
          },
          {
            label: 'All Future',
            onClick: () => removeAssignment(removeTarget?.id, true),
            className: 'game-btn game-btn-red',
          },
        ]}
      >
        <p className="text-muted text-sm">
          <span className="text-cream font-bold">
            {themedTitle(removeTarget?.chore?.title || 'Quest', colorTheme)}
          </span>{' '}
          is recurring{removeTarget?.user?.display_name ? ` for ${removeTarget.user.display_name}` : ''}.
          Remove just this instance, or all future pending instances?
        </p>
      </Modal>
    </div>
  );
}
