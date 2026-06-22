# matside.org — Corporate Credibility Rewrite — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure `matside.org` from a tournament-services splash into a corporate-credibility homepage (About / 5-product Software Portfolio / Tournaments / Leadership / Contact / Footer) plus a `/legal/*` surface of five static HTML pages (Privacy, Terms, COPPA, Information Security Program, Data Retention Policy) suitable for Safe Harbor + insurance + lawyer review.

**Architecture:** Two surfaces touched in this single atomic engagement: `index.html` gets a full structural rewrite (preserving the tournament-schedule tables exactly), `style.css` gets a CSS-rule append (no existing rules touched), and six new `legal/*.html` files are created using a shared nav+footer chrome. No build tooling, no JS framework, no analytics added. Hosted on GitHub Pages via the existing `CNAME` (`www.matside.org`). Single atomic commit on `main` when done.

**Tech Stack:** Plain HTML5 + CSS3 + Google Fonts (Inter, Montserrat). No JS. No framework. No build step.

**Spec:** `docs/superpowers/specs/2026-06-22-matside-org-corporate-credibility-rewrite.md`

---

## Working repo

All file paths are relative to `/Users/emmons_house/Desktop/Matside Software/matside.org/` unless prefixed with `matside-hq/` (Task 16 only).

## File structure overview

| File | Action | Responsibility |
|---|---|---|
| `index.html` | Modify (full structural rewrite) | Single-page corporate homepage |
| `style.css` | Append (no existing rules touched) | Add CSS for new sections + `.legal-prose` container |
| `legal/index.html` | Create | Directory page for the legal surface |
| `legal/privacy.html` | Create | Corporate Privacy Policy |
| `legal/terms.html` | Create | Corporate Terms of Service |
| `legal/coppa.html` | Create | Corporate Children's Privacy / COPPA Policy |
| `legal/information-security.html` | Create | Information Security Program (port from `matside-hq/docs/legal/matside-isp-v1.md`) |
| `legal/retention.html` | Create | Data Retention Policy (port from `matside-hq/docs/legal/retention-policy-v1.md`) |

**Files NOT touched (explicit non-goals):**
- `broadcast.html`, `todo.html`, `userstoryflow.html` — orphan internal pages, separate cleanup item
- `wt/*` — wrestling-ticker utility
- `brand/*` — brand system showcase
- `assets/*` — images and JSON templates (the hero logo `mswc.png` continues to be referenced as-is)
- `CNAME` — `www.matside.org`, unchanged

## Conventions

- All HTML files are HTML5 (`<!DOCTYPE html>`)
- All paths in `href` are absolute from site root (e.g., `/legal/privacy.html`, not `legal/privacy.html`) so they work from any page
- Date convention in legal pages: `Last updated: 2026-06-22` + `Version: 1.0 — pending Sept 1, 2026 attorney review`
- The shared nav block is repeated verbatim in every page; ditto the shared footer (no template engine; this is the cost of plain HTML)

---

## Task 1: Append new CSS rules to `style.css`

**Files:**
- Modify: `style.css` (append at end of file, after the existing footer rules)

- [ ] **Step 1: Open `style.css` and locate the end of file.** Confirm the file ends with the existing `.footer-bottom` or similar footer-related rule. The additions go AFTER all existing rules; do not edit anything above.

- [ ] **Step 2: Append this block to the end of `style.css`:**

```css

/* ============================================================
   Added 2026-06-22 — corporate-credibility rewrite.
   New section rules for About, Leadership, Contact, Footer-legal,
   and the .legal-prose container used by /legal/*.html pages.
   No existing rules above touched.
   ============================================================ */

/* ─── About section ─────────────────────────── */
.about {
  padding: 5rem 0;
  background: var(--bg);
}
.about .section-inner {
  max-width: 760px;
}
.about p {
  font-size: 1.0625rem;
  line-height: 1.75;
  color: var(--text);
}
.about p a {
  color: var(--accent-bright);
  text-decoration: underline;
  text-underline-offset: 3px;
}
.about p a:hover {
  color: var(--accent);
}

/* ─── Leadership section ─────────────────────────── */
.leadership {
  padding: 5rem 0;
  background: var(--bg-raised);
}
.leadership-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  margin-top: 3rem;
}
.leader-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
}
.leader-avatar {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Montserrat', 'Inter', sans-serif;
  font-weight: 700;
  font-size: 1.875rem;
  color: var(--white);
  letter-spacing: 0.05em;
  overflow: hidden;
  flex-shrink: 0;
}
.leader-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.leader-name {
  font-family: 'Montserrat', 'Inter', sans-serif;
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--white);
  letter-spacing: -0.02em;
  margin: 0;
}
.leader-title {
  font-size: 0.875rem;
  color: var(--accent-bright);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-weight: 600;
}
.leader-bio {
  font-size: 0.9375rem;
  line-height: 1.65;
  color: var(--text-muted);
}
.leader-bio.placeholder {
  font-style: italic;
}
.leader-credential {
  font-size: 0.875rem;
  color: var(--text);
}
.leader-credential a {
  color: var(--accent-bright);
  text-decoration: underline;
  text-underline-offset: 3px;
}
.leader-email {
  font-size: 0.9375rem;
  color: var(--accent-bright);
  text-decoration: none;
  font-weight: 500;
}
.leader-email:hover {
  text-decoration: underline;
}
@media (max-width: 760px) {
  .leadership-grid {
    grid-template-columns: 1fr;
  }
}

/* ─── Product status badges ─────────────────────────── */
.product-status {
  display: inline-block;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 0.25rem 0.625rem;
  border-radius: 4px;
  margin-bottom: 0.75rem;
}
.product-status.live {
  background: rgba(125, 211, 240, 0.12);
  color: var(--accent-bright);
  border: 1px solid rgba(125, 211, 240, 0.3);
}
.product-status.launching {
  background: rgba(61, 130, 196, 0.12);
  color: var(--accent-bright);
  border: 1px solid rgba(61, 130, 196, 0.4);
}
.product-status.coming-soon {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-muted);
  border: 1px solid var(--border);
}

/* ─── Contact (Get in touch) single-channel block ─────────────────────────── */
.contact {
  padding: 5rem 0;
  background: var(--bg);
}
.contact .section-inner {
  max-width: 640px;
  text-align: center;
}
.contact h2 {
  font-family: 'Montserrat', 'Inter', sans-serif;
  font-weight: 800;
  letter-spacing: -0.02em;
}
.contact p {
  font-size: 1.0625rem;
  line-height: 1.7;
  color: var(--text);
  margin-top: 1rem;
}
.contact-email {
  display: inline-block;
  font-size: 1.125rem;
  color: var(--accent-bright);
  text-decoration: none;
  font-weight: 600;
  margin-top: 1.5rem;
  padding: 0.75rem 1.5rem;
  border: 1px solid var(--accent);
  border-radius: 8px;
  transition: background 0.2s, border-color 0.2s;
}
.contact-email:hover {
  background: rgba(61, 130, 196, 0.08);
  border-color: var(--accent-bright);
}
.contact-direct {
  margin-top: 1.5rem;
  font-size: 0.9375rem;
  color: var(--text-muted);
}
.contact-direct a {
  color: var(--accent-bright);
  text-decoration: underline;
  text-underline-offset: 3px;
}

/* ─── Footer expansion (legal links row) ─────────────────────────── */
.footer-legal {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border);
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem;
  justify-content: center;
  font-size: 0.875rem;
}
.footer-legal a {
  color: var(--text-muted);
  text-decoration: none;
  transition: color 0.2s;
}
.footer-legal a:hover {
  color: var(--accent-bright);
}
.footer-corporate {
  text-align: center;
  font-size: 0.8125rem;
  color: var(--text-muted);
  margin-top: 1.5rem;
  line-height: 1.7;
}

/* ─── Legal prose container (for /legal/*.html pages) ─────────────────────────── */
.legal-prose {
  max-width: 760px;
  margin: 0 auto;
  padding: 7rem 2rem 5rem;
  font-size: 1rem;
  line-height: 1.75;
  color: var(--text);
}
.legal-prose h1 {
  font-family: 'Montserrat', 'Inter', sans-serif;
  font-size: 2.25rem;
  font-weight: 800;
  color: var(--white);
  letter-spacing: -0.025em;
  margin-bottom: 0.5rem;
}
.legal-prose .legal-meta {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border);
}
.legal-prose .legal-meta strong {
  color: var(--text);
}
.legal-prose h2 {
  font-family: 'Montserrat', 'Inter', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--white);
  margin-top: 2.5rem;
  margin-bottom: 1rem;
  letter-spacing: -0.015em;
}
.legal-prose h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--white);
  margin-top: 1.75rem;
  margin-bottom: 0.5rem;
}
.legal-prose p {
  margin-bottom: 1rem;
}
.legal-prose ul,
.legal-prose ol {
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}
.legal-prose li {
  margin-bottom: 0.5rem;
}
.legal-prose a {
  color: var(--accent-bright);
  text-decoration: underline;
  text-underline-offset: 3px;
}
.legal-prose a:hover {
  color: var(--accent);
}
.legal-prose blockquote {
  margin: 1.25rem 0;
  padding: 0.875rem 1.25rem;
  border-left: 3px solid var(--accent);
  background: rgba(61, 130, 196, 0.06);
  color: var(--text-muted);
  font-style: italic;
}
.legal-prose code {
  font-family: 'JetBrains Mono', ui-monospace, 'SF Mono', monospace;
  font-size: 0.875em;
  background: var(--bg-raised);
  border: 1px solid var(--border);
  padding: 0.125rem 0.375rem;
  border-radius: 3px;
  color: var(--accent-bright);
}
.legal-prose hr {
  border: none;
  border-top: 1px solid var(--border);
  margin: 2rem 0;
}

/* ─── Legal index page directory list ─────────────────────────── */
.legal-index {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 2rem 0;
}
.legal-index-item {
  display: block;
  padding: 1.5rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 8px;
  text-decoration: none;
  transition: border-color 0.2s, background 0.2s;
}
.legal-index-item:hover {
  border-color: var(--accent);
  background: var(--bg-raised);
}
.legal-index-item h2 {
  font-family: 'Montserrat', 'Inter', sans-serif;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--white);
  margin: 0 0 0.5rem;
}
.legal-index-item p {
  font-size: 0.9375rem;
  color: var(--text-muted);
  margin: 0;
}
.legal-index-item .legal-meta {
  display: inline-block;
  margin-top: 0.75rem;
  font-size: 0.75rem;
  color: var(--text-muted);
  border: none;
  padding: 0;
}

/* ─── Product card images: replace deprecated <center> tag treatment ─────── */
.product-card img {
  display: block;
  margin: 0 auto;
}
```

- [ ] **Step 3: Verify `style.css` parses by opening it in a browser via `file://` on an existing HTML file.** Open `index.html` (still the old version) in a browser. The page should render unchanged — the new rules only target classes that don't exist yet on the old page, so adding them is a no-op until index.html is rewritten.

- [ ] **Step 4: No commit yet.** Single atomic commit at Task 15.

---

## Task 2: Add Montserrat font + replace `<head>` metadata in `index.html`

**Files:**
- Modify: `index.html` (replace the entire `<head>` block)

- [ ] **Step 1: Open `index.html` and locate the existing `<head>` block (lines 1-11 of the original file).** It currently contains: charset, viewport, title "MatSide Wrestling Co.", stylesheet link, Google Fonts preconnect + Inter import.

