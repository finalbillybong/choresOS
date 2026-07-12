SPECIAL_THEME_KEY = "special_theme"
SPECIAL_THEMES = ("none", "easter", "christmas")


def normalize_special_theme(value: str) -> str:
    normalized = str(value).strip().lower()
    if normalized not in SPECIAL_THEMES:
        raise ValueError(f"Unsupported special theme: {value}")
    return normalized
