// wt-timing.test.mjs — tests for wt/wt-timing.mjs (Mat Schedule + Period
// Timing pure logic). Run with: node --test wt/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  sortMatSchedule,
  matsAtTime,
  boutCapacityForInterval,
  timeToCompleteBouts,
  defaultMatSchedule,
  buildDaySegments,
  scheduleChunksAcrossDays,
  chunkBoutsByDay,
  roundKind,
  boutDurationSec,
  derivedBoutsPerHourPerMat,
  FOLKSTYLE_LEVEL_PRESETS,
  splitContiguousWeightRanges,
} from './wt-timing.mjs';

// ============================================================
// Mat Schedule
// ============================================================

test('matsAtTime: single segment (today\'s flat case) — regression critical', () => {
  const schedule = defaultMatSchedule('09:00', 4);
  // Any time on day 1 at/after 9am should return 4.
  assert.equal(matsAtTime(schedule, 1, 9 * 60), 4);
  assert.equal(matsAtTime(schedule, 1, 23 * 60), 4);
  assert.equal(matsAtTime(schedule, 2, 10 * 60), 4);
});

test('matsAtTime: a single mid-event change applies after its time, not before', () => {
  const schedule = [
    { day: 1, time: '09:00', mats: 8 },
    { day: 2, time: '16:00', mats: 4 },
  ];
  assert.equal(matsAtTime(schedule, 1, 9 * 60), 8, 'day 1 start');
  assert.equal(matsAtTime(schedule, 2, 9 * 60), 8, 'day 2 morning, before the change');
  assert.equal(matsAtTime(schedule, 2, 16 * 60), 4, 'exactly at the change time');
  assert.equal(matsAtTime(schedule, 2, 20 * 60), 4, 'day 2 evening, after the change');
});

test('matsAtTime: change exactly at a block boundary applies at that minute', () => {
  const schedule = [
    { day: 1, time: '09:00', mats: 6 },
    { day: 1, time: '14:00', mats: 3 },
  ];
  // 13:59 still old count, 14:00 exactly switches.
  assert.equal(matsAtTime(schedule, 1, 13 * 60 + 59), 6);
  assert.equal(matsAtTime(schedule, 1, 14 * 60), 3);
});

test('matsAtTime: a Day 2 change must not apply early on Day 1', () => {
  const schedule = [
    { day: 1, time: '09:00', mats: 8 },
    { day: 2, time: '08:00', mats: 4 }, // early on day 2, but still day 2
  ];
  assert.equal(matsAtTime(schedule, 1, 23 * 60), 8, 'end of day 1 still old count');
  assert.equal(matsAtTime(schedule, 2, 0), 8, 'before day 2 segment time, still old count');
  assert.equal(matsAtTime(schedule, 2, 8 * 60), 4, 'at day 2 segment time, switches');
});

test('matsAtTime: out-of-order segment input is sorted correctly', () => {
  const schedule = [
    { day: 2, time: '16:00', mats: 4 },
    { day: 1, time: '09:00', mats: 8 },
  ];
  assert.equal(matsAtTime(schedule, 1, 10 * 60), 8);
  assert.equal(matsAtTime(schedule, 2, 17 * 60), 4);
});

test('matsAtTime: query before every segment falls back to the first (sorted) segment', () => {
  const schedule = [{ day: 1, time: '09:00', mats: 8 }];
  assert.equal(matsAtTime(schedule, 1, 0), 8);
});

test('matsAtTime: empty schedule returns 0 rather than throwing', () => {
  assert.equal(matsAtTime([], 1, 540), 0);
});

test('sortMatSchedule does not mutate its input', () => {
  const schedule = [
    { day: 2, time: '16:00', mats: 4 },
    { day: 1, time: '09:00', mats: 8 },
  ];
  const copy = schedule.map((s) => ({ ...s }));
  sortMatSchedule(schedule);
  assert.deepEqual(schedule, copy);
});

test('defaultMatSchedule builds a correct single-segment schedule', () => {
  assert.deepEqual(defaultMatSchedule('09:00', 4), [{ day: 1, time: '09:00', mats: 4 }]);
});

// ============================================================
// boutCapacityForInterval — mid-block mat-schedule transitions
// ============================================================