- [ ] **Step 2: Replace the entire `<head>` block with this expanded version (adds: title casing fix, meta description, Open Graph, Twitter Card, favicon, Montserrat font):**

```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Matside Wrestling Co. — Tournament Operations &amp; Software for the Wrestling Community</title>

  <meta name="description" content="Matside Wrestling Co. — Western Pennsylvania-based wrestling business operating across two pillars: full-service tournament management and Matside Software, a portfolio of products for the wrestling community.">

  <!-- Open Graph -->
  <meta property="og:title" content="Matside Wrestling Co.">
  <meta property="og:description" content="Tournament operations and software for the wrestling community.">
  <meta property="og:url" content="https://www.matside.org">
  <meta property="og:type" content="website">
  <meta property="og:image" content="https://www.matside.org/assets/images/mswc.png">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Matside Wrestling Co.">
  <meta name="twitter:description" content="Tournament operations and software for the wrestling community.">
  <meta name="twitter:image" content="https://www.matside.org/assets/images/mswc.png">

  <!-- Favicon -->
  <link rel="icon" type="image/x-icon" href="/favicon.ico">

  <link rel="stylesheet" href="/style.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Montserrat:wght@700;800&display=swap" rel="stylesheet">
</head>
```

- [ ] **Step 3: Open `index.html` in a browser via `file://`** to verify the title bar updates to "Matside Wrestling Co. — …" (with the correct casing) and the favicon shows in the tab. The page body is still the old version — that's expected; the body rewrite comes in Task 3.

---

## Task 3: Rewrite `<body>` of `index.html` — Nav + Hero + About

**Files:**
- Modify: `index.html` (replace the existing Nav and Hero sections; insert new About section after Hero)

- [ ] **Step 1: Locate the existing `<nav>` block in `index.html` (currently has class `nav` with logo "MATSIDE" + 3 links: Events / Services / Contact).**

- [ ] **Step 2: Replace the existing `<nav>` block with the expanded 6-link nav:**

```html
  <!-- Nav -->
  <nav class="nav">
    <div class="nav-inner">
      <a href="/" class="nav-logo">MATSIDE</a>
      <ul class="nav-links">
        <li><a href="/">Home</a></li>
        <li><a href="#products">Products</a></li>
        <li><a href="#tournaments">Tournaments</a></li>
        <li><a href="#leadership">Leadership</a></li>
        <li><a href="/legal/">Legal</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
    </div>
  </nav>
```

- [ ] **Step 3: Locate the existing Hero section (`<section class="hero">` block).** It currently has the wordmark image + tagline "Team Management · Tournament Management · Merchandising" + CTA "View Upcoming Events".

- [ ] **Step 4: Replace the existing Hero section with:**

```html
  <!-- Hero -->
  <section class="hero">
    <div class="hero-inner">
      <div class="hero-logo-placeholder" id="hero-logo">
        <img src="/assets/images/mswc.png" alt="Matside Wrestling Co." width="800">
      </div>
      <p class="hero-tagline">Tournament operations and software for the wrestling community.</p>
      <div class="hero-ctas" style="display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center; margin-top: 2rem;">
        <a href="#products" class="hero-cta">Explore our products</a>
        <a href="#tournaments" class="hero-cta" style="background: transparent; border: 1px solid var(--border); color: var(--text);">See our schedule</a>
      </div>
    </div>
  </section>
```

- [ ] **Step 5: Insert a new About section AFTER the Hero, BEFORE the existing Events section:**

```html
  <!-- About -->
  <section class="about" id="about">
    <div class="section-inner">
      <p>
        Matside Wrestling Co. is a Western Pennsylvania-based wrestling business operating across two pillars: full-service <strong>tournament management</strong> for high-school, junior-high, and youth wrestling events, and <strong>Matside Software</strong> &mdash; a portfolio of purpose-built products for the wrestling community. Founded and operated by Daniel Emmons (<a href="https://www.usabracketing.com/experts" target="_blank" rel="noopener">USA Bracketing Expert</a>), Matside is a wrestling-native operator &mdash; not a generic event-management firm with a wrestling product line, but a wrestling person building tools and running events for the sport from the inside.
      </p>
    </div>
  </section>
```

- [ ] **Step 6: Browser-verify by opening `index.html`.** Nav should show 6 links. Hero tagline should read "Tournament operations and software for the wrestling community." About section should render below Hero with the corporate paragraph.

---

## Task 4: Rewrite Events sections — Tournaments section with refreshed services blurb + preserved tables

**Files:**
- Modify: `index.html` (restructure the two existing Events sections into a single Tournaments section; fix duplicate IDs)

- [ ] **Step 1: Locate the two existing Events sections.** First one has `<section class="events" id="events">` with 2025-2026 schedule table. Second one has the SAME `id="events"` with 2026-2027 schedule. This is the duplicate-ID bug.

- [ ] **Step 2: Wrap both schedule tables in a single Tournaments section. Replace the first `<section class="events" id="events">` opening tag with:**

```html
  <!-- Tournaments -->
  <section class="events" id="tournaments">
    <div class="section-inner">
      <h2 class="section-title">Tournaments</h2>
      <p style="max-width: 720px; font-size: 1.0625rem; line-height: 1.7; color: var(--text); margin-bottom: 3rem;">
        Matside operates as a tournament contractor for high-school, junior-high, and youth events across Western Pennsylvania and the Mid-Atlantic. We bring bracket management, scoring, and live results infrastructure &mdash; powered by FloArena and USA Bracketing &mdash; and partner with tournament directors who carry event-level insurance and own volunteer coordination.
      </p>

      <h3 class="section-title" style="font-size: 1.375rem; margin-bottom: 1.5rem;" id="events-current">2025-2026 Schedule</h3>
      <div class="events-table-wrap">
        <table class="events-table">
```

- [ ] **Step 3: Locate the close of the first events table's `<section>` block.** Currently it ends with `</tbody></table></div></div></section>`. Keep the table close (`</tbody></table></div>`) but REMOVE the section-close (`</div></section>`) so the section stays open and the second table can live inside it.

After the first table's `</tbody></table></div>`, the structure should be:

```html
          </tbody>
        </table>
      </div>

      <h3 class="section-title" style="font-size: 1.375rem; margin: 3rem 0 1.5rem;" id="events-next">2026-2027 Schedule</h3>
      <div class="events-table-wrap">
        <table class="events-table">
```

- [ ] **Step 4: Find the second existing Events section** (currently `<section class="events" id="events">` with the 2026-2027 table) and REMOVE the opening `<section class="events" id="events"><div class="section-inner"><h2 class="section-title">2026-2027 Upcoming Events</h2>` block — those are replaced by the inline `<h3>` from Step 3.

- [ ] **Step 5: After the second table's `</tbody></table></div>`, add a tournament CTA inside the same section, then close the section:**

```html
          </tbody>
        </table>
      </div>

      <div style="margin-top: 3rem; text-align: center;">
        <p style="font-size: 1.125rem; color: var(--text); margin-bottom: 1.5rem;">Interested in Matside running your tournament?</p>
        <a href="mailto:support@matside.org?subject=Tournament%20Management%20Inquiry" class="btn-primary" id="tournament-cta">Get in Touch</a>
      </div>

    </div>
  </section>
```

- [ ] **Step 6: Browser-verify.** Open `index.html`. The Tournaments section should now show the refreshed paragraph at top, the 2025-2026 schedule table, the 2026-2027 schedule table (both preserved with their original event rows), and the tournament CTA at the bottom. There should be no duplicate IDs anywhere.

- [ ] **Step 7: Validate duplicate IDs.** Run in browser devtools console:
```js
const ids = [...document.querySelectorAll('[id]')].map(e => e.id);
const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
console.log('Duplicate IDs:', dupes);
```
Expected: `Duplicate IDs: []` (empty array).

---

## Task 5: Replace Services + Products sections with the new 5-card Products grid

**Files:**
- Modify: `index.html` (delete the existing Services section + replace Products section with new 5-card grid)

- [ ] **Step 1: Locate the existing Services section** (currently `<section class="services" id="services">` with 3 cards: Team Management / Tournament Management / Merchandising). **Delete this entire section.** The tournament-services content moved into the Tournaments section in Task 4; the Software-pillar Products section is the replacement for the rest.

- [ ] **Step 2: Locate the existing Products section** (currently `<section class="products" id="products">` with 2 product cards: MatSide Systems + SignUpSignIn).

- [ ] **Step 3: Replace the entire Products section (and the duplicate-IDed CTA section below it, which had `<section class="services" id="services"></div>...`) with this 5-card Products section:**

```html
  <!-- Products -->
  <section class="products" id="products">
    <div class="section-inner">
      <h2 class="section-title">Matside Software</h2>
      <p style="max-width: 680px; font-size: 1rem; line-height: 1.7; color: var(--text-muted); margin: 0 auto 3rem; text-align: center;">
        A portfolio of purpose-built products for the wrestling community. All Matside Software products launch Oct 1, 2026 except where noted.
      </p>
      <div class="products-grid">

        <a href="https://matrecruit.org" target="_blank" rel="noopener" class="product-card">
          <span class="product-status launching">Launching Oct 1, 2026</span>
          <h3 style="font-family: 'Montserrat', sans-serif; font-size: 1.25rem; font-weight: 700; color: var(--white); margin-bottom: 0.625rem;">MatRecruit</h3>
          <p>The recruiting platform built for high-school wrestlers. Profile + private outreach tracker + AI next steps.</p>
          <span class="product-link">matrecruit.org &rarr;</span>
        </a>

        <a href="https://matsidetime.org" target="_blank" rel="noopener" class="product-card">
          <span class="product-status launching">Launching Oct 1, 2026</span>
          <h3 style="font-family: 'Montserrat', sans-serif; font-size: 1.25rem; font-weight: 700; color: var(--white); margin-bottom: 0.625rem;">MatTime</h3>
          <p>A privates-booking marketplace connecting wrestlers, parents, and coaches.</p>
          <span class="product-link">matsidetime.org &rarr;</span>
        </a>

        <a href="https://matpass.org" target="_blank" rel="noopener" class="product-card">
          <span class="product-status launching">Launching Oct 1, 2026</span>
          <h3 style="font-family: 'Montserrat', sans-serif; font-size: 1.25rem; font-weight: 700; color: var(--white); margin-bottom: 0.625rem;">MatPass</h3>
          <p>Compliance management for wrestling programs &mdash; eligibility, paperwork, status tracking.</p>
          <span class="product-link">matpass.org &rarr;</span>
        </a>

        <a href="https://wrestlefa.org" target="_blank" rel="noopener" class="product-card">
          <span class="product-status coming-soon">Coming soon</span>
          <h3 style="font-family: 'Montserrat', sans-serif; font-size: 1.25rem; font-weight: 700; color: var(--white); margin-bottom: 0.625rem;">WrestleFA</h3>
          <p>A free-agent board for wrestling tournaments &mdash; coaches post open spots, parents fill them.</p>
          <span class="product-link">wrestlefa.org &rarr;</span>
        </a>

        <a href="https://signupsignin.com" target="_blank" rel="noopener" class="product-card">
          <span class="product-status live">Live · iOS + Web</span>
          <h3 style="font-family: 'Montserrat', sans-serif; font-size: 1.25rem; font-weight: 700; color: var(--white); margin-bottom: 0.625rem;">SignupSignin</h3>
          <p>Volunteer event signup and day-of check-in for tournament organizers.</p>
          <span class="product-link">signupsignin.com &rarr;</span>
        </a>

      </div>
    </div>
  </section>
```

