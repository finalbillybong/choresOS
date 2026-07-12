# Avatar and Seasonal Themes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make bad-behavior recording permanent, make personal themes visibly work, add parent-controlled global Easter and Christmas themes, and substantially polish the SVG avatar system and editor.

**Architecture:** Store the family-wide seasonal override in `AppSetting` behind a dedicated authenticated theme API, while preserving each user's personal theme in `avatar_config.color_theme`. Resolve personal and special themes in one frontend context, render seasonal decoration once in `Layout`, and keep avatar configuration IDs stable while upgrading the SVG paint system and editor option presentation.

**Tech Stack:** FastAPI, SQLAlchemy 2 async, Pydantic, React 18, Vite 6, Tailwind CSS 4, inline SVG, Framer Motion, Node test runner, Python unittest.

## Global Constraints

- One ChoreQuest installation represents one family; the special theme applies to every active user in that installation.
- Special theme values are exactly `none`, `easter`, and `christmas`.
- Only `parent` and `admin` may change the special theme; every authenticated user may read it.
- Special themes are enabled and disabled manually; there is no date scheduler.
- Personal `avatar_config.color_theme` values must remain intact while a special theme is active.
- Existing avatar configuration keys and item IDs must remain backward compatible.
- No bitmap assets or external avatar library are introduced.
- Seasonal and avatar motion must respect `prefers-reduced-motion`.
- The bad-behavior penalty algorithm, calendar entries, notifications, and audit records do not change.

---

### Task 1: Remove the bad-behavior feature flag

**Files:**
- Modify: `backend/routers/bad_behaviors.py`
- Modify: `backend/routers/admin.py`
- Delete: `backend/services/feature_flags.py`
- Modify: `backend/tests/test_bad_behavior.py`
- Modify: `frontend/src/hooks/useSettings.jsx`
- Modify: `frontend/src/pages/ParentDashboard.jsx`
- Modify: `docker-compose.yml`
- Delete: `srv/chorequest/features.json`

**Interfaces:**
- Consumes: existing `require_parent` dependency on all `/api/bad-behaviors` routes.
- Produces: permanently available bad-behavior API and unconditional `BadBehaviorPanel` for parent/admin dashboards.

- [ ] **Step 1: Replace feature-flag parser tests with a permanent-availability regression test**

In `backend/tests/test_bad_behavior.py`, delete `FeatureFlagFileTest` and its feature flag import, then add:

```python
from pathlib import Path


class BadBehaviorAvailabilityTest(unittest.TestCase):
    def test_router_has_no_feature_flag_guard(self):
        source = Path("backend/routers/bad_behaviors.py").read_text(encoding="utf-8")
        self.assertNotIn("feature_flags", source)
        self.assertNotIn("_require_feature_enabled", source)
        self.assertIn("Depends(require_parent)", source)
```

- [ ] **Step 2: Run the focused backend test and verify it fails**

Run: `python -m unittest backend.tests.test_bad_behavior.BadBehaviorAvailabilityTest -v`

Expected: FAIL because `feature_flags` and `_require_feature_enabled` are still present.

- [ ] **Step 3: Remove every bad-behavior feature toggle path**

Apply these exact structural changes:

```python
# backend/routers/bad_behaviors.py
# Delete:
from backend.services.feature_flags import is_bad_behavior_enabled

# Delete _require_feature_enabled() and every call to it.
# Keep Depends(require_parent) unchanged on all routes.
```

```python
# backend/routers/admin.py
# Delete the feature_flags import and this response mutation:
features[BAD_BEHAVIOR_FLAG] = load_file_feature_flags().get(BAD_BEHAVIOR_FLAG, "false")
```

```jsx
// frontend/src/hooks/useSettings.jsx
// Remove bad_behavior_enabled from SettingsContext, DEFAULT_FEATURES,
// and the object created in fetchFeatures().
```

```jsx
// frontend/src/pages/ParentDashboard.jsx
// Remove useSettings import/destructuring for bad_behavior_enabled.
<BadBehaviorPanel kids={familyStats} onRecorded={fetchData} />
```

