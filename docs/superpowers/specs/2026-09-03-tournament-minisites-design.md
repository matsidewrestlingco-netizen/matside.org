# Tournament Minisites — Design Spec

**Date:** 2026-09-03
**Status:** Approved for planning
**Repo(s) touched:** `matside.org` (this repo), `matsidesystems-forms`

## Goal

Give tournaments Matside is running the option of a hosted "minisite" — a lightweight event page at `matside.org/t/[slug]/` that wraps the matsidesystems-forms registration flow. Each minisite is a static folder of HTML + config + a couple of images. A one-shot client-side builder at `matside.org/build/` generates the folder contents so new tournaments can be spun up in minutes without hand-editing HTML.

## Non-goals (v1)

- Sponsors row, post-event results section, custom domains, live preview in builder, edit-in-place after publish, authenticated builder access, multi-language support, per-tournament analytics beyond the site-wide GoatCounter.
- No persistent state in the builder. Editing after publish means either re-running the builder or hand-editing `config.json` + running the rebuild script.
- No dynamic hosting on matside.org — everything stays static (GitHub Pages).

## Architecture

Two repos are touched. Two PRs.

### matside.org (this repo)

Three new published surfaces:

- **`/build/`** — client-side builder tool. Single HTML page + JS. Unlisted (no navigation link from the rest of the site). No auth — all data lives in the browser session until the user downloads the zip.
- **`/t/[slug]/`** — the pattern for each tournament minisite. Each is a folder containing `index.html`, `config.json`, and 0–2 image files (`hero.jpg`, `logo.svg` or `logo.png`).
- **`/t/`** — tournaments index page. Reads a static manifest (`/t/tournaments.json`) and lists Upcoming (date ≥ today, sorted ascending) and Past (date < today, collapsed by default) events. Empty-state copy if manifest is empty.

Two supporting pieces (not published):

- **`/t/_template/`** — the source template used by both the builder and the rebuild script. Leading underscore + `.nojekyll` handling to keep GitHub Pages from serving it.
- **`scripts/rebuild-tournaments.js`** — Node script (built-ins only, no deps). Reads `/t/_template/index.html`, walks `/t/*/config.json`, writes each folder's `index.html`. Also emits `/t/tournaments.json` (the manifest). Run manually: `node scripts/rebuild-tournaments.js`.

### matsidesystems-forms

Two small additions to make iframing work cleanly:

- **CSP header** — `Content-Security-Policy: frame-ancestors 'self' https://www.matside.org`, applied to the `/r/[slug]` public routes via `next.config.ts` `headers()`.
- **Iframe height dispatcher** — on the public `/r/[slug]` page, post `message: {type: 'matsysforms-height', px: N}` to the parent frame on mount and on ResizeObserver ticks. Parent minisite listens and resizes the iframe.
- **Optional `?embed=1` query param** — suppress redundant chrome (e.g., extra top padding around event title, since the minisite already shows it). Additive-only behavior — never changes registration logic.

### Source-of-truth rule

For each tournament, `config.json` is the source of truth. `index.html` is derived. Editing an event after publish is either:
- **a.** Re-run the builder → download → replace the folder (repeat if only a text change), or
- **b.** Hand-edit `config.json` → run `scripts/rebuild-tournaments.js` → commit.

Images are opaque assets — replaced by re-uploading through the builder.

## Components

### Builder (`/build/index.html` + `/build/build.js`)

Single-page tool. Form on the left, Generate action on the right on wide screens; stacked on mobile. No live preview panel (decided out of scope — user opens the downloaded HTML in a browser to preview).

**Form panel**
- Slug (auto-slugified as user types; validated: non-empty, ≤ 60 chars, no leading `_`)
- Event name (display, required)
- Event date (`<input type="date">`, required)
- Venue name (required)
- Venue location (e.g., "Pittsburgh, PA", required)
- Divisions (pill value, e.g., "K–12 · Girls", required)
- Weigh-in time (pill value, e.g., "7:00 AM", required)
- Wrestling start (pill value, e.g., "9:00 AM", required)
- matsidesystems-forms slug (required — could match minisite slug or differ)
- Accent color hex (validated `#rgb` or `#rrggbb`, normalized to `#rrggbb` on blur; required)
- Contact email (soft-validated `.+@.+\..+`, required)
- Hero image (file input, optional; canvas-resized to max 1600×900, re-encoded JPEG q=0.82; rejected if > 8 MB or < 800px long side)
- Event logo (file input, optional; SVG passthrough, else canvas-resized to max 512×512 PNG; rejected if > 2 MB)
- About paragraph (textarea, optional)

