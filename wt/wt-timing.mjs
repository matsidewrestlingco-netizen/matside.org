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
 * Build the day-segment definitions (day, startMin, endMin) used by every
 * day-aware scheduling calculation: the headline Estimate, the Hourly
 * Breakdown, and the Round Schedule. ONE place that defines "what are the
 * tournament's day windows" so all three features agree on day boundaries.
 * Only a non-final day gets an endMin (the final day is open-ended) —
 * matches the convention buildHourlyBreakdown already used internally.
 *
 * @param {1|2} numDays
 * @param {string} startTimeDay1 - "HH:MM"
 * @param {string} endTimeDay1 - "HH:MM", ignored if numDays === 1
 * @param {string} startTimeDay2 - "HH:MM", ignored if numDays === 1
 * @returns {{day:1|2, label:string|null, startMin:number, endMin:number|null}[]}
 */
export function buildDaySegments(numDays, startTimeDay1, endTimeDay1, startTimeDay2) {
  if (numDays === 1) {
    return [{ day: 1, label: null, startMin: timeToMinutesLocal(startTimeDay1), endMin: null }];
  }
  return [
    { day: 1, label: 'Day 1', startMin: timeToMinutesLocal(startTimeDay1), endMin: timeToMinutesLocal(endTimeDay1) },
    { day: 2, label: 'Day 2', startMin: timeToMinutesLocal(startTimeDay2), endMin: null },
  ];
}

/**
 * Walk a sequence of bout "chunks" (e.g. one chunk for the whole
 * tournament's headline Estimated Finish, or one chunk per round for the
 * Round Schedule) across one or more tournament days, respecting BOTH:
 *  - day end-time boundaries: a chunk that would run past a day's endMin
 *    is split — the part that fits stays on that day, the remainder
 *    rolls over to the next day's startMin.
 *  - the mat schedule: within a day, duration/capacity is computed via
 *    timeToCompleteBouts()/boutCapacityForInterval(), so a mid-event mat
 *    count change is still respected exactly as it already is elsewhere.
 *
 * This is the single engine behind the headline "Estimated Finish" card,
 * the Hourly Breakdown, and the Round Schedule — before this function
 * existed, the headline card used its own simplified flat-rate day-split
 * math while the Hourly Breakdown had its own separate (correct, mat-
 * schedule-aware) day-split logic, and the two could silently disagree.
 * Round Schedule had NO day-boundary logic at all. Using one function
 * for all three makes that class of bug structurally impossible.
 *
 * A chunk whose bouts span a day boundary produces TWO (or more, in a
 * pathological >2-day-window sense, though this app only models up to
 * 2 days) result rows, each flagged with crossesDayBoundary so callers
 * can render a "Day 1 ends here / Day 2 resumes here" marker.
 *
 * @param {{day:1|2, label:string|null, startMin:number, endMin:number|null}[]} days
 * @param {{label:string, bouts:number}[]} chunks
 * @param {MatScheduleSegment[]} matSchedule
 * @param {number} boutsPerHourPerMat
 * @returns {Array<{
 *   chunkLabel:string, chunkBouts:number, boutsThisSegment:number,
 *   day:1|2, dayLabel:string|null, startMin:number, endMin:number,
 *   crossesDayBoundary:boolean, isFirstSegmentOfChunk:boolean,
 *   isLastSegmentOfChunk:boolean,
 * }>}
 */
