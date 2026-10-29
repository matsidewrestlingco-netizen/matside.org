// ============================================================
// Per-round bout data from spreadsheet (bracket size → bouts per round)
// ============================================================
import {
  sortMatSchedule, matsAtTime, boutCapacityForInterval, timeToCompleteBouts, defaultMatSchedule,
  buildDaySegments, scheduleChunksAcrossDays, chunkBoutsByDay,
  roundKind, boutDurationSec, derivedBoutsPerHourPerMat,
  FOLKSTYLE_LEVEL_PRESETS,
  splitContiguousWeightRanges,
} from './wt-timing.mjs';

const ROUND_DATA = {
  top8: {
    rounds: ["R64","R32","CR32-1","CR32-2","R16","CR16-1","CR16-2","R8","CR8-1","CR8-2","Semis","CR4-1","CR4-2","Finals","Third","Fifth","Seventh"],
    data: {
      6:[0,0,0,0,0,0,0,2,0,0,2,1,2,1,1,1,0],7:[0,0,0,0,0,0,0,3,0,0,2,2,2,1,1,1,0],
      8:[0,0,0,0,0,0,0,4,0,0,2,2,2,1,1,1,1],9:[0,0,0,0,1,0,0,4,0,1,2,2,2,1,1,1,1],
      10:[0,0,0,0,2,0,0,4,0,2,2,2,2,1,1,1,1],11:[0,0,0,0,3,0,0,4,0,3,2,2,2,1,1,1,1],
      12:[0,0,0,0,4,0,0,4,0,4,2,2,2,1,1,1,1],13:[0,0,0,0,5,0,0,4,1,4,2,2,2,1,1,1,1],
      14:[0,0,0,0,6,0,0,4,2,4,2,2,2,1,1,1,1],15:[0,0,0,0,7,0,0,4,3,4,2,2,2,1,1,1,1],
      16:[0,0,0,0,8,0,0,4,4,4,2,2,2,1,1,1,1],17:[0,1,0,0,8,0,1,4,4,4,2,2,2,1,1,1,1],
      18:[0,2,0,0,8,0,2,4,4,4,2,2,2,1,1,1,1],19:[0,3,0,0,8,0,3,4,4,4,2,2,2,1,1,1,1],
      20:[0,4,0,0,8,0,4,4,4,4,2,2,2,1,1,1,1],21:[0,5,0,0,8,0,5,4,4,4,2,2,2,1,1,1,1],
      22:[0,6,0,0,8,0,6,4,4,4,2,2,2,1,1,1,1],23:[0,7,0,0,8,0,7,4,4,4,2,2,2,1,1,1,1],
      24:[0,8,0,0,8,0,8,4,4,4,2,2,2,1,1,1,1],25:[0,9,0,0,8,1,8,4,4,4,2,2,2,1,1,1,1],
      26:[0,10,0,0,8,2,8,4,4,4,2,2,2,1,1,1,1],27:[0,11,0,0,8,3,8,4,4,4,2,2,2,1,1,1,1],
      28:[0,12,0,0,8,4,8,4,4,4,2,2,2,1,1,1,1],29:[0,13,0,0,8,5,8,4,4,4,2,2,2,1,1,1,1],
      30:[0,14,0,0,8,6,8,4,4,4,2,2,2,1,1,1,1],31:[0,15,0,0,8,7,8,4,4,4,2,2,2,1,1,1,1],
      32:[0,16,0,0,8,8,8,4,4,4,2,2,2,1,1,1,1],33:[1,16,0,1,8,8,8,4,4,4,2,2,2,1,1,1,1],
      34:[2,16,0,2,8,8,8,4,4,4,2,2,2,1,1,1,1],35:[3,16,0,3,8,8,8,4,4,4,2,2,2,1,1,1,1],
      36:[4,16,0,4,8,8,8,4,4,4,2,2,2,1,1,1,1],37:[5,16,0,5,8,8,8,4,4,4,2,2,2,1,1,1,1],
      38:[6,16,0,6,8,8,8,4,4,4,2,2,2,1,1,1,1],39:[7,16,0,7,8,8,8,4,4,4,2,2,2,1,1,1,1],
      40:[8,16,0,8,8,8,8,4,4,4,2,2,2,1,1,1,1],41:[9,16,0,9,8,8,8,4,4,4,2,2,2,1,1,1,1],
      42:[10,16,0,10,8,8,8,4,4,4,2,2,2,1,1,1,1],43:[11,16,0,11,8,8,8,4,4,4,2,2,2,1,1,1,1],
      44:[12,16,0,12,8,8,8,4,4,4,2,2,2,1,1,1,1],45:[13,16,0,13,8,8,8,4,4,4,2,2,2,1,1,1,1],
      46:[14,16,0,14,8,8,8,4,4,4,2,2,2,1,1,1,1],47:[15,16,0,15,8,8,8,4,4,4,2,2,2,1,1,1,1],
      48:[16,16,0,16,8,8,8,4,4,4,2,2,2,1,1,1,1],49:[17,16,1,16,8,8,8,4,4,4,2,2,2,1,1,1,1],
      50:[18,16,2,16,8,8,8,4,4,4,2,2,2,1,1,1,1],51:[19,16,3,16,8,8,8,4,4,4,2,2,2,1,1,1,1],
      52:[20,16,4,16,8,8,8,4,4,4,2,2,2,1,1,1,1],53:[21,16,5,16,8,8,8,4,4,4,2,2,2,1,1,1,1],
      54:[22,16,6,16,8,8,8,4,4,4,2,2,2,1,1,1,1],55:[23,16,7,16,8,8,8,4,4,4,2,2,2,1,1,1,1],
      56:[24,16,8,16,8,8,8,4,4,4,2,2,2,1,1,1,1],57:[25,16,9,16,8,8,8,4,4,4,2,2,2,1,1,1,1],
      58:[26,16,10,16,8,8,8,4,4,4,2,2,2,1,1,1,1],59:[27,16,11,16,8,8,8,4,4,4,2,2,2,1,1,1,1],
      60:[28,16,12,16,8,8,8,4,4,4,2,2,2,1,1,1,1],61:[29,16,13,16,8,8,8,4,4,4,2,2,2,1,1,1,1],
      62:[30,16,14,16,8,8,8,4,4,4,2,2,2,1,1,1,1],63:[31,16,15,16,8,8,8,4,4,4,2,2,2,1,1,1,1],
      64:[32,16,16,16,8,8,8,4,4,4,2,2,2,1,1,1,1],
    }
  },
  top6: {
    rounds: ["R64","CR32-1","R32","CR32-2","R16","CR16-1","CR16-2","R8","CR8-1","CR8-2","Semis","CR4-1","CR4-2","Finals","Third","Fifth"],
    data: {
      6:[0,0,0,0,0,0,0,2,0,0,2,1,2,1,1,1],7:[0,0,0,0,0,0,0,3,0,0,2,2,2,1,1,1],
      8:[0,0,0,0,0,0,0,4,0,0,2,2,2,1,1,1],9:[0,0,0,0,1,0,0,4,0,1,2,2,2,1,1,1],
      10:[0,0,0,0,2,0,0,4,0,2,2,2,2,1,1,1],11:[0,0,0,0,3,0,0,4,0,3,2,2,2,1,1,1],
      12:[0,0,0,0,4,0,0,4,0,4,2,2,2,1,1,1],13:[0,0,0,0,5,0,0,4,1,4,2,2,2,1,1,1],
      14:[0,0,0,0,6,0,0,4,2,4,2,2,2,1,1,1],15:[0,0,0,0,7,0,0,4,3,4,2,2,2,1,1,1],
      16:[0,0,0,0,8,0,0,4,4,4,2,2,2,1,1,1],17:[0,0,1,0,8,0,1,4,4,4,2,2,2,1,1,1],
      18:[0,0,2,0,8,0,2,4,4,4,2,2,2,1,1,1],19:[0,0,3,0,8,0,3,4,4,4,2,2,2,1,1,1],
      20:[0,0,4,0,8,0,4,4,4,4,2,2,2,1,1,1],21:[0,0,5,0,8,0,5,4,4,4,2,2,2,1,1,1],
      22:[0,0,6,0,8,0,6,4,4,4,2,2,2,1,1,1],23:[0,0,7,0,8,0,7,4,4,4,2,2,2,1,1,1],
      24:[0,0,8,0,8,0,8,4,4,4,2,2,2,1,1,1],25:[0,0,9,0,8,1,8,4,4,4,2,2,2,1,1,1],
      26:[0,0,10,0,8,2,8,4,4,4,2,2,2,1,1,1],27:[0,0,11,0,8,3,8,4,4,4,2,2,2,1,1,1],
      28:[0,0,12,0,8,4,8,4,4,4,2,2,2,1,1,1],29:[0,0,13,0,8,5,8,4,4,4,2,2,2,1,1,1],
      30:[0,0,14,0,8,6,8,4,4,4,2,2,2,1,1,1],31:[0,0,15,0,8,7,8,4,4,4,2,2,2,1,1,1],
      32:[0,0,16,0,8,8,8,4,4,4,2,2,2,1,1,1],33:[1,0,16,1,8,8,8,4,4,4,2,2,2,1,1,1],
      34:[2,0,16,2,8,8,8,4,4,4,2,2,2,1,1,1],35:[3,0,16,3,8,8,8,4,4,4,2,2,2,1,1,1],
      36:[4,0,16,4,8,8,8,4,4,4,2,2,2,1,1,1],37:[5,0,16,5,8,8,8,4,4,4,2,2,2,1,1,1],
      38:[6,0,16,6,8,8,8,4,4,4,2,2,2,1,1,1],39:[7,0,16,7,8,8,8,4,4,4,2,2,2,1,1,1],
      40:[8,0,16,8,8,8,8,4,4,4,2,2,2,1,1,1],41:[9,0,16,9,8,8,8,4,4,4,2,2,2,1,1,1],
      42:[10,0,16,10,8,8,8,4,4,4,2,2,2,1,1,1],43:[11,0,16,11,8,8,8,4,4,4,2,2,2,1,1,1],
      44:[12,0,16,12,8,8,8,4,4,4,2,2,2,1,1,1],45:[13,0,16,13,8,8,8,4,4,4,2,2,2,1,1,1],
      46:[14,0,16,14,8,8,8,4,4,4,2,2,2,1,1,1],47:[15,0,16,15,8,8,8,4,4,4,2,2,2,1,1,1],
      48:[16,0,16,16,8,8,8,4,4,4,2,2,2,1,1,1],49:[17,1,16,16,8,8,8,4,4,4,2,2,2,1,1,1],
      50:[18,2,16,16,8,8,8,4,4,4,2,2,2,1,1,1],51:[19,3,16,16,8,8,8,4,4,4,2,2,2,1,1,1],
      52:[20,4,16,16,8,8,8,4,4,4,2,2,2,1,1,1],53:[21,5,16,16,8,8,8,4,4,4,2,2,2,1,1,1],
      54:[22,6,16,16,8,8,8,4,4,4,2,2,2,1,1,1],55:[23,7,16,16,8,8,8,4,4,4,2,2,2,1,1,1],
      56:[24,8,16,16,8,8,8,4,4,4,2,2,2,1,1,1],57:[25,9,16,16,8,8,8,4,4,4,2,2,2,1,1,1],
      58:[26,10,16,16,8,8,8,4,4,4,2,2,2,1,1,1],59:[27,11,16,16,8,8,8,4,4,4,2,2,2,1,1,1],
      60:[28,12,16,16,8,8,8,4,4,4,2,2,2,1,1,1],61:[29,13,16,16,8,8,8,4,4,4,2,2,2,1,1,1],
      62:[30,14,16,16,8,8,8,4,4,4,2,2,2,1,1,1],63:[31,15,16,16,8,8,8,4,4,4,2,2,2,1,1,1],
      64:[32,16,16,16,8,8,8,4,4,4,2,2,2,1,1,1],
    }
  },
  top4: {
    rounds: ["R64","CR32-1","R32","CR32-2","R16","CR16-1","CR16-2","R8","CR8-1","CR8-2","Semis","CR4-1","CR4-2","Finals","Third"],
    data: {
      6:[0,0,0,0,0,0,0,2,0,0,2,1,2,1,1],7:[0,0,0,0,0,0,0,3,0,0,2,2,2,1,1],
      8:[0,0,0,0,0,0,0,4,0,0,2,2,2,1,1],9:[0,0,0,0,1,0,0,4,0,1,2,2,2,1,1],
      10:[0,0,0,0,2,0,0,4,0,2,2,2,2,1,1],11:[0,0,0,0,3,0,0,4,0,3,2,2,2,1,1],
      12:[0,0,0,0,4,0,0,4,0,4,2,2,2,1,1],13:[0,0,0,0,5,0,0,4,1,4,2,2,2,1,1],
      14:[0,0,0,0,6,0,0,4,2,4,2,2,2,1,1],15:[0,0,0,0,7,0,0,4,3,4,2,2,2,1,1],
      16:[0,0,0,0,8,0,0,4,4,4,2,2,2,1,1],17:[0,0,1,0,8,0,1,4,4,4,2,2,2,1,1],
      18:[0,0,2,0,8,0,2,4,4,4,2,2,2,1,1],19:[0,0,3,0,8,0,3,4,4,4,2,2,2,1,1],
      20:[0,0,4,0,8,0,4,4,4,4,2,2,2,1,1],21:[0,0,5,0,8,0,5,4,4,4,2,2,2,1,1],
      22:[0,0,6,0,8,0,6,4,4,4,2,2,2,1,1],23:[0,0,7,0,8,0,7,4,4,4,2,2,2,1,1],
      24:[0,0,8,0,8,0,8,4,4,4,2,2,2,1,1],25:[0,0,9,0,8,1,8,4,4,4,2,2,2,1,1],
      26:[0,0,10,0,8,2,8,4,4,4,2,2,2,1,1],27:[0,0,11,0,8,3,8,4,4,4,2,2,2,1,1],
      28:[0,0,12,0,8,4,8,4,4,4,2,2,2,1,1],29:[0,0,13,0,8,5,8,4,4,4,2,2,2,1,1],
      30:[0,0,14,0,8,6,8,4,4,4,2,2,2,1,1],31:[0,0,15,0,8,7,8,4,4,4,2,2,2,1,1],
      32:[0,0,16,0,8,8,8,4,4,4,2,2,2,1,1],33:[1,0,16,1,8,8,8,4,4,4,2,2,2,1,1],
      34:[2,0,16,2,8,8,8,4,4,4,2,2,2,1,1],35:[3,0,16,3,8,8,8,4,4,4,2,2,2,1,1],
      36:[4,0,16,4,8,8,8,4,4,4,2,2,2,1,1],37:[5,0,16,5,8,8,8,4,4,4,2,2,2,1,1],
      38:[6,0,16,6,8,8,8,4,4,4,2,2,2,1,1],39:[7,0,16,7,8,8,8,4,4,4,2,2,2,1,1],
      40:[8,0,16,8,8,8,8,4,4,4,2,2,2,1,1],41:[9,0,16,9,8,8,8,4,4,4,2,2,2,1,1],
      42:[10,0,16,10,8,8,8,4,4,4,2,2,2,1,1],43:[11,0,16,11,8,8,8,4,4,4,2,2,2,1,1],
      44:[12,0,16,12,8,8,8,4,4,4,2,2,2,1,1],45:[13,0,16,13,8,8,8,4,4,4,2,2,2,1,1],
      46:[14,0,16,14,8,8,8,4,4,4,2,2,2,1,1],47:[15,0,16,15,8,8,8,4,4,4,2,2,2,1,1],
      48:[16,0,16,16,8,8,8,4,4,4,2,2,2,1,1],49:[17,1,16,16,8,8,8,4,4,4,2,2,2,1,1],
      50:[18,2,16,16,8,8,8,4,4,4,2,2,2,1,1],51:[19,3,16,16,8,8,8,4,4,4,2,2,2,1,1],
      52:[20,4,16,16,8,8,8,4,4,4,2,2,2,1,1],53:[21,5,16,16,8,8,8,4,4,4,2,2,2,1,1],
      54:[22,6,16,16,8,8,8,4,4,4,2,2,2,1,1],55:[23,7,16,16,8,8,8,4,4,4,2,2,2,1,1],
      56:[24,8,16,16,8,8,8,4,4,4,2,2,2,1,1],57:[25,9,16,16,8,8,8,4,4,4,2,2,2,1,1],
      58:[26,10,16,16,8,8,8,4,4,4,2,2,2,1,1],59:[27,11,16,16,8,8,8,4,4,4,2,2,2,1,1],
      60:[28,12,16,16,8,8,8,4,4,4,2,2,2,1,1],61:[29,13,16,16,8,8,8,4,4,4,2,2,2,1,1],
      62:[30,14,16,16,8,8,8,4,4,4,2,2,2,1,1],63:[31,15,16,16,8,8,8,4,4,4,2,2,2,1,1],
      64:[32,16,16,16,8,8,8,4,4,4,2,2,2,1,1],
    }
  },
};

