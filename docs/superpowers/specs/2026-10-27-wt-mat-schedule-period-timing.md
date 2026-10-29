# WT Estimator — Mat Schedule & Period-Based Timing Model

**Date:** 2026-10-27
**Status:** Approved for planning (Daniel, in-session)
**Repo(s) touched:** `matside.org` (`wt/script.js`, `wt/index.html`, `wt/live.js`, `wt/style.css`)

## Goal

Replace two hand-wavy inputs in the Wrestling Tournament Time Estimator
with models that reflect how Daniel's tournaments actually run:

1. **Mat count is not constant across an event.** Large tournaments start
   with more mats (e.g. 8) and consolidate to fewer (e.g. 4) partway
   through — typically on Day 2, at a known clock time. The estimator
   currently has one flat `Number of Mats` input used for the entire
   event, so every downstream projection (hourly breakdown, round
   schedule, ticker) is wrong for events that do this.
2. **"Bouts/Hour/Mat" is a guess standing in for real period lengths.**
   Actual bout duration is driven by period lengths, which differ by
   bracket stage (championship vs. consolation) and level, and vary
   tournament-to-tournament (a recent event ran 120-90-60, not any of
   the three built-in presets). The estimator should compute pace from
   real period lengths + turnaround time, with the old flat number kept
   as a visible, overridable derived value — not deleted.

## Non-goals (this pass)

- No change to the live Mat Status / Bout Logger measured-pace model
  (`LiveModel.computeMatStats`/`computeMatETA` in `wt/live.js`) — that
  already uses real tap data when available, which is strictly better
  than either of these two inputs. This spec only fixes the *pre-event
  estimate* and the *fallback* pace used before/without logger data.
- No bout-count/round-triggered mat changes (e.g. "consolidate once
  championship rounds finish") — confirmed out of scope; Daniel's
  trigger is always a specific scheduled clock time.
- No UI redesign beyond what's needed to add the new inputs; keep the
  existing visual language (`form-grid`, `form-group`, hint spans).

## 1. Mat Schedule

### Data model

Replace the flat `numMats` concept with an ordered list of segments:

```js
matSchedule = [
  { day: 1, time: "09:00", mats: 8 },   // first segment — day/time locked
  { day: 2, time: "16:00", mats: 4 },   // additional segments, user-added
]
```

- Segment 1's `day`/`time` always equals Start Time Day 1 (not
  independently editable) — mirrors how the form already treats Day 1
  start as fixed. Its `mats` value is the only thing the simple/default
  case needs to set, which is exactly today's single `num-mats` field.
- Additional segments are added via an "+ Add mat change" button,
  picking a day (1 or 2, only showing Day 2 if `numDays === 2`) and a
  time, plus a mat count. Segments auto-sort by `(day, time)`.
- A segment's effective end is "the next segment's start, or the end of
  the event" — no explicit end field needed.
- Validation: a segment's time must be ≥ its day's start time (and for
  Day 2 segments, ≥ Start Time Day 2); reject/clamp on save, don't
  silently produce negative-duration blocks.

### Resolver

```js
function matsAtTime(matSchedule, day, minutesIntoDay) {
  // Walks matSchedule in order, returns the mats value of the last
  // segment whose (day, time) <= (day, minutesIntoDay). Falls back to
  // matSchedule[0].mats if called before the first segment (shouldn't
  // happen given segment 1 == event start, but keep it defensive).
}
```

Pure function, unit-testable with plain `{day, timeMinutes}` inputs — no
DOM dependency, matching `getBouts`/`getBoutsFiltered`'s existing style.

### What changes downstream

- **`buildHourlyBreakdown`**: currently computes one
  `totalBoutsPerHour = boutsPerHourPerMat * mats` constant for the whole
  loop. Changes to look up `matsAtTime()` per block and recompute
  `totalBoutsPerHour` for *that block*, before deciding `estimated`.
  This also means `remaining / effectiveRate` style per-block math
  rather than one constant divided evenly.
