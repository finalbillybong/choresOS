function withId(path, paramName, id) {
  if (!id) return path;
  const separator = path.includes('?') ? '&' : '?';
  return `${path}${separator}${paramName}=${encodeURIComponent(id)}`;
}

export function getNotificationTarget(notification) {
  const type = notification?.type;
  const referenceType = notification?.reference_type;
  const referenceId = notification?.reference_id;

  if (referenceType === 'chore' && referenceId) {
    return { path: `/chores/${referenceId}`, label: 'Open quest' };
  }

  if (
    (referenceType === 'chore_assignment' || referenceType === 'trade') &&
    referenceId
  ) {
    return {
      path: withId('/calendar', 'assignment', referenceId),
      label: 'Open assignment',
    };
  }

  if (referenceType === 'redemption') {
    return {
      path: withId('/rewards?tab=inventory', 'redemption', referenceId),
      label: 'Open reward',
    };
  }

  if (referenceType === 'avatar_item') {
    return { path: '/rewards?tab=avatar', label: 'Open avatar shop' };
  }

  if (referenceType === 'event') {
    return {
      path: withId('/events', 'event', referenceId),
      label: 'Open event',
    };
  }

  if (referenceType === 'announcement' || referenceType === 'shoutout') {
    return { path: '/party', label: 'Open party' };
  }

  if (referenceType === 'achievement') {
    return { path: '/profile?section=achievements', label: 'Open profile' };
  }

  if (referenceType === 'pet' || referenceType === 'streak' || referenceType === 'point_transaction') {
    return { path: '/profile', label: 'Open profile' };
  }

  if (type === 'chore_assigned') {
    return { path: '/chores', label: 'Open quests' };
  }

  if (type === 'avatar_item_drop') {
    return { path: '/rewards?tab=avatar', label: 'Open avatar shop' };
  }

  if (type === 'reward_approved' || type === 'reward_denied') {
    return { path: '/rewards?tab=inventory', label: 'Open reward' };
  }

  if (type === 'trade_proposed' || type === 'trade_accepted' || type === 'trade_denied') {
    return { path: '/calendar', label: 'Open calendar' };
  }

  if (type === 'announcement' || type === 'shoutout') {
    return { path: '/party', label: 'Open party' };
  }

  if (type === 'achievement_unlocked') {
    return { path: '/profile?section=achievements', label: 'Open profile' };
  }

  if (type === 'streak_milestone' || type === 'pet_levelup' || type === 'bonus_points') {
    return { path: '/profile', label: 'Open profile' };
  }

  return { path: '/', label: 'Open home' };
}
