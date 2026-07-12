import random
import re
from dataclasses import dataclass


BAD_BEHAVIOR_REPEAT_INTERVAL = 5
BAD_BEHAVIOR_MIN_BONUS_PERCENT = 50
BAD_BEHAVIOR_MAX_BONUS_PERCENT = 200


@dataclass(frozen=True)
class BadBehaviorPenaltyPreview:
    next_occurrence_count: int
    bonus_will_trigger: bool
    repetitions_until_bonus: int
    bonus_min_penalty: int
    bonus_max_penalty: int
    bonus_min_percent: int = BAD_BEHAVIOR_MIN_BONUS_PERCENT
    bonus_max_percent: int = BAD_BEHAVIOR_MAX_BONUS_PERCENT


@dataclass(frozen=True)
class BadBehaviorPenaltyResult:
    occurrence_count: int
    base_penalty: int
    bonus_triggered: bool
    bonus_multiplier_percent: int | None
    bonus_penalty: int
    total_penalty: int
    repetitions_until_next_bonus: int
    next_bonus_at: int
    bonus_min_penalty: int
    bonus_max_penalty: int
    bonus_min_percent: int = BAD_BEHAVIOR_MIN_BONUS_PERCENT
    bonus_max_percent: int = BAD_BEHAVIOR_MAX_BONUS_PERCENT


def normalize_behavior_title(title: str) -> str:
    return re.sub(r"\s+", " ", title.strip()).casefold()


def _percent_penalty(base_penalty: int, percent: int) -> int:
    if base_penalty <= 0:
        raise ValueError("base_penalty must be positive")
    return max(1, (base_penalty * percent + 50) // 100)


def _repetitions_until_bonus(count: int) -> int:
    remainder = count % BAD_BEHAVIOR_REPEAT_INTERVAL
    if remainder == 0:
        return BAD_BEHAVIOR_REPEAT_INTERVAL
    return BAD_BEHAVIOR_REPEAT_INTERVAL - remainder


def get_bad_behavior_penalty_preview(
    previous_count: int,
    base_penalty: int,
) -> BadBehaviorPenaltyPreview:
    if previous_count < 0:
        raise ValueError("previous_count cannot be negative")
    next_count = previous_count + 1
    return BadBehaviorPenaltyPreview(
        next_occurrence_count=next_count,
        bonus_will_trigger=next_count % BAD_BEHAVIOR_REPEAT_INTERVAL == 0,
        repetitions_until_bonus=_repetitions_until_bonus(previous_count),
        bonus_min_penalty=_percent_penalty(base_penalty, BAD_BEHAVIOR_MIN_BONUS_PERCENT),
        bonus_max_penalty=_percent_penalty(base_penalty, BAD_BEHAVIOR_MAX_BONUS_PERCENT),
    )


def calculate_bad_behavior_penalty(
    previous_count: int,
    base_penalty: int,
    rng=random,
) -> BadBehaviorPenaltyResult:
    preview = get_bad_behavior_penalty_preview(previous_count, base_penalty)
    bonus_multiplier_percent = None
    bonus_penalty = 0

    if preview.bonus_will_trigger:
        bonus_multiplier_percent = rng.randint(
            BAD_BEHAVIOR_MIN_BONUS_PERCENT,
            BAD_BEHAVIOR_MAX_BONUS_PERCENT,
        )
        bonus_penalty = _percent_penalty(base_penalty, bonus_multiplier_percent)

    occurrence_count = preview.next_occurrence_count
    return BadBehaviorPenaltyResult(
        occurrence_count=occurrence_count,
        base_penalty=base_penalty,
        bonus_triggered=preview.bonus_will_trigger,
        bonus_multiplier_percent=bonus_multiplier_percent,
        bonus_penalty=bonus_penalty,
        total_penalty=base_penalty + bonus_penalty,
        repetitions_until_next_bonus=_repetitions_until_bonus(occurrence_count),
        next_bonus_at=occurrence_count + _repetitions_until_bonus(occurrence_count),
        bonus_min_penalty=preview.bonus_min_penalty,
        bonus_max_penalty=preview.bonus_max_penalty,
    )


def build_bad_behavior_calendar_entry(
    behavior,
    *,
    user_name: str | None = None,
    created_by_name: str | None = None,
) -> dict:
    detail = f"Odj\u0119to {behavior.total_penalty} XP."
    if behavior.bonus_penalty:
        detail += (
            f" To {behavior.occurrence_count}. powt\u00f3rzenie; dodatkowa kara "
            f"zosta\u0142a wylosowana: {behavior.bonus_multiplier_percent}% "
            f"z {behavior.base_penalty} XP = {behavior.bonus_penalty} XP."
        )
    else:
        detail += f" Wpis nr {behavior.occurrence_count} dla tego tytu\u0142u."

    return {
        "entry_type": "bad_behavior",
        "id": f"bad_behavior-{behavior.id}",
        "bad_behavior_id": behavior.id,
        "user_id": behavior.user_id,
        "user": {
            "id": behavior.user_id,
            "display_name": user_name,
        },
        "date": behavior.created_at.date().isoformat(),
        "created_at": behavior.created_at.isoformat(),
        "title": f"Z\u0142e zachowanie: {behavior.title}",
        "behavior_title": behavior.title,
        "note": behavior.note,
        "base_penalty": behavior.base_penalty,
        "bonus_penalty": behavior.bonus_penalty,
        "bonus_multiplier_percent": behavior.bonus_multiplier_percent,
        "total_penalty": behavior.total_penalty,
        "occurrence_count": behavior.occurrence_count,
        "created_by": behavior.created_by,
        "created_by_name": created_by_name,
        "status": "bad_behavior",
        "detail": detail,
    }
