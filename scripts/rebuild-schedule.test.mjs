import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { rebuild, validate, renderSchedule } from './rebuild-schedule.mjs'

const GOOD_DATA = {
  seasons: [
    {
      season: '2026–27',
      events: [
        { date: '2026-11-22', name: 'Back Points for Bella', location: 'Baldwin-Whitehall HS', registerUrl: 'https://www.matside.org/t/2026-back-points-for-bella/' },
        { date: 'TBD', name: "Girls' Open & Friends", location: 'TBD' },
      ],
    },
    {
      season: '2025–26',
      events: [
        { date: '2025-12-06', name: 'Titan Duals', location: 'Shaler Area HS', bracketUrl: 'https://go.flo.zone/9pfNXZ6j' },
      ],
    },
  ],
}

const MARKERS =
  '<body>\n<!-- SCHEDULE:START (generated from data/schedule.json — do not edit by hand; run scripts/rebuild-schedule.mjs) -->\nstale\n        <!-- SCHEDULE:END -->\n</body>\n'

function makeRoot(data = GOOD_DATA, indexHtml = MARKERS) {
  const root = mkdtempSync(path.join(tmpdir(), 'matside-schedule-'))
  mkdirSync(path.join(root, 'data'), { recursive: true })
  writeFileSync(path.join(root, 'data', 'schedule.json'), JSON.stringify(data))
  writeFileSync(path.join(root, 'index.html'), indexHtml)
  return root
}

test('happy path — renders rows, escapes HTML, formats dates', () => {
  const out = renderSchedule(GOOD_DATA)
  assert.match(out, /Nov 22, 2026/)
  assert.match(out, /Back Points for Bella/)
  assert.match(out, /Girls' Open &amp; Friends/)
  assert.match(out, /<span class="tba">TBA<\/span>/)
  assert.match(out, /href="https:\/\/go\.flo\.zone\/9pfNXZ6j"/)
  assert.match(out, /2 events/)
  assert.match(out, /1 event</)
  // Register column only on seasons that have a registerUrl
  const [s1, s2] = out.split('\n\n')
  assert.match(s1, /<th>Register<\/th>/)
  assert.doesNotMatch(s2, /<th>Register<\/th>/)
})

test('rebuild writes generated section into markers', () => {
  const root = makeRoot()
  assert.equal(rebuild({ root }), true)
  const html = readFileSync(path.join(root, 'index.html'), 'utf8')
  assert.match(html, /Back Points for Bella/)
  assert.doesNotMatch(html, /stale/)
  // idempotent
  assert.equal(rebuild({ root }), false)
})

test('--check fails when stale, passes when current', () => {
  const root = makeRoot()
  assert.throws(() => rebuild({ root, check: true }), /out of date/)
  rebuild({ root })
  assert.equal(rebuild({ root, check: true }), false)
})

test('rejects malformed JSON', () => {
  const root = makeRoot()
  writeFileSync(path.join(root, 'data', 'schedule.json'), '{ nope')
  assert.throws(() => rebuild({ root }), /invalid JSON/)
})

test('rejects missing markers', () => {
  const root = makeRoot(GOOD_DATA, '<body>no markers</body>')
  assert.throws(() => rebuild({ root }), /markers not found/)
})

test('validate catches bad shapes', () => {
  assert.match(validate({})[0], /expected \{ "seasons"/)
  const bad = (ev) => validate({ seasons: [{ season: 'x', events: [ev] }] })
  assert.match(bad({ name: 'X', location: 'Y' })[0], /"date" must be YYYY-MM-DD/)
  assert.match(bad({ date: '2026-02-30', name: 'X', location: 'Y' })[0], /not a real calendar date/)
  assert.match(bad({ date: '2026-01-01', location: 'Y' })[0], /missing "name"/)
  assert.match(bad({ date: '2026-01-01', name: 'X' })[0], /missing "location"/)
  assert.match(bad({ date: '2026-01-01', name: 'X', location: 'Y', bracketUrl: 'not-a-url' })[0], /https:\/\/ URL/)
  assert.match(bad({ date: '2026-01-01', name: 'X', location: 'Y', registerURL: 'https://x.com' })[0], /unknown field/)
  assert.equal(validate(GOOD_DATA).length, 0)
})
