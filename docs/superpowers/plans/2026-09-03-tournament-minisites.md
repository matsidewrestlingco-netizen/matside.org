# Tournament Minisites Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a client-side minisite builder at `matside.org/build/` that generates static tournament event pages under `matside.org/t/[slug]/`, each wrapping the matsidesystems-forms `/r/[slug]` registration flow in an iframe.

**Architecture:** Two repos. In `matsidesystems-forms`, add a CSP `frame-ancestors` allowlist for `www.matside.org` + a client-side iframe height dispatcher + optional `?embed=1` chrome-suppression. In `matside.org`, add a source template, a Node rebuild script (built-ins only — no npm deps because the site has no package.json), a client-side builder page with vendored JSZip, and a tournaments index. Per-tournament `config.json` is the source of truth; `index.html` is derived.

**Tech Stack:**
- `matsidesystems-forms`: Next.js (custom fork per `AGENTS.md`), TypeScript, Vitest, Tailwind
- `matside.org`: static HTML/CSS/JS on GitHub Pages, Node 24 built-ins for tooling, vendored JSZip for the builder

**Spec:** `docs/superpowers/specs/2026-09-03-tournament-minisites-design.md` (in `matside.org`)

**Rollout order:** matsidesystems-forms PR ships first (CSP + dispatcher live in prod), then matside.org PR ships. This prevents "iframe blocked in prod because CSP not deployed yet."

---

## Phase 1 — matsidesystems-forms

Base directory for all Phase 1 tasks: `/Users/emmons_house/Desktop/Matside Software/matsidesystems-forms`

### Task 1: Add CSP `frame-ancestors` header to `/r/[slug]` routes

**Files:**
- Modify: `next.config.ts`
- Test: `tests/unit/lib/next-config-headers.test.ts` (new)

- [ ] **Step 1: Write the failing test**

Create `tests/unit/lib/next-config-headers.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'

// The Sentry wrapper in next.config.ts hides headers() from a direct import,
// so we test the raw config object separately.
import { rawNextConfig } from '../../../next.config.ts'

describe('CSP frame-ancestors for /r/[slug]', () => {
  it('returns a header rule matching /r/:slug*', async () => {
    const rules = await rawNextConfig.headers!()
    const match = rules.find((r) => r.source === '/r/:slug*')
    expect(match).toBeDefined()
  })

  it('includes Content-Security-Policy with matside.org and self', async () => {
    const rules = await rawNextConfig.headers!()
    const match = rules.find((r) => r.source === '/r/:slug*')!
    const csp = match.headers.find((h) => h.key === 'Content-Security-Policy')!
    expect(csp.value).toContain("frame-ancestors 'self' https://www.matside.org")
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- tests/unit/lib/next-config-headers.test.ts
```

Expected: FAIL — `rawNextConfig` not exported.

- [ ] **Step 3: Modify `next.config.ts` to add and export the header rule**

Replace the entire file:

```typescript
import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'

export const rawNextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/r/:slug*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://www.matside.org",
          },
        ],
      },
    ]
  },
}

export default withSentryConfig(rawNextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  webpack: {
    treeshake: { removeDebugLogging: true },
    automaticVercelMonitors: false,
  },
})
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- tests/unit/lib/next-config-headers.test.ts
```

Expected: PASS (both tests green).

- [ ] **Step 5: Verify build still works**

```bash
npm run build
```

Expected: build succeeds with no new errors. If Sentry wrapping complains about the shape, adjust to match — the important thing is the exported `rawNextConfig` reads correctly.

- [ ] **Step 6: Commit**

```bash
git add next.config.ts tests/unit/lib/next-config-headers.test.ts
git commit -m "feat(headers): allow www.matside.org to embed /r/[slug] via CSP frame-ancestors"
```

---

### Task 2: Create `IframeHeightDispatcher` client component

**Files:**
- Create: `src/components/public/IframeHeightDispatcher.tsx`
- Test: `tests/unit/components/IframeHeightDispatcher.test.tsx` (new)

- [ ] **Step 1: Write the failing test**

Create `tests/unit/components/IframeHeightDispatcher.test.tsx`:

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import IframeHeightDispatcher from '@/components/public/IframeHeightDispatcher'

