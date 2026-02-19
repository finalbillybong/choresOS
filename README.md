# ChoreQuest

A gamified family chore management app with full RPG theming. Parents create quests, assign them to kids with per-child schedules, and kids earn XP by completing them. Progress is tracked through streaks, achievements, a leaderboard, a daily spin wheel, and a reward shop where kids spend earned XP.

Built mobile-first with a bottom tab bar on phones and tablets, sidebar on larger screens.

## What it does

### For kids

- **Daily quest board** — see today's assigned quests in an animated card carousel, mark them done with a single tap (or attach a photo if proof is required)
- **XP and streaks** — earn XP for each verified quest, build a daily streak by completing all assigned quests. Current streak and longest streak are tracked. Streak resets if a day is missed
- **Daily spin wheel** — animated bonus wheel awarding 1–25 random XP once per day, unlocked only when all daily quests are completed/verified
- **Achievements** — 14 unlockable achievements: First Steps, Week Warrior, On Fire (7-day streak), Streak Master (30-day), Unstoppable (100-day), Piggy Bank / Money Bags / Point Millionaire (100/500/1000 lifetime XP), Early Bird (complete before 9 AM), Speed Demon (all done before noon), All Done!, Helping Hand, Treat Yourself / Big Spender (5/20 redemptions)
- **Treasure Shop** — browse and redeem rewards using earned XP. See pending/approved/fulfilled status in an inventory view
- **Wishlist** — add items with URLs, images, and notes. Parents can see wishlists and convert items into shop rewards
- **Quest trading** — propose quest swaps with siblings through the calendar. Target kid gets a notification and can accept or deny
- **Custom avatar** — SVG-based avatar editor with head shape, hair style, eyes, mouth, plus colour palettes for skin, hair, eyes, and background
- **PIN login** — log in with a 6-digit PIN instead of a password (handy for shared tablets)
- **Leaderboard** — weekly XP rankings showing each kid's weekly XP, lifetime XP, quests completed, and current streak

### For parents

- **Quest Library** — browse all created quests in one place, search and filter by category and difficulty. Create new quests from scratch or from 24 built-in RPG-themed templates
- **Quest Assignment** — assign quests to specific kids with per-child settings:
  - Individual recurrence per kid (one-time, daily, weekly, custom days)
  - Per-kid photo proof requirements
  - Optional kid rotation with cadence (daily, weekly, fortnightly, monthly)
- **Active Quests tab** — view only quests that have active assignments, with hero count badges
- **Verification queue** — review and approve/reject completed quests from the parent dashboard, including photo proof viewing
- **Uncomplete / skip** — reverse a verification (deducting awarded XP) or skip a pending quest for the day
- **Bonus XP** — award ad-hoc bonus XP to any kid with a description
- **Rewards management** — create rewards with XP costs, stock limits, icons, and auto-approval thresholds. Approve, deny, or fulfil redemption requests
- **Family overview** — dashboard with kid cards showing today's quest progress, points balance, and current streak
- **Seasonal events** — create time-limited XP multiplier events (multipliers compound if multiple events are active)
- **Category management** — create, edit, and delete quest categories with custom icons and colours
- **Chore rotations** — rotate a quest between kids on a set cadence (daily/weekly/fortnightly/monthly) with manual advance option

### For admins

- **User management** — view all users, change roles (admin/parent/kid), activate/deactivate accounts
- **API keys** — generate scoped API keys with unique prefixes, track last usage, revoke keys
- **Invite codes** — generate registration codes with max uses and expiration dates. First user auto-becomes admin; subsequent users need a code (when public registration is disabled)
- **Audit log** — searchable log of logins, password changes, role changes, point adjustments, and other sensitive actions with timestamps, user IDs, and IP addresses
- **App settings** — configure daily reset hour, toggle leaderboard, spin wheel, and chore trading

## Tech stack