// ============================================================
// Bout lookup tables from spreadsheet (bracket size → total bouts)
// ============================================================
const BOUT_TABLE = {
  top8: {
    6:10, 7:12, 8:14, 9:16, 10:18, 11:20, 12:22, 13:24, 14:26, 15:28,
    16:30, 17:32, 18:34, 19:36, 20:38, 21:40, 22:42, 23:44, 24:46, 25:48,
    26:50, 27:52, 28:54, 29:56, 30:58, 31:60, 32:62, 33:64, 34:66, 35:68,
    36:70, 37:72, 38:74, 39:76, 40:78, 41:80, 42:82, 43:84, 44:86, 45:88,
    46:90, 47:92, 48:94, 49:96, 50:98, 51:100, 52:102, 53:104, 54:106,
    55:108, 56:110, 57:112, 58:114, 59:116, 60:118, 61:120, 62:122, 63:124, 64:126
  },
  top6: {
    6:10, 7:12, 8:13, 9:15, 10:17, 11:19, 12:21, 13:23, 14:25, 15:27,
    16:29, 17:31, 18:33, 19:35, 20:37, 21:39, 22:41, 23:43, 24:45, 25:47,
    26:49, 27:51, 28:53, 29:55, 30:57, 31:59, 32:61, 33:63, 34:65, 35:67,
    36:69, 37:71, 38:73, 39:75, 40:77, 41:79, 42:81, 43:83, 44:85, 45:87,
    46:89, 47:91, 48:93, 49:95, 50:97, 51:99, 52:101, 53:103, 54:105,
    55:107, 56:109, 57:111, 58:113, 59:115, 60:117, 61:119, 62:121, 63:123, 64:125
  },
  top4: {
    6:9, 7:11, 8:12, 9:14, 10:16, 11:18, 12:20, 13:22, 14:24, 15:26,
    16:28, 17:30, 18:32, 19:34, 20:36, 21:38, 22:40, 23:42, 24:44, 25:46,
    26:48, 27:50, 28:52, 29:54, 30:56, 31:58, 32:60, 33:62, 34:64, 35:66,
    36:68, 37:70, 38:72, 39:74, 40:76, 41:78, 42:80, 43:82, 44:84, 45:86,
    46:88, 47:90, 48:92, 49:94, 50:96, 51:98, 52:100, 53:102, 54:104,
    55:106, 56:108, 57:110, 58:112, 59:114, 60:116, 61:118, 62:120, 63:122, 64:124
  }
};

// Fallback "Bouts/Hour/Mat" placeholder shown before weight-class data
// exists to compute a real derived value from period lengths — just the
// championship-rate approximation from FOLKSTYLE_LEVEL_PRESETS, rounded.
// Once bouts are entered, applyLevelDefault() replaces this with the
// real weighted derivedBoutsPerHourPerMat() value (see below).
function placeholderBoutsPerHour(level) {
  const cfg = FOLKSTYLE_LEVEL_PRESETS[level];
  if (!cfg) return 10;
  const sec = cfg.championship.periods.reduce((a, b) => a + b, 0) + cfg.championship.turnaroundSec;
  return Math.round((3600 / sec) * 10) / 10;
}

// ============================================================
// DOM references
// ============================================================
const form = document.getElementById("estimator-form");
const numDaysSelect = document.getElementById("num-days");
const levelSelect = document.getElementById("level");
const boutsPerHourInput = document.getElementById("bouts-per-hour");
const defaultHint = document.getElementById("default-hint");
const placingSelect = document.getElementById("placing");
const numWeightsInput = document.getElementById("num-weights");
const weightInputsContainer = document.getElementById("weight-inputs");
const totalBoutsDisplay = document.getElementById("total-bouts-display");

const endTimeDay1Group = document.getElementById("end-time-day1-group");
const endTimeDay1Input = document.getElementById("end-time-day1");
const startTimeDay2Group = document.getElementById("start-time-day2-group");
const startTimeDay2Input = document.getElementById("start-time-day2");
const startTimeDay1Input = document.getElementById("start-time-day1");
const numMatsInput = document.getElementById("num-mats");

// Style + period config (Mat Schedule & Period Timing, see
// docs/superpowers/specs/2026-10-27-wt-mat-schedule-period-timing.md)
const wrestlingStyleSelect = document.getElementById("wrestling-style");
const styleUnsupportedHint = document.getElementById("style-unsupported-hint");
const youthConsolationHint = document.getElementById("youth-consolation-hint");
const periodChamp1 = document.getElementById("period-champ-1");
const periodChamp2 = document.getElementById("period-champ-2");
const periodChamp3 = document.getElementById("period-champ-3");
const periodCons1 = document.getElementById("period-cons-1");
const periodCons2 = document.getElementById("period-cons-2");
const periodCons3 = document.getElementById("period-cons-3");
const periodTurnaroundInput = document.getElementById("period-turnaround");
const matScheduleRowsEl = document.getElementById("mat-schedule-rows");
const btnAddMatChange = document.getElementById("btn-add-mat-change");

// ============================================================
// Helpers
// ============================================================

