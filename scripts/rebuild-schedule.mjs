// Rebuilds the schedule tables in index.html from data/schedule.json.
// Node built-ins only. matside.org has no package.json — must run bare.
//
// Usage: node scripts/rebuild-schedule.mjs [--check]
//   --check: exit 1 if index.html would change (CI validation without writing)
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DEFAULT_ROOT = path.resolve(__dirname, '..')

const START = '<!-- SCHEDULE:START (generated from data/schedule.json — do not edit by hand; run scripts/rebuild-schedule.mjs) -->'
const END = '<!-- SCHEDULE:END -->'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function formatDate(iso) {
  if (iso === 'TBD') return 'TBD'
  const [y, m, d] = iso.split('-').map(Number)
  return `${MONTHS[m - 1]} ${d}, ${y}`
}

export function validate(data) {
  const errors = []
  if (!data || !Array.isArray(data.seasons)) {
    return ['top level: expected { "seasons": [...] }']
  }
  data.seasons.forEach((season, si) => {
    const where = `seasons[${si}]`
    if (!season.season || typeof season.season !== 'string') {
      errors.push(`${where}: missing "season" name`)
    }
    if (!Array.isArray(season.events)) {
      errors.push(`${where}: missing "events" array`)
      return
    }
    season.events.forEach((ev, ei) => {
      const ref = `${where}.events[${ei}] (${ev.name || 'unnamed'})`
      if (!ev.name || typeof ev.name !== 'string') errors.push(`${ref}: missing "name"`)
      if (!ev.location || typeof ev.location !== 'string') errors.push(`${ref}: missing "location"`)
      if (ev.date !== 'TBD' && !/^\d{4}-\d{2}-\d{2}$/.test(ev.date ?? '')) {
        errors.push(`${ref}: "date" must be YYYY-MM-DD or "TBD", got ${JSON.stringify(ev.date)}`)
      } else if (ev.date !== 'TBD') {
        const [y, m, d] = ev.date.split('-').map(Number)
        const dt = new Date(Date.UTC(y, m - 1, d))
        if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) {
          errors.push(`${ref}: "date" ${ev.date} is not a real calendar date`)
        }
      }
      for (const key of ['bracketUrl', 'registerUrl']) {
        if (ev[key] !== undefined && !/^https:\/\/\S+$/.test(ev[key])) {
          errors.push(`${ref}: "${key}" must be an https:// URL, got ${JSON.stringify(ev[key])}`)
        }
      }
      const known = new Set(['date', 'name', 'location', 'bracketUrl', 'registerUrl'])
      for (const key of Object.keys(ev)) {
        if (!known.has(key)) errors.push(`${ref}: unknown field "${key}" (typo?)`)
      }
    })
  })
  return errors
}

function renderBracketCell(ev) {
  if (ev.bracketUrl) {
    return `<td class="bracket"><a href="${esc(ev.bracketUrl)}" target="_blank" rel="noopener">View →</a></td>`
  }
  return '<td class="bracket"><span class="tba">TBA</span></td>'
}

function renderRegisterCell(ev) {
  if (ev.registerUrl) {
    return `<td class="bracket"><a href="${esc(ev.registerUrl)}" target="_blank" rel="noopener">Register</a></td>`
  }
  return '<td></td>'
}

export function renderSchedule(data) {
  const blocks = data.seasons.map((season) => {
    const hasRegister = season.events.some((ev) => ev.registerUrl)
    const count = season.events.length
    const header = hasRegister
      ? '<thead><tr><th>Date</th><th>Event</th><th>Location</th><th>Bracket</th><th>Register</th></tr></thead>'
      : '<thead><tr><th>Date</th><th>Event</th><th>Location</th><th>Bracket</th></tr></thead>'
    const rows = season.events.map((ev) => {
      const cells = [
        `<td class="date">${esc(formatDate(ev.date))}</td>`,
        `<td class="event">${esc(ev.name)}</td>`,
        `<td class="loc">${esc(ev.location)}</td>`,
        renderBracketCell(ev),
      ]
      if (hasRegister) cells.push(renderRegisterCell(ev))
      return `              <tr>${cells.join('')}</tr>`
    })
    return [
      `        <div class="season"><span>Season ${esc(season.season)}</span><span class="sub">${count} event${count === 1 ? '' : 's'}</span></div>`,
      '        <div class="table-wrap">',
      '          <table>',
      `            ${header}`,
      '            <tbody>',
      ...rows,
      '            </tbody>',
      '          </table>',
      '        </div>',
    ].join('\n')
  })
  return blocks.join('\n\n')
}

export function rebuild({ root = DEFAULT_ROOT, check = false } = {}) {
  const dataPath = path.join(root, 'data', 'schedule.json')
  const indexPath = path.join(root, 'index.html')

  let data
  try {
    data = JSON.parse(readFileSync(dataPath, 'utf8'))
  } catch (err) {
    throw new Error(`${dataPath}: invalid JSON — ${err.message}`)
  }

  const errors = validate(data)
  if (errors.length) {
    throw new Error(`data/schedule.json has problems:\n  - ${errors.join('\n  - ')}`)
  }

  const html = readFileSync(indexPath, 'utf8')
  const startIdx = html.indexOf(START)
  const endIdx = html.indexOf(END)
  if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
    throw new Error(`index.html: schedule markers not found or malformed (need "${START}" before "${END}")`)
  }

  const generated = `${START}\n${renderSchedule(data)}\n        ${END}`
  const next = html.slice(0, startIdx) + generated + html.slice(endIdx + END.length)

  if (next === html) {
    console.log('schedule: up to date')
    return false
  }
  if (check) {
    throw new Error('index.html schedule section is out of date — run: node scripts/rebuild-schedule.mjs')
  }
  writeFileSync(indexPath, next, 'utf8')
  const total = data.seasons.reduce((n, s) => n + s.events.length, 0)
  console.log(`schedule: regenerated (${data.seasons.length} seasons, ${total} events)`)
  return true
}

// CLI entry
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    rebuild({ check: process.argv.includes('--check') })
  } catch (err) {
    console.error(err.message)
    process.exit(1)
  }
}