test('boutCapacityForInterval: no transition in interval = flat mats x rate x hours', () => {
  const schedule = defaultMatSchedule('09:00', 4);
  // 1 hour @ 4 mats @ 8 bouts/hr/mat = 32
  assert.equal(boutCapacityForInterval(schedule, 1, 9 * 60, 10 * 60, 8), 32);
});

test('boutCapacityForInterval: transition mid-interval splits capacity correctly', () => {
  // 8 mats until 9:30, then drops to 4. Block is 9:00-10:00 (1 hour) @ 8 bouts/hr/mat.
  // Expected: 30min @ 8 mats (0.5h * 8 * 8 = 32) + 30min @ 4 mats (0.5h * 4 * 8 = 16) = 48
  const schedule = [
    { day: 1, time: '09:00', mats: 8 },
    { day: 1, time: '09:30', mats: 4 },
  ];
  const capacity = boutCapacityForInterval(schedule, 1, 9 * 60, 10 * 60, 8);
  assert.equal(capacity, 48);
});

test('boutCapacityForInterval: transition exactly at interval start uses the new value for the whole block', () => {
  const schedule = [
    { day: 1, time: '09:00', mats: 8 },
    { day: 1, time: '10:00', mats: 4 },
  ];
  // Interval 10:00-11:00 starts exactly at the transition — should be all 4-mat capacity.
  assert.equal(boutCapacityForInterval(schedule, 1, 10 * 60, 11 * 60, 8), 32);
});

test('boutCapacityForInterval: transition on a different day is ignored', () => {
  const schedule = [
    { day: 1, time: '09:00', mats: 8 },
    { day: 2, time: '09:30', mats: 4 }, // should not affect day 1 interval
  ];
  assert.equal(boutCapacityForInterval(schedule, 1, 9 * 60, 10 * 60, 8), 64); // full hour @ 8 mats
});

test('boutCapacityForInterval: multiple transitions inside one interval', () => {
  // 8 mats -> 6 @ 9:15 -> 4 @ 9:45, interval 9:00-10:00 @ 10 bouts/hr/mat
  // 15min@8 (0.25*8*10=20) + 30min@6 (0.5*6*10=30) + 15min@4 (0.25*4*10=10) = 60
  const schedule = [
    { day: 1, time: '09:00', mats: 8 },
    { day: 1, time: '09:15', mats: 6 },
    { day: 1, time: '09:45', mats: 4 },
  ];
  assert.equal(boutCapacityForInterval(schedule, 1, 9 * 60, 10 * 60, 10), 60);
});

// ============================================================
// timeToCompleteBouts — inverse of boutCapacityForInterval
// ============================================================

test('timeToCompleteBouts: no transition = simple bouts/rate*60', () => {
  const schedule = defaultMatSchedule('09:00', 4);
  // 32 bouts @ 4 mats @ 8/hr/mat = 32 bouts/hr total -> 60 min
  assert.equal(timeToCompleteBouts(schedule, 1, 9 * 60, 32, 8), 60);
});

test('timeToCompleteBouts: round straddles a mat-schedule transition', () => {
  // 8 mats until 9:30 (30min @ 64 bouts/hr = 32 bouts done), then 4 mats
  // (32 bouts/hr) for the remaining 16 bouts -> 30 more minutes = 60 total
  const schedule = [
    { day: 1, time: '09:00', mats: 8 },
    { day: 1, time: '09:30', mats: 4 },
  ];
  const minutes = timeToCompleteBouts(schedule, 1, 9 * 60, 48, 8);
  assert.equal(minutes, 60);
});

test('timeToCompleteBouts: round entirely before the transition ignores it', () => {
  const schedule = [
    { day: 1, time: '09:00', mats: 8 },
    { day: 1, time: '12:00', mats: 4 }, // far in the future
  ];
  // 16 bouts @ 8 mats @ 8/hr/mat = 64 bouts/hr -> 15 min
  assert.equal(timeToCompleteBouts(schedule, 1, 9 * 60, 16, 8), 15);
});

test('timeToCompleteBouts: round entirely after the transition uses only the new rate', () => {
  const schedule = [
    { day: 1, time: '09:00', mats: 8 },
    { day: 1, time: '10:00', mats: 4 },
  ];
  // Starting at 10:30 (after the drop), 16 bouts @ 4 mats @ 8/hr/mat = 32 bouts/hr -> 30 min
  assert.equal(timeToCompleteBouts(schedule, 1, 10 * 60 + 30, 16, 8), 30);
});

