# Tournament minisite template

This is the source template used by:
- The client-side builder at `/build/`
- The `scripts/rebuild-tournaments.js` regeneration script

## Editing

Edit `index.html` here. Then run `node scripts/rebuild-tournaments.js` to regenerate every tournament folder's `index.html` from its `config.json`.

## Placeholders

Every `{{TOKEN}}` in this file is replaced at build time. The full list lives in the spec (`docs/superpowers/specs/2026-09-03-tournament-minisites-design.md`).

## Not published

This folder starts with `_` so the tournaments index skips it, and any static-site consumer knows to treat it as source rather than a served page.