- [ ] **Step 4: Browser-verify.** Products section now shows 5 cards (not 2). Each card has a status badge: 3 "Launching Oct 1, 2026" (MatRecruit, MatTime, MatPass), 1 "Coming soon" (WrestleFA), 1 "Live · iOS + Web" (SignupSignin). MatSide Systems no longer appears anywhere. The deprecated `<center>` tags from the old product cards are gone.

---

## Task 6: Add Leadership section

**Files:**
- Modify: `index.html` (insert new Leadership section AFTER Products, BEFORE Contact)

- [ ] **Step 1: Locate the end of the Products section** (the `</section>` after the products-grid `</div>`). Insert the Leadership section immediately after:

```html
  <!-- Leadership -->
  <section class="leadership" id="leadership">
    <div class="section-inner">
      <h2 class="section-title">Leadership</h2>
      <div class="leadership-grid">

        <div class="leader-card">
          <div class="leader-avatar">DE</div>
          <span class="leader-title">Founder &amp; Operator</span>
          <h3 class="leader-name">Daniel Emmons</h3>
          <p class="leader-bio placeholder">Bio coming soon.</p>
          <p class="leader-credential"><a href="https://www.usabracketing.com/experts" target="_blank" rel="noopener">USA Bracketing Expert</a></p>
          <a href="mailto:daniel@matside.org" class="leader-email">daniel@matside.org</a>
        </div>

        <div class="leader-card">
          <div class="leader-avatar">MM</div>
          <span class="leader-title">Chief Mat Officer</span>
          <h3 class="leader-name">Mason Manville</h3>
          <p class="leader-bio placeholder">Bio coming soon.</p>
          <a href="mailto:mason@matside.org" class="leader-email">mason@matside.org</a>
        </div>

      </div>
    </div>
  </section>
```

- [ ] **Step 2: Browser-verify.** Two leadership cards render side-by-side on desktop. Each shows: Steel Blue circle with white initials ("DE" / "MM"), title in mono-uppercase-Steel-Blue-bright, full name in Montserrat display, italic "Bio coming soon." placeholder, USA Bracketing Expert credential (Daniel only), and a personal email link in Steel Blue.

- [ ] **Step 3: Resize browser to 375px width** (mobile). The leadership grid should collapse to a single column.

---

## Task 7: Replace Contact + Footer

**Files:**
- Modify: `index.html` (delete the existing services-cta block + footer; replace with new Contact section + corporate Footer)

- [ ] **Step 1: Locate the existing footer-related content.** The original file had:
  - A malformed `<section class="services" id="services"></div>...<div class="services-cta">...` block — this was deleted in Task 5
  - A `<footer class="footer" id="contact">` block with brand line + Gmail contact + social-link placeholders + copyright

- [ ] **Step 2: After the Leadership section's closing `</section>`, add a new Contact section + new Footer:**

```html
  <!-- Get in touch -->
  <section class="contact" id="contact">
    <div class="section-inner">
      <h2 class="section-title">Get in touch</h2>
      <p>General inquiries &mdash; tournament management, product questions, partnerships, or press.</p>
      <a href="mailto:support@matside.org" class="contact-email">support@matside.org</a>
      <p class="contact-direct">
        For direct contact with Daniel or Mason, see the <a href="#leadership">Leadership</a> section above.
      </p>
    </div>
  </section>

  <!-- Footer -->
  <footer class="footer">
    <div class="section-inner">
      <div class="footer-grid">
        <div class="footer-brand">
          <span class="footer-logo">MATSIDE</span>
          <p>Professional wrestling event management and software in Western Pennsylvania.</p>
        </div>
        <div class="footer-contact">
          <h4>Contact</h4>
          <a href="mailto:support@matside.org">support@matside.org</a>
        </div>
        <div class="footer-social">
          <h4>Follow Us</h4>
          <div class="social-links">
            <a href="#" aria-label="Facebook" class="social-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a href="#" aria-label="Instagram" class="social-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </a>
          </div>
        </div>
      </div>

      <div class="footer-legal">
        <a href="/legal/privacy.html">Privacy</a>
        <a href="/legal/terms.html">Terms</a>
        <a href="/legal/coppa.html">COPPA</a>
        <a href="/legal/information-security.html">Information Security</a>
        <a href="/legal/retention.html">Data Retention</a>
      </div>

      <div class="footer-corporate">
        <strong>Matside Wrestling Co.</strong> &mdash; Pennsylvania single-member LLC, headquartered in Glenshaw, PA<br>
        &copy; 2026 Matside Wrestling Co. All rights reserved.
      </div>
    </div>
  </footer>
```

- [ ] **Step 3: Verify the body close.** After the footer, ensure `</body></html>` are the final tags. Remove any stray closing tags left over from the deletion.

- [ ] **Step 4: Browser-verify.** Contact section shows a single email CTA (`support@matside.org`) with the leadership-reference line below. Footer has: brand line, contact line, social icons, legal-links row with 5 links, corporate identity block with 2026 copyright. `matsidewrestlingco@gmail.com` should appear nowhere on the page.

- [ ] **Step 5: Final duplicate-ID check on the rewritten index.html.** Devtools console:
```js
const ids = [...document.querySelectorAll('[id]')].map(e => e.id);
const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
console.log('Duplicate IDs:', dupes);
```
Expected: `Duplicate IDs: []`.

- [ ] **Step 6: Grep check.** Run from repo root:
```bash
grep -c "matsidewrestlingco@gmail.com" index.html
```
Expected: `0`.

```bash
grep -c "MatSide Systems\|matsidesystems.com" index.html
```
Expected: `0`.

---

## Task 8: Create `legal/index.html` (directory page)

**Files:**
- Create: `legal/index.html`

- [ ] **Step 1: Create the `legal/` directory** if it doesn't exist:
```bash
mkdir -p legal
```

- [ ] **Step 2: Create `legal/index.html` with the full content:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Legal · Matside Wrestling Co.</title>
  <meta name="description" content="Privacy, Terms, COPPA, Information Security, and Data Retention policies for Matside Wrestling Co.">
  <meta name="robots" content="index,follow">
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <link rel="stylesheet" href="/style.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Montserrat:wght@700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
</head>
<body>

  <!-- Nav -->
  <nav class="nav">
    <div class="nav-inner">
      <a href="/" class="nav-logo">MATSIDE</a>
      <ul class="nav-links">
        <li><a href="/">Home</a></li>
        <li><a href="/#products">Products</a></li>
        <li><a href="/#tournaments">Tournaments</a></li>
        <li><a href="/#leadership">Leadership</a></li>
        <li><a href="/legal/">Legal</a></li>
        <li><a href="/#contact">Contact</a></li>
      </ul>
    </div>
  </nav>

  <main class="legal-prose">
    <h1>Legal &amp; Policy Documents</h1>
    <div class="legal-meta">
      <strong>Last updated:</strong> 2026-06-22<br>
      <strong>Status:</strong> All documents marked v1.0 are pending Sept 1, 2026 attorney review.
    </div>

    <p>
      These documents describe how Matside Wrestling Co. operates as a tournament operator and software provider, and how the data of our users (athletes, parents, coaches, tournament directors, and volunteers) is handled across the five Matside Software products and the tournament-management business.
    </p>

    <div class="legal-index">

      <a href="/legal/privacy.html" class="legal-index-item">
        <h2>Privacy Policy</h2>
        <p>How Matside collects, uses, stores, and discloses personal information across all Matside products and services.</p>
        <span class="legal-meta">Version 1.0 · Last updated 2026-06-22</span>
      </a>

      <a href="/legal/terms.html" class="legal-index-item">
        <h2>Terms of Service</h2>
        <p>The terms governing use of Matside Software products and Matside-operated tournaments.</p>
        <span class="legal-meta">Version 1.0 · Last updated 2026-06-22</span>
      </a>

      <a href="/legal/coppa.html" class="legal-index-item">
        <h2>Children's Privacy / COPPA Policy</h2>
        <p>How Matside addresses the Children's Online Privacy Protection Act across each product, including the structural-exclusion analyses for products not subject to COPPA.</p>
        <span class="legal-meta">Version 1.0 · Last updated 2026-06-22</span>
      </a>

      <a href="/legal/information-security.html" class="legal-index-item">
        <h2>Information Security Program</h2>
        <p>Matside's information security policies, access controls, vendor management, and incident response procedures.</p>
        <span class="legal-meta">Version 1.0 · Last updated 2026-06-22</span>
      </a>

      <a href="/legal/retention.html" class="legal-index-item">
        <h2>Data Retention Policy</h2>
        <p>How long Matside retains user data across each product, with product-specific retention windows and the criteria for anonymization or deletion.</p>
        <span class="legal-meta">Version 1.0 · Last updated 2026-06-22</span>
      </a>

    </div>

    <hr>

    <p style="font-size: 0.9375rem; color: var(--text-muted);">
      Questions about any of these policies? Contact <a href="mailto:support@matside.org">support@matside.org</a>.
    </p>
  </main>

  <!-- Footer -->
  <footer class="footer">
    <div class="section-inner">
      <div class="footer-corporate">
        <strong>Matside Wrestling Co.</strong> &mdash; Pennsylvania single-member LLC, headquartered in Glenshaw, PA<br>
        Contact: <a href="mailto:support@matside.org">support@matside.org</a><br>
        &copy; 2026 Matside Wrestling Co. All rights reserved.
      </div>
    </div>
  </footer>