- **`buildRoundSchedule`**: rounds run sequentially with a running
  `currentMin` already — same `matsAtTime()` lookup per round, using
  that round's start time.
- **Live Mat Status grid (`renderMatStatus` in `script.js`,
  `wt/live.js`)**: `liveEvent.matIds` is currently fixed at `goLive()`
  time from the `num-mats` field. Needs to reflect the *currently
  scheduled* mat count so mats that have been stood down show as
  explicitly "not in use for this segment" rather than sitting there
  looking like a stalled/broken mat with stale data. Exact UI TBD at
  build time — likely a visual dim/badge rather than removing the card,
  so historical data for that mat doesn't disappear mid-event.
- **Venue Splitter**: explicitly out of scope — it already takes its
  own independent per-location mat counts and isn't tied to the
  single-tournament mat schedule. No change.
- **Ticker (`syncTickerFromHourly`)**: `hourlyTotalBoutsPerHour` becomes
  "whatever's active right now" rather than one constant — already
  recomputed from `hourlyBlocks`, so this mostly falls out of the
  `buildHourlyBreakdown` change for free; double-check the live/current
  rate shown matches the *current* segment, not block 0's.

### UI

New sub-section under the existing `num-mats` field (same `form-grid`
area), styled like the existing Round Filter section's add/remove
pattern:
- Base "Number of Mats" field stays as-is (becomes segment 1's value).
- "+ Add mat change" button appends a row: `[Day ▾] [Time] [Mats #] [Remove]`.
- Session save/load (`gatherSession`/`restoreSession`) gains a
  `matSchedule` field, defaulting to the single-segment form for old
  saved sessions (backward compatible — a session with no
  `matSchedule` just gets `[{day:1, time: startTimeDay1, mats: numMats}]`
  synthesized).

## 2. Period-Based Timing Model

### Style fork: Folkstyle vs. Freestyle/Greco (new, confirmed by Daniel)

Period structure itself differs by wrestling style, not just by level:

- **Folkstyle**: 3 periods, no break — the model below as originally
  scoped.
- **Freestyle/Greco**: **2 periods + a break** between them (e.g. youth
  `120 - 90(break) - 120`, adult `180 - 90(break) - 180`, both
  configurable — numbers confirmed by Daniel). Structurally different
  shape, not just different numbers: `periods` has length 2, plus a
  separate `breakSec` field.
- A new **Style** dropdown (Folkstyle / Freestyle-Greco) is added to
  the form per Daniel's request, alongside the existing Level dropdown.
- **Scope for this pass (confirmed by Daniel): Folkstyle only.** The
  Style dropdown is built now (so the control exists and the data model
  is forward-compatible), but Freestyle/Greco's actual period model,
  presets, and downstream math are an explicit **follow-up**, not part
  of this build. Selecting "Freestyle/Greco" in the dropdown should
  show a clear "not yet supported — defaulting to Folkstyle timing"
  state rather than silently computing wrong numbers.
- Confirmed: the championship/consolation split still applies *within*
  Freestyle/Greco when that follow-up is built (same two-bucket round
  classification from §2 below, just with the 2-period+break shape
  instead of 3-period).

### Data model

```js
// Folkstyle (this pass):
periodConfig = {
  style: "folkstyle", // "freestyle_greco" reserved, not implemented this pass
  championship: { periods: [120, 120, 120], turnaroundSec: 90 },
  consolation:  { periods: [120, 90, 90],   turnaroundSec: 90 },
}

// Freestyle/Greco shape (data model reserved now, logic built in the
// follow-up — do not implement boutDurationSec() for this branch yet):
// periodConfig = {
//   style: "freestyle_greco",
//   championship: { periods: [180, 180], breakSec: 90, turnaroundSec: 90 },
//   consolation:  { periods: [180, 180], breakSec: 90, turnaroundSec: 90 },
// }
```

- Each Folkstyle `periods` array is 3 numbers (seconds), independently
  editable — not a dropdown of presets — so arbitrary combinations (the
  120-90-60 case) just work.
- Level presets (`youth`/`jh`/`hs`) become **prefill buttons/defaults**
  for both championship and consolation period sets simultaneously,
  same interaction pattern as today's Level dropdown driving
  `boutsPerHourInput.value` via `applyLevelDefault()` — pick a level,
  fields populate, then the user can hand-edit from there.
  - HS: championship 120-120-120, consolation 120-90-90 (per Daniel)
  - JH: championship 90-90-90, consolation 90-60-60 (per Daniel)
  - Youth: championship 60-60-60 (per Daniel). Daniel did not give a
    separate youth consolation preset — default consolation to the
    same 60-60-60 unless corrected; flag this assumption visibly in the
    UI (e.g. hint text) rather than burying it.
  - Freestyle/Greco presets (youth 120-90br-120, adult 180-90br-180) —
    captured here for the follow-up, **not wired into the UI this
    pass** per scope decision above.
- Single shared `turnaroundSec` (90s default, confirmed) — not split by
  championship/consolation, since mat-clearing/intro time isn't bracket
  stage dependent. One field, not two. (Freestyle/Greco's `breakSec` is
  a distinct concept from `turnaroundSec` — break is between periods of
  the same bout, turnaround is between consecutive bouts — kept as
  separate fields in the reserved data shape above.)

### Round classification

The existing `ROUND_DATA` tables already name every round
(`R64, R32, CR32-1, CR32-2, R16, ..., Semis, CR4-1, CR4-2, Finals,
Third, Fifth, Seventh`). Classify by name prefix:
- **Championship**: rounds with no `CR` prefix *and* not `Third`/`Fifth`/`Seventh`
  → `R64, R32, R16, R8, Semis, Finals`.
- **Consolation**: everything else → `CR32-1, CR32-2, CR16-1, CR16-2,
  CR8-1, CR8-2, CR4-1, CR4-2, Third, Fifth, Seventh` (confirmed by Daniel).

```js
const CONSOLATION_ROUND_RE = /^CR|^Third$|^Fifth$|^Seventh$/;
function roundKind(roundName) {
  return CONSOLATION_ROUND_RE.test(roundName) ? "consolation" : "championship";
}
```

Pure function, trivially unit-testable against every round name in
every `ROUND_DATA` table (good candidate for an exhaustive test: assert
every round name in `top8`/`top6`/`top4` classifies to one of the two
buckets, so new round names added later can't silently fall through).

### Pace computation

Per-round bout-seconds:

```js
function boutDurationSec(roundName, periodConfig) {
  const kind = roundKind(roundName);
  const cfg = periodConfig[kind];
  const periodsTotal = cfg.periods.reduce((a, b) => a + b, 0);
  return periodsTotal + cfg.turnaroundSec;
}
```

This feeds:
- **Round Schedule** (`buildRoundSchedule`): replace the flat
  `(round.bouts / totalBoutsPerHour) * 60` with
  `(round.bouts * boutDurationSec(round.name, periodConfig) / 60) / matsActiveAtThatTime`
  — i.e. real per-round seconds divided by the mats actually available
  for that round, not a flat tournament-wide rate.
- **Hourly Breakdown**: rounds aren't visible at the hourly-block level
  today (it works off `totalBouts`/`totalBoutsPerHour`, not per-round),
  so this needs a design decision: either (a) keep hourly breakdown
  working off a derived *weighted average* bouts/hr (blend of
  championship/consolation durations weighted by how many of each round
  type remain) for simplicity, or (b) make hourly breakdown
  round-aware like Round Schedule already is. Recommend **(a)** for v1
  — hourly breakdown is a coarser view than Round Schedule by design,
  and round-level awareness there is a bigger, separable change. Flag
  for Daniel at build time rather than deciding silently.
- **Derived "Bouts/Hour/Mat"**: becomes a read-only computed value
  shown next to the existing input (e.g. `≈ 11.2 bouts/hr/mat, derived
  from period lengths`), with the input itself staying live/overridable
  for anyone who wants to just type a number — not deleted, per
  Daniel's "keep it as a sanity check" framing from the design
  discussion.

### UI

New section replacing/extending the current `Level` dropdown's role:
- Keep `Level` dropdown, repurpose its change handler to prefill the
  new championship/consolation period fields instead of
  `boutsPerHourInput` directly.
- Two small inline period-editor groups (Championship / Consolation),
  3 numeric seconds inputs each, label `P1 / P2 / P3`.
- One `Turnaround (sec)` field, shared.
- `Bouts/Hour/Mat` field remains, now shows a hint
  (`default-hint`-style) with the live-computed value, and is
  overridable — if the user hand-edits it, that becomes an explicit
  override that downstream math should respect over the derived value
  (needs a small "has the user touched this" flag, same pattern as
  nothing currently exists for but is simple to add).

### Session save/load

`gatherSession()`/`restoreSession()` gain `periodConfig` and a
`boutsPerHourOverridden` flag, same backward-compatibility approach as
`matSchedule` — old sessions synthesize a `periodConfig` from the
level's preset at load time if the field is missing.

## 3. Build order (two stages, confirmed by Daniel)

**Stage 1 — Estimator fixes (this spec, both features above).**
Build and test these in the existing `wt/` estimator first, standalone,
before touching `boards.matside.org`.

**Stage 2 — Transfer WT data to `boards.matside.org`** as a two-column
collapsible-bucket layout (ticker/time-data column + screen/kiosk-
control column, confirmed with Daniel) — separate spec, written after
Stage 1 ships and Daniel has used the new estimator live at an event.

## 4. Testing plan

Both `matsAtTime()` and `roundKind()`/`boutDurationSec()` are pure
functions with no DOM dependency — straightforward to pull into
small, focused test files mirroring the `matside-boards` repo's
Node-test-runner convention (`wt/` currently has no test runner set up;
this is a good first target to introduce one, scoped to pure-logic
extraction the same way `matside-boards/*/src/*.js` already does, not a
full test-everything rewrite).

Minimum coverage before shipping:
- `matsAtTime`: no segments beyond the first (today's flat case,
  regression-critical), a single mid-event change, a change exactly at
  a block boundary, a change on Day 2 when the query is Day 1 (must not
  apply early), out-of-order segment input (must sort correctly).
- `roundKind`: every round name across all three `ROUND_DATA` tables
  classifies into championship or consolation with no fallthrough.
- `boutDurationSec`: 120-120-120 / 90s turnaround vs. 90-90-90 / 90s
  turnaround vs. the real-world 120-90-60 case Daniel cited.
- End-to-end: a synthetic "Daniel's large tournament" scenario — 8 mats
  dropping to 4 on Day 2 at a fixed time, mixed championship/
  consolation rounds — asserting the hourly breakdown and round
  schedule total bouts reconcile (same total-bouts invariant bug class
  as the Round Map issue found earlier in this session).

## Open questions for Daniel (flag at build time, don't guess)

1. ~~Youth folkstyle **consolation** periods~~ — **Resolved 2026-10-28**:
   Daniel confirmed consolation is 60-60-60, identical to championship,
   no change. `FOLKSTYLE_LEVEL_PRESETS.youth` in `wt-timing.mjs` reflects
   this as a confirmed value, not a default/assumption.
2. Hourly Breakdown round-awareness: weighted-average approximation
   (recommended, simpler) vs. full per-round block modeling (more
   accurate, bigger change) — this spec recommends the former for v1.

## Follow-up (explicitly out of scope for this build)

**Freestyle/Greco period model.** Style dropdown exists after this
build (Folkstyle / Freestyle-Greco), but only Folkstyle is functional.
When picked up:
- Implement the 2-period + `breakSec` shape (data model already
  reserved above).
- Confirmed numbers to use: youth 120-90(break)-120, adult
  180-90(break)-180, both configurable same as Folkstyle.
- Confirmed: championship/consolation split still applies.
- `boutDurationSec()` needs a style-aware branch (`periods.length === 2`
  path summing 2 periods + break + turnaround, vs. the 3-period
  Folkstyle path) — don't just bolt FS/Greco numbers into the existing
  3-period math.