**Actions**
- "Generate & Download" button — disabled while required fields invalid, with a tooltip listing missing fields. On click: builds zip via JSZip → downloads `[slug].zip`. Zip contains `index.html`, `config.json`, and any uploaded images.
- (No live preview — decided out of scope. User previews by opening the generated HTML in a browser after download.)

**Client-side image handling**
- Hero image: canvas-resized to max 1600×900, JPEG q=0.82.
- Event logo: SVG sanitized (parse as XML, strip `<script>` tags and any `on*` event attributes) then passed through; PNG/JPG canvas-resized to max 512×512 PNG (preserves alpha).

### Minisite template (`/t/_template/index.html`)

Standard-weight page. Placeholders are `{{TOKEN}}` strings that the builder and rebuild script both replace.

**Sections:**
- `<header>` — `{{NAME}}`, `{{DATE_DISPLAY}}` (e.g., "Jan 18, 2026"), `{{VENUE_NAME}}`, `{{VENUE_LOCATION}}`. Hero image or accent-color gradient behind. Event logo or text mark.
- `<div class="pills">` — three pills: `{{DIVISIONS}}`, `{{WEIGHIN}}`, `{{WRESTLING}}`.
- `<section class="about">` — hidden if `{{ABOUT}}` is empty.
- `<iframe src="https://forms.matsidesystems.com/r/{{FORMS_SLUG}}?embed=1">` — with height listener JS.
- `<footer>` — `{{CONTACT_EMAIL}}`, "hosted by Matside" chrome.

**Template also owns:**
- `<style>:root { --accent: {{ACCENT_HEX}} }` — accent used for buttons, pill borders, link color.
- `<noscript>` fallback: renders header + pills + a direct link to `https://forms.matsidesystems.com/r/{{FORMS_SLUG}}`. Form doesn't render, but user can still reach registration.
- OpenGraph tags — `og:title` = `{{NAME}}`, `og:image` = `{{HERO_URL}}` (falls back to matside.org default OG image), `og:url` = canonical.
- Schema.org JSON-LD (`SportsEvent`) — built from config at rebuild time.
- Iframe height listener: `window.addEventListener('message', ...)` — accepts messages of shape `{type: 'matsysforms-height', px: number}` only from `https://forms.matsidesystems.com` (origin-checked). Sets iframe height to `px`. If no height message arrives within 5 s of iframe load, replaces the iframe with a direct-register fallback link.

### Config.json shape

```json
{
  "slug": "big-brawl-2026",
  "formsSlug": "big-brawl-2026",
  "name": "The Big Brawl 2026",
  "date": "2026-01-18",
  "venueName": "Center Ice Arena",
  "venueLocation": "Pittsburgh, PA",
  "divisions": "K–12 · Girls",
  "weighin": "7:00 AM",
  "wrestling": "9:00 AM",
  "contactEmail": "td@example.com",
  "accentHex": "#c9a967",
  "about": "…optional paragraph…",
  "hero": "hero.jpg",
  "logo": "logo.svg",
  "generatedAt": "2026-09-03T14:00:00Z",
  "templateVersion": 1
}
```

`templateVersion` lets the rebuild script warn when a config was made against an older template version and may need a manual review after regeneration.

### Rebuild script (`scripts/rebuild-tournaments.js`)

Plain Node. No dependencies beyond built-ins (`fs`, `path`).

- Reads `/t/_template/index.html`.
- Walks `/t/*/config.json`. For each: replace tokens → write `/t/[slug]/index.html`.
- Emits `/t/tournaments.json` — array of `{slug, name, date, venueLocation}` sorted by date ascending.
- Idempotent: running twice on unchanged inputs produces identical output. Prints per-tournament summary: "big-brawl-2026: unchanged" or "big-brawl-2026: regenerated (12 lines changed)".
- Fails loud (exit 1) on: malformed config, missing referenced image, unknown `templateVersion`, folder slug mismatched with `config.slug`.

### Tournaments index page (`/t/index.html`)

Static HTML. Fetches `/t/tournaments.json` on load, renders two sections:

- **Upcoming** — date ≥ today, ascending. Card per event with name, date, venue location, "Register →" link to `/t/[slug]/`.
- **Past** — date < today, collapsed by default (details/summary). Same card shape.

Empty state: "No public tournaments right now — check back soon."