Delete `backend/services/feature_flags.py` and `srv/chorequest/features.json`. Remove both `FEATURE_FLAGS_PATH` and the `./srv/chorequest:/srv/chorequest` volume from `docker-compose.yml`.

- [ ] **Step 4: Run focused and search-based verification**

Run:

```powershell
python -m unittest backend.tests.test_bad_behavior -v
rg -n "bad_behavior_enabled|FEATURE_FLAGS_PATH|features.json|services.feature_flags" backend frontend docker-compose.yml srv
```

Expected: backend tests PASS; `rg` returns no matches.

- [ ] **Step 5: Commit the permanent feature**

```powershell
git add backend/routers/bad_behaviors.py backend/routers/admin.py backend/tests/test_bad_behavior.py frontend/src/hooks/useSettings.jsx frontend/src/pages/ParentDashboard.jsx docker-compose.yml backend/services/feature_flags.py srv/chorequest/features.json
git commit -m "feat: make bad behavior recording permanent"
```

### Task 2: Add the family special-theme backend

**Files:**
- Create: `backend/services/family_theme.py`
- Create: `backend/routers/theme.py`
- Create: `backend/tests/test_family_theme.py`
- Modify: `backend/seed.py`
- Modify: `backend/main.py`

**Interfaces:**
- Produces: `SPECIAL_THEME_KEY: str`, `SPECIAL_THEMES: tuple[str, ...]`, `normalize_special_theme(value: str) -> str`, `GET /api/theme/special`, and `PUT /api/theme/special` accepting `{ "special_theme": string }`.
- Consumes: `AppSetting`, `get_current_user`, `require_parent`, and `ws_manager.broadcast`.

- [ ] **Step 1: Write failing domain and route-contract tests**

Create `backend/tests/test_family_theme.py`:

```python
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
```

- [ ] **Step 2: Run the new test and verify import failure**

Run: `python -m unittest backend.tests.test_family_theme -v`

Expected: ERROR because `backend.routers.theme` and `backend.services.family_theme` do not exist.

- [ ] **Step 3: Implement the theme domain and router**

Create `backend/services/family_theme.py`:

```python
SPECIAL_THEME_KEY = "special_theme"
SPECIAL_THEMES = ("none", "easter", "christmas")


def normalize_special_theme(value: str) -> str:
    normalized = str(value).strip().lower()
    if normalized not in SPECIAL_THEMES:
        raise ValueError(f"Unsupported special theme: {value}")
    return normalized
```

Create `backend/routers/theme.py` with a `SpecialThemeUpdate(BaseModel)` request, an authenticated GET that defaults to `none`, and a parent-protected PUT that upserts `AppSetting`, commits, then broadcasts:

```python
await ws_manager.broadcast({
    "type": "data_changed",
    "data": {"entity": "special_theme", "special_theme": special_theme},
})
return {"special_theme": special_theme}
```

Convert `ValueError` from `normalize_special_theme` to HTTP 422. Add `"special_theme": "none"` to `DEFAULT_SETTINGS`. Import/register `theme.router` in `backend/main.py`.

- [ ] **Step 4: Run backend theme and full backend tests**

Run:

```powershell
python -m unittest backend.tests.test_family_theme -v
python -m unittest discover -s backend/tests -v
```

Expected: all tests PASS.

- [ ] **Step 5: Commit the backend theme API**

```powershell
git add backend/services/family_theme.py backend/routers/theme.py backend/tests/test_family_theme.py backend/seed.py backend/main.py
git commit -m "feat: add family seasonal theme API"
```

### Task 3: Resolve personal and special themes in one frontend context

**Files:**
- Create: `frontend/src/utils/themeResolver.js`
- Create: `frontend/src/utils/themeResolver.test.js`
- Modify: `frontend/src/hooks/useTheme.jsx`
- Modify: `frontend/src/main.jsx`
- Modify: `frontend/src/components/Layout.jsx`
- Modify: `frontend/src/pages/Profile.jsx`

**Interfaces:**
- Produces: `SPECIAL_THEMES`, `resolveEffectiveTheme(personalTheme, specialTheme)`, `canManageSpecialTheme(role)`, and theme-context values `personalTheme`, `specialTheme`, `effectiveTheme`, `setSpecialTheme`, `specialThemeSaving`, `specialThemeError`.
- Consumes: `/api/auth/me`, `/api/theme/special`, `useAuth().user`, and `window` events `ws:message`.

