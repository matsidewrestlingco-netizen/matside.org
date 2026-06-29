# matside.org/careers · 2026-27 Bench Hiring Landing Page

**Date:** 2026-06-29
**Status:** Draft, ready for plan
**Scope:** Single new route on `matsidewrestlingco-netizen/matside.org`; static HTML + CSS; ~half-day engineering
**Audience:** Prospective Tournament Operators and Operator Assistants in Western PA, Maryland, and Northern Virginia (wrestling coaches, officials, parents, college athletes, program admins) who can run or learn the head table at youth and HS wrestling events
**Stack:** Plain HTML + CSS, no JS framework. Same posture as the rest of matside.org (static, Vercel-deployed on push to main).

---

## Why now

We are expanding the Matside bench for the 2026-27 season across Western PA, Maryland, and Northern Virginia. Two roles, both per-event 1099 contract work: Tournament Operator ($25/hr) and Operator Assistant ($15/hr). Final bench locks late September so we have a trained squad in time for the November tournament ramp.

We need a public surface that does three jobs:

1. **Pitch the roles cleanly** so the right candidates self-identify and the wrong ones self-deselect. The wrestling community is small; a vague posting wastes everyone's time.
2. **Route candidates into a dogfooded application form** on `forms.matsidesystems.com`, so the candidate pipeline lives in our admin dashboard from day one.
3. **Sit on a matside.org-owned URL** that can be shared on Facebook, Instagram, group texts, and the PIAA / USAW community channels without bouncing to a third-party form host.

There is no such page today. Daniel can either point ads at `forms.matsidesystems.com` directly (no brand wrapper, no role context) or at the homepage (no bench-hiring framing). A dedicated `matside.org/careers` solves both gaps and keeps the brand story coherent across the application funnel.

## What success looks like

A candidate who lands on `matside.org/careers` from a Facebook or Instagram ad should be able to answer, within 15 seconds:

- Is Matside Wrestling Co. real and credible? (Operators credentials portal link + matside.org brand chrome.)
- What are the two roles, what do they pay, and where are they located? (Two role cards, pay shown.)
- What does Matside need from me to apply? (USAW Wrestling Leader + BG Check + Safe Sport, all surfaced upfront.)
- How do I apply, and how long does it take? (Apply CTA on each card, "about 10 minutes" stated.)
- When does Matside respond? (Plain commitment, e.g. "We review every application personally and respond within 5 business days.")

