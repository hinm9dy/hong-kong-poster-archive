# HONG KONG POSTER ARCHIVE 2026

A bilingual Hong Kong poster archive with an interactive, draggable fisheye poster wall, a numbered accordion list, menu-based search and year filters, contributor submissions, and private curation. The interface switches between Chinese and English with one persistent language selection.

## Website and hosting

- GitHub Pages frontend: https://hinm9dy.github.io/hong-kong-poster-archive/
- Repository: https://github.com/hinm9dy/hong-kong-poster-archive
- Submission API and authenticated admin: https://poster-archive-2026-hink.candidgrove16.chatgpt.site

GitHub Pages serves the interactive gallery and its assets from `docs/`. It does not run server-side code. Submissions go to the existing API; moderation and contact emails stay behind admin authentication. The public endpoints allow the `https://hinm9dy.github.io` origin without sharing login cookies. Admin routes do not permit cross-origin access.

If the API is unavailable, the gallery uses the public catalogue snapshot bundled at build time. Submission failures remain errors and are never displayed as successful uploads. The original sample posters are labelled as demo artwork when there are no published submissions.

To rebuild Pages with Node 22.13+ and dependencies installed:

```sh
npm run build:pages
npm run preview:pages
```

Commit the resulting `docs/` directory. In GitHub Settings → Pages, use **Deploy from a branch**, **main**, **/docs**. To change the project path, set `PAGES_BASE_PATH` (including the leading and trailing slash) when building. The frontend and backend share the same React components; the server remains deployed separately on Sites.

The repository contains source, original demo assets and the static build. It excludes runtime secrets, uploads, databases, local authentication files and development tool state.

## Data and access

- D1 stores submissions, names, years, contact emails, and moderation state. R2 stores original images.
- JPEG, PNG and WebP files up to 5,000,000 bytes are accepted. Client and server validate size and type.
- New submissions are pending. Curators select a poster, then separately publish it. Unpublishing and rejection are reversible.
- Public APIs return only published posters and omit email addresses. Unpublished images require curator authorization.
- ChatGPT sign-in is provided by Sites. The server checks `ARCHIVE_ADMIN_EMAILS`, a comma-separated runtime allowlist, on every admin read and write. No admin identity is bundled in client code.
- The gallery and submission endpoint are public. Admin access still requires the runtime email allowlist.
- Public pages show clearly labelled original demo artwork when the archive has no published posters. Examples are never inserted into the submissions database.
- No automated email is sent. Contact emails are available in the admin directory and selected-list CSV export.

## Local development

Use Node 22.13 or newer and npm. The Sites skill helpers install and build this project.

1. Install the starter dependencies.
2. Create an ignored `.dev.vars` containing `ARCHIVE_ADMIN_EMAILS="seedy@sites.test"` for local mock auth.
3. Build once, then apply `drizzle/0000_deep_rage.sql` with the local D1 command documented in the Sites starter.
4. `npm run dev -- --hostname 127.0.0.1`
5. Open `/admin` and use the local simulated sign-in. Production uses real platform identity.

## Verification

- `node node_modules/typescript/bin/tsc --noEmit`
- `node tests/public-access.mjs` checks cross-origin allowlisting, preflight methods, rejected headers and absence of credential sharing.
- `node tests/workflow.mjs` against the local preview only. Creates clearly named local fixtures under `archive-qa@example.test`; never run against production.
- Integration coverage: exact 5MB boundary, oversize and spoofed file rejection, input and consent validation, authorization, private images and emails, moderation transitions, concurrent stale updates, publication and unpublication.
- Desktop browser QA: scattered drag scene, reset, language switching and persistence, menu, search, numbered list and inline expansion, minimal submission form. Responsive layout inspected at 390px. See design-qa.md for the three-reference comparison.

## Interaction

Drag with pointer or touch to explore. Arrow keys pan the focused wall. Zoom and reset controls are provided. Reduced-motion preferences disable inertia and perspective. The list inside the menu offers a conventional browse mode with inline image expansion.

## Collection capacity

- The archive has no 12- or 100-poster cap. Each published record adds one list row and one wall tile. No demo fillers or duplicate tiles are added.
- Images are stored durably in the Site R2 binding, not in GitHub or browser storage. 100 originals at the 5,000,000-byte upload limit need 500 MB. R2 bucket storage grows with usage; no application total-size cap is imposed.
- Admin shows the total stored poster count and original-file megabytes, including unpublished submissions. Only published records are public.
- The existing abuse throttle is 20 submissions per source per hour; it is separate from collection capacity.
- `node tests/capacity.mjs` runs only against local preview: uploads 101 exact-5MB PNGs, checks 505 MB of stored records, selects/publishes each, checks incremental counts at 1/12/13/100/101, and retrieves every original byte-for-byte. It leaves clearly labelled local fixtures for browser QA; never point it at production.
- Verified in local preview on 2026-11-02: all capacity checks passed, 101 list rows, 101 unique wall tiles. Production data was not populated with test fixtures.