- [ ] **Step 1: Write failing resolver tests**

Create `frontend/src/utils/themeResolver.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SPECIAL_THEMES,
  canManageSpecialTheme,
  resolveEffectiveTheme,
} from './themeResolver.js';

test('special theme overrides a personal theme', () => {
  assert.equal(resolveEffectiveTheme('forest', 'christmas'), 'christmas');
  assert.equal(resolveEffectiveTheme('rose', 'easter'), 'easter');
});

test('none restores the personal theme', () => {
  assert.equal(resolveEffectiveTheme('galaxy', 'none'), 'galaxy');
});

test('invalid values fall back safely', () => {
  assert.equal(resolveEffectiveTheme('unknown', 'none'), 'default');
  assert.equal(resolveEffectiveTheme('forest', 'unknown'), 'forest');
});

test('only parents and admins manage special themes', () => {
  assert.equal(canManageSpecialTheme('kid'), false);
  assert.equal(canManageSpecialTheme('parent'), true);
  assert.equal(canManageSpecialTheme('admin'), true);
  assert.deepEqual(SPECIAL_THEMES.map(({ id }) => id), ['none', 'easter', 'christmas']);
});
```

- [ ] **Step 2: Run the test and verify module failure**

Run: `node --test src/utils/themeResolver.test.js` from `frontend`.

Expected: FAIL with `ERR_MODULE_NOT_FOUND`.

- [ ] **Step 3: Implement the pure resolver**

Create `frontend/src/utils/themeResolver.js` with metadata for the three special-theme picker cards and these exports:

```js
const PERSONAL_THEME_IDS = new Set([
  'default', 'dragon', 'forest', 'arctic', 'rose', 'galaxy', 'sunshine', 'fairy',
]);
const SPECIAL_THEME_IDS = new Set(['none', 'easter', 'christmas']);

export function resolveEffectiveTheme(personalTheme, specialTheme) {
  const personal = PERSONAL_THEME_IDS.has(personalTheme) ? personalTheme : 'default';
  const special = SPECIAL_THEME_IDS.has(specialTheme) ? specialTheme : 'none';
  return special === 'none' ? personal : special;
}

export function canManageSpecialTheme(role) {
  return role === 'parent' || role === 'admin';
}
```

- [ ] **Step 4: Refactor `ThemeProvider` around authenticated state**

Move `AuthProvider` outside `ThemeProvider` in `frontend/src/main.jsx` so `useTheme.jsx` can consume `useAuth`:

```jsx
<AuthProvider>
  <ThemeProvider>
    <SettingsProvider><App /></SettingsProvider>
  </ThemeProvider>
</AuthProvider>
```

In `useTheme.jsx`, rename internal `colorTheme` state to `personalTheme`, add `specialTheme`, derive `effectiveTheme`, and apply document classes from `effectiveTheme`. `setColorTheme` must optimistically update the personal state, persist merged `avatar_config`, and call `updateUser({ avatar_config: saved.avatar_config })`. On failure it restores the previous personal value and exposes an error.

Fetch `/api/theme/special` whenever `user?.id` becomes available and after a `ws:message` whose `detail.data.entity` is `special_theme`. `setSpecialTheme(id)` performs optimistic update, PUT, rollback on failure, and exposes saving/error state.

Keep `colorTheme: personalTheme` in the context as a compatibility alias for current consumers. Add `effectiveTheme` and `specialTheme` as new fields.

- [ ] **Step 5: Remove obsolete Layout syncing and add profile override feedback**

Remove `syncFromUser` usage from `Layout`; the provider now reads `user` directly. In `Profile`, show this notice above ordinary color choices when `specialTheme !== 'none'`:

```jsx
<div className="mb-3 rounded-xl border border-accent/30 bg-accent/10 p-3 text-xs text-cream/80">
  Rodzinny motyw świąteczny jest aktywny. Twój zwykły motyw pozostaje zapisany
  i wróci po wyłączeniu motywu świątecznego.
</div>
```