function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(totalMinutes) {
  const h = Math.floor(totalMinutes / 60);
  const m = Math.round(totalMinutes % 60);
  const period = h >= 12 ? "PM" : "AM";
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${displayH}:${m.toString().padStart(2, "0")} ${period}`;
}

function formatDuration(totalMinutes) {
  const h = Math.floor(totalMinutes / 60);
  const m = Math.round(totalMinutes % 60);
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

function getBouts(placing, wrestlers) {
  if (wrestlers < 2) return 0;
  if (wrestlers < 6) {
    // Below the table minimum — small brackets: round robin or mini bracket
    // For 2 wrestlers: 1 bout (just finals)
    // For 3: 3 bouts (round robin)
    // For 4: 3–5 depending on format; use simple estimate
    // For 5: use simple estimate
    const smallBouts = { 2: 1, 3: 3, 4: 5, 5: 7 };
    return smallBouts[wrestlers] || 0;
  }
  const table = BOUT_TABLE[placing];
  const clamped = Math.min(wrestlers, 64);
  return table[clamped] || 0;
}

// Set of round names excluded from time calculations
let excludedRounds = new Set();

function getBoutsFiltered(placing, wrestlers) {
  if (wrestlers < 2) return 0;
  if (wrestlers < 6) {
    const smallBouts = { 2: 1, 3: 3, 4: 5, 5: 7 };
    return smallBouts[wrestlers] || 0;
  }
  const fmt = ROUND_DATA[placing];
  if (!fmt) return getBouts(placing, wrestlers);
  const clamped = Math.min(wrestlers, 64);
  const roundBouts = fmt.data[clamped];
  if (!roundBouts) return BOUT_TABLE[placing][clamped] || 0;
  let total = 0;
  for (let r = 0; r < roundBouts.length; r++) {
    if (!excludedRounds.has(fmt.rounds[r])) {
      total += roundBouts[r];
    }
  }
  return total;
}

// ============================================================
// Mat Schedule state (see spec §1 — matsAtTime)
// ============================================================
// matSchedule starts as the single-segment default mirroring today's
// flat `Number of Mats` field. Additional segments are user-added via
// "+ Add mat change". Kept at module scope so form submit / session
// save-load / live mat status can all read it.
let matSchedule = defaultMatSchedule(startTimeDay1Input.value, parseInt(numMatsInput.value) || 1);

function syncFirstMatScheduleSegment() {
  // Segment 1's day/time always mirrors Start Time Day 1 (spec §1 —
  // "not independently editable"); its mats value mirrors the base
  // Number of Mats field. Keep them in lockstep rather than letting
  // the base field and segment 1 drift apart.
  const sorted = sortMatSchedule(matSchedule);
  if (sorted.length === 0) {
    matSchedule = defaultMatSchedule(startTimeDay1Input.value, parseInt(numMatsInput.value) || 1);
    return;
  }
  sorted[0] = { day: 1, time: startTimeDay1Input.value, mats: parseInt(numMatsInput.value) || 1 };
  matSchedule = sorted;
}

function renderMatScheduleRows() {
  matScheduleRowsEl.innerHTML = "";
  const extraSegments = sortMatSchedule(matSchedule).slice(1); // segment 0 is the base field, not shown here

  extraSegments.forEach((seg, i) => {
    const row = document.createElement("div");
    row.className = "mat-schedule-row";

    const dayOptions = numDaysSelect.value === "2" ? [1, 2] : [1];

    const daySelect = document.createElement("select");
    daySelect.className = "mat-schedule-day";
    dayOptions.forEach((d) => {
      const opt = document.createElement("option");
      opt.value = d;
      opt.textContent = `Day ${d}`;
      if (d === seg.day) opt.selected = true;
      daySelect.appendChild(opt);
    });

    const timeInput = document.createElement("input");
    timeInput.type = "time";
    timeInput.className = "mat-schedule-time";
    timeInput.value = seg.time;

    const matsInput = document.createElement("input");
    matsInput.type = "number";
    matsInput.className = "mat-schedule-mats";
    matsInput.min = "1";
    matsInput.max = "20";
    matsInput.value = seg.mats;

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "btn-round-action";
    removeBtn.textContent = "Remove";

    function commit() {
      const idx = i + 1; // +1 because extraSegments skips segment 0
      const sorted = sortMatSchedule(matSchedule);
      sorted[idx] = {
        day: parseInt(daySelect.value),
        time: timeInput.value,
        mats: parseInt(matsInput.value) || 1,
      };
      matSchedule = sorted;
      updateTotalBouts();
    }

    daySelect.addEventListener("change", commit);
    timeInput.addEventListener("change", commit);
    matsInput.addEventListener("input", commit);
    removeBtn.addEventListener("click", function () {
      const sorted = sortMatSchedule(matSchedule);
      sorted.splice(i + 1, 1);
      matSchedule = sorted;
      renderMatScheduleRows();
      updateTotalBouts();
    });

    row.appendChild(daySelect);
    row.appendChild(timeInput);
    row.appendChild(matsInput);
    row.appendChild(removeBtn);
    matScheduleRowsEl.appendChild(row);
  });
}

btnAddMatChange.addEventListener("click", function () {
  const sorted = sortMatSchedule(matSchedule);
  const lastMats = sorted[sorted.length - 1]?.mats || parseInt(numMatsInput.value) || 1;
  sorted.push({ day: numDaysSelect.value === "2" ? 2 : 1, time: "12:00", mats: lastMats });
  matSchedule = sorted;
  renderMatScheduleRows();
  updateTotalBouts();
});

numMatsInput.addEventListener("input", function () {
  syncFirstMatScheduleSegment();
  updateTotalBouts();
});
startTimeDay1Input.addEventListener("change", function () {
  syncFirstMatScheduleSegment();
  updateTotalBouts();
});

// ============================================================
// Period config + Style (see spec §2 — roundKind / boutDurationSec)
// ============================================================
// boutsPerHourOverridden: once the user hand-edits Bouts/Hour/Mat
// directly, stop silently overwriting it from the derived period-based
// calculation — their explicit number wins until they change Level or
// a period field again (which resets the override, matching how
// changing Level already used to just overwrite the field outright).
let boutsPerHourOverridden = false;
let periodConfig = buildPeriodConfigFromPresetAndFields();

function buildPeriodConfigFromPresetAndFields() {
  return {
    style: "folkstyle", // only style with working math this pass — see spec §2 follow-up
    championship: {
      periods: [periodChamp1, periodChamp2, periodChamp3].map((el) => parseFloat(el.value) || 0),
      turnaroundSec: parseFloat(periodTurnaroundInput.value) || 0,
    },
    consolation: {
      periods: [periodCons1, periodCons2, periodCons3].map((el) => parseFloat(el.value) || 0),
      turnaroundSec: parseFloat(periodTurnaroundInput.value) || 0,
    },
  };
}

function applyPeriodPreset(level) {
  const preset = FOLKSTYLE_LEVEL_PRESETS[level];
  if (!preset) return;
  [periodChamp1, periodChamp2, periodChamp3].forEach((el, i) => { el.value = preset.championship.periods[i]; });
  [periodCons1, periodCons2, periodCons3].forEach((el, i) => { el.value = preset.consolation.periods[i]; });
  periodTurnaroundInput.value = preset.championship.turnaroundSec;
  youthConsolationHint.textContent = level === "youth"
    ? "Youth consolation periods default to the same as championship (no separate number confirmed yet) — edit above if different."
    : "";
}

function updateStyleUnsupportedHint() {
  const isFolkstyle = wrestlingStyleSelect.value === "folkstyle";
  styleUnsupportedHint.textContent = isFolkstyle
    ? ""
    : "— not yet supported, showing Folkstyle timing (Freestyle/Greco is a tracked follow-up)";
  // Freestyle/Greco period fields are disabled rather than hidden: the
  // UI should make clear nothing was silently recomputed, not pretend
  // the style selection took effect.
  [periodChamp1, periodChamp2, periodChamp3, periodCons1, periodCons2, periodCons3, periodTurnaroundInput]
    .forEach((el) => { el.disabled = !isFolkstyle; });
}

// ============================================================
// Level → derived period lengths + Bouts/Hour/Mat
// ============================================================
function applyLevelDefault() {
  const level = levelSelect.value;
  applyPeriodPreset(level);
  periodConfig = buildPeriodConfigFromPresetAndFields();
  boutsPerHourOverridden = false; // a level change resets any manual override
  refreshDerivedBoutsPerHour();
}

function refreshDerivedBoutsPerHour() {
  if (boutsPerHourOverridden) return;
  periodConfig = buildPeriodConfigFromPresetAndFields();
  // Use current weight-class data (if any) to weight championship vs.
  // consolation bout mix; fall back to the championship-only placeholder
  // before any weight data exists (see placeholderBoutsPerHour above).
  const counts = currentBoutKindCounts();
  const derived = counts
    ? derivedBoutsPerHourPerMat(counts, periodConfig)
    : null;
  const value = derived ?? placeholderBoutsPerHour(levelSelect.value);
  boutsPerHourInput.value = value;
  defaultHint.textContent = `(derived from period lengths: ${value})`;
}

/** Sums championship vs. consolation bout counts from the currently
 * entered weight classes + round filter, for the Bouts/Hour/Mat live
 * hint. Returns null before any weight-class rows exist. */
function currentBoutKindCounts() {
  const placing = placingSelect.value;
  const fmt = ROUND_DATA[placing];
  if (!fmt) return null;
  const inputs = weightInputsContainer.querySelectorAll(".weight-wrestler-input");
  if (inputs.length === 0) return null;

  let championship = 0;
  let consolation = 0;
  let any = false;
  inputs.forEach((inp) => {
    const wrestlers = parseInt(inp.value) || 0;
    if (wrestlers < 6) return; // below ROUND_DATA table range — round-level split not available
    const roundBouts = fmt.data[Math.min(wrestlers, 64)];
    if (!roundBouts) return;
    any = true;
    for (let r = 0; r < roundBouts.length; r++) {
      const roundName = fmt.rounds[r];
      if (excludedRounds.has(roundName)) continue;
      if (roundKind(roundName) === "consolation") consolation += roundBouts[r];
      else championship += roundBouts[r];
    }
  });
  return any ? { championship, consolation } : null;
}

boutsPerHourInput.addEventListener("input", function () {
  boutsPerHourOverridden = true;
  defaultHint.textContent = "(manually overridden — edit Level or a period field to re-derive)";
});

[periodChamp1, periodChamp2, periodChamp3, periodCons1, periodCons2, periodCons3, periodTurnaroundInput]
  .forEach((el) => el.addEventListener("input", function () {
    boutsPerHourOverridden = false; // hand-editing a period field re-enables live derivation
    refreshDerivedBoutsPerHour();
  }));

wrestlingStyleSelect.addEventListener("change", updateStyleUnsupportedHint);
updateStyleUnsupportedHint();

levelSelect.addEventListener("change", applyLevelDefault);
applyLevelDefault();
renderMatScheduleRows();

// ============================================================
// Toggle 2-day fields
// ============================================================
function toggleDayFields() {
  const is2Day = numDaysSelect.value === "2";
  endTimeDay1Input.disabled = !is2Day;
  startTimeDay2Input.disabled = !is2Day;
  endTimeDay1Group.style.opacity = is2Day ? 1 : 0.5;
  startTimeDay2Group.style.opacity = is2Day ? 1 : 0.5;
}

numDaysSelect.addEventListener("change", toggleDayFields);
toggleDayFields();

// ============================================================
// Dynamic weight class inputs
// ============================================================
function buildWeightInputs() {
  const count = parseInt(numWeightsInput.value) || 0;
  const existing = weightInputsContainer.querySelectorAll(".weight-wrestler-input");
  const oldValues = [];
  existing.forEach((inp) => oldValues.push(inp.value));

  const existingLabels = weightInputsContainer.querySelectorAll(".weight-name-input");
  const oldLabels = [];
  existingLabels.forEach((inp) => oldLabels.push(inp.value));

  weightInputsContainer.innerHTML = "";

  for (let i = 0; i < count; i++) {
    const row = document.createElement("div");
    row.className = "weight-input-row";

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.className = "weight-name-input";
    nameInput.placeholder = "Weight";
    if (i < oldLabels.length && oldLabels[i]) {
      nameInput.value = oldLabels[i];
    }

    const input = document.createElement("input");
    input.type = "number";
    input.className = "weight-wrestler-input";
    input.min = "0";
    input.max = "64";
    input.placeholder = "#";
    input.dataset.index = i;
    if (i < oldValues.length && oldValues[i]) {
      input.value = oldValues[i];
    }
    input.addEventListener("input", updateTotalBouts);

    const boutSpan = document.createElement("span");
    boutSpan.className = "bout-count";
    boutSpan.id = `bout-count-${i}`;

    row.appendChild(nameInput);
    row.appendChild(input);
    row.appendChild(boutSpan);
    weightInputsContainer.appendChild(row);
  }

  updateTotalBouts();
}

function updateTotalBouts() {
  const placing = placingSelect.value;
  const inputs = weightInputsContainer.querySelectorAll(".weight-wrestler-input");
  let total = 0;

  inputs.forEach((inp, i) => {
    const wrestlers = parseInt(inp.value) || 0;
    const bouts = getBoutsFiltered(placing, wrestlers);
    total += bouts;
    const span = document.getElementById(`bout-count-${i}`);
    if (span) {
      span.textContent = wrestlers >= 2 ? `${bouts}b` : "";
    }
  });

  totalBoutsDisplay.textContent = total;
}

function buildRoundFilterCheckboxes() {
  const placing = placingSelect.value;
  const fmt = ROUND_DATA[placing];
  const container = document.getElementById("round-filter-checkboxes");
  if (!fmt || !container) return;

  container.innerHTML = "";

  for (const roundName of fmt.rounds) {
    const isExcluded = excludedRounds.has(roundName);
    const id = `round-cb-${roundName.replace(/[^a-zA-Z0-9]/g, "-")}`;

    const item = document.createElement("div");
    item.className = "round-filter-item" + (isExcluded ? " excluded" : "");

    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.id = id;
    cb.checked = !isExcluded;
    cb.dataset.round = roundName;

    const lbl = document.createElement("label");
    lbl.htmlFor = id;
    lbl.textContent = roundName;

    cb.addEventListener("change", function () {
      if (this.checked) {
        excludedRounds.delete(this.dataset.round);
      } else {
        excludedRounds.add(this.dataset.round);
      }
      item.classList.toggle("excluded", !this.checked);
      updateTotalBouts();
    });

    item.appendChild(cb);
    item.appendChild(lbl);
    container.appendChild(item);
  }
}

numWeightsInput.addEventListener("change", buildWeightInputs);
numWeightsInput.addEventListener("input", buildWeightInputs);
placingSelect.addEventListener("change", function () {
  buildRoundFilterCheckboxes();
  updateTotalBouts();
});

// Build initial weight inputs and round filter
buildWeightInputs();
buildRoundFilterCheckboxes();

document.getElementById("btn-rounds-all").addEventListener("click", function () {
  excludedRounds.clear();
  buildRoundFilterCheckboxes();
  updateTotalBouts();
});

document.getElementById("btn-rounds-none").addEventListener("click", function () {
  const fmt = ROUND_DATA[placingSelect.value];
  if (fmt) fmt.rounds.forEach((r) => excludedRounds.add(r));
  buildRoundFilterCheckboxes();
  updateTotalBouts();
});

// ============================================================
// Ticker Sync (localStorage + Firebase Realtime Database)
// ============================================================
let tickerState = {};

// Hoisted up from below (needed by Matside Live's resume-on-reload code,
// which runs at script top-level before buildHourlyBreakdown's block does).
let hourlyBlocks = [];
let hourlyTotalBouts = 0;
let hourlyTotalBoutsPerHour = 0;

function syncTicker(updates) {
  Object.assign(tickerState, updates);
  tickerState.updatedAt = Date.now();
  try {
    localStorage.setItem("wrestlingTicker", JSON.stringify(tickerState));
  } catch (e) { /* localStorage unavailable */ }
  try {
    firebase.database().ref("ticker").set(tickerState);
  } catch (e) { /* Firebase unavailable */ }
  // Mirror into the per-event scoped path too, when a live event is active
  // (set via "Go Live" -> Matside Live Phase A / PR #4's eventId scoping).
  // This is what boards.matside.org's flo+ticker composite page reads —
  // keeps two concurrent tournaments' tickers from stomping each other on
  // the single legacy `ticker` node above.
  if (typeof liveEvent !== "undefined" && liveEvent) {
    try {
      firebase.database().ref(`events/${liveEvent.eventId}/ticker`).set(tickerState);
    } catch (e) { /* Firebase unavailable */ }
  }
}

// ============================================================
// Matside Live — event creation, mirroring, Mat Status (Phase A)
// Spec: /opt/data/matside/matside-live-v2-spec.md §2-3
// ============================================================
let liveEvent = null; // { eventId, joinCode, matIds }
let matListeners = [];
let matStatusData = {}; // matId -> log object mirrored from RTDB

function loadLiveEventFromStorage() {
  try {
    const raw = localStorage.getItem("matsideLiveEvent");
    if (raw) liveEvent = JSON.parse(raw);
  } catch (e) { /* localStorage unavailable */ }
}

function saveLiveEventToStorage() {
  try {
    if (liveEvent) localStorage.setItem("matsideLiveEvent", JSON.stringify(liveEvent));
    else localStorage.removeItem("matsideLiveEvent");
  } catch (e) { /* localStorage unavailable */ }
}

function formatEpochClock(ms) {
  if (!ms) return "—";
  const d = new Date(ms);
  const h = d.getHours();
  const m = d.getMinutes();
  const period = h >= 12 ? "PM" : "AM";
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${displayH}:${String(m).padStart(2, "0")} ${period}`;
}

