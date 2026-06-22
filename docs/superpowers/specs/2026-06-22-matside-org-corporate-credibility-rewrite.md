# matside.org — Corporate Credibility Rewrite

**Date:** 2026-06-22
**Status:** Approved — ready for implementation plan
**Scope:** Single repo (`matsidewrestlingco-netizen/matside.org`); plain HTML/CSS; ~half-day to full-day effort
**Audience:** Safe Harbor reviewers (PRIVO, kidSAFE), commercial insurance broker(s), Sept 1 bundled lawyer review, and any third party who lands on matside.org as part of evaluating Matside Wrestling Co. as an operator
**Stack:** Plain HTML + CSS, no JS framework. GitHub Pages hosting via CNAME (`www.matside.org`)

---

## Why now

matside.org is now load-bearing for external evaluation. As of 2026-06-22:

- C8 Safe Harbor outreach went out 2026-06-21 to PRIVO and kidSAFE — both will land on matside.org as part of vetting Matside Wrestling Co. as a counterparty. PRIVO's substantive reply is expected today/this week.
- Commercial GL insurance broker outreach is on the priority stack as a Step 9.5 hard-gate dependency for MatTime — the broker will land on matside.org during underwriting.
- Sept 1 bundled lawyer + insurance review will reference matside.org as the operator's public surface.