- [ ] **Step 6: Run resolver tests and production build**

Run:

```powershell
node --test src/utils/themeResolver.test.js
npm run build
```

Expected: tests PASS and Vite build succeeds.

- [ ] **Step 7: Commit frontend theme state**

```powershell
git add frontend/src/utils/themeResolver.js frontend/src/utils/themeResolver.test.js frontend/src/hooks/useTheme.jsx frontend/src/main.jsx frontend/src/components/Layout.jsx frontend/src/pages/Profile.jsx
git commit -m "fix: apply personal and family themes consistently"
```

### Task 4: Add seasonal controls and decorative layers

**Files:**
- Create: `frontend/src/components/SeasonalThemeLayer.jsx`
- Create: `frontend/src/components/SeasonalThemeLayer.test.js`
- Modify: `frontend/src/components/Layout.jsx`
- Modify: `frontend/src/pages/Settings.jsx`
- Modify: `frontend/src/index.css`
- Modify: `frontend/public/local-overrides/pl-runtime.js`

**Interfaces:**
- Consumes: `specialTheme`, `setSpecialTheme`, `specialThemeSaving`, and `specialThemeError` from `useTheme`.
- Produces: `SeasonalThemeLayer({ theme })`, non-interactive Christmas/Easter decorations, and parent/admin setting cards.

- [ ] **Step 1: Write a failing seasonal-layer source contract**

Create `frontend/src/components/SeasonalThemeLayer.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('./SeasonalThemeLayer.jsx', import.meta.url), 'utf8');

test('seasonal layer is decorative and supports both holidays', () => {
  assert.match(source, /aria-hidden="true"/);
  assert.match(source, /pointer-events-none/);
  assert.match(source, /christmas/);
  assert.match(source, /easter/);
});
```

- [ ] **Step 2: Run it and verify missing-file failure**

Run: `node --test src/components/SeasonalThemeLayer.test.js` from `frontend`.

Expected: FAIL because the component file does not exist.

- [ ] **Step 3: Build the decorative layer**

Create a single `SeasonalThemeLayer` root with `fixed inset-0 pointer-events-none`, `aria-hidden="true"`, a top garland/spring branch, a bounded particle array, and bottom scenery. Render no markup for `none`. Use deterministic index-based CSS custom properties instead of random values so hydration and tests remain stable.

Christmas renders snowflakes, light bulbs, evergreen corners, ornaments, and gifts. Easter renders petals, egg decorations, bunny-ear silhouettes, branches, and a low grass edge.

- [ ] **Step 4: Add the family settings picker**

In `Settings.jsx`, consume theme context and render three large cards from `SPECIAL_THEMES`. Disable cards during save, show active state from `specialTheme`, and show `specialThemeError` without modifying the general settings save flow.

Mount `<SeasonalThemeLayer theme={specialTheme} />` once near the root of `Layout`, before the interactive content.

- [ ] **Step 5: Add theme variables, panel accents, particles, and reduced-motion CSS**

Add `.theme-christmas` and `.theme-easter` variable sets (including light-mode variants), seasonal panel corner decorations, `@keyframes seasonal-snow-fall`, `seasonal-petal-drift`, and light twinkle. Cap desktop particles at 24 and hide every second particle under `640px`.

Add:

```css
@media (prefers-reduced-motion: reduce) {
  .seasonal-particle,
  .seasonal-light {
    animation: none !important;
  }
}
```

- [ ] **Step 6: Update Polish runtime overlay strings**

Add translations for `Holiday Theme`, `None`, `Easter`, `Christmas`, the override notice, saving/error labels, and both seasonal descriptions to `pl-runtime.js`.

- [ ] **Step 7: Run seasonal tests and build**

Run:

```powershell
node --test src/components/SeasonalThemeLayer.test.js src/utils/themeResolver.test.js
npm run build
```

Expected: tests PASS and build succeeds.

- [ ] **Step 8: Commit seasonal UI**

```powershell
git add frontend/src/components/SeasonalThemeLayer.jsx frontend/src/components/SeasonalThemeLayer.test.js frontend/src/components/Layout.jsx frontend/src/pages/Settings.jsx frontend/src/index.css frontend/public/local-overrides/pl-runtime.js
git commit -m "feat: add parent controlled holiday themes"
```