function renderLiveEventPanel() {
  const panel = document.getElementById("live-event-panel");
  if (!liveEvent) {
    panel.classList.add("hidden");
    panel.innerHTML = "";
    return;
  }
  panel.classList.remove("hidden");
  const parentUrl = `${location.origin}/live/?e=${liveEvent.eventId}`;
  panel.innerHTML = `
    <div class="live-event-card">
      <div class="live-event-field"><span class="hint">Event ID</span><code>${liveEvent.eventId}</code></div>
      <div class="live-event-field"><span class="hint">Logger join code</span><strong class="join-code">${liveEvent.joinCode}</strong></div>
      <div class="live-event-field"><span class="hint">Parent view</span><a href="${parentUrl}" target="_blank" rel="noopener">${parentUrl}</a></div>
      <button type="button" id="btn-end-live" class="btn-round-action">End live event</button>
    </div>
    <div id="live-sync-warning" class="mat-status-reconcile hidden"></div>
  `;
  document.getElementById("btn-end-live").addEventListener("click", endLiveEvent);
}

function showLiveSyncWarning(message) {
  const el = document.getElementById("live-sync-warning");
  if (!el) return;
  el.textContent = message;
  el.classList.remove("hidden");
}

async function pushLiveMetaSetup() {
  if (!liveEvent) return;
  const name = document.getElementById("tournament-name").value.trim();
  const mats = parseInt(document.getElementById("num-mats").value) || liveEvent.matIds.length;
  const meta = {
    name: name || "Untitled Tournament",
    date: liveEvent.eventId.slice(0, 10),
    mats: liveEvent.matIds,
    level: levelSelect.value,
    placing: placingSelect.value,
  };
  const setup = gatherSession();
  try {
    await firebase.database().ref(`events/${liveEvent.eventId}/meta`).set(meta);
    await firebase.database().ref(`events/${liveEvent.eventId}/setup`).set(setup);
  } catch (e) {
    // Best-effort mirror — local state (liveEvent, hourlyBlocks, etc.) stays authoritative.
    console.error("[Live] failed to write meta/setup (check RTDB rules):", e);
    showLiveSyncWarning("⚠ Can't reach Firebase RTDB right now — Mat Status will stay local-only until this is fixed. Check RTDB rules/config.");
  }
}

async function goLive() {
  const name = document.getElementById("tournament-name").value.trim();
  const mats = parseInt(document.getElementById("num-mats").value) || 1;
  const matIds = Array.from({ length: mats }, (_, i) => String(i + 1));

  liveEvent = {
    eventId: LiveModel.genEventId(name, new Date().toISOString().slice(0, 10)),
    joinCode: LiveModel.genJoinCode(),
    matIds,
  };
  saveLiveEventToStorage();
  renderLiveEventPanel();

  try {
    await firebase.database().ref(`joincodes/${liveEvent.joinCode}`).set(liveEvent.eventId);
  } catch (e) {
    console.error("[Live] failed to write join code (check RTDB rules):", e);
  }
  await pushLiveMetaSetup();

  document.getElementById("mat-status-section").classList.remove("hidden");
  startMatStatusListeners();
}

function endLiveEvent() {
  stopMatStatusListeners();
  liveEvent = null;
  saveLiveEventToStorage();
  renderLiveEventPanel();
  document.getElementById("mat-status-section").classList.add("hidden");
}

document.getElementById("btn-go-live").addEventListener("click", goLive);

function stopMatStatusListeners() {
  matListeners.forEach(({ ref, cb }) => ref.off("value", cb));
  matListeners = [];
  matStatusData = {};
}

function startMatStatusListeners() {
  if (!liveEvent) return;
  stopMatStatusListeners();
  liveEvent.matIds.forEach((matId) => { matStatusData[matId] = {}; });
  renderMatStatus(); // render immediately so mats show "no taps yet" even if RTDB is unreachable
  liveEvent.matIds.forEach((matId) => {
    const ref = firebase.database().ref(`events/${liveEvent.eventId}/mats/${matId}/log`);
    const cb = (snapshot) => {
      matStatusData[matId] = snapshot.val() || {};
      renderMatStatus();
    };
    const errCb = (err) => {
      console.error(`[Live] mat ${matId} log listener denied (check RTDB rules):`, err);
      showLiveSyncWarning("⚠ Can't reach Firebase RTDB right now — Mat Status will stay local-only until this is fixed. Check RTDB rules/config.");
    };
    ref.on("value", cb, errCb);
    matListeners.push({ ref, cb });
  });
}

// NOTE (Phase A simplification, flagged for Daniel): boutsRemaining is split
// evenly across mats, same assumption WT used before v2. The real upgrade here
// is per-mat PACE (median bout + turnaround), which is measured, not guessed.
// Per-mat remaining-bout count needs weight->mat assignment (Venue Splitter
// already has this data when used) to get more precise — candidate for Phase B.
function renderMatStatus() {
  const grid = document.getElementById("mat-status-grid");
  const reconcileEl = document.getElementById("mat-status-reconcile");
  if (!liveEvent || !grid) return;

  const totalBouts = hourlyTotalBouts || 0;
  let totalLogged = 0;
  liveEvent.matIds.forEach((m) => {
    totalLogged += Object.keys(matStatusData[m] || {}).length;
  });
  const totalRemaining = Math.max(0, totalBouts - totalLogged);
  const remainingPerMat = liveEvent.matIds.length ? totalRemaining / liveEvent.matIds.length : 0;
  const fallbackPerMatPerHour = liveEvent.matIds.length
    ? (hourlyTotalBoutsPerHour || 0) / liveEvent.matIds.length
    : 0;

  const derivedPace = {};
  const derivedEta = {};
  let html = "";

  liveEvent.matIds.forEach((matId) => {
    const log = matStatusData[matId] || {};
    const stats = LiveModel.computeMatStats(log);
    const eta = LiveModel.computeMatETA(stats, remainingPerMat, fallbackPerMatPerHour);
    derivedPace[matId] = stats;
    derivedEta[matId] = eta;

    const paceLabel = stats.medianBoutSec
      ? `${Math.round(stats.medianBoutSec)}s bout + ${Math.round(stats.medianTurnaroundSec || 0)}s turn`
      : "no taps yet";
    const sourceLabel = eta.source === "measured" ? "measured" : eta.source === "fallback" ? "guess" : "—";

    html += `
      <div class="mat-status-card">
        <div class="mat-status-card-header">Mat ${matId}</div>
        <div class="mat-status-row"><span class="hint">Bouts logged</span><strong>${stats.boutsLogged}</strong></div>
        <div class="mat-status-row"><span class="hint">Pace</span><span>${paceLabel}</span></div>
        <div class="mat-status-row"><span class="hint">ETA (${sourceLabel})</span><strong>${formatEpochClock(eta.estFinishEpoch)}</strong></div>
      </div>
    `;
  });
  grid.innerHTML = html;

  const floTotal = typeof floArena !== "undefined" && floArena.active ? floArena.totalCompleted : null;
  const reconcile = LiveModel.reconcileFloVsLogger(floTotal, matStatusData);
  if (reconcile && reconcileEl) {
    reconcileEl.classList.toggle("hidden", !reconcile.warn);
    reconcileEl.textContent = reconcile.warn
      ? `⚠ Flo reports ${reconcile.floTotalCompleted} completed vs. ${reconcile.loggerTotal} logged on mats — check for missed taps (diff ${reconcile.diff}).`
      : "";
  } else if (reconcileEl) {
    reconcileEl.classList.add("hidden");
  }

  try {
    firebase.database().ref(`events/${liveEvent.eventId}/derived/pace`).set(derivedPace);
    firebase.database().ref(`events/${liveEvent.eventId}/derived/eta`).set(derivedEta);
  } catch (e) {
    console.error("[Live] failed to write derived/ (check RTDB rules):", e);
  }
}

// (Resume-on-reload code moved to end of file — see bottom — so it runs
// after every other top-level declaration, e.g. `floArena`, is initialized.)

/**
 * Measured bouts/hr across ALL mats combined, from hourly actuals —
 * the single source of truth both the ticker (syncTickerFromHourly)
 * and the hourly table's re-estimation (renderHourlyTable) now share,
 * so they can no longer silently disagree about the live pace (see
 * spec/bug-hunt 2026-10-27: the two used to compute this independently
 * and drift apart once actuals came in).
 * @returns {number|null} bouts/hr, or null if no actuals exist yet
 */
function computeMeasuredBoutsPerHour() {
  let completedBouts = 0;
  let actualMinutes = 0;
  let hasActuals = false;

  for (const block of hourlyBlocks) {
    if (block.actual !== null) {
      hasActuals = true;
      completedBouts += block.actual;
      actualMinutes += block.blockFraction * 60;
    }
  }

  if (!hasActuals || actualMinutes <= 0) return null;
  return Math.round((completedBouts / (actualMinutes / 60)) * 10) / 10;
}

function syncTickerFromHourly() {
  // Compute completed bouts and actual run rate from hourly actuals
  let completedBouts = 0;
  let hasActuals = false;

  for (const block of hourlyBlocks) {
    if (block.actual !== null) {
      hasActuals = true;
      completedBouts += block.actual;
    }
  }

  const remaining = Math.max(0, hourlyTotalBouts - completedBouts);
  const actualRate = computeMeasuredBoutsPerHour();

  // Estimate finish using actual rate if available, else configured rate
  const effectiveRate = actualRate || hourlyTotalBoutsPerHour;
  const remainingHours = remaining / effectiveRate;
  const now = new Date();
  const finishMs = now.getTime() + remainingHours * 60 * 60 * 1000;
  const finishDate = new Date(finishMs);
  const finishH = finishDate.getHours();
  const finishM = finishDate.getMinutes();
  const period = finishH >= 12 ? "PM" : "AM";
  const displayH = finishH % 12 === 0 ? 12 : finishH % 12;
  const liveFinish = `${displayH}:${finishM.toString().padStart(2, "0")} ${period}`;

  syncTicker({
    completedBouts,
    remaining,
    actualRate,
    liveFinish: hasActuals ? liveFinish : null,
  });
}

