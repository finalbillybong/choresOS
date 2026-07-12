export const BAD_BEHAVIOR_REPEAT_INTERVAL = 5;
export const BAD_BEHAVIOR_MIN_BONUS_PERCENT = 50;
export const BAD_BEHAVIOR_MAX_BONUS_PERCENT = 200;

export function normalizeBehaviorTitle(title) {
  return String(title || '').trim().replace(/\s+/g, ' ').toLocaleLowerCase('pl-PL');
}

export function percentPenalty(basePenalty, percent) {
  const base = Number.parseInt(basePenalty, 10);
  if (!Number.isFinite(base) || base <= 0) return 0;
  return Math.max(1, Math.floor((base * percent + 50) / 100));
}

function repetitionsUntilBonus(count) {
  const previous = Math.max(0, Number.parseInt(count, 10) || 0);
  const remainder = previous % BAD_BEHAVIOR_REPEAT_INTERVAL;
  return remainder === 0
    ? BAD_BEHAVIOR_REPEAT_INTERVAL
    : BAD_BEHAVIOR_REPEAT_INTERVAL - remainder;
}

export function calculateBadBehaviorPreview({ previousCount, basePenalty }) {
  const previous = Math.max(0, Number.parseInt(previousCount, 10) || 0);
  const base = Math.max(0, Number.parseInt(basePenalty, 10) || 0);
  const nextOccurrenceCount = previous + 1;
  const repetitionsUntil = repetitionsUntilBonus(previous);

  return {
    nextOccurrenceCount,
    bonusWillTrigger: nextOccurrenceCount % BAD_BEHAVIOR_REPEAT_INTERVAL === 0,
    repetitionsUntilBonus: repetitionsUntil,
    nextBonusAt: nextOccurrenceCount + repetitionsUntil - 1,
    bonusMinPercent: BAD_BEHAVIOR_MIN_BONUS_PERCENT,
    bonusMaxPercent: BAD_BEHAVIOR_MAX_BONUS_PERCENT,
    bonusMinPenalty: percentPenalty(base, BAD_BEHAVIOR_MIN_BONUS_PERCENT),
    bonusMaxPenalty: percentPenalty(base, BAD_BEHAVIOR_MAX_BONUS_PERCENT),
  };
}