describe('IframeHeightDispatcher', () => {
  let postMessageSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    postMessageSpy = vi.spyOn(window.parent, 'postMessage')
  })

  afterEach(() => {
    cleanup()
    postMessageSpy.mockRestore()
  })

  it('posts an initial matsysforms-height message on mount', () => {
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      configurable: true,
      value: 1234,
    })

    render(<IframeHeightDispatcher />)

    expect(postMessageSpy).toHaveBeenCalledWith(
      { type: 'matsysforms-height', px: 1234 },
      'https://www.matside.org'
    )
  })

  it('renders no DOM output', () => {
    const { container } = render(<IframeHeightDispatcher />)
    expect(container.firstChild).toBeNull()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- tests/unit/components/IframeHeightDispatcher.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement the component**

Create `src/components/public/IframeHeightDispatcher.tsx`:

```typescript
'use client'

import { useEffect } from 'react'

const PARENT_ORIGIN = 'https://www.matside.org'
const MESSAGE_TYPE = 'matsysforms-height'

export default function IframeHeightDispatcher() {
  useEffect(() => {
    if (typeof window === 'undefined' || window.parent === window) return

    const post = () => {
      const px = document.documentElement.scrollHeight
      window.parent.postMessage({ type: MESSAGE_TYPE, px }, PARENT_ORIGIN)
    }

    post()

    const ro = new ResizeObserver(() => post())
    ro.observe(document.documentElement)

    return () => ro.disconnect()
  }, [])

  return null
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- tests/unit/components/IframeHeightDispatcher.test.tsx
```

Expected: PASS (both tests green).

- [ ] **Step 5: Commit**

```bash
git add src/components/public/IframeHeightDispatcher.tsx tests/unit/components/IframeHeightDispatcher.test.tsx
git commit -m "feat(embed): IframeHeightDispatcher posts height to parent frame"
```

---

### Task 3: Mount dispatcher on `/r/[slug]` and honor `?embed=1`

**Files:**
- Modify: `src/app/(public)/r/[slug]/page.tsx`
- Test: `tests/unit/app/public-event-page-embed.test.tsx` (new)

- [ ] **Step 1: Write the failing test**

Create `tests/unit/app/public-event-page-embed.test.tsx`:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import PublicEventPage from '@/app/(public)/r/[slug]/page'

vi.mock('@/lib/data/events', () => ({
  getPublicEventBySlug: vi.fn().mockResolvedValue({
    id: 'evt_1',
    name: 'Test Event',
    description: 'A description',
    fields: [],
    archived: false,
    rules_version: 1,
    opens_at: null,
    closes_at: null,
    cap: null,
    test_mode: false,
    base_fee_cents: 0,
    refund_policy: null,
  }),
  getWrestlerCount: vi.fn().mockResolvedValue(0),
}))

vi.mock('@/lib/eventStatus', () => ({
  deriveEventStatus: () => 'OPEN',
}))

describe('PublicEventPage embed mode', () => {
  it('renders the event title by default', async () => {
    const ui = await PublicEventPage({
      params: Promise.resolve({ slug: 'test-event' }),
      searchParams: Promise.resolve({}),
    })
    const { queryByText } = render(ui)
    expect(queryByText('Test Event')).not.toBeNull()
  })

  it('hides the event title and description when embed=1', async () => {
    const ui = await PublicEventPage({
      params: Promise.resolve({ slug: 'test-event' }),
      searchParams: Promise.resolve({ embed: '1' }),
    })
    const { queryByText } = render(ui)
    expect(queryByText('Test Event')).toBeNull()
    expect(queryByText('A description')).toBeNull()
  })

  it('always renders IframeHeightDispatcher', async () => {
    const ui = await PublicEventPage({
      params: Promise.resolve({ slug: 'test-event' }),
      searchParams: Promise.resolve({}),
    })
    const { container } = render(ui)
    // The dispatcher renders null, but the <ClientDispatcher /> element still exists in the tree.
    // Assert by looking for the component's marker attribute via serialize.
    expect(container.innerHTML).toContain('data-embed-dispatcher')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- tests/unit/app/public-event-page-embed.test.tsx
```

Expected: FAIL — page doesn't accept `searchParams`, doesn't mount dispatcher, doesn't hide title on embed.

- [ ] **Step 3: Add a wrapper marker on the dispatcher for testability**

Modify `src/components/public/IframeHeightDispatcher.tsx` — wrap the null return in an invisible marker element the test can find:

```typescript
'use client'

import { useEffect } from 'react'

const PARENT_ORIGIN = 'https://www.matside.org'
const MESSAGE_TYPE = 'matsysforms-height'

export default function IframeHeightDispatcher() {
  useEffect(() => {
    if (typeof window === 'undefined' || window.parent === window) return

    const post = () => {
      const px = document.documentElement.scrollHeight
      window.parent.postMessage({ type: MESSAGE_TYPE, px }, PARENT_ORIGIN)
    }

    post()

    const ro = new ResizeObserver(() => post())
    ro.observe(document.documentElement)

    return () => ro.disconnect()
  }, [])

  return <span data-embed-dispatcher hidden />
}
```

Update the earlier test (`IframeHeightDispatcher.test.tsx`) — change the "renders no DOM output" test:

```typescript
  it('renders only an invisible marker span', () => {
    const { container } = render(<IframeHeightDispatcher />)
    const marker = container.querySelector('[data-embed-dispatcher]')
    expect(marker).not.toBeNull()
    expect((marker as HTMLElement).hidden).toBe(true)
  })
```

Run both dispatcher tests:

```bash
npm test -- tests/unit/components/IframeHeightDispatcher.test.tsx
```

Expected: PASS.

- [ ] **Step 4: Modify `page.tsx` to accept `searchParams`, mount the dispatcher, and gate title/description**

Update `src/app/(public)/r/[slug]/page.tsx`:

```typescript
import { notFound } from 'next/navigation'
import { getPublicEventBySlug, getWrestlerCount } from '@/lib/data/events'
import PublicForm from '@/components/public/PublicForm'
import IframeHeightDispatcher from '@/components/public/IframeHeightDispatcher'
import { getClientSquareConfig, type ClientSquareConfig } from '@/lib/square/config'
import { deriveEventStatus } from '@/lib/eventStatus'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ embed?: string }>
}

export default async function PublicEventPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { embed } = await searchParams
  const isEmbed = embed === '1'

  const event = await getPublicEventBySlug(slug)
  if (!event) notFound()

  const wrestlerCount = await getWrestlerCount(event.id)
  const status = deriveEventStatus(
    {
      archived: event.archived,
      rules_version: event.rules_version,
      fields_count: event.fields.length,
      opens_at: event.opens_at,
      closes_at: event.closes_at,
      cap: event.cap,
      current_wrestler_count: wrestlerCount,
    },
    new Date()
  )

  // NOTE: keep the existing DRAFT / UPCOMING / CLOSED / FULL branches unchanged.
  // They already render minimal UI; embed mode can inherit them as-is.
  if (status === 'DRAFT') {
    return (
      <>
        <IframeHeightDispatcher />
        <main className="max-w-md mx-auto p-6 text-center">
          <h1 className="text-2xl font-bold mb-2">{event.name}</h1>
          <div className="bg-gray-100 border border-gray-300 rounded p-4 my-4">
            <strong className="block mb-1">Registration is not yet published</strong>
            <p className="text-sm">Check back soon, or contact the organizer for details.</p>
          </div>
        </main>
      </>
    )
  }

  if (status === 'UPCOMING') {
    return (
      <>
        <IframeHeightDispatcher />
        <main className="max-w-md mx-auto p-6 text-center">
          <h1 className="text-2xl font-bold mb-2">{event.name}</h1>
          <div className="bg-blue-50 border border-blue-200 rounded p-4 my-4">
            <strong className="block mb-1">Registration not yet open</strong>
            <p className="text-sm">
              Opens{' '}
              {event.opens_at
                ? new Date(event.opens_at).toLocaleString('en-US', {
                    timeZone: 'America/New_York',
                    dateStyle: 'long',
                    timeStyle: 'short',
                  })
                : ''}
              {' '}(ET)
            </p>
          </div>
        </main>
      </>
    )
  }

  if (status === 'CLOSED') {
    return (
      <>
        <IframeHeightDispatcher />
        <main className="max-w-md mx-auto p-6 text-center">
          <h1 className="text-2xl font-bold mb-2">{event.name}</h1>
          <div className="bg-gray-100 border border-gray-300 rounded p-4 my-4">
            <strong className="block mb-1">Registration is closed</strong>
            <p className="text-sm">Contact the organizer if you need a walk-in.</p>
          </div>
        </main>
      </>
    )
  }

  if (status === 'FULL') {
    return (
      <>
        <IframeHeightDispatcher />
        <main className="max-w-md mx-auto p-6 text-center">
          <h1 className="text-2xl font-bold mb-2">{event.name}</h1>
          <div className="bg-yellow-50 border border-yellow-200 rounded p-4 my-4">
            <strong className="block mb-1">This event is full</strong>
            <p className="text-sm">
              All {event.cap} spots have been claimed. Contact the organizer about a waitlist.
            </p>
          </div>
        </main>
      </>
    )
  }

  // OPEN — render the form.
  const isPaid = (event.base_fee_cents ?? 0) > 0
  let squareConfig: ClientSquareConfig | undefined = undefined
  if (isPaid) {
    try {
      squareConfig = getClientSquareConfig(event.test_mode)
    } catch {
      squareConfig = undefined
    }
  }
  const remaining = event.cap != null ? event.cap - wrestlerCount : null

  return (
    <>
      <IframeHeightDispatcher />
      <main className="max-w-2xl mx-auto p-6">
        {event.test_mode && (
          <div className="bg-blue-100 border border-blue-300 rounded p-3 mb-4 text-sm font-semibold text-blue-800 text-center">
            TEST EVENT — no real charges. Use Square sandbox cards.
          </div>
        )}

        {!isEmbed && <h1 className="text-3xl font-bold mb-2">{event.name}</h1>}
        {!isEmbed && event.description && (
          <p className="text-gray-700 whitespace-pre-wrap mb-6">{event.description}</p>
        )}

        {remaining != null && remaining > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded p-2 mb-4 text-sm text-center">
            {remaining} spot{remaining === 1 ? '' : 's'} remaining
          </div>
        )}

        {event.refund_policy && (
          <section className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-6">
            <h2 className="font-semibold mb-2">Refund Policy</h2>
            <p className="whitespace-pre-wrap text-sm">{event.refund_policy}</p>
          </section>
        )}

        {isPaid && !squareConfig && (
          <section className="bg-red-50 border border-red-200 rounded p-3 mb-4 text-sm text-red-800 text-center">
            Online payment isn&apos;t configured for this event yet. Please contact the organizer.
          </section>
        )}

        {event.fields.length === 0 ? (
          <div className="text-sm text-gray-500">This form has no fields configured yet.</div>
        ) : (
          <PublicForm event={event} squareConfig={squareConfig} />
        )}
      </main>
    </>
  )
}
```

- [ ] **Step 5: Run all Phase 1 tests**

```bash
npm test -- tests/unit/lib/next-config-headers.test.ts tests/unit/components/IframeHeightDispatcher.test.tsx tests/unit/app/public-event-page-embed.test.tsx
```

Expected: all PASS.

- [ ] **Step 6: Verify build**

```bash
npm run build
```

Expected: succeeds.

- [ ] **Step 7: Commit**

```bash
git add src/app/\(public\)/r/\[slug\]/page.tsx src/components/public/IframeHeightDispatcher.tsx tests/unit/components/IframeHeightDispatcher.test.tsx tests/unit/app/public-event-page-embed.test.tsx
git commit -m "feat(embed): mount height dispatcher and hide duplicate title when ?embed=1"
```

- [ ] **Step 8: Push and open PR against matsidesystems-forms**

```bash
git push -u origin HEAD
gh pr create --title "Enable www.matside.org iframe embedding of /r/[slug]" --body "$(cat <<'EOF'
## Summary
- CSP frame-ancestors allowlist for www.matside.org on /r/[slug] routes
- IframeHeightDispatcher client component posts scrollHeight to parent frame
- Optional ?embed=1 query param hides duplicate event title/description when the parent minisite already shows them
- Test event banner, remaining-spots, and refund policy are preserved in embed mode

## Test plan
- [ ] Unit tests pass (`npm test`)
- [ ] Build succeeds (`npm run build`)
- [ ] Deploy to production; curl a /r/[slug] URL and verify Content-Security-Policy header present
- [ ] Load a /r/[slug]?embed=1 URL in a browser and confirm title/description are hidden but form still renders
EOF
)"
```

**Do not proceed to Phase 2 until this PR is merged and deployed to production.**

---

## Phase 2 — matside.org

Base directory for all Phase 2 tasks: `/Users/emmons_house/Desktop/Matside Software/matside.org`

### Task 4: Add `.gitignore`

**Files:**
- Create: `.gitignore`

- [ ] **Step 1: Create the file**

Create `.gitignore`:

```
.superpowers/
.DS_Store
```

- [ ] **Step 2: Commit**

```bash
git add .gitignore
git commit -m "chore: ignore .superpowers/ scratch dir and macOS .DS_Store"
```

---

### Task 5: Create the minisite template

**Files:**
- Create: `t/_template/index.html`
- Create: `t/_template/README.md`

- [ ] **Step 1: Write the template**

Create `t/_template/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{{NAME}} — Matside</title>
<meta name="description" content="{{NAME}} — {{DATE_DISPLAY}} at {{VENUE_NAME}}, {{VENUE_LOCATION}}. Registration hosted by Matside.">
<link rel="canonical" href="https://www.matside.org/t/{{SLUG}}/">
<link rel="icon" href="/favicon.ico">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">

<!-- OpenGraph -->
<meta property="og:title" content="{{NAME}}">
<meta property="og:description" content="{{DATE_DISPLAY}} · {{VENUE_NAME}}, {{VENUE_LOCATION}}">
<meta property="og:type" content="website">
<meta property="og:url" content="https://www.matside.org/t/{{SLUG}}/">
<meta property="og:image" content="{{OG_IMAGE_URL}}">
<meta name="twitter:card" content="summary_large_image">

<!-- Fonts (matches Midnight system used elsewhere on matside.org) -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap">

<!-- Schema.org SportsEvent -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SportsEvent",
  "name": "{{NAME}}",
  "startDate": "{{DATE_ISO}}",
  "sport": "Wrestling",
  "location": {
    "@type": "Place",
    "name": "{{VENUE_NAME}}",
    "address": "{{VENUE_LOCATION}}"
  },
  "url": "https://www.matside.org/t/{{SLUG}}/"
}
</script>