test('timeToCompleteBouts: zero bouts needed returns 0 instantly', () => {
  const schedule = defaultMatSchedule('09:00', 4);
  assert.equal(timeToCompleteBouts(schedule, 1, 9 * 60, 0, 8), 0);
});

// ============================================================
// Round classification (roundKind)
// ============================================================

test('roundKind: championship rounds', () => {
  for (const r of ['R64', 'R32', 'R16', 'R8', 'Semis', 'Finals']) {
    assert.equal(roundKind(r), 'championship', r);
  }
});

test('roundKind: consolation rounds, including Third/Fifth/Seventh per Daniel', () => {
  for (const r of ['CR32-1', 'CR32-2', 'CR16-1', 'CR16-2', 'CR8-1', 'CR8-2', 'CR4-1', 'CR4-2', 'Third', 'Fifth', 'Seventh']) {
    assert.equal(roundKind(r), 'consolation', r);
  }
});

// Exhaustive: every round name in every ROUND_DATA table must classify
// to one of the two buckets with no fallthrough. We can't import
// ROUND_DATA from script.js (it's not a module export there), so this
// is hand-copied from the three rounds[] arrays as of 2026-10-27 — if
// script.js's ROUND_DATA round names ever change, update this list too.
test('roundKind: exhaustive coverage of every known round name (no silent fallthrough)', () => {
  const allRoundNames = [
    // top8
    'R64', 'R32', 'CR32-1', 'CR32-2', 'R16', 'CR16-1', 'CR16-2', 'R8', 'CR8-1', 'CR8-2', 'Semis', 'CR4-1', 'CR4-2', 'Finals', 'Third', 'Fifth', 'Seventh',
    // top6 / top4 use a different R32/CR32 ordering but the same name set minus Seventh for top4
    'CR32-1', 'R32', 'CR32-2',
  ];
  const seen = new Set();
  for (const r of allRoundNames) {
    const kind = roundKind(r);
    assert.ok(kind === 'championship' || kind === 'consolation', `${r} must classify`);
    seen.add(r);
  }
  // Spot-check nothing yields a falsy/undefined classification
  assert.equal(seen.size > 0, true);
});

// ============================================================
// boutDurationSec
// ============================================================

test('boutDurationSec: HS championship 120-120-120 + 90s turnaround', () => {
  const cfg = FOLKSTYLE_LEVEL_PRESETS.hs;
  assert.equal(boutDurationSec('R64', cfg), 120 + 120 + 120 + 90);
});

test('boutDurationSec: HS consolation 120-90-90 + 90s turnaround', () => {
  const cfg = FOLKSTYLE_LEVEL_PRESETS.hs;
  assert.equal(boutDurationSec('CR32-1', cfg), 120 + 90 + 90 + 90);
});

test('boutDurationSec: Third/Fifth/Seventh use consolation timing', () => {
  const cfg = FOLKSTYLE_LEVEL_PRESETS.hs;
  const consDuration = boutDurationSec('CR32-1', cfg);
  assert.equal(boutDurationSec('Third', cfg), consDuration);
  assert.equal(boutDurationSec('Fifth', cfg), consDuration);
  assert.equal(boutDurationSec('Seventh', cfg), consDuration);
});

test('boutDurationSec: real-world 120-90-60 custom config', () => {
  const cfg = {
    style: 'folkstyle',
    championship: { periods: [120, 90, 60], turnaroundSec: 90 },
    consolation: { periods: [120, 90, 60], turnaroundSec: 90 },
  };
  assert.equal(boutDurationSec('Finals', cfg), 120 + 90 + 60 + 90);
});

test('boutDurationSec: JH preset', () => {
  const cfg = FOLKSTYLE_LEVEL_PRESETS.jh;
  assert.equal(boutDurationSec('Semis', cfg), 90 + 90 + 90 + 90);
  assert.equal(boutDurationSec('CR8-1', cfg), 90 + 60 + 60 + 90);
});

test('boutDurationSec: youth preset (60-60-60, consolation defaults to same)', () => {
  const cfg = FOLKSTYLE_LEVEL_PRESETS.youth;
  assert.equal(boutDurationSec('Finals', cfg), 60 + 60 + 60 + 90);
  assert.equal(boutDurationSec('Third', cfg), 60 + 60 + 60 + 90);
});

