# ⚔️ ChoreQuest

> *Turn chores into quests, kids into heroes.*

### Avatar and family theme experience

- **Bad behaviour is permanent:** parents and administrators can always record incidents, apply repeat-aware XP penalties, notify the child, and keep informational calendar history. There is no feature flag for this workflow.
- **Personal themes work per user:** each child keeps a personal colour theme in their profile, and the selected palette visibly recolours the child interface.
- **Holiday themes are family-wide:** a parent or administrator can manually enable Easter or Christmas for every user in the installation. The holiday palette and decorations temporarily override personal colours; selecting no holiday restores every saved personal choice.
- **Seasonal decoration is more than colour:** Christmas includes festive greenery, lights, gifts, and falling snow; Easter includes spring branches, painted eggs, petals, grass, and bunny details. Motion respects `prefers-reduced-motion`.
- **Avatars are fully illustrated:** existing avatar IDs and saved configurations remain compatible, while the SVG renderer adds lighting, shading, material details, and a visual editor with real option previews for avatar parts, accessories, and pets.

A gamified family chore management app with full RPG theming. Parents create quests, assign them to kids with per-child schedules, and kids earn XP by completing them. Progress is tracked through streaks, ranks, tiered achievements (Bronze/Silver/Gold), a leaderboard, a daily spin wheel, and a treasure shop with categories where kids spend earned XP. Kids customise animated SVG avatars with pets that level up alongside them — feed, pet, and play with your companions for bonus XP. Stay connected with the family bulletin board and quest feedback system.

---
`
## 🚀 Quick Start

**Two ways to use ChoreQuest:**`