A candidate who is not qualified (no USAW credentials, can't travel within the region) should be able to self-deselect before submitting and not enter our review queue.

## Non-goals (v1)

- **No backend, no Supabase, no auth on this page.** Application data lives in `forms.matsidesystems.com`. This page is a static pitch + handoff.
- **No CMS / admin form for editing the JDs.** Job descriptions are committed to the repo at `matside-hq/operations/bench-hiring-2026-27/{operator,assistant}-jd.md`; this page renders the public-facing distilled version. If the JDs change, edit the HTML + push (same workflow as legal pages today).
- **No live candidate count or "X applications received" social proof.** Pre-launch, the number is zero; lying or omitting is worse than not showing it.
- **No applicant tracking surface here.** Tracking lives in the `forms.matsidesystems.com` admin dashboard. Optional CRM upgrade later if volume justifies it.
- **No Maryland-specific page or MSWA-named copy.** Region framing stays "Western PA, Maryland, and Northern Virginia" generic. Do not name MSWA, Foster, or any specific MD partner. The MSWA agreement is unsigned and naming it on a public surface ahead of signature shifts the relationship dynamic against us. The NoVA addition (2026-06-29) dilutes the MSWA-dependency optics further and maps to Mason's home base.
- **No D1 / college recruiting angle.** This is bench staffing for HS / club / USAW events, not a college pipeline.

## Architecture

### Route

`matside.org/careers` served from `careers/index.html` (matches the static-route pattern of `legal/privacy/index.html`, `operators/index.html`, `today/index.html`).

### Dependencies on other surfaces

- **Application form:** lives at `forms.matsidesystems.com/[posting-slug]`. Slug TBD when Daniel + Mason create the posting in the admin UI (see "Application form contract" below).
- **Operators portal:** `matside.org/operators`. Linked from the careers page as a trust signal showing the existing bench's USAW credentials.
- **Support email:** `support@matside.org` (display rule), used for questions inbound.

### Application form contract

The careers page links each role's "Apply" CTA to a single form on `forms.matsidesystems.com` with a `?role=` query parameter pre-selecting the candidate's intent:

- Operator CTA → `https://forms.matsidesystems.com/r/[slug]?role=operator`
- Assistant CTA → `https://forms.matsidesystems.com/r/[slug]?role=assistant`
- A small "Either role / not sure" link at the bottom of the role-card section → `https://forms.matsidesystems.com/r/[slug]?role=either`

The form itself is one posting with a `role` multi-select field that the URL pre-populates. This keeps all applications in a single admin queue and lets us see if candidates are flexible across roles (often the strongest signal). If `forms.matsidesystems.com` cannot honor query-param pre-population in the field UI today, the role selector still lives in the form and the page just links to the bare URL; candidates pick their role manually. Verify with Daniel during the form setup.

### SEO + indexing

- `<meta name="robots" content="index,follow">` on this page. We want Google + Bing to index it; "wrestling tournament operator job Western PA" should reach this page.
- `<title>Careers · Matside Wrestling Co. · 2026-27 Bench Hiring</title>` (middot separator matches the matside.org `<title>` convention on `/operators` and keeps the browser-tab text em-dash-free in line with the Matside copy rule).
- Open Graph image: reuse the matside.org default OG image. If volume justifies it, design a branded `og-careers.png` later (Recruit Green is the wrong accent; stay on Steel Blue for parent-brand consistency).
- Schema.org `JobPosting` JSON-LD blocks for both roles. Boosts Google for Jobs eligibility and is cheap to ship. Two blocks (one per role), each with `title`, `description`, `hiringOrganization`, `jobLocation` (three Place entries: PA, MD, VA), `baseSalary` ($25 or $15 hourly), `employmentType` ("CONTRACTOR"), `datePosted`, `validThrough` (set to 2026-09-30 for the v1 cycle), and a direct `applicationContact` URL pointing at the appropriate `forms.matsidesystems.com` URL.

## Page layout

Matches matside.org Midnight redesign aesthetic. Steel Blue `#3B82C4` parent accent only; no product accents bleed in.

### Visual hierarchy (top to bottom)

1. **Eyebrow.** JetBrains Mono UPPERCASE, Steel Blue, letter-spaced: `2026-27 SEASON BENCH`
2. **Page headline.** Montserrat 800, Off-White, large (clamp 32px to 48px): `Run the head table for Matside.`
3. **Lede.** Inter 500, ms-muted, 2-3 sentences covering who we are, that we're hiring two roles, and the regions (Western PA, Maryland, and Northern Virginia). Same voice as `matside.org/operators` lede.
4. **Trust strip.** Small mono caption row linking to `matside.org/operators` for credential verification, with a "Verify our credentials at USAW" external link. Builds trust before the role pitch.
5. **Role cards.** Two cards side-by-side on desktop (`md:` breakpoint and up), stacked on mobile. Each card carries:
   - Role name (Montserrat 700)
   - Pay rate (large mono, Steel Blue: `$25/HR` or `$15/HR`)
   - One-line pitch (Inter 500)
   - "What you'll do": 4 short bullets distilled from the JD body
   - "What we need": 3 bullets, leads with USAW credentials
   - Apply CTA: full-card-width Steel Blue button, Montserrat 700: `APPLY FOR OPERATOR →` or `APPLY FOR ASSISTANT →`
6. **"Either role / not sure" affordance.** Small text link below the cards: `Open to either role? Apply here →` linking to `?role=either`. Captures candidates who are flexible.
7. **"What we need from every bench member" callout.** Mirrors the `/operators` verify-callout style. Surfaces the USAW Wrestling Leader + BG Check + Safe Sport requirement in one place, with a "If you don't have these yet, here's how to get them" link to USAW's official credentials path. Reduces applications that are missing the baseline.
8. **"How we hire" section.** 4 short bullets:
   - "We review every application personally."
   - "We respond within 5 business days."
   - "Strong candidates get a 20-minute call with Daniel or Mason."
   - "Selected operators and assistants shadow one event before being put on the schedule."
9. **FAQ.** 5 to 7 questions, short answers. See "FAQ content" below.
10. **Footer.** Standard matside.org footer (Privacy / COPPA / Terms / Support + Pittsburgh tagline rotation if ported to matside.org by then; otherwise the existing matside.org footer pattern).

### Role-card visual

Mirror the `/operators` `cred-card` pattern: dark surface `rgba(255,255,255,0.02)`, 1px border `rgba(255,255,255,0.08)`, 12px radius, 22px-24px padding. Role name + pay rate in a single header row (pay rate right-aligned in JetBrains Mono / Steel Blue / size 24-28px so it reads instantly). Bullets in Inter 14px with tight line-height. Apply button full card width with a `→` glyph suffix matching the existing `verify-cta` pattern.

### Off-cycle behavior

Once the 2026-27 hiring window closes (planned 2026-09-30), the page can either:

- (a) Switch to a quiet "We're not actively hiring; check back in summer 2027" state with a "Get notified" email capture, or
- (b) Stay live with current copy and let the JSON-LD `validThrough` expire (so Google for Jobs drops it) while the page itself remains for brand presence.

V1 default: option (a) is preferable but not required for launch. Add the "Get notified" capture only if we want a passive bench pipeline running year-round. Logged as open question.

## FAQ content (proposed)

1. **Am I employed or 1099?** 1099 contractor. We file your 1099 each January if your total earnings cross the IRS threshold. Quarterly tax responsibility is yours.
2. **What does a typical event look like?** Saturday or Sunday, 8-12 hours including setup and breakdown. Most events are 1-day. Multi-day events are rare and paid per shift.
3. **Do I need to travel?** You apply to one or both regions (Western PA, Maryland, and Northern Virginia). We assign events based on your stated region preference and our schedule. Mileage is reimbursed as a pass-through to the host program when applicable.
4. **What if I'm a wrestling parent or coach with no head-table experience?** Apply for the Assistant role. We train the technical side; reliability and a willingness to learn are what get you on the schedule.
5. **What software do I need to know?** TrackWrestling for the Operator role at minimum. FloArena and USA Bracketing are pluses. Assistants don't need software knowledge; they learn it on the bench.
6. **When does the season start?** Most events run November through March, with occasional summer and fall events. We post the schedule once we've locked the bench.
7. **Can I apply for both roles?** Yes. Use the "Either role" link below the role cards.

## Update workflow

Static page, edited in the repo. Daniel or any future contributor:

1. Edit `careers/index.html` directly (JDs change rarely; this is not a hot-update page).
2. For seasonal cycle changes (e.g., 2027-28), bump the year-tagged eyebrow + `validThrough` in the JobPosting JSON-LD + any hiring-window date references.
3. Commit and push to main. Vercel auto-deploys.

No JSON config block needed (unlike `/today`). The page text is the content of record.

## Acceptance criteria

- [ ] Route `matside.org/careers` resolves and serves the page.
- [ ] Two role cards render side-by-side at desktop widths and stack cleanly at mobile widths (iPhone SE through iPhone Pro Max).
- [ ] Each Apply CTA links to the correct `forms.matsidesystems.com/r/[slug]?role=...` URL and opens in a new tab.
- [ ] "Either role / not sure" link is present and links to `?role=either`.
- [ ] All required-credentials copy (USAW Wrestling Leader + BG Check + Safe Sport) is surfaced in at least two places on the page (in the role cards and in the credentials callout).
- [ ] The `matside.org/operators` link in the trust strip resolves and is verifiable.
- [ ] JSON-LD JobPosting blocks for both roles validate clean in Google's Rich Results Test.
- [ ] Page-visible copy contains zero em-dash characters. Hyphens and en-dashes for ranges are acceptable.
- [ ] Lighthouse mobile score >= 90 across Performance / Accessibility / Best Practices / SEO (matches matside.org homepage standard).
- [ ] Page loads + renders content in under 1 second on a 4G connection.
- [ ] FAQ section is keyboard-accessible (focusable + readable; no `<details>` accordion required for v1, but if used, it works without JS).
- [ ] All Steel Blue accents match the matside.org Midnight design system (no Recruit Green, no MatTime Blue, no MatPass Red bleed-in).

## Out of scope (v1)

- Backend / CMS / admin form for editing JDs in-place.
- Live application count / pipeline stats on the public page.
- Applicant tracking surface on `matside.org` (lives in `forms.matsidesystems.com` admin).
- Custom Open Graph image for the careers page (use site default).
- "Refer a friend" sharing UI (defer; can add a small mailto + clipboard-copy widget post-launch if referrals are a real signal).
- Per-region landing pages (`/careers/pa`, `/careers/md`). Single page handles both regions through copy framing.
- Multi-language (Spanish, etc.). Single language for v1.
- Year-round always-open "Get notified" email capture if we choose option (b) for off-cycle behavior.

## Dependencies

- **Job descriptions:** `matside-hq/operations/bench-hiring-2026-27/{operator,assistant}-jd.md`. Source of record; the careers page renders the distilled public version. Mason review still pending on the JDs (2026-06-29).
- **Application form on `forms.matsidesystems.com`:** must exist before the Apply CTAs are populated. Daniel + Mason create this in the admin UI per the dogfood-recipe document (separate artifact, to be drafted).
- **Confirmation email template** in `matsidesystems-forms` softened from wrestler/registration language to applicant/application language (~1 hour engineering, to be drafted in a separate matsidesystems-forms PR).
- **No backend or new repo work** on matside.org beyond the new `careers/` folder and `careers/index.html`.

## Estimated lift

- **Engineering:** ~3-4 hours single-session (HTML + CSS + JSON-LD blocks + responsive layout pass).
- **Content writing for v1 launch:** ~30 minutes copy distillation from the JDs (already drafted) into role-card body copy + FAQ answers.
- **QA on mobile + desktop:** 30 minutes across 3 device widths + a Lighthouse pass.
- **JSON-LD validation:** 10 minutes in Google's Rich Results Test.

**Total:** half a day end-to-end, plus ~1 hour of Daniel + Mason time during the Mason JD review pass.

## Open questions for Daniel: RESOLVED 2026-06-29

1. **Single application form with role selector, or two separate postings on `forms.matsidesystems.com`?** **RESOLVED: single posting with a `role` multi-select.** Apply CTAs use `?role=operator|assistant|either` to pre-populate the field.

2. **Off-cycle behavior at 2026-09-30** **RESOLVED: option (a) — quiet "not actively hiring" state with a "get notified" email capture.** Provides a year-round passive bench pipeline at near-zero cost.

3. **Hiring leadership on the page.** **RESOLVED: include the "Hiring leads: Daniel Emmons + Mason Manville" block** linking to `/operators` and `/#leadership` as a trust signal.

4. **Response-time commitment.** **RESOLVED: 5–7 business days.** Wider buffer than the 5-day default; easier to keep during partner-program crunch weeks. JDs updated 2026-06-29 to reflect this.

5. **Shadow-before-schedule expectation.** **RESOLVED: confirmed accurate.** "Selected operators and assistants shadow one event before being put on the schedule" matches Daniel + Mason's intended onboarding.

6. **Adjacent-roles teaser at the bottom of the page** flagging future roles (e.g., bracket-software trainers, weigh-in coordinators). **RESOLVED: option (a) — no teaser, keep v1 focused on Operator + Assistant.** Adjacent roles can get their own page later if real demand materializes.

## Content changes flowing from JD round 1 (2026-06-29)

Round 1 of JD edits landed on `matside-hq` commit `8018252`. Page copy must mirror:

- **Bracketing software references**: drop TrackWrestling; use "FloArena or USA Bracketing" wherever bracketing tools are named.
- **Officials interface line on Operator card**: soften to "coordinate with officials on event flow, scheduling, and logistics" — bout calls and rulings are explicitly NOT a Matside scope item.
- **Operator head-table experience floor**: phrase the requirement as "experience running a head table OR a strong wrestling background and the reliability to learn the head table fast — we train the right person." The hard "from-zero" rejection in the previous draft is gone.
- **Assistant role bullets**: bullet 1 = setup/breakdown, bullet 2 = "assist with weigh-ins" (TDs run them), bullet 3 = "support the table workers" running between head table and mat tables (no bout sheets).
- **Helps-tier terminology**: replace "NCEP Bronze / NCEP Copper" with community-facing "USA Wrestling Leader training levels" terminology. Per JD round 2 fix (2026-06-29), the Operator card reads "Higher USA Wrestling Leader training levels (Bronze or above). Teal-level training is a plus for events with girls' divisions." Assistant card reads "USA Wrestling Leader Copper-level training or higher." **Do NOT write a 'Tournament Level' anywhere** — there is no such USAW credential. `T` on the matside.org/operators portal is Teal (girls-specific), not Tournament.

## Shared-styles refactor (deferred, noted here)

The `matside.org/operators` page carries ~300 lines of CSS in an inline `<style>` block. Several of those rules (`.ops-prose`, `.ops-section-head`, `.verify-callout`, `.cred-card`, status dots, `.usaw-id-link`) will apply directly to the `/careers` page. V1 will copy-paste the needed rules into a new inline `<style>` block on `careers/index.html` to avoid blocking on a refactor.

**Follow-up:** extract the shared rules into a `matside-content.css` partial that both pages (and any future content-page) import. ~1 hour of cleanup. Logged as a non-blocking dev-backlog item to be filed after this page ships.
