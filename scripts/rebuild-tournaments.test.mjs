import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, cpSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { rebuild } from './rebuild-tournaments.mjs'

const FIXTURES = path.resolve('scripts/__fixtures__')

function makeRoot() {
  const root = mkdtempSync(path.join(tmpdir(), 'matside-rebuild-'))
  mkdirSync(path.join(root, 't', '_template'), { recursive: true })
  cpSync(path.join(FIXTURES, 'template.html'), path.join(root, 't', '_template', 'index.html'))
  return root
}

function seed(root, slug, fixture = 'big-brawl') {
  const dst = path.join(root, 't', slug)
  cpSync(path.join(FIXTURES, 'tournaments', fixture), dst, { recursive: true })
}

test('happy path — renders all tokens', async () => {
  const root = makeRoot()
  seed(root, 'big-brawl')

  await rebuild({ root })

  const out = readFileSync(path.join(root, 't', 'big-brawl', 'index.html'), 'utf8')

  assert.match(out, /The Big Brawl 2026/)
  assert.match(out, /Jan 18, 2026/)
  assert.match(out, /Center Ice Arena/)
  assert.match(out, /Pittsburgh, PA/)
  assert.match(out, /K–12 · Girls/)
  assert.match(out, /7:00 AM/)
  assert.match(out, /9:00 AM/)
  assert.match(out, /td@example\.com/)
  assert.match(out, /forms\.matsidesystems\.com\/r\/big-brawl-forms\?embed=1/)
  assert.match(out, /--accent: #c9a967/)
  assert.match(out, /datetime="2026-01-18"/)
  assert.match(out, /data-hero="hero\.jpg"/)
  assert.doesNotMatch(out, /\{\{[A-Z_]+\}\}/)
})

test('rejects malformed JSON', async () => {
  const root = makeRoot()
  seed(root, 'malformed', 'malformed')
  await assert.rejects(rebuild({ root }), /invalid JSON/i)
})

test('rejects missing referenced image', async () => {
  const root = makeRoot()
  seed(root, 'missing-image', 'missing-image')
  await assert.rejects(rebuild({ root }), /hero-missing\.jpg.*not found/i)
})

test('rejects slug/folder mismatch', async () => {
  const root = makeRoot()
  seed(root, 'slug-mismatch', 'slug-mismatch')
  await assert.rejects(rebuild({ root }), /slug mismatch|does not match/i)
})

test('rejects unknown templateVersion', async () => {
  const root = makeRoot()
  seed(root, 'bad-version', 'bad-version')
  await assert.rejects(rebuild({ root }), /template version|templateVersion/i)
})

test('emits tournaments.json manifest sorted by date ascending', async () => {
  const root = makeRoot()
  seed(root, 'big-brawl')

  // Seed a second tournament with an earlier date
  const early = path.join(root, 't', 'early-event')
  mkdirSync(early, { recursive: true })
  const cfg = JSON.parse(readFileSync(path.join(FIXTURES, 'tournaments', 'big-brawl', 'config.json'), 'utf8'))
  cfg.slug = 'early-event'
  cfg.date = '2026-01-01'
  cfg.name = 'Early Event'
  cfg.hero = null
  writeFileSync(path.join(early, 'config.json'), JSON.stringify(cfg, null, 2))

  await rebuild({ root })

  const manifest = JSON.parse(readFileSync(path.join(root, 't', 'tournaments.json'), 'utf8'))
  assert.equal(manifest.length, 2)
  assert.equal(manifest[0].slug, 'early-event')
  assert.equal(manifest[1].slug, 'big-brawl')
  assert.deepEqual(Object.keys(manifest[0]).sort(), ['date', 'name', 'slug', 'venueLocation'])
})