<style>
:root {
  --accent: {{ACCENT_HEX}};
  --bg: #0b0d12;
  --surface: #161a22;
  --border: #2a2f3a;
  --text: #e6e8ee;
  --muted: #8b90a0;
  --subtle: #a8adba;
}
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body {
  background: var(--bg);
  color: var(--text);
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  line-height: 1.5;
}
.page { max-width: 720px; margin: 0 auto; padding: 32px 20px 64px; }
.crumb { font-size: 11px; color: var(--muted); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 12px; }
.crumb a { color: var(--muted); text-decoration: none; }
.crumb a:hover { color: var(--text); }
.hero { position: relative; margin-bottom: 20px; }
.hero-image { width: 100%; aspect-ratio: 16/9; border-radius: 8px; background: linear-gradient(135deg, var(--accent), var(--bg)); background-size: cover; background-position: center; margin-bottom: 16px; }
.hero-image[data-src]:not([style*="url"]) { background: linear-gradient(135deg, var(--accent), var(--bg)); }
.logo { max-height: 56px; margin-bottom: 12px; }
h1 { font-size: 32px; font-weight: 800; letter-spacing: -0.01em; margin: 0 0 6px; }
.subhead { color: var(--subtle); font-size: 14px; margin: 0 0 24px; }
.pills { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 24px; }
.pill { background: var(--surface); border: 1px solid var(--border); border-left: 3px solid var(--accent); padding: 10px 12px; border-radius: 4px; }
.pill-label { font-size: 10px; color: var(--muted); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 4px; }
.pill-value { font-size: 14px; font-weight: 600; }
.about { background: var(--surface); border: 1px solid var(--border); border-radius: 6px; padding: 16px 18px; margin-bottom: 24px; font-size: 14px; color: var(--subtle); white-space: pre-wrap; }
.about[hidden] { display: none; }
.register { border-top: 1px solid var(--border); padding-top: 24px; }
.register h2 { font-size: 12px; color: var(--muted); letter-spacing: 0.15em; text-transform: uppercase; margin: 0 0 12px; }
.iframe-shell { position: relative; background: var(--surface); border: 1px solid var(--border); border-radius: 6px; overflow: hidden; }
#reg-iframe { width: 100%; min-height: 800px; border: 0; display: block; background: #fff; }
.iframe-fallback { display: none; padding: 24px; text-align: center; color: var(--subtle); font-size: 14px; }
.iframe-fallback a { color: var(--accent); font-weight: 600; }
.iframe-shell.fallback #reg-iframe { display: none; }
.iframe-shell.fallback .iframe-fallback { display: block; }
footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid var(--border); font-size: 12px; color: var(--muted); display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
footer a { color: var(--muted); text-decoration: none; }
footer a:hover { color: var(--text); }
@media (max-width: 520px) {
  .pills { grid-template-columns: 1fr; }
  h1 { font-size: 26px; }
}
</style>
</head>
<body>
<div class="page">
  <div class="crumb"><a href="/t/">Matside · Tournaments</a></div>

  <section class="hero">
    <div class="hero-image" id="hero" data-src="{{HERO_SRC}}"></div>
    <img class="logo" id="logo" data-src="{{LOGO_SRC}}" alt="" hidden>
    <h1>{{NAME}}</h1>
    <p class="subhead">{{DATE_DISPLAY}} · {{VENUE_NAME}} · {{VENUE_LOCATION}}</p>
  </section>

  <div class="pills">
    <div class="pill"><div class="pill-label">Divisions</div><div class="pill-value">{{DIVISIONS}}</div></div>
    <div class="pill"><div class="pill-label">Weigh-in</div><div class="pill-value">{{WEIGHIN}}</div></div>
    <div class="pill"><div class="pill-label">Wrestling</div><div class="pill-value">{{WRESTLING}}</div></div>
  </div>

  <div class="about" id="about" data-content="{{ABOUT}}" hidden></div>

  <section class="register">
    <h2>Register</h2>
    <div class="iframe-shell" id="iframe-shell">
      <iframe id="reg-iframe" src="https://forms.matsidesystems.com/r/{{FORMS_SLUG}}?embed=1" title="Registration form" loading="lazy"></iframe>
      <div class="iframe-fallback">
        Registration is temporarily unavailable in-page.
        <a href="https://forms.matsidesystems.com/r/{{FORMS_SLUG}}" target="_blank" rel="noopener">Register directly →</a>
      </div>
    </div>
    <noscript>
      <p style="margin-top:16px;color:var(--subtle);font-size:13px">
        JavaScript is required for the embedded form.
        <a href="https://forms.matsidesystems.com/r/{{FORMS_SLUG}}" style="color:var(--accent)">Register directly →</a>
      </p>
    </noscript>
  </section>

  <footer>
    <span>Questions? <a href="mailto:{{CONTACT_EMAIL}}">{{CONTACT_EMAIL}}</a></span>
    <span><a href="https://www.matside.org">matside.org</a> · hosted by Matside</span>
  </footer>
</div>

<script>
(function () {
  // Populate optional pieces without breaking when values are empty.
  var hero = document.getElementById('hero');
  var heroSrc = hero.getAttribute('data-src');
  if (heroSrc && heroSrc.indexOf('{{') === -1 && heroSrc.length > 0) {
    hero.style.backgroundImage = 'url(' + heroSrc + ')';
  }

  var logo = document.getElementById('logo');
  var logoSrc = logo.getAttribute('data-src');
  if (logoSrc && logoSrc.indexOf('{{') === -1 && logoSrc.length > 0) {
    logo.setAttribute('src', logoSrc);
    logo.removeAttribute('hidden');
    logo.removeAttribute('alt');
    logo.setAttribute('alt', 'Event logo');
  }

  var about = document.getElementById('about');
  var aboutContent = about.getAttribute('data-content');
  if (aboutContent && aboutContent.indexOf('{{') === -1 && aboutContent.length > 0) {
    about.textContent = aboutContent;
    about.removeAttribute('hidden');
  }

  // Iframe height listener + fallback timeout.
  var shell = document.getElementById('iframe-shell');
  var iframe = document.getElementById('reg-iframe');
  var receivedHeight = false;
  var ALLOWED_ORIGIN = 'https://forms.matsidesystems.com';
  var TIMEOUT_MS = 5000;

  window.addEventListener('message', function (evt) {
    if (evt.origin !== ALLOWED_ORIGIN) return;
    var data = evt.data;
    if (!data || data.type !== 'matsysforms-height' || typeof data.px !== 'number') return;
    if (data.px < 100 || data.px > 10000) return; // sanity clamp
    iframe.style.height = data.px + 'px';
    receivedHeight = true;
  });

  setTimeout(function () {
    if (!receivedHeight) {
      shell.classList.add('fallback');
    }
  }, TIMEOUT_MS);
})();
</script>
</body>
</html>
```

- [ ] **Step 2: Write the template README**

Create `t/_template/README.md`:

```markdown
# Tournament minisite template

This is the source template used by:
- The client-side builder at `/build/`
- The `scripts/rebuild-tournaments.js` regeneration script

## Editing

Edit `index.html` here. Then run `node scripts/rebuild-tournaments.js` to regenerate every tournament folder's `index.html` from its `config.json`.

## Placeholders

Every `{{TOKEN}}` in this file is replaced at build time. The full list lives in the spec (`docs/superpowers/specs/2026-09-03-tournament-minisites-design.md`).

## Not published

This folder starts with `_` so the tournaments index skips it, and any static-site consumer knows to treat it as source rather than a served page.
```

- [ ] **Step 3: Commit**

```bash
git add t/_template/
git commit -m "feat(t): add minisite source template with placeholders and iframe listener"
```

---

### Task 6: Rebuild script — template rendering (happy path)

**Files:**
- Create: `scripts/rebuild-tournaments.js`
- Create: `scripts/rebuild-tournaments.test.mjs`
- Create fixtures: `scripts/__fixtures__/tournaments/big-brawl/config.json`, `scripts/__fixtures__/tournaments/big-brawl/hero.jpg` (a tiny stub), `scripts/__fixtures__/template.html`

- [ ] **Step 1: Create fixture template**

Create `scripts/__fixtures__/template.html`:

```html
<!DOCTYPE html>
<title>{{NAME}} — Matside</title>
<h1>{{NAME}}</h1>
<p>{{DATE_DISPLAY}} · {{VENUE_NAME}}, {{VENUE_LOCATION}}</p>
<div class="pills">
  <span>{{DIVISIONS}}</span>
  <span>{{WEIGHIN}}</span>
  <span>{{WRESTLING}}</span>
</div>
<iframe src="https://forms.matsidesystems.com/r/{{FORMS_SLUG}}?embed=1"></iframe>
<a href="mailto:{{CONTACT_EMAIL}}">{{CONTACT_EMAIL}}</a>
<a href="/t/{{SLUG}}/">/t/{{SLUG}}/</a>
<style>:root { --accent: {{ACCENT_HEX}} }</style>
<meta property="og:image" content="{{OG_IMAGE_URL}}">
<time datetime="{{DATE_ISO}}"></time>
<div data-hero="{{HERO_SRC}}" data-logo="{{LOGO_SRC}}" data-about="{{ABOUT}}"></div>
```

- [ ] **Step 2: Create fixture config and stub image**

Create `scripts/__fixtures__/tournaments/big-brawl/config.json`:

```json
{
  "slug": "big-brawl",
  "formsSlug": "big-brawl-forms",
  "name": "The Big Brawl 2026",
  "date": "2026-01-18",
  "venueName": "Center Ice Arena",
  "venueLocation": "Pittsburgh, PA",
  "divisions": "K–12 · Girls",
  "weighin": "7:00 AM",
  "wrestling": "9:00 AM",
  "contactEmail": "td@example.com",
  "accentHex": "#c9a967",
  "about": "A one-day open tournament for youth through high school.",
  "hero": "hero.jpg",
  "logo": null,
  "generatedAt": "2026-09-03T14:00:00Z",
  "templateVersion": 1
}
```

Create a 1-byte stub image so the missing-image validation test can differentiate present-vs-absent:

```bash
mkdir -p scripts/__fixtures__/tournaments/big-brawl
printf '\xff\xd8\xff\xe0stub' > scripts/__fixtures__/tournaments/big-brawl/hero.jpg
```

- [ ] **Step 3: Write the failing happy-path test**

Create `scripts/rebuild-tournaments.test.mjs`:

```javascript
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, cpSync, readFileSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { rebuild } from './rebuild-tournaments.js'

