# matside.org/today Event-Day Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single static route at `matside.org/today` that renders event-day info from a JSON config block Daniel can edit from his phone. On off-days, the page falls back to a quiet "next Matside event" state at the same URL.

**Architecture:** A single `today/index.html` file with an inline `<script type="application/json" id="today-config">` block at the top (5+ fields Daniel edits on tournament morning) and a vanilla JS renderer at the bottom that reads the config and injects the DOM. Off-day and conditional-host-handle behavior are branches inside the renderer. No backend. No CMS. No build step. Vercel auto-deploys on push to main.

**Tech Stack:** Plain HTML, CSS (inline page-specific styles plus tokens from the existing site-wide `/style.css`), vanilla JavaScript (~40 LOC). Google Fonts (Inter, JetBrains Mono, Montserrat) via preconnect, matching every other matside.org page.

**Source spec:** `docs/superpowers/specs/2026-06-28-matside-today-design.md`.

**Verification approach:** This repo has no test harness (static HTML, no package.json). Verification happens in the browser: the plan gives exact devtools console commands to paste after each renderer task to confirm behavior. Final verification is Lighthouse mobile audit plus real-phone gym-distance smoke test.

---

## File Structure

**Create:**
- `today/index.html`: the entire route. Contains `<head>` chrome, JSON config block, minimal `<body>` shell with mount points, inline `<style>` block for page-specific layout, inline `<script>` block for the renderer, and the ported footer.

**Reference (do NOT modify):**
- `/style.css`: shared design tokens (`--ink`, `--steel`, `--text`, `--panel`, etc.). Load via `<link rel="stylesheet" href="/style.css">`.
- `legal/privacy.html` lines 150-183: the shared footer HTML to port verbatim into `today/index.html`.
- `careers/index.html`: reference example of a matside.org page that uses inline `<style>` for page-specific rules on top of `/style.css` tokens.

**No modifications to any existing file are required.** The `/today` route is a new directory alongside `/legal`, `/careers`, `/operators`, `/wt`.

---

## Task 1: Scaffold today/index.html with head chrome and mount points

**Files:**
- Create: `today/index.html`

**Purpose:** Get a valid page loading at `matside.org/today` that renders a static "loading" state. Establishes the head, fonts, stylesheet link, and the DOM mount points the renderer will target in later tasks.

- [ ] **Step 1: Create the file with head + minimal body**

Write this exact content to `today/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Today · Matside Wrestling Co.</title>
  <meta name="description" content="Live event info for today's Matside-operated wrestling tournament: brackets, host program, and what is next on the Matside schedule.">
  <meta name="robots" content="index,follow">
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <link rel="stylesheet" href="/style.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Montserrat:wght@600;700;800&display=swap" rel="stylesheet">
</head>
<body>
  <main id="today-root" class="today-wrap">
    <p class="today-loading">Loading today's event info...</p>
  </main>
</body>
</html>
```

- [ ] **Step 2: Serve locally and load the route**

Run in a terminal at the matside.org repo root:

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000/today/` in a browser. Confirm the page loads, the title bar reads "Today · Matside Wrestling Co.", and you see the "Loading today's event info..." text on a dark background (dark comes from `/style.css` body rule).

Expected: no console errors, page renders on Midnight Navy background.

- [ ] **Step 3: Commit**

```bash
git add today/index.html
git commit -m "today: scaffold /today route with head chrome and mount point"
```

---

## Task 2: Add the JSON config block with a realistic sample

**Files:**
- Modify: `today/index.html`

**Purpose:** Pin the JSON config shape the spec calls for. Editing this block on GitHub mobile web is the tournament-morning workflow. This task ships a populated sample so the renderer in Task 3 has real data to work with.

- [ ] **Step 1: Insert the JSON config block inside `<head>`**

In `today/index.html`, add this block **immediately after** the `<title>` element (so Daniel finds it fast when scrolling the file on mobile):

```html
  <script type="application/json" id="today-config">
  {
    "active": true,
    "event_name": "Shaler Area Titan Duals",
    "event_date": "Saturday, December 5, 2026",
    "venue": "Shaler Area High School",
    "bracket_url": "https://arena.flowrestling.org/event/example",
    "bracket_source_name": "FloArena",
    "host_program_handle": "@shalerwrestling",
    "upcoming_events": [
      {
        "name": "Pine-Richland Girls Ram Slam",
        "date": "Friday, December 19, 2026",
        "venue": "Pine-Richland HS",
        "register_url": "https://example.com/register-ram-slam"
      },
      {
        "name": "ACC JH Tournament",
        "date": "Friday, January 8, 2027",
        "venue": "Shaler Area HS",
        "register_url": "https://example.com/register-acc-jh"
      }
    ]
  }
  </script>