### Task 5: Add a reusable polished SVG paint system

**Files:**
- Create: `frontend/src/components/avatar/avatarPaint.js`
- Create: `frontend/src/components/avatar/avatarPaint.test.js`
- Modify: `frontend/src/components/AvatarDisplay.jsx`
- Modify: `frontend/src/index.css`

**Interfaces:**
- Produces: `mixHex(color, target, amount)`, `buildAvatarPalette(config)`, unique SVG gradients/filters, and illustration classes used by all avatar parts.
- Consumes: existing avatar config color keys and render functions.

- [ ] **Step 1: Write failing color utility tests**

Create `frontend/src/components/avatar/avatarPaint.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildAvatarPalette, mixHex } from './avatarPaint.js';

test('mixHex creates stable lighter and darker colors', () => {
  assert.equal(mixHex('#000000', '#ffffff', 0.5), '#808080');
  assert.equal(mixHex('#ffffff', '#000000', 0.25), '#bfbfbf');
});

test('avatar palette preserves base user colors', () => {
  const palette = buildAvatarPalette({ head_color: '#c68642', hair_color: '#4a3728' });
  assert.equal(palette.skin.base, '#c68642');
  assert.equal(palette.hair.base, '#4a3728');
  assert.notEqual(palette.skin.light, palette.skin.base);
  assert.notEqual(palette.skin.shadow, palette.skin.base);
});
```

- [ ] **Step 2: Run and verify missing module failure**

Run: `node --test src/components/avatar/avatarPaint.test.js` from `frontend`.

Expected: FAIL with `ERR_MODULE_NOT_FOUND`.

- [ ] **Step 3: Implement deterministic color mixing and palette building**

`mixHex` normalizes three- and six-digit hex colors, clamps `amount` to 0..1, rounds each mixed channel, and returns lowercase six-digit hex. `buildAvatarPalette` returns `{ base, light, shadow }` groups for skin, hair, outfit, hat, gear, background, and pet.

- [ ] **Step 4: Upgrade `AvatarDisplay` paint and composition**

Use React `useId()` to produce unique IDs per SVG instance. Add `<defs>` for skin, hair, outfit, hat, gear, background, and pet linear/radial gradients plus a soft shadow filter. Pass gradient URLs to existing render functions without changing their accepted IDs.

Render a vignetted background with two decorative glow shapes, wrap back/middle/front part groups in named classes, apply the shadow only to the main silhouette, and add a subtle rim-light overlay. Keep the current layer order for rear accessories, body, head, face, hair, hats, front accessories, and pet.

- [ ] **Step 5: Add shared finish styles**

Add crisp `shape-rendering`, soft avatar-stage shadow, focused thumbnail styles, and reduced-motion handling. Do not set a global SVG stroke that could distort detailed items.

- [ ] **Step 6: Run paint tests and build**

Run:

```powershell
node --test src/components/avatar/avatarPaint.test.js
npm run build
```

Expected: tests PASS and build succeeds.

- [ ] **Step 7: Commit paint system**

```powershell
git add frontend/src/components/avatar/avatarPaint.js frontend/src/components/avatar/avatarPaint.test.js frontend/src/components/AvatarDisplay.jsx frontend/src/index.css
git commit -m "feat: add polished avatar SVG paint system"
```

### Task 6: Refine avatar heads, faces, hair, outfits, accessories, and pets

**Files:**
- Modify: `frontend/src/components/avatar/heads.jsx`
- Modify: `frontend/src/components/avatar/eyes.jsx`
- Modify: `frontend/src/components/avatar/mouths.jsx`
- Modify: `frontend/src/components/avatar/faceExtras.jsx`
- Modify: `frontend/src/components/avatar/hair.jsx`
- Modify: `frontend/src/components/avatar/bodies.jsx`
- Modify: `frontend/src/components/avatar/hats.jsx`
- Modify: `frontend/src/components/avatar/accessories.jsx`
- Modify: `frontend/src/components/avatar/pets.jsx`
- Create: `frontend/src/components/avatar/avatarArtwork.test.js`