</body>
</html>
```

- [ ] **Step 3: Browser-verify.** Open `legal/index.html`. The page should render with the shared nav at top, a "Legal & Policy Documents" h1, the "Last updated" meta block, an intro paragraph, 5 card-style links to the legal documents (each showing title + description + version meta), then the contact line and footer.

---

## Task 9: Create `legal/information-security.html` (port from `matside-isp-v1.md`)

**Files:**
- Create: `legal/information-security.html`
- Read: `/Users/emmons_house/Desktop/Matside HQ/matside-hq/matside-hq/docs/legal/matside-isp-v1.md`

- [ ] **Step 1: Read the markdown source.** Open `matside-hq/docs/legal/matside-isp-v1.md` and confirm it has ~9 sections per the spec (purpose/scope, personnel + access, physical security, network, application, vendors, incident response, annual review, per-product addenda index). Note the exact section headings and prose.

- [ ] **Step 2: Create `legal/information-security.html` with this shell, then port the markdown body to HTML:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Information Security Program · Matside Wrestling Co.</title>
  <meta name="description" content="Matside Wrestling Co. Information Security Program v1.">
  <meta name="robots" content="index,follow">
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <link rel="stylesheet" href="/style.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Montserrat:wght@700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
</head>
<body>

  <nav class="nav">
    <div class="nav-inner">
      <a href="/" class="nav-logo">MATSIDE</a>
      <ul class="nav-links">
        <li><a href="/">Home</a></li>
        <li><a href="/#products">Products</a></li>
        <li><a href="/#tournaments">Tournaments</a></li>
        <li><a href="/#leadership">Leadership</a></li>
        <li><a href="/legal/">Legal</a></li>
        <li><a href="/#contact">Contact</a></li>
      </ul>
    </div>
  </nav>

  <main class="legal-prose">
    <h1>Information Security Program</h1>
    <div class="legal-meta">
      <strong>Last updated:</strong> 2026-06-22 &middot; <strong>Version:</strong> 1.0 &mdash; pending Sept 1, 2026 attorney review<br>
      <a href="/legal/">&larr; Back to Legal index</a>
    </div>

    <!-- BODY: port from matside-hq/docs/legal/matside-isp-v1.md -->
    <!-- Transform pattern:
         - Markdown `# Heading 1` (the title) → already in <h1> above; skip in body
         - Markdown `## Heading 2` → <h2>
         - Markdown `### Heading 3` → <h3>
         - Markdown paragraphs → <p>
         - Markdown unordered lists → <ul><li>
         - Markdown ordered lists → <ol><li>
         - Markdown `**bold**` → <strong>
         - Markdown `*italic*` → <em>
         - Markdown `[text](url)` → <a href="url">text</a>
         - Markdown code spans `` `code` `` → <code>code</code>
         - Markdown blockquotes `> text` → <blockquote>text</blockquote>
         - Markdown horizontal rules `---` → <hr>
         - Preserve all hyperlinks; preserve all email addresses as mailto: links
    -->
    <!-- TODO during execution: paste the transformed prose body here -->
    <!-- Reference table mapping markdown sections to expected HTML structure:
         ## Purpose and Scope                  → <h2>Purpose and Scope</h2> + paragraphs
         ## Personnel and Access Model         → <h2> + sub-headings for sole-operator + MFA matrix
         ## Physical Security                  → <h2> + paragraphs (FileVault, 1Password, travel rule)
         ## Network Security                   → <h2>
         ## Application Security               → <h2> + per-product subsections
         ## Vendor and Subprocessor Management → <h2> + vendor table → render as <table> or <ul>
         ## Incident Response                  → <h2> + numbered list for the 5-step procedure
         ## Annual Review Cadence              → <h2>
         ## Per-Product Addenda Index          → <h2> + <ul> linking to wrestlefa.md / matrecruit.md / mattime.md / matpass.md / signupsignin.md
    -->

  </main>

  <footer class="footer">
    <div class="section-inner">
      <div class="footer-corporate">
        <strong>Matside Wrestling Co.</strong> &mdash; Pennsylvania single-member LLC, headquartered in Glenshaw, PA<br>
        Contact: <a href="mailto:support@matside.org">support@matside.org</a><br>
        &copy; 2026 Matside Wrestling Co. All rights reserved.
      </div>
    </div>
  </footer>

</body>
</html>
```

- [ ] **Step 3: Port the body.** Open `matside-hq/docs/legal/matside-isp-v1.md`, walk through each section, and write the corresponding HTML directly into the `<main class="legal-prose">` container. Replace the `<!-- BODY: port from ... -->` comment block with the actual ported content. Apply the transform pattern from the comment.

- [ ] **Step 4: Port the per-product addenda inline OR link out to per-product pages.** The spec says "inline or linked" — for this engagement, link out to the addenda markdown files in `matside-hq/docs/legal/isp-addenda/` on GitHub. Example:
```html
<h2>Per-Product Addenda</h2>
<p>Product-specific information security addenda detail the data flow, access controls, and security architecture for each Matside Software product:</p>
<ul>
  <li><a href="https://github.com/matsidewrestlingco-netizen/matside-hq/blob/main/docs/legal/isp-addenda/matrecruit.md" target="_blank" rel="noopener">MatRecruit ISP Addendum</a></li>
  <li><a href="https://github.com/matsidewrestlingco-netizen/matside-hq/blob/main/docs/legal/isp-addenda/mattime.md" target="_blank" rel="noopener">MatTime ISP Addendum</a></li>
  <li><a href="https://github.com/matsidewrestlingco-netizen/matside-hq/blob/main/docs/legal/isp-addenda/matpass.md" target="_blank" rel="noopener">MatPass ISP Addendum</a></li>
  <li><a href="https://github.com/matsidewrestlingco-netizen/matside-hq/blob/main/docs/legal/isp-addenda/wrestlefa.md" target="_blank" rel="noopener">WrestleFA ISP Addendum</a></li>
  <li><a href="https://github.com/matsidewrestlingco-netizen/matside-hq/blob/main/docs/legal/isp-addenda/signupsignin.md" target="_blank" rel="noopener">SignupSignin ISP Addendum</a></li>
</ul>
```

- [ ] **Step 5: Browser-verify.** Open `legal/information-security.html`. The page should render the shared nav, the ISP h1, the meta line, the full ported body content with proper heading hierarchy, the per-product addenda links, and the shared footer.

---

## Task 10: Create `legal/retention.html` (port from `retention-policy-v1.md`)

**Files:**
- Create: `legal/retention.html`
- Read: `/Users/emmons_house/Desktop/Matside HQ/matside-hq/matside-hq/docs/legal/retention-policy-v1.md`

- [ ] **Step 1: Read the markdown source.** Open `matside-hq/docs/legal/retention-policy-v1.md` (~150 lines). Note: per-product retention windows + FERPA dependency for MatPass + audit-log retention + service-provider logs + legal-hold exception + notification+grace pattern.

- [ ] **Step 2: Create `legal/retention.html` with this shell:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Data Retention Policy · Matside Wrestling Co.</title>
  <meta name="description" content="Matside Wrestling Co. Data Retention Policy v1.">
  <meta name="robots" content="index,follow">
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <link rel="stylesheet" href="/style.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Montserrat:wght@700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
</head>
<body>

  <nav class="nav">
    <div class="nav-inner">
      <a href="/" class="nav-logo">MATSIDE</a>
      <ul class="nav-links">
        <li><a href="/">Home</a></li>
        <li><a href="/#products">Products</a></li>
        <li><a href="/#tournaments">Tournaments</a></li>
        <li><a href="/#leadership">Leadership</a></li>
        <li><a href="/legal/">Legal</a></li>
        <li><a href="/#contact">Contact</a></li>
      </ul>
    </div>
  </nav>

  <main class="legal-prose">
    <h1>Data Retention Policy</h1>
    <div class="legal-meta">
      <strong>Last updated:</strong> 2026-06-22 &middot; <strong>Version:</strong> 1.0 &mdash; pending Sept 1, 2026 attorney review<br>
      <a href="/legal/">&larr; Back to Legal index</a>
    </div>

    <!-- BODY: port from matside-hq/docs/legal/retention-policy-v1.md -->
    <!-- Transform pattern: same as Task 9 -->

  </main>

  <footer class="footer">
    <div class="section-inner">
      <div class="footer-corporate">
        <strong>Matside Wrestling Co.</strong> &mdash; Pennsylvania single-member LLC, headquartered in Glenshaw, PA<br>
        Contact: <a href="mailto:support@matside.org">support@matside.org</a><br>
        &copy; 2026 Matside Wrestling Co. All rights reserved.
      </div>
    </div>
  </footer>

</body>
</html>
```

- [ ] **Step 3: Port the body** using the same transform pattern as Task 9. Walk through the markdown, write HTML directly into the `<main>` container.

- [ ] **Step 4: Browser-verify.** Open `legal/retention.html`. Shared nav + h1 + meta + ported body + shared footer.

---

## Task 11: Create `legal/privacy.html` (corporate adaptation)

**Files:**
- Create: `legal/privacy.html`
- Reference: `matrecruit/docs/legal/MatRecruit-Privacy-Policy-v1.md` (if exists) or `matrecruit/src/app/(legal)/privacy/page.tsx`

- [ ] **Step 1: Read the MatRecruit privacy source.** Open whichever exists:
```bash
ls /Users/emmons_house/Desktop/Matside\ Software/matrecruit/docs/legal/ 2>&1
ls /Users/emmons_house/Desktop/Matside\ Software/matrecruit/src/app/\(legal\)/privacy/ 2>&1
```

