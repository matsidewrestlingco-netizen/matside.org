// ============================================================
// Per-round bout data from spreadsheet (bracket size → bouts per round)
// ============================================================
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

// Default bouts per hour per mat by level
const DEFAULTS = {
  youth: 14,
  jh: 12,
  hs: 10,
};

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

// ============================================================
// Level → default bouts/hour
// ============================================================
function applyLevelDefault() {
  const level = levelSelect.value;
  const def = DEFAULTS[level];
  boutsPerHourInput.value = def;
  defaultHint.textContent = `(default: ${def})`;
}

levelSelect.addEventListener("change", applyLevelDefault);
applyLevelDefault();

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
    const bouts = getBouts(placing, wrestlers);
    total += bouts;
    const span = document.getElementById(`bout-count-${i}`);
    if (span) {
      span.textContent = wrestlers >= 2 ? `${bouts}b` : "";
    }
  });

  totalBoutsDisplay.textContent = total;
}

numWeightsInput.addEventListener("change", buildWeightInputs);
numWeightsInput.addEventListener("input", buildWeightInputs);
placingSelect.addEventListener("change", updateTotalBouts);

// Build initial weight inputs
buildWeightInputs();

// ============================================================
// Ticker Sync (localStorage)
// ============================================================
let tickerState = {};

function syncTicker(updates) {
  Object.assign(tickerState, updates);
  tickerState.updatedAt = Date.now();
  try {
    localStorage.setItem("wrestlingTicker", JSON.stringify(tickerState));
  } catch (e) { /* localStorage unavailable */ }
}