| | |
|---|---|
| Backend | Python / FastAPI (async) |
| Database | SQLite (WAL mode) |
| ORM | SQLAlchemy 2.0 (async) |
| Frontend | React 18, Vite, Tailwind CSS 4 |
| Animations | Framer Motion |
| Fonts | Inter |
| Icons | Lucide React |
| Real-time | WebSocket (per-user channels) |
| Auth | JWT access tokens + httpOnly refresh cookies, bcrypt, optional PIN |
| Deployment | Docker, single container |

## Running it

```bash
docker compose up -d
```

Runs on port **8122**. Set a `SECRET_KEY` env var (16+ characters) — everything else has defaults.

### Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SECRET_KEY` | *required* | JWT signing key, minimum 16 characters |
| `REGISTRATION_ENABLED` | `false` | Allow public registration (no invite code needed) |
| `DATABASE_URL` | `sqlite+aiosqlite:////app/data/chores_os.db` | Database path |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `15` | Access token lifetime |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `30` | Refresh token lifetime |
| `COOKIE_SECURE` | `false` | Set `true` behind HTTPS |
| `CORS_ORIGINS` | *(empty)* | Comma-separated allowed origins for cross-origin requests |
| `DAILY_RESET_HOUR` | `0` | UTC hour for the daily assignment reset |
| `TZ` | `Europe/London` | Container timezone |
| `MAX_UPLOAD_SIZE_MB` | `5` | Photo upload size limit |
| `LOGIN_RATE_LIMIT_MAX` | `10` | Max login attempts per 300s window |
| `PIN_RATE_LIMIT_MAX` | `5` | Max PIN login attempts per 900s window |
| `REGISTER_RATE_LIMIT_MAX` | `5` | Max registration attempts per 3600s window |

### First run

The database, default categories (9), achievements (14), quest templates (24), and app settings are created on first startup. The first user to register becomes the admin. After that, registration requires an invite code by default — generate them from the admin dashboard.

Existing chores with assignments are automatically migrated to the new per-kid assignment rules system on first startup after the update.

## Project layout

```
backend/
  main.py            # FastAPI app, middleware, startup, daily reset task
  models.py          # SQLAlchemy models (18 tables)
  schemas.py         # Pydantic request/response schemas
  auth.py            # JWT, password/PIN hashing, token creation
  config.py          # Settings validation from environment
  achievements.py    # Achievement unlock criteria checking
  dependencies.py    # Auth dependency injection (get_current_user, require_parent)
  websocket_manager.py  # WebSocket connection manager
  seed.py            # Default categories, achievements, quest templates, settings
  routers/
    auth.py          # Registration, login, PIN, refresh, profile
    chores.py        # Quest CRUD, categories, templates, assignment rules, completion
    rewards.py       # Reward CRUD, redemptions, approval workflow
    calendar.py      # Weekly calendar, auto-generation, quest trading
    stats.py         # Family stats, leaderboard, achievements, history
    points.py        # Bonus XP, point adjustments
    spin.py          # Daily spin wheel
    rotations.py     # Kid rotation management
    notifications.py # Notification listing, read/unread
    wishlist.py      # Kid wishlists, convert to reward
    events.py        # Seasonal event CRUD
    avatar.py        # Avatar parts and customisation
    admin.py         # Users, API keys, invite codes, audit log, settings
    uploads.py       # Photo proof upload/retrieval
frontend/
  src/
    pages/           # 16 page components
      KidDashboard   # Quest carousel, points, streak, spin wheel access
      ParentDashboard # Family overview, verification queue, bonus XP
      AdminDashboard # Users, API keys, invite codes, audit log tabs
      Chores         # Quest library + active quests (two-tab parent view)
      ChoreDetail    # Quest detail, assignment rules, rotation, guild actions
      Calendar       # Weekly calendar view with quest assignments
      Rewards        # Treasure Shop with redemption workflow
      Inventory      # Redemption history (pending/approved/fulfilled)
      KidQuests      # Per-kid quest view for parents
      Leaderboard    # Weekly XP rankings
      Wishlist       # Kid wishlist management
      Events         # Seasonal event calendar
      Profile        # Avatar editor, stats, streak display
      Settings       # Theme, security, notification preferences
      Login          # Password and PIN login
      Register       # Registration with invite code
    components/      # Shared components
      Modal          # Animated modal with Framer Motion
      QuestCreateModal   # Quest creation with template picker
      QuestAssignModal   # Per-kid assignment with recurrence/photo/rotation
      AvatarDisplay  # SVG avatar renderer
      AvatarEditor   # Avatar customisation interface
      SpinWheel      # Animated daily bonus wheel
      Layout         # App shell with sidebar/bottom tabs
      NotificationPanel  # Real-time notification dropdown
    contexts/        # React context providers (Auth, Theme, WebSocket)
    hooks/           # useAuth, useTheme, useWebSocket, useNotifications
    api/client.js    # Fetch wrapper with token refresh
    utils/
      questThemeText.js  # RPG-themed quest title/description transforms
data/                # SQLite DB + uploaded photos (Docker volume)
static/              # Built frontend assets served by FastAPI
```