**Interfaces:**
- Consumes: existing renderer signatures and item IDs.
- Produces: richer SVG markup for every current option while preserving all exported maps and renderer signatures.

- [ ] **Step 1: Write a failing compatibility and finish test**

Create `frontend/src/components/avatar/avatarArtwork.test.js` to import every map/catalog and assert all legacy IDs remain present. Read each artwork source and assert it contains at least one illustration-finish marker (`avatar-highlight`, `avatar-outline`, or `avatar-detail`) after the rewrite.

```js
for (const file of artworkFiles) {
  const source = readFileSync(new URL(file, import.meta.url), 'utf8');
  assert.match(source, /avatar-(highlight|outline|detail)/, `${file} needs finish details`);
}
```

- [ ] **Step 2: Run the test and verify finish-marker failures**

Run: `node --test src/components/avatar/avatarArtwork.test.js` from `frontend`.

Expected: FAIL for artwork files without finish markers.

- [ ] **Step 3: Refine base anatomy and facial expression artwork**

For every head shape, retain current geometry anchors but add a soft lower-face shade, ear inner detail, and cheek/nose highlight. Refine eyes with consistent sclera, iris, catchlight, and expression line weights. Refine mouths with consistent lips/teeth/tongue shading. Add finish classes to meaningful visible details, not dummy markers.

- [ ] **Step 4: Refine hair and outfit artwork**

Keep all existing hair and outfit pattern IDs. Add layered locks/highlights to each hair silhouette, cleaner neck/shoulder transitions to all body shapes, and secondary texture/detail to each outfit pattern. Ensure gradient fills still work when passed as the `color` argument.

- [ ] **Step 5: Refine hats, gear, face extras, pets, and pet accessories**

Add consistent edge shading, highlights, attachment points, and small material cues. Preserve current position math and pet level extras. Improve each pet's face, ears/wings/tail separation, paws, and catchlights while retaining `renderPet`, `renderPetExtras`, and `renderPetAccessory` signatures.

- [ ] **Step 6: Run avatar compatibility tests and build**

Run:

```powershell
node --test src/components/avatar/avatarArtwork.test.js src/components/avatar/themedAvatarCatalog.test.js src/components/avatar/avatarPaint.test.js
npm run build
```

Expected: all tests PASS and build succeeds.

- [ ] **Step 7: Commit artwork refinements**

```powershell
git add frontend/src/components/avatar frontend/src/components/AvatarDisplay.jsx
git commit -m "feat: refine avatar and companion artwork"
```

### Task 7: Rebuild the avatar editor around visual option cards

**Files:**
- Create: `frontend/src/components/avatar/AvatarOptionCard.jsx`
- Create: `frontend/src/components/avatar/AvatarOptionCard.test.js`
- Modify: `frontend/src/components/AvatarEditor.jsx`
- Modify: `frontend/src/index.css`
- Modify: `frontend/public/local-overrides/pl-runtime.js`

**Interfaces:**
- Produces: `AvatarOptionCard({ option, previewConfig, selected, locked, onSelect, onPreview, onPreviewEnd })` and responsive visual option grids.
- Consumes: `AvatarDisplay`, current option arrays, lock maps, and config setters.

- [ ] **Step 1: Write a failing option-card source contract**

Create `frontend/src/components/avatar/AvatarOptionCard.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('./AvatarOptionCard.jsx', import.meta.url), 'utf8');

test('option cards show a real avatar preview and accessible state', () => {
  assert.match(source, /AvatarDisplay/);
  assert.match(source, /aria-pressed/);
  assert.match(source, /aria-disabled/);
  assert.match(source, /Lock/);
});
```

- [ ] **Step 2: Run and verify missing-file failure**

Run: `node --test src/components/avatar/AvatarOptionCard.test.js` from `frontend`.

Expected: FAIL because the card does not exist.

- [ ] **Step 3: Implement the visual option card**

Render a compact `AvatarDisplay` using `previewConfig`, a selected ring/check state, the option label, and a lock overlay. Locked cards call preview callbacks on hover/focus/touch but never call `onSelect`. Use a native button with `aria-pressed`, `aria-disabled`, and a visible focus ring.

- [ ] **Step 4: Replace text selectors with preview grids**

