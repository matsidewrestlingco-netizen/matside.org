import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, cpSync, readFileSync } from 'node:fs'
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
