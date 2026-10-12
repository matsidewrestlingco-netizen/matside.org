// ============================================================
// Matside Live — shared event/pace/ETA helpers (Phase A)
// Pure functions only (no DOM, no Firebase) so they can be unit
// tested in plain Node. Included by wt/index.html; the parent
// view reads already-computed derived/ data and doesn't need this.
// See /opt/data/matside/matside-live-v2-spec.md §2-3 for the model.
// ============================================================

(function (global) {
  "use strict";

  // ---------- event id / join code ----------

  function slugify(name) {
    return String(name || "event")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "event";
  }

  // eventId = YYYY-MM-DD-slug (spec §2)
  function genEventId(name, dateStr) {
    const d = dateStr || new Date().toISOString().slice(0, 10);
    return `${d}-${slugify(name)}`;
  }

  // 4-digit join code, string so leading zeros survive (e.g. "0042")
  function genJoinCode() {
    return String(Math.floor(Math.random() * 10000)).padStart(4, "0");
  }

  // ---------- pace math (spec §3.1-3.2) ----------

  function median(nums) {
    const arr = nums.filter((n) => typeof n === "number" && isFinite(n) && n >= 0).slice().sort((a, b) => a - b);
    if (arr.length === 0) return null;
    const mid = Math.floor(arr.length / 2);
    return arr.length % 2 === 0 ? (arr[mid - 1] + arr[mid]) / 2 : arr[mid];
  }

  function average(nums) {
    const arr = nums.filter((n) => typeof n === "number" && isFinite(n) && n >= 0);
    if (arr.length === 0) return null;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }

  // logObj: { boutKey: { startEpoch, endEpoch, ... } }
  // Turnaround = gap between one bout's end and the NEXT bout's start,
  // in chronological order on that mat (spec: "dead time").
  function computeMatStats(logObj) {
    const bouts = Object.values(logObj || {})
      .filter((b) => b && typeof b.startEpoch === "number" && typeof b.endEpoch === "number" && b.endEpoch > b.startEpoch)
      .sort((a, b) => a.startEpoch - b.startEpoch);

    const durationsSec = bouts.map((b) => (b.endEpoch - b.startEpoch) / 1000);
    const turnaroundsSec = [];
    for (let i = 1; i < bouts.length; i++) {
      const gap = (bouts[i].startEpoch - bouts[i - 1].endEpoch) / 1000;
      if (gap >= 0) turnaroundsSec.push(gap);
    }
    const last5 = durationsSec.slice(-5);

    return {
      boutsLogged: bouts.length,
      medianBoutSec: median(durationsSec),
      medianTurnaroundSec: median(turnaroundsSec),
      last5AvgSec: average(last5),
    };
  }

  // Fallback chain (spec §3.1): this mat today -> all mats today ->
  // stored priors by level -> old bouts/hr input. Caller supplies
  // whichever stats are available in that priority order; the first
  // one with a non-null medianBoutSec wins.
  function pickPace(candidates) {
    for (const c of candidates) {
      if (c && typeof c.medianBoutSec === "number") return c;
    }
    return null;
  }

  // Per-mat ETA: boutsRemaining * (medianBout + medianTurnaround) (spec §3.2)
  function computeMatETA(stats, boutsRemaining, fallbackBoutsPerHour, nowMs) {
    nowMs = nowMs || Date.now();
    if (!boutsRemaining || boutsRemaining <= 0) {
      return { boutsRemaining: 0, estFinishEpoch: nowMs, perBoutSec: null, source: "none" };
    }
    let perBoutSec = null;
    let source = "fallback";
    if (stats && typeof stats.medianBoutSec === "number") {
      perBoutSec = stats.medianBoutSec + (stats.medianTurnaroundSec || 0);
      source = "measured";
    } else if (fallbackBoutsPerHour > 0) {
      perBoutSec = 3600 / fallbackBoutsPerHour;
    }
    if (!perBoutSec) return { boutsRemaining, estFinishEpoch: null, perBoutSec: null, source: "unknown" };
    const estFinishEpoch = nowMs + boutsRemaining * perBoutSec * 1000;
    return { boutsRemaining, estFinishEpoch, perBoutSec, source };
  }

  // Cross-check (spec §3.5): Flo total vs summed logger counts.
  // Returns null if nothing to compare; otherwise a diff + flag.
  function reconcileFloVsLogger(floTotalCompleted, matLogs) {
    if (floTotalCompleted === null || floTotalCompleted === undefined) return null;
    const loggerTotal = Object.values(matLogs || {}).reduce(
      (sum, log) => sum + Object.keys(log || {}).length,
      0
    );
    const diff = floTotalCompleted - loggerTotal;
    return { floTotalCompleted, loggerTotal, diff, warn: Math.abs(diff) > 3 };
  }

  const LiveModel = {
    slugify,
    genEventId,
    genJoinCode,
    median,
    average,
    computeMatStats,
    pickPace,
    computeMatETA,
    reconcileFloVsLogger,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = LiveModel;
  } else {
    global.LiveModel = LiveModel;
  }
})(typeof window !== "undefined" ? window : globalThis);