test('boutDurationSec: throws (fails loud) for freestyle_greco — not yet implemented', () => {
  const cfg = {
    style: 'freestyle_greco',
    championship: { periods: [180, 180], breakSec: 90, turnaroundSec: 90 },
    consolation: { periods: [180, 180], breakSec: 90, turnaroundSec: 90 },
  };
  assert.throws(() => boutDurationSec('Finals', cfg), /not yet supported/);
});

// ============================================================
// derivedBoutsPerHourPerMat
// ============================================================

test('derivedBoutsPerHourPerMat: all-championship HS bouts', () => {
  const cfg = FOLKSTYLE_LEVEL_PRESETS.hs;
  // 120+120+120+90 = 450s/bout = 8 bouts/hr
  const rate = derivedBoutsPerHourPerMat({ championship: 10, consolation: 0 }, cfg);
  assert.equal(rate, 8);
});

test('derivedBoutsPerHourPerMat: mixed championship/consolation weights correctly', () => {
  const cfg = FOLKSTYLE_LEVEL_PRESETS.hs;
  // championship: 450s/bout, consolation: 120+90+90+90=390s/bout
  // 5 champ + 5 cons bouts -> weighted avg seconds, not simple avg of rates
  const rate = derivedBoutsPerHourPerMat({ championship: 5, consolation: 5 }, cfg);
  const expectedAvgSec = (5 * 450 + 5 * 390) / 10;
  const expectedRate = Math.round((3600 / expectedAvgSec) * 10) / 10;
  assert.equal(rate, expectedRate);
});

test('derivedBoutsPerHourPerMat: empty bout counts returns null, not NaN/Infinity', () => {
  const cfg = FOLKSTYLE_LEVEL_PRESETS.hs;
  assert.equal(derivedBoutsPerHourPerMat({ championship: 0, consolation: 0 }, cfg), null);
});

// ============================================================
// Day-aware scheduling — buildDaySegments() / scheduleChunksAcrossDays()
// ============================================================

test('buildDaySegments: 1-day tournament has a single open-ended day', () => {
  const days = buildDaySegments(1, '09:00', '18:00', '09:00');
  assert.deepEqual(days, [{ day: 1, label: null, startMin: 9 * 60, endMin: null }]);
});

test('buildDaySegments: 2-day tournament has a bounded Day 1 and open-ended Day 2', () => {
  const days = buildDaySegments(2, '09:00', '20:00', '08:30');
  assert.deepEqual(days, [
    { day: 1, label: 'Day 1', startMin: 9 * 60, endMin: 20 * 60 },
    { day: 2, label: 'Day 2', startMin: 8 * 60 + 30, endMin: null },
  ]);
});

test('scheduleChunksAcrossDays: single day, single chunk, matches simple flat math', () => {
  const days = buildDaySegments(1, '09:00', '18:00', '09:00');
  const schedule = defaultMatSchedule('09:00', 2); // 2 mats
  // 2 mats * 10/hr = 20/hr total. 100 bouts -> 5 hours -> 9am + 5h = 2pm.
  const results = scheduleChunksAcrossDays(days, [{ label: 'All bouts', bouts: 100 }], schedule, 10);
  assert.equal(results.length, 1);
  assert.equal(results[0].startMin, 9 * 60);
  assert.equal(results[0].endMin, 14 * 60);
  assert.equal(results[0].crossesDayBoundary, false);
  assert.equal(results[0].boutsThisSegment, 100);
});

test('scheduleChunksAcrossDays: a single chunk that would run past Day 1 end splits across the day boundary', () => {
  // Day 1: 9am-6pm (9h window), Day 2 starts 9am. 4 mats * 10/hr = 40/hr.
  // Day 1 capacity = 9h * 40 = 360 bouts. Give it 500 bouts -> 360 fit on
  // Day 1, 140 roll over to Day 2 starting at 9am.
  const days = buildDaySegments(2, '09:00', '18:00', '09:00');
  const schedule = defaultMatSchedule('09:00', 4);
  const results = scheduleChunksAcrossDays(days, [{ label: 'All bouts', bouts: 500 }], schedule, 10);

  assert.equal(results.length, 2);
  assert.equal(results[0].day, 1);
  assert.equal(results[0].startMin, 9 * 60);
  assert.equal(results[0].endMin, 18 * 60);
  assert.equal(results[0].boutsThisSegment, 360);
  assert.equal(results[0].crossesDayBoundary, false);
  assert.equal(results[0].isLastSegmentOfChunk, false);

  assert.equal(results[1].day, 2);
  assert.equal(results[1].startMin, 9 * 60);
  assert.equal(results[1].boutsThisSegment, 140);
  assert.equal(results[1].crossesDayBoundary, true);
  assert.equal(results[1].isLastSegmentOfChunk, true);
  // 140 bouts @ 40/hr = 3.5h -> 9am + 3.5h = 12:30pm
  assert.equal(results[1].endMin, 9 * 60 + 210);
});