```

- [ ] **Step 2: Verify the JSON is parseable in browser devtools**

Reload `http://localhost:8000/today/` and open the browser devtools console. Paste and run:

```js
JSON.parse(document.getElementById('today-config').textContent)
```

Expected output: the config object printed as-is, no `SyntaxError`. If you see a syntax error, the JSON has a typo (usually a trailing comma or missing quote).

- [ ] **Step 3: Commit**

```bash
git add today/index.html
git commit -m "today: add JSON config block with sample event"
```

---

## Task 3: Write the renderer for the event-day state

**Files:**
- Modify: `today/index.html`

**Purpose:** Turn the JSON config into visible DOM for the active-event case. This is the primary state the QR poster targets on tournament days.

- [ ] **Step 1: Add the renderer script at the bottom of `<body>`**

In `today/index.html`, add this block **immediately before** the closing `</body>` tag:

```html
  <script>
    (function () {
      var configEl = document.getElementById('today-config');
      var root = document.getElementById('today-root');
      if (!configEl || !root) return;

      var config;
      try {
        config = JSON.parse(configEl.textContent);
      } catch (err) {
        console.error('today-config JSON parse failed:', err);
        return;
      }

      function escapeHtml(str) {
        if (str == null) return '';
        return String(str)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
      }

      function renderEventDay(cfg) {
        var hostRow = '';
        if (cfg.host_program_handle && cfg.host_program_handle.length > 0) {
          hostRow = '<p class="today-host">HOSTED BY ' + escapeHtml(cfg.host_program_handle) + '</p>';
        }

        var upcomingHtml = '';
        if (Array.isArray(cfg.upcoming_events) && cfg.upcoming_events.length > 0) {
          upcomingHtml = '<hr class="today-rule">' +
            '<p class="today-eyebrow">What is next</p>' +
            cfg.upcoming_events.slice(0, 3).map(function (ev) {
              var reg = ev.register_url
                ? '<a class="today-upcoming-link" href="' + escapeHtml(ev.register_url) + '" target="_blank" rel="noopener">Register &rarr;</a>'
                : '';
              return '<div class="today-upcoming-row">' +
                '<p class="today-upcoming-name">' + escapeHtml(ev.name) + '</p>' +
                '<p class="today-upcoming-meta">' + escapeHtml(ev.date) + ' &middot; ' + escapeHtml(ev.venue) + '</p>' +
                reg +
                '</div>';
            }).join('');
        }

        var bracketBtn = cfg.bracket_url
          ? '<a class="today-cta" href="' + escapeHtml(cfg.bracket_url) + '" target="_blank" rel="noopener">View today\'s brackets on ' + escapeHtml(cfg.bracket_source_name || 'the host site') + ' &rarr;</a>'
          : '<p class="today-cta-pending">Bracket source posted shortly. Follow @matsidewrestlingco for the link.</p>';

        return '<p class="today-eyebrow">Live today</p>' +
          '<h1 class="today-headline">' + escapeHtml(cfg.event_name) + '</h1>' +
          '<p class="today-meta">' + escapeHtml(cfg.event_date) + ' &middot; ' + escapeHtml(cfg.venue) + '</p>' +
          hostRow +
          bracketBtn +
          '<hr class="today-rule">' +
          '<a class="today-follow" href="https://www.instagram.com/matsidewrestlingco/" target="_blank" rel="noopener">' +
            '<span class="today-follow-handle">@matsidewrestlingco</span>' +
            '<span class="today-follow-label">Follow for photos + recap</span>' +
          '</a>' +
          upcomingHtml;
      }

      function render(cfg) {
        if (cfg.active) {
          root.innerHTML = renderEventDay(cfg);
          return;
        }
        // Off-day branch added in Task 4.
        root.innerHTML = '<p class="today-loading">No Matside event today.</p>';
      }

      render(config);
    })();
  </script>
```

- [ ] **Step 2: Verify the event-day state renders**

Reload `http://localhost:8000/today/`. Confirm you see, in order top-to-bottom:

1. Mono uppercase eyebrow "LIVE TODAY" (unstyled: browser default until Task 6)
2. Event headline "Shaler Area Titan Duals"
3. Meta line "Saturday, December 5, 2026 · Shaler Area High School"
4. Host row "HOSTED BY @shalerwrestling"
5. Bracket CTA link "View today's brackets on FloArena →"
6. Divider
7. IG follow link "@matsidewrestlingco" and "Follow for photos + recap"
8. "What is next" section with 2 upcoming events

Content will look unstyled at this point (browser defaults). Layout/typography lands in Task 6. This task validates the JS render logic, not the visual.

- [ ] **Step 3: Verify HTML escaping in the console**

In devtools console, paste:

```js
var out = document.getElementById('today-root').innerHTML;
out.includes('&amp;') || out.includes('&lt;') ? 'may need review' : 'no escape chars needed for current sample'
```

The sample config has no ampersands or angle brackets, so this is a sanity check. If you later have an event name like `Boys & Girls Regionals`, the `&` should render as `&amp;` in the DOM. That is intentional: it prevents XSS through the JSON config.

- [ ] **Step 4: Commit**

```bash
git add today/index.html
git commit -m "today: renderer for event-day state with conditional host handle"
```

---

## Task 4: Add the off-day fallback branch

**Files:**
- Modify: `today/index.html`

**Purpose:** When `active` is `false`, missing, or the config fails to parse, render a quiet "Next Matside Event" panel using the first entry from `upcoming_events`. Keeps `/today` useful 6 days a week.

- [ ] **Step 1: Replace the off-day placeholder with the fallback renderer**

In `today/index.html`, find this block inside the `<script>` you added in Task 3:

```js
        // Off-day branch added in Task 4.
        root.innerHTML = '<p class="today-loading">No Matside event today.</p>';
```

Replace it with:

```js
        // Off-day: render the "Next Matside Event" fallback in place.
        root.innerHTML = renderOffDay(cfg);
```

Then add the `renderOffDay` function immediately below the `renderEventDay` function definition:

```js
      function renderOffDay(cfg) {
        var next = Array.isArray(cfg.upcoming_events) && cfg.upcoming_events.length > 0
          ? cfg.upcoming_events[0]
          : null;

        var nextBlock = '';
        if (next) {
          var reg = next.register_url
            ? '<a class="today-cta" href="' + escapeHtml(next.register_url) + '" target="_blank" rel="noopener">Register &rarr;</a>'
            : '';
          nextBlock = '<h1 class="today-headline">' + escapeHtml(next.name) + '</h1>' +
            '<p class="today-meta">' + escapeHtml(next.date) + ' &middot; ' + escapeHtml(next.venue) + '</p>' +
            reg;
        } else {
          nextBlock = '<p class="today-meta">Full schedule at <a href="/">matside.org</a>.</p>';
        }

        return '<p class="today-eyebrow">Next Matside event</p>' +
          nextBlock +
          '<hr class="today-rule">' +
          '<a class="today-follow" href="https://www.instagram.com/matsidewrestlingco/" target="_blank" rel="noopener">' +
            '<span class="today-follow-handle">@matsidewrestlingco</span>' +
            '<span class="today-follow-label">Follow for photos + recap</span>' +
          '</a>';
      }
```

- [ ] **Step 2: Verify the off-day state via console toggle**

Reload the page. In devtools console, paste:

```js
document.getElementById('today-root').innerHTML = '';
var cfg = JSON.parse(document.getElementById('today-config').textContent);
cfg.active = false;
(function () {
  var root = document.getElementById('today-root');
  // Reuse the file's render(cfg) by re-injecting a manual call.
  // Simulate: set config to inactive, re-run render logic.
  // For a quick manual check, look at whether the eyebrow now says "Next Matside event".
  var script = document.querySelector('script:not([type])');
  console.log('Toggling active=false; reload to see the default event-day state again.');
})();
```

Then in `today/index.html`, temporarily change the JSON block's `"active": true` to `"active": false` and reload. Confirm:

1. Eyebrow reads "Next Matside event" instead of "Live today"
2. Headline shows "Pine-Richland Girls Ram Slam" (first entry from upcoming_events)
3. Meta shows "Friday, December 19, 2026 · Pine-Richland HS"
4. Register CTA is present
5. Host row is absent
6. Bracket CTA is absent
7. IG follow row still present
8. "What is next" section is absent

- [ ] **Step 3: Restore the active event and verify again**