## Features

### Quest management

- **Quest Library** — all created quests in a searchable, filterable grid. Parents see assignment counts; unassigned quests have an "Assign to Heroes" button
- **Active Quests** — separate tab showing only quests with active kid assignments
- **24 built-in templates** — RPG-themed quest templates across 7 categories (Household, Personal Care, Pets, Learning, Outdoor, Garden, Bathroom) with suggested XP and difficulty. Examples: "The Chamber of Rest", "Beast Keeper's Round", "The Scholar's Burden", "Bard's Practice", "The Hound's March"
- **Per-kid assignment rules** — each kid can have different recurrence (once/daily/weekly/custom days) and photo proof requirements for the same quest
- **Difficulty levels** — Easy, Medium, Hard, Expert with visual star indicators
- **9 default categories** — Kitchen, Bedroom, Bathroom, Garden, Pets, Homework, Laundry, General, Outdoor. Custom categories can be added with icon and colour
- **Assignment lifecycle** — Pending → Completed (kid submits) → Verified (parent approves) → XP awarded. Can also be uncompleted (reverses XP) or skipped

### XP and progression

- **Point transactions** — full audit trail of all XP changes: quest completions, reward redemptions, bonuses, adjustments, achievements, spins, event multipliers
- **Daily streaks** — consecutive days with at least one verified quest. Current and longest streak tracked per kid
- **14 achievements** — auto-unlocked when criteria are met. Types: total completions, streak milestones, lifetime XP thresholds, time-based completions, redemption counts
- **Weekly leaderboard** — ranks kids by XP earned in the current week, shows quest count and streak
- **Seasonal events** — time-limited XP multipliers that compound when multiple events overlap

### Rewards

- **Treasure Shop** — parents create rewards with XP cost, description, icon, and optional stock limit
- **Auto-approval** — rewards below a configurable XP threshold are approved automatically
- **Redemption workflow** — Pending → Approved → Fulfilled, or Denied. Each step tracked with timestamps and who performed it
- **Wishlist integration** — kids add wishlist items (with URLs/images), parents can convert them directly into shop rewards

### Daily spin wheel

- Animated wheel with spring physics
- Awards 1–25 random bonus XP
- Unlocked only when all of the day's assigned quests are completed or verified
- One spin per calendar day

### Calendar and trading

- **Weekly calendar** — assignments grouped by day with chore details, user info, and status
- **Auto-generation** — recurring assignments are automatically created for the week when the calendar is viewed, respecting per-kid rules and exclusions
- **Quest trading** — kids propose swaps with siblings. Target kid gets a real-time notification and can accept (reassigning the quest) or deny

### Chore rotations

- Rotate a quest between multiple kids on a schedule
- Cadences: daily, weekly, fortnightly, monthly
- Automatic advancement on the daily reset task
- Manual advance option from the rotation panel
- Integrates with per-kid assignment rules

