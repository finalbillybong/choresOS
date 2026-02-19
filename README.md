# ChoresOS

A chore management app for families, themed like an RPG. Kids complete "quests" to earn XP, unlock achievements, and spend points in a reward shop. Parents manage everything from their own dashboard.

Built for tablets and phones first — designed so a 7-year-old can use it independently.

## What it does

**For kids:**
- See today's quests on a dashboard and mark them as done (with optional photo proof)
- Earn XP for completed chores, build streaks, unlock achievements
- Spin a daily bonus wheel (available if yesterday's quests were all finished)
- Browse and buy rewards from the Treasure Shop using earned XP
- Add items to a wishlist for parents to see
- Trade chores with siblings via the calendar
- Customise an RPG-style avatar

**For parents:**
- Create and assign quests with difficulty levels, categories, and recurrence schedules
- Verify completed chores (with photo proof review where required)
- Set up a reward shop with XP prices and optional stock limits
- Award bonus XP
- Manage chore rotations between kids (e.g. bins duty rotates weekly)
- View family stats, streaks, and a leaderboard

**For admins:**
- Manage users, API keys, and invite codes
- View audit logs
- Configure app-wide settings

## Tech stack

| Layer | Tech |
|-------|------|
| Backend | Python / FastAPI (async) |
| Database | SQLite with WAL mode |
| Frontend | React / Vite / Tailwind CSS |
| Real-time | WebSocket per-user channels |
| Auth | JWT access tokens + httpOnly refresh cookies, bcrypt passwords, optional PIN login for kids |
| Deployment | Docker (single container, multi-stage build) |

## Running it

### With Docker (recommended)

```bash
docker compose up -d
```

The app runs on port **8122** by default.

You'll need to set a `SECRET_KEY` environment variable (minimum 16 characters). Everything else has sensible defaults.

### Environment variables

| Variable | Default | What it does |
|----------|---------|--------------|
| `SECRET_KEY` | *required* | Signs JWT tokens. Must be at least 16 chars |
| `REGISTRATION_ENABLED` | `false` | Allow signup without an invite code |
| `DATABASE_URL` | `sqlite+aiosqlite:////app/data/chores_os.db` | Database connection string |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `15` | How long access tokens last |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `30` | How long refresh tokens last |
| `COOKIE_SECURE` | `false` | Set to `true` if you're behind HTTPS |
| `DAILY_RESET_HOUR` | `0` | UTC hour to run the daily reset |
| `TZ` | `Europe/London` | Container timezone |
| `MAX_UPLOAD_SIZE_MB` | `5` | Max photo upload size |

### First run

1. The database and default data (categories, achievements, template quests) are created automatically on startup
2. The first user to register becomes the admin
3. After that, registration is invite-only by default — create invite codes from the admin dashboard

## Project structure

```
backend/
  main.py              # FastAPI app setup, middleware, lifespan
  models.py            # SQLAlchemy models (18 tables)
  routers/             # API route modules (auth, chores, rewards, etc.)
  seed.py              # Default data (categories, achievements, templates)
frontend/
  src/
    pages/             # React page components
    components/        # Shared UI components
    contexts/          # Auth, theme, WebSocket providers
    hooks/             # Custom React hooks
    api/client.js      # API client with token refresh
data/                  # SQLite database + uploaded photos (Docker volume)
```

## Features worth mentioning

- **RPG theming throughout** — pixel-art UI, "Press Start 2P" font for headings, quests instead of chores, XP instead of points. Dark mode is the default.
- **PWA** — installable on phones/tablets with offline support and a service worker.
- **Streaks** — kids build daily streaks by completing all assigned quests. Milestones at 7, 14, 30, 50, and 100 days.
- **14 achievements** — from "First Steps" (complete 1 quest) to "Unstoppable" (100-day streak).
- **Daily spin wheel** — a physics-based animated wheel that awards 1-25 bonus XP, available once per day.
- **Chore rotations** — automatically rotate chores between kids on a schedule.
- **Calendar with trading** — weekly view where kids can propose chore swaps with siblings.
- **Photo verification** — parents can require photo proof for specific chores.
- **Rate limiting** — login, PIN, and registration endpoints are rate-limited.
- **Audit logging** — sensitive actions (logins, role changes, point adjustments) are logged.

## API

The backend exposes ~100 endpoints across 13 route modules. Key ones:

- `POST /api/auth/register` / `login` / `pin-login` / `refresh`
- `GET/POST /api/chores` — CRUD + `/{id}/complete`, `/{id}/verify`, `/{id}/skip`
- `GET/POST /api/rewards` — shop + `/{id}/redeem`, `/redemptions/{id}/approve`
- `GET /api/stats/me` / `/family` / `/leaderboard`
- `GET /api/calendar` — weekly view with auto-generated assignments
- `POST /api/calendar/trade` — propose chore trades
- `GET/POST /api/spin` — daily bonus wheel
- `WS /ws/{user_id}` — real-time updates

## License

Not yet specified.