- [ ] **Step 2: Create `legal/privacy.html` with this shell** (same nav + footer as prior tasks):

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Privacy Policy · Matside Wrestling Co.</title>
  <meta name="description" content="How Matside Wrestling Co. collects, uses, stores, and discloses personal information across all Matside products and services.">
  <meta name="robots" content="index,follow">
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <link rel="stylesheet" href="/style.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Montserrat:wght@700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
</head>
<body>

  <nav class="nav">
    <div class="nav-inner">
      <a href="/" class="nav-logo">MATSIDE</a>
      <ul class="nav-links">
        <li><a href="/">Home</a></li>
        <li><a href="/#products">Products</a></li>
        <li><a href="/#tournaments">Tournaments</a></li>
        <li><a href="/#leadership">Leadership</a></li>
        <li><a href="/legal/">Legal</a></li>
        <li><a href="/#contact">Contact</a></li>
      </ul>
    </div>
  </nav>

  <main class="legal-prose">
    <h1>Privacy Policy</h1>
    <div class="legal-meta">
      <strong>Last updated:</strong> 2026-06-22 &middot; <strong>Version:</strong> 1.0 &mdash; pending Sept 1, 2026 attorney review<br>
      <a href="/legal/">&larr; Back to Legal index</a>
    </div>

    <p>
      This Privacy Policy describes how <strong>Matside Wrestling Co.</strong> (&ldquo;Matside,&rdquo; &ldquo;we,&rdquo; &ldquo;our&rdquo;) collects, uses, stores, and discloses personal information across our portfolio of products and services. Matside Wrestling Co. is a Pennsylvania single-member limited liability company, headquartered in Glenshaw, PA. This policy applies to our tournament-management services and to all five products in the Matside Software portfolio: <strong>MatRecruit</strong>, <strong>MatTime</strong>, <strong>MatPass</strong>, <strong>WrestleFA</strong>, and <strong>SignupSignin</strong>.
    </p>

    <h2>1. Scope and Applicability</h2>
    <p>
      Matside Wrestling Co. is the operator of all the products and services listed above. Each product has its own user base and data flows, but they are all operated under this single corporate Privacy Policy. Product-specific privacy disclosures, where they exist, supplement (but do not replace) this corporate policy.
    </p>

    <h2>2. Information We Collect</h2>
    <h3>Information you provide directly</h3>
    <ul>
      <li><strong>Account information:</strong> email address (across all products); first and last name (most products); class year and other recruiting-relevant fields (MatRecruit only)</li>
      <li><strong>Profile information:</strong> in MatRecruit, athletes provide recruiting-profile data they choose to publish (weight class, accolades, schedule, coaches, highlight video links, social links); in MatTime, coaches provide privates-booking schedule and availability; in MatPass, program administrators provide compliance records about their athletes</li>
      <li><strong>Payment information:</strong> in MatRecruit, subscription payment information is collected and processed by Stripe; we do not store credit card numbers on our servers</li>
      <li><strong>Communication content:</strong> emails and messages you send to <code>support@matside.org</code> or to Daniel directly</li>
    </ul>
    <h3>Information collected automatically</h3>
    <ul>
      <li><strong>Authentication tokens:</strong> session cookies issued by Supabase Auth (MatRecruit, MatTime, WrestleFA) or Firebase Auth (MatPass, SignupSignin) to keep you signed in</li>
      <li><strong>Server logs:</strong> standard web-server logs (IP address, user-agent, request paths, timestamps) are captured by our hosting providers (Vercel for the Matside Software products; GitHub Pages for matside.org)</li>
      <li><strong>Error monitoring:</strong> on MatRecruit and MatTime, application errors are reported to Sentry. Sentry is configured with <code>sendDefaultPii: false</code> to suppress automatic personal-information capture, and our error metadata is scrubbed via a runtime guard (<code>scrubMetadataPii</code>) before transmission</li>
    </ul>
    <h3>Information NOT collected</h3>
    <p>
      Matside operates with a deliberately minimal third-party tracker footprint. As of 2026-06-22, matside.org and all five Matside Software products carry <strong>zero</strong> third-party analytics services (no Google Analytics, Plausible, PostHog, Mixpanel, Segment, Vercel Analytics, or Firebase Analytics), <strong>zero</strong> advertising or marketing pixels (no Meta, LinkedIn, X, TikTok, Google Ads), and <strong>zero</strong> behavioral profiling tools. This posture is documented in our <a href="https://github.com/matsidewrestlingco-netizen/matside-hq/blob/main/docs/legal/third-party-tracker-inventory-v1.md" target="_blank" rel="noopener">third-party tracker inventory</a>.
    </p>

    <h2>3. How We Use Your Information</h2>
    <ul>
      <li><strong>To operate the service:</strong> render your profile, manage your subscription, send you transactional emails (sign-in links, receipts, etc.)</li>
      <li><strong>To communicate with you:</strong> respond to support inquiries; notify you of service changes; send launch announcements if you opted in via a waitlist</li>
      <li><strong>To comply with legal obligations:</strong> respond to lawful requests from authorities; preserve information subject to legal hold</li>
      <li><strong>To improve our products:</strong> in aggregate, in a way that does not identify you individually; we do not currently run any analytics or behavioral profiling on individual users</li>
    </ul>

    <h2>4. How We Share Your Information</h2>
    <p>
      We do not sell your personal information. We share personal information only with the service providers (subprocessors) listed below, who process data on our behalf under data processing agreements:
    </p>
    <ul>
      <li><strong>Supabase</strong> — database + auth for MatRecruit, MatTime, WrestleFA, and our internal HQ tooling</li>
      <li><strong>Firebase / Google Cloud</strong> — database + auth for MatPass and SignupSignin</li>
      <li><strong>Vercel</strong> — hosting for the Matside Software products</li>
      <li><strong>Stripe</strong> — payment processing for MatRecruit subscriptions</li>
      <li><strong>Square</strong> — payment processing for WrestleFA, internal forms, and tournament-related transactions</li>
      <li><strong>Resend</strong> — transactional email delivery for MatRecruit; expansion to other products in progress</li>
      <li><strong>Sentry</strong> — error monitoring (MatRecruit, MatTime); configured with <code>sendDefaultPii: false</code></li>
      <li><strong>Anthropic</strong> — AI inference for MatRecruit's recruiting-assistant feature; structured outputs only, no behavioral profiling</li>
      <li><strong>Cloudflare R2</strong> — off-platform backup storage for internal HQ tooling</li>
    </ul>
    <p>
      Each of these subprocessors operates under a published or counterparty-signed Data Processing Agreement. The full set of DPAs is filed at <a href="https://github.com/matsidewrestlingco-netizen/matside-hq/tree/main/docs/legal/dpa" target="_blank" rel="noopener">matside-hq/docs/legal/dpa/</a>.
    </p>
    <p>
      We may also share personal information when required by law, when necessary to investigate or prevent fraud, or as part of a business transaction (sale, merger, acquisition); in that last case, we will notify affected users in advance to the extent we are legally able.
    </p>

    <h2>5. Children's Privacy</h2>
    <p>
      Matside's approach to children's privacy is documented in detail in our <a href="/legal/coppa.html">Children's Privacy / COPPA Policy</a>. In summary: <strong>MatRecruit</strong>, <strong>MatTime</strong>, <strong>MatPass</strong>, and <strong>SignupSignin</strong> do not knowingly collect personal information from children under 13. <strong>WrestleFA</strong>'s data model materially involves data about minor wrestlers, with parental consent required before any non-parent user can view a wrestler's profile; see the COPPA policy for the full disclosure.
    </p>

    <h2>6. Data Retention</h2>
    <p>
      Matside retains personal information for varying lengths of time depending on the product, the type of data, and applicable legal obligations. Full retention windows by product are documented in our <a href="/legal/retention.html">Data Retention Policy</a>.
    </p>

    <h2>7. Security</h2>
    <p>
      Our information security practices are documented in detail in our <a href="/legal/information-security.html">Information Security Program</a>. This includes our access controls, vendor management, incident response procedures, and per-product security addenda.
    </p>

    <h2>8. Your Rights</h2>
    <p>
      You can:
    </p>
    <ul>
      <li><strong>Access your information:</strong> view all the data we hold about you by signing in to the relevant product</li>
      <li><strong>Correct your information:</strong> edit your profile, settings, and data directly in each product</li>
      <li><strong>Delete your information:</strong> email <a href="mailto:support@matside.org">support@matside.org</a> or use the in-product account-deletion path where available. Account deletion is reversible for 30 days, then permanent</li>
      <li><strong>Object to processing:</strong> email <a href="mailto:support@matside.org">support@matside.org</a> if you believe we are processing your information in a way you object to</li>
      <li><strong>Lodge a complaint with a supervisory authority</strong> if you are in a jurisdiction where one exists</li>
    </ul>

    <h2>9. International Users</h2>
    <p>
      Matside is operated from the United States. If you are accessing our services from outside the United States, your information will be transferred to, stored in, and processed in the United States. By using our services, you consent to this transfer.
    </p>

    <h2>10. Changes to This Policy</h2>
    <p>
      We will update this policy from time to time. The &ldquo;Last updated&rdquo; date at the top of this page reflects the most recent change. Material changes will be announced via in-product notification or email where appropriate.
    </p>

    <h2>11. Contact</h2>
    <p>
      Questions about this policy? Contact <a href="mailto:support@matside.org">support@matside.org</a>.
    </p>

  </main>

  <footer class="footer">
    <div class="section-inner">
      <div class="footer-corporate">
        <strong>Matside Wrestling Co.</strong> &mdash; Pennsylvania single-member LLC, headquartered in Glenshaw, PA<br>
        Contact: <a href="mailto:support@matside.org">support@matside.org</a><br>
        &copy; 2026 Matside Wrestling Co. All rights reserved.
      </div>
    </div>
  </footer>

</body>
</html>
```

- [ ] **Step 3: Cross-check against the existing MatRecruit privacy source.** If the MatRecruit version mentions specific clauses or commitments not reflected in the above corporate adaptation, fold them in. Do NOT remove or contradict any MatRecruit-level disclosures — if there's a tension, prefer the more user-protective formulation in the corporate version.

- [ ] **Step 4: Browser-verify.** Open `legal/privacy.html`. Confirm all 11 sections render, all internal links work, the per-product list is complete (5 products), and the subprocessor list is correct.

---

## Task 12: Create `legal/terms.html` (corporate adaptation)

**Files:**
- Create: `legal/terms.html`
- Reference: `matrecruit/docs/legal/MatRecruit-Terms-of-Service-v1.md` (or product Terms source)

- [ ] **Step 1: Create `legal/terms.html` with the standard shell + this corporate body:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Terms of Service · Matside Wrestling Co.</title>
  <meta name="description" content="Terms governing use of Matside Wrestling Co. products and services.">
  <meta name="robots" content="index,follow">
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <link rel="stylesheet" href="/style.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Montserrat:wght@700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
</head>
<body>

  <nav class="nav">
    <div class="nav-inner">
      <a href="/" class="nav-logo">MATSIDE</a>
      <ul class="nav-links">
        <li><a href="/">Home</a></li>
        <li><a href="/#products">Products</a></li>
        <li><a href="/#tournaments">Tournaments</a></li>
        <li><a href="/#leadership">Leadership</a></li>
        <li><a href="/legal/">Legal</a></li>
        <li><a href="/#contact">Contact</a></li>
      </ul>
    </div>
  </nav>

  <main class="legal-prose">
    <h1>Terms of Service</h1>
    <div class="legal-meta">
      <strong>Last updated:</strong> 2026-06-22 &middot; <strong>Version:</strong> 1.0 &mdash; pending Sept 1, 2026 attorney review<br>
      <a href="/legal/">&larr; Back to Legal index</a>
    </div>

    <p>
      These Terms of Service (&ldquo;Terms&rdquo;) govern your use of products and services provided by <strong>Matside Wrestling Co.</strong> (&ldquo;Matside,&rdquo; &ldquo;we,&rdquo; &ldquo;our&rdquo;), a Pennsylvania single-member limited liability company headquartered in Glenshaw, PA. These Terms apply to our tournament-management services and to all five products in the Matside Software portfolio: <strong>MatRecruit</strong>, <strong>MatTime</strong>, <strong>MatPass</strong>, <strong>WrestleFA</strong>, and <strong>SignupSignin</strong>. Product-specific terms, where they exist, supplement (but do not replace) these corporate Terms.
    </p>

    <h2>1. Acceptance of Terms</h2>
    <p>By creating an account, accessing, or using any Matside product or service, you agree to be bound by these Terms. If you do not agree, do not use the service.</p>

    <h2>2. Eligibility</h2>
    <p>You must be at least 13 years old to create an account on any Matside product (subject to product-specific age gates that may apply higher thresholds). MatRecruit, in particular, is gated by class year to ensure users are at or near high-school age. Children under 13 may only have data on Matside services in the limited contexts described in our <a href="/legal/coppa.html">Children's Privacy / COPPA Policy</a>, where a parent or legal guardian has provided verifiable consent.</p>

    <h2>3. Accounts and Security</h2>
    <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use via <a href="mailto:support@matside.org">support@matside.org</a>.</p>

    <h2>4. Acceptable Use</h2>
    <p>You agree not to:</p>
    <ul>
      <li>Misrepresent your identity or affiliation</li>
      <li>Upload, post, or transmit any content that is unlawful, harassing, abusive, defamatory, vulgar, obscene, or otherwise objectionable</li>
      <li>Attempt to gain unauthorized access to any Matside system, other users' accounts, or any data not belonging to you</li>
      <li>Interfere with or disrupt the integrity, performance, or availability of any Matside product</li>
      <li>Use the service to send unsolicited bulk communications</li>
      <li>Scrape, harvest, or otherwise extract data from Matside services through automated means without our express written permission</li>
      <li>Reverse-engineer, decompile, or otherwise attempt to derive source code from any Matside product</li>
    </ul>

    <h2>5. Content You Provide</h2>
    <p>You retain ownership of any content you upload, post, or otherwise provide through Matside products (&ldquo;Your Content&rdquo;). You grant Matside a worldwide, non-exclusive, royalty-free license to host, store, reproduce, modify (only to format or display), and distribute Your Content solely to operate and improve the service. This license terminates when you delete Your Content, except where retention is required by law or where preservation is necessary for the service to function for other users.</p>

    <h2>6. Subscriptions and Billing</h2>
    <p>Certain Matside products require a paid subscription to access the full feature set:</p>
    <ul>
      <li><strong>MatRecruit:</strong> $9.99/month or $99/year individual; club tier $59/seat/year at 5+ seats (via Contact us). Subscriptions auto-renew until canceled. Trial period is 7 days with no credit card required at signup.</li>
      <li><strong>MatTime:</strong> pricing TBD; consult the MatTime product surface.</li>
      <li><strong>MatPass:</strong> pricing TBD; consult the MatPass product surface.</li>
      <li><strong>WrestleFA:</strong> per-event pricing ($99 Verified tournament board, $10 coach-led tournament board).</li>
      <li><strong>SignupSignin:</strong> free at present; subject to change.</li>
    </ul>
    <p>Refunds are handled on a case-by-case basis. To request a refund, contact <a href="mailto:support@matside.org">support@matside.org</a>. Tournament-management services are governed by separate written agreements between Matside and the contracting tournament director.</p>

    <h2>7. AI-Generated Content (MatRecruit)</h2>
    <p>MatRecruit includes an AI-powered recruiting-assistant feature that generates personalized next-steps recommendations based on your profile data and a curated recruiting-knowledge base. These recommendations are provided for informational purposes only and do not constitute professional advice, college-admissions guidance, or any guarantee about recruiting outcomes. You remain responsible for your own recruiting decisions.</p>

    <h2>8. Tournament Services</h2>
    <p>Matside's tournament-management services are provided as a contractor to the Tournament Director (TD) hosting each event. TDs are responsible for event-level general liability insurance, volunteer coordination, athlete eligibility verification, and all event-day operational decisions. Matside provides bracket management, scoring, and live-results infrastructure (powered by FloArena and USA Bracketing) under a separate written agreement with each TD.</p>

    <h2>9. Intellectual Property</h2>
    <p>Matside, the Matside wordmark, MatRecruit, MatTime, MatPass, WrestleFA, SignupSignin, and all associated logos and product names are trademarks of Matside Wrestling Co. All software, content, designs, and materials provided through Matside products are protected by copyright, trademark, and other intellectual-property laws. Nothing in these Terms grants you a license to use any Matside intellectual property except as expressly permitted.</p>

    <h2>10. Disclaimers</h2>
    <p>MATSIDE PRODUCTS AND SERVICES ARE PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE,&rdquo; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE.</p>

    <h2>11. Limitation of Liability</h2>
    <p>TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, MATSIDE'S TOTAL CUMULATIVE LIABILITY ARISING OUT OF OR RELATING TO THESE TERMS OR YOUR USE OF MATSIDE PRODUCTS WILL NOT EXCEED THE GREATER OF (A) ONE HUNDRED U.S. DOLLARS ($100), OR (B) THE TOTAL AMOUNTS YOU HAVE PAID TO MATSIDE IN THE TWELVE (12) MONTHS PRECEDING THE EVENT GIVING RISE TO THE CLAIM.</p>
    <p>NEITHER PARTY WILL BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES.</p>

    <h2>12. Termination</h2>
    <p>You may terminate your account at any time via the in-product deletion path or by emailing <a href="mailto:support@matside.org">support@matside.org</a>. Account deletion is reversible for 30 days; after that, it is permanent. We may suspend or terminate your access for material breach of these Terms, fraud, abuse, or as required by law, with notice where reasonably practicable.</p>

    <h2>13. Governing Law and Venue</h2>
    <p>These Terms are governed by the laws of the Commonwealth of Pennsylvania, without regard to its conflict-of-laws principles. Any dispute arising out of or relating to these Terms or your use of Matside products will be resolved exclusively in the state or federal courts located in Allegheny County, Pennsylvania, and you consent to the personal jurisdiction of those courts.</p>

    <h2>14. Class-Action Waiver</h2>
    <p>You and Matside agree that any dispute will be brought solely on an individual basis and not as a class, collective, or representative action. We do not require arbitration.</p>

    <h2>15. Changes to These Terms</h2>
    <p>We may update these Terms from time to time. The &ldquo;Last updated&rdquo; date at the top reflects the most recent change. Material changes will be announced via in-product notification or email where appropriate. Continued use of the service after changes take effect constitutes acceptance.</p>

    <h2>16. Contact</h2>
    <p>Questions about these Terms? Contact <a href="mailto:support@matside.org">support@matside.org</a>.</p>

  </main>

  <footer class="footer">
    <div class="section-inner">
      <div class="footer-corporate">
        <strong>Matside Wrestling Co.</strong> &mdash; Pennsylvania single-member LLC, headquartered in Glenshaw, PA<br>
        Contact: <a href="mailto:support@matside.org">support@matside.org</a><br>
        &copy; 2026 Matside Wrestling Co. All rights reserved.
      </div>
    </div>
  </footer>

</body>
</html>
```