Change the JSON block's `"active": false` back to `"active": true`. Reload. Confirm the event-day state renders per Task 3.

- [ ] **Step 4: Verify malformed-config safety**

In devtools console, paste:

```js
var el = document.getElementById('today-config');
var original = el.textContent;
el.textContent = '{ this is not valid json';
location.reload();
```

The reload runs the renderer against invalid JSON. Confirm:
- Page shows the initial "Loading today's event info..." (renderer bails via the try/catch)
- Console shows the parse error message

Restore the file's original JSON (undo any manual edits) before continuing. In devtools console:

```js
console.log('Reminder: revert any test edits to today/index.html before committing.');
```

Then run `git diff today/index.html` in a terminal to confirm no accidental changes remain.

- [ ] **Step 5: Commit**

```bash
git add today/index.html
git commit -m "today: off-day fallback state with next-event surfacing"
```

---

## Task 5: Add page-specific styles matching the visual hierarchy

**Files:**
- Modify: `today/index.html`

**Purpose:** Turn the browser-default markup from Tasks 3 and 4 into the Midnight-branded layout the spec specifies. Uses `/style.css` tokens (`--steel`, `--text`, etc.) via CSS custom properties.

- [ ] **Step 1: Add the `<style>` block inside `<head>`**

In `today/index.html`, add this block **immediately before** the closing `</head>` tag:

```html
  <style>
    /* Page-specific styles for /today. Uses tokens from /style.css. */
    .today-wrap {
      max-width: 640px;
      margin: 0 auto;
      padding: 48px 22px 96px;
      color: var(--text);
    }
    .today-loading {
      font-family: var(--mono);
      font-size: 12px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--muted);
      text-align: center;
      padding: 48px 0;
    }
    .today-eyebrow {
      font-family: var(--mono);
      font-size: 11px;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: var(--steel);
      margin: 0 0 14px;
      font-weight: 600;
    }
    .today-headline {
      font-family: var(--display);
      font-weight: 800;
      font-size: clamp(30px, 6vw, 56px);
      line-height: 1.08;
      letter-spacing: -0.01em;
      color: #fff;
      margin: 0 0 10px;
    }
    .today-meta {
      font-family: var(--sans);
      font-size: 15px;
      color: var(--text);
      opacity: 0.85;
      margin: 0 0 8px;
    }
    .today-host {
      font-family: var(--mono);
      font-size: 11px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--steel);
      opacity: 0.85;
      margin: 4px 0 24px;
      font-weight: 600;
    }
    .today-cta {
      display: block;
      background: var(--steel);
      color: #fff;
      text-align: center;
      padding: 16px 18px;
      border-radius: 3px;
      font-family: var(--display);
      font-weight: 700;
      font-size: 13px;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      text-decoration: none;
      transition: background 120ms ease;
    }
    .today-cta:hover { background: var(--steel-deep); }
    .today-cta:focus-visible { outline: 2px solid var(--steel-br); outline-offset: 3px; }
    .today-cta-pending {
      font-family: var(--sans);
      font-size: 14px;
      color: var(--muted);
      padding: 14px 0;
      margin: 0;
    }
    .today-rule {
      border: 0;
      border-top: 1px solid var(--rule);
      margin: 28px 0;
    }
    .today-follow {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      text-decoration: none;
      color: var(--text);
      padding: 6px 0;
    }
    .today-follow-handle { font-family: var(--display); font-weight: 700; font-size: 15px; color: #fff; }
    .today-follow-label { font-family: var(--sans); font-size: 12px; color: var(--muted); }
    .today-follow:hover .today-follow-handle { color: var(--steel-br); }
    .today-upcoming-row {
      padding: 14px 0;
      border-top: 1px solid var(--rule-soft);
    }
    .today-upcoming-row:first-of-type { border-top: 0; padding-top: 4px; }
    .today-upcoming-name {
      font-family: var(--sans);
      font-weight: 600;
      font-size: 15px;
      color: var(--text);
      margin: 0 0 4px;
    }
    .today-upcoming-meta {
      font-family: var(--sans);
      font-size: 13px;
      color: var(--muted);
      margin: 0 0 8px;
    }
    .today-upcoming-link {
      font-family: var(--mono);
      font-size: 11px;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--steel-br);
      text-decoration: none;
      border-bottom: 1px dashed rgba(125, 211, 240, 0.4);
      padding-bottom: 1px;
    }
    .today-upcoming-link:hover { color: #fff; }

    @media (max-width: 380px) {
      .today-wrap { padding: 36px 18px 72px; }
      .today-headline { font-size: clamp(26px, 8vw, 40px); }
    }
  </style>
```