const FIXTURES = path.resolve('scripts/__fixtures__')

function setupTempRoot() {
  const root = mkdtempSync(path.join(tmpdir(), 'matside-rebuild-'))
  cpSync(path.join(FIXTURES, 'template.html'), path.join(root, 't', '_template', 'index.html'), { recursive: false, force: true, errorOnExist: false })
  // Ensure the template dir exists first.
  return root
}

function seedTemplate(root) {
  const templateDir = path.join(root, 't', '_template')
  const { mkdirSync } = require('node:fs')
  mkdirSync(templateDir, { recursive: true })
  cpSync(path.join(FIXTURES, 'template.html'), path.join(templateDir, 'index.html'))
}

function seedTournament(root, slug) {
  const dir = path.join(root, 't', slug)
  cpSync(path.join(FIXTURES, 'tournaments', 'big-brawl'), dir, { recursive: true })
}

test('happy path — renders all tokens', async () => {
  const root = setupTempRoot()
  seedTemplate(root)
  seedTournament(root, 'big-brawl')

  await rebuild({ root })

  const out = readFileSync(path.join(root, 't', 'big-brawl', 'index.html'), 'utf8')

  assert.match(out, /The Big Brawl 2026/)
  assert.match(out, /Jan 18, 2026/)
  assert.match(out, /Center Ice Arena/)
  assert.match(out, /Pittsburgh, PA/)
  assert.match(out, /K–12 · Girls/)
  assert.match(out, /7:00 AM/)
  assert.match(out, /9:00 AM/)
  assert.match(out, /td@example\.com/)
  assert.match(out, /forms\.matsidesystems\.com\/r\/big-brawl-forms\?embed=1/)
  assert.match(out, /--accent: #c9a967/)
  assert.match(out, /datetime="2026-01-18"/)
  assert.match(out, /data-hero="hero\.jpg"/)
  assert.doesNotMatch(out, /\{\{[A-Z_]+\}\}/) // no unreplaced tokens
})
```

Note: the test uses ESM (`.mjs`) since matside.org has no package.json to declare `"type": "module"`. The rebuild script itself is `.js` but uses CommonJS-friendly `import` via top-level export naming. Adjust to `.mjs` on both files if Node balks — Node 24 auto-detects ESM from the presence of `import`/`export`.

- [ ] **Step 4: Run test to verify it fails**

```bash
node --test scripts/rebuild-tournaments.test.mjs
```

Expected: FAIL — `rebuild-tournaments.js` doesn't exist.

- [ ] **Step 5: Implement the rebuild script (happy path only)**

Create `scripts/rebuild-tournaments.js`:

```javascript
// Node built-ins only. matside.org has no package.json — must run bare.
import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DEFAULT_ROOT = path.resolve(__dirname, '..')

const KNOWN_TEMPLATE_VERSIONS = new Set([1])

function formatDateDisplay(iso) {
  // "2026-01-18" -> "Jan 18, 2026"
  const [y, m, d] = iso.split('-').map(Number)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[m - 1]} ${d}, ${y}`
}

function computeOgImageUrl(config) {
  if (config.hero) return `https://www.matside.org/t/${config.slug}/${config.hero}`
  return 'https://www.matside.org/apple-touch-icon.png' // sensible fallback
}

function renderTemplate(template, config) {
  const tokens = {
    SLUG: config.slug,
    FORMS_SLUG: config.formsSlug,
    NAME: config.name,
    DATE_ISO: config.date,
    DATE_DISPLAY: formatDateDisplay(config.date),
    VENUE_NAME: config.venueName,
    VENUE_LOCATION: config.venueLocation,
    DIVISIONS: config.divisions,
    WEIGHIN: config.weighin,
    WRESTLING: config.wrestling,
    CONTACT_EMAIL: config.contactEmail,
    ACCENT_HEX: config.accentHex,
    ABOUT: config.about ?? '',
    HERO_SRC: config.hero ?? '',
    LOGO_SRC: config.logo ?? '',
    OG_IMAGE_URL: computeOgImageUrl(config),
  }
  let out = template
  for (const [key, value] of Object.entries(tokens)) {
    out = out.split(`{{${key}}}`).join(String(value))
  }
  return out
}

export async function rebuild({ root = DEFAULT_ROOT } = {}) {
  const templatePath = path.join(root, 't', '_template', 'index.html')
  if (!existsSync(templatePath)) {
    throw new Error(`Template not found: ${templatePath}`)
  }
  const template = readFileSync(templatePath, 'utf8')

  const tDir = path.join(root, 't')
  const entries = readdirSync(tDir, { withFileTypes: true })

  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    if (entry.name.startsWith('_')) continue

    const slug = entry.name
    const configPath = path.join(tDir, slug, 'config.json')
    if (!existsSync(configPath)) continue

    const raw = readFileSync(configPath, 'utf8')
    let config
    try {
      config = JSON.parse(raw)
    } catch (err) {
      throw new Error(`${configPath}: invalid JSON — ${err.message}`)
    }

    const html = renderTemplate(template, config)
    const outPath = path.join(tDir, slug, 'index.html')
    writeFileSync(outPath, html, 'utf8')
    console.log(`${slug}: regenerated`)
  }
}

// CLI entry
if (import.meta.url === `file://${process.argv[1]}`) {
  rebuild().catch((err) => {
    console.error(err.message)
    process.exit(1)
  })
}
```

- [ ] **Step 6: Adjust the test — Node 24 needs `import` in `.mjs`, and cjs `require` in a `.mjs` file won't work**

Rewrite `scripts/rebuild-tournaments.test.mjs` (replaces file):

```javascript
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, cpSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { rebuild } from './rebuild-tournaments.js'

const FIXTURES = path.resolve('scripts/__fixtures__')

function makeRoot() {
  const root = mkdtempSync(path.join(tmpdir(), 'matside-rebuild-'))
  mkdirSync(path.join(root, 't', '_template'), { recursive: true })
  cpSync(path.join(FIXTURES, 'template.html'), path.join(root, 't', '_template', 'index.html'))
  return root
}

function seed(root, slug, fixture = 'big-brawl') {
  const dst = path.join(root, 't', slug)
  cpSync(path.join(FIXTURES, 'tournaments', fixture), dst, { recursive: true })
}