test('scheduleChunksAcrossDays: multiple chunks (rounds) that collectively cross the day boundary — only the crossing round splits', () => {
  // Day 1: 9am-11am (2h window) = 2h * 20/hr (2 mats*10/hr) = 40 bouts capacity.
  const days = buildDaySegments(2, '09:00', '11:00', '09:00');
  const schedule = defaultMatSchedule('09:00', 2);
  const chunks = [
    { label: 'Round of 32', bouts: 16 }, // 0.8h, cumulative 0.8h
    { label: 'Round of 16', bouts: 16 }, // 0.8h, cumulative 1.6h -> 0.4h (8 bouts) left in day 1
    { label: 'Quarterfinal', bouts: 12 }, // only 8 bouts' worth of day-1 time left, 4 roll to day 2
  ];
  const results = scheduleChunksAcrossDays(days, chunks, schedule, 10);

  // Round of 32 and Round of 16: one row each, fully on day 1
  const r32 = results.filter((r) => r.chunkLabel === 'Round of 32');
  assert.equal(r32.length, 1);
  assert.equal(r32[0].day, 1);
  assert.equal(r32[0].crossesDayBoundary, false);

  const r16 = results.filter((r) => r.chunkLabel === 'Round of 16');
  assert.equal(r16.length, 1);
  assert.equal(r16[0].day, 1);

  // Quarterfinal: splits into a day-1 part (8 bouts) and a day-2 part (4 bouts)
  const qf = results.filter((r) => r.chunkLabel === 'Quarterfinal');
  assert.equal(qf.length, 2);
  assert.equal(qf[0].day, 1);
  assert.equal(qf[0].boutsThisSegment, 8);
  assert.equal(qf[0].crossesDayBoundary, false);
  assert.equal(qf[0].isLastSegmentOfChunk, false);
  assert.equal(qf[1].day, 2);
  assert.equal(qf[1].boutsThisSegment, 4);
  assert.equal(qf[1].crossesDayBoundary, true);
  assert.equal(qf[1].isLastSegmentOfChunk, true);
});

test('scheduleChunksAcrossDays: zero-bout chunk (e.g. excluded round) still gets exactly one zero-length row', () => {
  const days = buildDaySegments(1, '09:00', '18:00', '09:00');
  const schedule = defaultMatSchedule('09:00', 2);
  const results = scheduleChunksAcrossDays(
    days,
    [{ label: 'Round of 32', bouts: 10 }, { label: 'Bye round', bouts: 0 }],
    schedule, 10
  );
  assert.equal(results.length, 2);
  assert.equal(results[1].chunkLabel, 'Bye round');
  assert.equal(results[1].boutsThisSegment, 0);
  assert.equal(results[1].startMin, results[1].endMin);
});

test('scheduleChunksAcrossDays: respects a mid-day mat-schedule change (integration with boutCapacityForInterval)', () => {
  // Day 1 9am-6pm, 8 mats dropping to 4 at 12pm (3h window total).
  // 9am-12pm: 3h * 80/hr (8mats*10/hr) = 240 capacity.
  const days = buildDaySegments(2, '09:00', '18:00', '09:00');
  const schedule = [{ day: 1, time: '09:00', mats: 8 }, { day: 1, time: '12:00', mats: 4 }];
  // Give exactly 240 bouts -> should land exactly at noon, still day 1, no rollover.
  const results = scheduleChunksAcrossDays(days, [{ label: 'All bouts', bouts: 240 }], schedule, 10);
  assert.equal(results.length, 1);
  assert.equal(results[0].day, 1);
  assert.equal(results[0].endMin, 12 * 60);
  assert.equal(results[0].crossesDayBoundary, false);
});

