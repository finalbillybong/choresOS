import unittest

from backend.seed import DEFAULT_AVATAR_ITEMS


class AvatarThemeSeedTest(unittest.TestCase):
    def test_seed_contains_safe_themed_avatar_items(self):
        expected_items = {
            "idol_waves",
            "star_headset",
            "stage_mic",
            "neon_pulse",
            "hunter_hood",
            "spirit_blade",
            "rune_marks",
            "moon_sigil",
            "kitty_bow_ears",
            "bell_collar",
            "whiskers",
            "tiny_bows",
            "mischief_hood",
            "mischief_mark",
            "bat_stars",
        }
        seeded_ids = {item[1] for item in DEFAULT_AVATAR_ITEMS}

        self.assertTrue(expected_items.issubset(seeded_ids))

    def test_seed_names_do_not_use_external_brand_terms(self):
        disallowed_terms = [
            "blackpink",
            "black pink",
            "hello kitty",
            "kuromi",
            "huntrix",
            "huntr/x",
        ]
        visible_text = " ".join(item[2] for item in DEFAULT_AVATAR_ITEMS).lower()

        for term in disallowed_terms:
            self.assertNotIn(term, visible_text)


if __name__ == "__main__":
    unittest.main()