test('happy path — renders all tokens', async () => {
  const root = makeRoot()
  seed(root, 'big-brawl')

  await rebuild({ root })

  const out = readFileSync(path.join(root, 't', 'big-brawl', 'index.html'), 'utf8')

  assert.match(out, /The Big Brawl 2026/)
  assert.match(out, /Jan 18, 2026/)
  assert.match(out, /Center Ice Arena/)
  assert.match(out, /Pittsburgh, PA/)
  assert.match(out, /K–12 · Girls/)
  assert.match(out, /7:00 AM/)
  assert.match(out, /9:00 AM/)
  assert.match(out, /td@example\.com/)
  assert.match(out, /forms\.matsidesystems\.com\/r\/big-brawl-forms\?embed=1/)
  assert.match(out, /--accent: #c9a967/)
  assert.match(out, /datetime="2026-01-18"/)
  assert.match(out, /data-hero="hero\.jpg"/)
  assert.doesNotMatch(out, /\{\{[A-Z_]+\}\}/)
})
```

Also — because matside.org has no package.json, Node 24 needs a hint that `rebuild-tournaments.js` is ESM. Rename it to `.mjs` too:

```bash
mv scripts/rebuild-tournaments.js scripts/rebuild-tournaments.mjs
```

And update the test import:

```javascript
import { rebuild } from './rebuild-tournaments.mjs'
```

- [ ] **Step 7: Run test to verify it passes**

```bash
node --test scripts/rebuild-tournaments.test.mjs
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add scripts/rebuild-tournaments.mjs scripts/rebuild-tournaments.test.mjs scripts/__fixtures__/
git commit -m "feat(scripts): rebuild-tournaments script — happy-path token rendering"
```

---

### Task 7: Rebuild script — validation

**Files:**
- Modify: `scripts/rebuild-tournaments.mjs`
- Modify: `scripts/rebuild-tournaments.test.mjs`
- Create: `scripts/__fixtures__/tournaments/malformed/config.json`
- Create: `scripts/__fixtures__/tournaments/missing-image/config.json`
- Create: `scripts/__fixtures__/tournaments/slug-mismatch/config.json`
- Create: `scripts/__fixtures__/tournaments/bad-version/config.json`

- [ ] **Step 1: Create malformed fixture (invalid JSON)**

```bash
mkdir -p scripts/__fixtures__/tournaments/malformed
printf '{ this is not valid json' > scripts/__fixtures__/tournaments/malformed/config.json
```

- [ ] **Step 2: Create missing-image fixture (references hero.jpg that doesn't exist)**

Create `scripts/__fixtures__/tournaments/missing-image/config.json`:

```json
{
  "slug": "missing-image",
  "formsSlug": "missing-image",
  "name": "Missing Image Event",
  "date": "2026-02-01",
  "venueName": "Nowhere",
  "venueLocation": "Nowhere, NA",
  "divisions": "K–12",
  "weighin": "7:00 AM",
  "wrestling": "9:00 AM",
  "contactEmail": "a@b.co",
  "accentHex": "#000000",
  "hero": "hero-missing.jpg",
  "logo": null,
  "templateVersion": 1
}
```

- [ ] **Step 3: Create slug-mismatch fixture (config.slug doesn't match folder)**

Create `scripts/__fixtures__/tournaments/slug-mismatch/config.json`:

```json
{
  "slug": "different-slug",
  "formsSlug": "different-slug",
  "name": "Slug Mismatch Event",
  "date": "2026-02-01",
  "venueName": "Nowhere",
  "venueLocation": "Nowhere, NA",
  "divisions": "K–12",
  "weighin": "7:00 AM",
  "wrestling": "9:00 AM",
  "contactEmail": "a@b.co",
  "accentHex": "#000000",
  "hero": null,
  "logo": null,
  "templateVersion": 1
}
```

- [ ] **Step 4: Create bad-version fixture**

Create `scripts/__fixtures__/tournaments/bad-version/config.json`:

```json
{
  "slug": "bad-version",
  "formsSlug": "bad-version",
  "name": "Bad Version",
  "date": "2026-02-01",
  "venueName": "Nowhere",
  "venueLocation": "Nowhere, NA",
  "divisions": "K–12",
  "weighin": "7:00 AM",
  "wrestling": "9:00 AM",
  "contactEmail": "a@b.co",
  "accentHex": "#000000",
  "hero": null,
  "logo": null,
  "templateVersion": 999
}
```

- [ ] **Step 5: Write four failing validation tests**

Append to `scripts/rebuild-tournaments.test.mjs`:

```javascript
test('rejects malformed JSON', async () => {
  const root = makeRoot()
  seed(root, 'malformed', 'malformed')
  await assert.rejects(rebuild({ root }), /invalid JSON/i)
})

test('rejects missing referenced image', async () => {
  const root = makeRoot()
  seed(root, 'missing-image', 'missing-image')
  await assert.rejects(rebuild({ root }), /hero-missing\.jpg.*not found/i)
})

test('rejects slug/folder mismatch', async () => {
  const root = makeRoot()
  seed(root, 'slug-mismatch', 'slug-mismatch')
  await assert.rejects(rebuild({ root }), /slug mismatch|does not match/i)
})

test('rejects unknown templateVersion', async () => {
  const root = makeRoot()
  seed(root, 'bad-version', 'bad-version')
  await assert.rejects(rebuild({ root }), /template version|templateVersion/i)
})
```

- [ ] **Step 6: Run tests to verify they fail**

```bash
node --test scripts/rebuild-tournaments.test.mjs
```

Expected: 4 FAIL (validations not yet implemented), happy path PASS.

- [ ] **Step 7: Add validation to `scripts/rebuild-tournaments.mjs`**

Modify the loop in `rebuild()`:

```javascript
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    if (entry.name.startsWith('_')) continue

    const slug = entry.name
    const configPath = path.join(tDir, slug, 'config.json')
    if (!existsSync(configPath)) continue

    const raw = readFileSync(configPath, 'utf8')
    let config
    try {
      config = JSON.parse(raw)
    } catch (err) {
      throw new Error(`${configPath}: invalid JSON — ${err.message}`)
    }

    if (!KNOWN_TEMPLATE_VERSIONS.has(config.templateVersion)) {
      throw new Error(`${configPath}: unknown templateVersion ${config.templateVersion}`)
    }

    if (config.slug !== slug) {
      throw new Error(`${configPath}: slug mismatch — folder is "${slug}" but config.slug is "${config.slug}"`)
    }

    for (const key of ['hero', 'logo']) {
      const filename = config[key]
      if (!filename) continue
      const assetPath = path.join(tDir, slug, filename)
      if (!existsSync(assetPath)) {
        throw new Error(`${configPath}: ${key} references ${filename} but ${filename} not found in folder`)
      }
    }

    const html = renderTemplate(template, config)
    const outPath = path.join(tDir, slug, 'index.html')
    writeFileSync(outPath, html, 'utf8')
    console.log(`${slug}: regenerated`)
  }