- [ ] **Step 2: Cross-check against the MatRecruit Terms source.** If product-level Terms contain specific clauses (e.g., AI-disclaimer language, refund framing, class-action specifics), confirm the corporate version above is consistent. The corporate Terms above are written to mirror MatRecruit's existing posture (PA governing law, $100/12-month liability cap, class-action waiver, no arbitration).

- [ ] **Step 3: Browser-verify.** Open `legal/terms.html`. All 16 sections render.

---

## Task 13: Create `legal/coppa.html` (corporate adaptation + Six-Step framing)

**Files:**
- Create: `legal/coppa.html`
- Reference: `matrecruit/docs/legal/MatRecruit-Children-Privacy-Policy-v1.md` and `matside-hq/planning/coppa-six-step-self-audit-v1.md`

- [ ] **Step 1: Read the COPPA self-audit source for the structural-exclusion framing.** Open `matside-hq/planning/coppa-six-step-self-audit-v1.md` and locate the per-product determinations (only WrestleFA materially in scope; MatRecruit excluded by class-year gate; MatTime coach-only; MatPass + SignupSignin rely on adult-input-data-about-child).

- [ ] **Step 2: Create `legal/coppa.html` with the standard shell + this corporate body:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Children's Privacy / COPPA Policy · Matside Wrestling Co.</title>
  <meta name="description" content="How Matside Wrestling Co. addresses the Children's Online Privacy Protection Act (COPPA) across each Matside product.">
  <meta name="robots" content="index,follow">
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <link rel="stylesheet" href="/style.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Montserrat:wght@700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
</head>
<body>

  <nav class="nav">
    <div class="nav-inner">
      <a href="/" class="nav-logo">MATSIDE</a>
      <ul class="nav-links">
        <li><a href="/">Home</a></li>
        <li><a href="/#products">Products</a></li>
        <li><a href="/#tournaments">Tournaments</a></li>
        <li><a href="/#leadership">Leadership</a></li>
        <li><a href="/legal/">Legal</a></li>
        <li><a href="/#contact">Contact</a></li>
      </ul>
    </div>
  </nav>

  <main class="legal-prose">
    <h1>Children's Privacy / COPPA Policy</h1>
    <div class="legal-meta">
      <strong>Last updated:</strong> 2026-06-22 &middot; <strong>Version:</strong> 1.0 &mdash; pending Sept 1, 2026 attorney review<br>
      <a href="/legal/">&larr; Back to Legal index</a>
    </div>

    <p>
      <strong>Matside Wrestling Co.</strong> takes the privacy of children seriously. This policy explains how the Children's Online Privacy Protection Act (&ldquo;COPPA&rdquo;) applies to each of our products and what we do to comply with it. Matside has conducted a formal Six-Step COPPA self-audit (per the FTC's recommended methodology) across all five products in the Matside Software portfolio; the full audit is documented at <a href="https://github.com/matsidewrestlingco-netizen/matside-hq/blob/main/planning/coppa-six-step-self-audit-v1.md" target="_blank" rel="noopener">matside-hq/planning/coppa-six-step-self-audit-v1.md</a>.
    </p>

    <h2>Summary of COPPA Scope by Product</h2>
    <p>Matside's COPPA posture differs by product. The summary below explains why each product is in or out of scope:</p>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 2rem;">
      <thead>
        <tr>
          <th style="text-align: left; padding: 0.625rem; border-bottom: 1px solid var(--border); color: var(--white); font-weight: 600;">Product</th>
          <th style="text-align: left; padding: 0.625rem; border-bottom: 1px solid var(--border); color: var(--white); font-weight: 600;">COPPA Status</th>
          <th style="text-align: left; padding: 0.625rem; border-bottom: 1px solid var(--border); color: var(--white); font-weight: 600;">Why</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding: 0.625rem; border-bottom: 1px solid var(--border);">MatRecruit</td>
          <td style="padding: 0.625rem; border-bottom: 1px solid var(--border);">Out of scope</td>
          <td style="padding: 0.625rem; border-bottom: 1px solid var(--border);">Class-year gate excludes accounts for users younger than rising 9th grade. Account creation is structurally not available to children under 13.</td>
        </tr>
        <tr>
          <td style="padding: 0.625rem; border-bottom: 1px solid var(--border);">MatTime</td>
          <td style="padding: 0.625rem; border-bottom: 1px solid var(--border);">Out of scope</td>
          <td style="padding: 0.625rem; border-bottom: 1px solid var(--border);">Account holders are adult coaches only. Wrestlers and parents do not have accounts in MatTime. No personal information is collected from children.</td>
        </tr>
        <tr>
          <td style="padding: 0.625rem; border-bottom: 1px solid var(--border);">MatPass</td>
          <td style="padding: 0.625rem; border-bottom: 1px solid var(--border);">Out of scope (processor model)</td>
          <td style="padding: 0.625rem; border-bottom: 1px solid var(--border);">Account holders are adult coaches, program administrators, and parents. Athlete records are input by adults about minor athletes; Matside acts as a data processor for the wrestling program, which is the data controller. School-affiliated programs may impose FERPA obligations that supersede defaults.</td>
        </tr>
        <tr>
          <td style="padding: 0.625rem; border-bottom: 1px solid var(--border);">SignupSignin</td>
          <td style="padding: 0.625rem; border-bottom: 1px solid var(--border);">Out of scope</td>
          <td style="padding: 0.625rem; border-bottom: 1px solid var(--border);">Self-only signup model. Account holders are adult volunteers and event organizers. No mechanism exists for an adult to create or register an account on behalf of a child.</td>
        </tr>
        <tr>
          <td style="padding: 0.625rem;">WrestleFA</td>
          <td style="padding: 0.625rem; color: var(--accent-bright); font-weight: 600;">In scope</td>
          <td style="padding: 0.625rem;">WrestleFA's core data model involves data about minor wrestlers (free-agent listings). Parents post listings describing their wrestlers; coaches and tournament directors view those listings.</td>
        </tr>
      </tbody>
    </table>

    <h2>WrestleFA: COPPA Compliance in Detail</h2>
    <p>Because WrestleFA is the only Matside product where COPPA materially applies, this section describes our compliance posture in detail.</p>

    <h3>The data we collect about minors</h3>
    <p>WrestleFA collects only the data necessary to operate the free-agent board: wrestler first name and last initial, age group, weight class, hometown / state, parent/guardian contact information, and (optionally) parent-provided commentary. We do not collect: full date of birth (only age group), street address (only state), school name, photographs, or any unique identifier beyond a randomly assigned database ID.</p>

    <h3>Parental consent</h3>
    <p>WrestleFA requires parental consent before a wrestler profile becomes visible to non-parent users (coaches, tournament directors). Our consent mechanism is currently &ldquo;email plus&rdquo; (per FTC guidance), implemented with versioned consent records and a database-layer Row-Level Security policy that hides wrestler profiles from non-parent users unless their consent record matches the current consent text version. A policy text bump forces re-consent before disclosure is re-enabled.</p>
    <p>We are working with a Safe Harbor program (an FTC-approved COPPA Safe Harbor) to confirm that this consent mechanism is appropriate for WrestleFA's specific disclosure pattern. The Safe Harbor engagement is in progress as of June 2026.</p>

    <h3>Parental rights</h3>
    <p>Parents of children with data in WrestleFA can:</p>
    <ul>
      <li><strong>Review</strong> their child's data by signing in</li>
      <li><strong>Refuse to permit further collection or use</strong> by deleting their account or revoking consent</li>
      <li><strong>Request deletion</strong> of all data about their child via the in-product deletion path or by emailing <a href="mailto:support@matside.org">support@matside.org</a></li>
    </ul>
    <p>Account deletion is reversible for 30 days; after that, all child-related data is permanently deleted.</p>

    <h3>No third-party tracking</h3>
    <p>WrestleFA's wrestler-profile pages carry <strong>zero</strong> third-party trackers (no analytics, no advertising, no marketing pixels, no behavioral profiling). This is verified by Matside's <a href="https://github.com/matsidewrestlingco-netizen/matside-hq/blob/main/docs/legal/third-party-tracker-inventory-v1.md" target="_blank" rel="noopener">cross-product tracker inventory</a> (2026-06-19). The page renders with no third-party requests beyond the same-origin application code itself.</p>

    <h3>Disclosures to third parties</h3>
    <p>WrestleFA does not sell, rent, or otherwise transfer information about children to third parties for marketing purposes. The only third-party processors that touch WrestleFA data are: Supabase (database + auth), Vercel (hosting), Resend (parent-facing transactional email), and Square (payment for the $99 verified-tournament-board and $10 coach-led-tournament-board SKUs). Each processor operates under a Data Processing Agreement.</p>

    <h2>Other Products: Structural-Exclusion Detail</h2>

    <h3>MatRecruit</h3>
    <p>MatRecruit's onboarding flow enforces a class-year gate that excludes any user who is younger than rising 9th grade (typically age 13-14). The class-year window is documented in our COPPA scope-determination memo at <a href="https://github.com/matsidewrestlingco-netizen/matrecruit/blob/main/docs/legal/coppa-scope-determination.md" target="_blank" rel="noopener">matrecruit/docs/legal/coppa-scope-determination.md</a>. We do not collect date of birth and we frame eligibility positively (&ldquo;you must be in the eligible class-year window&rdquo;) rather than as a minimum-age gate (&ldquo;you must be 13+&rdquo;) to maintain the structural exclusion under the COPPA definition.</p>

    <h3>MatTime</h3>
    <p>MatTime is a coach-only product. Wrestlers and parents do not create MatTime accounts. Coaches book their own privates schedule and manage their own client lists. No personal information is collected from children. Coach-account holders self-attest to being adult professionals.</p>

    <h3>MatPass</h3>
    <p>MatPass is a wrestling-program compliance tool. Account holders are program staff (coaches, administrators) and parents of athletes. The data model is &ldquo;adult-input-data-about-child&rdquo;: athlete records are created and maintained by adult program staff; data about minors is provided by the adult input layer, not by children themselves. Matside operates as a data processor for the wrestling program; the program is the data controller and is responsible for parental notice and consent under FERPA where applicable. Our processor model is documented in our COPPA scope-determination memo at <a href="https://github.com/matsidewrestlingco-netizen/matpass-app/blob/main/docs/legal/coppa-scope-determination.md" target="_blank" rel="noopener">matpass-app/docs/legal/coppa-scope-determination.md</a>.</p>

    <h3>SignupSignin</h3>
    <p>SignupSignin enforces a self-only signup model: each account is for the person creating it, with no mechanism to register or sign up a child. Account holders are adult volunteers and event organizers. Our COPPA scope-determination memo for SignupSignin is at <a href="https://github.com/matsidewrestlingco-netizen/signupsignin-web-/blob/main/docs/legal/coppa-scope-determination.md" target="_blank" rel="noopener">signupsignin-web-/docs/legal/coppa-scope-determination.md</a>.</p>

    <h2>Direct Notice to Parents</h2>
    <p>For WrestleFA specifically, the in-product consent flow provides direct notice to parents covering each of the seven §312.4(c) elements required by COPPA: (1) the operator's name and contact information, (2) the types of personal information collected, (3) the operator's practices for use and disclosure, (4) that the parent's consent is required, (5) that the operator must terminate access if consent is not provided, (6) the parent's right to review and delete the information, and (7) the operator's procedures to ensure confidentiality, security, and integrity of the information collected. The exact consent text is versioned in our database and a parent's consent of record matches a specific version; if we materially update the consent text, parents are required to re-consent before disclosure resumes.</p>

    <h2>Contact</h2>
    <p>
      If you are a parent and have questions about your child's data on any Matside product, or if you wish to review, correct, or delete data about your child, contact <a href="mailto:support@matside.org">support@matside.org</a>. We respond to verified parental requests within 30 days.
    </p>

    <h2>Changes to This Policy</h2>
    <p>
      We will update this policy as our COPPA posture evolves &mdash; in particular, as the Safe Harbor engagement for WrestleFA progresses and as the bundled Sept 1, 2026 attorney review of all Matside legal documents takes place. The &ldquo;Last updated&rdquo; date at the top reflects the most recent change. Material changes affecting parental consent will trigger an in-product re-consent flow for affected users.
    </p>

  </main>

  <footer class="footer">
    <div class="section-inner">
      <div class="footer-corporate">
        <strong>Matside Wrestling Co.</strong> &mdash; Pennsylvania single-member LLC, headquartered in Glenshaw, PA<br>
        Contact: <a href="mailto:support@matside.org">support@matside.org</a><br>
        &copy; 2026 Matside Wrestling Co. All rights reserved.
      </div>
    </div>
  </footer>