function syncTickerFromHourly() {
  // Compute completed bouts and actual run rate from hourly actuals
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

  const remaining = Math.max(0, hourlyTotalBouts - completedBouts);
  const actualRate = hasActuals && actualMinutes > 0
    ? Math.round((completedBouts / (actualMinutes / 60)) * 10) / 10
    : null;

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
    const bouts = getBouts(placing, wrestlers);
    const weightName = nameInputs[i]?.value.trim() || `Weight ${i + 1}`;
    totalBouts += bouts;
    weightData.push({ name: weightName, wrestlers, bouts });
  });

  // Store for splitter to use
  lastWeightData = weightData;
  lastBoutsPerHourPerMat = boutsPerHourPerMat;
  lastStartDay1 = startDay1;

  // Show splitter section
  document.getElementById("splitter-section").classList.remove("hidden");

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

  if (numDays === 1) {
    const startMin = timeToMinutes(startDay1);
    const endMin = startMin + totalMinutes;

    document.getElementById("result-end-time").textContent = minutesToTime(endMin);

    dayBreakdown.classList.add("hidden");

    summaryEl.innerHTML =
      `<strong>${totalBouts} bouts</strong> across <strong>${mats} mat${mats > 1 ? "s" : ""}</strong> ` +
      `at <strong>${boutsPerHourPerMat} bouts/hr/mat</strong> = ` +
      `<strong>${totalBoutsPerHour} bouts/hr</strong> total.<br>` +
      `Starting at <strong>${minutesToTime(startMin)}</strong>, ` +
      `estimated finish around <strong>${minutesToTime(endMin)}</strong>.`;
  } else {
    const startDay1Min = timeToMinutes(startDay1);
    const endDay1Min = timeToMinutes(endDay1);
    const startDay2Min = timeToMinutes(startDay2);

    const day1AvailableMin = endDay1Min - startDay1Min;
    const day1AvailableHours = day1AvailableMin / 60;
    const day1Bouts = Math.floor(day1AvailableHours * totalBoutsPerHour);
    const day1ActualBouts = Math.min(day1Bouts, totalBouts);

    const day2Bouts = totalBouts - day1ActualBouts;
    const day2Hours = day2Bouts / totalBoutsPerHour;
    const day2Minutes = day2Hours * 60;
    const day2EndMin = startDay2Min + day2Minutes;

    document.getElementById("result-end-time").textContent =
      minutesToTime(day2EndMin) + " (Day 2)";

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
            <td>${minutesToTime(endDay1Min)}</td>
          </tr>
          <tr>
            <td><strong>Day 2</strong></td>
            <td>${day2Bouts}</td>
            <td>${minutesToTime(startDay2Min)}</td>
            <td>${minutesToTime(day2EndMin)}</td>
          </tr>
        </tbody>
      </table>
    `;

    summaryEl.innerHTML =
      `<strong>${totalBouts} bouts</strong> across <strong>${mats} mat${mats > 1 ? "s" : ""}</strong> ` +
      `at <strong>${boutsPerHourPerMat} bouts/hr/mat</strong>.<br>` +
      `Day 1: ~<strong>${day1ActualBouts} bouts</strong> (${minutesToTime(startDay1Min)} – ${minutesToTime(endDay1Min)}).<br>` +
      `Day 2: ~<strong>${day2Bouts} bouts</strong> remaining, ` +
      `finishing around <strong>${minutesToTime(day2EndMin)}</strong>.`;
  }

  // ============================================================
  // Hourly breakdown
  // ============================================================
  buildHourlyBreakdown(totalBouts, mats, boutsPerHourPerMat, numDays, startDay1, endDay1, startDay2);

  // Round schedule
  buildRoundSchedule(weightData, placing, mats, boutsPerHourPerMat, startDay1);

  // Round map
  buildRoundMap(weightData, placing);

  // Sync ticker
  const placingLabel = placing === "top8" ? "Top 8" : placing === "top6" ? "Top 6" : "Top 4";
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
});

// Store block data so we can recalculate when actuals are entered
let hourlyBlocks = [];
let hourlyTotalBouts = 0;
let hourlyTotalBoutsPerHour = 0;

function buildHourlyBreakdown(totalBouts, mats, boutsPerHourPerMat, numDays, startDay1, endDay1, startDay2) {
  const section = document.getElementById("hourly-section");
  const container = document.getElementById("hourly-table-container");
  const label = document.getElementById("hourly-label");

  if (totalBouts === 0) {
    section.classList.add("hidden");
    return;
  }

  section.classList.remove("hidden");

  const totalBoutsPerHour = boutsPerHourPerMat * mats;
  hourlyTotalBouts = totalBouts;
  hourlyTotalBoutsPerHour = totalBoutsPerHour;

  // Build time blocks for each day
  const days = [];

  if (numDays === 1) {
    days.push({ label: null, startMin: timeToMinutes(startDay1), endMin: null });
  } else {
    days.push({ label: "Day 1", startMin: timeToMinutes(startDay1), endMin: timeToMinutes(endDay1) });
    days.push({ label: "Day 2", startMin: timeToMinutes(startDay2), endMin: null });
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
      const estimated = Math.min(remaining, Math.round(totalBoutsPerHour * blockFraction));

      remaining -= estimated;

      hourlyBlocks.push({
        dayLabel: (numDays === 2 && blockStart === day.startMin) ? day.label : null,
        timeLabel: `${minutesToTime(blockStart)} – ${minutesToTime(effectiveBlockEnd)}`,
        blockFraction,
        estimated,
        actual: null,
      });

      blockStart = effectiveBlockEnd;
      blockEnd = blockStart + 60;
    }
  }

  label.textContent = `${mats} mat${mats > 1 ? "s" : ""} at ${boutsPerHourPerMat} bouts/hr/mat (${totalBoutsPerHour} bouts/hr total)`;

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

  // Re-estimate remaining blocks based on what's left
  let reRemaining = remaining;
  for (let i = lastActualIndex + 1; i < hourlyBlocks.length; i++) {
    const block = hourlyBlocks[i];
    const estimated = Math.min(reRemaining, Math.round(hourlyTotalBoutsPerHour * block.blockFraction));
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

    html += `<tr class="${rowClass}">
      <td>${row.timeLabel}</td>
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

btnSplit.addEventListener("click", function () {
  if (lastWeightData.length === 0) {
    alert("Please fill in the weight classes above and click Calculate first.");
    return;
  }

  readLocations();

  // Filter to weight classes that have bouts
  const weights = lastWeightData
    .filter((w) => w.bouts > 0)
    .map((w, i) => ({ ...w, origIndex: lastWeightData.indexOf(w) }));

  // Auto-assign using LPT algorithm
  const locTotals = splitterLocations.map(() => 0);

  // Sort by bouts descending
  const sorted = [...weights].sort((a, b) => b.bouts - a.bouts);

  splitterAssignments = {};
  for (const w of sorted) {
    let bestIdx = 0;
    let bestTime = Infinity;

    for (let i = 0; i < splitterLocations.length; i++) {
      const time = locTotals[i] / splitterLocations[i].boutsPerHour;
      if (time < bestTime) {
        bestTime = time;
        bestIdx = i;
      }
    }

    splitterAssignments[w.origIndex] = bestIdx;
    locTotals[bestIdx] += w.bouts;
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

  const startMin = timeToMinutes(lastStartDay1);

  // Build location groups from assignments
  const groups = splitterLocations.map((loc) => ({
    ...loc,
    weights: [],
    totalBouts: 0,
    totalWrestlers: 0,
  }));

  for (const [wIdx, locIdx] of Object.entries(splitterAssignments)) {
    const w = lastWeightData[parseInt(wIdx)];
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
          <span>${group.name} (${group.mats} mat${group.mats > 1 ? "s" : ""})</span>
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
function buildRoundSchedule(weightData, placing, mats, boutsPerHourPerMat, startTime) {
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
  const totalBoutsPerHour = boutsPerHourPerMat * mats;

  // Sum bouts across all weights for each round
  const roundTotals = rounds.map((_, r) => {
    let total = 0;
    for (const w of validWeights) {
      const roundBouts = fmt.data[w.wrestlers];
      if (roundBouts) total += roundBouts[r];
    }
    return total;
  });

  // Filter to rounds that have bouts
  const activeRounds = [];
  for (let r = 0; r < rounds.length; r++) {
    if (roundTotals[r] > 0) {
      activeRounds.push({ index: r, name: rounds[r], bouts: roundTotals[r] });
    }
  }

  if (activeRounds.length === 0) {
    section.classList.add("hidden");
    return;
  }

  label.textContent = `${mats} mat${mats > 1 ? "s" : ""} at ${boutsPerHourPerMat} bouts/hr/mat (${totalBoutsPerHour} bouts/hr total)`;

  // Calculate timing for each round
  let currentMin = timeToMinutes(startTime);
  let cumulativeBouts = 0;
  const totalBouts = activeRounds.reduce((sum, r) => sum + r.bouts, 0);

  let rowsHtml = "";
  for (const round of activeRounds) {
    const roundMinutes = (round.bouts / totalBoutsPerHour) * 60;
    const startMinForRound = currentMin;
    const endMinForRound = currentMin + roundMinutes;
    cumulativeBouts += round.bouts;
    const remaining = totalBouts - cumulativeBouts;

    rowsHtml += `<tr>
      <td>${round.name}</td>
      <td class="num">${round.bouts}</td>
      <td class="num">${formatDuration(roundMinutes)}</td>
      <td class="num">${minutesToTime(startMinForRound)}</td>
      <td class="num">${minutesToTime(endMinForRound)}</td>
      <td class="num">${cumulativeBouts}</td>
      <td class="num">${remaining}</td>
    </tr>`;

    currentMin = endMinForRound;
  }

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
          <td class="num">${minutesToTime(timeToMinutes(startTime))}</td>
          <td class="num">${minutesToTime(currentMin)}</td>
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

  const rounds = fmt.rounds;

  // Build grid: each weight → array of bouts per round
  const grid = validWeights.map((w) => {
    const roundBouts = fmt.data[w.wrestlers] || rounds.map(() => 0);
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
