# Polish translation overlay

This is a local, repeatable overlay for the upstream ChoreQuest app.

Upstream does not currently provide an i18n system. Instead of editing many
React components directly, this overlay injects one same-origin runtime script
that translates visible DOM text and common UI attributes after React renders.

After pulling upstream changes, reapply the overlay:

```bash
cd /srv/chorequest
./local-overrides/polish-translation/apply.sh
docker compose up -d --build
```

The installer is idempotent. It:

- copies `pl-runtime.js` into `frontend/public/local-overrides/`,
- ensures `frontend/index.html` loads `/local-overrides/pl-runtime.js`,
- sets `frontend/index.html` to `lang="pl"`,
- sets the PWA manifest language and Polish description,
- ensures `.dockerignore` excludes local secrets and runtime data.

Extend translations by editing the `TEXT` and `PATTERNS` sections in
`pl-runtime.js`, then rerun `apply.sh` and rebuild.

Limitations:

- This is a runtime UI overlay, not a full source-level i18n refactor.
- Text not present in the dictionary remains in the upstream language.
- User-created content is intentionally not translated.
