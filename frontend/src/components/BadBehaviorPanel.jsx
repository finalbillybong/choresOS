import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BadgeMinus,
  Dice5,
  History,
  Loader2,
  RefreshCw,
  Send,
} from 'lucide-react';
import { api } from '../api/client';
import {
  calculateBadBehaviorPreview,
  normalizeBehaviorTitle,
} from '../utils/badBehaviorPenalty';

function formatDate(value) {
  if (!value) return '';
  try {
    return new Intl.DateTimeFormat('pl-PL', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch {
    return '';
  }
}

export default function BadBehaviorPanel({ kids = [], onRecorded }) {
  const [kidId, setKidId] = useState('');
  const [title, setTitle] = useState('');
  const [basePenalty, setBasePenalty] = useState('10');
  const [note, setNote] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const kidIds = useMemo(() => new Set(kids.map((kid) => String(kid.id))), [kids]);

  useEffect(() => {
    if (kids.length === 0) {
      setKidId('');
      return;
    }
    if (!kidId || !kidIds.has(String(kidId))) {
      setKidId(String(kids[0].id));
    }
  }, [kidId, kidIds, kids]);

  const fetchHistory = useCallback(async () => {
    if (!kidId) {
      setSuggestions([]);
      setRecent([]);
      return;
    }

    setLoadingHistory(true);
    try {
      const userId = encodeURIComponent(kidId);
      const [suggestionData, recentData] = await Promise.all([
        api(`/api/bad-behaviors/suggestions?user_id=${userId}`),
        api(`/api/bad-behaviors?user_id=${userId}&limit=12`),
      ]);
      setSuggestions(Array.isArray(suggestionData) ? suggestionData : []);
      setRecent(Array.isArray(recentData) ? recentData : []);
    } catch (err) {
      setError(err.message || 'Nie udało się pobrać historii zachowań.');
    } finally {
      setLoadingHistory(false);
    }
  }, [kidId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const normalizedTitle = normalizeBehaviorTitle(title);
  const suggestionByTitle = useMemo(() => {
    const map = new Map();
    suggestions.forEach((item) => map.set(item.title_normalized, item));
    return map;
  }, [suggestions]);
  const selectedSuggestion = suggestionByTitle.get(normalizedTitle);
  const previousCount = selectedSuggestion?.count || 0;
  const parsedBasePenalty = Number.parseInt(basePenalty, 10) || 0;
  const preview = calculateBadBehaviorPreview({
    previousCount,
    basePenalty: parsedBasePenalty,
  });

  const chooseSuggestion = (item) => {
    setTitle(item.title);
    setBasePenalty(String(item.last_base_penalty || parsedBasePenalty || 10));
    setResult(null);
    setError('');
  };

  const submit = async () => {
    setError('');
    setResult(null);

    if (!kidId) {
      setError('Wybierz dziecko.');
      return;
    }
    if (!title.trim()) {
      setError('Wpisz tytuł zachowania.');
      return;
    }
    if (!parsedBasePenalty || parsedBasePenalty <= 0) {
      setError('Wpisz dodatnią liczbę XP do odjęcia.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await api('/api/bad-behaviors', {
        method: 'POST',
        body: {
          user_id: Number.parseInt(kidId, 10),
          title: title.trim(),
          base_penalty: parsedBasePenalty,
          note: note.trim() || null,
        },
      });
      setResult(response);
      setNote('');
      await fetchHistory();
      if (onRecorded) await onRecorded();
    } catch (err) {
      setError(err.message || 'Nie udało się zapisać zachowania.');
    } finally {
      setSubmitting(false);
    }
  };

  const showPreview = kidId && normalizedTitle && parsedBasePenalty > 0;

  return (
    <section className="game-panel p-4 space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-cream text-sm font-semibold flex items-center gap-2">
            <BadgeMinus size={15} className="text-crimson" />
            Złe zachowanie
          </h2>
          <p className="text-muted text-xs mt-1 leading-relaxed">
            Rodzic może odjąć XP. Co każde 5. powtórzenie tego samego tytułu
            uruchamia losową dodatkową karę 50-200% bazowej wartości.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchHistory}
          disabled={loadingHistory || !kidId}
          className="game-btn game-btn-blue !px-3 !py-2 flex items-center justify-center gap-1.5 text-xs"
          title="Odśwież historię"
        >
          {loadingHistory ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <RefreshCw size={12} />
          )}
          Odśwież
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-md border border-crimson/30 bg-crimson/10 text-crimson text-sm flex items-start gap-2">
          <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-cream text-sm font-medium mb-1">
            Dziecko
          </label>
          <select
            value={kidId}
            onChange={(event) => {
              setKidId(event.target.value);
              setResult(null);
              setError('');
            }}
            className="field-input text-sm"
            disabled={kids.length === 0}
          >
            {kids.length === 0 ? (
              <option value="">Brak dzieci w rodzinie</option>
            ) : (
              kids.map((kid) => (
                <option key={kid.id} value={kid.id}>
                  {kid.display_name}
                </option>
              ))
            )}
          </select>
        </div>

        <div>
          <label className="block text-cream text-sm font-medium mb-1">
            XP do odjęcia
          </label>
          <input
            type="number"
            min="1"
            max="10000"
            value={basePenalty}
            onChange={(event) => {
              setBasePenalty(event.target.value);
              setResult(null);
            }}
            className="field-input text-sm"
            placeholder="10"
          />
        </div>
      </div>

      <div>
        <label className="block text-cream text-sm font-medium mb-1">
          Tytuł zachowania
        </label>
        <input
          type="text"
          value={title}
          onChange={(event) => {
            setTitle(event.target.value.slice(0, 200));
            setResult(null);
          }}
          className="field-input text-sm"
          placeholder="np. Krzyk przy stole"
          maxLength={200}
        />
      </div>

      <div>
        <label className="block text-cream text-sm font-medium mb-1">
          Notatka (opcjonalnie)
        </label>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value.slice(0, 1000))}
          className="field-input text-sm min-h-20 resize-y"
          placeholder="Krótki kontekst dla rodzica."
          maxLength={1000}
        />
      </div>

      <div className="rounded-lg border border-border/50 bg-surface-raised/30 p-3">
        <div className="flex items-start gap-2">
          <Dice5 size={16} className="text-gold mt-0.5 flex-shrink-0" />
          <div className="min-w-0 space-y-1">
            <p className="text-cream text-sm font-medium">
              Podgląd kary
            </p>
            {!showPreview ? (
              <p className="text-muted text-xs leading-relaxed">
                Wybierz dziecko, wpisz tytuł i dodatnią liczbę XP. Możesz też
                wybrać tytuł z listy poprzednich zachowań.
              </p>
            ) : (
              <div className="text-muted text-xs leading-relaxed space-y-1">
                <p>
                  Ten tytuł ma już {previousCount} zapisów. Następny zapis będzie
                  numerem {preview.nextOccurrenceCount}.
                </p>
                <p>
                  Widełki dodatkowej kary: losowanie {preview.bonusMinPercent}-
                  {preview.bonusMaxPercent}% z {parsedBasePenalty} XP, czyli{' '}
                  {preview.bonusMinPenalty}-{preview.bonusMaxPenalty} XP.
                </p>
                {preview.bonusWillTrigger ? (
                  <p className="text-gold font-medium">
                    Ten zapis uruchomi losowanie, bo wypada{' '}
                    {preview.nextOccurrenceCount}. powtórzenie.
                  </p>
                ) : (
                  <p>
                    Do losowania zostało {preview.repetitionsUntilBonus}{' '}
                    powtórzeń. Najbliższe losowanie przy {preview.nextBonusAt}.
                    zapisie.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={submit}
        disabled={submitting || !kidId || !title.trim() || parsedBasePenalty <= 0}
        className="game-btn game-btn-red w-full flex items-center justify-center gap-2"
      >
        {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
        Zapisz i odejmij XP
      </button>

      {result && (
        <div className="rounded-lg border border-gold/30 bg-gold/10 p-3">
          <p className="text-cream text-sm font-medium">
            Odjęto {result.total_penalty} XP za: {result.title}
          </p>
          {result.bonus_penalty > 0 ? (
            <p className="text-muted text-xs mt-1 leading-relaxed">
              To {result.occurrence_count}. powtórzenie. Dodatkowa kara została
              wylosowana: {result.bonus_multiplier_percent}% z{' '}
              {result.base_penalty} XP = {result.bonus_penalty} XP.
            </p>
          ) : (
            <p className="text-muted text-xs mt-1 leading-relaxed">
              Do kolejnego losowania zostało{' '}
              {result.repetitions_until_next_bonus} powtórzeń.
            </p>
          )}
          {result.new_balance !== null && result.new_balance !== undefined && (
            <p className="text-muted text-xs mt-1">
              Nowe saldo: <span className="text-gold font-medium">{result.new_balance} XP</span>
            </p>
          )}
        </div>
      )}

      <div className="grid gap-3 lg:grid-cols-2">
        <div>
          <h3 className="text-cream text-sm font-semibold flex items-center gap-2 mb-2">
            <History size={14} className="text-muted" />
            Poprzednie tytuły
          </h3>
          {loadingHistory ? (
            <div className="text-muted text-sm py-3 flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" />
              Ładowanie historii...
            </div>
          ) : suggestions.length === 0 ? (
            <p className="text-muted text-xs py-2">
              Brak poprzednich złych zachowań dla wybranego dziecka.
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {suggestions.map((item) => {
                const itemPreview = calculateBadBehaviorPreview({
                  previousCount: item.count,
                  basePenalty: item.last_base_penalty,
                });
                return (
                  <button
                    key={item.title_normalized}
                    type="button"
                    onClick={() => chooseSuggestion(item)}
                    className="w-full text-left rounded-lg border border-border/50 bg-surface-raised/20 hover:border-crimson/40 hover:bg-crimson/10 transition-colors p-3"
                  >
                    <span className="block text-cream text-sm font-medium">
                      {item.title}
                    </span>
                    <span className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted">
                      <span>{item.count} powtórzeń</span>
                      <span>ostatnio -{item.last_total_penalty} XP</span>
                      <span>losowanie przy {itemPreview.nextBonusAt}. zapisie</span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-cream text-sm font-semibold mb-2">
            Ostatnie wpisy
          </h3>
          {recent.length === 0 ? (
            <p className="text-muted text-xs py-2">
              Historia będzie widoczna po pierwszym wpisie.
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {recent.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border border-border/50 bg-surface-raised/20 p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-cream text-sm font-medium truncate">
                        {item.title}
                      </p>
                      <p className="text-muted text-[11px] mt-0.5">
                        {formatDate(item.created_at)} · wpis nr{' '}
                        {item.occurrence_count}
                      </p>
                    </div>
                    <span className="text-crimson text-sm font-semibold flex-shrink-0">
                      -{item.total_penalty} XP
                    </span>
                  </div>
                  {item.bonus_penalty > 0 && (
                    <p className="text-gold text-xs mt-1">
                      Losowanie {item.bonus_multiplier_percent}%: +
                      {item.bonus_penalty} XP kary
                    </p>
                  )}
                  {item.note && (
                    <p className="text-muted text-xs mt-1 leading-relaxed">
                      {item.note}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