</body>
</html>
```

- [ ] **Step 3: Cross-check against the COPPA self-audit.** Open `matside-hq/planning/coppa-six-step-self-audit-v1.md` and confirm the per-product determinations in the table above match the audit's findings. If the audit calls out any nuance not reflected above, fold it in.

- [ ] **Step 4: Browser-verify.** Open `legal/coppa.html`. All sections render; the scope table renders correctly; all the per-product cross-references resolve.

---

## Task 14: Verification — link check + mobile viewport + duplicate-ID sweep

**Files:** none modified.

- [ ] **Step 1: Manual link check across all 7 HTML files** (index.html + 6 legal pages). For each, walk every `<a href="...">` and confirm:
  - Internal anchors (`#products`, `#tournaments`, `#leadership`, `#contact`, `#about`) resolve to elements that exist on the homepage
  - Absolute internal links (`/legal/privacy.html`, `/legal/terms.html`, etc.) resolve to files that exist in the repo
  - External product-site links (`matrecruit.org`, `matsidetime.org`, `matpass.org`, `wrestlefa.org`, `signupsignin.com`) are reachable
  - External GitHub links (`github.com/matsidewrestlingco-netizen/...`) point to existing files
  - All `mailto:` links carry the correct address (`support@matside.org`, `daniel@matside.org`, `mason@matside.org`)
  - Zero remaining instances of `matsidewrestlingco@gmail.com` on any customer-facing surface

Grep-based confirmation from repo root:
```bash
grep -rn "matsidewrestlingco@gmail.com" index.html legal/*.html
```
Expected: zero matches.

```bash
grep -rn "MatSide Systems\|matsidesystems.com" index.html legal/*.html
```
Expected: zero matches.

- [ ] **Step 2: Duplicate-ID sweep on every HTML file.** Open each in devtools and run:
```js
const ids = [...document.querySelectorAll('[id]')].map(e => e.id);
const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
console.log('Duplicate IDs:', dupes);
```
Expected on each page: `[]`.

- [ ] **Step 3: Mobile viewport pass.** Open `index.html` in browser devtools at 375px (iPhone), 768px (iPad), 1280px (desktop). For each viewport, walk through:
  - Hero renders without horizontal scroll
  - About paragraph readable
  - Products grid collapses cleanly (5 cards → wraps to 2-up at tablet, 1-up at mobile)
  - Leadership 2-card → 1-column at <760px
  - Tournament tables remain horizontally scrollable within their wrapper (existing `.events-table-wrap` overflow)
  - Contact section centers correctly
  - Footer legal-links row wraps cleanly

Then open `legal/privacy.html` (representative for the legal surface) at the same viewports. Verify the `.legal-prose` container constrains text width on desktop and uses full width on mobile.