export function scheduleChunksAcrossDays(days, chunks, matSchedule, boutsPerHourPerMat) {
  const results = [];
  let dayIdx = 0;
  let cursorMin = days.length > 0 ? days[0].startMin : 0;

  for (const chunk of chunks) {
    let boutsRemaining = chunk.bouts;
    let firstPartOfChunk = true;

    // Defensive: a zero-bout chunk (e.g. an excluded/empty round) still
    // gets exactly one zero-length result row at the current cursor, so
    // callers can render a row for every chunk without special-casing.
    if (boutsRemaining <= 0) {
      const day = days[Math.min(dayIdx, days.length - 1)];
      results.push({
        chunkLabel: chunk.label, chunkBouts: 0, boutsThisSegment: 0,
        day: day.day, dayLabel: day.label, startMin: cursorMin, endMin: cursorMin,
        crossesDayBoundary: false, isFirstSegmentOfChunk: true, isLastSegmentOfChunk: true,
      });
      continue;
    }

    while (boutsRemaining > 0) {
      if (dayIdx >= days.length) dayIdx = days.length - 1; // out of days — pile onto the last one
      const day = days[dayIdx];

      // If we're sitting exactly at (or past) this day's end with another
      // day available, roll over before computing anything for this day.
      if (day.endMin !== null && cursorMin >= day.endMin && dayIdx < days.length - 1) {
        dayIdx += 1;
        cursorMin = days[dayIdx].startMin;
        continue;
      }

      const minutesIfUnbounded = timeToCompleteBouts(matSchedule, day.day, cursorMin, boutsRemaining, boutsPerHourPerMat);
      const endMinIfUnbounded = cursorMin + minutesIfUnbounded;
      const fitsInDay = day.endMin === null || endMinIfUnbounded <= day.endMin;

      if (fitsInDay) {
        results.push({
          chunkLabel: chunk.label, chunkBouts: chunk.bouts, boutsThisSegment: boutsRemaining,
          day: day.day, dayLabel: day.label, startMin: cursorMin, endMin: endMinIfUnbounded,
          crossesDayBoundary: !firstPartOfChunk, isFirstSegmentOfChunk: firstPartOfChunk, isLastSegmentOfChunk: true,
        });
        cursorMin = endMinIfUnbounded;
        boutsRemaining = 0;
      } else {
        const capacity = boutCapacityForInterval(matSchedule, day.day, cursorMin, day.endMin, boutsPerHourPerMat);
        const boutsThisDay = Math.max(0, Math.min(boutsRemaining, Math.floor(capacity)));
        results.push({
          chunkLabel: chunk.label, chunkBouts: chunk.bouts, boutsThisSegment: boutsThisDay,
          day: day.day, dayLabel: day.label, startMin: cursorMin, endMin: day.endMin,
          crossesDayBoundary: !firstPartOfChunk, isFirstSegmentOfChunk: firstPartOfChunk, isLastSegmentOfChunk: false,
        });
        boutsRemaining -= boutsThisDay;
        firstPartOfChunk = false;

        if (dayIdx < days.length - 1) {
          dayIdx += 1;
          cursorMin = days[dayIdx].startMin;
        } else if (boutsThisDay <= 0) {
          // No more days AND no progress possible (e.g. 0 mats active for
          // the rest of the window) — bail out rather than spin forever.
          boutsRemaining = 0;
        } else {
          cursorMin = day.endMin;
        }
      }
    }
  }

  return results;
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
 * Reduce scheduleChunksAcrossDays() segments to per-chunk, per-day bout
 * totals. Used by the Venue Splitter: it needs "how many of weight X's
 * Round of 16 bouts happen on Day 1 vs Day 2" at ROUND granularity (the
 * splitter then allocates each weight class's own per-round bout counts
 * proportionally using these round-level day fractions) — see
 * splitWeightBoutsByDay in script.js for the weight-class-level usage.
 *
 * @param {ReturnType<typeof scheduleChunksAcrossDays>} segments
 * @returns {Map<string, {1?: number, 2?: number}>} chunkLabel -> bouts per day
 */