- [ ] **Step 2: Reload and verify visual hierarchy**

Reload `http://localhost:8000/today/`. Confirm the page now matches the Q3 mockup from the brainstorming session:

1. Mono uppercase Steel Blue eyebrow reading "LIVE TODAY"
2. Large Montserrat display headline for the event name
3. Meta line with date and venue at 85% opacity
4. Mono "HOSTED BY @SHALERWRESTLING" line in Steel Blue
5. Full-width Steel Blue button "VIEW TODAY'S BRACKETS ON FLOARENA →"
6. Thin dark divider
7. Follow row with white "@matsidewrestlingco" on the left and muted "Follow for photos + recap" on the right
8. Another divider
9. Mono "WHAT IS NEXT" section header
10. Two upcoming rows with name, meta, and "REGISTER →" mono link

Layout should feel tight, dark, mobile-native. If any element is unstyled or has default browser blue text, the CSS class name on that element is out of sync with the style block. Grep the file for the mismatched class.

- [ ] **Step 3: Commit**

```bash
git add today/index.html
git commit -m "today: page-specific styles matching Midnight design system"
```

---

## Task 6: Port the shared site footer + add noscript fallback

**Files:**
- Modify: `today/index.html`
- Reference: `legal/privacy.html` lines 150-183 (footer HTML to port)

**Purpose:** Give `/today` the same footer chrome as every other matside.org page so it feels part of the site (Privacy / COPPA / Terms / Support links, credential mention). Add a `<noscript>` block so the page shows something honest when JavaScript is disabled.

- [ ] **Step 1: Copy the footer HTML from legal/privacy.html into today/index.html**

Open `legal/privacy.html`. Locate the `<footer class="footer">` block that runs from approximately line 150 to line 183. Copy that block verbatim.

In `today/index.html`, paste the footer **immediately after** the closing `</main>` tag (so it comes after the mount point but before the `<script>` renderer block).

Verify no changes were made to the footer HTML itself. The site-wide footer styles come from `/style.css`, so no additional CSS is needed here.

- [ ] **Step 2: Add the noscript fallback inside `<main>`**

In `today/index.html`, find the `<main id="today-root">` block:

```html
  <main id="today-root" class="today-wrap">
    <p class="today-loading">Loading today's event info...</p>
  </main>
```

Add a `<noscript>` block immediately inside `<main>`, before the loading paragraph:

```html
  <main id="today-root" class="today-wrap">
    <noscript>
      <p class="today-eyebrow">Live today</p>
      <p class="today-meta">This page needs JavaScript to show today's live event. For upcoming Matside events, visit <a href="/">matside.org</a>.</p>
    </noscript>
    <p class="today-loading">Loading today's event info...</p>
  </main>
```

- [ ] **Step 3: Verify footer renders and noscript works**

Reload the page. Confirm:

1. The footer appears below the content with the Matside brand block, legal links (Privacy / COPPA / Terms / Support), and any social icons that live in the shared footer.
2. Footer styling (dark background, small mono type) matches other matside.org pages.

Verify noscript by opening devtools > three-dot menu > Settings > Preferences > Debugger > "Disable JavaScript" (Chrome path: devtools > three-dot menu > Settings > Preferences > uncheck "Enable JavaScript"). Reload. Confirm the noscript fallback text is visible instead of the rendered event content, and the page does NOT throw errors.

Re-enable JavaScript before proceeding.

- [ ] **Step 4: Commit**

```bash
git add today/index.html
git commit -m "today: port shared footer chrome and add noscript fallback"
```

---

## Task 7: Mobile responsive smoke check across three widths

**Files:**
- Modify: `today/index.html` (only if layout breaks at a specific width)

**Purpose:** Verify the page reads cleanly at the phone widths a real head-table QR scanner will hit. Fix any specific overflow or type-scale issue found.

- [ ] **Step 1: Open in Chrome devtools device toolbar**

Reload `http://localhost:8000/today/`. Open devtools, click the device toolbar icon (Ctrl/Cmd + Shift + M). Set the device to "Responsive" so you can drag widths.

- [ ] **Step 2: Verify at iPhone SE width (375px)**

