import unittest


try:
    from backend.services.polish_push import (
        NO_PUSH_SUBSCRIPTIONS_DETAIL,
        format_push_test_result,
        translate_push_payload,
    )
except ModuleNotFoundError:
    translate_push_payload = None
    format_push_test_result = None
    NO_PUSH_SUBSCRIPTIONS_DETAIL = None


class PolishPushTranslationTest(unittest.TestCase):
    def setUp(self):
        if translate_push_payload is None:
            self.fail("backend.services.polish_push is missing")

    def test_translates_test_push_payload(self):
        title, body = translate_push_payload(
            "ChoreQuest Test",
            "Push notifications are working!",
        )

        self.assertEqual(title, "Test ChoreQuest")
        self.assertEqual(body, "Powiadomienia push działają!")

    def test_translates_assignment_payload_and_preserves_quest_title(self):
        title, body = translate_push_payload(
            "New Quest Assigned!",
            "You've been given a new quest: 'Mop the floor' (+10 XP)",
        )

        self.assertEqual(title, "Przypisano nową misję!")
        self.assertEqual(body, "Otrzymano nową misję: „Mop the floor” (+10 XP)")

    def test_formats_test_endpoint_messages_in_polish(self):
        self.assertEqual(
            NO_PUSH_SUBSCRIPTIONS_DETAIL,
            "Nie znaleziono subskrypcji push. Wyłącz i ponownie włącz powiadomienia push.",
        )
        self.assertEqual(format_push_test_result(2, 3), "Wysłano na 2/3 urządzeń")


if __name__ == "__main__":
    unittest.main()