```

- [ ] **Step 8: Run all tests to verify they pass**

```bash
node --test scripts/rebuild-tournaments.test.mjs
```

Expected: 5 PASS.

- [ ] **Step 9: Commit**

```bash
git add scripts/rebuild-tournaments.mjs scripts/rebuild-tournaments.test.mjs scripts/__fixtures__/
git commit -m "feat(scripts): validate config (JSON, template version, slug match, image refs)"
```

---

### Task 8: Rebuild script — tournaments.json manifest

**Files:**
- Modify: `scripts/rebuild-tournaments.mjs`
- Modify: `scripts/rebuild-tournaments.test.mjs`

- [ ] **Step 1: Write the failing test**

Append to `scripts/rebuild-tournaments.test.mjs`:

```javascript
test('emits tournaments.json manifest sorted by date ascending', async () => {
  const root = makeRoot()
  seed(root, 'big-brawl')

  // Seed a second tournament with an earlier date
  const early = path.join(root, 't', 'early-event')
  mkdirSync(early, { recursive: true })
  const cfg = JSON.parse(readFileSync(path.join(FIXTURES, 'tournaments', 'big-brawl', 'config.json'), 'utf8'))
  cfg.slug = 'early-event'
  cfg.date = '2026-01-01'
  cfg.name = 'Early Event'
  cfg.hero = null
  writeFileSync(path.join(early, 'config.json'), JSON.stringify(cfg, null, 2))

  await rebuild({ root })

  const manifest = JSON.parse(readFileSync(path.join(root, 't', 'tournaments.json'), 'utf8'))
  assert.equal(manifest.length, 2)
  assert.equal(manifest[0].slug, 'early-event')
  assert.equal(manifest[1].slug, 'big-brawl')
  assert.deepEqual(Object.keys(manifest[0]).sort(), ['date', 'name', 'slug', 'venueLocation'])
})
```

Add the writeFileSync import at the top of the test file:

```javascript
import { mkdtempSync, mkdirSync, cpSync, readFileSync, writeFileSync } from 'node:fs'
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
node --test scripts/rebuild-tournaments.test.mjs
```

Expected: manifest test FAILs — tournaments.json not written.

- [ ] **Step 3: Emit the manifest**

Modify `scripts/rebuild-tournaments.mjs` — collect entries during the loop and write manifest at the end:

```javascript
export async function rebuild({ root = DEFAULT_ROOT } = {}) {
  const templatePath = path.join(root, 't', '_template', 'index.html')
  if (!existsSync(templatePath)) {
    throw new Error(`Template not found: ${templatePath}`)
  }
  const template = readFileSync(templatePath, 'utf8')

  const tDir = path.join(root, 't')
  const entries = readdirSync(tDir, { withFileTypes: true })
  const manifest = []

  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    if (entry.name.startsWith('_')) continue

    const slug = entry.name
    const configPath = path.join(tDir, slug, 'config.json')
    if (!existsSync(configPath)) continue

    const raw = readFileSync(configPath, 'utf8')
    let config
    try {
      config = JSON.parse(raw)
    } catch (err) {
      throw new Error(`${configPath}: invalid JSON — ${err.message}`)
    }

    if (!KNOWN_TEMPLATE_VERSIONS.has(config.templateVersion)) {
      throw new Error(`${configPath}: unknown templateVersion ${config.templateVersion}`)
    }

    if (config.slug !== slug) {
      throw new Error(`${configPath}: slug mismatch — folder is "${slug}" but config.slug is "${config.slug}"`)
    }

    for (const key of ['hero', 'logo']) {
      const filename = config[key]
      if (!filename) continue
      const assetPath = path.join(tDir, slug, filename)
      if (!existsSync(assetPath)) {
        throw new Error(`${configPath}: ${key} references ${filename} but ${filename} not found in folder`)
      }
    }

    const html = renderTemplate(template, config)
    const outPath = path.join(tDir, slug, 'index.html')
    writeFileSync(outPath, html, 'utf8')
    console.log(`${slug}: regenerated`)

    manifest.push({
      slug: config.slug,
      name: config.name,
      date: config.date,
      venueLocation: config.venueLocation,
    })
  }

  manifest.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
  writeFileSync(path.join(tDir, 'tournaments.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf8')
  console.log(`manifest: ${manifest.length} tournaments`)
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
node --test scripts/rebuild-tournaments.test.mjs
```

Expected: 6 PASS.

- [ ] **Step 5: Seed an initial empty manifest so the index page works before any tournament exists**

```bash
mkdir -p t
printf '[]\n' > t/tournaments.json
```

- [ ] **Step 6: Commit**

```bash
git add scripts/rebuild-tournaments.mjs scripts/rebuild-tournaments.test.mjs t/tournaments.json
git commit -m "feat(scripts): emit tournaments.json manifest sorted by date"
```

---

### Task 9: Tournaments index page (`/t/index.html`)

**Files:**
- Create: `t/index.html`

- [ ] **Step 1: Write the page**

Create `t/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Tournaments — Matside</title>
<meta name="description" content="Wrestling tournaments hosted by Matside.">
<link rel="canonical" href="https://www.matside.org/t/">
<link rel="icon" href="/favicon.ico">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap">
<style>
:root { --bg:#0b0d12; --surface:#161a22; --border:#2a2f3a; --text:#e6e8ee; --muted:#8b90a0; --subtle:#a8adba; --accent:#c9a967; }
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body { background: var(--bg); color: var(--text); font-family: 'Inter', system-ui, sans-serif; line-height: 1.5; }
.page { max-width: 720px; margin: 0 auto; padding: 32px 20px 64px; }
.crumb { font-size: 11px; color: var(--muted); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 12px; }
.crumb a { color: var(--muted); text-decoration: none; }
h1 { font-size: 32px; font-weight: 800; letter-spacing: -0.01em; margin: 0 0 4px; }
.subtitle { color: var(--subtle); font-size: 14px; margin: 0 0 32px; }
h2 { font-size: 12px; color: var(--muted); letter-spacing: 0.15em; text-transform: uppercase; margin: 32px 0 12px; }
.card { display: block; background: var(--surface); border: 1px solid var(--border); border-left: 3px solid var(--accent); padding: 14px 16px; border-radius: 4px; margin-bottom: 8px; text-decoration: none; color: inherit; transition: border-color 0.15s; }
.card:hover { border-color: var(--accent); }
.card-name { font-size: 16px; font-weight: 600; }
.card-meta { font-size: 12px; color: var(--muted); margin-top: 4px; }
details summary { cursor: pointer; color: var(--muted); font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 12px; }
details[open] summary { color: var(--text); }
.empty { color: var(--subtle); font-size: 14px; padding: 24px; text-align: center; background: var(--surface); border: 1px solid var(--border); border-radius: 4px; }
footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid var(--border); font-size: 12px; color: var(--muted); }
footer a { color: var(--muted); }
</style>
</head>
<body>
<div class="page">
  <div class="crumb"><a href="/">Matside</a></div>
  <h1>Tournaments</h1>
  <p class="subtitle">Wrestling events hosted or supported by Matside.</p>

  <div id="content"></div>

  <footer>
    <a href="/">matside.org</a>
  </footer>
</div>

<script>
(function () {
  var content = document.getElementById('content');

  function card(t) {
    var d = new Date(t.date + 'T00:00:00');
    var display = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    var el = document.createElement('a');
    el.className = 'card';
    el.href = '/t/' + t.slug + '/';
    var nameEl = document.createElement('div');
    nameEl.className = 'card-name';
    nameEl.textContent = t.name;
    var metaEl = document.createElement('div');
    metaEl.className = 'card-meta';
    metaEl.textContent = display + ' · ' + t.venueLocation;
    el.appendChild(nameEl);
    el.appendChild(metaEl);
    return el;
  }

  fetch('/t/tournaments.json', { cache: 'no-cache' })
    .then(function (r) { return r.json(); })
    .then(function (list) {
      var today = new Date().toISOString().slice(0, 10);
      var upcoming = list.filter(function (t) { return t.date >= today; });
      var past = list.filter(function (t) { return t.date < today; }).reverse();

      if (list.length === 0) {
        var empty = document.createElement('div');
        empty.className = 'empty';
        empty.textContent = 'No public tournaments right now — check back soon.';
        content.appendChild(empty);
        return;
      }

      if (upcoming.length) {
        var h = document.createElement('h2');
        h.textContent = 'Upcoming';
        content.appendChild(h);
        upcoming.forEach(function (t) { content.appendChild(card(t)); });
      }

      if (past.length) {
        var details = document.createElement('details');
        var summary = document.createElement('summary');
        summary.textContent = 'Past (' + past.length + ')';
        details.appendChild(summary);
        past.forEach(function (t) { details.appendChild(card(t)); });
        content.appendChild(details);
      }
    })
    .catch(function () {
      var empty = document.createElement('div');
      empty.className = 'empty';
      empty.textContent = 'Tournament list unavailable.';
      content.appendChild(empty);
    });
})();
</script>
</body>
</html>
```

- [ ] **Step 2: Verify locally**

```bash
python3 -m http.server 8000 &
SERVER_PID=$!
sleep 1
curl -s http://localhost:8000/t/ | grep -q 'Tournaments' && echo OK
kill $SERVER_PID
```

Expected: `OK` printed.

- [ ] **Step 3: Commit**

```bash
git add t/index.html
git commit -m "feat(t): tournaments index page reading tournaments.json manifest"
```

---

### Task 10a: Builder — HTML shell + form UI

**Files:**
- Create: `build/index.html`
- Create: `build/build.css`

- [ ] **Step 1: Write the builder HTML**

Create `build/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Tournament Minisite Builder — Matside</title>
<meta name="robots" content="noindex, nofollow">
<link rel="icon" href="/favicon.ico">
<link rel="stylesheet" href="./build.css">
</head>
<body>
<div class="page">
  <header class="header">
    <div class="crumb"><a href="/">Matside</a></div>
    <h1>Tournament Minisite Builder</h1>
    <p class="subtitle">Fill the form, upload images, download the zip, drop it into <code>t/[slug]/</code>, push.</p>
  </header>

  <form id="builder-form" class="builder">
    <div class="col-form">
      <fieldset>
        <legend>Event basics</legend>
        <label>Slug (URL segment)
          <input name="slug" type="text" maxlength="60" required>
          <small class="hint">Auto-slugified from the name if left empty. Used as <code>matside.org/t/[slug]/</code>.</small>
        </label>
        <label>Event name
          <input name="name" type="text" required>
        </label>
        <label>Event date
          <input name="date" type="date" required>
        </label>
        <label>Venue name
          <input name="venueName" type="text" required>
        </label>
        <label>Venue location (city, state)
          <input name="venueLocation" type="text" placeholder="Pittsburgh, PA" required>
        </label>
      </fieldset>

      <fieldset>
        <legend>Key facts (three pills at the top)</legend>
        <label>Divisions
          <input name="divisions" type="text" placeholder="K–12 · Girls" required>
        </label>
        <label>Weigh-in time
          <input name="weighin" type="text" placeholder="7:00 AM" required>
        </label>
        <label>Wrestling start
          <input name="wrestling" type="text" placeholder="9:00 AM" required>
        </label>
      </fieldset>

      <fieldset>
        <legend>Registration form binding</legend>
        <label>matsidesystems-forms slug
          <input name="formsSlug" type="text" required>
          <small class="hint">The <code>/r/[slug]</code> slug on matsidesystems-forms. Often the same as the minisite slug, but doesn't have to be.</small>
        </label>
      </fieldset>

      <fieldset>
        <legend>Brand</legend>
        <label>Accent color (hex)
          <input name="accentHex" type="text" placeholder="#c9a967" required>
          <small class="hint" id="contrast-hint"></small>
        </label>
        <label>Hero image (optional; jpg/png, resized to 1600×900)
          <input name="hero" type="file" accept="image/jpeg,image/png">
        </label>
        <label>Event logo (optional; svg/png)
          <input name="logo" type="file" accept="image/svg+xml,image/png">
        </label>
      </fieldset>

      <fieldset>
        <legend>Footer</legend>
        <label>Contact email
          <input name="contactEmail" type="email" required>
        </label>
      </fieldset>

      <fieldset>
        <legend>Optional</legend>
        <label>About paragraph
          <textarea name="about" rows="4" placeholder="A one-day open tournament for youth through high school."></textarea>
        </label>
      </fieldset>
    </div>

    <aside class="col-action">
      <div class="sticky">
        <button type="submit" id="generate-btn" disabled>Generate & Download Zip</button>
        <p class="hint" id="missing-hint">Fill required fields to enable.</p>
        <hr>
        <p class="hint"><strong>After download:</strong></p>
        <ol class="hint">
          <li>Unzip into <code>matside.org/t/&lt;slug&gt;/</code></li>
          <li>Run <code>node scripts/rebuild-tournaments.mjs</code></li>
          <li><code>git commit &amp;&amp; git push</code></li>
        </ol>
      </div>
    </aside>
  </form>
</div>

<script src="./vendor/jszip.min.js"></script>
<script src="./build.js"></script>
</body>
</html>
```

- [ ] **Step 2: Write the builder CSS**

Create `build/build.css`:

```css
:root { --bg:#0b0d12; --surface:#161a22; --border:#2a2f3a; --text:#e6e8ee; --muted:#8b90a0; --subtle:#a8adba; --accent:#c9a967; --danger:#e05055; }
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; background: var(--bg); color: var(--text); font-family: 'Inter', system-ui, sans-serif; line-height: 1.5; }
.page { max-width: 1100px; margin: 0 auto; padding: 32px 20px 64px; }
.crumb { font-size: 11px; color: var(--muted); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 12px; }
.crumb a { color: var(--muted); text-decoration: none; }
h1 { font-size: 28px; font-weight: 800; margin: 0 0 4px; }
.subtitle { color: var(--subtle); font-size: 14px; margin: 0 0 32px; }
code { background: var(--surface); padding: 1px 6px; border-radius: 3px; font-size: 12px; }

.builder { display: grid; grid-template-columns: 1fr 320px; gap: 32px; align-items: start; }
@media (max-width: 900px) { .builder { grid-template-columns: 1fr; } .col-action .sticky { position: static; } }

fieldset { border: 1px solid var(--border); border-radius: 6px; padding: 16px 18px; margin: 0 0 20px; background: var(--surface); }
legend { font-size: 11px; color: var(--muted); letter-spacing: 0.1em; text-transform: uppercase; padding: 0 8px; }
label { display: block; font-size: 13px; color: var(--subtle); margin-bottom: 14px; }
input[type=text], input[type=email], input[type=date], textarea, input[type=file] { width: 100%; margin-top: 4px; padding: 8px 10px; background: var(--bg); color: var(--text); border: 1px solid var(--border); border-radius: 4px; font: inherit; }
input:focus, textarea:focus { outline: 2px solid var(--accent); outline-offset: 1px; }
input[aria-invalid=true] { border-color: var(--danger); }
textarea { resize: vertical; min-height: 80px; }
.hint { color: var(--muted); font-size: 11px; margin: 4px 0 0; }
.hint.danger { color: var(--danger); }

.col-action .sticky { position: sticky; top: 24px; background: var(--surface); border: 1px solid var(--border); border-radius: 6px; padding: 20px; }
button { display: block; width: 100%; padding: 12px 16px; background: var(--accent); color: #000; border: 0; border-radius: 4px; font: inherit; font-weight: 600; cursor: pointer; }
button:disabled { background: var(--border); color: var(--muted); cursor: not-allowed; }
button:hover:not(:disabled) { filter: brightness(1.1); }
hr { border: 0; border-top: 1px solid var(--border); margin: 16px 0; }
.col-action ol.hint { padding-left: 20px; margin: 8px 0 0; }
.col-action ol.hint li { margin-bottom: 4px; }
```

- [ ] **Step 3: Verify locally (no JS yet, form should render)**

```bash
python3 -m http.server 8000 &
SERVER_PID=$!
sleep 1
curl -s http://localhost:8000/build/ | grep -q 'Tournament Minisite Builder' && echo OK
kill $SERVER_PID
```

Expected: `OK`.

- [ ] **Step 4: Commit**

```bash
git add build/index.html build/build.css
git commit -m "feat(build): minisite builder HTML shell and Midnight-styled CSS"
```

---

### Task 10b: Builder — validation, slugify, contrast check

**Files:**
- Create: `build/build.js`

- [ ] **Step 1: Write the initial script**

Create `build/build.js`:

```javascript
(function () {
  const form = document.getElementById('builder-form')
  const btn = document.getElementById('generate-btn')
  const missingHint = document.getElementById('missing-hint')
  const contrastHint = document.getElementById('contrast-hint')

  const REQUIRED_FIELDS = [
    'slug', 'name', 'date', 'venueName', 'venueLocation',
    'divisions', 'weighin', 'wrestling',
    'formsSlug', 'accentHex', 'contactEmail',
  ]

  function slugify(s) {
    return String(s || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 60)
  }

  function normalizeHex(s) {
    if (!s) return ''
    let v = String(s).trim().toLowerCase().replace(/[^#0-9a-f]/g, '')
    if (v[0] !== '#') v = '#' + v
    if (/^#[0-9a-f]{3}$/.test(v)) {
      v = '#' + v[1] + v[1] + v[2] + v[2] + v[3] + v[3]
    }
    return /^#[0-9a-f]{6}$/.test(v) ? v : ''
  }

  function luminance(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255
    const g = parseInt(hex.slice(3, 5), 16) / 255
    const b = parseInt(hex.slice(5, 7), 16) / 255
    const f = (c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4))
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
  }

  function contrastAgainstBg(hex) {
    // Midnight background is #0b0d12 — luminance ~0.005
    const bgL = luminance('#0b0d12')
    const fgL = luminance(hex)
    return (Math.max(bgL, fgL) + 0.05) / (Math.min(bgL, fgL) + 0.05)
  }

  function collectValues() {
    const data = new FormData(form)
    const values = {}
    for (const [k, v] of data.entries()) {
      if (v instanceof File) continue
      values[k] = String(v).trim()
    }
    return values
  }

  function validate() {
    const v = collectValues()
    const missing = []

    for (const f of REQUIRED_FIELDS) {
      if (!v[f]) missing.push(f)
    }

    // Hex normalize + validate
    const hex = normalizeHex(v.accentHex)
    const hexInput = form.querySelector('[name=accentHex]')
    hexInput.setAttribute('aria-invalid', hex ? 'false' : 'true')
    if (!hex && v.accentHex) missing.push('accentHex (invalid hex)')

    if (hex) {
      const ratio = contrastAgainstBg(hex)
      if (ratio < 3) {
        contrastHint.textContent = `Contrast ${ratio.toFixed(1)}:1 — may be hard to read on dark background`
        contrastHint.classList.add('danger')
      } else {
        contrastHint.textContent = `Contrast ${ratio.toFixed(1)}:1 — looks good`
        contrastHint.classList.remove('danger')
      }
    } else {
      contrastHint.textContent = ''
      contrastHint.classList.remove('danger')
    }

    // Email
    const emailInput = form.querySelector('[name=contactEmail]')
    if (v.contactEmail && !/^.+@.+\..+$/.test(v.contactEmail)) {
      emailInput.setAttribute('aria-invalid', 'true')
      missing.push('contactEmail (invalid)')
    } else {
      emailInput.setAttribute('aria-invalid', 'false')
    }

    // Slug validation
    const slugInput = form.querySelector('[name=slug]')
    if (v.slug && !/^[a-z0-9-]+$/.test(v.slug)) {
      slugInput.setAttribute('aria-invalid', 'true')
      missing.push('slug (letters, digits, hyphens only)')
    } else {
      slugInput.setAttribute('aria-invalid', 'false')
    }

    btn.disabled = missing.length > 0
    missingHint.textContent = missing.length === 0
      ? 'Ready to generate.'
      : `Missing: ${missing.slice(0, 3).join(', ')}${missing.length > 3 ? ` (+${missing.length - 3} more)` : ''}`
    return missing.length === 0 ? { values: { ...v, accentHex: hex } } : null
  }

  // Auto-slugify: if name changes and slug is empty (or was auto-generated), update slug
  let slugTouched = false
  form.querySelector('[name=slug]').addEventListener('input', () => { slugTouched = true; validate() })
  form.querySelector('[name=name]').addEventListener('input', (e) => {
    if (!slugTouched) form.querySelector('[name=slug]').value = slugify(e.target.value)
    validate()
  })
  form.querySelector('[name=accentHex]').addEventListener('blur', (e) => {
    const n = normalizeHex(e.target.value)
    if (n) e.target.value = n
    validate()
  })

  form.addEventListener('input', validate)
  form.addEventListener('change', validate)

  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const result = validate()
    if (!result) return
    // Zip generation added in a later task.
    alert('Validation passed — zip generation not yet implemented.')
  })

  // Initial state
  validate()

  // Expose for later tasks
  window.__builder = { slugify, normalizeHex, luminance, contrastAgainstBg, collectValues, validate }
})()
```

- [ ] **Step 2: Verify locally**

```bash
python3 -m http.server 8000 &
SERVER_PID=$!
sleep 1
open http://localhost:8000/build/
# Manual: type in Name → slug auto-fills; type invalid hex → aria-invalid appears; submit → alert fires.
# Kill server after visual confirmation.
kill $SERVER_PID
```

- [ ] **Step 3: Commit**

```bash
git add build/build.js
git commit -m "feat(build): form validation, slugify, hex normalization, contrast hint"
```

---

### Task 10c: Builder — image processing

**Files:**
- Modify: `build/build.js`

- [ ] **Step 1: Add image processing helpers to `build/build.js`**

Prepend these helpers before the IIFE, or add inside the IIFE before `form.addEventListener('submit', ...)`:

```javascript
  const MAX_HERO_BYTES = 8 * 1024 * 1024
  const MAX_LOGO_BYTES = 2 * 1024 * 1024
  const MIN_HERO_LONG_SIDE = 800

  function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const fr = new FileReader()
      fr.onload = () => resolve(fr.result)
      fr.onerror = () => reject(new Error('Could not read file'))
      fr.readAsDataURL(file)
    })
  }

  function readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const fr = new FileReader()
      fr.onload = () => resolve(fr.result)
      fr.onerror = () => reject(new Error('Could not read file'))
      fr.readAsText(file)
    })
  }

  function loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('Could not decode image'))
      img.src = url
    })
  }

  async function processHero(file) {
    if (!file) return null
    if (file.size > MAX_HERO_BYTES) throw new Error(`Hero image too large (max 8 MB, got ${(file.size / 1024 / 1024).toFixed(1)} MB)`)
    const dataUrl = await readFileAsDataURL(file)
    const img = await loadImage(dataUrl)
    const longSide = Math.max(img.width, img.height)
    if (longSide < MIN_HERO_LONG_SIDE) throw new Error(`Hero image too small (min ${MIN_HERO_LONG_SIDE}px on long side, got ${longSide}px)`)

    const MAX_W = 1600
    const MAX_H = 900
    const ratio = Math.min(MAX_W / img.width, MAX_H / img.height, 1)
    const w = Math.round(img.width * ratio)
    const h = Math.round(img.height * ratio)

    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    canvas.getContext('2d').drawImage(img, 0, 0, w, h)

    const blob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.82))
    if (!blob) throw new Error('Could not encode hero image')
    return { filename: 'hero.jpg', blob }
  }

  function sanitizeSvg(svgText) {
    // Remove <script> tags and any on* attributes. Conservative but not exhaustive.
    let out = svgText.replace(/<script[\s\S]*?<\/script>/gi, '')
    out = out.replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, '')
    out = out.replace(/\son[a-z]+\s*=\s*'[^']*'/gi, '')
    return out
  }

  async function processLogo(file) {
    if (!file) return null
    if (file.size > MAX_LOGO_BYTES) throw new Error(`Logo too large (max 2 MB, got ${(file.size / 1024 / 1024).toFixed(1)} MB)`)

    if (file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')) {
      const text = await readFileAsText(file)
      const sanitized = sanitizeSvg(text)
      return { filename: 'logo.svg', blob: new Blob([sanitized], { type: 'image/svg+xml' }) }
    }

    // PNG/JPG path — resize to max 512x512, keep PNG for alpha
    const dataUrl = await readFileAsDataURL(file)
    const img = await loadImage(dataUrl)
    const MAX = 512
    const ratio = Math.min(MAX / img.width, MAX / img.height, 1)
    const w = Math.round(img.width * ratio)
    const h = Math.round(img.height * ratio)
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    canvas.getContext('2d').drawImage(img, 0, 0, w, h)
    const blob = await new Promise((res) => canvas.toBlob(res, 'image/png'))
    if (!blob) throw new Error('Could not encode logo')
    return { filename: 'logo.png', blob }
  }

  window.__builder.processHero = processHero
  window.__builder.processLogo = processLogo
  window.__builder.sanitizeSvg = sanitizeSvg
