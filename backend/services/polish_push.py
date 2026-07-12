"""Polish translations for native Web Push payloads.

The frontend Polish overlay translates rendered DOM text, but native push
notifications are displayed by the browser from the service worker payload.
Translate those payloads before they leave the backend.
"""

from __future__ import annotations

import re
from collections.abc import Callable


NO_PUSH_SUBSCRIPTIONS_DETAIL = (
    "Nie znaleziono subskrypcji push. Wyłącz i ponownie włącz powiadomienia push."
)


_TEXT = {
    "ChoreQuest Test": "Test ChoreQuest",
    "Push notifications are working!": "Powiadomienia push działają!",
    "New Quest Assigned!": "Przypisano nową misję!",
    "Quest Awaiting Approval": "Misja czeka na zatwierdzenie",
    "Quest Approved!": "Misja zatwierdzona!",
    "Achievement Unlocked!": "Osiągnięcie odblokowane!",
    "Quest Drop!": "Łup z misji!",
    "Reward Approved!": "Nagroda zatwierdzona!",
    "Reward Denied": "Nagroda odrzucona",
    "Reward Delivered!": "Nagroda przekazana!",
    "Reward Redeemed!": "Nagroda odebrana!",
    "Bonus Points!": "Bonusowe punkty!",
    "Bonus Event Started!": "Wydarzenie bonusowe rozpoczęte!",
    "Pet Leveled Up!": "Pupil awansował!",
    "Pet Levelled Up!": "Pupil awansował!",
    "Chore Trade Proposed": "Zaproponowano wymianę misji",
    "Trade Accepted": "Wymiana zaakceptowana",
    "Trade Denied": "Wymiana odrzucona",
    "Shoutout!": "Pochwała!",
    "Quest Feedback": "Komentarz do misji",
}


_RARITIES = {
    "common": "zwykły",
    "uncommon": "niepospolity",
    "rare": "rzadki",
    "epic": "epicki",
    "legendary": "legendarny",
}


def _normalize(value: str | None) -> str:
    return " ".join(str(value or "").split())


def _known_term(value: str) -> str:
    clean = _normalize(value)
    return _TEXT.get(clean, clean)


def _rarity(value: str) -> str:
    clean = _normalize(value)
    return _RARITIES.get(clean, clean)


def _quote(value: str) -> str:
    return f"„{value}”"


PatternReplacement = tuple[re.Pattern[str], Callable[[re.Match[str]], str]]


