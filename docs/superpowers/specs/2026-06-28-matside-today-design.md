# matside.org/today — Event-Day Landing Page

**Date:** 2026-06-28
**Status:** Ready to plan (all open questions resolved 2026-07-01)
**Scope:** Single new route on `matsidewrestlingco-netizen/matside.org`; plain HTML/CSS + a small JSON config block; ~2–3 hours engineering
**Audience:** Wrestlers / parents / coaches / officials at the head table of a Matside-operated tournament, plus anyone who scans the head-table QR poster
**Stack:** Plain HTML + CSS, no JS framework. Same posture as the rest of matside.org (static, Vercel-deployed on push to main)

---

## Why now

Marketing is shipping a head-table QR poster for the fall slate (20+ tournaments). The original v1 poster headline promised "today's brackets live on Instagram," which is false — brackets actually live on FloArena / USA Bracketing / Trackwrestling, not on Matside's IG.

To make the QR honest *and* convert event-day audiences into followers, the QR target needs to be a Matside-owned landing page that does two things:

1. **Points wrestlers + parents to today's actual bracket source** (FloArena or USA Bracketing event URL — Matside is the messenger, not the host).
2. **Surfaces the Matside follow + upcoming-events surfaces** so the scan converts to a follow.

Today there is no such page. The QR can't ship to a generic `matside.org` homepage (cluttered, doesn't answer "what's today?") or straight to the IG profile (burns trust the moment a parent expects brackets and finds a feed). A dedicated `matside.org/today` solves both jobs.

## What success looks like

A parent who scans the head-table QR at a Matside-operated event should be able to answer, within 5 seconds:

- Where do I see today's brackets? (One large CTA button → today's FloArena / USA Bracketing event URL)
- What event am I at? (Event name + date displayed prominently)
- Where do I follow for photos + recap? (`@matsidewrestlingco` link, clear)
- When's the next Matside event? (2–3 upcoming events with dates + registration links)

Daniel should be able to update the page **from his phone in under 60 seconds** on tournament morning before heading to the venue.

## Non-goals (v1)

- **No backend, no Supabase, no auth.** This is a static page with a JSON config block; updates happen via a GitHub mobile-web edit + commit + push. Vercel auto-deploys in ~30s. No new infra.
- **No CMS / admin form.** Could come in v2 once we know whether the markdown-edit workflow holds up across 20+ tournaments. Don't pre-build.
- **No bracket-hosting.** Matside is the messenger. Bracket data stays at FloArena / USA Bracketing / Trackwrestling.
- **No live results / real-time updates.** Bracket source handles that. The page only updates when Daniel pushes a new config.
- **No event-day photo gallery on the page itself.** Photos live on `@matsidewrestlingco`. The page points there.

## Architecture

### Route

`matside.org/today` — served from `today/index.html` (matching the existing static-route pattern, e.g. `matside.org/legal/privacy` from `legal/privacy/index.html`).

### Data shape

A single `<script type="application/json" id="today-config">` block at the top of `today/index.html`, easy to find and edit on a phone:

```json
{
  "active": true,
  "event_name": "Shaler Area Titan Duals",
  "event_date": "Saturday, December 5, 2026",
  "venue": "Shaler Area High School",
  "bracket_url": "https://arena.flowrestling.org/event/...",
  "bracket_source_name": "FloArena",
  "host_program_handle": "@shalerwrestling",
  "upcoming_events": [
    {
      "name": "Pine-Richland Girls Ram Slam",
      "date": "Friday, December 19, 2026",
      "venue": "Pine-Richland HS",
      "register_url": "https://..."
    },
    {
      "name": "ACC JH Tournament",
      "date": "Friday, January 8, 2027",
      "venue": "Shaler Area HS",
      "register_url": "https://..."
    }
  ]
}
```

Vanilla JS at the bottom of the page reads the block via `document.getElementById('today-config').textContent`, `JSON.parse`s it, and renders into the DOM. Page works with JS disabled by falling back to the "no event today" state (acceptable; this is for in-the-room wrestling parents on smartphones).

### Off-day behavior

**Resolved 2026-07-01:** render the fallback in place; no redirect. `matside.org/today` stays the single URL for every QR poster forever. The page adapts based on the `active` state so posters print once for the season and always resolve cleanly.

When `"active": false` (or the config is missing/stale), render a quiet fallback:

> **NO MATSIDE EVENT TODAY.**
> Next event: [first entry from `upcoming_events`].
> Full schedule at matside.org/events.

This handles the 6 days a week between Saturdays so the page doesn't lie when nobody's at an event.

## Page layout

Matches matside.org Midnight redesign aesthetic. Steel Blue `#3B82C4` parent accent only — no product accents on this surface.

### Visual hierarchy (top to bottom)