| 🛠️ **Self-Host** (Free) | 🚀 **Hosted** (Coming Soon) |
|---|---|
| Run it on your own server | Zero setup, we handle everything |
| Completely free | 7-day free trial, then paid |
| Full control | Automatic updates & backups |
| **[Self-hosting guide →](#self-hosting)** | **[Join the waitlist →](https://chorequest.co.uk)** |

---

## ✨ Features at a glance

| | |
|---|---|
| 🗡️ **Quest Board** | Daily quest carousel with animated cards, themed boards, tap to complete or attach photo proof |
| ⭐ **XP, Ranks & Streaks** | Earn XP per quest, climb 8 rank tiers from Apprentice to Mythic, build daily streaks |
| 🎭 **Custom Avatars** | Full SVG editor: 9 head shapes, 20 hair styles, 15 eye styles, 14 mouths, 3 body shapes, 12 hats, 7 gear items (equip multiple at once), 7 face extras, 6 outfit patterns — with idle animations |
| 🐾 **Pets** | 6 companion pets (cat, dog, dragon, owl, bunny, phoenix) that earn XP from all sources and level up through 8 tiers. Feed, pet, and play with your companions daily for bonus XP. Customise with pet accessories (crown, party hat, bow, bandana, halo, flower) |
| 🛒 **Avatar Shop** | Unlock avatar items by spending XP, reaching streaks, earning lifetime XP, or random quest drops — with rarity tiers from common to legendary |
| 🎰 **Daily Spin Wheel** | Animated bonus wheel (1–25 XP) unlocked by finishing all daily quests |
| 🏪 **Treasure Shop** | Parents create categorised rewards, kids filter by category and redeem with XP — full approval workflow |
| 📋 **Wishlist** | Kids add wishlist items with links & images; parents convert them into rewards |
| 🔄 **Quest Trading** | Siblings propose quest swaps through the calendar, with real-time notifications |
| 🏆 **Leaderboard** | Weekly XP rankings with quest counts, streak display, ranks, and pet levels |
| 📅 **Calendar** | Weekly view with auto-generated recurring assignments |
| 🎉 **Seasonal Events** | Time-limited XP multiplier events that compound when overlapping |
| 🏖️ **Vacation Mode** | Set vacation periods that pause quests and preserve streaks |
| 📊 **Progress Charts** | 30-day daily charts showing XP earned, quests completed, and completion rates |
| 🐣 **Pet Interactions** | Feed, pet, or play with your companion up to 3 times daily for 1–3 bonus pet XP each |
| 🎊 **Party Page** | Family hub with bulletin board, member avatars, ranks, pets, progress rings, shoutouts, and emotes |
| 📢 **Bulletin Board** | Parents post announcements (with optional pinning) delivered via push notifications to all kids |
| 💬 **Quest Feedback** | Parents leave feedback comments on completed quests, delivered as push notifications to kids |
| 🏅 **Tiered Achievements** | Bronze, Silver, and Gold achievement tiers grouped by category — downloadable SVG badges for sharing |
| ❄️ **Streak Freeze** | Automatic streak protection: miss a day and your streak is saved once per month |
| 💬 **Shoutouts & Emotes** | Send kudos to family members or broadcast avatar emotes (dance, wave, cheer, flex, sparkle, high-five) |
| 🎨 **Themes** | 8 colour themes (Quest Blue, Dragon Fire, Enchanted Forest, Arctic, Rose Gold, Galaxy, Sunshine, Fairy Dust), dark/light/auto mode, and 6 quest board skins |
| 🔔 **Push Notifications** | Web Push (VAPID) — quest assigned, verified, achievements, trades, pet level-ups, and more |
| 📱 **Installable PWA** | Add to home screen on any device for a native app experience |
| 🛡️ **Admin Tools** | User management, API keys, invite codes, and full audit log |

---

## 🚀 Self-hosting

Built mobile-first as an installable PWA — bottom tab bar on phones and tablets, sidebar on larger screens. Supports **push notifications** so kids and parents stay in the loop even when the app isn't open.

### Run with Docker

```bash
git clone https://github.com/your-org/ChoreQuest.git
cd ChoreQuest
```

Create a `.env` file (or pass env vars directly):

```env
SECRET_KEY=your-secret-key-min-16-chars
TZ=Europe/London
```

Then start:

```bash
docker compose up -d
```

The app runs on port **8122**. The first user to register automatically becomes the admin. After that, registration requires an invite code (generate them from the admin dashboard).

### Expose with Cloudflare Tunnel

ChoreQuest works great behind a [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/) — no port forwarding needed, free HTTPS, and it enables push notifications and PWA install on all devices.

```bash
# Install cloudflared (if not already installed)
# See: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/get-started/

# Create a tunnel
cloudflared tunnel create chorequest

# Route your domain to the tunnel
cloudflared tunnel route dns chorequest chorequest.yourdomain.com

# Run the tunnel pointing at ChoreQuest
cloudflared tunnel --name chorequest --url http://localhost:8122
```

> 💡 **Tip:** When running behind HTTPS (Cloudflare Tunnel, reverse proxy, etc.), set `COOKIE_SECURE=true` in your environment so auth cookies are sent correctly.

### Install as a web app

Once the app is accessible over HTTPS, everyone in the family can install it:

- **iOS Safari** — Tap the share button → *Add to Home Screen*
- **Android Chrome** — Tap the menu → *Install app* (or accept the install banner)
- **Desktop Chrome/Edge** — Click the install icon in the address bar

The app runs in standalone mode — no browser, just like a native app. The service worker caches static assets for fast loading and provides offline fallback pages.

---

## 🔔 Notifications

ChoreQuest has two notification layers that work together:

### In-app notifications (WebSocket)
Real-time updates delivered instantly while the app is open. The bell icon shows an unread count badge, and the dropdown panel lists all recent activity.

### Push notifications (Web Push / VAPID)
Notifications that arrive even when the app is closed — just like a native app. Supported on Android, desktop browsers, and iOS 16.4+ (when installed as a PWA).

**16 notification types:** quest assigned, quest completed, quest verified, achievement unlocked, bonus XP, trade proposed/accepted/denied, streak milestone, reward approved/denied, avatar item drop, shoutout, pet level-up, announcement, quest feedback.

#### Setting up push notifications

1. Generate VAPID keys (one-time):
   ```bash
   # Using openssl
   openssl ecparam -name prime256v1 -genkey -noout -out vapid_private.pem
   # Or install a VAPID key generator (e.g. web-push library)
   npx web-push generate-vapid-keys
   ```

2. Add the keys to your environment:
   ```env
   VAPID_PUBLIC_KEY=BExamplePublicKey...
   VAPID_PRIVATE_KEY=your-private-key...
   VAPID_CLAIM_EMAIL=mailto:you@example.com
   ```

3. Users enable push notifications from **Settings → Notifications** in the app.

> 📌 Push notifications require HTTPS. Running behind a Cloudflare Tunnel satisfies this requirement.

---

## 🎮 For kids

- **Daily quest board** — see today's assigned quests in an animated card carousel, mark them done with a single tap (or attach a photo if proof is required). Choose from 6 board themes: Classic, Haunted Dungeon, Winter Workshop, Space Station, Ocean Kingdom, and Enchanted Garden
- **XP, ranks, and streaks** — earn XP for each verified quest. Climb through 8 rank tiers (Apprentice → Scout → Adventurer → Knight → Champion → Hero → Legend → Mythic) based on lifetime XP. Build a daily streak by completing quests — current and longest streaks are tracked. Vacation days preserve streaks automatically
- **Daily spin wheel** — animated bonus wheel awarding 1–25 random XP once per day, unlocked only when all daily quests are completed/verified
- **Tiered achievements** — 20 unlockable achievements with Bronze, Silver, and Gold tiers grouped by category (quest completions, lifetime XP, streaks, redemptions, pets). Each tier has unique visual styling. Unlocked achievements can be downloaded as shareable SVG badges
- **Streak freeze** — if you miss a day, your streak is automatically preserved once per month
- **Pet interactions** — feed, pet, or play with your companion up to 3 times per day for 1–3 bonus pet XP each interaction
- **Treasure Shop** — browse and redeem categorised rewards using earned XP, filter by category. See pending/approved/fulfilled status in an inventory view
- **Avatar Shop** — unlock new avatar items by spending XP, reaching streak milestones, earning lifetime XP totals, or through random quest drops. Items have rarity tiers: common, uncommon, rare, epic, and legendary
- **Wishlist** — add items with URLs, images, and notes. Parents can see wishlists and convert items into shop rewards
- **Quest trading** — propose quest swaps with siblings through the calendar. Target kid gets a notification and can accept or deny
- **Custom avatar** — full SVG-based avatar editor with animated idle effects (eye blink, body sway, mouth movement, pet bounce, accessory sparkle). Customise:
  - **Head** — 9 shapes: round, oval, square, diamond, heart, long, triangle, pear, wide
  - **Hair** — 20 styles: short, long, spiky, curly, mohawk, buzz, ponytail, bun, pigtails, afro, braids, wavy, side part, fade, dreadlocks, bob, shoulder, undercut, twin buns
  - **Eyes** — 15 styles: normal, happy, wide, sleepy, wink, angry, dot, star, glasses, sunglasses, eye patch, crying, heart eyes, dizzy, closed
  - **Mouth** — 14 styles: smile, grin, neutral, open, tongue, frown, surprised, smirk, braces, vampire, whistle, mask, beard, moustache
  - **Body** — 3 shapes: regular, slim, broad
  - **Hats** — 12 options: crown, wizard, beanie, cap, pirate, headphones, tiara, horns, bunny ears, cat ears, halo, viking
  - **Gear** — 7 items equippable simultaneously: scarf, necklace, bow tie, cape, wings, shield, sword
  - **Face extras** — 7 options: freckles, blush, face paint, scar, bandage, stickers
  - **Outfit patterns** — 5 options: stripes, stars, camo, tie dye, plaid
  - **Pets** — 6 companions: cat, dog, dragon, owl, bunny, phoenix (with customisable colours, positioning, and accessories: crown, party hat, bow, bandana, halo, flower)
  - **Colour palettes** for skin, hair, eyes, mouth, body, background, hat, gear, and pet
- **Pets** — companion pets earn XP from all sources (quest completion, bonus XP, achievements, spin wheel) and level up through 8 tiers: Hatchling → Youngling → Companion → Loyal → Brave → Mighty → Majestic → Legendary. Higher-level pets grow larger and gain visual effects (purple glow at level 5+, gold glow at level 7+). The avatar editor shows all 8 level previews for the equipped pet
- **Party page** — family hub showing all members with their avatars, ranks, pet levels, daily progress rings, bulletin board, and a shoutout feed
- **Emotes** — broadcast avatar reactions to the whole family: dance, wave, cheer, flex, sparkle, high-five
- **Shoutouts** — send kudos with a custom message and emoji to any family member. Recent shoutouts appear in the Party feed
- **Progress charts** — 30-day view of daily XP earned, quests completed vs assigned, and completion rates
- **Themes** — pick from 8 colour themes (Quest Blue, Dragon Fire, Enchanted Forest, Arctic, Rose Gold, Galaxy, Sunshine, Fairy Dust) with dark mode, light mode, or auto (follows device setting)
- **PIN login** — log in with a 6-digit PIN instead of a password (handy for shared tablets)
- **Leaderboard** — weekly XP rankings showing each kid's weekly XP, lifetime XP, quests completed, current streak, rank, and pet level

## 🏰 For parents

- **Quest Library** — browse all created quests in one place, search and filter by category and difficulty. Create new quests from scratch or from 24 built-in RPG-themed templates
- **Quest Assignment** — assign quests to specific kids with per-child settings:
  - Individual recurrence per kid (one-time, daily, weekly, custom days)
  - Per-kid photo proof requirements
  - Optional kid rotation with cadence (daily, weekly, fortnightly, monthly)
- **Active Quests tab** — view only quests that have active assignments, with hero count badges
- **Verification queue** — review and approve/reject completed quests from the parent dashboard, including photo proof viewing. Leave feedback comments on quests (delivered via push notification)
- **Uncomplete / skip** — reverse a verification (deducting awarded XP) or skip a pending quest for the day
- **Bonus XP** — award ad-hoc bonus XP to any kid with a description (also awards pet XP)
- **Bulletin board** — post announcements (with optional pinning) to the family Party page, automatically sent as push notifications to all kids
- **Rewards management** — create categorised rewards with XP costs, stock limits, icons, and auto-approval thresholds. Approve, deny, or fulfil redemption requests
- **Family overview** — dashboard with kid cards showing today's quest progress, points balance, and current streak
- **Seasonal events** — create time-limited XP multiplier events (multipliers compound if multiple events are active)
- **Vacation mode** — set vacation/blackout periods that pause quest assignments and preserve kids' streaks. Streaks are automatically maintained across vacation days
- **Category management** — create, edit, and delete quest categories with custom icons and colours
- **Chore rotations** — rotate a quest between kids on a set cadence (daily/weekly/fortnightly/monthly) with manual advance option
- **Achievement management** — enable or disable individual achievements from Settings, with tier badges (Bronze/Silver/Gold) shown inline

## 🛡️ For admins

- **User management** — view all users, change roles (admin/parent/kid), activate/deactivate accounts
- **API keys** — generate scoped API keys with unique prefixes, track last usage, revoke keys
- **Invite codes** — generate registration codes with max uses and expiration dates. First user auto-becomes admin; subsequent users need a code (when public registration is disabled)
- **Audit log** — searchable log of logins, password changes, role changes, point adjustments, and other sensitive actions with timestamps, user IDs, and IP addresses
- **App settings** — configure daily reset hour, toggle leaderboard, spin wheel, and chore trading
- **Display name limit** — 10 character maximum enforced on registration and profile updates

---

## ⚙️ Configuration

### Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SECRET_KEY` | *required* | JWT signing key, minimum 16 characters |
| `TZ` | `Europe/London` | Container timezone |
| `REGISTRATION_ENABLED` | `false` | Allow public registration (no invite code needed) |
| `DATABASE_URL` | `sqlite+aiosqlite:////app/data/chores_os.db` | Database path |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `15` | Access token lifetime |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `30` | Refresh token lifetime |
| `COOKIE_SECURE` | `false` | Set `true` behind HTTPS |
| `CORS_ORIGINS` | *(empty)* | Comma-separated allowed origins for cross-origin requests |
| `DAILY_RESET_HOUR` | `0` | UTC hour for the daily assignment reset |
| `MAX_UPLOAD_SIZE_MB` | `5` | Photo upload size limit |
| `LOGIN_RATE_LIMIT_MAX` | `10` | Max login attempts per 300s window |
| `PIN_RATE_LIMIT_MAX` | `5` | Max PIN login attempts per 900s window |
| `REGISTER_RATE_LIMIT_MAX` | `5` | Max registration attempts per 3600s window |
| `VAPID_PUBLIC_KEY` | *(empty)* | VAPID public key for web push notifications |
| `VAPID_PRIVATE_KEY` | *(empty)* | VAPID private key for web push notifications |
| `VAPID_CLAIM_EMAIL` | `mailto:admin@example.com` | Contact email included in push requests |

### First run

The database, default categories (9), achievements (20), quest templates (24), and app settings are created on first startup. The first user to register becomes the admin. After that, registration requires an invite code by default — generate them from the admin dashboard.

### Data persistence

All persistent data lives in the `./data` directory (mounted as a Docker volume):
- `chores_os.db` — SQLite database (WAL mode)
- `uploads/` — photo proof files

Back up this directory to preserve all app data.

---

## 🧱 Tech stack

| | |
|---|---|
| **Backend** | Python / FastAPI (async) |
| **Database** | SQLite (WAL mode) |
| **ORM** | SQLAlchemy 2.0 (async) |
| **Frontend** | React 18, Vite, Tailwind CSS 4 |
| **Animations** | Framer Motion |
| **Fonts** | Inter |
| **Icons** | Lucide React |
| **Real-time** | WebSocket (per-user channels) |
| **Push** | Web Push with VAPID (pywebpush) |
| **Auth** | JWT access tokens + httpOnly refresh cookies, bcrypt, optional PIN |
| **Deployment** | Docker, single container |

---

## 📁 Project layout

```
backend/
  main.py            # FastAPI app, middleware, startup, daily reset task
  models.py          # SQLAlchemy models (27 tables)
  schemas.py         # Pydantic request/response schemas
  auth.py            # JWT, password/PIN hashing, token creation
  config.py          # Settings validation from environment
  achievements.py    # Achievement unlock criteria checking
  dependencies.py    # Auth dependency injection (get_current_user, require_parent)
  websocket_manager.py  # WebSocket connection manager
  seed.py            # Default categories, achievements, quest templates, settings
  services/
    push.py          # Web Push subscription management
    push_hook.py     # Push notification dispatch on events
    ranks.py         # Title/rank system (8 tiers based on lifetime XP)
    pet_leveling.py  # Pet XP progression (8 levels from Hatchling to Legendary)
  routers/
    auth.py          # Registration, login, PIN, refresh, profile
    chores.py        # Quest CRUD, categories, templates, assignment rules, completion
    rewards.py       # Reward CRUD, redemptions, approval workflow
    calendar.py      # Weekly calendar, auto-generation, quest trading
    stats.py         # Family stats, leaderboard, achievements, history, ranks
    points.py        # Bonus XP, point adjustments
    spin.py          # Daily spin wheel
    rotations.py     # Kid rotation management
    notifications.py # Notification listing, read/unread
    push.py          # Push subscription endpoints, VAPID key
    wishlist.py      # Kid wishlists, convert to reward
    events.py        # Seasonal event CRUD
    avatar.py        # Avatar parts, customisation, avatar shop purchases
    vacation.py      # Vacation/blackout periods (streak-preserving)
    progress.py      # 30-day progress chart data (XP, completions, rates)
    shoutouts.py     # Family shoutouts (kudos with messages)
    emotes.py        # Avatar emotes broadcast via WebSocket
    announcements.py # Family bulletin board (CRUD with push notifications)
    pets.py          # Pet interactions (feed/pet/play for bonus XP)
    admin.py         # Users, API keys, invite codes, audit log, settings
    uploads.py       # Photo proof upload/retrieval
frontend/
  public/
    manifest.json    # PWA manifest
    sw.js            # Service worker (caching, push, offline)
  src/
    pages/           # Page components
      KidDashboard   # Quest carousel, points, streak, spin wheel, board themes
      ParentDashboard # Family overview, verification queue, bonus XP
      AdminDashboard # Users, API keys, invite codes, audit log tabs
      Chores         # Quest library + active quests (two-tab parent view)
      ChoreDetail    # Quest detail, assignment rules, rotation, guild actions
      Calendar       # Weekly calendar view with quest assignments
      Rewards        # Treasure Shop with redemption workflow
      Inventory      # Redemption history (pending/approved/fulfilled)
      KidQuests      # Per-kid quest view for parents
      Leaderboard    # Weekly XP rankings with ranks and pet levels
      Wishlist       # Kid wishlist management
      Events         # Seasonal event calendar
      Profile        # Avatar editor, stats, streak display
      AvatarShop     # Browse and purchase avatar items with XP
      Party          # Family hub with avatars, ranks, shoutouts, emotes
      Settings       # Theme, vacation, security, notification preferences
      Login          # Password and PIN login
      Register       # Registration with invite code
    components/      # Shared components
      avatar/        # SVG avatar renderer (heads, hair, eyes, mouths, bodies,
                     #   hats, accessories, face extras, outfit patterns, pets)
      QuestBoardTheme # Themed board overlays and particle effects
      RankBadge      # XP rank display component
      PetLevelBadge  # Pet level display component
      ShoutoutPanel  # Shoutout feed and creation
      EmoteBar       # Emote reaction buttons
      StreakDisplay   # Flame icon with streak count
      VacationSettings # Vacation period management
    hooks/           # useAuth, useTheme, useWebSocket, useNotifications, usePushNotifications
    api/client.js    # Fetch wrapper with token refresh
    utils/
      questThemeText.js  # RPG-themed quest title/description transforms
data/                # SQLite DB + uploaded photos (Docker volume)
static/              # Built frontend assets served by FastAPI
```

---

## 🌐 WebSocket events

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
| `emote` | Avatar emote broadcast (dance, wave, cheer, etc.) |
| `shoutout` | Family member sends kudos |
| `pet_levelup` | Pet reaches a new level tier |
| `announcement` | Parent posts a bulletin board announcement |

---

## 🔒 Security

- **Password login** — username + password with bcrypt hashing
- **PIN login** — 6-digit PIN for quick kid access on shared devices
- **JWT tokens** — short-lived access tokens (15 min default) with httpOnly refresh cookies (30 day default)
- **Token rotation** — refresh tokens are rotated on each use, old tokens revoked
- **Rate limiting** — login (10/5min), PIN (5/15min), registration (5/hour)
- **Security headers** — X-Frame-Options, Content-Security-Policy, Strict-Transport-Security, Permissions-Policy
- **Invite-only registration** — public registration disabled by default, admin generates invite codes with usage limits and expiration
- **Display name limit** — 10 character maximum enforced at schema, database, and UI levels