### Notifications

- **11 notification types** — quest assigned, completed, verified, achievement unlocked, bonus points, trade proposed/accepted/denied, streak milestone, reward approved/denied
- **Real-time delivery** via WebSocket
- **In-app panel** with unread count badge, mark as read (individual or all)
- **Reference linking** — notifications link to the relevant quest, assignment, or trade

### Authentication and security

- **Password login** — username + password with bcrypt hashing
- **PIN login** — 6-digit PIN for quick kid access on shared devices
- **JWT tokens** — short-lived access tokens (15 min default) with httpOnly refresh cookies (30 day default)
- **Token rotation** — refresh tokens are rotated on each use, old tokens revoked
- **Rate limiting** — login (10/5min), PIN (5/15min), registration (5/hour)
- **Security headers** — X-Frame-Options, Content-Security-Policy, Strict-Transport-Security, Permissions-Policy
- **Invite-only registration** — public registration disabled by default, admin generates invite codes with usage limits and expiration

### UI and theming

- **Dark RPG theme** — navy/gold/emerald colour palette. Quests instead of chores, XP instead of points, Treasure Shop instead of reward store, Heroes instead of kids
- **Framer Motion animations** — card reveals with stagger, spring physics on interactions, modal entrance/exit, confetti on achievements
- **Game-styled components** — `game-panel` cards with subtle elevation, `game-btn` buttons with animated states (`game-btn-blue`, `game-btn-gold`, `game-btn-red`, `game-btn-purple`)
- **Custom SVG avatars** — head shapes, hair styles (6), eye types (4), mouth types (4), with colour palettes for skin, hair, eyes, and background
- **PWA-ready** — service worker, manifest, installable on phones and tablets
- **Responsive** — mobile-first grid layouts, bottom tab bar on small screens, sidebar on desktop

### Photo proof

- Parents can require photo proof per kid per quest (configurable in assignment rules)
- Kids attach a photo before completing the quest
- Supported formats: JPEG, PNG, GIF, WebP
- Configurable upload size limit (default 5 MB)
- Photos stored on disk, served via upload endpoint

### Admin tools

- **User management** — list all users, change roles, activate/deactivate
- **API keys** — generate scoped keys with prefix, track usage, revoke
- **Invite codes** — generate multi-use codes with expiration
- **Audit log** — filterable log of sensitive actions with IP addresses
- **App settings** — toggle leaderboard, spin wheel, chore trading; set daily reset hour

## Data model

18 tables:

| Table | Purpose |
|-------|---------|
| `users` | Accounts with role, points, streak, avatar config |
| `refresh_tokens` | JWT refresh token hashes with revocation |
| `chores` | Quest definitions (title, points, difficulty, category, recurrence) |
| `chore_assignments` | Per-day per-kid assignment instances with status lifecycle |
| `chore_assignment_rules` | Per-kid per-quest config (recurrence, photo, active flag) |
| `chore_categories` | Quest categories with icon and colour |
| `chore_rotations` | Kid rotation config per quest (cadence, current index) |
| `chore_exclusions` | Intentionally removed assignments (prevents auto-recreation) |
| `quest_templates` | Built-in RPG-themed quest templates |
| `rewards` | Shop items with XP cost, stock, auto-approval threshold |
| `reward_redemptions` | Redemption requests with approval workflow |
| `point_transactions` | Full XP audit trail (7 transaction types) |
| `achievements` | Achievement definitions with criteria JSON |
| `user_achievements` | Unlocked achievements per user |
| `wishlist_items` | Kid wishlists (convertible to rewards) |
| `seasonal_events` | Time-limited XP multiplier events |
| `notifications` | In-app notifications (11 types) |
| `spin_results` | Daily spin outcomes |
| `api_keys` | Scoped API keys for external integrations |
| `audit_logs` | Sensitive action log |
| `app_settings` | Key-value app configuration |
| `invite_codes` | Registration invite codes |

## API