In `AvatarEditor.jsx`, centralize option-to-preview-config mapping. Replace `ShapeSelector` and `MultiShapeSelector` text pills with `AvatarOptionCard` grids for head, hair, eyes, mouth, body, pattern, hat, face extra, gear, and pet. Keep position controls as compact segmented buttons because their value is spatial rather than visual.

Replace raw category labels with Lucide icons plus labels. Keep a horizontally scrolling category bar on mobile and use a two-column desktop layout with sticky preview stage and scrollable controls.

- [ ] **Step 5: Polish preview stage and color palettes**

Increase the central preview, add a soft decorative backdrop, unsaved-change indicator, clear save feedback, and larger labeled swatches. Each swatch exposes a Polish-friendly accessible label and selected checkmark. Keep keyboard navigation and the locked-item temporary preview behavior.

- [ ] **Step 6: Update Polish overlay copy**

Add translations for the new section headings, save/unsaved messages, color labels, lock preview hint, category names, and editor help text.

- [ ] **Step 7: Run option-card, avatar, translation tests, and build**

Run:

```powershell
node --test src/components/avatar/AvatarOptionCard.test.js src/components/avatar/avatarArtwork.test.js src/components/avatar/avatarPaint.test.js src/utils/polishOverlayTranslations.test.js
npm run build
```

Expected: all tests PASS and build succeeds.

- [ ] **Step 8: Commit editor redesign**

```powershell
git add frontend/src/components/AvatarEditor.jsx frontend/src/components/avatar/AvatarOptionCard.jsx frontend/src/components/avatar/AvatarOptionCard.test.js frontend/src/index.css frontend/public/local-overrides/pl-runtime.js
git commit -m "feat: redesign avatar editor with visual previews"
```

### Task 8: Full verification, documentation, and repository guidance

**Files:**
- Modify: `README.md`
- Modify or create only if available: `/srv/AGENTS.md`
- Modify: `docs/superpowers/plans/2026-07-10-avatar-seasonal-themes.md` (check completed steps during execution)

**Interfaces:**
- Consumes: all previous task deliverables.
- Produces: verified production build, documented theme behavior, and reusable repository guidance.

- [ ] **Step 1: Update README feature descriptions**

Document that bad behavior is permanent, ordinary themes are personal, Easter/Christmas overrides are controlled by parent/admin, and avatar/editor visuals were refreshed. Do not claim scheduling or multi-family support.

- [ ] **Step 2: Run the complete automated suite**

Run from repository root:

```powershell
python -m unittest discover -s backend/tests -v
Set-Location frontend
node --test
npm run build
Set-Location ..
git diff --check
```

Expected: all backend tests PASS, all frontend tests PASS, Vite build succeeds, and `git diff --check` emits no errors.

- [ ] **Step 3: Start the local app and perform browser QA**

Run the existing development stack. Verify parent/admin settings, ordinary kid theme selection, Easter activation/deactivation, Christmas activation/deactivation, permanent bad-behavior panel, avatar save, locked previews, mobile layout, desktop layout, reduced-motion mode, and browser console errors.

Expected: theme changes are visible immediately; special theme overrides all sessions; ordinary themes return after disabling; no controls are obscured; no new console errors.

- [ ] **Step 4: Read and update `/srv/AGENTS.md` if it exists**

Record only durable information useful to future tasks: the `special_theme` setting/API, theme resolver ownership, seasonal layer location, avatar paint utility, and exact test commands. If the execution environment still has no `/srv/AGENTS.md`, report that fact rather than creating an unrelated host-level file.

- [ ] **Step 5: Commit documentation and final verified state**

```powershell
git add README.md docs/superpowers/plans/2026-07-10-avatar-seasonal-themes.md
git commit -m "docs: describe seasonal themes and avatar refresh"
```

If `/srv/AGENTS.md` exists outside the Git worktree, update it separately and do not attempt to stage it in this repository.

- [ ] **Step 6: Review final diff and commit history**

Run:

```powershell
git status --short
git diff HEAD~8..HEAD --stat
git log -10 --oneline --decorate
```

Expected: clean worktree, only scoped files changed, and all implementation commits are present.