// ============================================================
// Calculate
// ============================================================
form.addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("tournament-name").value.trim();
  const numDays = parseInt(numDaysSelect.value);
  const startDay1 = document.getElementById("start-time-day1").value;
  const endDay1 = document.getElementById("end-time-day1").value;
  const startDay2 = document.getElementById("start-time-day2").value;
  const mats = parseInt(document.getElementById("num-mats").value);
  const boutsPerHourPerMat = parseFloat(boutsPerHourInput.value);
  const placing = placingSelect.value;

  // Gather weight class data
  const inputs = weightInputsContainer.querySelectorAll(".weight-wrestler-input");
  const nameInputs = weightInputsContainer.querySelectorAll(".weight-name-input");
  const weightData = [];
  let totalBouts = 0;

  inputs.forEach((inp, i) => {
    const wrestlers = parseInt(inp.value) || 0;
    const bouts = getBoutsFiltered(placing, wrestlers);
    const weightName = nameInputs[i]?.value.trim() || `Weight ${i + 1}`;
    totalBouts += bouts;
    weightData.push({ name: weightName, wrestlers, bouts });
  });

  // Store for splitter to use
  lastWeightData = weightData;
  lastBoutsPerHourPerMat = boutsPerHourPerMat;
  lastStartDay1 = startDay1;
  lastPlacing = placing;
  lastNumDays = numDays;
  lastEndDay1 = endDay1;
  lastStartDay2 = startDay2;

  // Show splitter section
  document.getElementById("splitter-section").classList.remove("hidden");
  const splitterDayGroup = document.getElementById("splitter-day-group");
  const splitterDaySelect = document.getElementById("splitter-day");
  if (numDays === 1) {
    splitterDayGroup.classList.add("hidden");
    splitterDaySelect.value = "1";
  } else {
    splitterDayGroup.classList.remove("hidden");
  }

  // Total bouts per hour across all mats
  const totalBoutsPerHour = boutsPerHourPerMat * mats;

  // Total wrestling hours needed
  const totalHours = totalBouts / totalBoutsPerHour;
  const totalMinutes = totalHours * 60;

  // Results section
  const resultsEl = document.getElementById("results");
  resultsEl.classList.remove("hidden");

  // Tournament label
  const labelEl = document.getElementById("tournament-label");
  const placingLabel = placing === "top8" ? "Top 8" : placing === "top6" ? "Top 6" : "Top 4";
  labelEl.textContent = name
    ? `${name} — ${placingLabel} placing`
    : `${placingLabel} placing`;

  // Total bouts
  document.getElementById("result-total-bouts").textContent = totalBouts;

  // Total time
  document.getElementById("result-total-time").textContent = formatDuration(totalMinutes);

  // Weight class breakdown table
  const weightBreakdown = document.getElementById("weight-breakdown");
  let tableRows = weightData
    .filter((w) => w.wrestlers >= 2)
    .map(
      (w) =>
        `<tr><td>${w.name}</td><td class="num">${w.wrestlers}</td><td class="num">${w.bouts}</td></tr>`
    )
    .join("");

  weightBreakdown.innerHTML = `
    <table>
      <thead>
        <tr><th>Weight Class</th><th class="num">Wrestlers</th><th class="num">Bouts</th></tr>
      </thead>
      <tbody>
        ${tableRows}
        <tr class="total-row"><td>Total</td><td class="num">${weightData.reduce((s, w) => s + w.wrestlers, 0)}</td><td class="num">${totalBouts}</td></tr>
      </tbody>
    </table>
  `;

  const dayBreakdown = document.getElementById("day-breakdown");
  const summaryEl = document.getElementById("summary-text");

  // Per Daniel (2026-10-28): the headline "Estimated Finish" card and the
  // Hourly Breakdown table were silently disagreeing. Root cause: this
  // block used its own simplified flat-rate day-split math (just dividing
  // totalBouts/totalBoutsPerHour and clamping at Day 1's end time) while
  // buildHourlyBreakdown had its OWN separate, correct, mat-schedule-aware
  // day-split logic — two independent calculations of "when does this
  // finish" that could drift apart whenever mats changed mid-event or a
  // round didn't divide evenly into clock hours. Fixed by routing this
  // card through the exact same scheduleChunksAcrossDays() engine the
  // Hourly Breakdown and Round Schedule now both use — one calculation,
  // three displays, cannot disagree again.
  const days = buildDaySegments(numDays, startDay1, endDay1, startDay2);
  const headlineSegments = scheduleChunksAcrossDays(days, [{ label: "All bouts", bouts: totalBouts }], matSchedule, boutsPerHourPerMat);
  const lastSegment = headlineSegments[headlineSegments.length - 1];
  const finalEndMin = lastSegment.endMin;
  const finishedOnDay2 = numDays === 2 && lastSegment.day === 2;

  if (numDays === 1) {
    const startMin = timeToMinutes(startDay1);

    document.getElementById("result-end-time").textContent = minutesToTime(finalEndMin);

    dayBreakdown.classList.add("hidden");

    summaryEl.innerHTML =
      `<strong>${totalBouts} bouts</strong> across <strong>${mats} mat${mats > 1 ? "s" : ""}</strong> ` +
      `at <strong>${boutsPerHourPerMat} bouts/hr/mat</strong> = ` +
      `<strong>${totalBoutsPerHour} bouts/hr</strong> total.<br>` +
      `Starting at <strong>${minutesToTime(startMin)}</strong>, ` +
      `estimated finish around <strong>${minutesToTime(finalEndMin)}</strong>.`;
  } else {
    const startDay1Min = timeToMinutes(startDay1);
    const endDay1Min = timeToMinutes(endDay1);
    const startDay2Min = timeToMinutes(startDay2);

    const day1ActualBouts = headlineSegments
      .filter((s) => s.day === 1)
      .reduce((sum, s) => sum + s.boutsThisSegment, 0);
    const day2Bouts = totalBouts - day1ActualBouts;

    document.getElementById("result-end-time").textContent =
      finishedOnDay2 ? minutesToTime(finalEndMin) + " (Day 2)" : minutesToTime(finalEndMin) + " (Day 1)";

    dayBreakdown.classList.remove("hidden");
    dayBreakdown.innerHTML = `
      <table>
        <thead>
          <tr><th></th><th>Bouts</th><th>Start</th><th>End</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Day 1</strong></td>
            <td>${day1ActualBouts}</td>
            <td>${minutesToTime(startDay1Min)}</td>
            <td>${finishedOnDay2 ? minutesToTime(endDay1Min) : minutesToTime(finalEndMin)}</td>
          </tr>
          <tr>
            <td><strong>Day 2</strong></td>
            <td>${day2Bouts}</td>
            <td>${minutesToTime(startDay2Min)}</td>
            <td>${finishedOnDay2 ? minutesToTime(finalEndMin) : "—"}</td>
          </tr>
        </tbody>
      </table>
    `;

    summaryEl.innerHTML = finishedOnDay2
      ? (`<strong>${totalBouts} bouts</strong> across <strong>${mats} mat${mats > 1 ? "s" : ""}</strong> ` +
         `at <strong>${boutsPerHourPerMat} bouts/hr/mat</strong>.<br>` +
         `Day 1: ~<strong>${day1ActualBouts} bouts</strong> (${minutesToTime(startDay1Min)} – ${minutesToTime(endDay1Min)}).<br>` +
         `Day 2: ~<strong>${day2Bouts} bouts</strong> remaining, ` +
         `finishing around <strong>${minutesToTime(finalEndMin)}</strong>.`)
      : (`<strong>${totalBouts} bouts</strong> across <strong>${mats} mat${mats > 1 ? "s" : ""}</strong> ` +
         `at <strong>${boutsPerHourPerMat} bouts/hr/mat</strong>.<br>` +
         `All bouts fit in Day 1 — estimated finish around <strong>${minutesToTime(finalEndMin)}</strong>. ` +
         `Day 2 is not needed for this tournament size.`);
  }

  // ============================================================
  // Hourly breakdown
  // ============================================================
  buildHourlyBreakdown(totalBouts, mats, boutsPerHourPerMat, numDays, startDay1, endDay1, startDay2);

  // Round schedule
  buildRoundSchedule(weightData, placing, mats, boutsPerHourPerMat, numDays, startDay1, endDay1, startDay2);

  // Round map
  buildRoundMap(weightData, placing);

  // Sync ticker
  syncTicker({
    tournamentName: name,
    totalBouts,
    mats,
    boutsPerHourPerMat,
    totalBoutsPerHour,
    configuredRate: totalBoutsPerHour,
    estimatedFinish: document.getElementById("result-end-time").textContent,
    completedBouts: 0,
    remaining: totalBouts,
    actualRate: null,
    liveFinish: null,
  });

  resultsEl.scrollIntoView({ behavior: "smooth", block: "start" });

  // Matside Live: keep the mirrored event in sync with whatever was just calculated.
  if (liveEvent) {
    pushLiveMetaSetup();
    renderMatStatus();
  }
});

// hourlyBlocks/hourlyTotalBouts/hourlyTotalBoutsPerHour declared earlier
// (near tickerState) so Matside Live's top-level resume code can see them.

function buildHourlyBreakdown(totalBouts, mats, boutsPerHourPerMat, numDays, startDay1, endDay1, startDay2) {
  const section = document.getElementById("hourly-section");
  const container = document.getElementById("hourly-table-container");
  const label = document.getElementById("hourly-label");

  if (totalBouts === 0) {
    section.classList.add("hidden");
    return;
  }

  section.classList.remove("hidden");
  document.getElementById("floarena-section").classList.remove("hidden");

  // totalBoutsPerHour is now mat-schedule-aware: each block looks up
  // how many mats are active AT THAT BLOCK'S TIME via matsAtTime(), so
  // a tournament that drops from 8 mats to 4 mid-event gets correct
  // per-block pace instead of one constant rate for the whole event.
  // hourlyTotalBoutsPerHour (used by the ticker/live re-estimation)
  // reflects the CURRENT segment's rate, recomputed each render.
  hourlyTotalBouts = totalBouts;
  hourlyTotalBoutsPerHour = boutsPerHourPerMat * matsAtTime(matSchedule, 1, timeToMinutes(startDay1));

  // Build time blocks for each day
  const days = [];

  if (numDays === 1) {
    days.push({ day: 1, label: null, startMin: timeToMinutes(startDay1), endMin: null });
  } else {
    days.push({ day: 1, label: "Day 1", startMin: timeToMinutes(startDay1), endMin: timeToMinutes(endDay1) });
    days.push({ day: 2, label: "Day 2", startMin: timeToMinutes(startDay2), endMin: null });
  }

  // Generate block definitions
  hourlyBlocks = [];
  let remaining = totalBouts;

  for (let d = 0; d < days.length; d++) {
    const day = days[d];
    const startMin = day.startMin;
    const firstHourEnd = Math.ceil(startMin / 60) * 60;

    let blockStart = startMin;
    let blockEnd = firstHourEnd === startMin ? startMin + 60 : firstHourEnd;

    while (remaining > 0) {
      if (day.endMin !== null && blockStart >= day.endMin) break;

      let effectiveBlockEnd = blockEnd;
      if (day.endMin !== null && blockEnd > day.endMin) {
        effectiveBlockEnd = day.endMin;
      }

      const blockMinutes = effectiveBlockEnd - blockStart;
      const blockFraction = blockMinutes / 60;
      // boutCapacityForInterval correctly integrates across a mid-block
      // mat-schedule transition (e.g. 8→4 mats at 9:30 inside a
      // 9:00–10:00 block) instead of sampling the mat count once at
      // block start, which would silently over- or under-credit the
      // block depending on which side of the transition it sampled.
      const capacity = boutCapacityForInterval(matSchedule, day.day, blockStart, effectiveBlockEnd, boutsPerHourPerMat);
      const matsThisBlock = matsAtTime(matSchedule, day.day, blockStart); // display only
      const matsAtBlockEnd = matsAtTime(matSchedule, day.day, effectiveBlockEnd - 1);
      const blockBoutsPerHour = blockFraction > 0 ? capacity / blockFraction : 0;
      const estimated = Math.min(remaining, Math.round(capacity));

      remaining -= estimated;

      hourlyBlocks.push({
        day: day.day,
        dayLabel: (numDays === 2 && blockStart === day.startMin) ? day.label : null,
        timeLabel: `${minutesToTime(blockStart)} – ${minutesToTime(effectiveBlockEnd)}`,
        blockFraction,
        mats: matsThisBlock,
        matsChangedMidBlock: matsThisBlock !== matsAtBlockEnd,
        boutsPerHour: blockBoutsPerHour,
        estimated,
        actual: null,
      });

      blockStart = effectiveBlockEnd;
      blockEnd = blockStart + 60;
    }
  }

  const matsSummary = matSchedule.length > 1
    ? `${mats} mats (schedule changes mid-event — see table)`
    : `${mats} mat${mats > 1 ? "s" : ""}`;
  label.textContent = `${matsSummary} at ${boutsPerHourPerMat} bouts/hr/mat`;

  renderHourlyTable();
}