Set width to 375px. Confirm:
- No horizontal scrollbar
- Headline wraps cleanly (does not overflow container)
- Bracket CTA button spans the container width comfortably
- Follow row (handle + label) fits on one line
- Upcoming rows read cleanly

- [ ] **Step 3: Verify at iPhone 14 width (390px)**

Set width to 390px. Same checklist. Confirm the design feels balanced (not overly tight or overly loose).

- [ ] **Step 4: Verify at iPhone Pro Max width (430px)**

Set width to 430px. Same checklist. Confirm the max-width cap of 640px on `.today-wrap` prevents the layout from becoming line-length awkward.

- [ ] **Step 5: Fix any issue found**

If a specific width shows overflow or a typography glitch, add or adjust a media query in the `<style>` block. Common fix patterns:

For headline overflow on very narrow screens:
```css
@media (max-width: 360px) {
  .today-headline { font-size: clamp(24px, 7vw, 36px); }
}
```

For follow row wrapping on narrow screens:
```css
@media (max-width: 360px) {
  .today-follow { flex-wrap: wrap; }
  .today-follow-label { flex-basis: 100%; margin-top: 4px; }
}
```

Only add these if the width test actually shows the problem. YAGNI.

- [ ] **Step 6: Commit (only if changes were needed)**

If Step 5 required changes:

```bash
git add today/index.html
git commit -m "today: responsive fixes for narrow phone widths"
```

If no changes were needed, skip the commit and note in the task that the initial styles held up.

---

## Task 8: Lighthouse mobile audit

**Files:**
- Modify: `today/index.html` (only if audit surfaces fixable issues)

**Purpose:** Verify the acceptance-criteria threshold of Lighthouse mobile ≥90 across Performance / Accessibility / Best Practices / SEO. Homepage-standard.

- [ ] **Step 1: Run the Lighthouse audit**

In Chrome devtools with the page loaded at `http://localhost:8000/today/`, click the Lighthouse tab. Select:
- Mode: Navigation
- Device: Mobile
- Categories: Performance, Accessibility, Best Practices, SEO (all four checked)

Click "Analyze page load". Wait for the report.

- [ ] **Step 2: Record the four scores**

Note each score. Target: all four ≥90.

- [ ] **Step 3: Fix any category below 90**

Common issues and one-line fixes:

- **Accessibility low**: check that all links have discernible text (Lighthouse flags empty `<a>` tags). If the `.today-follow` link is flagged for missing text on the wrapping `<a>`, verify the child spans have text; if flagged for insufficient color contrast, bump `--muted` text opacity from 0.85 to 0.95 for `.today-meta`.
- **SEO low**: usually missing `<meta name="description">` (already present in Task 1) or a heading-order issue. The renderer uses one `<h1>` and no other headings, which is correct.
- **Best Practices low**: usually mixed content (http vs https) or missing `rel="noopener"` on external links. All external links in the renderer already carry `rel="noopener"`; verify by running `grep 'target="_blank"' today/index.html | grep -v noopener` and confirm empty output.
- **Performance low**: usually font-loading. The `display=swap` parameter is already on the Google Fonts URL, which is the fix.

- [ ] **Step 4: Re-run Lighthouse and verify all four ≥90**

- [ ] **Step 5: Commit (only if fixes were needed)**

```bash
git add today/index.html
git commit -m "today: Lighthouse mobile audit fixes"
```

---

## Task 9: Populate real upcoming events and push for Vercel deploy

**Files:**
- Modify: `today/index.html` (JSON config block only)
- Reference: `../matside-hq/matside-hq/operations/tournament-schedule.md` (for the real upcoming event list)

**Purpose:** Replace the sample event in the JSON config with the real current tournament (or off-day state if no event is scheduled today) and confirm Vercel deploys the page to production.

- [ ] **Step 1: Read the real tournament schedule**

Open `../matside-hq/matside-hq/operations/tournament-schedule.md` (matside-hq repo, not matside.org). Identify:
- Today's scheduled Matside-operated event (if any)
- The next 2 to 3 upcoming Matside-operated events with dates, venues, and registration URLs

- [ ] **Step 2: Update the JSON config**

Edit the `<script type="application/json" id="today-config">` block in `today/index.html` with real values:

