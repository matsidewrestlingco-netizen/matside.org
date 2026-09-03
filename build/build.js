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

  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const result = validate()
    if (!result) return
    // Zip generation added in a later task.
    alert('Validation passed — zip generation not yet implemented.')
  })

  // Initial state
  validate()

  // Expose for later tasks
  window.__builder = { slugify, normalizeHex, luminance, contrastAgainstBg, collectValues, validate }
})()