```

- [ ] **Step 2: Verify manually**

Open the builder, upload a large (>8MB) image → the submit path (added next task) will surface the error. For this task, no automated test — validation happens inside submit handler which the next task fills in.

- [ ] **Step 3: Commit**

```bash
git add build/build.js
git commit -m "feat(build): client-side hero/logo processing with SVG sanitize"
```

---

### Task 10d: Builder — zip generation

**Files:**
- Create: `build/vendor/jszip.min.js` (downloaded)
- Modify: `build/build.js`

- [ ] **Step 1: Vendor JSZip**

```bash
mkdir -p build/vendor
curl -sL https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js -o build/vendor/jszip.min.js
# Sanity check: file is > 90KB
wc -c build/vendor/jszip.min.js
```

Expected: file size around 96KB, no errors.

- [ ] **Step 2: Replace the submit handler in `build/build.js` with the zip generator**

Replace the existing submit handler:

```javascript
  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const result = validate()
    if (!result) return

    btn.disabled = true
    btn.textContent = 'Generating…'
    try {
      const values = result.values
      const heroInput = form.querySelector('[name=hero]').files[0] || null
      const logoInput = form.querySelector('[name=logo]').files[0] || null

      const hero = await processHero(heroInput)
      const logo = await processLogo(logoInput)

      const config = {
        slug: values.slug,
        formsSlug: values.formsSlug,
        name: values.name,
        date: values.date,
        venueName: values.venueName,
        venueLocation: values.venueLocation,
        divisions: values.divisions,
        weighin: values.weighin,
        wrestling: values.wrestling,
        contactEmail: values.contactEmail,
        accentHex: values.accentHex,
        about: values.about || '',
        hero: hero ? hero.filename : null,
        logo: logo ? logo.filename : null,
        generatedAt: new Date().toISOString(),
        templateVersion: 1,
      }

      const zip = new JSZip()
      const folder = zip.folder(values.slug)
      folder.file('config.json', JSON.stringify(config, null, 2) + '\n')
      if (hero) folder.file(hero.filename, hero.blob)
      if (logo) folder.file(logo.filename, logo.blob)

      // Also include a stub index.html so the folder can be served immediately
      // (contents will be overwritten by scripts/rebuild-tournaments.mjs on the next run).
      folder.file('index.html', `<!DOCTYPE html><meta charset="utf-8"><title>${values.name}</title><p>Run <code>node scripts/rebuild-tournaments.mjs</code> to build this page.</p>\n`)

      const blob = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${values.slug}.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      btn.textContent = 'Downloaded — Generate another?'
    } catch (err) {
      alert('Error: ' + err.message)
      btn.textContent = 'Generate & Download Zip'
    } finally {
      btn.disabled = false
    }
  })