function renderHourlyTable() {
  const container = document.getElementById("hourly-table-container");

  // Recalculate cumulative/remaining using actuals where available
  let remaining = hourlyTotalBouts;
  let cumulative = 0;

  // First pass: figure out where actuals end and recalculate estimates from there
  const rows = [];
  let lastActualIndex = -1;

  for (let i = 0; i < hourlyBlocks.length; i++) {
    if (hourlyBlocks[i].actual !== null) lastActualIndex = i;
  }

  // Calculate cumulative through actuals
  for (let i = 0; i <= lastActualIndex; i++) {
    const block = hourlyBlocks[i];
    const bouts = block.actual !== null ? block.actual : block.estimated;
    cumulative += bouts;
    remaining = hourlyTotalBouts - cumulative;
    rows.push({ ...block, bouts, cumulative, remaining, isActual: block.actual !== null });
  }

  // Re-estimate remaining blocks based on what's left. Two things this
  // fixes vs. the old code:
  // 1. Mat-schedule-aware: each block uses its OWN boutsPerHour (set in
  //    buildHourlyBreakdown via matsAtTime()), not one flat constant —
  //    so a mid-event mat count drop is reflected in future blocks.
  // 2. Rate-aware: once actuals exist, re-estimate future blocks using
  //    the MEASURED actual rate (same computation as syncTickerFromHourly)
  //    rather than the original configured rate. Before this fix the
  //    hourly table's "Remaining" column and the ticker's "Live Finish"
  //    silently disagreed — the ticker measured real pace while this
  //    table kept projecting at the pre-event guess. Falls back to each
  //    block's own configured rate when there are no actuals yet.
  const measuredRatePerHour = computeMeasuredBoutsPerHour();
  let reRemaining = remaining;
  for (let i = lastActualIndex + 1; i < hourlyBlocks.length; i++) {
    const block = hourlyBlocks[i];
    const effectiveRate = measuredRatePerHour ?? block.boutsPerHour;
    const estimated = Math.min(reRemaining, Math.round(effectiveRate * block.blockFraction));
    reRemaining -= estimated;
    cumulative += estimated;

    rows.push({
      ...block,
      bouts: estimated,
      cumulative,
      remaining: reRemaining,
      isActual: false,
    });

    if (reRemaining <= 0) break;
  }

  // Build HTML
  let html = "";
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    if (row.dayLabel) {
      html += `<tr><td colspan="5" style="font-weight:700; background:#f3f4f6; padding:0.6rem 0.75rem;">${row.dayLabel}</td></tr>`;
    }

    const isLast = row.remaining <= 0;
    const rowClass = isLast ? "final-row" : "";
    const actualVal = hourlyBlocks[i].actual !== null ? hourlyBlocks[i].actual : "";
    // Flag blocks where a mat-schedule change happened mid-hour (see
    // boutCapacityForInterval) — the Estimated figure is still correct,
    // this just tells Daniel why it isn't a clean mats×rate number.
    const matChangeNote = row.matsChangedMidBlock
      ? ` <span title="Mat count changed during this block" style="opacity:0.65; font-size:0.78em;">⚠ mat change</span>`
      : "";

    html += `<tr class="${rowClass}">
      <td>${row.timeLabel}${matChangeNote}</td>
      <td class="num">${row.bouts}</td>
      <td class="num actual-cell"><input type="number" class="actual-input" data-block="${i}" min="0" value="${actualVal}" placeholder="—"></td>
      <td class="num">${row.cumulative}</td>
      <td class="num">${Math.max(0, row.remaining)}</td>
    </tr>`;
  }

  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Time Block</th>
          <th class="num">Estimated</th>
          <th class="num">Actual</th>
          <th class="num">Cumulative</th>
          <th class="num">Remaining</th>
        </tr>
      </thead>
      <tbody>
        ${html}
      </tbody>
    </table>
  `;

  // Attach listeners to actual inputs
  container.querySelectorAll(".actual-input").forEach((inp) => {
    inp.addEventListener("input", function () {
      const idx = parseInt(this.dataset.block);
      const val = this.value.trim();
      hourlyBlocks[idx].actual = val === "" ? null : parseInt(val) || 0;
      renderHourlyTable();
      syncTickerFromHourly();
      // Re-focus and set cursor position on the input that was just edited
      const refocused = container.querySelector(`.actual-input[data-block="${idx}"]`);
      if (refocused) {
        refocused.focus();
        refocused.setSelectionRange(refocused.value.length, refocused.value.length);
      }
    });
  });
}

// ============================================================
// Venue Splitter
// ============================================================
const numLocationsSelect = document.getElementById("num-locations");
const locationInputsContainer = document.getElementById("location-inputs");
const btnSplit = document.getElementById("btn-split");

// Store last calculated weight data for the splitter to use
let lastWeightData = [];
let lastBoutsPerHourPerMat = 10;
let lastStartDay1 = "09:00";
let lastPlacing = "top8";
let lastNumDays = 1;
let lastEndDay1 = "18:00";
let lastStartDay2 = "09:00";

function buildLocationInputs() {
  const count = parseInt(numLocationsSelect.value);
  const existing = locationInputsContainer.querySelectorAll(".location-row");
  const oldNames = [];
  const oldMats = [];
  existing.forEach((row) => {
    oldNames.push(row.querySelector(".loc-name")?.value || "");
    oldMats.push(row.querySelector(".loc-mats")?.value || "");
  });

  locationInputsContainer.innerHTML = "";
  const defaultNames = ["Gym A", "Gym B", "Gym C", "Gym D"];

  for (let i = 0; i < count; i++) {
    const row = document.createElement("div");
    row.className = "location-row";

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.className = "loc-name";
    nameInput.placeholder = defaultNames[i] || `Location ${i + 1}`;
    if (i < oldNames.length && oldNames[i]) {
      nameInput.value = oldNames[i];
    }

    const matsLabel = document.createElement("label");
    matsLabel.textContent = "Mats:";

    const matsInput = document.createElement("input");
    matsInput.type = "number";
    matsInput.className = "loc-mats";
    matsInput.min = "1";
    matsInput.max = "20";
    matsInput.value = i < oldMats.length && oldMats[i] ? oldMats[i] : "2";

    row.appendChild(nameInput);
    row.appendChild(matsLabel);
    row.appendChild(matsInput);
    locationInputsContainer.appendChild(row);
  }
}

numLocationsSelect.addEventListener("change", buildLocationInputs);
buildLocationInputs();

// Persistent assignment: weightIndex → locationIndex
let splitterAssignments = {};
let splitterLocations = [];
let lastSplitterDayWeights = []; // day-filtered {name,wrestlers,bouts,origIndex}[], set by btnSplit's handler
let lastSplitterTargetDay = 1;

function targetDayStartTime() {
  return lastSplitterTargetDay === 2 ? lastStartDay2 : lastStartDay1;
}

/**
 * For a given day (1 or 2), compute each weight class's bout count for
 * JUST that day. A round's TOTAL bout count across all weight classes is
 * one chronological chunk in the schedule (see buildRoundSchedule) — if
 * that chunk straddles the day boundary, we don't know exactly WHICH
 * weight classes' individual bouts happened before vs after midnight, so
 * each weight class's contribution to that round is apportioned using
 * the SAME day-fraction the round as a whole split at (e.g. if Round of
 * 16 was 75% Day 1 / 25% Day 2 overall, every weight class's Round of 16
 * bouts are split 75/25 too). This is an approximation where a round
 * crosses days, and exact where it doesn't (the common case).
 * @param {{name:string,wrestlers:number,bouts:number}[]} weightData
 * @param {string} placing
 * @param {number} numDays
 * @param {string} startDay1
 * @param {string} endDay1
 * @param {string} startDay2
 * @param {Array} matSchedule
 * @param {number} boutsPerHourPerMat
 * @param {Set<string>} excludedRoundsSet
 * @param {1|2} targetDay
 * @returns {{name:string, wrestlers:number, bouts:number}[]} same shape/order as weightData, bouts = this day's share
 */
function weightBoutsForDay(weightData, placing, numDays, startDay1, endDay1, startDay2, matSchedule, boutsPerHourPerMat, excludedRoundsSet, targetDay) {
  if (numDays === 1 || targetDay == null) {
    return weightData.map((w) => ({ name: w.name, wrestlers: w.wrestlers, bouts: w.bouts }));
  }

  const fmt = ROUND_DATA[placing];
  if (!fmt) return weightData.map((w) => ({ name: w.name, wrestlers: w.wrestlers, bouts: 0 }));

  const validWeights = weightData.filter((w) => w.wrestlers >= 6 && w.wrestlers <= 64);
  const rounds = fmt.rounds;
  const roundTotals = rounds.map((_, r) => {
    let total = 0;
    for (const w of validWeights) {
      const roundBouts = fmt.data[w.wrestlers];
      if (roundBouts) total += roundBouts[r];
    }
    return total;
  });
  const activeRoundNames = [];
  const activeRoundBouts = [];
  for (let r = 0; r < rounds.length; r++) {
    if (roundTotals[r] > 0 && !excludedRoundsSet.has(rounds[r])) {
      activeRoundNames.push(rounds[r]);
      activeRoundBouts.push(roundTotals[r]);
    }
  }

  const days = buildDaySegments(numDays, startDay1, endDay1, startDay2);
  const chunks = activeRoundNames.map((name, i) => ({ label: name, bouts: activeRoundBouts[i] }));
  const segments = scheduleChunksAcrossDays(days, chunks, matSchedule, boutsPerHourPerMat);
  const byDay = chunkBoutsByDay(segments);

  // dayFraction[roundIndex] = fraction of that round's total bouts that
  // fall on targetDay (1 if the round doesn't cross days, else the
  // proportional split computed above).
  const dayFraction = activeRoundNames.map((name, i) => {
    const entry = byDay.get(name) || {};
    const onTargetDay = entry[targetDay] || 0;
    const total = activeRoundBouts[i];
    return total > 0 ? onTargetDay / total : 0;
  });

  return weightData.map((w) => {
    if (w.wrestlers < 6 || w.wrestlers > 64) return { name: w.name, wrestlers: w.wrestlers, bouts: 0 };
    const roundBouts = fmt.data[w.wrestlers];
    if (!roundBouts) return { name: w.name, wrestlers: w.wrestlers, bouts: 0 };
    let total = 0;
    for (let i = 0; i < activeRoundNames.length; i++) {
      const roundIndex = rounds.indexOf(activeRoundNames[i]);
      total += (roundBouts[roundIndex] || 0) * dayFraction[i];
    }
    return { name: w.name, wrestlers: w.wrestlers, bouts: Math.round(total) };
  });
}

btnSplit.addEventListener("click", function () {
  if (lastWeightData.length === 0) {
    alert("Please fill in the weight classes above and click Calculate first.");
    return;
  }

  readLocations();

  const splitterDaySelect = document.getElementById("splitter-day");
  const targetDay = lastNumDays === 2 ? parseInt(splitterDaySelect.value) : 1;
  lastSplitterTargetDay = targetDay;

  // Day-filtered bout counts (per Daniel: splitting needs to look at
  // ONE day's bouts at a time, not the whole tournament).
  const dayFilteredWeights = weightBoutsForDay(
    lastWeightData, lastPlacing, lastNumDays, lastStartDay1, lastEndDay1, lastStartDay2,
    matSchedule, lastBoutsPerHourPerMat, excludedRounds, targetDay
  );

  // Keep natural weight-class ORDER (ascending, as entered) and original
  // indices, filtering to weights that have bouts on this day.
  const weights = dayFilteredWeights
    .map((w, i) => ({ ...w, origIndex: i }))
    .filter((w) => w.bouts > 0);

  if (weights.length === 0) {
    splitterAssignments = {};
    lastSplitterDayWeights = [];
    renderSplitterResults();
    return;
  }

  // Per Daniel (2026-10-28): the old algorithm scattered weight classes
  // (e.g. 2/4/6/8 at one gym, 1/3/5/7 at another) because it greedily
  // load-balanced one weight class at a time with no regard for keeping
  // runs contiguous — hard to run in practice and confusing to announce
  // to parents. splitContiguousWeightRanges() instead only considers
  // splits into CONTIGUOUS, ordered weight-class ranges (e.g. 1–6 at
  // Gym A, 7–10 at Gym B), choosing the cut points AND which location
  // gets which range to balance finish time (capacity-aware — a gym
  // with more mats can and should get a bigger contiguous range).
  const locationBoutsPerHour = splitterLocations.map((l) => l.boutsPerHour);
  const splitResult = splitContiguousWeightRanges(weights, locationBoutsPerHour);

  splitterAssignments = {};
  lastSplitterDayWeights = weights;
  if (splitResult) {
    weights.forEach((w, i) => {
      splitterAssignments[w.origIndex] = splitResult.assignments[i];
    });
  }

  renderSplitterResults();
});

function readLocations() {
  const locRows = locationInputsContainer.querySelectorAll(".location-row");
  splitterLocations = [];
  locRows.forEach((row, i) => {
    const defaultNames = ["Gym A", "Gym B", "Gym C", "Gym D"];
    const name = row.querySelector(".loc-name").value.trim() || defaultNames[i] || `Location ${i + 1}`;
    const mats = parseInt(row.querySelector(".loc-mats").value) || 1;
    splitterLocations.push({ name, mats, boutsPerHour: mats * lastBoutsPerHourPerMat });
  });
}

function renderSplitterResults() {
  const resultsDiv = document.getElementById("splitter-results");
  resultsDiv.classList.remove("hidden");

  const startMin = timeToMinutes(targetDayStartTime());

  // Build location groups from assignments
  const groups = splitterLocations.map((loc) => ({
    ...loc,
    weights: [],
    totalBouts: 0,
    totalWrestlers: 0,
  }));

  for (const [wIdx, locIdx] of Object.entries(splitterAssignments)) {
    const w = lastSplitterDayWeights.find((dw) => dw.origIndex === parseInt(wIdx));
    if (w && w.bouts > 0) {
      groups[locIdx].weights.push({ ...w, origIndex: parseInt(wIdx) });
      groups[locIdx].totalBouts += w.bouts;
      groups[locIdx].totalWrestlers += w.wrestlers;
    }
  }

  // Build location name options for dropdowns
  const locOptions = splitterLocations.map((l, i) => `<option value="${i}">${l.name}</option>`).join("");

  let cardsHtml = "";
  for (let g = 0; g < groups.length; g++) {
    const group = groups[g];
    const hours = group.totalBouts / group.boutsPerHour;
    const finishMin = startMin + hours * 60;

    // Sort weights by name
    group.weights.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

    const weightRangeLabel = group.weights.length > 0
      ? (group.weights.length === 1
          ? group.weights[0].name
          : `${group.weights[0].name}–${group.weights[group.weights.length - 1].name}`)
      : "no weights";

    let weightRows = group.weights
      .map((w) => {
        // Build select with current location pre-selected
        const opts = splitterLocations
          .map((l, i) => `<option value="${i}"${i === g ? " selected" : ""}>${l.name}</option>`)
          .join("");
        return `<tr>
          <td>${w.name}</td>
          <td class="num">${w.wrestlers}</td>
          <td class="num">${w.bouts}</td>
          <td><select class="venue-assign" data-weight="${w.origIndex}">${opts}</select></td>
        </tr>`;
      })
      .join("");

    cardsHtml += `
      <div class="venue-card">
        <div class="venue-card-header">
          <span>${group.name} (${group.mats} mat${group.mats > 1 ? "s" : ""}) — ${weightRangeLabel}</span>
          <span class="venue-time">Finish ~${minutesToTime(finishMin)}</span>
        </div>
        <div class="venue-card-body">
          <table>
            <thead>
              <tr><th>Weight</th><th class="num">Wrestlers</th><th class="num">Bouts</th><th>Venue</th></tr>
            </thead>
            <tbody>
              ${weightRows}
              <tr class="venue-total">
                <td>Total</td>
                <td class="num">${group.totalWrestlers}</td>
                <td class="num">${group.totalBouts}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  const times = groups.map((g) => g.totalBouts / g.boutsPerHour);
  const maxTime = Math.max(...times);
  const minTime = Math.min(...times);
  const diffMin = Math.round((maxTime - minTime) * 60);

  resultsDiv.innerHTML = `
    <div class="splitter-summary-grid" style="grid-template-columns: repeat(${groups.length}, 1fr);">
      ${cardsHtml}
    </div>
    <div class="summary">
      ${lastNumDays === 2 ? `<strong>Day ${lastSplitterTargetDay}</strong> bouts only.<br>` : ""}
      Estimated spread: <strong>${diffMin} minutes</strong> between earliest and latest venue finish.
    </div>
  `;

  // Attach change listeners to all venue dropdowns
  resultsDiv.querySelectorAll(".venue-assign").forEach((sel) => {
    sel.addEventListener("change", function () {
      const wIdx = parseInt(this.dataset.weight);
      const newLocIdx = parseInt(this.value);
      splitterAssignments[wIdx] = newLocIdx;
      renderSplitterResults();
    });
  });
}

