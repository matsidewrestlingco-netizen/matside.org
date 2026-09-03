// Node built-ins only. matside.org has no package.json — must run bare.
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DEFAULT_ROOT = path.resolve(__dirname, '..')

const KNOWN_TEMPLATE_VERSIONS = new Set([1])

function formatDateDisplay(iso) {
  // "2026-01-18" -> "Jan 18, 2026"
  const [y, m, d] = iso.split('-').map(Number)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[m - 1]} ${d}, ${y}`
}

function computeOgImageUrl(config) {
  if (config.hero) return `https://www.matside.org/t/${config.slug}/${config.hero}`
  return 'https://www.matside.org/apple-touch-icon.png' // sensible fallback
}

function renderTemplate(template, config) {
  const tokens = {
    SLUG: config.slug,
    FORMS_SLUG: config.formsSlug,
    NAME: config.name,
    DATE_ISO: config.date,
    DATE_DISPLAY: formatDateDisplay(config.date),
    VENUE_NAME: config.venueName,
    VENUE_LOCATION: config.venueLocation,
    DIVISIONS: config.divisions,
    WEIGHIN: config.weighin,
    WRESTLING: config.wrestling,
    CONTACT_EMAIL: config.contactEmail,
    ACCENT_HEX: config.accentHex,
    ABOUT: config.about ?? '',
    HERO_SRC: config.hero ?? '',
    LOGO_SRC: config.logo ?? '',
    OG_IMAGE_URL: computeOgImageUrl(config),
  }
  let out = template
  for (const [key, value] of Object.entries(tokens)) {
    out = out.split(`{{${key}}}`).join(String(value))
  }
  return out
}

export async function rebuild({ root = DEFAULT_ROOT } = {}) {
  const templatePath = path.join(root, 't', '_template', 'index.html')
  if (!existsSync(templatePath)) {
    throw new Error(`Template not found: ${templatePath}`)
  }
  const template = readFileSync(templatePath, 'utf8')

  const tDir = path.join(root, 't')
  const entries = readdirSync(tDir, { withFileTypes: true })

  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    if (entry.name.startsWith('_')) continue

    const slug = entry.name
    const configPath = path.join(tDir, slug, 'config.json')
    if (!existsSync(configPath)) continue

    const raw = readFileSync(configPath, 'utf8')
    let config
    try {
      config = JSON.parse(raw)
    } catch (err) {
      throw new Error(`${configPath}: invalid JSON — ${err.message}`)
    }

    if (!KNOWN_TEMPLATE_VERSIONS.has(config.templateVersion)) {
      throw new Error(`${configPath}: unknown templateVersion ${config.templateVersion}`)
    }

    if (config.slug !== slug) {
      throw new Error(`${configPath}: slug mismatch — folder is "${slug}" but config.slug is "${config.slug}"`)
    }

    for (const key of ['hero', 'logo']) {
      const filename = config[key]
      if (!filename) continue
      const assetPath = path.join(tDir, slug, filename)
      if (!existsSync(assetPath)) {
        throw new Error(`${configPath}: ${key} references ${filename} but ${filename} not found in folder`)
      }
    }

    const html = renderTemplate(template, config)
    const outPath = path.join(tDir, slug, 'index.html')
    writeFileSync(outPath, html, 'utf8')
    console.log(`${slug}: regenerated`)
  }
}

// CLI entry
if (import.meta.url === `file://${process.argv[1]}`) {
  rebuild().catch((err) => {
    console.error(err.message)
    process.exit(1)
  })
}