The backend exposes ~100 endpoints across 14 route modules:

### Auth (`/api/auth`)
- `POST /register` — register with optional invite code
- `POST /login` — password authentication
- `POST /pin-login` — 6-digit PIN authentication
- `POST /refresh` — rotate access token
- `POST /logout` — revoke refresh token
- `GET /me` — current user profile
- `PUT /me` — update display name and avatar
- `POST /change-password` — change password (revokes all tokens)
- `POST /set-pin` — set or update PIN

### Quests (`/api/chores`)
- `GET /categories`, `POST`, `PUT /{id}`, `DELETE /{id}` — category CRUD
- `GET /` — list quests (enriched with assignment counts for parents)
- `POST /` — create quest
- `GET /{id}`, `PUT /{id}`, `DELETE /{id}` — quest CRUD
- `GET /templates` — list built-in quest templates
- `GET /{id}/rules` — get per-kid assignment rules for a quest
- `POST /{id}/assign` — assign quest to kids with per-kid settings
- `PUT /rules/{id}` — update an assignment rule
- `DELETE /rules/{id}` — deactivate an assignment rule
- `POST /{id}/complete` — kid marks quest done (with optional photo)
- `POST /{id}/verify` — parent approves and awards XP
- `POST /{id}/uncomplete` — parent reverses completion (deducts XP)
- `POST /{id}/skip` — parent skips today's assignment

### Rewards (`/api/rewards`)
- `GET /`, `POST`, `GET /{id}`, `PUT /{id}`, `DELETE /{id}` — reward CRUD
- `POST /{id}/redeem` — kid redeems reward
- `GET /redemptions` — list redemption requests
- `POST /redemptions/{id}/approve`, `/deny`, `/fulfill` — approval workflow

### Calendar (`/api/calendar`)
- `GET /` — weekly calendar with auto-generated assignments
- `POST /trade` — propose quest trade
- `POST /trade/{id}/accept`, `/deny` — respond to trade
- `DELETE /assignments/{id}` — remove assignment (with optional `all_future` flag)

### Stats (`/api/stats`)
- `GET /me` — current user stats
- `GET /kids` — list all active kids
- `GET /family` — family overview with per-kid stats
- `GET /family/{kid_id}` — detailed kid quest data
- `GET /leaderboard` — weekly XP rankings
- `GET /achievements/all` — all achievements with unlock status
- `GET /{user_id}` — detailed user stats
- `GET /history/{user_id}` — completion history

### Other routes
- `GET/POST /api/spin` — daily bonus wheel (availability check + spin)
- `GET/POST/PUT/DELETE /api/wishlist` + `POST /{id}/convert`
- `GET/POST/PUT/DELETE /api/rotations` + `POST /{id}/advance`
- `GET /api/notifications` + `POST /{id}/read`, `/read-all`
- `GET/POST/PUT/DELETE /api/events` — seasonal events
- `GET /api/avatar/parts`, `PUT /api/avatar` — avatar customisation
- `POST /api/points/{user_id}/bonus` — award bonus XP
- `POST /api/points/adjust/{user_id}` — admin point adjustment
- `GET/POST/DELETE /api/admin/users`, `/api-keys`, `/invite-codes`, `/audit-log`, `/settings`
- `POST/GET/DELETE /api/uploads` — photo proof files
- `WS /ws/{user_id}` — real-time WebSocket updates

## WebSocket events

Real-time updates are pushed to connected clients:

| Event | Trigger |
|-------|---------|
| `data_changed` | Any entity created/updated/deleted (with entity type) |
| `chore_completed` | Kid submits a quest for approval |
| `chore_verified` | Parent approves a quest |
| `achievement_unlocked` | Kid unlocks an achievement |
| `bonus_points` | Parent awards bonus XP |
| `reward_approved` / `denied` / `fulfilled` | Redemption status changes |
| `spin_result` | Daily spin outcome |
| `trade_proposed` / `accepted` / `denied` | Quest trade lifecycle |