```

- [ ] **Step 3: Verify locally**

```bash
python3 -m http.server 8000 &
SERVER_PID=$!
sleep 1
open http://localhost:8000/build/
# Manual smoke:
# - Fill all required fields
# - Upload a valid hero image (< 8MB, > 800px)
# - Click Generate — should download <slug>.zip
# - Unzip and verify: folder named <slug>, contains config.json, index.html stub, and hero.jpg
kill $SERVER_PID
```

- [ ] **Step 4: Commit**

```bash
git add build/vendor/jszip.min.js build/build.js
git commit -m "feat(build): generate and download minisite zip via JSZip"
```

---

### Task 11: End-to-end smoke test with a real matsidesystems-forms event

**Files:** none (validation task)

**Prerequisite:** Phase 1 PR merged and deployed to production.

- [ ] **Step 1: Create a test event in matsidesystems-forms**

- Sign into matsidesystems-forms admin
- Create a test event (`test_mode = true`), give it a slug like `builder-smoke-test`, add at least one field
- Confirm it renders at `https://forms.matsidesystems.com/r/builder-smoke-test` in a browser

- [ ] **Step 2: Generate a minisite via the local builder**

```bash
cd "/Users/emmons_house/Desktop/Matside Software/matside.org"
python3 -m http.server 8000 &
SERVER_PID=$!
sleep 1
open http://localhost:8000/build/
```

Fill:
- Slug: `builder-smoke-test`
- Name: `Builder Smoke Test`
- Date: (any future date)
- Venue: `Test Venue`, `Test, PA`
- Divisions/weigh-in/wrestling: any values
- Forms slug: `builder-smoke-test`
- Accent: `#c9a967`
- Contact: your email
- Upload a real hero image (jpg, > 800px)

Download the zip.

```bash
kill $SERVER_PID
```

- [ ] **Step 3: Drop into the repo and rebuild**

```bash
cd "/Users/emmons_house/Desktop/Matside Software/matside.org"
unzip ~/Downloads/builder-smoke-test.zip -d t/
node scripts/rebuild-tournaments.mjs
```

Expected: `builder-smoke-test: regenerated` and `manifest: 1 tournaments` (or whatever count).

- [ ] **Step 4: Serve locally and verify**

```bash
python3 -m http.server 8000 &
SERVER_PID=$!
sleep 1
open http://localhost:8000/t/builder-smoke-test/
```

Verify in browser:
- Header + pills + about visible
- Iframe loads matsidesystems-forms/r/builder-smoke-test?embed=1
- Iframe resizes to fit form content (no internal scrollbar)
- OpenGraph tags present in view-source
- `/t/` index lists the event under Upcoming

```bash
kill $SERVER_PID
```

- [ ] **Step 5: Remove the smoke test event and rebuild**

```bash
rm -rf t/builder-smoke-test
node scripts/rebuild-tournaments.mjs
```

Expected: `manifest: 0 tournaments` (or count decremented). `tournaments.json` should reflect removal.

- [ ] **Step 6: Cross-browser check**

Open a real minisite (or a preserved smoke event) in Safari desktop, Safari iOS (via Xcode Simulator or a real device), and Firefox. Confirm iframe height messages arrive and resize works. If Safari mobile mishandles, note it and revisit in a follow-up (fallback would be a fixed min-height with internal scroll).

- [ ] **Step 7: Commit any smoke-test artifacts (if kept) or ensure repo is clean**

```bash
git status
# If clean, nothing to commit. If a real inaugural tournament was set up during smoke, commit it now.
```

---

### Task 12: Open matside.org PR

- [ ] **Step 1: Verify all tests still pass**

```bash
cd "/Users/emmons_house/Desktop/Matside Software/matside.org"
node --test scripts/rebuild-tournaments.test.mjs
```

Expected: all PASS.

- [ ] **Step 2: Push and open PR**

```bash
git push -u origin HEAD
gh pr create --title "Tournament minisites + client-side builder" --body "$(cat <<'EOF'
## Summary
- New `/build/` client-side builder generates per-tournament folders
- New `/t/[slug]/` static minisite pattern (single HTML from source template + config.json)
- New `/t/` tournaments index (reads tournaments.json manifest)
- New `scripts/rebuild-tournaments.mjs` regenerates every minisite from its config
- Adds `.gitignore` for `.superpowers/` scratch dir

Spec: `docs/superpowers/specs/2026-09-03-tournament-minisites-design.md`

Requires matsidesystems-forms PR to be deployed first (CSP + iframe height dispatcher).

## Test plan
- [ ] `node --test scripts/rebuild-tournaments.test.mjs` passes
- [ ] Manual: generate a minisite via `/build/`, drop into `/t/`, rebuild, serve locally, confirm iframe embeds and resizes
- [ ] Manual: `/t/` index page lists events correctly (upcoming vs past)
- [ ] Cross-browser: Safari desktop + iOS, Chrome, Firefox
EOF
)"
```

---

## Self-Review Notes

**Spec coverage:**
- CSP header → Task 1 ✓
- IframeHeightDispatcher → Task 2 ✓
- Mount + ?embed=1 → Task 3 ✓
- Minisite template + placeholders + iframe listener + noscript fallback + LD-JSON + OpenGraph → Task 5 ✓
- Config.json schema → Task 6 (fixture) + Task 10d (builder emits) ✓
- Rebuild script (render + validation + manifest + idempotency) → Tasks 6, 7, 8 ✓ (idempotency is implicit via deterministic renderTemplate; not separately tested — acceptable trade-off)
- Tournaments index → Task 9 ✓
- Builder form + validation + image processing + zip → Tasks 10a–10d ✓
- Manual smoke test → Task 11 ✓
- .gitignore → Task 4 ✓

**Type consistency:**
- `postMessage` shape `{type: 'matsysforms-height', px: N}` used in Task 2 (dispatcher), Task 5 (parent listener), and matches.
- Origin `https://www.matside.org` used in dispatcher + template listener + spec.
- Config keys in JSON (camelCase) and template placeholders (UPPER_SNAKE) mapping lives in `renderTemplate` — checked, matches Task 5 template tokens.

**Deferred out of scope (called out):**
- Live preview in builder
- Persistent builder (Option B in spec)
- Sponsors row, post-event results, custom domains, edit-in-place
