export function isBadBehaviorCalendarEntry(entry) {
  return entry?.entry_type === 'bad_behavior';
}

export function isQuestCalendarEntry(entry) {
  return !isBadBehaviorCalendarEntry(entry);
}
