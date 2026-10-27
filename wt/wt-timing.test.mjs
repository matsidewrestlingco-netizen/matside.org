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
  roundKind,
  boutDurationSec,
  derivedBoutsPerHourPerMat,
  FOLKSTYLE_LEVEL_PRESETS,
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