test('chunkBoutsByDay: a round that fully fits in Day 1 is attributed entirely to day 1', () => {
  const days = buildDaySegments(2, '09:00', '11:00', '09:00');
  const schedule = defaultMatSchedule('09:00', 2);
  const chunks = [{ label: 'Round of 32', bouts: 16 }];
  const segments = scheduleChunksAcrossDays(days, chunks, schedule, 10);
  const byDay = chunkBoutsByDay(segments);
  assert.deepEqual(byDay.get('Round of 32'), { 1: 16 });
});

test('chunkBoutsByDay: a round that straddles the day boundary is split proportionally across days', () => {
  const days = buildDaySegments(2, '09:00', '11:00', '09:00');
  const schedule = defaultMatSchedule('09:00', 2);
  const chunks = [
    { label: 'Round of 32', bouts: 16 },
    { label: 'Round of 16', bouts: 16 },
    { label: 'Quarterfinal', bouts: 12 },
  ];
  const segments = scheduleChunksAcrossDays(days, chunks, schedule, 10);
  const byDay = chunkBoutsByDay(segments);
  assert.deepEqual(byDay.get('Quarterfinal'), { 1: 8, 2: 4 });
});

// ============================================================
// Venue Splitter — splitContiguousWeightRanges()
// ============================================================

test('splitContiguousWeightRanges: 2 equal-capacity gyms split 10 equal-bout weights down the middle', () => {
  const weights = Array.from({ length: 10 }, (_, i) => ({ name: `W${i + 1}`, bouts: 4 }));
  const result = splitContiguousWeightRanges(weights, [20, 20]); // equal capacity
  assert.ok(result);
  // Equal capacity + equal bouts -> an even 5/5 split, contiguous.
  assert.deepEqual(result.assignments.slice(0, 5), [0, 0, 0, 0, 0]);
  assert.deepEqual(result.assignments.slice(5), [1, 1, 1, 1, 1]);
  assert.ok(result.spreadHours < 0.01); // should finish at (nearly) the same time
});

test('splitContiguousWeightRanges: never scatters weight classes — every assignment run is contiguous', () => {
  const weights = Array.from({ length: 12 }, (_, i) => ({ name: `W${i + 1}`, bouts: Math.floor(Math.random() * 10) + 1 }));
  const result = splitContiguousWeightRanges(weights, [15, 10, 25]);
  assert.ok(result);
  // For each location, the set of weight indices assigned to it must be
  // one contiguous run — i.e. once you leave a location's block you
  // never return to it (the defining property Daniel asked for).
  let current = result.assignments[0];
  const seenLocations = new Set([current]);
  for (let i = 1; i < result.assignments.length; i++) {
    if (result.assignments[i] !== current) {
      current = result.assignments[i];
      assert.ok(!seenLocations.has(current), `location ${current} reappeared non-contiguously at index ${i}`);
      seenLocations.add(current);
    }
  }
});

test('splitContiguousWeightRanges: a higher-capacity gym gets a larger contiguous block to balance finish time', () => {
  // Gym A has 2x the capacity of Gym B -> Gym A should get roughly 2x the bouts.
  const weights = Array.from({ length: 9 }, (_, i) => ({ name: `W${i + 1}`, bouts: 2 })); // 18 total bouts
  const result = splitContiguousWeightRanges(weights, [20, 10]); // A: 20/hr, B: 10/hr
  assert.ok(result);
  const groupA = result.groups.find((g) => g.locationIndex === 0);
  const groupB = result.groups.find((g) => g.locationIndex === 1);
  // A's capacity is 2x B's -> for balanced finish times A should carry ~2x B's bouts.
  assert.ok(groupA.totalBouts > groupB.totalBouts);
  assert.ok(result.spreadHours < 0.2); // finish times should be close
});

test('splitContiguousWeightRanges: returns null for empty weight list', () => {
  assert.equal(splitContiguousWeightRanges([], [10, 10]), null);
});

test('splitContiguousWeightRanges: returns null when no location has positive capacity', () => {
  const weights = [{ name: 'W1', bouts: 4 }];
  assert.equal(splitContiguousWeightRanges(weights, [0, 0]), null);
});

test('splitContiguousWeightRanges: single location gets everything', () => {
  const weights = [{ name: 'W1', bouts: 4 }, { name: 'W2', bouts: 6 }];
  const result = splitContiguousWeightRanges(weights, [10]);
  assert.deepEqual(result.assignments, [0, 0]);
  assert.equal(result.groups[0].totalBouts, 10);
});

