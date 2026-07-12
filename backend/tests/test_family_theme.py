import inspect
import unittest

from fastapi.params import Depends

from backend.dependencies import get_current_user, require_parent
from backend.routers.theme import get_special_theme, update_special_theme
from backend.services.family_theme import normalize_special_theme


class FamilyThemeTest(unittest.TestCase):
    def test_accepts_supported_special_themes(self):
        for value in ("none", "easter", "christmas"):
            self.assertEqual(normalize_special_theme(value), value)

    def test_rejects_unknown_special_theme(self):
        with self.assertRaises(ValueError):
            normalize_special_theme("halloween")

    def test_read_requires_authenticated_user(self):
        dependency = inspect.signature(get_special_theme).parameters["_user"].default

        self.assertIsInstance(dependency, Depends)
        self.assertIs(dependency.dependency, get_current_user)

    def test_write_requires_parent_or_admin(self):
        dependency = inspect.signature(update_special_theme).parameters["_parent"].default

        self.assertIsInstance(dependency, Depends)
        self.assertIs(dependency.dependency, require_parent)


if __name__ == "__main__":
    unittest.main()
