(function () {
  const form = document.getElementById('builder-form')
  const btn = document.getElementById('generate-btn')
  const missingHint = document.getElementById('missing-hint')
  const contrastHint = document.getElementById('contrast-hint')

  const REQUIRED_FIELDS = [
    'slug', 'name', 'date', 'venueName', 'venueLocation',
    'divisions', 'weighin', 'wrestling',
    'formsSlug', 'accentHex', 'contactEmail',
  ]

  function slugify(s) {
    return String(s || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 60)
  }

  function normalizeHex(s) {
    if (!s) return ''
    let v = String(s).trim().toLowerCase().replace(/[^#0-9a-f]/g, '')
    if (v[0] !== '#') v = '#' + v
    if (/^#[0-9a-f]{3}$/.test(v)) {
      v = '#' + v[1] + v[1] + v[2] + v[2] + v[3] + v[3]
    }
    return /^#[0-9a-f]{6}$/.test(v) ? v : ''
  }

  function luminance(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255
    const g = parseInt(hex.slice(3, 5), 16) / 255
    const b = parseInt(hex.slice(5, 7), 16) / 255
    const f = (c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4))
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
  }

  function contrastAgainstBg(hex) {
    // Midnight background is #0b0d12 — luminance ~0.005
    const bgL = luminance('#0b0d12')
    const fgL = luminance(hex)
    return (Math.max(bgL, fgL) + 0.05) / (Math.min(bgL, fgL) + 0.05)
  }

  function collectValues() {
    const data = new FormData(form)
    const values = {}
    for (const [k, v] of data.entries()) {
      if (v instanceof File) continue
      values[k] = String(v).trim()
    }
    return values
  }

  function validate() {
    const v = collectValues()
    const missing = []

    for (const f of REQUIRED_FIELDS) {
      if (!v[f]) missing.push(f)
    }

    // Hex normalize + validate
    const hex = normalizeHex(v.accentHex)
    const hexInput = form.querySelector('[name=accentHex]')
    hexInput.setAttribute('aria-invalid', hex ? 'false' : 'true')
    if (!hex && v.accentHex) missing.push('accentHex (invalid hex)')

    if (hex) {
      const ratio = contrastAgainstBg(hex)
      if (ratio < 3) {
        contrastHint.textContent = `Contrast ${ratio.toFixed(1)}:1 — may be hard to read on dark background`
        contrastHint.classList.add('danger')
      } else {
        contrastHint.textContent = `Contrast ${ratio.toFixed(1)}:1 — looks good`
        contrastHint.classList.remove('danger')
      }
    } else {
      contrastHint.textContent = ''
      contrastHint.classList.remove('danger')
    }

    // Email
    const emailInput = form.querySelector('[name=contactEmail]')
    if (v.contactEmail && !/^.+@.+\..+$/.test(v.contactEmail)) {
      emailInput.setAttribute('aria-invalid', 'true')
      missing.push('contactEmail (invalid)')
    } else {
      emailInput.setAttribute('aria-invalid', 'false')
    }

    // Slug validation
    const slugInput = form.querySelector('[name=slug]')
    if (v.slug && !/^[a-z0-9-]+$/.test(v.slug)) {
      slugInput.setAttribute('aria-invalid', 'true')
      missing.push('slug (letters, digits, hyphens only)')
    } else {
      slugInput.setAttribute('aria-invalid', 'false')
    }

    btn.disabled = missing.length > 0
    missingHint.textContent = missing.length === 0
      ? 'Ready to generate.'
      : `Missing: ${missing.slice(0, 3).join(', ')}${missing.length > 3 ? ` (+${missing.length - 3} more)` : ''}`
    return missing.length === 0 ? { values: { ...v, accentHex: hex } } : null
  }

  // Auto-slugify: if name changes and slug is empty (or was auto-generated), update slug
  let slugTouched = false
  form.querySelector('[name=slug]').addEventListener('input', () => { slugTouched = true; validate() })
  form.querySelector('[name=name]').addEventListener('input', (e) => {
    if (!slugTouched) form.querySelector('[name=slug]').value = slugify(e.target.value)
    validate()
  })
  form.querySelector('[name=accentHex]').addEventListener('blur', (e) => {
    const n = normalizeHex(e.target.value)
    if (n) e.target.value = n
    validate()
  })

  form.addEventListener('input', validate)
  form.addEventListener('change', validate)

  const MAX_HERO_BYTES = 8 * 1024 * 1024
  const MAX_LOGO_BYTES = 2 * 1024 * 1024
  const MIN_HERO_LONG_SIDE = 800

  function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const fr = new FileReader()
      fr.onload = () => resolve(fr.result)
      fr.onerror = () => reject(new Error('Could not read file'))
      fr.readAsDataURL(file)
    })
  }

  function readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const fr = new FileReader()
      fr.onload = () => resolve(fr.result)
      fr.onerror = () => reject(new Error('Could not read file'))
      fr.readAsText(file)
    })
  }

  function loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('Could not decode image'))
      img.src = url
    })
  }

  async function processHero(file) {
    if (!file) return null
    if (file.size > MAX_HERO_BYTES) throw new Error(`Hero image too large (max 8 MB, got ${(file.size / 1024 / 1024).toFixed(1)} MB)`)
    const dataUrl = await readFileAsDataURL(file)
    const img = await loadImage(dataUrl)
    const longSide = Math.max(img.width, img.height)
    if (longSide < MIN_HERO_LONG_SIDE) throw new Error(`Hero image too small (min ${MIN_HERO_LONG_SIDE}px on long side, got ${longSide}px)`)

    const MAX_W = 1600
    const MAX_H = 900
    const ratio = Math.min(MAX_W / img.width, MAX_H / img.height, 1)
    const w = Math.round(img.width * ratio)
    const h = Math.round(img.height * ratio)

    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    canvas.getContext('2d').drawImage(img, 0, 0, w, h)

    const blob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.82))
    if (!blob) throw new Error('Could not encode hero image')
    return { filename: 'hero.jpg', blob }
  }

  function sanitizeSvg(svgText) {
    // Remove <script> tags and any on* attributes. Conservative but not exhaustive.
    let out = svgText.replace(/<script[\s\S]*?<\/script>/gi, '')
    out = out.replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, '')
    out = out.replace(/\son[a-z]+\s*=\s*'[^']*'/gi, '')
    return out
  }

  async function processLogo(file) {
    if (!file) return null
    if (file.size > MAX_LOGO_BYTES) throw new Error(`Logo too large (max 2 MB, got ${(file.size / 1024 / 1024).toFixed(1)} MB)`)

    if (file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')) {
      const text = await readFileAsText(file)
      const sanitized = sanitizeSvg(text)
      return { filename: 'logo.svg', blob: new Blob([sanitized], { type: 'image/svg+xml' }) }
    }

    // PNG/JPG path — resize to max 512x512, keep PNG for alpha
    const dataUrl = await readFileAsDataURL(file)
    const img = await loadImage(dataUrl)
    const MAX = 512
    const ratio = Math.min(MAX / img.width, MAX / img.height, 1)
    const w = Math.round(img.width * ratio)
    const h = Math.round(img.height * ratio)
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    canvas.getContext('2d').drawImage(img, 0, 0, w, h)
    const blob = await new Promise((res) => canvas.toBlob(res, 'image/png'))
    if (!blob) throw new Error('Could not encode logo')
    return { filename: 'logo.png', blob }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const result = validate()
    if (!result) return

    btn.disabled = true
    btn.textContent = 'Generating…'
    try {
      const values = result.values
      const heroInput = form.querySelector('[name=hero]').files[0] || null
      const logoInput = form.querySelector('[name=logo]').files[0] || null

      const hero = await processHero(heroInput)
      const logo = await processLogo(logoInput)

      const config = {
        slug: values.slug,
        formsSlug: values.formsSlug,
        name: values.name,
        date: values.date,
        venueName: values.venueName,
        venueLocation: values.venueLocation,
        divisions: values.divisions,
        weighin: values.weighin,
        wrestling: values.wrestling,
        contactEmail: values.contactEmail,
        accentHex: values.accentHex,
        about: values.about || '',
        hero: hero ? hero.filename : null,
        logo: logo ? logo.filename : null,
        generatedAt: new Date().toISOString(),
        templateVersion: 1,
      }

      const zip = new JSZip()
      const folder = zip.folder(values.slug)
      folder.file('config.json', JSON.stringify(config, null, 2) + '\n')
      if (hero) folder.file(hero.filename, hero.blob)
      if (logo) folder.file(logo.filename, logo.blob)

      // Also include a stub index.html so the folder can be served immediately
      // (contents will be overwritten by scripts/rebuild-tournaments.mjs on the next run).
      folder.file('index.html', `<!DOCTYPE html><meta charset="utf-8"><title>${values.name}</title><p>Run <code>node scripts/rebuild-tournaments.mjs</code> to build this page.</p>\n`)

      const blob = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${values.slug}.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      btn.textContent = 'Downloaded — Generate another?'
    } catch (err) {
      alert('Error: ' + err.message)
      btn.textContent = 'Generate & Download Zip'
    } finally {
      btn.disabled = false
    }
  })

  // Initial state
  validate()

  // Expose for later tasks
  window.__builder = { slugify, normalizeHex, luminance, contrastAgainstBg, collectValues, validate, processHero, processLogo, sanitizeSvg }
})()