export function chunkBoutsByDay(segments) {
  const result = new Map();
  for (const seg of segments) {
    if (!result.has(seg.chunkLabel)) result.set(seg.chunkLabel, {});
    const entry = result.get(seg.chunkLabel);
    entry[seg.day] = (entry[seg.day] || 0) + seg.boutsThisSegment;
  }
  return result;
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
 * Youth: championship and consolation are BOTH 60-60-60, confirmed
 * identical (not a default/assumption) by Daniel 2026-10-28. */
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

// ============================================================
// Venue Splitter — splitContiguousWeightRanges()
// ============================================================

/**
 * Split an ORDERED list of weight classes into N contiguous ranges (one
 * per location), e.g. weights 1–6 -> Gym A, 7–10 -> Gym B — never
 * scattering individual weight classes (1,3,5,7 at one gym, 2,4,6,8 at
 * another), because in practice that's hard to run and confusing to
 * announce to parents (per Daniel, 2026-10-28).
 *
 * Chooses BOTH the cut points AND which location each resulting
 * contiguous block goes to, to minimize the spread between the
 * earliest- and latest-finishing location — locations with more mat
 * capacity can and should get a larger contiguous block so everyone
 * finishes around the same time (per Daniel: balance finish time is
 * the priority, blocks can be uneven sizes).
 *
 * Brute-forces every way to place (locations.length - 1) cut points
 * among the weight classes (compositions, allowing empty blocks when
 * there are more locations than weight classes) combined with every
 * permutation of which block goes to which location. Fine for the
 * realistic sizes here (tens of weight classes, up to ~4 locations —
 * worst case around a few thousand partition x permutation combinations,
 * well under a millisecond-scale budget in a browser).
 *
 * @param {{name:string, bouts:number}[]} weights - in natural weight order (ascending)
 * @param {number[]} locationBoutsPerHour - capacity per location, SAME order as the caller's location list
 * @returns {{
 *   assignments: number[],  // locationIndex for each weight index (length === weights.length)
 *   groups: Array<{locationIndex:number, startIdx:number, endIdx:number, totalBouts:number, finishHours:number}>,
 *   spreadHours: number,
 * }|null} null if weights is empty or no location has positive capacity
 */
export function splitContiguousWeightRanges(weights, locationBoutsPerHour) {
  const n = weights.length;
  const k = locationBoutsPerHour.length;
  if (n === 0 || k === 0) return null;
  if (locationBoutsPerHour.every((c) => !c || c <= 0)) return null;

  const prefix = [0];
  for (const w of weights) prefix.push(prefix[prefix.length - 1] + (w.bouts || 0));

  // Generate every composition of n items into k ordered (possibly
  // empty) contiguous groups: boundaries 0 = b0 <= b1 <= ... <= bk = n.
  const boundaries = [];
  function genBoundaries(partial) {
    if (partial.length === k - 1) {
      boundaries.push([0, ...partial, n]);
      return;
    }
    const lastBound = partial.length === 0 ? 0 : partial[partial.length - 1];
    for (let b = lastBound; b <= n; b++) {
      genBoundaries([...partial, b]);
    }
  }
  genBoundaries([]);

  // Every permutation of [0..k-1] — which location each ordered block maps to.
  const permutations = [];
  function genPerms(arr, used) {
    if (arr.length === k) {
      permutations.push([...arr]);
      return;
    }
    for (let loc = 0; loc < k; loc++) {
      if (used.has(loc)) continue;
      used.add(loc);
      genPerms([...arr, loc], used);
      used.delete(loc);
    }
  }
  genPerms([], new Set());

  let best = null;

  for (const bounds of boundaries) {
    for (const perm of permutations) {
      const groups = [];
      let feasible = true;
      for (let g = 0; g < k; g++) {
        const startIdx = bounds[g];
        const endIdx = bounds[g + 1]; // exclusive
        const locationIndex = perm[g];
        const capacity = locationBoutsPerHour[locationIndex];
        const totalBouts = prefix[endIdx] - prefix[startIdx];
        if (totalBouts > 0 && (!capacity || capacity <= 0)) { feasible = false; break; }
        const finishHours = capacity > 0 ? totalBouts / capacity : 0;
        groups.push({ locationIndex, startIdx, endIdx, totalBouts, finishHours });
      }
      if (!feasible) continue;

      // Spread = max finish time across ALL locations with real capacity
      // minus the min — including locations assigned ZERO bouts (they
      // "finish" at time 0, so giving one location everything while
      // another sits idle is correctly penalized with a large spread,
      // rather than silently excluded from the comparison).
      const finishesAtRealCapacity = groups
        .filter((g) => locationBoutsPerHour[g.locationIndex] > 0)
        .map((g) => g.finishHours);
      const spreadHours = finishesAtRealCapacity.length > 0
        ? Math.max(...finishesAtRealCapacity) - Math.min(...finishesAtRealCapacity)
        : 0;
      // Tie-break: prefer the permutation closest to "identity" (block g,
      // in ascending weight order, maps to location g) — i.e. earlier
      // weight classes go to the first-listed location by default. Without
      // this, ties (equally-good spread) resolve arbitrarily by iteration
      // order, which can flip which location gets the LOW weights vs the
      // HIGH weights between otherwise-identical runs.
      const identityDistance = perm.reduce((sum, locIdx, g) => sum + Math.abs(locIdx - g), 0);

      if (
        best === null ||
        spreadHours < best.spreadHours - 1e-9 ||
        (Math.abs(spreadHours - best.spreadHours) <= 1e-9 && identityDistance < best.identityDistance)
      ) {
        best = { bounds, groups, spreadHours, identityDistance };
      }
    }
  }

  if (best === null) return null;

  const assignments = new Array(n);
  for (const g of best.groups) {
    for (let i = g.startIdx; i < g.endIdx; i++) assignments[i] = g.locationIndex;
  }

  return { assignments, groups: best.groups, spreadHours: best.spreadHours };
}

