// wt-timing.mjs — pure logic for the Mat Schedule and Period-Based Timing
// model (see docs/superpowers/specs/2026-10-27-wt-mat-schedule-period-timing.md).
// No DOM dependency — these are the same pure functions script.js's browser
// code calls into, extracted here so they're unit-testable with node:test,
// mirroring matside-boards' src/*.js pattern and this repo's existing
// scripts/rebuild-tournaments.mjs convention (plain ES module, no bundler,
// no npm package.json — run directly with `node --test wt/`).
//
// IMPORTANT: this file is the source of truth for this logic. wt/script.js
// imports it directly (native ES module `import` — script.js already loads
// as a browser <script type="module">-compatible file via live.js's
// pattern; see index.html). Do not fork/duplicate this logic inline in
// script.js.

// ============================================================
// Mat Schedule — matsAtTime()
// ============================================================

/**
 * @typedef {{ day: 1|2, time: string, mats: number }} MatScheduleSegment
 *   time is "HH:MM" 24h, same format as the existing time inputs.
 */

/**
 * Normalize + sort a mat schedule by (day, time). Pure — does not mutate
 * the input array.
 * @param {MatScheduleSegment[]} schedule
 * @returns {MatScheduleSegment[]}
 */
export function sortMatSchedule(schedule) {
  return [...schedule].sort((a, b) => {
    if (a.day !== b.day) return a.day - b.day;
    return timeToMinutesLocal(a.time) - timeToMinutesLocal(b.time);
  });
}