The current page is thin: tagline + 2 tournament-schedule tables + 3 services (one of which — Merchandising — isn't a current Matside offering) + 2 products (one of which — MatSide Systems — is dormant internal tooling) + a single Gmail contact. There is no About, no leadership, no legal surface, and no mention of the four V1 products (MatRecruit / MatTime / MatPass / WrestleFA) the Safe Harbor outreach is specifically about. **A Safe Harbor reviewer landing on matside.org today would not be able to corroborate the operator's claim of running a software portfolio.**

## What success looks like

A Safe Harbor reviewer or insurance underwriter who lands on matside.org should be able to answer, within 60 seconds, every one of:

- Who operates Matside Wrestling Co.? (Daniel Emmons, single-member LLC, PA-based)
- What does the company do? (Tournament operations + a software portfolio; both pillars named)
- What products does Matside operate? (5 products listed with status + dedicated URL for each)
- Is there evidence of operational tenure on the tournament side? (Yes — past + upcoming schedules with real dates, venues, FloArena/USA Bracketing links)
- Is there a legal surface? (Yes — Privacy, Terms, COPPA, ISP, Retention all linked, with attorney-review timeline disclosed)
- How do I reach them? (`support@matside.org` for inbound; named leaders with personal emails on leadership cards)
- Are they a credible operator? (Daniel listed as USA Bracketing Expert — third-party industry credential, not self-description)

After this rewrite, every one of those is answerable from a single scroll-through.

## Out of scope (explicit non-goals)

- **No migration to Next.js.** The site stays on plain HTML + CSS + GitHub Pages. Migration is logged as a separate backlog item.
- **No visual polish from Claude Design.** The styling stays in the existing language (Steel Blue accent, Inter body, dark canvas). A Claude Design follow-up pass is anticipated and welcomed but is logged as a separate backlog item.
- **No cleanup of orphan HTML files** (`broadcast.html`, `todo.html`, `userstoryflow.html`, `wt/*`, `brand/brandsystem.html`). These are internal scratch / utility pages, not linked from the homepage. Logged as a separate backlog item to either delete, move, or `noindex`.
- **No analytics / cookies / trackers added.** Cleaner COPPA + GDPR posture by deliberately not adding any. The current page has zero trackers per the 2026-06-19 cross-product tracker inventory; this rewrite preserves that posture.
- **No Sept 1 attorney redline integration** on the legal pages. Documents are marked v1 with a "pending Sept 1, 2026 attorney review" line. Redline integration is a separate mechanical paste step after the bundled review.
- **No build pipeline** (no Markdown → HTML build step, no static-site generator). Legal pages are hand-tuned HTML derived once from the markdown sources in `matside-hq/docs/legal/`; sync is manual on the rare occasions the markdown source changes.

## Architecture

### Site map

Two top-level surfaces:

**`/` (index.html)** — single-page corporate homepage with anchored sections, in order:

1. **Nav** — `Home · Products · Tournaments · Leadership · Legal · Contact`
2. **Hero** — wordmark image + tagline ("Tournament operations and software for the wrestling community.") + 2 CTAs (Explore products, See schedule)
3. **About** — single paragraph (~80 words) introducing Matside Wrestling Co.
4. **Products** — 5-card grid linking to each dedicated product site
5. **Tournaments** — refreshed services blurb + the two existing schedule tables (preserved exactly) + a tournament-management CTA
6. **Leadership** — 2-card grid (Daniel, Mason) with headshot/initials avatar + name + title + bio + personal email
7. **Get in touch** — single customer-facing email lane (`support@matside.org`) with reference to leadership cards for direct contact
8. **Footer** — formal corporate identity (entity, registered location, support email, legal links, copyright 2026)

**`/legal/` (legal surface)** — six standalone HTML pages:

- `legal/index.html` — directory page listing all five legal documents + last-updated dates + version numbers + the "Documents marked v1 are pending Sept 1, 2026 attorney review" disclaimer
- `legal/privacy.html` — corporate-level Privacy Policy
- `legal/terms.html` — corporate-level Terms of Service
- `legal/coppa.html` — corporate-level Children's Privacy / COPPA Policy
- `legal/information-security.html` — Information Security Program (direct port of `matside-hq/docs/legal/matside-isp-v1.md`)
- `legal/retention.html` — Data Retention Policy (direct port of `matside-hq/docs/legal/retention-policy-v1.md`)

Each legal page uses the same shared nav and footer as the homepage so visitors stay within the matside.org brand context.

### Files modified or created

| File | Action | Notes |
|---|---|---|
| `index.html` | Modify | Full structural rewrite preserving tournament tables; net result is a longer, more substantive homepage |
| `style.css` | Append | New CSS rules at the bottom of the file for the new sections + the `.legal-prose` container. **No existing rules touched.** |
| `legal/index.html` | Create | Directory page |
| `legal/privacy.html` | Create | Corporate Privacy Policy |
| `legal/terms.html` | Create | Corporate Terms of Service |
| `legal/coppa.html` | Create | Corporate Children's Privacy / COPPA Policy |
| `legal/information-security.html` | Create | ISP port |
| `legal/retention.html` | Create | Retention policy port |

### Files untouched

- `broadcast.html`, `todo.html`, `userstoryflow.html` — orphan internal pages; out of scope
- `wt/*` — wrestling-ticker utility; out of scope
- `brand/*` — brand system showcase; out of scope
- `assets/*` — images and JSON templates; out of scope (the hero logo `mswc.png` continues to be referenced as-is)
- `CNAME` — `www.matside.org` continues to point at GitHub Pages, no DNS changes

## Homepage content design

### Nav

```
Home · Products · Tournaments · Leadership · Legal · Contact
```

Replaces the current 3-link nav (`Events · Services · Contact`). All anchors are in-page except `Legal` which goes to `/legal/`.

### Hero

Wordmark image (`assets/images/mswc.png`, unchanged) above a single-line tagline:

> *Tournament operations and software for the wrestling community.*

CTAs below: "Explore our products" (→ `#products`) and "See our schedule" (→ `#tournaments`).

### About

New section, single paragraph (~80 words):

> Matside Wrestling Co. is a Western Pennsylvania-based wrestling business operating across two pillars: full-service **tournament management** for high-school, junior-high, and youth wrestling events, and **Matside Software** — a portfolio of purpose-built products for the wrestling community. Founded and operated by Daniel Emmons ([USA Bracketing Expert](https://www.usabracketing.com/experts)), Matside is a wrestling-native operator — not a generic event-management firm with a wrestling product line, but a wrestling person building tools and running events for the sport from the inside.

### Products

5-card grid. **MatSide Systems is intentionally dropped** — it's dormant internal tooling, not a customer-facing product.

| Product | Status | Link | One-liner |
|---|---|---|---|
| **MatRecruit** | Launching Oct 1, 2026 | matrecruit.org | The recruiting platform built for high-school wrestlers. Profile + private outreach tracker + AI next steps. |
| **MatTime** | Launching Oct 1, 2026 | matsidetime.org | A privates-booking marketplace connecting wrestlers, parents, and coaches. |
| **MatPass** | Launching Oct 1, 2026 | matpass.org | Compliance management for wrestling programs — eligibility, paperwork, status tracking. |
| **WrestleFA** | Coming soon | wrestlefa.org | A free-agent board for wrestling tournaments — coaches post open spots, parents fill them. |
| **SignupSignin** | Live (iOS + Web) | signupsignin.com | Volunteer event signup and day-of check-in for tournament organizers. |

Status framing is honest: "Launching Oct 1, 2026" for the three V1-bundle products, "Coming soon" for WrestleFA (decoupled per 2026-06-18 decision; launch TBD pending Safe Harbor cost quote), "Live" for SignupSignin.

### Tournaments

Short refreshed services blurb above the existing schedule tables:

> Matside operates as a tournament contractor for high-school, junior-high, and youth events across Western Pennsylvania and the Mid-Atlantic. We bring bracket management, scoring, and live results infrastructure — powered by FloArena and USA Bracketing — and partner with tournament directors who carry event-level insurance and own volunteer coordination.

Then the existing **2025-2026 Upcoming Events** table (15 events, preserved exactly). Then the existing **2026-2027 Upcoming Events** table (4 events, preserved exactly). Then a tournament-management CTA:

> Interested in Matside running your tournament? **[Get in touch](mailto:support@matside.org?subject=Tournament%20Management%20Inquiry)**

The "Merchandising" service is dropped — not a current Matside offering per any matside-hq source. The "Team Management" service is also dropped from this surface — that's what the software products cover; it would be redundant to list it as a standalone tournament-side service.

### Leadership

2-card grid. Each card: square headshot slot (with Steel Blue circle + initials fallback until real images land) + name + title + bio + personal email.

```
[ DE ]    Daniel Emmons
          Founder & Operator
          [BIO: Daniel will provide]
          USA Bracketing Expert
          daniel@matside.org

[ MM ]    Mason Manville
          Chief Mat Officer
          [BIO: Daniel will provide for Mason]
          mason@matside.org
```

Until Daniel sends bios + headshots, the cards ship with placeholder copy clearly marked as placeholder (e.g., "*Bio coming soon.*") and Steel Blue initials avatars (`DE` and `MM`). Updates are a single `<img src>` swap per card for headshots and a `<p>` body swap per card for bios.

### Get in touch

Single customer-facing channel:

> **General inquiries:** `support@matside.org`
> For direct contact with Daniel or Mason, see the **Leadership** section above.

Replaces the current Gmail link. `matsidewrestlingco@gmail.com` is removed entirely from the customer-facing surface (it's the internal Google login per the 2026-06-21 email-convention memory).

### Footer

```
Matside Wrestling Co. — Pennsylvania single-member LLC, headquartered in Glenshaw, PA
Contact: support@matside.org

Privacy · Terms · COPPA · Information Security · Data Retention

© 2026 Matside Wrestling Co. All rights reserved.
```

(Plus social-link slots — kept from existing footer; placeholders until Daniel populates.)

## Legal pages design

Five sub-pages at `/legal/*` plus an index. Approach is **Option C** (per 2026-06-22 brainstorming): hand-tuned static HTML files with prose derived once from the markdown sources in `matside-hq/docs/legal/`. No build pipeline.

### Per-page mapping

| Page | Source | Authoring lift |
|---|---|---|
| `/legal/index.html` | NEW | Directory page listing the 5 documents with last-updated dates + version + attorney-review-pending disclaimer |
| `/legal/privacy.html` | NEW — corporate-level adaptation of `matrecruit/src/app/(legal)/privacy/page.tsx` source | Corporate scope (all products operated by Matside), with sub-sections per product where data flow differs. ~1 hr |
| `/legal/terms.html` | NEW — corporate-level adaptation of `matrecruit/src/app/(legal)/terms/page.tsx` source | Corporate scope; mentions all 5 products. ~1 hr |
| `/legal/coppa.html` | NEW — corporate-level adaptation of `matrecruit/src/app/(legal)/coppa/page.tsx` source + COPPA self-audit framing | Leads with structural-exclusion + actual-knowledge framing from `matside-hq/planning/coppa-six-step-self-audit-v1.md`; references each product's COPPA scope determination. ~1 hr |
| `/legal/information-security.html` | `matside-hq/docs/legal/matside-isp-v1.md` | Direct port, ~280 lines of prose. Includes the 5 per-product ISP addenda inline or linked. ~30 min |
| `/legal/retention.html` | `matside-hq/docs/legal/retention-policy-v1.md` | Direct port, ~150 lines. ~30 min |

### Honesty markers

Every legal page includes:

- A **"Last updated: 2026-06-22"** line at the top.
- A **"Version: 1.0 — pending Sept 1, 2026 attorney review"** disclaimer below the date.

The COPPA page additionally surfaces the Six-Step self-audit findings (only WrestleFA materially in scope; the other four products structurally excluded or rely on adult-input-data-about-child) and references `matside-hq/planning/coppa-six-step-self-audit-v1.md` as the underlying analysis.

**Reasoning:** disclosing the attorney-review timeline reads as a positive signal to Safe Harbor + insurance reviewers — it shows the work has been done and a formal review is scheduled, rather than claiming finality on documents that are still maturing.

## Brand & style approach

**Stay on the existing visual language.** `style.css` already uses Matside Brand System Steel Blue (`--accent: #3d82c4` = the parent corporate accent, intentionally distinct from each product's signature color). Preserve it.

**Add CSS only for new sections** at the bottom of `style.css`. No existing rules touched. New rules cover:

- `.about` — single-column prose, ~720px max-width
- `.leadership-grid` + `.leader-card` + `.leader-avatar` + `.leader-name` + `.leader-title` + `.leader-bio` + `.leader-email` — 2-column desktop, 1-column mobile (<760px)
- `.avatar-initials` — Steel Blue circle fallback for missing headshots
- `.contact-single` — replaces the existing services-cta block; centered single-line treatment
- `.footer-legal-links` — new horizontal row in the footer
- `.legal-prose` — long-form prose container for the `/legal/*` pages: ~720px max-width, generous line-height, h2/h3 spacing, blockquote treatment, link styling consistent with the corporate accent

**Fonts** — add **Montserrat** for display headings (matches the parent Matside Design System). Single additional Google Fonts `<link>`. Inter remains body. JetBrains Mono not added (no mono surfaces on this page).

**Logo** — keep `assets/images/mswc.png` as the hero image, unchanged.

**Mobile breakpoints** — verify these all work:
- Leadership 2-column → 1-column at <760px
- Products 5-card grid wraps cleanly (3+2 desktop, 2+2+1 tablet, 1-up mobile)
- Legal prose pages mobile-friendly via max-width
- New CSS does not break the existing tournament tables on mobile

## Bug fixes + housekeeping (bundled with the rewrite)

These come along with the rewrite — none require separate decisions, all are uncontroversial cleanup.

**HTML bugs:**
- Duplicate `id="events"` on both events sections → `id="events-current"` (2025-26) + `id="events-next"` (2026-27)
- Duplicate `id="services"` on the Services section + bottom CTA → second one becomes `id="tournament-cta"` (and the CTA moves inside the Tournaments section per the new layout)
- Malformed `<section class="services" id="services"></div>` (orphan closing div) → properly closed structure
- Deprecated `<center>` tags inside `.product-card` → replaced with CSS `.product-card img { display: block; margin: 0 auto; }`

**Metadata + trust signals:**
- `<title>` casing: `MatSide Wrestling Co.` → `Matside Wrestling Co.` (project convention is "Matside" not "MatSide")
- Add `<meta name="description">` with a short corporate summary
- Add Open Graph metadata: `og:title`, `og:description`, `og:url`, `og:type=website`, `og:image` (using the hero `mswc.png`)
- Add Twitter Card metadata: `twitter:card=summary_large_image` plus matching title/description/image
- Add favicon `<link>` referencing the existing `favicon.ico` (the file is in the repo root but unreferenced in the HTML head today)

**Email correction:**
- The current "Interested in MatSide running your tournament?" CTA uses `mailto:matsidewrestlingco@gmail.com` → changes to `mailto:support@matside.org?subject=Tournament%20Management%20Inquiry`. The Gmail internal address is removed from every customer-facing surface.

**Indentation normalization** — existing events tables mix tabs and 2-space indents. Cosmetic. Will normalize while in the file but no functional change.

## Verification & rollout

### Pre-push checklist (from `matside.org/`)

1. **HTML validation** — manual eyeball pass for duplicate IDs, unclosed tags, malformed structures across `index.html` and all six `legal/*.html` files. No build tool required.
2. **Link check** — walk every internal anchor (`#products`, `#tournaments`, etc.), every external product-site link, every legal-page link, every mailto. Confirm no 404s and every mailto carries the correct address.
3. **Local browser pass** — open `index.html` in a browser (file://) and verify each section renders. Open every `legal/*.html` page and verify the shared nav/footer renders consistently.
4. **Mobile viewport pass** — devtools at 375px, 768px, 1280px. Verify the new sections collapse cleanly. The existing schedule tables already work mobile; verify still true after CSS additions.

### Commit posture

Single atomic commit, eight files (`index.html`, `style.css`, plus six `legal/*.html`).

Commit message:

```
feat(homepage): corporate-credibility rewrite + /legal/* surface for Safe Harbor + insurance review

Restructures matside.org from a tournament-services splash to a full
corporate-site shape. Adds About / Software Portfolio / Leadership
sections; refreshes Services; preserves the two tournament schedule
tables intact; updates the Footer with formal corporate identity. Drops
the dormant MatSide Systems product card. Updates Contact paths to the
2026-06-21 email-convention pattern (support@matside.org for inbound;
daniel@/mason@ for direct, exposed only on leadership cards).

Adds /legal/* surface with five standalone HTML pages (Privacy, Terms,
COPPA, Information Security Program, Data Retention Policy) derived
from the corporate-level markdown sources in matside-hq/docs/legal/.
All documents marked v1, pending Sept 1, 2026 attorney review.

Bundled bug fixes: duplicate IDs, malformed CTA section, deprecated
<center> tags, missing metadata (description / OG / Twitter Card /
favicon), title casing.

Visual language unchanged — Steel Blue accent preserved. New sections
styled to match existing language. Adds Montserrat for display
headings (Inter remains body); no other typography changes.

Spec: docs/superpowers/specs/2026-06-22-matside-org-corporate-credibility-rewrite.md
```

### Post-push verification (live)

- Hit `https://matside.org` in a fresh browser tab (GitHub Pages auto-deploys from `main` within ~1-2 min). Walk every section.
- Test Open Graph preview by pasting the URL into Slack DM, Linear comment, or any link-preview-enabled surface. Confirm the brand thumbnail + description render correctly.
- Run the URL through `https://www.opengraph.xyz/` or equivalent for OG validation.
- Test the GitHub Pages CNAME (`www.matside.org`) still resolves correctly post-deploy.

### Post-push matside-hq bookkeeping

Separate commit in the matside-hq repo:

- `engineering/active-projects.md`: prepend a 2026-06-22 status block (third ship of the day) documenting the matside.org rewrite
- `engineering/dev-backlog.md`: file two new Backlog items:
  1. `matside.org — orphan-file cleanup` (broadcast.html, todo.html, userstoryflow.html — delete or `noindex`)
  2. `matside.org — Claude Design visual follow-up pass` (per Daniel's note that he may send it for a once-over)
- `chief-of-staff/priority-stack.md`: add to Recently Completed

## Open items / dependencies

These items don't block the rewrite shipping (placeholders are used and clearly marked) but need to be swapped in when ready:

| Item | Source | Swap mechanism |
|---|---|---|
| Daniel's bio (1-2 sentences) | Daniel will provide | Single `<p>` replacement in Daniel's leadership card |
| Mason's bio (1-2 sentences) | Daniel will provide | Single `<p>` replacement in Mason's leadership card |
| Daniel's headshot image | Daniel sourcing | Single `<img src>` swap; image goes in `assets/images/daniel-emmons.jpg` (or similar) |
| Mason's headshot image | Daniel sourcing | Single `<img src>` swap; image goes in `assets/images/mason-manville.jpg` (or similar) |
| Sept 1 attorney redlines on legal pages | Sept 1 bundled lawyer review | Mechanical paste after review; same pattern as MatRecruit Epic G5 |

## References

- Repo: `matsidewrestlingco-netizen/matside.org` (cloned at `/Users/emmons_house/Desktop/Matside Software/matside.org`)
- Live URL: `https://matside.org` (CNAME points at GitHub Pages)
- Source markdown for legal pages: `matside-hq/docs/legal/*.md` (matside-isp-v1.md, retention-policy-v1.md, third-party-tracker-inventory-v1.md, dpa/*)
- Source for corporate Privacy/Terms/COPPA framing: `matrecruit/src/app/(legal)/{privacy,terms,coppa}/page.tsx` + `matrecruit/docs/legal/MatRecruit-*-v1.md`
- COPPA self-audit (referenced from `/legal/coppa.html`): `matside-hq/planning/coppa-six-step-self-audit-v1.md`
- Email convention: `~/.claude/projects/-Users-emmons-house-Desktop-Matside-HQ-matside-hq/memory/feedback_email_convention.md` (2026-06-21)
- USA Bracketing Expert credential: `~/.claude/projects/.../memory/project_usa_bracketing_expert.md` (2026-06-22)
- Matside Brand System tokens: existing `style.css` (`--accent: #3d82c4` = `--color-steel: #3B82C4`)