1. **Eyebrow** — JetBrains Mono UPPERCASE, Steel Blue, letter-spaced: `LIVE TODAY`
2. **Event headline** — Montserrat 800, Off-White, large (~clamp 36px–64px): event name
3. **Event meta** — Inter 500, Off-White 0.85 opacity: date + venue, one line
3a. **Host attribution (conditional).** JetBrains Mono UPPERCASE, Steel Blue at 0.85 opacity, letter-spaced: `HOSTED BY [HOST_PROGRAM_HANDLE]`. **Renders only when `host_program_handle` is a non-empty string in the JSON config** (resolved 2026-07-01). Empty string, missing key, or null: the renderer skips DOM injection for this row entirely so the page carries no dead vertical space for events without a host IG.
4. **Primary CTA** — full-width Steel Blue button, Montserrat 700, white text: `VIEW TODAY'S BRACKETS ON [BRACKET_SOURCE_NAME] →` (button links to `bracket_url`, opens in new tab)
5. **Mono rule** — thin Steel Blue divider
6. **Secondary CTA — IG follow** — flat row: avatar + handle text `@matsidewrestlingco` + a small button `FOLLOW FOR PHOTOS + RECAP` linking to `https://www.instagram.com/matsidewrestlingco/`
7. **Mono rule**
8. **Upcoming events** — section header mono uppercase `WHAT'S NEXT`; 2–3 event cards (event name + date + venue + small `REGISTER →` link to `register_url`)
9. **Footer** — standard matside.org footer (Privacy / COPPA / Terms / Support links + Pittsburgh tagline rotation if it's been ported to matside.org by then; otherwise the existing matside.org footer pattern)

### Off-day layout

Same chrome, but eyebrow reads `NEXT MATSIDE EVENT` instead of `LIVE TODAY`, the primary CTA becomes the first upcoming event's `REGISTER →` button, and the host-program handle / bracket CTA are suppressed.

## Update workflow

1. Daniel opens GitHub mobile web → `matside.org` repo → `today/index.html`.
2. Edits the JSON block in the `<script id="today-config">` (5 fields: event_name, event_date, venue, bracket_url, bracket_source_name; plus updates the upcoming_events array as events roll off).
3. Commits "today: [Event Name]" directly to main.
4. Vercel auto-deploys in ~30 seconds.
5. Page reflects the new event before Daniel leaves the house.

**Edge cases handled by the JSON shape:**
- Event cancelled → set `"active": false`.
- Bracket source unknown at start of event → leave `bracket_url` empty; page renders "Bracket source posted shortly. Follow @matsidewrestlingco for the link."
- Multiple concurrent events same day → out of scope for v1; in the rare case it happens, Daniel picks the larger event for the page (other event still gets IG coverage).

## Acceptance criteria

- [ ] Route `matside.org/today` resolves and serves the page.
- [ ] When `"active": true`, the page renders event name + date + venue + a working bracket-source button.
- [ ] When `"active": false`, the page renders the quiet fallback with the next upcoming event surfaced.
- [ ] The `@matsidewrestlingco` follow CTA is present in both states.
- [ ] Mobile-first responsive layout works at iPhone SE through iPhone Pro Max widths.
- [ ] Lighthouse mobile score ≥ 90 across Performance / Accessibility / Best Practices / SEO (matches the matside.org homepage standard).
- [ ] Page loads + renders the JSON-driven content in under 1 second on a 4G connection.
- [ ] Editing the JSON config and pushing to main results in a redeployed page in under 60 seconds end-to-end.
- [ ] The fallback layout (JS disabled) shows the static "no event today" copy without erroring.
- [ ] All headings, body text, and accent colors match the matside.org Midnight design system (no product accents bleed in; Steel Blue is the only accent).

## Out of scope (v1) — explicit

- Backend / CMS / admin form
- Real-time bracket data / live results
- Photo gallery on the page itself
- Push notifications / SMS alerts
- Multi-event same-day handling
- Custom event-day theming per partner program
- Analytics dashboard (basic Vercel analytics if available is fine; no custom build)

## Dependencies

- **None blocking.** The page is fully owned by this repo and ships independent of MatPass / MatRecruit / MatTime / WrestleFA / SignupSignin work.
- Marketing's head-table QR poster (drafted 2026-06-28, see `matside-hq/marketing/content-calendar.md` for the spec) needs the page URL once it ships. Coordinate the print order to follow the page launch by 1 week so the QR doesn't ship to a 404.

## Estimated lift

- **Engineering:** ~2–3 hours single-session (HTML + CSS + ~20 lines of vanilla JS for the config-read + DOM render).
- **Content for v1 launch state:** Daniel fills the first JSON config (current upcoming events from `operations/tournament-schedule.md`) — ~10 minutes.
- **QA on mobile:** 15 minutes across 3 device widths.

**Total:** half a day, end-to-end.

## Resolved decisions (closed 2026-07-01)

1. ✅ **Off-day behavior: render the fallback in place; no redirect.** `matside.org/today` is the single URL for every QR poster forever. Details in "Off-day behavior" section above.
2. ✅ **QR poster timing: page ships first, poster print order follows by approximately 1 week.** Verification on a real phone at head-table viewing distance (approximately 4 to 6 feet on gym Wi-Fi) happens before the print order goes out. Zero risk of a printed poster resolving to a 404 or a broken page. First fall event Shaler Titan Duals Dec 5 gives ample runway.
3. ✅ **Host-program handle: include the field in the JSON config with a conditional renderer.** The `HOSTED BY [handle]` mono line only injects into the DOM when `host_program_handle` is a non-empty string. Empty string, missing key, or null suppresses the row entirely so the page never carries dead chrome for events without a host IG.

**Status:** Ready to plan. No further design questions outstanding.
