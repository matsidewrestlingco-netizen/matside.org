# Editing the tournament schedule

The schedule tables on the homepage are **generated** from `data/schedule.json`.
Never edit the tables in `index.html` by hand — your changes will be overwritten.

## How to add / change / remove an event

1. Edit `data/schedule.json` (in the GitHub web UI is fine).
2. Commit to `main`. A GitHub Action validates the file, regenerates the
   tables in `index.html`, and commits the result automatically (~1 minute).
3. If your edit has a problem (bad date, typo'd field name), the Action
   **fails instead of publishing** — check the Actions tab for the error message.

## Event format

```json
{
  "date": "2026-11-22",
  "name": "Back Points for Bella",
  "location": "Baldwin-Whitehall HS",
  "bracketUrl": "https://go.flo.zone/XXXX",
  "registerUrl": "https://www.matside.org/t/2026-back-points-for-bella/"
}
```

- `date` — `YYYY-MM-DD`, or `"TBD"` if unscheduled
- `name` — event name (plain text; `&` and `'` are fine, no HTML needed)
- `location` — venue (plain text)
- `bracketUrl` — optional; if present the Bracket column shows "View →", otherwise "TBA"
- `registerUrl` — optional; if present the Register column shows "Register"

Events appear in the order they're listed. Seasons appear in the order
they're listed (newest first).

## Running locally

```sh
node scripts/rebuild-schedule.mjs          # regenerate index.html
node scripts/rebuild-schedule.mjs --check  # verify without writing
node --test scripts/rebuild-schedule.test.mjs
```