// ============================================================
// Round Schedule
// ============================================================
function buildRoundSchedule(weightData, placing, mats, boutsPerHourPerMat, numDays, startDay1, endDay1, startDay2) {
  const section = document.getElementById("round-schedule-section");
  const container = document.getElementById("round-schedule-container");
  const label = document.getElementById("round-schedule-label");
  const fmt = ROUND_DATA[placing];

  // Only include weights that are in the ROUND_DATA range (6–64)
  const validWeights = weightData.filter((w) => w.wrestlers >= 6 && w.wrestlers <= 64);

  if (validWeights.length === 0 || !fmt) {
    section.classList.add("hidden");
    return;
  }

  section.classList.remove("hidden");

  const rounds = fmt.rounds;
  const matsForLabel = matsAtTime(matSchedule, 1, timeToMinutes(startDay1));
  const totalBoutsPerHour = boutsPerHourPerMat * matsForLabel;

  // Sum bouts across all weights for each round
  const roundTotals = rounds.map((_, r) => {
    let total = 0;
    for (const w of validWeights) {
      const roundBouts = fmt.data[w.wrestlers];
      if (roundBouts) total += roundBouts[r];
    }
    return total;
  });

  // Filter to rounds that have bouts and are not excluded
  const activeRounds = [];
  for (let r = 0; r < rounds.length; r++) {
    if (roundTotals[r] > 0 && !excludedRounds.has(rounds[r])) {
      activeRounds.push({ index: r, name: rounds[r], bouts: roundTotals[r] });
    }
  }

  if (activeRounds.length === 0) {
    section.classList.add("hidden");
    return;
  }

  const matsSummary = matSchedule.length > 1
    ? `${mats} mats (schedule changes mid-event — see Mat Status column)`
    : `${mats} mat${mats > 1 ? "s" : ""}`;
  label.textContent = numDays === 2
    ? `${matsSummary} at ${boutsPerHourPerMat} bouts/hr/mat — spans ${numDays} days`
    : `${matsSummary} at ${boutsPerHourPerMat} bouts/hr/mat`;

  // Per Daniel (2026-10-28): "It doesn't take into consideration the
  // number of days or anything like that... I need this to be clear,
  // work for the number of days that we are using, and then the start
  // and stop times that are listed for the days we are using." Fixed by
  // routing every round through scheduleChunksAcrossDays() — the SAME
  // day-aware, mat-schedule-aware engine the headline Estimate and
  // Hourly Breakdown use — instead of just running rounds back-to-back
  // from Day 1's start time forever with no day-boundary awareness.
  // A round that would run past the configured end time for the day
  // (e.g. past Day 1's end time) now splits: the part that fits stays
  // on that day, the remainder resumes at the next day's start time,
  // with an explicit "— Day 2 begins —" marker row so Daniel's "what
  // round are we wrestling through tonight / when will we finish"
  // questions have one clear, correct answer to point to.
  const days = buildDaySegments(numDays, startDay1, endDay1, startDay2);
  const chunks = activeRounds.map((r) => ({ label: r.name, bouts: r.bouts }));
  const segments = scheduleChunksAcrossDays(days, chunks, matSchedule, boutsPerHourPerMat);

  const totalBouts = activeRounds.reduce((sum, r) => sum + r.bouts, 0);
  let cumulativeBouts = 0;
  let rowsHtml = "";
  let lastDaySeen = null;

  for (const seg of segments) {
    if (numDays === 2 && seg.day !== lastDaySeen) {
      rowsHtml += `<tr class="day-marker-row"><td colspan="7">— ${seg.dayLabel} begins at ${minutesToTime(seg.startMin)} —</td></tr>`;
      lastDaySeen = seg.day;
    }

    const matsAtSegStart = matsAtTime(matSchedule, seg.day, seg.startMin);
    const matsAtSegEnd = matsAtTime(matSchedule, seg.day, Math.max(seg.startMin, seg.endMin - 1));
    cumulativeBouts += seg.boutsThisSegment;
    const remaining = totalBouts - cumulativeBouts;
    const notes = [];
    if (matsAtSegStart !== matsAtSegEnd) notes.push("mat change");
    if (seg.crossesDayBoundary || !seg.isLastSegmentOfChunk) notes.push("continues next day");
    const noteHtml = notes.length
      ? ` <span title="${notes.join(', ')}" style="opacity:0.65; font-size:0.78em;">⚠ ${notes.join(' / ')}</span>`
      : "";
    const roundLabel = seg.isLastSegmentOfChunk && seg.isFirstSegmentOfChunk
      ? seg.chunkLabel
      : (seg.isFirstSegmentOfChunk ? `${seg.chunkLabel} (part 1)` : `${seg.chunkLabel} (part 2)`);

    rowsHtml += `<tr>
      <td>${roundLabel}${noteHtml}</td>
      <td class="num">${seg.boutsThisSegment}</td>
      <td class="num">${formatDuration(seg.endMin - seg.startMin)}</td>
      <td class="num">${minutesToTime(seg.startMin)}</td>
      <td class="num">${minutesToTime(seg.endMin)}</td>
      <td class="num">${cumulativeBouts}</td>
      <td class="num">${remaining}</td>
    </tr>`;
  }

  const finalEndMin = segments[segments.length - 1].endMin;

  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Round</th>
          <th class="num">Bouts</th>
          <th class="num">Duration</th>
          <th class="num">Est. Start</th>
          <th class="num">Est. End</th>
          <th class="num">Cumulative</th>
          <th class="num">Remaining</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
        <tr class="total-row">
          <td>Total</td>
          <td class="num">${totalBouts}</td>
          <td class="num">${formatDuration((totalBouts / totalBoutsPerHour) * 60)}</td>
          <td class="num">${minutesToTime(timeToMinutes(startDay1))}</td>
          <td class="num">${minutesToTime(finalEndMin)}</td>
          <td class="num">${totalBouts}</td>
          <td class="num">0</td>
        </tr>
      </tbody>
    </table>
  `;
}

// ============================================================
// Round Map
// ============================================================
let roundMapData = null; // { weights, placing, rounds, grid }
let roundMapDayCutoff = -1; // index of last Day 1 round column (-1 = no split)

function getRoundBouts(placing, wrestlers) {
  if (wrestlers < 6 || wrestlers > 64) return null;
  const fmt = ROUND_DATA[placing];
  return fmt?.data[wrestlers] || null;
}

function buildRoundMap(weightData, placing) {
  const section = document.getElementById("roundmap-section");
  const fmt = ROUND_DATA[placing];

  // Filter to weights with >= 6 wrestlers (in the lookup table)
  const validWeights = weightData.filter((w) => w.wrestlers >= 6 && w.wrestlers <= 64);

  if (validWeights.length === 0 || !fmt) {
    section.classList.add("hidden");
    return;
  }

  section.classList.remove("hidden");

  // Respect the Round Filter checkboxes — previously the Round Map
  // ignored excludedRounds entirely and summed every round
  // unconditionally, so its Total column could disagree with the
  // headline "Total Bouts" figure (e.g. excluding Seventh dropped the
  // headline total by 1 but the Round Map kept showing the old total).
  const roundIndexes = fmt.rounds
    .map((name, i) => ({ name, i }))
    .filter(({ name }) => !excludedRounds.has(name));
  const rounds = roundIndexes.map(({ name }) => name);

  // Build grid: each weight → array of bouts per round (filtered)
  const grid = validWeights.map((w) => {
    const fullRoundBouts = fmt.data[w.wrestlers] || fmt.rounds.map(() => 0);
    const roundBouts = roundIndexes.map(({ i }) => fullRoundBouts[i]);
    return { name: w.name, wrestlers: w.wrestlers, roundBouts };
  });

  roundMapData = { weights: validWeights, placing, rounds, grid };
  roundMapDayCutoff = -1;

  renderRoundMap();
}

function renderRoundMap() {
  if (!roundMapData) return;

  const { rounds, grid } = roundMapData;
  const container = document.getElementById("roundmap-table-container");
  const daySummary = document.getElementById("roundmap-day-summary");
  const hasCutoff = roundMapDayCutoff >= 0;

  // Determine which rounds have any bouts
  const activeRounds = [];
  for (let r = 0; r < rounds.length; r++) {
    let total = 0;
    for (const row of grid) {
      total += row.roundBouts[r];
    }
    if (total > 0) {
      activeRounds.push(r);
    }
  }

  // Build header
  let headerHtml = `<th class="weight-header">Weight</th>`;
  for (const r of activeRounds) {
    const isDivider = hasCutoff && r === roundMapDayCutoff;
    const dayClass = hasCutoff
      ? (r <= roundMapDayCutoff ? "day1-col" : "day2-col")
      : "";
    const dividerClass = isDivider ? "day-divider" : "";
    headerHtml += `<th class="round-header ${dayClass} ${dividerClass}" data-round="${r}">${rounds[r]}</th>`;
  }
  headerHtml += `<th class="total-header">Total</th>`;

  // Build body rows
  let bodyHtml = "";
  for (const row of grid) {
    let rowTotal = 0;
    let cellsHtml = `<td class="weight-name">${row.name}</td>`;
    for (const r of activeRounds) {
      const val = row.roundBouts[r];
      rowTotal += val;
      const isDivider = hasCutoff && r === roundMapDayCutoff;
      const dayClass = hasCutoff
        ? (r <= roundMapDayCutoff ? "day1-col" : "day2-col")
        : "";
      const dividerClass = isDivider ? "day-divider" : "";
      const zeroClass = val === 0 ? "zero" : "";
      cellsHtml += `<td class="${zeroClass} ${dayClass} ${dividerClass}">${val}</td>`;
    }
    cellsHtml += `<td class="total-cell">${rowTotal}</td>`;
    bodyHtml += `<tr>${cellsHtml}</tr>`;
  }

  // Build column totals row
  let totalRowHtml = `<td class="weight-name total-cell">Total</td>`;
  let grandTotal = 0;
  let day1Total = 0;
  let day2Total = 0;
  for (const r of activeRounds) {
    let colTotal = 0;
    for (const row of grid) {
      colTotal += row.roundBouts[r];
    }
    grandTotal += colTotal;
    if (hasCutoff && r <= roundMapDayCutoff) day1Total += colTotal;
    if (hasCutoff && r > roundMapDayCutoff) day2Total += colTotal;

    const isDivider = hasCutoff && r === roundMapDayCutoff;
    const dayClass = hasCutoff
      ? (r <= roundMapDayCutoff ? "day1-col" : "day2-col")
      : "";
    const dividerClass = isDivider ? "day-divider" : "";
    totalRowHtml += `<td class="total-cell ${dayClass} ${dividerClass}">${colTotal}</td>`;
  }
  totalRowHtml += `<td class="total-cell">${grandTotal}</td>`;

  container.innerHTML = `
    <table class="roundmap-table">
      <thead><tr>${headerHtml}</tr></thead>
      <tbody>
        ${bodyHtml}
        <tr>${totalRowHtml}</tr>
      </tbody>
    </table>
  `;

  // Day summary
  if (hasCutoff) {
    daySummary.classList.remove("hidden");
    daySummary.innerHTML = `
      <div class="day-info"><span class="day-swatch day1-swatch"></span> <strong>Day 1:</strong> ${day1Total} bouts (through ${rounds[roundMapDayCutoff]})</div>
      <div class="day-info"><span class="day-swatch day2-swatch"></span> <strong>Day 2:</strong> ${day2Total} bouts</div>
    `;
  } else {
    daySummary.classList.add("hidden");
  }

  // Attach click listeners to round headers
  container.querySelectorAll(".round-header").forEach((th) => {
    th.addEventListener("click", function () {
      const clickedRound = parseInt(this.dataset.round);
      // Toggle: if clicking the same cutoff, remove it
      if (roundMapDayCutoff === clickedRound) {
        roundMapDayCutoff = -1;
      } else {
        roundMapDayCutoff = clickedRound;
      }
      renderRoundMap();
    });
  });
}

// ============================================================
// Save / Load Session
// ============================================================

function gatherSession() {
  const weightInputs = weightInputsContainer.querySelectorAll(".weight-wrestler-input");
  const nameInputs = weightInputsContainer.querySelectorAll(".weight-name-input");
  const weights = [];
  for (let i = 0; i < weightInputs.length; i++) {
    weights.push({
      name: nameInputs[i]?.value || "",
      wrestlers: weightInputs[i]?.value || "",
    });
  }

  // Hourly actuals
  const actuals = hourlyBlocks.map((b) => b.actual);

  // Venue splitter locations
  const locRows = locationInputsContainer.querySelectorAll(".location-row");
  const locations = [];
  locRows.forEach((row) => {
    locations.push({
      name: row.querySelector(".loc-name")?.value || "",
      mats: row.querySelector(".loc-mats")?.value || "",
    });
  });

  return {
    version: 1,
    tournamentName: document.getElementById("tournament-name").value,
    numDays: numDaysSelect.value,
    startTimeDay1: document.getElementById("start-time-day1").value,
    endTimeDay1: document.getElementById("end-time-day1").value,
    startTimeDay2: document.getElementById("start-time-day2").value,
    numMats: document.getElementById("num-mats").value,
    level: levelSelect.value,
    boutsPerHour: boutsPerHourInput.value,
    placing: placingSelect.value,
    numWeights: numWeightsInput.value,
    weights,
    actuals,
    numLocations: numLocationsSelect.value,
    locations,
    splitterAssignments: { ...splitterAssignments },
    roundMapDayCutoff,
    excludedRounds: Array.from(excludedRounds),
  };
}

function restoreSession(data) {
  document.getElementById("tournament-name").value = data.tournamentName || "";
  numDaysSelect.value = data.numDays || "1";
  toggleDayFields();
  document.getElementById("start-time-day1").value = data.startTimeDay1 || "09:00";
  document.getElementById("end-time-day1").value = data.endTimeDay1 || "18:00";
  document.getElementById("start-time-day2").value = data.startTimeDay2 || "09:00";
  document.getElementById("num-mats").value = data.numMats || "4";
  levelSelect.value = data.level || "hs";
  boutsPerHourInput.value = data.boutsPerHour || DEFAULTS[data.level || "hs"];
  defaultHint.textContent = `(default: ${DEFAULTS[levelSelect.value]})`;
  placingSelect.value = data.placing || "top8";
  excludedRounds = new Set(Array.isArray(data.excludedRounds) ? data.excludedRounds : []);
  buildRoundFilterCheckboxes();
  numWeightsInput.value = data.numWeights || "10";

  // Build weight inputs and fill values
  buildWeightInputs();
  if (data.weights) {
    const wInputs = weightInputsContainer.querySelectorAll(".weight-wrestler-input");
    const nInputs = weightInputsContainer.querySelectorAll(".weight-name-input");
    for (let i = 0; i < data.weights.length && i < wInputs.length; i++) {
      nInputs[i].value = data.weights[i].name || "";
      wInputs[i].value = data.weights[i].wrestlers || "";
    }
    updateTotalBouts();
  }

  // Restore venue splitter locations
  numLocationsSelect.value = data.numLocations || "2";
  buildLocationInputs();
  if (data.locations) {
    const locRows = locationInputsContainer.querySelectorAll(".location-row");
    for (let i = 0; i < data.locations.length && i < locRows.length; i++) {
      const nameInp = locRows[i].querySelector(".loc-name");
      const matsInp = locRows[i].querySelector(".loc-mats");
      if (nameInp) nameInp.value = data.locations[i].name || "";
      if (matsInp) matsInp.value = data.locations[i].mats || "";
    }
  }

  // Trigger calculate
  form.dispatchEvent(new Event("submit"));

  // Restore hourly actuals after calculate has built blocks
  if (data.actuals && data.actuals.length > 0) {
    for (let i = 0; i < data.actuals.length && i < hourlyBlocks.length; i++) {
      hourlyBlocks[i].actual = data.actuals[i];
    }
    renderHourlyTable();
  }

  // Restore splitter assignments
  if (data.splitterAssignments && Object.keys(data.splitterAssignments).length > 0) {
    splitterAssignments = {};
    for (const [k, v] of Object.entries(data.splitterAssignments)) {
      splitterAssignments[parseInt(k)] = v;
    }
    readLocations();
    renderSplitterResults();
  }

  // Restore round map cutoff
  if (typeof data.roundMapDayCutoff === "number" && data.roundMapDayCutoff >= 0) {
    roundMapDayCutoff = data.roundMapDayCutoff;
    renderRoundMap();
  }
}

// Save button
document.getElementById("btn-save").addEventListener("click", function () {
  const data = gatherSession();
  const name = data.tournamentName || "tournament";
  const filename = name.replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase() + ".json";

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
});

// Load button
document.getElementById("btn-load").addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (evt) {
    try {
      const data = JSON.parse(evt.target.result);
      restoreSession(data);
    } catch (err) {
      alert("Could not read session file. Make sure it's a valid JSON file.");
    }
  };
  reader.readAsText(file);

  // Reset the input so the same file can be loaded again
  e.target.value = "";
});

// ============================================================
// FloArena Live Feed
// ============================================================
const floArena = {
  active: false,
  guid: null,
  proxyBase: null,
  intervalId: null,
  seenIds: new Set(),
  totalCompleted: 0,
  lastPollTime: null,
  lastError: null,
  lastDebugInfo: null, // summary of last raw response for display
};

// Walk common response shapes to find the array of bouts.
// Tries root array, then single-level keys, then two-level nesting.
function extractBoutsFromResponse(json) {
  if (Array.isArray(json)) return { bouts: json, path: "root[]" };

  const keys = ["response", "data", "bouts", "results", "matches", "items", "records"];

  for (const k of keys) {
    if (Array.isArray(json[k])) return { bouts: json[k], path: k };
  }

  for (const outer of keys) {
    const val = json[outer];
    if (val && typeof val === "object" && !Array.isArray(val)) {
      for (const inner of keys) {
        if (Array.isArray(val[inner])) return { bouts: val[inner], path: `${outer}.${inner}` };
      }
    }
  }

  return { bouts: [], path: null };
}

// Extract the best available unique ID from a bout object.
function extractBoutId(bout) {
  return String(
    bout.guid ?? bout.boutNumber ?? bout.id ?? bout.boutId ??
    bout.matchId ?? bout.matchNumber ?? bout.match_id ?? bout.bout_id ?? ""
  );
}

function extractFloArenaGuid(input) {
  const s = input.trim();
  // Accept full URL: https://arena.flowrestling.org/event/{guid}[/...]
  const match = s.match(/event\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
  if (match) return match[1];
  // Accept bare GUID
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)) return s;
  return null;
}

async function floArenaPoll() {
  if (!floArena.active) return;
  const url = `${floArena.proxyBase}/event/${floArena.guid}/recent-results`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    // The API is a sliding window of the ~20 most recent bouts.
    // pager.totalCount is the authoritative count of ALL completed bouts.
    const pager =
      json?.response?.pager ??
      json?.pager ??
      json?.data?.pager ??
      null;
    const totalCount = pager?.totalCount ?? null;

    floArena.lastDebugInfo =
      `pager.totalCount: ${totalCount} | recent window: ${json?.response?.bouts?.length ?? "?"}`;
    console.log("[FloArena] raw response:", json);
    console.log("[FloArena] debug:", floArena.lastDebugInfo);

    if (totalCount !== null && totalCount !== floArena.totalCompleted) {
      floArena.totalCompleted = totalCount;
      applyFloArenaTotal(floArena.totalCompleted);
    }

    floArena.lastPollTime = new Date();
    floArena.lastError = null;
  } catch (err) {
    floArena.lastError = err.message;
    console.error("[FloArena] poll error:", err);
  }
  renderFloArenaStatus();
}

function applyFloArenaTotal(totalCompleted) {
  if (hourlyBlocks.length === 0) return;

  // Distribute completed bouts across hourly blocks in order
  let remaining = totalCompleted;
  for (let i = 0; i < hourlyBlocks.length; i++) {
    if (remaining <= 0) {
      hourlyBlocks[i].actual = null;
    } else {
      const cap = Math.round(hourlyTotalBoutsPerHour * hourlyBlocks[i].blockFraction);
      const actual = Math.min(remaining, cap);
      hourlyBlocks[i].actual = actual;
      remaining -= actual;
    }
  }

  renderHourlyTable();
  syncTickerFromHourly();
  if (liveEvent) renderMatStatus(); // refresh the Flo-vs-logger reconcile warning

  // Lock inputs so they read-only while FloArena is driving them
  const container = document.getElementById("hourly-table-container");
  if (container) {
    container.querySelectorAll(".actual-input").forEach((inp) => {
      inp.disabled = true;
    });
  }
}

function renderFloArenaStatus() {
  const statusEl = document.getElementById("floarena-status");
  const textEl = document.getElementById("floarena-status-text");
  if (!statusEl || !textEl) return;

  statusEl.className = "floarena-status";

  if (!floArena.active) {
    statusEl.classList.add("floarena-idle");
    textEl.textContent = "Not connected";
    return;
  }

  if (floArena.lastError) {
    statusEl.classList.add("floarena-error");
    textEl.textContent = `Error: ${floArena.lastError}`;
    return;
  }

  statusEl.classList.add("floarena-live");
  const timeStr = floArena.lastPollTime
    ? floArena.lastPollTime.toLocaleTimeString()
    : "connecting…";
  textEl.textContent = `Live — ${floArena.totalCompleted} bouts detected · last updated ${timeStr}`;

  // Show debug info beneath status when 0 bouts detected (helps diagnose response shape issues)
  let debugEl = document.getElementById("floarena-debug-info");
  if (!debugEl) {
    debugEl = document.createElement("div");
    debugEl.id = "floarena-debug-info";
    debugEl.style.cssText = "font-size:0.75em;color:#888;margin-top:4px;word-break:break-all;";
    statusEl.parentNode.insertBefore(debugEl, statusEl.nextSibling);
  }
  if (floArena.totalCompleted === 0 && floArena.lastDebugInfo) {
    debugEl.textContent = "Debug: " + floArena.lastDebugInfo;
    debugEl.style.display = "";
  } else {
    debugEl.style.display = "none";
  }
}

document.getElementById("btn-floarena-connect").addEventListener("click", function () {
  const proxyInput = document.getElementById("floarena-proxy-url").value.trim().replace(/\/$/, "");
  const eventInput = document.getElementById("floarena-event-input").value;
  const guid = extractFloArenaGuid(eventInput);

  if (!proxyInput) {
    alert("Please enter your Cloudflare Worker URL.");
    return;
  }
  if (!guid) {
    alert("Could not find a valid FloArena event GUID.\nPaste the full event URL or just the GUID.");
    return;
  }

  floArena.active = true;
  floArena.guid = guid;
  floArena.proxyBase = proxyInput;
  floArena.seenIds = new Set();
  floArena.totalCompleted = 0;
  floArena.lastError = null;
  floArena.lastPollTime = null;

  document.getElementById("btn-floarena-connect").classList.add("hidden");
  document.getElementById("btn-floarena-disconnect").classList.remove("hidden");
  document.getElementById("floarena-proxy-url").disabled = true;
  document.getElementById("floarena-event-input").disabled = true;

  renderFloArenaStatus();
  floArenaPoll(); // immediate first poll
  floArena.intervalId = setInterval(floArenaPoll, 30000); // every 30 seconds
});

document.getElementById("btn-floarena-disconnect").addEventListener("click", function () {
  floArena.active = false;
  clearInterval(floArena.intervalId);
  floArena.intervalId = null;

  document.getElementById("btn-floarena-connect").classList.remove("hidden");
  document.getElementById("btn-floarena-disconnect").classList.add("hidden");
  document.getElementById("floarena-proxy-url").disabled = false;
  document.getElementById("floarena-event-input").disabled = false;

  // Unlock hourly inputs for manual editing
  const container = document.getElementById("hourly-table-container");
  if (container) {
    container.querySelectorAll(".actual-input").forEach((inp) => {
      inp.disabled = false;
    });
  }

  renderFloArenaStatus();
});

// ============================================================
// Matside Live — resume across page reloads
// Placed at end-of-file (after floArena and every other top-level
// const/let is initialized) to avoid a TDZ ReferenceError that would
// otherwise abort all script.js execution below the throw point.
// ============================================================
try {
  loadLiveEventFromStorage();
  if (liveEvent) {
    renderLiveEventPanel();
    document.getElementById("mat-status-section").classList.remove("hidden");
    startMatStatusListeners();
  }
} catch (e) {
  console.error("[Live] failed to resume live event on reload:", e);
}