- [ ] **Step 4: Title casing sweep.** Confirm `MatSide` (camelcase variant) does not appear anywhere on the customer-facing surface:
```bash
grep -rn "MatSide" index.html legal/*.html
```
Expected: zero matches. (The brand wordmark on the page is stylized "MATSIDE" in nav and footer; that's all-caps not camelcase, and is rendered as text styling not as a literal "MatSide" string.)

---

## Task 15: Atomic commit + push (matside.org)

**Files:** none modified beyond Tasks 1–13 output.

- [ ] **Step 1: Confirm git state.** Run from repo root:
```bash
cd /Users/emmons_house/Desktop/Matside\ Software/matside.org
git status --short
```
Expected: `M index.html`, `M style.css`, and 6 untracked legal files. Plus the spec + plan from earlier commits (already committed and pushed). No other modifications.

- [ ] **Step 2: Stage exactly the rewrite files.** Run:
```bash
git add index.html style.css legal/index.html legal/privacy.html legal/terms.html legal/coppa.html legal/information-security.html legal/retention.html
```

- [ ] **Step 3: Verify staged diff.** Run:
```bash
git diff --cached --stat
```
Expected: 2 modified files (index.html, style.css) + 6 created files (legal/*.html).

- [ ] **Step 4: Commit with spec-defined message.**
```bash
git commit -m "$(cat <<'EOF'
feat(homepage): corporate-credibility rewrite + /legal/* surface for Safe Harbor + insurance review

Restructures matside.org from a tournament-services splash to a full
corporate-site shape. Adds About / Software Portfolio (5-card) /
Leadership sections; refreshes Tournaments services blurb; preserves
the two tournament schedule tables intact; updates Footer with formal
corporate identity. Drops the dormant MatSide Systems product card.
Updates Contact paths to the 2026-06-21 email-convention pattern
(support@matside.org for inbound; daniel@/mason@ for direct, exposed
only on leadership cards).

Adds /legal/* surface with five standalone HTML pages (Privacy, Terms,
COPPA, Information Security Program, Data Retention Policy) plus a
directory index, derived from the corporate-level markdown sources in
matside-hq/docs/legal/. All documents marked v1, pending Sept 1, 2026
attorney review.

Bundled bug fixes: duplicate IDs (events, services), malformed CTA
section (orphan </div>), deprecated <center> tags inside product
cards, missing metadata (description / OG / Twitter Card / favicon),
title casing.

Visual language unchanged - Steel Blue accent preserved. New sections
styled to match existing language. Adds Montserrat for display
headings (Inter remains body); no other typography changes.

Spec: docs/superpowers/specs/2026-06-22-matside-org-corporate-credibility-rewrite.md
Plan: docs/superpowers/plans/2026-06-22-matside-org-corporate-credibility-rewrite.md

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 5: Push.**
```bash
git push
```
Expected: pushes to `origin/main` cleanly. GitHub Pages will auto-deploy within 1-2 minutes.

- [ ] **Step 6: Confirm via `git log`.**
```bash
git log --oneline -3
```
Expected: top entry is the rewrite commit; second entry is the plan commit; third entry is the spec commit.

- [ ] **Step 7: Post-push live verification** (after ~2 min for GitHub Pages deploy):
  - Hit `https://www.matside.org` in a fresh browser tab. Walk every section.
  - Hit `https://www.matside.org/legal/` and verify the directory page renders.
  - Click through each of the 5 legal page links from the directory.
  - Click each legal-page link in the homepage footer.
  - Paste `https://www.matside.org` into a Slack DM or Linear comment and confirm the OG preview renders with brand thumbnail + description.
  - Run the URL through `https://www.opengraph.xyz/` for OG validation.

---

## Task 16: Bookkeeping in matside-hq

**Files:**
- Modify: `matside-hq/matside-hq/engineering/active-projects.md` (prepend a 2026-06-22 third-ship-of-day status block)
- Modify: `matside-hq/matside-hq/engineering/dev-backlog.md` (file 2 new Backlog items: orphan-file cleanup + Claude Design follow-up pass)
- Modify: `matside-hq/matside-hq/chief-of-staff/priority-stack.md` (add 2026-06-22 third-ship-of-day Recently Completed entry)

Working from `/Users/emmons_house/Desktop/Matside HQ/matside-hq/matside-hq/`.

- [ ] **Step 1: Update `engineering/active-projects.md`.** Replace the top `**Last updated:** 2026-06-22 (Mon — ...` line with a new entry documenting today's third ship:

```markdown
**Last updated:** 2026-06-22 (Mon — **THREE shipped today: profile-edit rebrand + Playwright drift cleanup + matside.org corporate-credibility rewrite.** matside.org rewrite: full structural rewrite of the homepage (`index.html`) from a tournament-services splash into a corporate-site shape — added About / 5-card Software Portfolio / Leadership / Get-in-touch sections; refreshed Tournaments with current services blurb; preserved both schedule tables intact; dropped dormant MatSide Systems product card; updated contact paths to the 2026-06-21 email-convention pattern (support@matside.org inbound, daniel@/mason@ on leadership cards only). Added `/legal/*` surface with 6 standalone HTML pages (index + Privacy + Terms + COPPA + Information Security Program + Data Retention Policy), derived from corporate-level markdown in `matside-hq/docs/legal/`. All v1, pending Sept 1, 2026 attorney review. Bundled bug fixes: duplicate IDs on events + services, malformed CTA section, deprecated `<center>` tags, missing meta description / Open Graph / Twitter Card / favicon, title casing. Visual language unchanged — Steel Blue accent preserved per the parent Matside Brand System; Montserrat added for display headings (Inter remains body). Single atomic commit on matside.org `main`. Driver: Safe Harbor reviewers (PRIVO + kidSAFE) and any insurance broker who lands on matside.org during underwriting now see a credible corporate surface with the legal documents they need to evaluate. **Earlier today: MatRecruit profile-edit rebrand `3efb840` + Playwright drift cleanup `8cfb2aa`.**
```

(Then preserve the existing "Prior:" chain unchanged.)

- [ ] **Step 2: Update `engineering/dev-backlog.md`.** Add two new Backlog items near the top of the `## 📋 Backlog` section:

```markdown
- **matside.org — orphan-file cleanup** *(logged 2026-06-22)*. Three orphan HTML files at the repo root (`broadcast.html`, `todo.html`, `userstoryflow.html`) are internal scratch / planning pages, not linked from the homepage. They're technically reachable if someone knows the URL. Three options: (a) delete them entirely, (b) move them to a non-public-facing location (e.g., a private gist or matside-hq), (c) add `<meta name="robots" content="noindex,nofollow">` to each and leave in place. Recommended: (a) or (b). Also worth a noindex audit pass on `wt/*` (wrestling ticker utility) and `brand/brandsystem.html` (brand system showcase) for the same reason. **Lift estimate:** 15-30 min depending on choice. Not on Sept 1 critical path.

- **matside.org — Claude Design visual follow-up pass** *(logged 2026-06-22)*. Daniel may send matside.org to Claude Design after the corporate-credibility content rewrite ships, for a once-over of typography spacing, hero treatment, leadership-card visual hierarchy, and any other polish opportunities. The current rewrite stays strictly inside the existing visual language (Steel Blue accent, Inter + Montserrat fonts, dark canvas). A Claude Design pass might reshape sections without changing content. **Lift estimate:** Daniel-direct engagement with Claude Design, no Matside engineering time required.
```

- [ ] **Step 3: Flip Recently Shipped entry.** Add at the top of `## 🟢 Recently Shipped`:

```markdown
### matside.org — corporate-credibility rewrite shipped 2026-06-22 (Mon — third ship of the day)

Single atomic commit on matside.org `main`. Full structural rewrite of the homepage from a tournament-services splash into a corporate-site shape — added About / 5-card Software Portfolio (MatRecruit / MatTime / MatPass / WrestleFA / SignupSignin) / Leadership (Daniel + Mason Manville) / Get-in-touch sections; refreshed Tournaments services blurb; preserved both 2025-26 and 2026-27 schedule tables exactly; dropped dormant MatSide Systems product card; updated contact paths to the 2026-06-21 email-convention pattern (support@matside.org inbound; daniel@/mason@ exposed only on leadership cards).

Added `/legal/*` surface with 6 standalone HTML pages: directory index + Privacy + Terms + COPPA + Information Security Program + Data Retention Policy. ISP and Retention are direct ports from `matside-hq/docs/legal/`; Privacy / Terms / COPPA are corporate-level adaptations of the MatRecruit product-level versions, expanded to describe Matside Wrestling Co. as the operator across all five products. All documents marked v1.0, pending Sept 1, 2026 attorney review. COPPA page surfaces the structural-exclusion findings from the COPPA Six-Step self-audit verbatim.

Bundled bug fixes: duplicate `id="events"` on both schedule sections; duplicate `id="services"` on Services section + bottom CTA; malformed `<section class="services" id="services"></div>` (orphan closing div); deprecated `<center>` tags inside `.product-card`; missing meta description; missing Open Graph + Twitter Card metadata; missing favicon `<link>`; title casing (`MatSide` → `Matside`).

Visual language unchanged. Steel Blue accent (`--accent: #3d82c4`) preserved per the parent Matside Brand System. Montserrat added for display headings (Inter remains body); no other typography changes. New CSS rules appended to `style.css` for the new sections + the `.legal-prose` container; zero existing rules touched.

Spec: `matside.org:docs/superpowers/specs/2026-06-22-matside-org-corporate-credibility-rewrite.md`. Plan: `matside.org:docs/superpowers/plans/2026-06-22-matside-org-corporate-credibility-rewrite.md`.

**Driver:** Safe Harbor reviewers (PRIVO + kidSAFE), commercial GL insurance broker (pending outreach), and the Sept 1 bundled lawyer review all land on matside.org during evaluation. The prior splash did not give them enough information to corroborate the operator's claims; the rewrite does.

**Open follow-ups (filed separately above):** orphan-file cleanup (`broadcast.html` / `todo.html` / `userstoryflow.html`), Claude Design visual once-over.
```

- [ ] **Step 4: Update `chief-of-staff/priority-stack.md`.** Add a new entry at the top of `## Recently Completed`:

```markdown
- **2026-06-22 (Mon, third ship of the day) — matside.org corporate-credibility rewrite SHIPPED.** Single atomic commit on matside.org `main`. Full restructure of the homepage from a tournament-services splash into a corporate-site shape (About / 5-card Software Portfolio / Tournaments with preserved schedule tables / Leadership / Get-in-touch / formal corporate Footer). Adds `/legal/*` surface with 6 standalone HTML pages (directory + Privacy + Terms + COPPA + ISP + Retention) derived from `matside-hq/docs/legal/`. Drops dormant MatSide Systems product card. Updates contact paths to the 2026-06-21 email-convention pattern. Bundled bug fixes for duplicate IDs, malformed CTA, deprecated tags, missing metadata. Visual language unchanged (Steel Blue accent preserved). All legal docs marked v1 pending Sept 1 attorney review. **Driver:** Safe Harbor (PRIVO + kidSAFE) + insurance broker + Sept 1 lawyer all land on matside.org during evaluation; the prior splash did not corroborate operator claims, the rewrite does.
```

- [ ] **Step 5: Commit + push matside-hq.** Run from `/Users/emmons_house/Desktop/Matside HQ/matside-hq/matside-hq/`:

```bash
git add engineering/active-projects.md engineering/dev-backlog.md chief-of-staff/priority-stack.md
git commit -m "$(cat <<'EOF'
bookkeeping: matside.org corporate-credibility rewrite shipped

Third ship of the day. matside.org full structural rewrite of homepage
+ new /legal/* surface (6 pages). Drives Safe Harbor + insurance +
Sept 1 lawyer review credibility. All legal v1, pending Sept 1
attorney review.

Changes:
- engineering/active-projects.md: prepend 2026-06-22 third-ship-of-day
  status block documenting the matside.org rewrite + the two earlier
  ships (profile-edit rebrand 3efb840 + Playwright cleanup 8cfb2aa).
- engineering/dev-backlog.md:
  - flip matside.org rewrite to Recently Shipped with full breakdown
  - file new Backlog items: orphan-file cleanup, Claude Design
    visual follow-up pass
- chief-of-staff/priority-stack.md: add 2026-06-22 third-ship-of-day
  entry at top of Recently Completed.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
git push
```

- [ ] **Step 6: Confirm matside-hq state.**
```bash
git log --oneline -3
git status --short
```
Expected: top entry is the new bookkeeping commit; working tree clean.

---

## Self-Review Notes

**Spec coverage:** Every requirement from the spec maps to at least one task:
- New CSS rules → Task 1
- `<head>` metadata (title casing, description, OG, Twitter Card, favicon, Montserrat) → Task 2
- Nav + Hero + About → Task 3
- Tournaments restructure (preserve tables, fix duplicate IDs, add blurb, move CTA inside) → Task 4
- Products section (5-card, drop MatSide Systems, status badges, deprecated `<center>` fix) → Task 5
- Leadership section (Daniel + Mason Manville, initials avatars, placeholder bios, personal emails) → Task 6
- Contact + Footer (single support@ lane, legal-links row, formal corporate identity, copyright 2026) → Task 7
- `/legal/index.html` directory page → Task 8
- ISP port → Task 9
- Retention port → Task 10
- Corporate Privacy → Task 11
- Corporate Terms → Task 12
- Corporate COPPA → Task 13
- Verification (link check, mobile, duplicate-ID, title casing) → Task 14
- Atomic commit + push (matside.org) → Task 15
- matside-hq bookkeeping → Task 16

**Placeholder scan:** Bio placeholders are explicit in the task (`Bio coming soon.` with `.placeholder` class) and tracked in the spec's Open items table — appropriate. No TBDs, no "implement later," no "add validation," no "similar to Task N" without code.

**Type consistency:** All CSS class names referenced in the HTML tasks (Tasks 3–13) are defined in Task 1's CSS append. Verified: `.about`, `.leadership`, `.leadership-grid`, `.leader-card`, `.leader-avatar`, `.leader-name`, `.leader-title`, `.leader-bio`, `.leader-bio.placeholder`, `.leader-credential`, `.leader-email`, `.product-status`, `.product-status.live`, `.product-status.launching`, `.product-status.coming-soon`, `.contact`, `.contact-email`, `.contact-direct`, `.footer-legal`, `.footer-corporate`, `.legal-prose`, `.legal-index`, `.legal-index-item` — all defined in Task 1. The deprecated-center fix (`.product-card img { display: block; margin: 0 auto; }`) is also in Task 1.

**Granularity check:** Each task is one section or one logical chunk. Each step is one action (~2-5 min). Single atomic commit at Task 15 per the spec.