- If there is a Matside event today: `active: true`, populated `event_name`, `event_date`, `venue`, `bracket_url` (or empty string if not yet posted), `bracket_source_name`, `host_program_handle` (or empty string if the host has no IG or you do not want the row), and `upcoming_events` with the next 2 to 3 entries.
- If there is no Matside event today: `active: false`, the current event fields can carry a placeholder or the most recent finished event, and `upcoming_events` should have the next 2 to 3 real entries. The off-day renderer only uses `upcoming_events[0]` plus the follow link.

- [ ] **Step 3: Local final check**

Reload `http://localhost:8000/today/`. Confirm the page shows the real event or the real "Next Matside Event" state. All URLs should be real (click through and verify they load).

- [ ] **Step 4: Push to main and verify Vercel deploy**

```bash
git add today/index.html
git commit -m "today: populate real event data for /today launch"
git push
```

Watch the Vercel dashboard for matside.org. Confirm:
- Deploy triggers on push
- Deploy status turns "Ready" (typically 20 to 60 seconds)
- Visit `https://www.matside.org/today` in a private browser window and confirm the page renders exactly as it did locally

- [ ] **Step 5: Verify the acceptance criterion for edit-to-deploy latency**

From a phone, open GitHub mobile web, navigate to `today/index.html` in the matside.org repo, edit one visible string (e.g., temporarily change the eyebrow copy in the JSON by editing `event_name` to append " (test)"), commit directly to main. Time from tap-commit to page-updated on `www.matside.org/today`. Target: under 60 seconds end-to-end.

Revert the test edit with a second phone commit before continuing.

---

## Task 10: Real-phone gym-distance smoke test

**Files:**
- None (verification only)

**Purpose:** The QR poster is meant to be scanned from head-table distance (approximately 4 to 6 feet in a gym). Verify the page loads legibly on a real phone under realistic conditions before the QR poster print order goes out (Q2 resolution: page ships first, poster follows by approximately 1 week).

- [ ] **Step 1: Load on a real phone via cellular (not Wi-Fi)**

Open the phone's browser (data connection, not home Wi-Fi) and navigate to `https://www.matside.org/today`. Time the load. Target: under 1 second on 4G / 5G.

- [ ] **Step 2: Verify legibility at approximately 4 to 6 feet**

Hold the phone at arm's length. Confirm:
- The eyebrow "LIVE TODAY" or "NEXT MATSIDE EVENT" is readable
- The event headline is easily readable from this distance
- The bracket CTA button is unmistakable as tappable

If the eyebrow or meta line is unreadable at this distance, bump their sizes in the style block:

```css
.today-eyebrow { font-size: 12px; letter-spacing: 0.22em; }
.today-meta { font-size: 16px; }
```

- [ ] **Step 3: Tap the bracket CTA**

Confirm the CTA opens the bracket source URL in a new tab (`target="_blank"`) and the source page is the correct event.

- [ ] **Step 4: Tap the follow link**

Confirm it opens Instagram, either in the app (if installed) or in a browser tab, and lands on `@matsidewrestlingco`.

- [ ] **Step 5: Commit any style adjustments made in Step 2**

```bash
git add today/index.html
git commit -m "today: phone-distance legibility adjustments"
git push
```

- [ ] **Step 6: Green-light the QR poster print order**

Once all 5 steps above pass, the page has cleared the "page first, then poster" gate from Q2. Notify Marketing (matside-hq marketing/content-calendar.md) that the QR poster print order can proceed. The poster URL is `https://www.matside.org/today` (stable, one URL forever).

---

## Verification checklist (acceptance criteria from spec)

Cross-check the final page against the spec's acceptance criteria. All should be checked:

- [ ] Route `/today` resolves and serves the page.
- [ ] When `active: true`, the page renders event name, date, venue, and a working bracket-source button.
- [ ] When `active: false`, the page renders the quiet fallback with the next upcoming event surfaced.
- [ ] The `@matsidewrestlingco` follow CTA is present in both states.
- [ ] Mobile-first responsive layout works at iPhone SE through iPhone Pro Max widths.
- [ ] Lighthouse mobile ≥90 across Performance / Accessibility / Best Practices / SEO.
- [ ] Page loads and renders in under 1 second on a 4G connection.
- [ ] Editing the JSON config and pushing to main results in a redeployed page in under 60 seconds end-to-end.
- [ ] The fallback layout (JS disabled) shows the static "no event today" copy without erroring.
- [ ] Headings, body text, and accent colors match the matside.org Midnight design system (no product accents; Steel Blue is the only accent).
- [ ] Host attribution row renders only when `host_program_handle` is a non-empty string.