function timeToMinutesLocal(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Resolve how many mats are active at a given (day, minutesIntoDay).
 * Walks the schedule in order, returns the `mats` value of the last
 * segment whose (day, time) <= the query. Falls back to the first
 * segment's mats if the query is before every segment (defensive —
 * segment 1 should always equal the event's Day 1 start, so this
 * shouldn't normally trigger).
 *
 * @param {MatScheduleSegment[]} schedule - need not be pre-sorted
 * @param {1|2} day
 * @param {number} minutesIntoDay
 * @returns {number}
 */
export function matsAtTime(schedule, day, minutesIntoDay) {
  if (!schedule || schedule.length === 0) return 0;
  const sorted = sortMatSchedule(schedule);
  let active = sorted[0].mats;
  for (const seg of sorted) {
    const segMinutes = timeToMinutesLocal(seg.time);
    if (seg.day < day || (seg.day === day && segMinutes <= minutesIntoDay)) {
      active = seg.mats;
    } else {
      break;
    }
  }
  return active;
}

/**
 * Bout CAPACITY (not a count estimate — capacity, i.e. how many bouts
 * mat-time alone could absorb) for a single-day time interval
 * [startMin, endMin), correctly accounting for a mat-schedule
 * transition that falls INSIDE the interval rather than sampling the
 * mat count once at intervalStart.
 *
 * Why this exists: an hourly-breakdown table row spans a full clock
 * hour (e.g. "9:00–10:00 AM"), but a mat-count change can happen at
 * any minute (e.g. 9:30). Without this, a row that starts with 8 mats
 * and drops to 4 at 9:30 would be credited with a full hour of 8-mat
 * capacity instead of 30 min @ 8 mats + 30 min @ 4 mats.
 *
 * @param {MatScheduleSegment[]} schedule
 * @param {1|2} day
 * @param {number} startMin
 * @param {number} endMin - exclusive
 * @param {number} boutsPerHourPerMat
 * @returns {number} capacity in bouts (not rounded)
 */
export function boutCapacityForInterval(schedule, day, startMin, endMin, boutsPerHourPerMat) {
  if (endMin <= startMin) return 0;
  const sorted = sortMatSchedule(schedule);
  // Collect every transition time (minutes into `day`) that falls
  // strictly inside (startMin, endMin), plus the interval's own edges.
  const cutPoints = new Set([startMin, endMin]);
  for (const seg of sorted) {
    if (seg.day !== day) continue;
    const t = timeToMinutesLocal(seg.time);
    if (t > startMin && t < endMin) cutPoints.add(t);
  }
  const sortedCuts = [...cutPoints].sort((a, b) => a - b);

  let capacity = 0;
  for (let i = 0; i < sortedCuts.length - 1; i++) {
    const segStart = sortedCuts[i];
    const segEnd = sortedCuts[i + 1];
    const mats = matsAtTime(schedule, day, segStart);
    const hours = (segEnd - segStart) / 60;
    capacity += boutsPerHourPerMat * mats * hours;
  }
  return capacity;
}

/**
 * Build the default single-segment schedule from today's flat inputs —
 * used both as the UI's starting state and to upgrade old saved sessions
 * that predate matSchedule (backward compatibility, see restoreSession).
 * @param {string} startTimeDay1
 * @param {number} numMats
 * @returns {MatScheduleSegment[]}
 */
export function defaultMatSchedule(startTimeDay1, numMats) {
  return [{ day: 1, time: startTimeDay1, mats: numMats }];
}

/**
 * Inverse of boutCapacityForInterval: given a starting (day, minute) and
 * a number of bouts that need to run at boutsPerHourPerMat, find how
 * many minutes it takes — correctly stepping across any mat-schedule
 * transitions in between (e.g. a round that starts at 8 mats and runs
 * long enough to hit a drop to 4 mats mid-round).
 *
 * Used by the Round Schedule table so round durations are mat-schedule
 * aware, not just the Hourly Breakdown. Does not cross a day boundary —
 * callers should clamp/split at day boundaries themselves if needed
 * (rounds are short enough in practice that this hasn't been a problem;
 * flagged here for anyone extending this further).
 *
 * @param {MatScheduleSegment[]} schedule
 * @param {1|2} day
 * @param {number} startMin
 * @param {number} boutsNeeded
 * @param {number} boutsPerHourPerMat
 * @returns {number} minutes needed (can be fractional)
 */
export function timeToCompleteBouts(schedule, day, startMin, boutsNeeded, boutsPerHourPerMat) {
  if (boutsNeeded <= 0) return 0;
  const sorted = sortMatSchedule(schedule);
  const laterTransitions = sorted
    .filter((seg) => seg.day === day && timeToMinutesLocal(seg.time) > startMin)
    .map((seg) => timeToMinutesLocal(seg.time))
    .sort((a, b) => a - b);

  let cursor = startMin;
  let remaining = boutsNeeded;

  for (const nextTransition of [...laterTransitions, Infinity]) {
    const mats = matsAtTime(schedule, day, cursor);
    const rate = boutsPerHourPerMat * mats; // bouts/hour
    if (rate <= 0) {
      // No mats active — cannot make progress; avoid an infinite/NaN
      // result and just stop here (caller sees a very long duration).
      return cursor - startMin;
    }
    const availableMinutes = nextTransition === Infinity ? Infinity : nextTransition - cursor;
    const minutesToFinishHere = (remaining / rate) * 60;

    if (minutesToFinishHere <= availableMinutes) {
      cursor += minutesToFinishHere;
      remaining = 0;
      break;
    } else {
      const boutsThisSegment = (availableMinutes / 60) * rate;
      remaining -= boutsThisSegment;
      cursor += availableMinutes;
    }
  }

  return cursor - startMin;
}

// ============================================================
// Period-Based Timing — roundKind() / boutDurationSec()
// ============================================================

const CONSOLATION_ROUND_RE = /^CR|^Third$|^Fifth$|^Seventh$/;

/**
 * Classify a round name (from ROUND_DATA[placing].rounds) as
 * "championship" or "consolation". Third/Fifth/Seventh place bouts are
 * consolation per Daniel (2026-10-27).
 * @param {string} roundName
 * @returns {"championship"|"consolation"}
 */
export function roundKind(roundName) {
  return CONSOLATION_ROUND_RE.test(roundName) ? 'consolation' : 'championship';
}

/**
 * @typedef {{ periods: number[], turnaroundSec: number }} BracketPeriodConfig
 * @typedef {{
 *   style: "folkstyle"|"freestyle_greco",
 *   championship: BracketPeriodConfig,
 *   consolation: BracketPeriodConfig,
 * }} PeriodConfig
 */

/** Level presets for Folkstyle, confirmed by Daniel 2026-10-27.
 * Youth has no separate consolation number from Daniel — defaults to
 * the same periods as championship; flagged in the UI as an assumption
 * (see spec §2, "Open questions"). */
export const FOLKSTYLE_LEVEL_PRESETS = {
  youth: {
    championship: { periods: [60, 60, 60], turnaroundSec: 90 },
    consolation: { periods: [60, 60, 60], turnaroundSec: 90 },
  },
  jh: {
    championship: { periods: [90, 90, 90], turnaroundSec: 90 },
    consolation: { periods: [90, 60, 60], turnaroundSec: 90 },
  },
  hs: {
    championship: { periods: [120, 120, 120], turnaroundSec: 90 },
    consolation: { periods: [120, 90, 90], turnaroundSec: 90 },
  },
};

/** Freestyle/Greco presets — captured per Daniel 2026-10-27, NOT wired
 * into boutDurationSec() this pass (explicit follow-up, see spec).
 * Reserved here so the follow-up doesn't have to re-derive the numbers. */
export const FREESTYLE_GRECO_LEVEL_PRESETS = {
  youth: {
    championship: { periods: [120, 120], breakSec: 90, turnaroundSec: 90 },
    consolation: { periods: [120, 120], breakSec: 90, turnaroundSec: 90 },
  },
  adult: {
    championship: { periods: [180, 180], breakSec: 90, turnaroundSec: 90 },
    consolation: { periods: [180, 180], breakSec: 90, turnaroundSec: 90 },
  },
};

/**
 * Real bout duration in seconds for a given round, from a Folkstyle
 * periodConfig. Freestyle/Greco (2-period+break shape) is explicitly
 * NOT supported here yet — throws rather than silently mis-computing,
 * per the spec's "fail loud, not silently wrong" principle.
 * @param {string} roundName
 * @param {PeriodConfig} periodConfig
 * @returns {number} seconds
 */
export function boutDurationSec(roundName, periodConfig) {
  if (periodConfig.style && periodConfig.style !== 'folkstyle') {
    throw new Error(
      `boutDurationSec: style "${periodConfig.style}" is not yet supported ` +
      `(Freestyle/Greco is a tracked follow-up, see spec). Folkstyle only.`
    );
  }
  const kind = roundKind(roundName);
  const cfg = periodConfig[kind];
  if (!cfg || !Array.isArray(cfg.periods)) {
    throw new Error(`boutDurationSec: periodConfig missing "${kind}" period data`);
  }
  const periodsTotal = cfg.periods.reduce((a, b) => a + b, 0);
  return periodsTotal + (cfg.turnaroundSec || 0);
}

/**
 * Derived bouts/hour/mat from a periodConfig + a mix of round kinds,
 * for the "Bouts/Hour/Mat" field's live-computed hint. Weighted by how
 * many bouts of each kind are in the mix (not a simple average of the
 * two durations) — see spec §2 "Derived Bouts/Hour/Mat".
 * @param {{championship: number, consolation: number}} boutCountsByKind
 * @param {PeriodConfig} periodConfig
 * @returns {number|null} bouts/hr/mat, or null if boutCountsByKind is empty
 */
export function derivedBoutsPerHourPerMat(boutCountsByKind, periodConfig) {
  const champBouts = boutCountsByKind.championship || 0;
  const consBouts = boutCountsByKind.consolation || 0;
  const totalBouts = champBouts + consBouts;
  if (totalBouts === 0) return null;

  const champSec = periodConfig.championship.periods.reduce((a, b) => a + b, 0)
    + (periodConfig.championship.turnaroundSec || 0);
  const consSec = periodConfig.consolation.periods.reduce((a, b) => a + b, 0)
    + (periodConfig.consolation.turnaroundSec || 0);

  const totalSec = champBouts * champSec + consBouts * consSec;
  const avgSecPerBout = totalSec / totalBouts;
  return Math.round((3600 / avgSecPerBout) * 10) / 10;
}
