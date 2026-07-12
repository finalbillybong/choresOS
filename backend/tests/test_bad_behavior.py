import unittest
from datetime import datetime
from pathlib import Path
from types import SimpleNamespace

from backend.services.bad_behavior import (
    BAD_BEHAVIOR_REPEAT_INTERVAL,
    build_bad_behavior_calendar_entry,
    calculate_bad_behavior_penalty,
    get_bad_behavior_penalty_preview,
    normalize_behavior_title,
)


class FixedRandom:
    def __init__(self, value):
        self.value = value

    def randint(self, start, end):
        if not start <= self.value <= end:
            raise AssertionError("fixed value outside requested range")
        return self.value


class BadBehaviorPenaltyTest(unittest.TestCase):
    def test_normalizes_title_for_repeat_counting(self):
        self.assertEqual(
            normalize_behavior_title("  Krzyk   przy stole  "),
            "krzyk przy stole",
        )

    def test_preview_reports_range_and_repeats_until_fifth_occurrence(self):
        preview = get_bad_behavior_penalty_preview(previous_count=3, base_penalty=15)

        self.assertEqual(BAD_BEHAVIOR_REPEAT_INTERVAL, 5)
        self.assertEqual(preview.next_occurrence_count, 4)
        self.assertFalse(preview.bonus_will_trigger)
        self.assertEqual(preview.repetitions_until_bonus, 2)
        self.assertEqual(preview.bonus_min_penalty, 8)
        self.assertEqual(preview.bonus_max_penalty, 30)

    def test_every_fifth_occurrence_adds_random_bonus_penalty(self):
        result = calculate_bad_behavior_penalty(
            previous_count=4,
            base_penalty=20,
            rng=FixedRandom(150),
        )

        self.assertEqual(result.occurrence_count, 5)
        self.assertTrue(result.bonus_triggered)
        self.assertEqual(result.bonus_multiplier_percent, 150)
        self.assertEqual(result.bonus_penalty, 30)
        self.assertEqual(result.total_penalty, 50)
        self.assertEqual(result.repetitions_until_next_bonus, 5)

    def test_tenth_occurrence_also_triggers_bonus(self):
        result = calculate_bad_behavior_penalty(
            previous_count=9,
            base_penalty=10,
            rng=FixedRandom(50),
        )

        self.assertEqual(result.occurrence_count, 10)
        self.assertTrue(result.bonus_triggered)
        self.assertEqual(result.bonus_penalty, 5)
        self.assertEqual(result.total_penalty, 15)

    def test_calendar_entry_exposes_bad_behavior_as_informational_day_item(self):
        behavior = SimpleNamespace(
            id=42,
            user_id=7,
            title="Krzyk przy stole",
            note="Po obiedzie",
            base_penalty=10,
            bonus_penalty=15,
            bonus_multiplier_percent=150,
            total_penalty=25,
            occurrence_count=5,
            created_by=3,
            created_at=datetime(2026, 7, 9, 18, 30),
        )

        entry = build_bad_behavior_calendar_entry(
            behavior,
            user_name="Ola",
            created_by_name="Rodzic",
        )

        self.assertEqual(entry["entry_type"], "bad_behavior")
        self.assertEqual(entry["id"], "bad_behavior-42")
        self.assertEqual(entry["bad_behavior_id"], 42)
        self.assertEqual(entry["user_id"], 7)
        self.assertEqual(entry["date"], "2026-07-09")
        self.assertEqual(entry["title"], "Z\u0142e zachowanie: Krzyk przy stole")
        self.assertEqual(entry["total_penalty"], 25)
        self.assertEqual(entry["bonus_penalty"], 15)
        self.assertEqual(entry["bonus_multiplier_percent"], 150)
        self.assertIn("wylosowana", entry["detail"])


class BadBehaviorAvailabilityTest(unittest.TestCase):
    def test_router_has_no_feature_flag_guard(self):
        source = Path("backend/routers/bad_behaviors.py").read_text(encoding="utf-8")

        self.assertNotIn("feature_flags", source)
        self.assertNotIn("_require_feature_enabled", source)
        self.assertIn("Depends(require_parent)", source)


if __name__ == "__main__":
    unittest.main()