_PATTERNS: list[PatternReplacement] = [
    (
        re.compile(r"^You've been given a new quest: '(.+)' \(\+(\d+) XP\)$"),
        lambda m: f"Otrzymano nową misję: {_quote(_known_term(m.group(1)))} (+{m.group(2)} XP)",
    ),
    (
        re.compile(r"^(.+) completed '(.+)' - tap to approve \(\+(\d+) XP\)$"),
        lambda m: (
            f"{m.group(1)}: ukończono {_quote(_known_term(m.group(2)))} "
            f"- dotknij, aby zatwierdzić (+{m.group(3)} XP)"
        ),
    ),
    (
        re.compile(r"^'(.+)' was approved! You earned (\d+) XP!$"),
        lambda m: f"{_quote(_known_term(m.group(1)))} zatwierdzona! Zdobyto {m.group(2)} XP!",
    ),
    (
        re.compile(r"^You earned '(.+)' [—-] \+(\d+) XP!$"),
        lambda m: f"Zdobyto osiągnięcie {_quote(_known_term(m.group(1)))} - +{m.group(2)} XP!",
    ),
    (
        re.compile(r"^You found a (common|uncommon|rare|epic|legendary) item: (.+)!$"),
        lambda m: f"Znaleziono {_rarity(m.group(1))} element: {_known_term(m.group(2))}!",
    ),
    (
        re.compile(r"^Your redemption of '(.+)' has been approved!$"),
        lambda m: f"Twoja wymiana na {_quote(_known_term(m.group(1)))} została zatwierdzona!",
    ),
    (
        re.compile(r"^Your redemption of '(.+)' was denied\. (\d+) XP has been refunded\.$"),
        lambda m: (
            f"Twoja wymiana na {_quote(_known_term(m.group(1)))} została odrzucona. "
            f"Zwrócono {m.group(2)} XP."
        ),
    ),
    (
        re.compile(r"^Your reward '(.+)' has been handed out!$"),
        lambda m: f"Twoja nagroda {_quote(_known_term(m.group(1)))} została przekazana!",
    ),
    (
        re.compile(r"^(.+) redeemed '(.+)' for (\d+) XP$"),
        lambda m: f"{m.group(1)}: odebrano {_quote(_known_term(m.group(2)))} za {m.group(3)} XP",
    ),
    (
        re.compile(r"^You received (\d+) bonus XP: (.+)$"),
        lambda m: f"Otrzymano {m.group(1)} bonusowego XP: {m.group(2)}",
    ),
    (
        re.compile(r"^Your pet reached level (\d+) [—-] (.+)!$"),
        lambda m: f"Twój pupil osiągnął poziom {m.group(1)} - {_known_term(m.group(2))}!",
    ),
    (
        re.compile(r"^Your (.+) reached level (\d+) \((.+)\)!$"),
        lambda m: (
            f"Twój pupil {_known_term(m.group(1))} osiągnął poziom {m.group(2)} "
            f"({_known_term(m.group(3))})!"
        ),
    ),
    (
        re.compile(r"^(\d+)-Day Streak!$"),
        lambda m: f"{m.group(1)}-dniowa seria!",
    ),
    (
        re.compile(r"^You've completed quests (\d+) days in a row! Keep it up!$"),
        lambda m: f"Misje ukończone przez {m.group(1)} dni z rzędu! Tak trzymaj!",
    ),
    (
        re.compile(r"^'(.+)' is live [—-] earn (\d+)% bonus XP on all quests!$"),
        lambda m: (
            f"{_quote(_known_term(m.group(1)))} trwa - zdobywaj {m.group(2)}% "
            "bonusowego XP za wszystkie misje!"
        ),
    ),
    (
        re.compile(r"^(.+) wants to trade '(.+)' with you\.$"),
        lambda m: f"{m.group(1)} chce wymienić z Tobą misję {_quote(_known_term(m.group(2)))}.",
    ),
    (
        re.compile(r"^(.+) accepted your trade for '(.+)'\.$"),
        lambda m: f"{m.group(1)}: zaakceptowano Twoją wymianę misji {_quote(_known_term(m.group(2)))}.",
    ),
    (
        re.compile(r"^(.+) denied your trade for '(.+)'\.$"),
        lambda m: f"{m.group(1)}: odrzucono Twoją wymianę misji {_quote(_known_term(m.group(2)))}.",
    ),
    (
        re.compile(r"^(.+) gave you a shoutout: (.+)$"),
        lambda m: f"{m.group(1)} przesyła pochwałę: {m.group(2)}",
    ),
    (
        re.compile(r'^(.+) left feedback on "(.+)": (.+)$'),
        lambda m: f"{m.group(1)}: komentarz do {_quote(_known_term(m.group(2)))}: {m.group(3)}",
    ),
]


def translate_push_text(value: str | None) -> str:
    clean = _normalize(value)
    if not clean:
        return ""

    if clean in _TEXT:
        return _TEXT[clean]

    for pattern, replacement in _PATTERNS:
        match = pattern.match(clean)
        if match:
            return replacement(match)

    return clean


def translate_push_payload(title: str | None, body: str | None) -> tuple[str, str]:
    return translate_push_text(title), translate_push_text(body)


def format_push_test_result(sent: int, total: int) -> str:
    return f"Wysłano na {sent}/{total} urządzeń"
