# ⚔️ ChoreQuest

> *Turn chores into quests, kids into heroes.*

A gamified family chore management app with full RPG theming. Parents create quests, assign them to kids with per-child schedules, and kids earn XP by completing them. Progress is tracked through streaks, ranks, tiered achievements (Bronze/Silver/Gold), a leaderboard, a daily spin wheel, and a treasure shop where kids spend earned XP. Kids customise animated SVG avatars with pets that level up alongside them — feed, pet, and play with your companions for bonus XP.

> **This is a personal fork** of [ChoreQuest](https://github.com/finalbillybong/ChoreQuest) by [finalbillybong](https://github.com/finalbillybong), maintained with additional bug fixes, features, and improvements.

---

## ✨ What's different in this fork

- Grace period for late chore completion (kids can mark yesterday's quests done)
- Forgotten Quests section on the kid dashboard with a Mark Done button
- Quest template picker fixed (was silently broken due to a route ordering bug)
- Notification taps now navigate to the correct kid's quest page
- Full quest and reward descriptions always visible (no truncation)
- 26 additional RPG-themed quest templates
- Timezone bug fix — no more "week_start must be Monday" errors
- End-to-end test suite (Playwright, 58 tests, isolated test environment)

---

## ✨ Features at a glance

| | |
|---|---|
| 🗡️ **Quest Board** | Daily quest carousel with animated cards, themed boards, tap to complete or attach photo proof |
| ⭐ **XP, Ranks & Streaks** | Earn XP per quest, climb 8 rank tiers from Apprentice to Mythic, build daily streaks |
| 🎭 **Custom Avatars** | Full SVG editor: 9 head shapes, 20 hair styles, 15 eye styles, 14 mouths, 3 body shapes, 12 hats, 7 gear items, 7 face extras, 6 outfit patterns — with idle animations |
| 🐾 **Pets** | 6 companion pets that earn XP and level up through 8 tiers. Feed, pet, and play daily for bonus XP |
| 🛒 **Avatar Shop** | Unlock items by spending XP, reaching streaks, or random quest drops — with rarity tiers from common to legendary |
| 🎰 **Daily Spin Wheel** | Animated bonus wheel (1–25 XP) unlocked by finishing all daily quests |
| 🏪 **Treasure Shop** | Parents create categorised rewards, kids filter and redeem with XP |
| 📋 **Wishlist** | Kids add wishlist items; parents convert them into rewards |
| 🔄 **Quest Trading** | Siblings propose quest swaps via the calendar with real-time notifications |
| 🏆 **Leaderboard** | Weekly XP rankings with quest counts, streaks, ranks, and pet levels |
| 📅 **Calendar** | Weekly view with auto-generated recurring assignments |
| 🎉 **Seasonal Events** | Time-limited XP multiplier events |
| 🏖️ **Vacation Mode** | Pause quests and preserve streaks during holidays |
| 📊 **Progress Charts** | 30-day charts showing XP, quests completed, and completion rates |
| 🎊 **Party Page** | Family hub with bulletin board, avatars, ranks, shoutouts, and emotes |
| 🏅 **Tiered Achievements** | Bronze, Silver, and Gold tiers — downloadable SVG badges |
| ❄️ **Streak Freeze** | Automatic streak protection once per month |
| 🔔 **Push Notifications** | Web Push (VAPID) for quests, achievements, trades, and more |
| 📱 **Installable PWA** | Add to home screen on any device |
| 🛡️ **Admin Tools** | User management, API keys, invite codes, and audit log |

---

## 🚀 Self-hosting

### Run with Docker

```bash
git clone https://github.com/turbogizzmo/ChoreQuest.git
cd ChoreQuest
```

Create a `.env` file:

```env
SECRET_KEY=your-secret-key-min-16-chars
TZ=America/New_York
```

Then start:

```bash
docker-compose up -d --build
```

The app runs on port **8122**. The first user to register automatically becomes the admin. After that, registration requires an invite code (generate from the admin dashboard).

### Expose externally

ChoreQuest works well behind a [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/) — no port forwarding needed, free HTTPS, and enables push notifications and PWA install on all devices.

> 💡 When running behind HTTPS, set `COOKIE_SECURE=true` in your environment.

### Install as a web app

Once accessible over HTTPS:

- **iOS Safari** — Tap share → *Add to Home Screen*
- **Android Chrome** — Tap menu → *Install app*
- **Desktop Chrome/Edge** — Click the install icon in the address bar

---

## 🔔 Push notifications

Generate VAPID keys (one-time setup):

```bash
npx web-push generate-vapid-keys
```

Add to your `.env`:

```env
VAPID_PUBLIC_KEY=your-public-key
VAPID_PRIVATE_KEY=your-private-key
VAPID_CLAIM_EMAIL=mailto:you@example.com
```

> Push notifications require HTTPS.

---

## ⚙️ Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `SECRET_KEY` | *required* | JWT signing key, minimum 16 characters |
| `TZ` | `Europe/London` | Container timezone |
| `REGISTRATION_ENABLED` | `false` | Allow public registration without invite code |
| `DATABASE_URL` | `sqlite+aiosqlite:////app/data/chores_os.db` | Database path |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `15` | Access token lifetime |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `30` | Refresh token lifetime |
| `COOKIE_SECURE` | `false` | Set `true` behind HTTPS |
| `CORS_ORIGINS` | *(empty)* | Comma-separated allowed origins |
| `MAX_UPLOAD_SIZE_MB` | `5` | Photo upload size limit |
| `VAPID_PUBLIC_KEY` | *(empty)* | VAPID public key for push notifications |
| `VAPID_PRIVATE_KEY` | *(empty)* | VAPID private key for push notifications |
| `VAPID_CLAIM_EMAIL` | `mailto:admin@example.com` | Contact email for push requests |

### Data persistence

All data lives in `./data` (Docker volume):
- `chores_os.db` — SQLite database
- `uploads/` — photo proof files

Back up this directory to preserve all app data.

---

## 🧪 End-to-end tests

```bash
./run-e2e.sh          # run all 58 tests headless
./run-e2e.sh --ui     # Playwright visual UI
./run-e2e.sh --report # HTML report from last run
```

Tests spin up an isolated backend and frontend — production is never touched.

---

## 🧱 Tech stack

| | |
|---|---|
| **Backend** | Python / FastAPI (async) |
| **Database** | SQLite (WAL mode) |
| **ORM** | SQLAlchemy 2.0 (async) |
| **Frontend** | React 18, Vite, Tailwind CSS 4 |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **Real-time** | WebSocket (per-user channels) |
| **Push** | Web Push / VAPID (pywebpush) |
| **Auth** | JWT + httpOnly refresh cookies, bcrypt, optional PIN |
| **Deployment** | Docker, single container |
| **Testing** | Playwright (E2E) |

---

## 🙏 Credits

Forked from [ChoreQuest](https://github.com/finalbillybong/ChoreQuest) by [finalbillybong](https://github.com/finalbillybong). Original concept, design, and implementation by the upstream author. This fork adds bug fixes, additional quest templates, and quality-of-life improvements for self-hosted family use.