## Data flow (end to end)

1. TD sends Daniel event details.
2. Daniel opens `matside.org/build/` in a browser, fills form, uploads images.
3. Hits Generate → browser downloads `[slug].zip`.
4. Daniel unzips into `matside.org/t/[slug]/` in the local repo.
5. Runs `node scripts/rebuild-tournaments.js` — regenerates the minisite's `index.html` from config and updates `tournaments.json`.
6. `git commit && git push` → GitHub Pages serves `www.matside.org/t/[slug]/` within ~1 min.
7. Registrants visit the URL: minisite shell renders; iframe loads `forms.matsidesystems.com/r/[formsSlug]?embed=1`; child page posts height messages; parent resizes iframe; user registers without leaving the URL.
8. Post-event: minisite stays up as archive. Index page automatically moves it to the Past section the day after the event date.

## Error handling

### Builder

- All input validation is inline and client-side. No submission until required fields are valid.
- Slug uniqueness cannot be checked from the browser — surfaced as a post-publish warning (see below).
- Hex contrast check: warn (non-blocking) if accent contrast against Midnight dark background is < 3:1.
- Image size/dimension violations: friendly toast, form remains open.
- Images and text data live entirely in browser memory. Closing the tab loses state.

### Rebuild script

- Malformed `config.json` → exit 1 with the file path and the specific error.
- Missing referenced image → exit 1 with `[slug]: hero.jpg not found`.
- Unknown `templateVersion` → exit 1 with instructions to re-run the builder or upgrade the config.
- Folder slug ≠ `config.slug` → exit 1 (likely a rename that wasn't finished; safer to fail than to serve wrong URL).

### Minisite runtime

- **Iframe blocked or errors** — 5 s timeout on the height listener; if no message received, replace iframe with a direct-register link ("Registration is temporarily unavailable — [Register directly →]").
- **Missing hero image** — CSS default kicks in (accent-color gradient).
- **Missing logo** — text mark using the display font.
- **JS disabled** — `<noscript>` shows header, pills, and a direct link to `forms.matsidesystems.com/r/[slug]`.

### matsidesystems-forms

- **CSP misconfigured (frame-ancestors doesn't include matside.org)** — iframe fails, minisite fallback kicks in. Ship the CSP change *before* the first minisite goes live.
- **Height postMessage not fired** — iframe stays at initial min-height of 800 px with internal scroll. Ugly but functional. Sentry logs the missing dispatch.
- **`?embed=1` behavior** — additive-only (hides chrome). Never changes registration logic. A stale embed page must never break registration.

## Testing plan

### Manual smoke (before shipping v1)

1. Generate a fake tournament in the builder → download zip.
2. Unzip into `t/test-tournament/` → run rebuild script → verify no errors, verify `tournaments.json` updated.
3. Serve locally (`python3 -m http.server`), visit `/t/test-tournament/` → verify iframe loads, resizes correctly, points to a real test event in matsidesystems-forms.
4. Verify OpenGraph tags via a share preview (opengraph.xyz or Slack DM to self).
5. Verify `/t/` index shows the test event under Upcoming.
6. Delete the test tournament, re-run rebuild, verify manifest reflects the removal.

### Automated (light)

- Node test for `scripts/rebuild-tournaments.js` — feed it a fixture config, assert output HTML matches snapshot; assert malformed configs exit non-zero.
- No E2E tests for the builder (personal-tool page; manual smoke suffices).

### Cross-browser

- Safari (iOS + macOS), Chrome, Firefox — iframes and `postMessage` have historical quirks in Safari mobile. If Safari mobile mishandles the iframe height, fall back to a fixed min-height with internal scroll.

## Rollout

- **matsidesystems-forms PR** ships first — CSP header + height dispatcher + `?embed=1` handling. Deployed to production.
- **matside.org PR** ships second — template, builder, rebuild script, tournaments index, `.gitignore` addition for `.superpowers/`.
- First real tournament used as end-to-end validation.

## Open questions (deferred)

- **Custom domains** (e.g., a TD wants `bigbrawl.com` → matside minisite). Punt — needs DNS handling per event and lives outside GitHub Pages' zero-config model.
- **Persistent builder** (Option B from brainstorm) — revisit if manual re-uploads become annoying after 3–4 tournaments.
- **Sponsors row** — v2 feature. Adds meaningful replication cost; hold until real demand shows.
- **Post-event results section** — v2. Would need results data source and a different template block.
